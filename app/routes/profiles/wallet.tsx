import { Outlet } from "@remix-run/react"
import { useProfileContext } from "../profiles"

export default function Wallet() {
  const context = useProfileContext()

  return <Outlet context={context} />
}
