import { useEffect, useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Link, useFetcher, useRevalidator } from "@remix-run/react"

import { BackdropWithInfo } from "../backdrop-info"
import { Spinner } from "../spinner"
import { avatarsStorageFolder, clientAuth } from "~/client/firebase.client"
import { UPLOAD_SERVICE_URL } from "~/constants"
import type { SelectedFile } from "~/routes/profiles/create"
import type { AccountType } from "~/types"
import type { UpdateProfileImageAction } from "~/routes/profiles/$handle/$profileId"

interface Props {
  accountType: AccountType | null
  gas?: string | null
  handle: string
  tokenId: string
  oldImageURI: string | null
  balance: string | undefined
  closeModal: () => void
}

export function UpdateProfileImageModal({
  accountType,
  gas,
  handle,
  tokenId,
  oldImageURI,
  balance,
  closeModal,
}: Props) {
  const [file, setFile] = useState<SelectedFile | null>(null)
  const [uploadError, setUploadError] = useState("")
  const [processing, setProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState<boolean>()
  const [isError, setIsError] = useState<boolean>()

  const revalidator = useRevalidator()
  const reauthenticateFetcher = useFetcher()
  const actionFetcher = useFetcher<UpdateProfileImageAction>()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0] as SelectedFile

      if (selectedFile.size / 1000 > 4096) {
        // Maximum allowed image size = 4mb
        setUploadError("File too big (max allowed 4mb)")
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

  // When the action returns, update processing status.
  useEffect(() => {
    if (actionFetcher?.data?.status) {
      setProcessing(false)
      if (actionFetcher.data.status === "Ok") {
        setFile(null)
        setIsSuccess(true)
        setIsError(false)
        revalidator.revalidate()
      }
      if (actionFetcher.data.status === "Error") {
        setIsError(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFetcher?.data?.status])

  async function changeProfileImage() {
    try {
      if (!accountType || !tokenId || !handle || !file || !!uploadError) return

      setProcessing(true)
      if (accountType === "TRADITIONAL") {
        // Call the `Server` service
        const user = clientAuth.currentUser
        const idToken = await user?.getIdToken()
        // For some reason, if no idToken or uid from `account` and `user` don't match, we need to log user out and have them to sign in again
        if (!idToken) {
          setProcessing(false)
          reauthenticateFetcher.submit(null, {
            method: "post",
            action: "/reauthenticate",
          })
          return
        }

        // Profile image url
        const formData = new FormData()
        formData.append("file", file!)
        formData.append("handle", handle)
        formData.append("storageFolder", avatarsStorageFolder)
        if (oldImageURI) {
          formData.append("oldURI", oldImageURI)
        }

        const res = await fetch(`${UPLOAD_SERVICE_URL}/profile/avatar`, {
          method: "POST",
          body: formData,
        })
        const data = (await res.json()) as { url: string }
        const imageURI = data.url

        actionFetcher.submit({ idToken, tokenId, imageURI }, { method: "post" })
      }

      if (accountType === "WALLET") {
        // Connect to the blockchain directly
      }
    } catch (error) {
      setProcessing(false)
      setIsError(true)
    }
  }

  // console.log("action data: ", actionFetcher?.data)
  return (
    <BackdropWithInfo>
      <button
        className={`absolute top-2 right-6 font-thin text-textExtraLight cursor-pointer ${
          processing ? "hidden" : "block"
        }`}
        disabled={processing}
        onClick={closeModal}
      >
        &#10005;
      </button>
      <actionFetcher.Form onSubmit={changeProfileImage}>
        {Number(balance) > 0 ? (
          <div className="pt-5">
            <h6 className="mb-4">Upload New Image</h6>
            {/* Estimate gas fee info */}
            <p className="error text-xs mb-1">
              {gas && file && !uploadError ? (
                `Estimated gas fee = ${gas} ETH`
              ) : (
                <>&nbsp;</>
              )}
            </p>
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

            {/* Upload error message */}
            <p className="error mt-1">
              {uploadError ? uploadError : <>&nbsp;</>}
            </p>

            <button
              type="submit"
              className={`btn-dark mt-4 h-10 py-2 w-28 flex items-center rounded-full text-sm ${
                !accountType ||
                !tokenId ||
                !handle ||
                !file ||
                !!uploadError ||
                processing
                  ? "opacity-30"
                  : "opacity-100"
              }`}
              disabled={
                !accountType ||
                !tokenId ||
                !handle ||
                !file ||
                !!uploadError ||
                processing
              }
            >
              CONFIRM
            </button>

            {/* Error or Success message */}
            <p
              className={`error my-2 px-1 ${isSuccess ? "text-blueBase" : ""} ${
                isError || isSuccess ? "opacity-100" : "opacity-0"
              }`}
            >
              {isError ? (
                "Update profile image failed, please make sure you have enough ETH in your balance."
              ) : isSuccess ? (
                "Update profile image success"
              ) : (
                <p>&nbsp;</p>
              )}
            </p>

            {processing && (
              <BackdropWithInfo>
                <h6 className="text-base">
                  Waiting to complete the transaction.
                </h6>
                <div className="mt-5">
                  <Spinner size="sm" color="orange" />
                </div>
              </BackdropWithInfo>
            )}
          </div>
        ) : (
          <div className="p-5 flex flex-col justify-center items-center">
            <h6 className="text-base">
              To update a profile image, you will need a little bit of{" "}
              <span className="text-blueBase">ETH</span> to pay for gas fee.
            </h6>
            <Link to="/profiles/wallet">
              <button className="btn-orange mt-5 px-6 rounded-full">
                Buy ETH
              </button>
            </Link>
          </div>
        )}
      </actionFetcher.Form>
    </BackdropWithInfo>
  )
}
