// Faint dot grid that lights up near the cursor (uses --mx/--my from CursorFX). Decorative only.
export default function DotGrid() {
  const dots = (a) => `radial-gradient(circle, rgba(24,121,78,${a}) 1.1px, transparent 1.6px)`
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0" style={{ backgroundImage: dots(0.13), backgroundSize: "28px 28px" }} />
      <div className="absolute inset-0" style={{
        backgroundImage: dots(0.75), backgroundSize: "28px 28px",
        WebkitMaskImage: "radial-gradient(200px circle at var(--mx, -500px) var(--my, -500px), #000 0%, transparent 100%)",
        maskImage: "radial-gradient(200px circle at var(--mx, -500px) var(--my, -500px), #000 0%, transparent 100%)",
      }} />
    </div>
  )
}
