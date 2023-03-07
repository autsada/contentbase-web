import { useCatch, Link, useLocation, Outlet } from "@remix-run/react"

import ErrorComponent from "~/components/error"
import { useDashboardContext } from "../dashboard"

export default function ContentDashboard() {
  const context = useDashboardContext()
  const { pathname } = useLocation()

  return (
    <>
      {/* Tab to select by content type */}
      <div className="py-4 flex max-w-full w-full items-center overflow-x-auto scrollbar-hide">
        <Link to="/dashboard">
          <div
            className={`${
              pathname === "/dashboard" ? "border-b-2" : "border-none"
            } mx-4 border-borderExtraDarkGray w-max`}
          >
            <h6
              className={`text-base ${
                pathname === "/dashboard"
                  ? "text-textDark"
                  : "text-textExtraLight"
              }`}
            >
              All
            </h6>
          </div>
        </Link>
        <Link to="/dashboard/videos">
          <div
            className={`${
              pathname === "/dashboard/videos" ? "border-b-2" : "border-none"
            } mx-4 border-borderExtraDarkGray w-max`}
          >
            <h6
              className={`text-base ${
                pathname === "/dashboard/videos"
                  ? "text-textDark"
                  : "text-textExtraLight"
              }`}
            >
              Videos
            </h6>
          </div>
        </Link>
        <Link to="blogs">
          <div
            className={`${
              pathname === "/dashboard/blogs" ? "border-b-2" : "border-none"
            } mx-4 border-borderExtraDarkGray w-max`}
          >
            <h6
              className={`text-base ${
                pathname === "/blogs" ? "text-textDark" : "text-textExtraLight"
              }`}
            >
              Blogs
            </h6>
          </div>
        </Link>
      </div>

      <div className="page">
        <Outlet context={context} />
      </div>
    </>
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  return <ErrorComponent error={caught.statusText} />
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <ErrorComponent error={error.message} />
}
