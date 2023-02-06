import { redirect, json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"

import { requireAuth } from "~/server/auth.server"

export async function loader({ request }: LoaderArgs) {
  const { user, headers } = await requireAuth(request)

  if (!user) {
    return redirect("/auth", { headers })
  }

  return json({ user }, { headers })
}

export default function Upload() {
  return (
    <div className="page">
      <h6>Upload</h6>
    </div>
  )
}
