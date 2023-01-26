import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { redirectBack } from "remix-utils"

import { getSession, destroySession } from "~/server/session.server"

export function loader({ request }: LoaderArgs) {
  return redirectBack(request, { fallback: "/" })
}

export async function action({ request }: ActionArgs) {
  const session = await getSession(request.headers.get("cookie"))
  // Redirect to `/cleanup` to remove `loggedIn` key in localStorage (client side)
  return redirect("/cleanup", {
    headers: { "Set-Cookie": await destroySession(session) },
  })
}
