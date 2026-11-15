import { CalendarCheck, Sparkles, ListChecks } from "lucide-react"

const points = [
  { icon: Sparkles, text: "AI-generated summaries and decisions" },
  { icon: ListChecks, text: "Action items with owners and deadlines" },
  { icon: CalendarCheck, text: "A searchable history of every meeting" },
]

export default function AuthLayout({ title, subtitle, children, footer }) {

  return (

    <div className="grid min-h-screen lg:grid-cols-2">

      {/* Brand panel */}
      <div className="hidden flex-col justify-between bg-slate-900 p-12 text-white lg:flex">

        <div className="flex items-center gap-2 text-lg font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <CalendarCheck size={20} />
          </div>
          AI Meeting Tracker
        </div>

        <div>
          <h2 className="max-w-md text-3xl font-semibold leading-tight">
            Turn meeting notes into clear decisions and next steps.
          </h2>

          <ul className="mt-8 space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-slate-300">
                <Icon size={18} className="text-indigo-400" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} AI Meeting Tracker
        </p>

      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-slate-50 p-6">

        <div className="w-full max-w-sm">

          <div className="mb-8 flex items-center gap-2 text-lg font-semibold text-slate-900 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <CalendarCheck size={20} />
            </div>
            AI Meeting Tracker
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-1 mb-6 text-sm text-slate-500">{subtitle}</p>

          {children}

          <p className="mt-6 text-center text-sm text-slate-600">{footer}</p>

        </div>

      </div>

    </div>

  )

}
