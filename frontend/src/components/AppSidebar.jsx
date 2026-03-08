import { Link, useNavigate } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter
} from "@/components/ui/sidebar"

import {
  LayoutDashboard,
  Upload,
  ListTodo,
  History,
  LogOut
} from "lucide-react"

export default function AppSidebar() {

  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  return (

    <Sidebar className="border-r  text-slate-200" style={{"backgroundColor": "#0f172a"}}>

      <SidebarContent className="bg-slate-900">

        {/* App Title */}

        <div className="px-4 py-6 text-xl font-bold text-white">
          AI Meeting Tracker
        </div>

        <SidebarGroup>

          <SidebarGroupLabel className="text-slate-400">
            Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent>

            <SidebarMenu>

              <SidebarMenuItem>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition"
                >
                  <LayoutDashboard size={18}/>
                  Dashboard
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link
                  to="/upload"
                  className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition"
                >
                  <Upload size={18}/>
                  Upload Meeting
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link
                  to="/actions"
                  className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition"
                >
                  <ListTodo size={18}/>
                  Action Items
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link
                  to="/meetings"
                  className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition"
                >
                  <History size={18}/>
                  Meeting History
                </Link>
              </SidebarMenuItem>

            </SidebarMenu>

          </SidebarGroupContent>

        </SidebarGroup>

      </SidebarContent>

      {/* Logout bottom */}

      <SidebarFooter className="p-4 bg-slate-950">

        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition"
        >
          <LogOut size={16}/>
          Logout
        </button>

      </SidebarFooter>

    </Sidebar>

  )

}