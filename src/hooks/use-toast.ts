"use client"

import * as React from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 5000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

type State = { toasts: ToasterToast[] }
type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> & { id: string } }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string }

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()
const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }
    case "DISMISS_TOAST":
      if (action.toastId) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === action.toastId ? { ...t, open: false } : t
          ),
        }
      }
      return { ...state, toasts: state.toasts.map((t) => ({ ...t, open: false })) }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) return { ...state, toasts: [] }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

interface ToastOptions {
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: "default" | "success" | "destructive" | "warning" | "info"
  duration?: number
}

function toast(options: ToastOptions) {
  const id = genId()
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...options,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss()
      },
    },
  })

  // Clear any existing timeout
  const existingTimeout = toastTimeouts.get(id)
  if (existingTimeout) {
    clearTimeout(existingTimeout)
  }

  // Set new timeout
  const timeout = setTimeout(() => {
    dismiss()
    toastTimeouts.delete(id)
  }, options.duration || TOAST_REMOVE_DELAY)

  toastTimeouts.set(id, timeout)

  return { id, dismiss }
}

// Convenience methods
toast.success = (title: string, description?: string) =>
  toast({ title, description, variant: "success" })

toast.error = (title: string, description?: string) =>
  toast({ title, description, variant: "destructive" })

toast.warning = (title: string, description?: string) =>
  toast({ title, description, variant: "warning" })

toast.info = (title: string, description?: string) =>
  toast({ title, description, variant: "info" })

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
