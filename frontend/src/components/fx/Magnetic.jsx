import { useRef } from "react"

// Wrapper whose child is gently pulled toward the cursor.
export default function Magnetic({ children, strength = 0.35, className = "" }) {
  const ref = useRef(null)

  const move = (e) => {
    const el = ref.current
    if (!el || !window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const r = el.getBoundingClientRect()
    const dx = (e.clientX - (r.left + r.width / 2)) * strength
    const dy = (e.clientY - (r.top + r.height / 2)) * strength
    el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`
  }
  const reset = () => {
    if (ref.current) ref.current.style.transform = "translate3d(0,0,0)"
  }

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={reset}
      className={className}
      style={{ transition: "transform .5s cubic-bezier(.22,1,.36,1)", willChange: "transform" }}
    >
      {children}
    </div>
  )
}
