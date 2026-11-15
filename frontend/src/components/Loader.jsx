export default function Loader({ label = "Loading..." }) {

  return (

    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">

      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

      <p className="text-sm text-slate-500">{label}</p>

    </div>

  )

}
