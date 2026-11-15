import { Users } from "lucide-react"
import { badgeCls, cardCls } from "../lib/ui"
import { formatDate, truncate } from "../utils/helpers"

export default function MeetingCard({ meeting }) {

  if (!meeting) return null

  return (

    <div className={`${cardCls} flex flex-col p-5 transition hover:shadow-md`}>

      <div className="mb-3 flex items-start justify-between gap-3">

        <h3 className="line-clamp-2 font-semibold text-slate-900">
          {meeting.title || "Untitled meeting"}
        </h3>

        {meeting.type && (
          <span className={`${badgeCls} shrink-0 bg-indigo-50 text-indigo-700 ring-indigo-600/20`}>
            {meeting.type}
          </span>
        )}

      </div>

      <p className="text-sm leading-relaxed text-slate-600">
        {truncate(meeting.summary || meeting.notes, 140) || "No summary available."}
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">

        {meeting.participants?.length > 0 && (
          <span className="flex items-center gap-1">
            <Users size={14} />
            {meeting.participants.length}
          </span>
        )}

        {meeting.created_at && <span>{formatDate(meeting.created_at)}</span>}

      </div>

    </div>

  )

}
