import { Link } from "react-router-dom"
import { btnPrimary, cardCls } from "../lib/ui"

export default function EmptyState({ icon: Icon, title, text, actionLabel, actionTo }) {

  return (

    <div className={`${cardCls} flex flex-col items-center px-6 py-14 text-center`}>

      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <Icon size={22} />
        </div>
      )}

      <h3 className="text-base font-semibold text-slate-900">{title}</h3>

      {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}

      {actionLabel && (
        <Link to={actionTo} className={`${btnPrimary} mt-5`}>
          {actionLabel}
        </Link>
      )}

    </div>

  )

}
