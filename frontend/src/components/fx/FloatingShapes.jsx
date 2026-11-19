import { useEffect, useRef } from "react"

const SHAPES = [
  { cls: "h-72 w-72 rounded-[2.5rem] -left-24 top-[8%]", depth: 28, r: "12deg", d: "0s" },
  { cls: "h-48 w-48 rounded-full -right-10 top-[22%]", depth: -40, r: "0deg", d: "-2s" },
  { cls: "h-64 w-64 rounded-[3rem] -right-16 bottom-[4%]", depth: 55, r: "-18deg", d: "-4s" },
  { cls: "h-32 w-32 rounded-2xl left-[3%] bottom-[6%]", depth: -62, r: "24deg", d: "-1s" },
  { cls: "h-20 w-20 rounded-full right-[6%] top-[5%]", depth: 80, r: "0deg", d: "-3s" },
]

// Glass shapes with cursor parallax. `opacity` lets the dashboard reuse them quietly.
export default function FloatingShapes({ opacity = 1, className = "", tone = "dark", pick }) {
  const root = useRef(null)

  useEffect(() => {
    const el = root.current
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!el || reduced) return
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0

    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2
      ty = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const tick = () => {
      cx += (tx - cx) * 0.07
      cy += (ty - cy) * 0.07
      el.style.setProperty("--px", cx.toFixed(4))
      el.style.setProperty("--py", cy.toFixed(4))
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", onMove) }
  }, [])

  return (
    <div ref={root} aria-hidden className={`pointer-events-none ${tone === "light" ? "absolute" : "fixed"} inset-0 overflow-hidden ${className}`} style={{ opacity }}>
      {SHAPES.filter((_, i) => !pick || pick.includes(i)).map((s, i) => (
        <div
          key={i}
          className={`absolute ${s.cls}`}
          style={{ transform: `translate3d(calc(var(--px, 0) * ${s.depth}px), calc(var(--py, 0) * ${s.depth}px), 0)` }}
        >
          <div
            className="h-full w-full border border-white/10 bg-gradient-to-br from-emerald-300/20 via-emerald-500/5 to-transparent backdrop-blur-[2px]"
            style={{
              borderRadius: "inherit", "--r": s.r, animation: `float-y ${9 + i * 1.5}s ease-in-out infinite`, animationDelay: s.d,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 30px 60px -30px rgba(16,185,129,0.5)",
            }}
          />
        </div>
      ))}
      {tone !== "light" && <>
        <div className="absolute -left-40 top-1/3 h-[28rem] w-[28rem] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-emerald-700/20 blur-3xl" />
      </>}
    </div>
  )
}
