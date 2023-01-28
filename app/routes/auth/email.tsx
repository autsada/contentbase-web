import { Outlet, useCatch } from "@remix-run/react"

import ErrorComponent from "~/components/error"

/**
 * @dev There are 2 steps to login with email link.
 * 1. User request a link to their email
 * 2. User clicks the received link to proceed the login
 * We use two different routes for these two steps
 */

// We need Javascript client side to run the component
export const handle = { hydrate: true }

export default function Email() {
  return (
    <>
      <Outlet />
    </>
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
