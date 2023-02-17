import { useCatch } from "@remix-run/react"
import { ClientOnly } from "remix-utils"

import { EmailRequest } from "~/components/auth/email-request"
import ErrorComponent from "~/components/error"

/**
 * The route for the 1 step: Request a link
 */
export default function Email() {
  return (
    <div className="page py-10">
      <h6 className="text-2xl mb-10">Log in with Email</h6>
      <ClientOnly fallback={<p className="text-textLight">Loading...</p>}>
        {() => <EmailRequest />}
      </ClientOnly>
    </div>
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  return <ErrorComponent error={caught.statusText} />
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <ErrorComponent error={error.message} />
}
