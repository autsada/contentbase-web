import { useCatch } from "@remix-run/react"

import ErrorComponent from "~/components/error"

export default function UploadVideo() {
  return <div className="page pt-5 px-3"></div>
}

export function CatchBoundary() {
  const caught = useCatch()

  return <ErrorComponent error={caught.statusText} />
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <ErrorComponent error={error.message} />
}
