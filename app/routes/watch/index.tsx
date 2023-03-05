/**
 * Just redirect users to the homepage if they enter '/watch' without specifying a publish id.
 */

import { redirect } from "@remix-run/node"

export function loader() {
  return redirect("/")
}
