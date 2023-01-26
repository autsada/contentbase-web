import { ClientOnly } from "remix-utils"

import { EmailRequest } from "~/components/auth/email-request"

/**
 * The route for the 1 step: Request a link
 */
export default function Email() {
  return (
    <div className="page py-10">
      <h6 className="text-2xl mb-10">Connect with Email</h6>
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => <EmailRequest />}
      </ClientOnly>
    </div>
  )
}
