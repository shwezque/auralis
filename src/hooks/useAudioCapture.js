import { useEffect, useRef } from 'react'
import { float32ToInt16, arrayBufferToBase64 } from '../lib/audioUtils'

const TARGET_SAMPLE_RATE = 16000   // Gemini Live requires 16kHz PCM
const SCRIPT_PROCESSOR_BUFFER = 2048

/**
 * Downsample a Float32Array from fromRate to toRate using linear interpolation.
 * More reliable than relying on the browser to honour a requested AudioContext rate.
 */
function downsampleBuffer(buffer, fromRate, toRate) {
  if (fromRate === toRate) return buffer
  const ratio     = fromRate / toRate
  const newLength = Math.floor(buffer.length / ratio)
  const result    = new Float32Array(newLength)
  for (let i = 0; i < newLength; i++) {
    const pos   = i * ratio
    const index = Math.floor(pos)
    const frac  = pos - index
    const a     = buffer[index]     ?? 0
    const b     = buffer[index + 1] ?? 0
    result[i]   = a + frac * (b - a)   // linear interpolation
  }
  return result
}

/**
 * Captures microphone audio and streams base64-encoded 16-bit PCM chunks
 * at 16kHz to the provided onChunk callback while isActive is true.
 *
 * Uses the browser's native AudioContext sample rate and downsamples
 * explicitly to 16kHz — avoids relying on browsers honouring a custom rate
 * (some silently ignore it, causing garbled/unspeakable audio to the model).
 */
function normalizeCaptureError(err) {
  const name = err?.name || ''

  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return new Error('Microphone permission was denied.')
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return new Error('No microphone was found on this device.')
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return new Error('The microphone is being used by another app.')
  }
  if (name === 'SecurityError') {
    return new Error('Microphone access requires HTTPS or localhost.')
  }

  return err instanceof Error ? err : new Error('Failed to start microphone capture.')
}

export function useAudioCapture({ onChunk, isActive, onError }) {
  const streamRef = useRef(null)
  const sourceRef = useRef(null)
  const processorRef = useRef(null)
  const contextRef = useRef(null)
  const onChunkRef = useRef(onChunk)
  const onErrorRef = useRef(onError)
  onChunkRef.current = onChunk
  onErrorRef.current = onError

  useEffect(() => {
    if (!isActive) {
      cleanup()
      return
    }

    async function startCapture() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        })
        streamRef.current = stream

        // Use native sample rate — far more reliable across browsers/OS than
        // requesting a specific rate (some browsers ignore sampleRate option).
        const context = new AudioContext()
        contextRef.current = context

        // Resume in case browser started it suspended (HTTPS autoplay policy).
        if (context.state === 'suspended') {
          await context.resume()
        }

        const nativeRate = context.sampleRate   // typically 44100 or 48000
        const source     = context.createMediaStreamSource(stream)
        sourceRef.current = source
        const processor  = context.createScriptProcessor(SCRIPT_PROCESSOR_BUFFER, 1, 1)
        processorRef.current = processor

        processor.onaudioprocess = (e) => {
          if (!onChunkRef.current) return
          const native     = e.inputBuffer.getChannelData(0)
          const resampled  = downsampleBuffer(native, nativeRate, TARGET_SAMPLE_RATE)
          const int16      = float32ToInt16(resampled)
          const base64     = arrayBufferToBase64(int16.buffer)
          onChunkRef.current(base64)
        }

        source.connect(processor)
        // Must connect to destination to keep ScriptProcessorNode active
        processor.connect(context.destination)
      } catch (err) {
        const normalized = normalizeCaptureError(err)
        console.error('[AudioCapture] Failed to start:', normalized)
        onErrorRef.current?.(normalized)
      }
    }

    startCapture()

    return () => cleanup()
  }, [isActive])

  function cleanup() {
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (contextRef.current) {
      contextRef.current.close().catch(() => {})
      contextRef.current = null
    }
  }
}
