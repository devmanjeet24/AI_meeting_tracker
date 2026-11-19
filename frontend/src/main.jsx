import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { TooltipProvider } from "@/components/ui/tooltip"
import { ToastProvider } from "./components/fx/Toast"
import CursorFX from "./components/fx/CursorFX"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TooltipProvider>
      <ToastProvider>
        <App />
        <CursorFX />
      </ToastProvider>
    </TooltipProvider>
  </StrictMode>,
)
