import { useEffect, useRef } from "react"

// Cursor-reactive headline. Layout never changes on hover: only transform
// (translateY/scale), color and a very soft text-shadow are animated.
//   - words: inline-block + nowrap, letters: inline-block, real spaces between words
//   - no overflow/clip/mask/background-clip anywhere, so nothing can be cut off
//   - letter centers are cached on mount/resize/font-load, never on mousemove
//   - one rAF loop with a real spring (stiffness 180, damping 18); sleeps when settled
const RADIUS = 110
const STIFFNESS = 180
const DAMPING = 18
const MAX_LIFT = 4      // px
const MAX_SCALE = 0.06

// Colors keep AA/large-text contrast (>= 3:1) on the light auth background.
const INK = [11, 31, 23]        // #0B1F17 headline text
const INK_HOT = [24, 121, 78]   // #18794E when the cursor is near
const ACC_A = [23, 105, 74]     // #17694A accent gradient start
const ACC_B = [42, 146, 98]     // #2A9262 accent gradient end

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`

function build(text, accent, counter) {
  const words = text.split(" ")
  const out = []
  words.forEach((word, wi) => {
    out.push(
      <span key={`${accent ? "a" : "l"}${wi}`} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
        {[...word].map((ch, i) => {
          const idx = counter.n++
          return (
            <span
              key={i}
              data-l={accent ? "a" : "l"}
              data-i={idx}
              aria-hidden="true"
              style={{ display: "inline-block", willChange: "transform", color: accent ? rgb(mix(ACC_A, ACC_B, 0.35)) : rgb(INK) }}
            >{ch}</span>
          )
        })}
      </span>
    )
    if (wi < words.length - 1) out.push(" ")   // real space, outside the animated spans
  })
  return out
}

export default function ReactiveHeadline({ lead, accent, className = "" }) {
  const root = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!fine || reduced) return

    const el = root.current
    const letters = [...el.querySelectorAll("[data-l]")].map((node) => ({
      node, accent: node.dataset.l === "a", x: 0, y: 0, p: 0, v: 0,
    }))
    const accentLetters = letters.filter((l) => l.accent)
    const last = accentLetters.length - 1

    let cx = -9999, cy = -9999            // cursor (viewport)
    let gx = null                         // smoothed cursor X for the gradient
    let raf = 0, running = false, prev = 0

    // Cache centers (page coordinates) once per mount / resize / font load.
    const measure = () => {
      for (const l of letters) {
        const t = l.node.style.transform
        l.node.style.transform = "none"
        const r = l.node.getBoundingClientRect()
        l.x = r.left + r.width / 2 + window.scrollX
        l.y = r.top + r.height / 2 + window.scrollY
        l.node.style.transform = t
      }
    }

    const frame = (now) => {
      const dt = Math.min((now - prev) / 1000 || 1 / 60, 1 / 30)
      prev = now
      const inside = cx > -9000
      const px = cx + window.scrollX, py = cy + window.scrollY
      let active = inside

      if (gx === null) gx = px
      gx += ((inside ? px : gx) - gx) * Math.min(1, dt * 8)   // eased follow

      for (const l of letters) {
        const d = inside ? Math.hypot(px - l.x, py - l.y) : Infinity
        const target = d < RADIUS ? 0.5 * (1 + Math.cos(Math.PI * (d / RADIUS))) : 0   // cosine falloff

        // spring toward target
        l.v += (STIFFNESS * (target - l.p) - DAMPING * l.v) * dt
        l.p += l.v * dt
        if (Math.abs(l.p - target) > 0.001 || Math.abs(l.v) > 0.01) active = true

        const p = Math.min(Math.max(l.p, 0), 1.15)
        const s = l.node.style
        s.transform = `translate3d(0, ${(-MAX_LIFT * p).toFixed(2)}px, 0) scale(${(1 + MAX_SCALE * p).toFixed(4)})`

        if (!l.accent) {
          s.color = rgb(mix(INK, INK_HOT, Math.min(p, 1)))
        }
        s.textShadow = p > 0.05 ? `0 0 12px rgba(63,191,127,${(0.25 * Math.min(p, 1)).toFixed(3)})` : "none"
      }

      // accent gradient: lightest where the cursor's X is, easing to dark away from it
      accentLetters.forEach((l, i) => {
        const near = Math.max(0, 1 - Math.abs(gx - l.x) / 260)
        const base = last > 0 ? (i / last) * 0.35 : 0
        l.node.style.color = rgb(mix(ACC_A, ACC_B, Math.min(1, base + near * 0.65 * (inside ? 1 : 0))))
      })

      if (active) raf = requestAnimationFrame(frame)
      else { running = false; prev = 0 }
    }

    const start = () => { if (!running) { running = true; prev = performance.now(); raf = requestAnimationFrame(frame) } }
    const onMove = (e) => { cx = e.clientX; cy = e.clientY; start() }
    const onLeave = () => { cx = cy = -9999; start() }   // let letters spring back

    measure()
    document.fonts?.ready.then(measure)
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener("resize", measure)
    window.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("pointerleave", onLeave)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener("resize", measure)
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  const counter = { n: 0 }

  return (
    <h1
      ref={root}
      aria-label={`${lead} ${accent}`}
      className={`pb-[0.15em] ${className}`}
      style={{ textWrap: "balance", maxWidth: "15em" }}
    >
      {build(lead, false, counter)}{" "}{build(accent, true, counter)}
    </h1>
  )
}
