import { useForm } from "react-hook-form"
import { useNavigate, useLocation } from "react-router-dom"
import { useState, useRef } from "react"
import { ArrowRight, Eye, EyeOff } from "lucide-react"
import API from "../api/api"
import AuthLayout from "../components/AuthLayout"
import Field from "../components/fx/Field"
import Magnetic from "../components/fx/Magnetic"
import CinematicTransition from "../components/fx/CinematicTransition"
import { errorMessage } from "../lib/ui"

// ONE page, two modes. A single form instance means the email/password
// you typed survive switching between Sign in and Create account.
export default function Auth() {

  const navigate = useNavigate()
  const location = useLocation()
  const btnRef = useRef(null)

  const [mode, setMode] = useState(location.pathname === "/register" ? "register" : "login")
  const { register, handleSubmit, getValues } = useForm({ defaultValues: { name: "", email: "", password: "" } })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [show, setShow] = useState(false)
  const [origin, setOrigin] = useState(null)

  const isLogin = mode === "login"

  const switchMode = (next) => {
    if (next === mode || loading) return
    setMode(next); setError(""); setNotice("")
    navigate(next === "login" ? "/" : "/register", { replace: true })
  }

  const onSubmit = async (data) => {

    setError(""); setNotice("")
    setLoading(true)

    try {

      if (isLogin) {

        const res = await API.post("/auth/login", { email: data.email, password: data.password })
        localStorage.setItem("token", res.data.token)

        const r = btnRef.current?.getBoundingClientRect()
        setOrigin(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : {})
        return // keep the button busy during the transition

      }

      await API.post("/auth/register", { name: data.name, email: data.email, password: data.password })
      setMode("login")
      navigate("/", { replace: true })
      setNotice("Account created. Sign in to continue.")

    } catch (err) {

      const base = import.meta.env.VITE_API_BASE_URL
      setError(errorMessage(err,
        err.code === "ECONNABORTED"
          ? "The server took too long to respond. Please try again."
          : `Cannot reach the server at ${base}. Make sure the backend is running on that address.`))

    }

    setLoading(false)

  }

  return (

    <>

      <AuthLayout>

        <div className="a-tabs mb-7" role="tablist" aria-label="Authentication mode">
          <button type="button" role="tab" aria-selected={isLogin} onClick={() => switchMode("login")}>Sign in</button>
          <button type="button" role="tab" aria-selected={!isLogin} onClick={() => switchMode("register")}>Create account</button>
        </div>

        <h2 className="font-display text-3xl">{isLogin ? "Welcome back" : "Create your account"}</h2>
        <p className="mb-7 mt-1.5 text-[15px] text-[#4B5F55]">
          {isLogin ? "Sign in to pick up where you left off." : "Start turning meeting notes into action items."}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate={false} className="space-y-5">

          {notice && <p role="status" className="a-ok">{notice}</p>}

          {!isLogin && (
            <div>
              <label htmlFor="name" className="a-label">Full name</label>
              <Field id="name" required autoComplete="name" placeholder="Jane Doe" {...register("name")} />
            </div>
          )}

          <div>
            <label htmlFor="email" className="a-label">Email</label>
            <Field id="email" type="email" required autoComplete="email" placeholder="you@company.com" {...register("email")} />
          </div>

          <div>
            <label htmlFor="password" className="a-label">Password</label>
            <div className="relative">
              <Field
                id="password" type={show ? "text" : "password"} required minLength={isLogin ? undefined : 6}
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder={isLogin ? "Enter your password" : "At least 6 characters"}
                {...register("password")}
              />
              <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded p-1 text-[#4B5F55] hover:text-[#0B1F17]">
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {error && <p role="alert" className="a-err">{error}</p>}

          <Magnetic strength={0.2}>
            <button ref={btnRef} type="submit" disabled={loading} className="a-btn" data-cursor-label={isLogin ? "Sign in" : "Create"}>
              {loading
                ? <><span className="a-spin" />{isLogin ? "Signing in..." : "Creating account..."}</>
                : <>{isLogin ? "Sign in" : "Create account"} <ArrowRight size={17} /></>}
            </button>
          </Magnetic>

        </form>

        <p className="mt-7 text-center text-sm text-[#4B5F55]">
          {isLogin ? "New here? " : "Already have an account? "}
          <button type="button" className="a-link" onClick={() => switchMode(isLogin ? "register" : "login")}>
            {isLogin ? "Create an account" : "Sign in"}
          </button>
        </p>

      </AuthLayout>

      {origin && <CinematicTransition origin={origin} onDone={() => navigate("/dashboard")} />}

    </>

  )

}
