import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "../components/AppSidebar"

export default function DashboardLayout({ title, subtitle, actions, children }) {

  return (

    <SidebarProvider>

      <div className="flex min-h-screen w-full bg-slate-50">

        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col">

          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
            <SidebarTrigger className="rounded-md p-2 text-slate-600 hover:bg-slate-100" />
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8">

            {title && (
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
                  {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
                </div>

                {actions}

              </div>
            )}

            {children}

          </main>

        </div>

      </div>

    </SidebarProvider>

  )

}
