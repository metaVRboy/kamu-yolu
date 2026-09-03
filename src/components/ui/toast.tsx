"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { CheckCircle2, X, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const toastManager = ToastPrimitive.createToastManager()

type ToastType = "success" | "error"

function addToast(type: ToastType, title: string, description?: string) {
  toastManager.add({ type, title, description, timeout: type === "error" ? 6000 : 4000 })
}

export const toast = {
  success: (title: string, description?: string) => addToast("success", title, description),
  error: (title: string, description?: string) => addToast("error", title, description),
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()
  return (
    <>
      {toasts.map((t) => (
        <ToastPrimitive.Root
          key={t.id}
          toast={t}
          className={cn(
            "relative flex w-full items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl transition-all duration-200",
            "data-starting-style:translate-y-1 data-starting-style:opacity-0",
            "data-ending-style:opacity-0",
            t.type === "error" ? "border-destructive/25" : "border-emerald-200",
          )}
        >
          <span className="mt-0.5 shrink-0">
            {t.type === "error" ? (
              <XCircle className="h-5 w-5 text-destructive" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            {t.title && <ToastPrimitive.Title className="text-sm font-semibold text-slate-900" />}
            {t.description && (
              <ToastPrimitive.Description className="mt-0.5 text-sm text-muted-foreground" />
            )}
          </div>
          <ToastPrimitive.Close
            aria-label="Kapat"
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
    </>
  )
}

export function Toaster() {
  return (
    <ToastPrimitive.Provider toastManager={toastManager}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 outline-none sm:bottom-6 sm:right-6">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  )
}
