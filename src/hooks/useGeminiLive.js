import { useState, useRef, useCallback, useEffect } from 'react'
import { GoogleGenAI, Modality } from '@google/genai'
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

const GEMINI_LIVE_MODEL = 'gemini-2.0-flash-live-001'

function classifyError(err, agentName) {
  const msg = err?.message || String(err) || ''
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

export function useGeminiLive({ apiKey, systemPrompt, voice = 'Aoede', agentName = 'the agent' }) {
  const [status, setStatus] = useState('idle')
  const [transcript, setTranscript] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const [isMuted, setIsMuted] = useState(false)

  const sessionRef = useRef(null)
  const isMutedRef = useRef(false)
  const sessionStartRef = useRef(null)
  const { playChunk, stopAll } = useAudioPlayback()
  const handleMessageRef = useRef(null)

  // Keep muted ref in sync
  useEffect(() => { isMutedRef.current = isMuted }, [isMuted])

  // --- Transcript helpers ---

  function elapsedMs() {
    return sessionStartRef.current ? Date.now() - sessionStartRef.current : 0
  }

  function appendUserText(text) {
    setTranscript((prev) => {
      const last = prev[prev.length - 1]
      if (last?.role === 'user' && !last.complete) {
        return [...prev.slice(0, -1), { ...last, text }]
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
    if (!sessionRef.current || isMutedRef.current) return
    try {
      sessionRef.current.sendRealtimeInput({
        audio: { data: base64data, mimeType: 'audio/pcm;rate=16000' },
      })
    } catch (err) {
      console.error('[GeminiLive] sendRealtimeInput error:', err)
    }
  }, [])

  // --- Audio capture (active when connected) ---
  const isCapturing = status !== 'idle' && status !== 'connecting' && status !== 'error'
  useAudioCapture({ onChunk: sendAudioChunk, isActive: isCapturing })

  // --- Connect ---
  const connect = useCallback(async () => {
    if (!apiKey) {
      setErrorMessage("Couldn't connect — API key is missing.")
      setStatus('error')
      return
    }

    setStatus('connecting')
    setErrorMessage(null)
    setIsMuted(false)
    sessionStartRef.current = null

    try {
      const ai = new GoogleGenAI({ apiKey })

      const session = await ai.live.connect({
        model: GEMINI_LIVE_MODEL,
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
          systemInstruction: { parts: [{ text: systemPrompt }] },
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          realtimeInputConfig: {
            automaticActivityDetection: { disabled: false },
          },
        },
      })

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
