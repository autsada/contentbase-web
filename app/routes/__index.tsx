import { Outlet } from "@remix-run/react"

import { Nav } from "~/components/nav"

export default function Index() {
  return (
    <>
      <Nav />
      <Outlet />
    </>
  )
}
