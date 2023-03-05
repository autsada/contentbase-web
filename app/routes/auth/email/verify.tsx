import { json, redirect } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { ClientOnly } from "remix-utils"

import { EmailVerify } from "~/components/auth/email-verify"
import { VERIFY_CODE, VERIFY_ID } from "~/constants"

/**
 * The route for the 2 step: Verify the link
 */

export function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const code = url.searchParams.get(VERIFY_ID) || ""

  // Verify if the request is comming from the Firebase auth
  if (code !== VERIFY_CODE) {
    return redirect("/")
  }

  return json({ code })
}

export default function Verify() {
  return (
    <div className="page py-10">
      <h6 className="text-2xl mb-10">Verify Email</h6>

      <ClientOnly>{() => <EmailVerify />}</ClientOnly>
    </div>
  )
}
