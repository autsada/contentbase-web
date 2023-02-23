import { useEffect, useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Link, useFetcher, useRevalidator } from "@remix-run/react"

import { BackdropWithInfo } from "../backdrop-info"
import { Spinner } from "../spinner"
import { clientAuth } from "~/client/firebase.client"
import { useUpdateProfileImage } from "~/hooks/profile-contract"
import { uploadImage, wait } from "~/utils"
import type { AccountType, SelectedFile } from "~/types"
import type { UpdateProfileImageAction } from "~/routes/$handle/$profileId"
import { MdFileUpload } from "react-icons/md"

interface Props {
  userId: string
  accountType: AccountType | null
  gas?: string | null
  handle: string
  tokenId: string
  oldImageURI: string | null
  balance: string | undefined
  closeModal: () => void
}

export function UpdateProfileImageModal({
  userId,
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
    write,
    isWriteLoading,
    isWriteSuccess,
    isWriteError,
    writeError,
    isWaitLoading,
    isWaitSuccess,
    isWaitError,
    waitError,
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

  /**
   * Upload an image first and then call a function depending on the account type in order to execute blockchain logic
   */
  // TODO: Find a way to prevent reupload an image when `WALLET` account rejects the transaction.
  async function updateProfileImage() {
    try {
      if (
        !userId ||
        !accountType ||
        !tokenId ||
        !handle ||
        !file ||
        !!imageSizeError
      )
        return

      setUploadingImage(true)

      const imageURI = await uploadImage({
        uid: userId,
        file,
        handle,
        oldImageURI,
      })
      if (!imageURI) {
        setUploadImageError(true)
        setUploadingImage(false)
        return
      }

      // Save image uri to state
      setImageURI(imageURI)

      // Reset upload error if it's true
      if (uploadImageError) setUploadImageError(false)

      if (accountType === "TRADITIONAL") {
        updateProfileImageForTraditional(imageURI)
        setUploadingImage(false)
      }

      if (accountType === "WALLET") {
        // Wait 1000ms to make sure the `write` function is available
        await wait(1000)

        updateProfileImageForWallet()
        setUploadingImage(false)
      }
    } catch (error) {
      setUploadImageError(true)
      setUploadingImage(false)
    }
  }

  // `TRADITIONAL` Account: Edit profile image.
  async function updateProfileImageForTraditional(uri: string) {
    try {
      // Call the `Server` service
      const user = clientAuth.currentUser
      const idToken = await user?.getIdToken()
      // For some reason, if no idToken or uid from `account` and `user` don't match, we need to log user out and have them to sign in again
      if (!idToken) {
        reauthenticateFetcher.submit(null, {
          method: "post",
          action: "/auth/reauthenticate",
        })
        return
      }

      if (isTraditionalError) setIsTraditionalError(false)
      setIsTraditionalLoading(true)
      actionFetcher.submit(
        { idToken, tokenId, imageURI: uri },
        { method: "post" }
      )
    } catch (error) {
      setIsTraditionalError(true)
      setIsTraditionalLoading(false)
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
        setImageURI("")
      }
      if (actionFetcher.data.status === "Error") {
        setIsTraditionalError(true)
        setImageURI("")
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFetcher?.data?.status])

  // `WALLET` Account: Listen to wagmi transaction success and revalidate the states.
  useEffect(() => {
    if (isWaitSuccess) {
      revalidator.revalidate()
      setFile(null)
      setImageURI("")
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWaitSuccess])

  // `WALLET` Account: Update profile image
  async function updateProfileImageForWallet() {
    // try {
    if (!executeTxnBtnRef || !executeTxnBtnRef.current) return

    executeTxnBtnRef.current.click()
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
          setRetryCount((prev) => prev + 1)
          executeTxnBtnRef.current.click()
        }
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
            "absolute top-0 right-4 font-thin text-textExtraLight cursor-pointer"
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
        <actionFetcher.Form onSubmit={updateProfileImage}>
          {Number(balance) > 0 ? (
            <div className="pt-3">
              <h6 className="mb-4">Edit Profile Image</h6>

              <div className="flex flex-col justify-center min-h-[60px]">
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
                        className="w-full h-full rounded-full bg-gray-100 flex flex-col justify-center items-center overflow-hidden"
                        {...getRootProps({
                          isDragActive,
                          isDragReject,
                          isDragAccept,
                        })}
                      >
                        <input {...getInputProps({ multiple: false })} />
                        {file ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <MdFileUpload
                              size={30}
                              className="text-textExtraLight"
                            />
                            <p className="mt-1 font-light text-textExtraLight text-sm">
                              (4MB or less)
                            </p>
                          </>
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
                            ) : isWriteError ? (
                              writeError?.message
                            ) : isWaitError ? (
                              waitError?.message
                            ) : noWriteError ? (
                              "Edit profile image failed. Please check your wallet and ensure you use the correct network and have enough funds to pay gas fee."
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
              <Link to="/wallet">
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
