import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { MdFileUpload } from "react-icons/md"
import { useFetcher } from "@remix-run/react"

import { BackdropWithInfo } from "../backdrop-info"
import { Spinner } from "../spinner"
import { clientAuth } from "~/client/firebase.client"
import { uploadImage } from "~/utils/upload-apis"
import type { AccountType, SelectedFile } from "~/types"

interface Props {
  userId: string
  accountType: AccountType | null
  handle: string
  tokenId: string
  oldImageURI: string | null
  closeModal: () => void
}

export function UpdateProfileImageModal({
  userId,
  accountType,
  handle,
  tokenId,
  oldImageURI,
  closeModal,
}: Props) {
  const [file, setFile] = useState<SelectedFile | null>(null)
  const [imageSizeError, setImageSizeError] = useState("")
  const [uploadingImage, setUploadingImage] = useState<boolean>()
  const [uploadImageError, setUploadImageError] = useState<boolean>()
  const [isSuccess, setIsSuccess] = useState<boolean>()

  const actionFetcher = useFetcher()

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

      if (!clientAuth || !clientAuth.currentUser) {
        actionFetcher.submit(null, {
          method: "post",
          action: "/auth/reauthenticate",
        })
        return
      }

      // Get user's id token
      const user = clientAuth.currentUser
      const idToken = await user?.getIdToken()

      // Start upload image
      setUploadingImage(true)
      const result = await uploadImage({
        idToken,
        file,
        handle,
        oldImageURI,
      })
      const imageURI = result.imageURI
      if (!imageURI) {
        setUploadImageError(true)
        setUploadingImage(false)
        return
      }

      // Reset upload error if it's true
      if (uploadImageError) setUploadImageError(false)

      setUploadingImage(false)
      setIsSuccess(true)
      // Hard reload the page to update the UI, without hard reload the UI will not update as the image url isn't changed.
      window?.location.reload()
    } catch (error) {
      setUploadImageError(true)
      setUploadingImage(false)
      setIsSuccess(false)
    }
  }

  return (
    <BackdropWithInfo>
      <div className="relative">
        <button
          className={
            "absolute top-0 right-4 font-thin text-textExtraLight cursor-pointer"
          }
          disabled={uploadingImage}
          onClick={closeModal}
        >
          &#10005;
        </button>
        <div>
          <div className="pt-3">
            <h6 className="mb-4">Edit Profile Image</h6>

            <div className="flex flex-col justify-center min-h-[60px]">
              {isSuccess ? (
                <h6 className="text-blueBase text-base">
                  Your profile image has been updated.
                </h6>
              ) : (
                <>
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
                    className={`btn-dark mt-4 h-10 py-2 w-28 flex items-center rounded-full text-sm ${
                      !accountType ||
                      !tokenId ||
                      !handle ||
                      !file ||
                      !!imageSizeError ||
                      uploadingImage
                        ? "opacity-30"
                        : "opacity-100"
                    }`}
                    disabled={
                      !accountType ||
                      !tokenId ||
                      !handle ||
                      !file ||
                      !!imageSizeError ||
                      uploadingImage
                    }
                    onClick={updateProfileImage}
                  >
                    CONFIRM
                  </button>

                  {/* Info and spinner */}
                  {uploadingImage && (
                    <BackdropWithInfo>
                      <h6
                        className={`text-base ${
                          uploadingImage ? "text-orange-600" : ""
                        }`}
                      >
                        Uploading Image.
                      </h6>
                      <div className="mt-5">
                        <Spinner size="sm" color="orange" />
                      </div>
                    </BackdropWithInfo>
                  )}

                  {/* Error message */}
                  <div className="mt-1 px-2">
                    <p className="error">
                      {uploadImageError ? (
                        "Failed to upload the image. Please try again."
                      ) : (
                        <>&nbsp;</>
                      )}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </BackdropWithInfo>
  )
}
