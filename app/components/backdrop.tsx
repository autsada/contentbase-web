import { Spinner } from "./spinner"

interface Props {
  children?: React.ReactNode
  withSpinner?: boolean
  opacity?: 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 96 | 100
  bgWhite?: boolean
}

export function Backdrop({
  children,
  withSpinner = false,
  opacity = 50,
  bgWhite = false,
}: Props) {
  return (
    <div
      className={`absolute z-50 inset-0 flex flex-col justify-center items-center px-5 ${
        bgWhite ? "bg-white" : "bg-gray-400"
      }`}
      style={{ opacity: `${opacity}%` }}
    >
      {children && children}
      {withSpinner && <Spinner />}
    </div>
  )
}
