/**
 * This is the layout for pages that display content
 */

import { Outlet } from "@remix-run/react"
import { ContentTabs } from "~/components/navs/content-tabs"
import { useAppContext } from "~/root"

export default function ContentLayOut() {
  const context = useAppContext()

  return (
    <>
      <div className="mb-2 border-y border-borderExtraLightGray">
        <ContentTabs />
      </div>

      <Outlet context={context} />
    </>
  )
}
