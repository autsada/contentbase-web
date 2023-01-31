import React from "react"
import { Backdrop } from "./backdrop"

export function BackdropWithInfo({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 px-6 flex items-center justify-center">
      <Backdrop />
      <div className="relative z-50 w-full bg-white p-6 rounded-2xl">
        {children}
      </div>
    </div>
  )
}
