import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { BRAND_LIST } from '../lib/brands'
import BrandLogo from '../components/BrandLogo'

function BrandCard({ brand, onSelect }) {
  return (
    <button
      onClick={() => onSelect(brand)}
      className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-navy-800 active:scale-[0.98] transition-all text-left group"
      style={{ border: `1px solid ${brand.colors.border}` }}
    >
      {/* Logo container */}
      <div className="w-[52px] h-[52px] rounded-xl bg-white flex items-center justify-center p-2 flex-shrink-0 shadow-sm">
        <BrandLogo brand={brand} className="w-full h-full" fontSize="1.35rem" />
      </div>

      {/* Brand info */}
      <div className="flex-1 min-w-0">
        <p className="text-cream text-[15px] font-semibold font-display leading-tight tracking-tight">{brand.brandName}</p>
        <p className="text-cream/50 text-xs mt-0.5 leading-snug truncate">{brand.tagline}</p>
        <div className="flex items-center gap-2 mt-2">
          <div
            className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${brand.colors.from}, ${brand.colors.to})` }}
          >
            {brand.avatar
              ? <img src={brand.avatar} alt={brand.agentName} className="w-full h-full object-cover object-center" />
              : <span className="text-[9px] font-bold font-display text-white">{brand.agentInitial}</span>
            }
          </div>
          <span className="text-xs font-medium" style={{ color: brand.colors.label }}>
            {brand.agentName}
          </span>
          <span className="text-cream/25 text-xs">·</span>
          <span className="text-cream/40 text-xs">{brand.agentRole}</span>
        </div>
      </div>

      {/* Chevron */}
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        className="text-cream/25 flex-shrink-0 group-hover:text-cream/50 transition-colors"
      >
        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}

export default function BrandPicker() {
  const { setSelectedBrand } = useApp()
  const navigate = useNavigate()

  function handleSelect(brand) {
    setSelectedBrand(brand)
    navigate('/lobby')
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'linear-gradient(180deg, #050D1A 0%, #030A14 100%)' }}>
      {/* Header */}
      <div className="flex flex-col items-center pt-safe-or-14 pb-10 px-6 flex-shrink-0">
        {/* Auralis mark */}
        <div className="relative mb-5">
          <img
            src="/Auralis Logo.png"
            alt="Auralis"
            className="w-14 h-14 object-contain drop-shadow-xl"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-status-green border-2 border-[#030A14]" />
        </div>
        <h1 className="text-cream text-[22px] font-semibold font-display tracking-tight">Auralis</h1>
        <p className="text-cream/45 text-sm mt-1.5 text-center leading-snug">
          Voice AI agents for every brand
        </p>
      </div>

      {/* Section label */}
      <div className="px-5 pb-3 flex-shrink-0">
        <p className="text-cream/30 text-[11px] font-semibold uppercase tracking-[0.1em]">
          Choose a brand
        </p>
      </div>

      {/* Brand list */}
      <div className="flex-1 overflow-y-auto px-5">
        <div className="flex flex-col gap-2.5 pb-10">
          {BRAND_LIST.map((brand) => (
            <BrandCard key={brand.id} brand={brand} onSelect={handleSelect} />
          ))}
        </div>
      </div>
    </div>
  )
}
