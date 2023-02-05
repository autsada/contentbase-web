import { json, redirect } from "@remix-run/node"
import { verifyAuthenticityToken } from "remix-utils"
import type { ActionArgs } from "@remix-run/node"

import { getSession } from "~/server/session.server"

export function loader() {
  return redirect("/")
}

export async function action({ request }: ActionArgs) {
  try {
    // const session = await getSession(request.headers.get("cookie"))
    // await verifyAuthenticityToken(request, session)
    // Get the `idToken` from the request
    // const form = await request.formData()
    // const { handle } = Object.fromEntries(form) as {
    //   handle: string
    // }

    return json({ handle: `123` })
  } catch (error) {
    return json(null)
  }
}
