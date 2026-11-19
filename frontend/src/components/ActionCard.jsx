import { useState } from "react"
import { Link } from "react-router-dom"
import { CalendarDays, User, Trash2, AlertTriangle } from "lucide-react"
import API from "../api/api"
import { useToast } from "./fx/Toast"
import { badgeCls, priorityStyles, statusStyles, btnPrimary, errorMessage } from "../lib/ui"

const STATUSES = ["Pending", "In Progress", "Done"]
const PRIORITIES = ["High", "Medium", "Low"]

export default function ActionCard({ action, refresh, index = 0, draggable = false, compact = false }) {

  const toast = useToast()
  const [owner, setOwner] = useState(action.owner || "")
  const [deadline, setDeadline] = useState(action.deadline || "")
  const [saving, setSaving] = useState(false)

  const changed = owner !== (action.owner || "") || deadline !== (action.deadline || "")

  const update = async (payload, msg = "Saved") => {

    setSaving(true)

    try {

      await API.patch(`/actions/${action._id}`, payload)
      toast(msg)
      await refresh()

    } catch (err) {

      toast(errorMessage(err, "Update failed. Please try again."), "error")

    } finally {

      setSaving(false)

    }

  }

  const remove = async () => {

    try {

      await API.delete(`/actions/${action._id}`)
      toast("Action deleted")
      await refresh()

    } catch (err) {

      toast(errorMessage(err, "Could not delete."), "error")

    }

  }

  return (

    <div
      className={`glass glass-lift rise flex flex-col p-4 ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={{ "--i": index }}
      draggable={draggable}
      onDragStart={(e) => e.dataTransfer.setData("text/plain", action._id)}
    >

      <div className="mb-2.5 flex flex-wrap items-center gap-2">

        <select
          value={action.priority || "Medium"}
          disabled={saving}
          onChange={(e) => update({ priority: e.target.value }, "Priority updated")}
          className={`${badgeCls} cursor-pointer appearance-none border-0 outline-none ${priorityStyles[action.priority] || priorityStyles.Low}`}
          aria-label="Priority"
        >
          {PRIORITIES.map((p) => <option key={p} value={p} className="bg-emerald-950">{p}</option>)}
        </select>

        {!compact && (
          <span className={`${badgeCls} ${statusStyles[action.status] || statusStyles.Pending}`}>{action.status}</span>
        )}

        {action.overdue && (
          <span className={`${badgeCls} bg-red-500/15 text-red-300 ring-red-400/30`}><AlertTriangle size={11} className="mr-1" />Overdue</span>
        )}

        <button onClick={remove} aria-label="Delete action" className="ml-auto text-emerald-100/30 transition hover:text-red-300">
          <Trash2 size={15} />
        </button>

      </div>

      <h3 className="mb-3 text-sm font-semibold leading-snug text-emerald-50">{action.task}</h3>

      {action.meeting_title && action.meeting_id && (
        <Link to={`/meetings/${action.meeting_id}`} className="mb-3 truncate text-xs text-emerald-300/70 hover:text-emerald-300">
          from {action.meeting_title}
        </Link>
      )}

      <div className="space-y-2">

        <label className="flex items-center gap-2">
          <User size={13} className="shrink-0 text-emerald-100/40" />
          <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Unassigned" className="field-input !py-1.5 !text-xs" />
        </label>

        <label className="flex items-center gap-2">
          <CalendarDays size={13} className="shrink-0 text-emerald-100/40" />
          <input value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="No deadline (e.g. 2026-12-01)" className="field-input !py-1.5 !text-xs" />
        </label>

        {changed && (
          <button onClick={() => update({ owner, deadline })} disabled={saving} className={`${btnPrimary} w-full py-1.5`}>
            Save changes
          </button>
        )}

      </div>

      {!compact && (
        <div className="mt-4 flex rounded-xl bg-black/25 p-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => s !== action.status && update({ status: s }, `Moved to ${s}`)}
              disabled={saving}
              className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                action.status === s ? "bg-emerald-400/15 text-emerald-200 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.25)]" : "text-emerald-100/45 hover:text-emerald-100"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

    </div>

  )

}
