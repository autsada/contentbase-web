import { Outlet } from "@remix-run/react"
import { useAppContext } from "~/root"

export default function Wallet() {
  const context = useAppContext()
  return <Outlet context={context} />
}
