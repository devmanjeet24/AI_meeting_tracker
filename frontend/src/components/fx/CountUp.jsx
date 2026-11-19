import { useEffect, useRef, useState } from "react"

export default function CountUp({ value = 0, duration = 1100, suffix = "" }) {
  const [n, setN] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(value); return }
    const start = performance.now()
    const a = from.current
    let raf
    const step = (t) => {
      const p = Math.min((t - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 4)
      setN(Math.round(a + (value - a) * eased))
      if (p < 1) raf = requestAnimationFrame(step)
      else from.current = value
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])

  return <>{n}{suffix}</>
}
