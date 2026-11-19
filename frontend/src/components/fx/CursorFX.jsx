import { useEffect, useRef } from "react"

// Global cursor effects (fine pointers, no reduced-motion only):
//  - emerald spotlight with spring lag, exposed as --mx/--my on <html>
//  - dot + trailing ring; ring grows on links/buttons, becomes a text beam on
//    inputs, and shows a label over elements with data-cursor-label
//  - per-card spotlight on .glass (CSS vars)
// One rAF loop, no React state.
export default function CursorFX() {
  const dot = useRef(null)
  const ring = useRef(null)
  const label = useRef(null)
  const glow = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!fine || reduced) return

    const root = document.documentElement
    root.classList.add("fx-cursor")

    let x = window.innerWidth / 2, y = window.innerHeight / 2
    let rx = x, ry = y, gx = x, gy = y, raf = 0, visible = false, lastLabel = ""

    const onMove = (e) => {
      x = e.clientX; y = e.clientY
      if (!visible) { visible = true; dot.current.style.opacity = ring.current.style.opacity = 1 }

      const t = e.target
      const card = t.closest?.(".glass")
      if (card) {
        const r = card.getBoundingClientRect()
        card.style.setProperty("--sx", `${e.clientX - r.left}px`)
        card.style.setProperty("--sy", `${e.clientY - r.top}px`)
      }

      const labelled = t.closest?.("[data-cursor-label]")
      const text = t.closest?.("input:not([type=checkbox]):not([type=radio]), textarea")
      const link = t.closest?.("a, button, [role='button'], [role='tab'], label, select")

      const cls = ring.current.classList
      cls.toggle("has-label", !!labelled && !labelled.disabled)
      cls.toggle("is-text", !!text && !labelled)
      cls.toggle("is-active", !!link && !text && !labelled)
      dot.current.style.opacity = text ? 0 : 1

      const l = labelled?.getAttribute("data-cursor-label") || ""
      if (l !== lastLabel) { label.current.textContent = l; lastLabel = l }
    }

    const tick = () => {
      rx += (x - rx) * 0.17; ry += (y - ry) * 0.17
      gx += (x - gx) * 0.08; gy += (y - gy) * 0.08     // spotlight lags more (spring feel)
      dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
      ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      root.style.setProperty("--mx", `${gx.toFixed(1)}px`)
      root.style.setProperty("--my", `${gy.toFixed(1)}px`)
      raf = requestAnimationFrame(tick)
    }

    const onLeave = () => { visible = false; dot.current.style.opacity = ring.current.style.opacity = 0 }

    window.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("pointerleave", onLeave)
    raf = requestAnimationFrame(tick)

    return () => {
      root.classList.remove("fx-cursor")
      cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  return (
    <>
      <div ref={glow} className="spotlight-glow" aria-hidden />
      <div ref={ring} className="cursor-ring" style={{ opacity: 0 }} aria-hidden>
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" style={{ opacity: 0 }} aria-hidden />
    </>
  )
}
