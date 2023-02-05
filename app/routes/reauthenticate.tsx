import { redirect } from "@remix-run/node"
import type { ActionArgs } from "@remix-run/node"

import { getSession } from "~/server/session.server"
import { logOut } from "~/server/auth.server"

export function loader() {
  return redirect("/")
}

export async function action({ request }: ActionArgs) {
  const session = await getSession(request.headers.get("cookie"))
  await logOut(session)

  return redirect("/auth")
}
