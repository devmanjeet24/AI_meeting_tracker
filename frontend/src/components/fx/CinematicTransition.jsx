import { useEffect } from "react"
import Logo from "../Logo"

// Full-screen emerald iris that expands from the click point, then hands off.
export default function CinematicTransition({ origin, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1250)
    return () => clearTimeout(t)
  }, [onDone])

  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? window.innerHeight / 2

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center"
      style={{
        background: "radial-gradient(circle at 50% 40%, #0b3d2e, #04150f 70%)",
        animation: "iris 1.05s cubic-bezier(.76,0,.24,1) forwards",
        "--ox": `${x}px`, "--oy": `${y}px`,
      }}
    >
      <style>{`
        @keyframes iris { from { clip-path: circle(0px at var(--ox) var(--oy)); } to { clip-path: circle(150vmax at var(--ox) var(--oy)); } }
        @keyframes logo-in { 0% { opacity: 0; transform: scale(.7); filter: blur(8px); } 45% { opacity: 1; transform: scale(1); filter: none; } 100% { opacity: 1; transform: scale(1.04); } }
        @keyframes bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      `}</style>
      <div className="flex flex-col items-center gap-6" style={{ animation: "logo-in 1.1s .25s cubic-bezier(.22,1,.36,1) both" }}>
        <Logo size={64} />
        <div className="h-0.5 w-40 origin-left rounded bg-emerald-300/80" style={{ animation: "bar .9s .35s ease-out both" }} />
      </div>
    </div>
  )
}
