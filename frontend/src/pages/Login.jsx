import { useForm } from "react-hook-form"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useState } from "react"
import API from "../api/api"
import AuthLayout from "../components/AuthLayout"
import { inputCls, labelCls, btnPrimary, errorMessage } from "../lib/ui"

export default function Login(){

  const { register, handleSubmit } = useForm()
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const onSubmit = async (data) => {

    setError("")

    try {

      setLoading(true)

      const res = await API.post("/auth/login", data)

      localStorage.setItem("token", res.data.token)

      navigate("/dashboard")

    } catch (err) {

      setError(errorMessage(err, "Unable to sign in. Please check your connection and try again."))

    } finally {

      setLoading(false)

    }

  }

  return (

    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue."
      footer={<>Don&apos;t have an account? <Link to="/register" className="font-medium text-indigo-600 hover:underline">Create one</Link></>}
    >

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {location.state?.registered && (
          <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Account created. Please sign in.</p>
        )}

        <div>
          <label htmlFor="email" className={labelCls}>Email</label>
          <input id="email" type="email" required autoComplete="email" placeholder="you@company.com" className={inputCls} {...register("email")} />
        </div>

        <div>
          <label htmlFor="password" className={labelCls}>Password</label>
          <input id="password" type="password" required autoComplete="current-password" placeholder="Enter your password" className={inputCls} {...register("password")} />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button disabled={loading} className={`${btnPrimary} w-full`}>
          {loading ? "Signing in..." : "Sign in"}
        </button>

      </form>

    </AuthLayout>

  )

}
