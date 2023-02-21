/**
 * This is the layout for pages that display content
 */

import { Outlet } from "@remix-run/react"
import PublicTabs from "~/components/public-tabs"
import { useAppContext } from "~/root"

export default function ContentLayOut() {
  const context = useAppContext()

  return (
    <>
      <div className="mb-2 px-4 border-y-[2px] border-borderLightGray">
        <PublicTabs />
      </div>

      <Outlet context={context} />
    </>
  )
}
