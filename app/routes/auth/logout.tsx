import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { redirectBack } from "remix-utils"

import { getSession, destroySession } from "~/server/session.server"
import { CLEAN_UP_CODE, CLEAN_UP_ID } from "~/constants"
import { logOut } from "~/server/auth.server"

export function loader({ request }: LoaderArgs) {
  return redirectBack(request, { fallback: "/" })
}

export async function action({ request }: ActionArgs) {
  const session = await getSession(request.headers.get("cookie"))
  await logOut(session)

  // Redirect to `/cleanup` to remove `loggedIn` key in localStorage (client side)
  return redirect(`/auth/cleanup?${CLEAN_UP_ID}=${CLEAN_UP_CODE}`, {
    headers: { "Set-Cookie": await destroySession(session) },
  })
}
