import { useEffect, useState, useCallback, useMemo } from "react"
import { useDropzone } from "react-dropzone"
import { useFetcher } from "@remix-run/react"

import { BackdropWithInfo } from "../backdrop-info"
import { Spinner } from "../spinner"
import { avatarsStorageFolder, clientAuth } from "~/client/firebase.client"
import { UPLOAD_SERVICE_URL } from "~/constants"
import type { SelectedFile } from "~/routes/profiles/create"
import type { Profile, Account, AccountType } from "~/types"

interface Props {
  accountType: AccountType | null
  gas?: string | null
  tokenId: string
  closeModal: () => void
}

export function UpdateProfileImageModal({
  accountType,
  gas,
  tokenId,
  closeModal,
}: Props) {
  const [file, setFile] = useState<SelectedFile | null>(null)
  const [uploadError, setUploadError] = useState("")
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  const actionFetcher = useFetcher()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0] as SelectedFile

      if (selectedFile.size / 1000 > 2048) {
        // Maximum allowed image size = 2mb
        setUploadError("File too big")
        return
      }

      setUploadError("")
      const fileWithPreview = Object.assign(selectedFile, {
        preview: URL.createObjectURL(selectedFile),
      })

      setFile(fileWithPreview)
    },
    [setFile]
  )

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    isDragAccept,
  } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  })

  async function changeProfileImage() {
    try {
      if (!accountType || !tokenId || !file) return

      setProcessing(true)
      if (accountType === "TRADITIONAL") {
        // // Call the `Server` service
        // const user = clientAuth.currentUser
        // const idToken = await user?.getIdToken()
        // // For some reason, if no idToken or uid from `account` and `user` don't match, we need to log user out and have them to sign in again
        // if (!idToken || account.uid !== user?.uid) {
        //   setProcessing(false)
        //   reauthenticateFetcher.submit(null, {
        //     method: "post",
        //     action: "/reauthenticate",
        //   })
        //   return
        // }

        // // Profile image url
        // const formData = new FormData()
        // formData.append("file", file)
        // formData.append("handle", profile.handle)
        // formData.append("storageFolder", avatarsStorageFolder)

        // const res = await fetch(`${UPLOAD_SERVICE_URL}/profile/avatar`, {
        //   method: "POST",
        //   body: formData,
        // })
        // const data = (await res.json()) as { url: string }
        // const imageURI = data.url
        // console.log("image uri: ", imageURI)

        actionFetcher.submit(
          { idToken: "", tokenId, imageURI: "" },
          { action: "post" }
        )
      }

      if (accountType === "WALLET") {
        // Connect to the blockchain directly
      }
    } catch (error) {
      console.log("error 1: ", error)
      setProcessing(false)
    }
  }

  return (
    <BackdropWithInfo>
      <div>
        <button
          className="absolute top-2 right-6 font-thin text-textExtraLight cursor-pointer"
          onClick={closeModal}
        >
          &#10005;
        </button>
        <actionFetcher.Form onSubmit={changeProfileImage}>
          <h6 className="text-base mb-5">Upload the new image</h6>
          <div className="w-[150px] h-[150px] mx-auto border border-borderLightGray">
            <div
              className="w-full h-full rounded-full bg-gray-100 overflow-hidden"
              {...getRootProps({
                isDragActive,
                isDragReject,
                isDragAccept,
              })}
            >
              <input {...getInputProps({ multiple: false })} />
              {file && (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          <p className="error text-xs mt-2 px-5">
            {gas && file ? `Estimated gas fee = ${gas} ETH` : <>&nbsp;</>}
          </p>

          <button
            type="submit"
            className={`btn-dark h-8 px-5 mt-5 rounded-full text-sm ${
              !file || !!uploadError || processing
                ? "opacity-30"
                : "opacity-100"
            }`}
            disabled={!file || !!uploadError || processing}
          >
            {processing && <Spinner size={{ w: "w-[20px]", h: "h-[20px]" }} />}{" "}
            CONFIRM
          </button>
        </actionFetcher.Form>
      </div>
    </BackdropWithInfo>
  )
}
