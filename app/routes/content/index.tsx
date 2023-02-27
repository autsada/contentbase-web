import { useCallback, useState, useEffect } from "react"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import type { LoaderArgs } from "@remix-run/node"

import { UploadModal } from "~/components/upload/upload-modal"

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

  const openUploadModal = useCallback(() => {
    setUploadModalVisible(true)
  }, [])

  const closeUploadModal = useCallback(() => {
    setUploadModalVisible(false)
  }, [])

  return (
    <div
      className={`page ${
        uploadModalVisible ? "overflow-y-hidden" : "overflow-y-auto"
      }`}
    >
      {uploadModalVisible && <UploadModal closeModal={closeUploadModal} />}
    </div>
  )
}
