import { useForm } from "react-hook-form"
import { useNavigate, Link } from "react-router-dom"
import { useState } from "react"
import API from "../api/api"
import AuthLayout from "../components/AuthLayout"
import { inputCls, labelCls, btnPrimary, errorMessage } from "../lib/ui"

export default function Register(){

  const { register, handleSubmit } = useForm()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const onSubmit = async (data) => {

    setError("")

    try {

      setLoading(true)

      await API.post("/auth/register", data)

      navigate("/", { state: { registered: true } })

    } catch (err) {

      setError(errorMessage(err, "Unable to create the account. Please try again."))

    } finally {

      setLoading(false)

    }

  }

  return (

    <AuthLayout
      title="Create your account"
      subtitle="Start turning meeting notes into action items."
      footer={<>Already have an account? <Link to="/" className="font-medium text-indigo-600 hover:underline">Sign in</Link></>}
    >

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <div>
          <label htmlFor="name" className={labelCls}>Full name</label>
          <input id="name" required autoComplete="name" placeholder="Jane Doe" className={inputCls} {...register("name")} />
        </div>

        <div>
          <label htmlFor="email" className={labelCls}>Email</label>
          <input id="email" type="email" required autoComplete="email" placeholder="you@company.com" className={inputCls} {...register("email")} />
        </div>

        <div>
          <label htmlFor="password" className={labelCls}>Password</label>
          <input id="password" type="password" required minLength={6} autoComplete="new-password" placeholder="At least 6 characters" className={inputCls} {...register("password")} />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button disabled={loading} className={`${btnPrimary} w-full`}>
          {loading ? "Creating account..." : "Create account"}
        </button>

      </form>

    </AuthLayout>

  )

}
