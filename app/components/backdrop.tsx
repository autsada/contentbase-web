import { Spinner } from "./spinner"

interface Props {
  withSpinner?: boolean
  opacity?: 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100
  bgWhite?: boolean
}

export function Backdrop({
  withSpinner = false,
  opacity,
  bgWhite = false,
}: Props) {
  return (
    <div
      className={`absolute z-50 inset-0 flex justify-center items-center ${
        bgWhite ? "bg-white" : "bg-gray-400"
      }`}
      style={{ opacity: `${opacity}%` }}
    >
      {withSpinner && <Spinner />}
    </div>
  )
}
