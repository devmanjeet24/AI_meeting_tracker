// Shared class sets so every page uses ONE design system (emerald noir + glass).
export const inputCls = "field-input"; // plain inputs; use <Field> for the animated border

export const labelCls = "mb-1.5 block text-xs font-medium uppercase tracking-wider text-emerald-100/60"

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-emerald-300 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-950 shadow-[0_8px_24px_-8px_rgba(52,211,153,0.7)] transition duration-300 hover:shadow-[0_12px_32px_-6px_rgba(52,211,153,0.85)] hover:brightness-110 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 disabled:cursor-not-allowed disabled:opacity-60"

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-emerald-50/90 transition duration-300 hover:border-emerald-300/30 hover:bg-white/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40 disabled:opacity-60"

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 active:scale-[0.98] disabled:opacity-60"

export const cardCls = "glass"

export const statusStyles = {
  "Pending": "bg-amber-400/10 text-amber-300 ring-amber-300/25",
  "In Progress": "bg-sky-400/10 text-sky-300 ring-sky-300/25",
  "Done": "bg-emerald-400/10 text-emerald-300 ring-emerald-300/25",
}

export const priorityStyles = {
  "High": "bg-rose-400/10 text-rose-300 ring-rose-300/25",
  "Medium": "bg-orange-400/10 text-orange-300 ring-orange-300/25",
  "Low": "bg-white/5 text-slate-300 ring-white/15",
}

export const badgeCls =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset"

export const errorBox = "rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"

export const errorMessage = (err, fallback) =>
  err?.response?.data?.error || fallback
