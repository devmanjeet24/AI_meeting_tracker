import { Link } from "react-router-dom"
import { Users, Pin } from "lucide-react"
import { badgeCls } from "../lib/ui"
import { formatDate, truncate } from "../utils/helpers"

export const sentimentTone = {
  Positive: "bg-emerald-400/10 text-emerald-300 ring-emerald-300/25",
  Neutral: "bg-white/5 text-slate-300 ring-white/15",
  Negative: "bg-rose-400/10 text-rose-300 ring-rose-300/25",
  Mixed: "bg-amber-400/10 text-amber-300 ring-amber-300/25",
}

export default function MeetingCard({ meeting, index = 0 }) {

  if (!meeting) return null

  return (

    <Link
      to={`/meetings/${meeting._id}`}
      className="glass glass-lift rise flex flex-col p-5"
      style={{ "--i": index }}
    >

      <div className="mb-3 flex items-start justify-between gap-3">

        <h3 className="line-clamp-2 font-semibold text-emerald-50">
          {meeting.pinned && <Pin size={13} className="mr-1.5 inline -translate-y-px text-emerald-300" />}
          {meeting.title || "Untitled meeting"}
        </h3>

        {meeting.type && (
          <span className={`${badgeCls} shrink-0 bg-emerald-400/10 text-emerald-300 ring-emerald-300/25`}>
            {meeting.type}
          </span>
        )}

      </div>

      <p className="text-sm leading-relaxed text-emerald-100/60">
        {truncate(meeting.summary || meeting.notes, 140) || "No summary available."}
      </p>

      {meeting.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {meeting.tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-emerald-100/55">#{t}</span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center gap-4 pt-4 text-xs text-emerald-100/45">

        {meeting.participants?.length > 0 && (
          <span className="flex items-center gap-1"><Users size={14} />{meeting.participants.length}</span>
        )}

        {meeting.created_at && <span>{formatDate(meeting.created_at)}</span>}

        {meeting.sentiment && (
          <span className={`${badgeCls} ml-auto ${sentimentTone[meeting.sentiment] || sentimentTone.Neutral}`}>{meeting.sentiment}</span>
        )}

      </div>

    </Link>

  )

}
