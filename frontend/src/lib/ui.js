// Shared Tailwind class sets so every page looks consistent.
export const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"

export const labelCls = "mb-1.5 block text-sm font-medium text-slate-700"

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"

export const cardCls = "rounded-xl border border-slate-200 bg-white shadow-sm"

export const statusStyles = {
  "Pending": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "In Progress": "bg-blue-50 text-blue-700 ring-blue-600/20",
  "Done": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
}

export const priorityStyles = {
  "High": "bg-red-50 text-red-700 ring-red-600/20",
  "Medium": "bg-orange-50 text-orange-700 ring-orange-600/20",
  "Low": "bg-slate-100 text-slate-600 ring-slate-500/20",
}

export const badgeCls =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset"

export const errorMessage = (err, fallback) =>
  err?.response?.data?.error || fallback
