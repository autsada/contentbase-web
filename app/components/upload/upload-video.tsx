import { useCallback, useState } from "react"
import { useFetcher } from "@remix-run/react"

import { UploadVideoContent } from "./video-content"
import { UploadVideoInfo } from "./video-info"
import { useDashboardContext } from "~/routes/dashboard"
import { uploadVideo } from "~/utils/upload-apis"
import type { SelectedFile } from "~/types"
import { clientAuth } from "~/client/firebase.client"

interface Props {
  closeModal: () => void
  createDraft: (title: string, filename: string) => void
  isCreateDraftError: boolean | undefined
  publishId?: number | null
}

export function UploadVideo({
  closeModal,
  createDraft,
  isCreateDraftError,
  publishId,
}: Props) {
  const [step, setStep] = useState<"upload" | "info">("upload")
  const [videoFile, setVideoFile] = useState<SelectedFile | null>(null)

  const { profile } = useDashboardContext()
  const authenticateFetcher = useFetcher()

  const onDropVideo = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0] as SelectedFile

      if (selectedFile.size / 1000 > 102400000) {
        // Maximum allowed image size = 100GB
        return
      }

      const fileWithPreview = Object.assign(selectedFile, {
        preview: URL.createObjectURL(selectedFile),
      })

      // Call create draft immediately on drop
      setVideoFile(fileWithPreview)
      createDraft(selectedFile.name || "", selectedFile.name || "")
    },
    [setVideoFile, createDraft]
  )

  async function onNextStep() {
    if (!videoFile || !publishId || !profile) return

    if (!clientAuth || !clientAuth.currentUser) {
      authenticateFetcher.submit(null, {
        method: "post",
        action: "/auth/reauthenticate",
      })
      return
    }

    // Get user's id token
    const user = clientAuth.currentUser
    const idToken = await user?.getIdToken()

    if (!idToken) {
      authenticateFetcher.submit(null, {
        method: "post",
        action: "/auth/reauthenticate",
      })
      return
    }

    uploadVideo({
      idToken,
      file: videoFile,
      handle: profile.handle,
      publishId,
    }).catch((error) => {
      console.error(error)
    })
    setStep("info")
  }

  return step === "upload" ? (
    <UploadVideoContent
      isPreparingError={isCreateDraftError}
      file={videoFile}
      onDropFile={onDropVideo}
      onNext={onNextStep}
      publishId={publishId}
    />
  ) : step === "info" ? (
    <UploadVideoInfo
      file={videoFile}
      goBack={setStep}
      closeModal={closeModal}
      publishId={publishId}
      title={videoFile?.name}
    />
  ) : null
}
