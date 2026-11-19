// Custom monogram: an "M" whose right stroke ends in a node — people meeting at a point.
export function LogoMark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id="lm-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2FA775" /><stop offset="1" stopColor="#0F5F3D" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill="url(#lm-g)" />
      <path d="M8.5 22.5V10.5L16 18.5l7.5-8" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="23.5" cy="22" r="2.3" fill="#A7F3D0" />
    </svg>
  )
}

export default function Logo({ size = 36, text = true, tone = "dark" }) {
  const ink = tone === "light" ? "text-[#0B1F17]" : "text-emerald-50"
  const accent = tone === "light" ? "text-[#18794E]" : "text-emerald-300"
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={size} />
      {text && <span className={`font-display text-lg ${ink}`}>Meeting<span className={accent}>Tracker</span></span>}
    </div>
  )
}
