import { useEffect, useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Link, useFetcher, useRevalidator } from "@remix-run/react"

import { BackdropWithInfo } from "../backdrop-info"
import { Spinner } from "../spinner"
import { clientAuth } from "~/client/firebase.client"
import { useUpdateProfileImage } from "~/hooks/profile-contract"
import { uploadImage, wait } from "~/utils"
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
  const [imageSizeError, setImageSizeError] = useState("")
  const [uploadingImage, setUploadingImage] = useState<boolean>()
  const [uploadImageError, setUploadImageError] = useState<boolean>()
  const [isTraditionalLoading, setIsTraditionalLoading] = useState<boolean>()
  const [isTraditionalSuccess, setIsTraditionalSuccess] = useState<boolean>()
  const [isTraditionalError, setIsTraditionalError] = useState<boolean>() // For `TRADITIONAL`
  const [imageURI, setImageURI] = useState("") // For `WALLET` account, we need to set the image uri to state in order to pass it to wagmi hook.
  const [retryCount, setRetryCount] = useState(0)
  const [noWriteError, setNoWriteError] = useState<boolean>() // If, for some reason, there is no `write` transaction after magmi prepare transaction done, use this state to inform user.

  const executeTxnBtnRef = useRef<HTMLButtonElement>(null)
  const revalidator = useRevalidator()
  const reauthenticateFetcher = useFetcher()
  const actionFetcher = useFetcher<UpdateProfileImageAction>()

  const {
    isPrepareLoading,
    isPrepareError,
    write,
    isWriteLoading,
    isWriteSuccess,
    isWriteError,
    isWaitLoading,
    isWaitSuccess,
    isWaitError,
  } = useUpdateProfileImage(Number(tokenId), imageURI)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0] as SelectedFile

      if (selectedFile.size / 1000 > 4096) {
        // Maximum allowed image size = 4mb
        setImageSizeError("File too big (max allowed 4mb)")
        return
      }

      setImageSizeError("")
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

  // `TRADITIONAL` Account: Edit profile image.
  async function updateProfileImageForTraditional() {
    try {
      if (
        accountType !== "TRADITIONAL" ||
        !tokenId ||
        !handle ||
        !file ||
        !!imageSizeError
      )
        return

      setUploadingImage(true)

      const imageURI = await uploadImage({ file, handle, oldImageURI })
      if (!imageURI) {
        setUploadImageError(true)
        setUploadingImage(false)
        return
      }

      // Reset upload error if it's true
      if (uploadImageError) setUploadImageError(false)

      // Call the `Server` service
      const user = clientAuth.currentUser
      const idToken = await user?.getIdToken()
      // For some reason, if no idToken or uid from `account` and `user` don't match, we need to log user out and have them to sign in again
      if (!idToken) {
        setUploadingImage(false)
        reauthenticateFetcher.submit(null, {
          method: "post",
          action: "/reauthenticate",
        })
        return
      }

      setIsTraditionalLoading(true)
      setUploadingImage(false)
      actionFetcher.submit({ idToken, tokenId, imageURI }, { method: "post" })
    } catch (error) {
      setUploadingImage(false)
      setIsTraditionalError(true)
    }
  }

  // `TRADITIONAL` Account:  When the action returns, update processing status and revalidate the states.
  useEffect(() => {
    if (actionFetcher?.data?.status) {
      setIsTraditionalLoading(false)
      if (actionFetcher.data.status === "Ok") {
        revalidator.revalidate()
        setFile(null)
        setIsTraditionalSuccess(true)
        setIsTraditionalError(false)
      }
      if (actionFetcher.data.status === "Error") {
        setIsTraditionalError(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFetcher?.data?.status])

  // `WALLET` Account: Listen to wagmi transaction success and revalidate the states.
  useEffect(() => {
    if (isWaitSuccess) {
      revalidator.revalidate()
      setFile(null)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWaitSuccess])

  // `WALLET` Account: Update profile image
  async function updateProfileImageForWallet() {
    try {
      if (
        accountType !== "WALLET" ||
        !tokenId ||
        !handle ||
        !file ||
        !!imageSizeError ||
        !executeTxnBtnRef ||
        !executeTxnBtnRef.current
      )
        return

      setUploadingImage(true)
      const imageURI = await uploadImage({ file, handle, oldImageURI })
      if (!imageURI) {
        setUploadImageError(true)
        setUploadingImage(false)
        return
      }

      if (uploadImageError) setUploadImageError(false)
      setImageURI(imageURI)

      // Wait 1000ms to make sure the `write` function is available
      await wait(1000)

      executeTxnBtnRef.current.click()
      setUploadingImage(false)
    } catch (error) {
      setUploadingImage(false)
    }
  }

  // `WALLET` Account: This function will be called after the `write` function is ready.
  async function execute() {
    if (write) {
      write()
      if (retryCount) setRetryCount(0)
    } else {
      if (retryCount <= 10) {
        // Wait 500ms before calling
        await wait(500)
        if (executeTxnBtnRef && executeTxnBtnRef.current) {
          executeTxnBtnRef.current.click()
        }
        setRetryCount((prev) => prev + 1)
      } else {
        if (uploadingImage) setUploadingImage(false)
        setNoWriteError(true)
        setRetryCount(0)
      }
    }
  }

  return (
    <BackdropWithInfo>
      <div className="relative">
        <button
          className={
            "absolute top-2 right-6 font-thin text-textExtraLight cursor-pointer"
          }
          disabled={
            isTraditionalLoading ||
            isPrepareLoading ||
            isWaitLoading ||
            isWaitLoading
          }
          onClick={closeModal}
        >
          &#10005;
        </button>
        <actionFetcher.Form
          onSubmit={
            accountType === "TRADITIONAL"
              ? updateProfileImageForTraditional
              : accountType === "WALLET"
              ? updateProfileImageForWallet
              : undefined
          }
        >
          {Number(balance) > 0 ? (
            <div className="pt-5">
              <h6 className="mb-4">Edit Profile Image</h6>

              <div className="flex flex-col justify-center min-h-[120px]">
                {isTraditionalSuccess || isWaitSuccess ? (
                  <h6 className="text-blueBase text-base">
                    Your profile image has been updated.
                  </h6>
                ) : (
                  <>
                    {/* `TRADITIONAL` Account: Estimate gas fee info */}
                    <p className="error text-xs mb-1">
                      {accountType === "TRADITIONAL" &&
                      gas &&
                      file &&
                      !imageSizeError ? (
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

                    {/* Image size error message */}
                    <p className="error mt-1">
                      {imageSizeError ? imageSizeError : <>&nbsp;</>}
                    </p>

                    {/* Confirm Button */}
                    <button
                      type="submit"
                      className={`btn-dark mt-4 h-10 py-2 w-28 flex items-center rounded-full text-sm ${
                        !accountType ||
                        !tokenId ||
                        !handle ||
                        !file ||
                        !!imageSizeError
                          ? "opacity-30"
                          : "opacity-100"
                      }`}
                      disabled={
                        !accountType ||
                        !tokenId ||
                        !handle ||
                        !file ||
                        !!imageSizeError
                      }
                    >
                      CONFIRM
                    </button>

                    {/* `TRADITIONAL` Account */}
                    {accountType === "TRADITIONAL" && (
                      <>
                        {/* Info and spinner */}
                        {(uploadingImage || isTraditionalLoading) && (
                          <BackdropWithInfo>
                            <h6
                              className={`text-base ${
                                isTraditionalLoading ? "text-orange-600" : ""
                              }`}
                            >
                              {uploadingImage
                                ? "Uploading Image."
                                : isTraditionalLoading
                                ? "Transaction Submitted. Waiting..."
                                : null}
                            </h6>
                            <div className="mt-5">
                              <Spinner
                                size="sm"
                                color={
                                  isTraditionalLoading ? "orange" : "default"
                                }
                              />
                            </div>
                          </BackdropWithInfo>
                        )}

                        {/* Error message */}
                        <div className="mt-1 px-2">
                          <p className="error">
                            {uploadImageError ? (
                              "Failed to upload the image. Please try again."
                            ) : isTraditionalError ? (
                              "Edit profile image failed. Please ensuer you have enough funds to pay gas and try again."
                            ) : (
                              <>&nbsp;</>
                            )}
                          </p>
                        </div>
                      </>
                    )}

                    {/* `WALLET` Account */}
                    {accountType === "WALLET" && (
                      <>
                        {/* Info and spinner */}
                        {(uploadingImage ||
                          isWriteLoading ||
                          isWaitLoading) && (
                          <BackdropWithInfo>
                            <h6
                              className={`text-base ${
                                isWriteLoading
                                  ? "text-blueBase"
                                  : isWriteSuccess || isWaitLoading
                                  ? "text-orange-600"
                                  : ""
                              }`}
                            >
                              {uploadingImage
                                ? "Uploading Image."
                                : isWriteLoading
                                ? "Connecting Wallet."
                                : isWriteSuccess || isWaitLoading
                                ? "Transaction Submitted. Waiting..."
                                : null}
                            </h6>
                            <div className="mt-5">
                              <Spinner
                                size="sm"
                                color={
                                  isWriteLoading
                                    ? "blue"
                                    : isWriteSuccess || isWaitLoading
                                    ? "orange"
                                    : "default"
                                }
                              />
                            </div>
                          </BackdropWithInfo>
                        )}

                        {/* Error message */}
                        <div className="mt-1 px-2">
                          <p className="error">
                            {uploadImageError ? (
                              "Failed to upload the image. Please try again."
                            ) : isPrepareError || isWriteError ? (
                              "Failed to connect to wallet. Please try again."
                            ) : isWaitError || noWriteError ? (
                              "Edit profile image failed. Please ensuer you have enough funds to pay gas and try again."
                            ) : (
                              <>&nbsp;</>
                            )}
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="pt-12 pb-8 px-5 flex flex-col justify-center items-center">
              <h6 className="text-base">
                You have not enough <span className="text-blueBase">ETH</span>{" "}
                to pay for gas fee.
              </h6>
              <Link to="/profiles/wallet">
                <button className="btn-orange mt-5 px-6 rounded-full">
                  Buy ETH
                </button>
              </Link>
            </div>
          )}
        </actionFetcher.Form>

        {/* `Wallet` Account: Hidden button to execute `write` function */}
        <button ref={executeTxnBtnRef} className="hidden" onClick={execute}>
          Execute
        </button>
      </div>
    </BackdropWithInfo>
  )
}
