import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import AppSidebar from "../components/AppSidebar"

export default function DashboardLayout({ children }) {

  return (

    <SidebarProvider>

      <div className="flex min-h-screen w-full bg-slate-100">

        {/* Sidebar */}
        <AppSidebar />

        {/* Content Area */}
        <div className="flex flex-col flex-1">

          {/* Top Header */}
          <header className="flex items-center justify-between h-16 px-6 border-b bg-white shadow-sm">

            <div className="flex items-center gap-3">

              {/* Sidebar Toggle */}
              <SidebarTrigger className="p-2 rounded-md hover:bg-gray-100 transition"/>

              <h1 className="text-lg font-semibold text-gray-700">
                AI Meeting Tracker
              </h1>

            </div>

          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">

            {children}

          </main>

        </div>

      </div>

    </SidebarProvider>

  )

}