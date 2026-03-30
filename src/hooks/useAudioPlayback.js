import { useCallback, useEffect, useRef } from 'react'
import { int16ToFloat32, base64ToArrayBuffer } from '../lib/audioUtils'

const PLAYBACK_SAMPLE_RATE = 24000

/**
 * Schedules and plays back base64-encoded 16-bit PCM audio chunks at 24kHz
 * with gapless sequential scheduling via AudioContext.
 */
export function useAudioPlayback() {
  const contextRef = useRef(null)
  const nextStartTimeRef = useRef(0)
  const activeSourcesRef = useRef([])

  function getContext() {
    if (!contextRef.current || contextRef.current.state === 'closed') {
      contextRef.current = new AudioContext({ sampleRate: PLAYBACK_SAMPLE_RATE })
      nextStartTimeRef.current = 0
    }
    return contextRef.current
  }

  const playChunk = useCallback(async (base64data) => {
    try {
      const ctx = getContext()

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume()
      }

      const buffer = base64ToArrayBuffer(base64data)
      const int16 = new Int16Array(buffer)
      const float32 = int16ToFloat32(int16)

      const audioBuffer = ctx.createBuffer(1, float32.length, PLAYBACK_SAMPLE_RATE)
      audioBuffer.getChannelData(0).set(float32)

      const source = ctx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(ctx.destination)

      // Schedule gaplessly: always start at nextStartTime or 50ms ahead of now,
      // whichever is later, to prevent overlap and avoid gaps.
      const startTime = Math.max(
        nextStartTimeRef.current,
        ctx.currentTime + 0.05
      )
      source.start(startTime)
      nextStartTimeRef.current = startTime + audioBuffer.duration

      activeSourcesRef.current.push(source)
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source)
      }
    } catch (err) {
      console.error('[AudioPlayback] playChunk error:', err)
    }
  }, [])

  const stopAll = useCallback(() => {
    activeSourcesRef.current.forEach((s) => {
      try { s.stop() } catch (_) {}
    })
    activeSourcesRef.current = []
    nextStartTimeRef.current = 0
    // Do NOT close the AudioContext — keeping it alive avoids the autoplay
    // re-suspension on recreation, which drops the first 1-2 chunks of every
    // new agent response and causes the "breaks mid-sentence" symptom.
  }, [])

  // Only close the context on unmount
  useEffect(() => {
    return () => {
      activeSourcesRef.current.forEach((s) => { try { s.stop() } catch (_) {} })
      if (contextRef.current && contextRef.current.state !== 'closed') {
        contextRef.current.close().catch(() => {})
      }
    }
  }, [])

  return { playChunk, stopAll }
}
