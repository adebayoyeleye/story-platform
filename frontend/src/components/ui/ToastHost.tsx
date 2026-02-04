import * as React from "react"
import { cn } from "@/lib/cn"

type Toast = { id: string; title: string; kind?: "success" | "error" | "info" }

type ToastContextValue = {
  push: (t: Omit<Toast, "id">) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastHost")
  return ctx
}

type ToastHostProps = {
  children: React.ReactNode
}

export function ToastHost({ children }: ToastHostProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const push = React.useCallback((t: Omit<Toast, "id">) => {
    const id = crypto.randomUUID()
    const toast: Toast = { id, ...t }
    setToasts((prev) => [toast, ...prev].slice(0, 3))
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
    }, 2500)
  }, [])

  return (
    <ToastContext.Provider value={{ push }}>
      {children}

      <div className="fixed right-4 top-4 z-50 grid gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "rounded-md border bg-card px-3 py-2 text-sm shadow-sm",
              t.kind === "success" && "border-border",
              t.kind === "error" && "border-red-200 text-red-700",
              t.kind === "info" && "border-border"
            )}
          >
            {t.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
