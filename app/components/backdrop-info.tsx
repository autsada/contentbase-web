import React from "react"
import { Backdrop } from "./backdrop"

interface Props {
  children: React.ReactNode
  spinnerColor?: "default" | "blue" | "orange"
  spinnerSize?: "xs" | "sm" | "base" | "md" | "lg" | { w: string; h: string }
  zIndex?: string
}

export function BackdropWithInfo({
  children,
  spinnerColor,
  spinnerSize,
  zIndex = "z-50",
}: Props) {
  return (
    <div
      className={`fixed inset-0 px-6 flex items-center justify-center ${zIndex}`}
    >
      <Backdrop spinnerColor={spinnerColor} spinnerSize={spinnerSize} />
      <div className="relative z-50 w-full bg-white py-6 px-4 rounded-2xl">
        {children}
      </div>
    </div>
  )
}
