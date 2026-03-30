import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useGeminiLive } from '../hooks/useGeminiLive'
import BrandLogo from '../components/BrandLogo'
import VoiceWaveform from '../components/VoiceWaveform'

// ─── Avatar ───────────────────────────────────────────────────────────────────

function AgentAvatar({ status, isMuted, brand }) {
  const isAgentSpeaking = status === 'agent-speaking'
  const isUserSpeaking  = status === 'user-speaking'
  const isListening     = status === 'listening'
  const isConnecting    = status === 'connecting'
  const isError         = status === 'error'
  const { colors, agentInitial } = brand

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      {/* Outer glow */}
      {!isError && !isConnecting && (
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-2xl"
          style={{ background: `radial-gradient(circle, ${colors.from}, transparent 70%)` }}
        />
      )}

      {/* Agent speaking: 3 staggered expanding rings */}
      {isAgentSpeaking && (
        <>
          <div className="absolute inset-0 rounded-full border animate-ring-1"
            style={{ borderColor: `${colors.from}99` }} />
          <div className="absolute inset-0 rounded-full border animate-ring-2"
            style={{ borderColor: `${colors.from}66` }} />
          <div className="absolute inset-0 rounded-full border animate-ring-3"
            style={{ borderColor: `${colors.from}33` }} />
        </>
      )}

      {/* Listening: single slow breathing ring */}
      {isListening && (
        <div
          className="absolute inset-0 rounded-full border animate-listen-ring"
          style={{ borderColor: `${colors.from}66` }}
        />
      )}

      {/* User speaking: fast pulse ring */}
      {isUserSpeaking && (
        <div
          className="absolute inset-0 rounded-full border-2 animate-speak-ring"
          style={{ borderColor: '#3B82F6' }}
        />
      )}

      {/* Avatar circle */}
      <div
        className={`
          w-28 h-28 rounded-full overflow-hidden shadow-2xl transition-all duration-500 flex items-center justify-center flex-shrink-0
          ${!isError && !isConnecting ? 'animate-orb-breathe' : ''}
          ${isMuted ? 'opacity-50' : ''}
        `}
        style={
          isError
            ? { background: 'rgba(127,0,0,0.3)', border: '2px solid rgba(239,68,68,0.4)' }
            : {
                background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                boxShadow: `0 16px 48px ${colors.ring}`,
                border: `2px solid ${colors.from}55`,
              }
        }
      >
        {isConnecting ? (
          <svg className="animate-spin-slow w-9 h-9" viewBox="0 0 24 24" fill="none"
            style={{ color: colors.avatarText }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round"/>
          </svg>
        ) : isError ? (
          <span className="text-4xl font-bold font-display select-none text-red-400">!</span>
        ) : brand.avatar ? (
          <img src={brand.avatar} alt={agentInitial} className="w-full h-full object-cover object-center" />
        ) : (
          <span className="text-4xl font-bold font-display select-none" style={{ color: colors.avatarText }}>
            {agentInitial}
          </span>
        )}
      </div>

      {/* Online badge — shown when active */}
      {(isListening || isAgentSpeaking || isUserSpeaking) && (
        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-status-green border-[2.5px]"
          style={{ borderColor: '#030A14' }} />
      )}
    </div>
  )
}

// ─── Transcript bubble ────────────────────────────────────────────────────────

function TranscriptBubble({ msg, brand }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex animate-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div
          className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center mr-2 mt-1 flex-shrink-0 shadow-sm"
          style={{ background: `linear-gradient(135deg, ${brand.colors.from}, ${brand.colors.to})` }}
        >
          {brand.avatar
            ? <img src={brand.avatar} alt={brand.agentInitial} className="w-full h-full object-cover object-center" />
            : <span className="text-xs font-bold font-display" style={{ color: brand.colors.avatarText }}>{brand.agentInitial}</span>
          }
        </div>
      )}
      <div className={`
        max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
        ${isUser
          ? 'text-cream rounded-tr-sm'
          : 'text-cream/90 rounded-tl-sm border'}
      `}
        style={isUser
          ? { background: `${brand.colors.from}26`, border: `1px solid ${brand.colors.from}33` }
          : { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }
        }
      >
        {msg.text || (
          <span className="inline-flex gap-1 items-center h-4">
            <span className="w-1.5 h-1.5 rounded-full bg-cream/40 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cream/40 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-cream/40 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
        )}
      </div>
    </div>
  )
}

// ─── End confirmation dialog ──────────────────────────────────────────────────

function EndConfirm({ onConfirm, onCancel }) {
  return (
    <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-20 animate-fade-in px-8"
      style={{ background: 'rgba(7,6,15,0.85)' }}>
      <div className="rounded-2xl p-6 w-full max-w-xs shadow-2xl border"
        style={{ background: '#141224', borderColor: 'rgba(255,255,255,0.08)' }}>
        <p className="text-cream text-base font-semibold text-center mb-1">End this conversation?</p>
        <p className="text-cream/40 text-xs text-center mb-5">The transcript will be saved.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-cream/70 text-sm font-medium active:opacity-70 transition-opacity border"
            style={{ borderColor: 'rgba(255,255,255,0.10)' }}
          >
            Keep talking
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-red-400 text-sm font-medium active:opacity-70 transition-opacity border"
            style={{ background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.25)' }}
          >
            Yes, end
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Session page ─────────────────────────────────────────────────────────────

export default function Session() {
  const { apiKey, selectedBrand, setSessionTranscript, setSessionEndedWithError } = useApp()
  const navigate = useNavigate()
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const transcriptBottomRef = useRef(null)
  const userScrolledRef = useRef(false)
  const scrollTimerRef = useRef(null)

  const { status, transcript, errorMessage, isMuted, connect, disconnect, toggleMute } =
    useGeminiLive({
      apiKey,
      systemPrompt: selectedBrand.systemPrompt,
      voice: selectedBrand.voice,
      agentName: selectedBrand.agentName,
    })

  // Block browser back-swipe while session is active.
  // Uses popstate (no data router required) instead of useBlocker.
  useEffect(() => {
    const isActive = status !== 'idle' && status !== 'error'
    if (!isActive) return

    // Push a history entry so back-swipe triggers popstate instead of leaving
    window.history.pushState({ session: true }, '')

    function handlePopstate() {
      // Re-push so a second swipe-back also triggers the dialog
      window.history.pushState({ session: true }, '')
      setShowEndConfirm(true)
    }

    window.addEventListener('popstate', handlePopstate)
    return () => window.removeEventListener('popstate', handlePopstate)
  }, [status])

  // Auto-connect on mount
  useEffect(() => { connect() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll transcript (pauses 3s after user scrolls up)
  useEffect(() => {
    if (!userScrolledRef.current) {
      transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [transcript])

  function handleScroll(e) {
    const el = e.currentTarget
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60
    if (!atBottom) {
      userScrolledRef.current = true
      clearTimeout(scrollTimerRef.current)
      scrollTimerRef.current = setTimeout(() => { userScrolledRef.current = false }, 3000)
    } else {
      userScrolledRef.current = false
    }
  }

  function handleEndConfirm() {
    disconnect()
    setSessionTranscript(transcript)
    setSessionEndedWithError(status === 'error')
    navigate('/summary')
  }

  function handleEndCancel() {
    setShowEndConfirm(false)
  }

  const isActive = status !== 'idle' && status !== 'error'

  const STATE_LABELS = {
    connecting:      'Connecting…',
    listening:       'Listening',
    'user-speaking': 'Hearing you…',
    'agent-speaking': `${selectedBrand.agentName} is speaking`,
    error:           '',
    idle:            '',
  }

  const stateLabel = status === 'error'
    ? (errorMessage?.split('\n')[0] || 'Something went wrong')
    : (STATE_LABELS[status] || '')

  const STATE_LABEL_COLOR = {
    connecting:      'text-cream/50',
    listening:       'text-cream/60',
    'user-speaking': 'text-aurora-blue',
    error:           'text-status-red',
  }

  return (
    <div
      className="relative flex flex-col h-screen overflow-hidden"
      style={{ background: '#0E0C1A' }}
    >
      {/* Atmospheric top glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${selectedBrand.colors.from}18 0%, transparent 55%)`,
        }}
      />

      {/* End confirmation overlay */}
      {showEndConfirm && (
        <EndConfirm onConfirm={handleEndConfirm} onCancel={handleEndCancel} />
      )}

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 pt-safe-or-4 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm flex-shrink-0">
            <BrandLogo brand={selectedBrand} className="w-full h-full" fontSize="0.65rem" />
          </div>
          <span className="text-cream/80 text-[13px] font-medium">{selectedBrand.brandName}</span>
        </div>
        <button
          onClick={() => setShowEndConfirm(true)}
          className="text-cream/50 text-xs font-medium py-1.5 px-3 rounded-lg transition-colors hover:text-cream/80 border"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
          End
        </button>
      </div>

      {/* Agent visual zone */}
      <div className="relative flex flex-col items-center justify-center pt-6 pb-2 flex-shrink-0">
        <AgentAvatar status={status} isMuted={isMuted} brand={selectedBrand} />
        <p
          className={`text-xs mt-4 font-medium tracking-wide transition-all duration-300 min-h-[1rem] ${STATUS_LABEL_COLOR(status, selectedBrand)}`}
          style={status === 'agent-speaking' ? { color: selectedBrand.colors.label } : undefined}
        >
          {isMuted && isActive ? 'Muted' : stateLabel}
        </p>
      </div>

      {/* Waveform */}
      <div className="relative flex-shrink-0 px-6">
        <VoiceWaveform status={status} brandColor={selectedBrand.colors.from} />
      </div>

      {/* Transcript zone */}
      <div
        className="relative flex-1 overflow-y-auto px-4 py-2 min-h-0"
        onScroll={handleScroll}
      >
        {transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2">
            {status === 'connecting' && (
              <p className="text-cream/40 text-sm text-center">Starting your session…</p>
            )}
            {status === 'listening' && (
              <p className="text-cream/40 text-sm text-center">Say something to begin.</p>
            )}
            {status === 'error' && (
              <div className="w-full max-w-xs rounded-2xl border p-5 text-center"
                style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.20)' }}>
                <p className="text-red-400 text-sm font-medium mb-1">Connection failed</p>
                <p className="text-red-400/70 text-xs leading-relaxed whitespace-pre-line">
                  {errorMessage || 'Something went wrong.'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
            {transcript.map((msg) => (
              <TranscriptBubble key={msg.id} msg={msg} brand={selectedBrand} />
            ))}
            <div ref={transcriptBottomRef} />
          </div>
        )}
      </div>

      {/* Controls dock */}
      <div
        className="relative flex items-center justify-between px-6 py-4 pb-safe-or-6 flex-shrink-0 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
      >
        {/* Mute */}
        <button
          onClick={toggleMute}
          disabled={!isActive}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center transition-all border
            disabled:opacity-25 disabled:cursor-not-allowed active:scale-95
            ${isMuted
              ? 'border-red-500/40'
              : 'border-white/10 hover:border-white/20'
            }
          `}
          style={isMuted
            ? { background: 'rgba(239,68,68,0.15)' }
            : { background: 'rgba(255,255,255,0.05)' }
          }
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-red-400">
              <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-cream/50">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>

        {/* End / Retry */}
        {status === 'error' ? (
          <div className="flex gap-3">
            <button
              onClick={() => connect()}
              className="px-5 py-3 rounded-xl text-sm font-medium active:scale-95 transition-all border"
              style={{
                background: `${selectedBrand.colors.from}1A`,
                borderColor: `${selectedBrand.colors.from}40`,
                color: selectedBrand.colors.label,
              }}
            >
              Try Again
            </button>
            <button
              onClick={handleEndConfirm}
              className="px-5 py-3 rounded-xl text-cream/60 text-sm font-medium active:scale-95 border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              End
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowEndConfirm(true)}
            className="px-6 py-3 rounded-xl text-cream/70 text-sm font-medium active:scale-95 transition-all border"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            End Conversation
          </button>
        )}

        {/* Balance spacer */}
        <div className="w-12" />
      </div>
    </div>
  )
}

// Helper outside component to avoid recreation on every render
function STATUS_LABEL_COLOR(status, brand) {
  if (status === 'agent-speaking') return ''   // handled via inline style
  if (status === 'user-speaking')  return 'text-aurora-blue'
  if (status === 'error')          return 'text-status-red'
  if (status === 'listening')      return 'text-cream/60'
  if (status === 'connecting')     return 'text-cream/50'
  return 'text-cream/30'
}
