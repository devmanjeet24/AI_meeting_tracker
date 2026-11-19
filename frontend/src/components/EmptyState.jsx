import { Link } from "react-router-dom"
import { btnPrimary } from "../lib/ui"

export default function EmptyState({ icon: Icon, title, text, actionLabel, actionTo }) {

  return (

    <div className="glass flex flex-col items-center px-6 py-14 text-center">

      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300 shadow-[0_0_30px_-8px_rgba(52,211,153,0.6)]">
          <Icon size={24} />
        </div>
      )}

      <h3 className="font-display text-xl text-emerald-50">{title}</h3>

      {text && <p className="mt-1.5 max-w-sm text-sm text-emerald-100/55">{text}</p>}

      {actionLabel && (
        <Link to={actionTo} className={`${btnPrimary} mt-6`}>
          {actionLabel}
        </Link>
      )}

    </div>

  )

}
