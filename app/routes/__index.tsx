import React from "react"
import { Outlet } from "@remix-run/react"

import { Nav } from "~/components/nav"
import { Connect } from "~/components/connect"

export default function Home() {
  const [isOpen, setIsOpen] = React.useState(false)

  const openConnectModal = React.useCallback((open: boolean) => {
    setIsOpen(open)
  }, [])

  return (
    <>
      <Nav openConnectModal={openConnectModal} />
      <Outlet />
      {isOpen && <Connect setOpen={openConnectModal} />}
    </>
  )
}
