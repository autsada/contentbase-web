import { Outlet } from "@remix-run/react"
import { useAppContext } from "~/root"

export default function Settings() {
  const context = useAppContext()
  return <Outlet context={context} />
}
