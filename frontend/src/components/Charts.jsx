// Tiny dependency-free SVG charts in the emerald palette.

export function BarChart({ data, height = 140 }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const w = 100 / data.length

  return (
    <div>
      <svg viewBox={`0 0 100 ${height / 2}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="bar" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#6ee7b7" /><stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const h = (d.value / max) * (height / 2 - 6)
          return (
            <rect key={i} x={i * w + w * 0.18} y={height / 2 - h} width={w * 0.64} height={Math.max(h, 0.8)} rx="1.2"
              fill={d.value ? "url(#bar)" : "rgba(255,255,255,0.08)"}
              style={{ transformOrigin: `0 ${height / 2}px`, animation: `grow .9s ${i * 70}ms cubic-bezier(.22,1,.36,1) both` }}>
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
          )
        })}
      </svg>
      <div className="mt-1 flex">
        {data.map((d, i) => <span key={i} className="flex-1 text-center text-[10px] text-emerald-100/40">{d.label}</span>)}
      </div>
      <style>{`@keyframes grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }`}</style>
    </div>
  )
}

export function Donut({ segments, size = 140, center }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  const r = 52, c = 2 * Math.PI * r
  let acc = 0

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 140 140" width={size} height={size} className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" />
        {total > 0 && segments.map((s, i) => {
          const len = (s.value / total) * c
          const el = (
            <circle key={i} cx="70" cy="70" r={r} fill="none" stroke={s.color} strokeWidth="14" strokeLinecap="butt"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc}
              style={{ "--len": c, "--off": -acc, animation: `draw 1s ${i * 120}ms cubic-bezier(.22,1,.36,1) both` }} />
          )
          acc += len
          return el
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{center}</div>
    </div>
  )
}
