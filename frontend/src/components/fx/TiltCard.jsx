import { useRef } from "react"

// Very subtle 3D tilt + a soft light reflection that moves across the card.
export default function TiltCard({ children, max = 3.5, className = "", radius = 20 }) {
  const ref = useRef(null)
  const glare = useRef(null)

  const enabled = () =>
    window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const move = (e) => {
    const el = ref.current
    if (!el || !enabled()) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.transition = "transform .1s linear"
    el.style.transform = `perspective(1100px) rotateY(${(px - 0.5) * max * 2}deg) rotateX(${-(py - 0.5) * max * 2}deg)`
    if (glare.current) {
      glare.current.style.opacity = 1
      glare.current.style.background = `radial-gradient(420px circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.85), rgba(52,211,153,0.10) 40%, transparent 70%)`
    }
  }
  const reset = () => {
    const el = ref.current
    if (!el) return
    el.style.transition = "transform .8s cubic-bezier(.22,1,.36,1)"
    el.style.transform = "perspective(1100px) rotateX(0) rotateY(0)"
    if (glare.current) glare.current.style.opacity = 0
  }

  return (
    <div ref={ref} onPointerMove={move} onPointerLeave={reset} className={`relative ${className}`} style={{ willChange: "transform" }}>
      {children}
      <div ref={glare} aria-hidden className="pointer-events-none absolute inset-0 z-20 mix-blend-soft-light"
        style={{ borderRadius: radius, opacity: 0, transition: "opacity .4s" }} />
    </div>
  )
}
