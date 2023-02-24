import { useCallback, useState, useEffect } from "react"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@remix-run/node"

import { UploadVideoContent } from "~/components/upload/video-content"

export function loader({ request }: LoaderArgs) {
  const url = new URL(request.url)
  const isStartUpload = url.searchParams.get("start")

  return json({ startUpload: isStartUpload === "true" })
}

export default function ContentDashboard() {
  const data = useLoaderData<typeof loader>()

  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>()

  useEffect(() => {
    if (data.startUpload) {
      setUploadModalVisible(true)
    }
  }, [data])

  const openUploadModal = useCallback((open: boolean) => {
    setUploadModalVisible(open)
  }, [])

  return (
    <div
      className={`page ${
        uploadModalVisible ? "overflow-y-hidden" : "overflow-y-auto"
      }`}
    >
      {uploadModalVisible && <UploadVideoContent openModal={openUploadModal} />}
    </div>
  )
}
