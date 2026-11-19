import { Sparkles, ListChecks, MessagesSquare } from "lucide-react"
import FloatingShapes from "./fx/FloatingShapes"
import TiltCard from "./fx/TiltCard"
import ReactiveHeadline from "./fx/ReactiveHeadline"
import ProximityItem from "./fx/ProximityItem"
import DotGrid from "./fx/DotGrid"
import Logo from "./Logo"

const points = [
  { icon: Sparkles, title: "Instant summaries", text: "Decisions, risks and topics pulled from raw notes in seconds." },
  { icon: ListChecks, title: "Actions that get done", text: "Owners, deadlines and a drag-and-drop Kanban board." },
  { icon: MessagesSquare, title: "Ask your meetings", text: "Question any meeting and get answers from your own notes." },
]

export default function AuthLayout({ children }) {

  return (

    <div className="auth-light relative min-h-screen overflow-x-hidden">

      {/* decorative background layers: z-0, pointer-events none, away from text */}
      <DotGrid />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <FloatingShapes opacity={0.13} tone="light" pick={[1, 2, 3]} />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-2 lg:gap-20 lg:px-12">

        <section className="flex flex-col gap-8 lg:gap-12">

          <Logo size={38} tone="light" />

          <div>
            <ReactiveHeadline
              lead="Turn conversations into"
              accent="clear next steps."
              className="font-display text-4xl leading-[1.1] text-[#0B1F17] sm:text-5xl xl:text-6xl"
            />
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[#4B5F55]">
              Paste your meeting notes and get a summary, decisions and action items you can track to done.
            </p>
          </div>

          <ul className="hidden max-w-lg sm:block">
            {points.map((p, i) => <ProximityItem key={p.title} index={i + 1} {...p} />)}
          </ul>

        </section>

        <section className="flex justify-center lg:justify-end">
          <TiltCard className="w-full max-w-[440px]" max={3.5}>
            <div className="auth-card p-7 sm:p-10">{children}</div>
          </TiltCard>
        </section>

      </div>

    </div>

  )

}
