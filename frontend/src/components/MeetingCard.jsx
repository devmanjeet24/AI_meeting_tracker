export default function MeetingCard({ meeting }) {

  if (!meeting) return null;

  return (

    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col">

      {/* Title */}

      <h3 className="font-semibold text-lg text-slate-800 mb-2 line-clamp-2">
        {meeting.title}
      </h3>


      {/* Meeting Type */}

      <div className="mb-3">

        <span className="text-xs font-medium px-2 py-1 rounded-md bg-indigo-100 text-indigo-700">

          {meeting.type}

        </span>

      </div>


      {/* Notes Preview */}

      <p className="text-sm text-gray-600 leading-relaxed">

        {meeting.notes?.slice(0,120) || "No notes available"}...

      </p>

    </div>

  )

}