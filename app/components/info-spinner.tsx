import { Spinner } from "./spinner"

interface Props {
  header: string
  children?: React.ReactNode
  spinnerSize?: "base" | "sm" | "xs" | "md" | "lg"
}

export function InfoWithSpinner({
  header,
  children,
  spinnerSize = "sm",
}: Props) {
  return (
    <div className="bg-white w-full p-4 rounded-2xl">
      <h6 className="text-base px-2 mt-2 text-center">{header}</h6>
      <>{children && children}</>
      <div className="mt-4">
        <Spinner size={spinnerSize} />
      </div>
    </div>
  )
}
