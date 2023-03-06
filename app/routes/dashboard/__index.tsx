import { useCallback, useState, useEffect } from "react"
import { useCatch, Link, useLocation, Outlet } from "@remix-run/react"

import { UploadModal } from "~/components/upload/upload-modal"
import ErrorComponent from "~/components/error"
import { useDashboardContext } from "../dashboard"
import type { UploadType } from "~/components/upload/select-type"

export default function ContentDashboard() {
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>()
  const [uploadType, setUploadType] = useState<UploadType>("SelectType")

  // const data = useLoaderData<typeof loader>()
  const context = useDashboardContext()
  const { pathname } = useLocation()

  useEffect(() => {
    if (context?.startUpload) {
      setUploadModalVisible(true)
    }
  }, [context?.startUpload])

  // const openUploadModal = useCallback(() => {
  //   setUploadModalVisible(true)
  // }, [])

  const closeUploadModal = useCallback((cb?: () => void) => {
    if (cb) {
      cb()
    }
    setUploadModalVisible(false)
  }, [])

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

      {uploadModalVisible && (
        <UploadModal
          closeModal={closeUploadModal}
          uploadType={uploadType}
          setUploadType={setUploadType}
        />
      )}
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
