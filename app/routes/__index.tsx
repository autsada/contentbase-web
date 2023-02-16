import { Outlet } from "@remix-run/react"
import PublicTabs from "~/components/public-tabs"

export default function ContentLayOut() {
  return (
    <>
      <div className="mb-2 px-4 border-y-[2px] border-borderLightGray">
        <PublicTabs />
      </div>

      <Outlet />
    </>
  )
}
