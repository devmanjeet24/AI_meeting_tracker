import { NavLink, useNavigate } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter
} from "@/components/ui/sidebar"

import {
  LayoutDashboard,
  FilePlus2,
  ListTodo,
  History,
  LogOut,
  CalendarCheck
} from "lucide-react"

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "New Meeting", icon: FilePlus2 },
  { to: "/actions", label: "Action Items", icon: ListTodo },
  { to: "/meetings", label: "Meeting History", icon: History },
]

export default function AppSidebar() {

  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  return (

    <Sidebar style={{ backgroundColor: "#0f172a" }}>

      <SidebarContent className="bg-slate-900 px-3 py-5">

        <div className="mb-6 flex items-center gap-2 px-2 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <CalendarCheck size={20} />
          </div>
          <span className="text-base font-semibold">AI Meeting Tracker</span>
        </div>

        <nav className="flex flex-col gap-1">

          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

        </nav>

      </SidebarContent>

      <SidebarFooter className="bg-slate-900 p-3">

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <LogOut size={18} />
          Sign out
        </button>

      </SidebarFooter>

    </Sidebar>

  )

}
