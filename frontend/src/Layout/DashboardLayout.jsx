import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Search } from "lucide-react"
import AppSidebar from "../components/AppSidebar"
import FloatingShapes from "../components/fx/FloatingShapes"
import CommandPalette from "../components/CommandPalette"
import useUser from "../hooks/useUser"

export default function DashboardLayout({ title, subtitle, actions, children }) {

  const [user] = useUser()
  const initial = (user?.name || user?.email || "?").trim()[0]?.toUpperCase()

  return (

    <SidebarProvider>

      {/* same shapes as the auth page, just quieter */}
      <FloatingShapes opacity={0.22} />

      <div className="relative z-10 flex min-h-screen w-full">

        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col">

          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/[0.06] bg-[#06150f]/60 px-4 backdrop-blur-xl md:px-8">

            <SidebarTrigger className="rounded-lg p-2 text-emerald-100/70 hover:bg-white/5" />

            <button
              onClick={() => window.dispatchEvent(new Event("open-palette"))}
              className="ml-1 hidden flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left text-sm text-emerald-100/40 transition hover:border-emerald-300/25 sm:flex sm:max-w-sm"
            >
              <Search size={15} /> Search or jump to...
              <kbd className="ml-auto rounded border border-white/10 px-1.5 text-[10px]">⌘K</kbd>
            </button>

            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-sm text-emerald-100/60 sm:block">{user?.name}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-emerald-600 text-sm font-semibold text-emerald-950">
                {initial}
              </div>
            </div>

          </header>

          <main className="page-in mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">

            {title && (
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                <div>
                  <h1 className="font-display text-3xl text-emerald-50 md:text-4xl">{title}</h1>
                  {subtitle && <p className="mt-1.5 text-sm text-emerald-100/55">{subtitle}</p>}
                </div>

                {actions}

              </div>
            )}

            {children}

          </main>

        </div>

      </div>

      <CommandPalette />

    </SidebarProvider>

  )

}
