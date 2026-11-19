import { NavLink, useNavigate } from "react-router-dom"
import { Sidebar, SidebarContent, SidebarFooter } from "@/components/ui/sidebar"
import { LayoutDashboard, FilePlus2, ListTodo, History, LogOut, UserCircle } from "lucide-react"
import Logo from "./Logo"

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/upload", label: "New Meeting", icon: FilePlus2 },
  { to: "/meetings", label: "Meeting History", icon: History },
  { to: "/actions", label: "Action Items", icon: ListTodo },
  { to: "/profile", label: "Profile", icon: UserCircle },
]

export default function AppSidebar() {

  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem("token")
    navigate("/")
    window.location.reload()
  }

  return (

    <Sidebar style={{ "--sidebar": "#06150f" }}>

      <SidebarContent className="bg-[#06150f]/90 px-3 py-6 backdrop-blur-xl">

        <div className="mb-8 px-2"><Logo /></div>

        <nav className="flex flex-col gap-1">

          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-300 ${
                  isActive
                    ? "bg-emerald-400/10 text-emerald-200 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2)]"
                    : "text-emerald-100/55 hover:bg-white/5 hover:text-emerald-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-emerald-300 shadow-[0_0_12px_#34d399]" />}
                  <Icon size={18} className="transition group-hover:scale-110" />
                  {label}
                </>
              )}
            </NavLink>
          ))}

        </nav>

      </SidebarContent>

      <SidebarFooter className="bg-[#06150f]/90 p-3">

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-100/55 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={18} />
          Sign out
        </button>

      </SidebarFooter>

    </Sidebar>

  )

}
