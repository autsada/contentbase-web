import { Document } from "~/root"

export default function ErrorComponent({
  error,
  children,
}: {
  error: string
  children?: React.ReactNode
}) {
  return (
    <>
      {children ? (
        children
      ) : (
        <div className="text-center py-10">
          <h3 className="text-error">Error Occurred</h3>
          <div className="px-5">
            <p className="my-5 font-light text-textLight">
              {error || "Something not right"}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
