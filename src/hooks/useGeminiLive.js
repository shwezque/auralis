import { useState, useRef, useCallback, useEffect } from 'react'
import {
  ActivityHandling,
  EndSensitivity,
  GoogleGenAI,
  Modality,
  StartSensitivity,
  TurnCoverage,
} from '@google/genai'
import { useAudioPlayback } from './useAudioPlayback'
import { useAudioCapture } from './useAudioCapture'

/**
 * Status values:
 *   idle          — not connected
 *   connecting    — establishing session
 *   listening     — connected, waiting for user speech
 *   user-speaking — VAD detected user speech
 *   agent-speaking — model streaming audio
 *   error         — connection or permission error
 */

// Ordered from best voice quality to broadest compatibility.
const GEMINI_LIVE_MODELS = [
  'gemini-2.5-flash-native-audio-preview-12-2025',
  'gemini-2.5-flash-preview-native-audio-dialog',
  'gemini-live-2.5-flash-preview',
]
const LIVE_TOKEN_ENDPOINT = '/api/live-token'

function classifyError(err, agentName) {
  const msg = err?.message || String(err) || ''
  if (msg.includes('live token')) {
    return "Couldn't start the voice session because the server token request failed."
  }
  if (msg.includes('API key') || msg.includes('INVALID_ARGUMENT') || msg.includes('403') || msg.includes('401')) {
    return "Couldn't connect — your API key may be invalid."
  }
  if (msg.includes('network') || msg.includes('WebSocket') || msg.includes('1006') || msg.includes('connection')) {
    return 'Connection lost. Check your internet and try again.'
  }
  if (msg.includes('microphone') || msg.includes('NotAllowed') || msg.includes('Permission')) {
    return `Microphone access is required to talk to ${agentName}.\nPlease allow mic access in your browser settings.`
  }
  return 'Something went wrong. Tap to try again.'
}

async function getLiveCredential(fallbackApiKey) {
  try {
    const response = await fetch(LIVE_TOKEN_ENDPOINT, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`live token request failed (${response.status})`)
    }

    const payload = await response.json()
    if (!payload?.token) {
      throw new Error('live token response was missing token')
    }

    return payload.token
  } catch (err) {
    if (fallbackApiKey) {
      console.warn('[GeminiLive] Falling back to client API key:', err)
      return fallbackApiKey
    }
    throw new Error('live token request failed')
  }
}

export function useGeminiLive({
  apiKey,
  systemPrompt,
  voice = 'Aoede',
  agentName = 'the agent',
  canSendAudio = true,
}) {
  const [status, setStatus] = useState('idle')
  const [transcript, setTranscript] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [isMuted, setIsMuted] = useState(false)

  const sessionRef = useRef(null)
  const isMutedRef = useRef(false)
  const statusRef = useRef('idle')
  const canSendAudioRef = useRef(canSendAudio)
  const sessionStartRef = useRef(null)
  const { playChunk, stopAll } = useAudioPlayback()
  const handleMessageRef = useRef(null)

  // Keep muted ref in sync
  useEffect(() => { isMutedRef.current = isMuted }, [isMuted])
  // Keep status and canSendAudio refs in sync for use in stable callbacks
  useEffect(() => { statusRef.current = status }, [status])
  useEffect(() => { canSendAudioRef.current = canSendAudio }, [canSendAudio])

  // --- Transcript helpers ---

  function elapsedMs() {
    return sessionStartRef.current ? Date.now() - sessionStartRef.current : 0
  }

  function appendUserText(text) {
    setTranscript((prev) => {
      const last = prev[prev.length - 1]
      if (last?.role === 'user' && !last.complete) {
        // Gemini sends inputTranscription as incremental deltas — append, don't replace.
        const prev_text = last.text || ''
        const joined = prev_text && !prev_text.endsWith(' ') && !text.startsWith(' ')
          ? prev_text + ' ' + text
          : prev_text + text
        return [...prev.slice(0, -1), { ...last, text: joined }]
      }
      return [...prev, { id: `u-${Date.now()}`, role: 'user', text, ts: elapsedMs(), complete: false }]
    })
  }

  function appendAgentText(text) {
    setTranscript((prev) => {
      const last = prev[prev.length - 1]
      if (last?.role === 'agent' && !last.complete) {
        return [...prev.slice(0, -1), { ...last, text: last.text + text }]
      }
      return [...prev, { id: `a-${Date.now()}`, role: 'agent', text, ts: elapsedMs(), complete: false }]
    })
  }

  function completeLastTurn() {
    setTranscript((prev) =>
      prev.map((msg, i) => (i === prev.length - 1 ? { ...msg, complete: true } : msg))
    )
  }

  // --- Message handler ---

  function handleMessage(message) {
    const content = message.serverContent
    if (!content) return

    // Audio from model turn
    if (content.modelTurn?.parts) {
      for (const part of content.modelTurn.parts) {
        if (part.inlineData?.data) {
          playChunk(part.inlineData.data)
          setStatus('agent-speaking')
        }
      }
    }

    // User speech transcription
    if (content.inputTranscription?.text) {
      // Cut queued playback as soon as the server starts recognizing new user
      // speech so the UI does not keep voicing an outdated topic.
      stopAll()
      setStatus('user-speaking')
      appendUserText(content.inputTranscription.text)
    }

    // Agent output transcription
    if (content.outputTranscription?.text) {
      appendAgentText(content.outputTranscription.text)
    }

    // User barged in — model interrupted
    if (content.interrupted) {
      stopAll()
      setStatus('listening')
    }

    // Model finished its turn
    if (content.turnComplete) {
      completeLastTurn()
      setStatus('listening')
    }
  }

  handleMessageRef.current = handleMessage

  const stableOnMessage = useCallback((msg) => {
    handleMessageRef.current(msg)
  }, [])

  // --- Send audio (respects mute) ---
  const sendAudioChunk = useCallback((base64data) => {
    if (!sessionRef.current || isMutedRef.current || !canSendAudio) return
    try {
      sessionRef.current.sendRealtimeInput({
        audio: { data: base64data, mimeType: 'audio/pcm;rate=16000' },
      })
    } catch (err) {
      console.error('[GeminiLive] sendRealtimeInput error:', err)
    }
  }, [canSendAudio])

  const handleCaptureError = useCallback((err) => {
    stopAll()
    if (sessionRef.current) {
      try { sessionRef.current.close() } catch (_) {}
      sessionRef.current = null
    }
    setErrorMessage(classifyError(err, agentName))
    setStatus('error')
  }, [agentName, stopAll])

  // --- Local VAD: instant interruption without waiting for server round-trip ---
  const handleLocalVoiceActivity = useCallback((isVoiceActive) => {
    // Only act when voice mode is on and user starts speaking while agent is playing
    if (!canSendAudioRef.current) return
    if (isVoiceActive && statusRef.current === 'agent-speaking') {
      stopAll()
      setStatus('user-speaking')
    }
  }, [stopAll])

  // --- Audio capture (active when connected) ---
  const isCapturing = status !== 'idle' && status !== 'connecting' && status !== 'error'
  useAudioCapture({
    onChunk: sendAudioChunk,
    isActive: isCapturing,
    onError: handleCaptureError,
    onVoiceActivity: handleLocalVoiceActivity,
  })

  // --- Connect ---
  const connect = useCallback(async () => {
    setStatus('connecting')
    setErrorMessage(null)
    setIsMuted(false)
    sessionStartRef.current = null

    try {
      const liveCredential = await getLiveCredential(apiKey)
      const ai = new GoogleGenAI({
        apiKey: liveCredential,
        httpOptions: { apiVersion: 'v1alpha' },
      })

      let session = null
      let lastError = null

      for (const model of GEMINI_LIVE_MODELS) {
        try {
          session = await ai.live.connect({
            model,
            callbacks: {
              onopen: () => {
                sessionStartRef.current = Date.now()
                setStatus('listening')
              },
              onmessage: stableOnMessage,
              onerror: (e) => {
                console.error('[GeminiLive] error:', e)
                setErrorMessage(classifyError(e, agentName))
                setStatus('error')
                sessionRef.current = null
              },
              onclose: () => {
                if (status !== 'idle') setStatus('idle')
                sessionRef.current = null
              },
            },
            config: {
              responseModalities: [Modality.AUDIO],
              enableAffectiveDialog: true,
              systemInstruction: { parts: [{ text: systemPrompt }] },
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
              },
              inputAudioTranscription: {},
              outputAudioTranscription: {},
              realtimeInputConfig: {
                activityHandling: ActivityHandling.START_OF_ACTIVITY_INTERRUPTS,
                turnCoverage: TurnCoverage.TURN_INCLUDES_ONLY_ACTIVITY,
                automaticActivityDetection: {
                  disabled: false,
                  startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_LOW,
                  endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_HIGH,
                  prefixPaddingMs: 80,
                  silenceDurationMs: 50,
                },
              },
            },
          })
          break
        } catch (err) {
          lastError = err
          console.warn(`[GeminiLive] failed to connect with model ${model}:`, err)
        }
      }

      if (!session) {
        throw lastError || new Error('No supported Gemini Live model was available.')
      }

      sessionRef.current = session
    } catch (err) {
      console.error('[GeminiLive] connect error:', err)
      setErrorMessage(classifyError(err, agentName))
      setStatus('error')
      sessionRef.current = null
    }
  }, [apiKey, systemPrompt, voice, agentName, stableOnMessage])

  // --- Disconnect ---
  const disconnect = useCallback(() => {
    stopAll()
    if (sessionRef.current) {
      try { sessionRef.current.close() } catch (_) {}
      sessionRef.current = null
    }
    setStatus('idle')
    setIsMuted(false)
  }, [stopAll])

  // --- Mute toggle ---
  const toggleMute = useCallback(() => {
    setIsMuted((m) => !m)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll()
      if (sessionRef.current) {
        try { sessionRef.current.close() } catch (_) {}
      }
    }
  }, [stopAll])

  return { status, transcript, errorMessage, isMuted, connect, disconnect, toggleMute }
}
