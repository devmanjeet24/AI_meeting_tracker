import { useState } from "react"
import { LogOut, Save, KeyRound } from "lucide-react"
import API from "../api/api"
import DashboardLayout from "../Layout/DashboardLayout"
import Field from "../components/fx/Field"
import { useToast } from "../components/fx/Toast"
import useUser from "../hooks/useUser"
import { btnPrimary, btnSecondary, labelCls, errorBox, errorMessage } from "../lib/ui"

export default function Profile() {

  const toast = useToast()
  const [user, setUser] = useUser()
  const [draft, setDraft] = useState(null)
  const [pw, setPw] = useState({ current_password: "", new_password: "" })
  const [pwError, setPwError] = useState("")

  const name = draft ?? user?.name ?? ""
  const setName = setDraft

  const saveName = async (e) => {
    e.preventDefault()
    try {
      await API.patch("/auth/me", { name })
      setUser({ ...user, name: name.trim() })
      toast("Profile updated")
    } catch (err) { toast(errorMessage(err, "Could not update profile."), "error") }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setPwError("")
    try {
      await API.post("/auth/password", pw)
      setPw({ current_password: "", new_password: "" })
      toast("Password changed")
    } catch (err) { setPwError(errorMessage(err, "Could not change password.")) }
  }

  const logout = () => { localStorage.removeItem("token"); window.location.href = "/" }

  return (

    <DashboardLayout title="Profile" subtitle="Manage your account details and security.">

      <div className="grid max-w-4xl gap-5 md:grid-cols-2">

        <form onSubmit={saveName} className="glass rise space-y-5 p-6" style={{ "--i": 0 }}>
          <h2 className="font-display text-xl text-emerald-50">Account</h2>
          <div>
            <label className={labelCls}>Email</label>
            <input value={user?.email || ""} disabled className="field-input opacity-60" />
          </div>
          <div>
            <label htmlFor="pname" className={labelCls}>Full name</label>
            <Field id="pname" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <button className={btnPrimary}><Save size={15} /> Save</button>
        </form>

        <form onSubmit={changePassword} className="glass rise space-y-5 p-6" style={{ "--i": 1 }}>
          <h2 className="font-display text-xl text-emerald-50">Change password</h2>
          <div>
            <label htmlFor="cur" className={labelCls}>Current password</label>
            <Field id="cur" type="password" autoComplete="current-password" required value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} />
          </div>
          <div>
            <label htmlFor="new" className={labelCls}>New password</label>
            <Field id="new" type="password" autoComplete="new-password" minLength={6} required value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} />
          </div>
          {pwError && <p role="alert" className={errorBox}>{pwError}</p>}
          <button className={btnPrimary}><KeyRound size={15} /> Update password</button>
        </form>

        <div className="glass rise flex items-center justify-between p-6 md:col-span-2" style={{ "--i": 2 }}>
          <div>
            <h2 className="font-display text-xl text-emerald-50">Sign out</h2>
            <p className="text-sm text-emerald-100/50">End your session on this device.</p>
          </div>
          <button onClick={logout} className={btnSecondary}><LogOut size={15} /> Sign out</button>
        </div>

      </div>

    </DashboardLayout>

  )

}
