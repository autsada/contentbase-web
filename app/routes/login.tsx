import type { ActionArgs, Session } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { verifyAuthenticityToken } from "remix-utils"

import { createSessionCookie } from "~/server/auth.server"
import {
  getSession,
  destroySession,
  commitSession,
} from "~/server/session.server"
import type { AccountType } from "~/types"

export function loader() {
  return redirect("/")
}

export async function action({ request }: ActionArgs) {
  let session: Session | undefined = undefined

  try {
    session = await getSession(request.headers.get("cookie"))
    await verifyAuthenticityToken(request, session)
    // Get the `idToken` from the request
    const form = await request.formData()
    const { idToken } = Object.fromEntries(form) as {
      idToken: string
      accountType: AccountType
    }
    const { sessionCookie } = await createSessionCookie(idToken)
    session.set("session", sessionCookie)

    // Query account by uid to check if the user has an acccount in the database already or not.

    return redirect("/profile", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    })
  } catch (error) {
    if (session) {
      // Delete cookie
      await destroySession(session)
    }

    return json({ error: String(error) }, { status: 401 })
  }
}

export type LoginActionType = typeof action
