import { useState } from "react"
import { CalendarDays, User } from "lucide-react"
import API from "../api/api"
import { badgeCls, cardCls, priorityStyles, statusStyles, btnPrimary, errorMessage } from "../lib/ui"

const STATUSES = ["Pending", "In Progress", "Done"]

export default function ActionCard({ action, refresh }) {

  const [owner, setOwner] = useState(action.owner || "")
  const [deadline, setDeadline] = useState(action.deadline || "")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const changed =
    owner !== (action.owner || "") || deadline !== (action.deadline || "")

  const update = async (payload) => {

    setError("")
    setSaving(true)

    try {

      await API.patch(`/actions/${action._id}`, payload)

      await refresh()

    } catch (err) {

      setError(errorMessage(err, "Update failed. Please try again."))

    } finally {

      setSaving(false)

    }

  }

  return (

    <div className={`${cardCls} flex flex-col p-5`}>

      <div className="mb-3 flex flex-wrap gap-2">

        <span className={`${badgeCls} ${priorityStyles[action.priority] || priorityStyles.Low}`}>
          {action.priority || "Low"} priority
        </span>

        <span className={`${badgeCls} ${statusStyles[action.status] || statusStyles.Pending}`}>
          {action.status}
        </span>

      </div>

      <h3 className="mb-4 font-semibold text-slate-900">{action.task}</h3>

      <div className="space-y-3">

        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <User size={13} /> Owner
          </span>
          <input
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Unassigned"
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>

        <label className="block">
          <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <CalendarDays size={13} /> Deadline
          </span>
          <input
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="No deadline"
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </label>

        {changed && (
          <button
            onClick={() => update({ owner, deadline })}
            disabled={saving}
            className={`${btnPrimary} w-full py-1.5`}
          >
            Save changes
          </button>
        )}

      </div>

      <div className="mt-5 inline-flex rounded-lg bg-slate-100 p-1">

        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => s !== action.status && update({ status: s })}
            disabled={saving}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
              action.status === s
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {s}
          </button>
        ))}

      </div>

      {error && <p role="alert" className="mt-3 text-xs text-red-600">{error}</p>}

    </div>

  )

}
