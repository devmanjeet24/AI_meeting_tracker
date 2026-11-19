import { createContext, useCallback, useContext, useState } from "react"
import { CheckCircle2, AlertCircle, Info } from "lucide-react"

const ToastCtx = createContext(() => {})
export const useToast = () => useContext(ToastCtx)

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info }
const TONES = { success: "text-emerald-300", error: "text-red-300", info: "text-sky-300" }

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])

  const toast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2)
    setItems((l) => [...l, { id, message, type }])
    setTimeout(() => setItems((l) => l.filter((t) => t.id !== id)), 3200)
  }, [])

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[200] flex flex-col gap-2">
        {items.map((t) => {
          const Icon = ICONS[t.type] || Info
          return (
            <div key={t.id} role="status" className="glass rise pointer-events-auto flex items-center gap-2.5 px-4 py-3 text-sm text-emerald-50" style={{ "--i": 0 }}>
              <Icon size={17} className={TONES[t.type]} /> {t.message}
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}
