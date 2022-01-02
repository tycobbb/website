import { useState, useEffect } from "react"
import { focusBoolean } from "./Session"

// -- impls --
export function useAutoSetFlag(name: string): boolean | null {
  const [state, setState] = useState<boolean | null>(null)
  const flag = focusBoolean(name)

  useEffect(() => {
    setState(flag.get())
    flag.set(true)
  }, [])

  return state
}
