import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import BrandLogo from '../components/BrandLogo'

export default function Lobby() {
  const { selectedBrand, setSelectedBrand } = useApp()
  const navigate = useNavigate()

  if (!selectedBrand) return null

  const { brandName, agentName, agentInitial, agentRole, colors, starters } = selectedBrand

  function handleStart() {
    // Fire-and-forget — prompts mic permission early but doesn't block navigation.
    // Session.jsx handles all mic permission outcomes via useGeminiLive.
    navigator.mediaDevices?.getUserMedia({ audio: true }).catch(() => {})
    navigate('/session')
  }

  function handleBack() {
    setSelectedBrand(null)
    navigate('/')
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'linear-gradient(180deg, #050D1A 0%, #030A14 100%)' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-safe-or-4 pb-3 flex-shrink-0">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm flex-shrink-0">
            <BrandLogo brand={selectedBrand} className="w-full h-full" fontSize="0.75rem" />
          </div>
          <span className="text-cream/80 text-[13px] font-medium">{brandName}</span>
        </div>

        {/* Back */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-cream/40 text-xs hover:text-cream/70 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4">

        {/* Agent avatar */}
        <div className="relative mb-6">
          {/* Outer glow ring */}
          <div
            className="absolute -inset-3 rounded-full opacity-20 blur-xl"
            style={{ background: `radial-gradient(circle, ${colors.from}, transparent 70%)` }}
          />
          {/* Avatar */}
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden shadow-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
              boxShadow: `0 20px 48px ${colors.ring}`,
              border: `2px solid ${colors.from}55`,
            }}
          >
            {selectedBrand.avatar ? (
              <img src={selectedBrand.avatar} alt={agentName} className="w-full h-full object-cover object-center" />
            ) : (
              <span className="text-4xl font-bold font-display select-none" style={{ color: colors.avatarText }}>
                {agentInitial}
              </span>
            )}
          </div>
          {/* Online badge */}
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-status-green border-[2.5px] border-[#030A14] shadow-sm" />
        </div>

        {/* Agent name & role */}
        <h2 className="text-cream text-2xl font-semibold font-display tracking-tight">{agentName}</h2>
        <p className="text-sm mt-1.5" style={{ color: colors.label }}>
          {agentRole} · {brandName}
        </p>

        {/* Divider */}
        <div className="w-8 h-px bg-white/10 mt-6 mb-6" />

        {/* Conversation starters */}
        <div className="w-full flex flex-col gap-2">
          <p className="text-cream/30 text-[11px] font-semibold uppercase tracking-[0.1em] text-center mb-1">
            You could ask
          </p>
          {starters.map((s) => (
            <p key={s} className="text-cream/50 text-xs italic text-center leading-relaxed">{s}</p>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-10 pt-2 flex flex-col items-center gap-2.5 flex-shrink-0">
        <button
          onClick={handleStart}
          className="w-full text-[15px] font-semibold py-4 rounded-2xl active:scale-[0.98] transition-transform"
          style={{
            background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            color: colors.avatarText,
            boxShadow: `0 8px 28px ${colors.ring}`,
          }}
        >
          Talk to {agentName}
        </button>
        <p className="text-cream/30 text-xs text-center">
          Tap to start · microphone required
        </p>
      </div>
    </div>
  )
}
