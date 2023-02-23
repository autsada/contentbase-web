import { Spinner } from "./spinner"

interface Props {
  children?: React.ReactNode
  withSpinner?: boolean
  spinnerColor?: "default" | "blue" | "orange"
  spinnerSize?: "xs" | "sm" | "base" | "md" | "lg" | { w: string; h: string }
  opacity?: 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 96 | 100
  bgWhite?: boolean
  className?: string
  zIndex?: string
  onClickBackdrop?: () => void
}

export function Backdrop({
  children,
  withSpinner = false,
  spinnerColor = "default",
  spinnerSize = "base",
  opacity = 30,
  bgWhite = false,
  className,
  zIndex = "z-50",
  onClickBackdrop,
}: Props) {
  return (
    <div
      className={`fixed ${zIndex} inset-0 h-screen flex flex-col justify-center items-center px-5 overflow-hidden ${
        bgWhite ? "bg-white" : "bg-black"
      } ${className ? className : ""}`}
      style={{ opacity: `${opacity}%` }}
      onClick={onClickBackdrop}
    >
      {children && children}
      {withSpinner && <Spinner size={spinnerSize} color={spinnerColor} />}
    </div>
  )
}
