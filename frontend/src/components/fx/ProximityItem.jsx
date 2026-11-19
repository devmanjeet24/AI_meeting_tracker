import { useEffect, useRef } from "react"

const FROM = [107, 127, 117]   // muted
const TO = [24, 121, 78]       // emerald accent

// Slight magnetic shift toward the cursor + icon tint as the cursor gets near.
export default function ProximityItem({ icon: Icon, index, title, text }) {
  const ref = useRef(null)
  const iconRef = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!fine || reduced) return
    const el = ref.current, icon = iconRef.current
    let raf = 0, last = null

    const apply = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2
      const dx = last.x - cx, dy = last.y - cy
      const d = Math.hypot(dx, dy)
      const near = Math.max(0, 1 - d / 260)
      el.style.transform = `translate3d(${(dx / 260 * 7 * near).toFixed(2)}px, ${(dy / 260 * 4 * near).toFixed(2)}px, 0)`
      const c = FROM.map((f, i) => Math.round(f + (TO[i] - f) * near))
      icon.style.color = `rgb(${c})`
    }
    const onMove = (e) => { last = { x: e.clientX, y: e.clientY }; if (!raf) raf = requestAnimationFrame(apply) }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", onMove) }
  }, [])

  return (
    <li ref={ref} className="flex items-start gap-4 border-t border-[#D5E3DB] py-5 first:border-t-0 first:pt-0" style={{ transition: "transform .5s cubic-bezier(.22,1,.36,1)" }}>
      <span className="w-7 pt-0.5 font-display text-sm tabular-nums text-[#6B7F75]">{String(index).padStart(2, "0")}</span>
      <span ref={iconRef} className="mt-0.5 text-[#6B7F75]" style={{ transition: "color .3s" }}><Icon size={22} strokeWidth={1.5} /></span>
      <div>
        <p className="font-semibold text-[#0B1F17]">{title}</p>
        <p className="mt-0.5 text-sm leading-relaxed text-[#4B5F55]">{text}</p>
      </div>
    </li>
  )
}
