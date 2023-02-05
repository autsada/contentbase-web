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
import { createAccount, queryAccountByUid } from "~/graphql/public-apis"
import { createWallet } from "~/graphql/server"

export function loader() {
  return redirect("/auth")
}

export async function action({ request }: ActionArgs) {
  let session: Session | undefined = undefined

  try {
    session = await getSession(request.headers.get("cookie"))
    await verifyAuthenticityToken(request, session)
    // Get the `idToken` from the request
    const form = await request.formData()
    const { idToken, accountType } = Object.fromEntries(form) as {
      idToken: string
      accountType: AccountType
    }
    const { sessionCookie, uid } = await createSessionCookie(idToken)
    session.set("session", sessionCookie)
    const headers = {
      "Set-Cookie": await commitSession(session),
    }

    // Query account by uid to check if the user has an acccount in the database already or not.
    const account = await queryAccountByUid(uid)

    // If no account, we have to create one for the user
    if (!account) {
      if (accountType === "TRADITIONAL") {
        // Two steps process: create a wallet and create an account
        // Calling `createWallet` mutation in the server service will do these 2 steps in one go.
        await createWallet(idToken)
      }

      if (accountType === "WALLET") {
        // One step process: create an account
        // Calling `account` rest api route in the public apis service
        await createAccount({
          address: uid,
          uid,
          accountType,
        })
      }

      // Redirect the user to `profile` page to create a first profile
      return redirect("/profile", { headers })
    } else {
      const hasProfile = account.profiles.length > 0

      if (!hasProfile) {
        // Redirect the user to `profile` page to create a first profile
        return redirect("/profile", { headers })
      }

      return redirect("/", { headers })
    }
  } catch (error) {
    if (session) {
      // Delete cookie
      await destroySession(session)
    }

    return json({ error: String(error) }, { status: 401 })
  }
}

export type LoginActionType = typeof action
