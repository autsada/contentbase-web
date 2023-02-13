import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useDropzone } from "react-dropzone"
import debounce from "lodash/debounce"
import { useFetcher, Link, useRevalidator } from "@remix-run/react"
import { MdOutlineCheck } from "react-icons/md"
import { useHydrated } from "remix-utils"
import { json } from "@remix-run/node"
import type { ActionArgs } from "@remix-run/node"
import type { ChangeEvent } from "react"

import { useProfileContext } from "../profiles"
import { avatarsStorageFolder, clientAuth } from "~/client/firebase.client"
import { UPLOAD_SERVICE_URL } from "~/constants"
import { createFirstProfile, createProfile } from "~/graphql/server"
import type { validateActionType } from "./validate-handle"
import { BackdropWithInfo } from "~/components/backdrop-info"
import { Spinner } from "~/components/spinner"
import { wait } from "~/utils"

export type SelectedFile = File & {
  path: string
  preview: string
}

export async function action({ request }: ActionArgs) {
  try {
    // Get the `idToken` from the request
    const form = await request.formData()
    const { handle, imageURI, owner, idToken, isFirstProfile } =
      Object.fromEntries(form) as {
        handle: string
        imageURI?: string
        owner: string
        idToken: string
        isFirstProfile: "True" | "False"
      }

    if (isFirstProfile === "True") {
      // Call `createFirstProfile` mutation in the `Server` service
      await createFirstProfile({ handle, imageURI, owner }, idToken)
    }

    if (isFirstProfile === "False") {
      // Call `createProfile` mutation in the `Server` service
      await createProfile({ handle, imageURI }, idToken)
    }

    return json({ status: "Ok" })
  } catch (error) {
    return json({ status: "Error" })
  }
}

export default function CreateProfile() {
  const [handle, setHandle] = useState("")
  const [isHandleLenValid, setIsHandleLenValid] = useState<
    boolean | undefined
  >()
  const [file, setFile] = useState<SelectedFile | null>(null)
  const [imageSizeError, setImageSizeError] = useState("")
  const [uploadingImage, setUploadingImage] = useState<boolean>()
  const [uploadImageError, setUploadImageError] = useState<boolean>()
  const [connectServerLoading, setConnectServerLoading] = useState<boolean>()
  const [connectServerError, setConnectServerError] = useState<boolean>()
  const [isCreateProfileSuccess, setIsCreateProfileSuccess] =
    useState<boolean>()
  const [isCreateProfileError, setIsCreateProfileError] = useState<boolean>()

  const validateFetcher = useFetcher<validateActionType>()
  const isHandleUnique = validateFetcher?.data?.isUnique
  const actionFetcher = useFetcher<typeof action>()
  const actionStatus = actionFetcher?.data?.status
  const revalidator = useRevalidator()
  const hydrated = useHydrated()
  const context = useProfileContext()
  const accountType = context?.account.type
  // Check if it is the first profile of the user or not
  const isFirstProfile = context?.account.profiles?.length === 0

  // When the button should be disabled
  const disabled =
    !hydrated ||
    !handle ||
    !isHandleLenValid ||
    !isHandleUnique ||
    !!imageSizeError

  const executeTxnBtnRef = useRef<HTMLButtonElement>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0] as SelectedFile

      if (selectedFile.size / 1000 > 4096) {
        // Maximum allowed image size = 4mb
        setImageSizeError("File too big")
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

  const handleValidateHandle = useCallback((handle: string) => {
    if (handle && handle.length < 3) {
      setIsHandleLenValid(false)
      return
    }

    setIsHandleLenValid(true)
    validateFetcher.submit(
      { handle },
      { method: "post", action: "profiles/validate-handle" }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validateHandleDebounce = useMemo(
    () => debounce(handleValidateHandle, 200),
    [handleValidateHandle]
  )

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setHandle(value)
    validateHandleDebounce(value)
  }

  // First profile or `TRADITIONAL` Account: When the action returns
  useEffect(() => {
    if (actionStatus) {
      setConnectServerLoading(false)

      if (actionStatus === "Ok") {
        revalidator.revalidate()
        setConnectServerError(false)
        setIsCreateProfileSuccess(true)
      }

      if (actionStatus === "Error") {
        setIsCreateProfileError(true)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionStatus])

  async function createProfile() {
    try {
      if (!clientAuth || !context?.account) {
        actionFetcher.submit(null, {
          method: "post",
          action: "/reauthenticate",
        })
        return
      }

      // If user upload an image
      let imageURI: string = ""

      if (file) {
        try {
          setUploadingImage(true)
          const formData = new FormData()
          formData.append("file", file)
          formData.append("handle", handle)
          formData.append("storageFolder", avatarsStorageFolder)

          const res = await fetch(`${UPLOAD_SERVICE_URL}/profile/avatar`, {
            method: "POST",
            body: formData,
          })

          const data = (await res.json()) as { url: string }
          imageURI = data.url
          if (uploadImageError) setUploadImageError(false)
          setUploadingImage(false)
        } catch (error) {
          setUploadImageError(true)
          setUploadingImage(false)
        }
      }

      // If first profile or a traditional account, call the server.
      if (isFirstProfile || accountType === "TRADITIONAL") {
        // The owner address
        const address = context?.account.address

        setConnectServerLoading(true)

        // Get user's id token
        const user = clientAuth.currentUser
        const idToken = await user?.getIdToken()
        // For some reason, if no idToken or uid from `account` and `user` don't match, we need to log user out and have them to sign in again
        if (!idToken || context?.account.uid !== user?.uid) {
          setConnectServerLoading(false)
          actionFetcher.submit(null, {
            method: "post",
            action: "/reauthenticate",
          })
          return
        }

        if (isFirstProfile) {
          // If the first profile, call the action for both `TRADITIONAL` and `WALLET` accounts as the platform will be responsible for the gas fee for all users first profiles.
          actionFetcher.submit(
            {
              handle,
              imageURI,
              owner: address,
              idToken,
              isFirstProfile: "True",
            },
            { method: "post" }
          )
        } else {
          // `TRADITIONAL` account and NOT a first profile
          actionFetcher.submit(
            {
              handle,
              imageURI,
              owner: address,
              idToken,
              isFirstProfile: "False",
            },
            { method: "post" }
          )
        }
      } else {
        // `WALLET` account and NOT a first profile

        if (accountType === "WALLET") {
          // B. Connect to the blockchain directly.

          if (!executeTxnBtnRef || !executeTxnBtnRef.current) return

          // Wait 1000ms to make sure the `write` function is available
          await wait(1000)

          executeTxnBtnRef.current.click()
        }
      }
    } catch (error) {
      setConnectServerLoading(false)
      setConnectServerError(true)
    }
  }

  async function execute() {
    // if (write) {
    //   write()
    //   if (retryCount) setRetryCount(0)
    // } else {
    //   if (retryCount <= 10) {
    //     // Wait 500ms before calling
    //     await wait(500)
    //     if (executeTxnBtnRef && executeTxnBtnRef.current) {
    //       executeTxnBtnRef.current.click()
    //     }
    //     setRetryCount((prev) => prev + 1)
    //   } else {
    //     if (uploadingImage) setUploadingImage(false)
    //     setNoWriteError(true)
    //     setRetryCount(0)
    //   }
    // }
  }

  /**
   * Reset states so user can create a new profile
   */
  function clearForm() {
    setHandle("")
    setFile(null)
    if (isHandleLenValid) setIsHandleLenValid(false)
    if (uploadingImage) setUploadingImage(false)
    if (uploadImageError) setUploadImageError(false)
    if (connectServerLoading) setConnectServerLoading(false)
    if (connectServerError) setConnectServerError(false)
    if (isCreateProfileSuccess) setIsCreateProfileSuccess(false)
  }

  return (
    <div className="page p-4 text-start">
      <actionFetcher.Form className="px-5" onSubmit={createProfile}>
        <p className="mb-5 text-lg">Please provide below information.</p>
        <div className="mb-5">
          <fieldset
            className={`relative border ${
              (typeof isHandleLenValid === "boolean" && !isHandleLenValid) ||
              (typeof isHandleUnique === "boolean" && !isHandleUnique)
                ? "border-error"
                : "border-borderDarkGray"
            } pl-4 rounded-md bg-white`}
          >
            <legend className="text-textExtraLight px-1">
              Handle
              <abbr title="This field is mandatory" aria-label="required">
                *
              </abbr>
            </legend>
            <label htmlFor="handle">
              <input
                type="text"
                name="handle"
                placeholder="Your handle (at least 3 characters)"
                className="block w-full h-10 font-semibold text-blueDark text-lg outline-none pl-1 placeholder:font-light placeholder:text-blue-400 placeholder:text-sm"
                minLength={3}
                onChange={handleChange}
                value={handle}
              />
            </label>
            {isHandleLenValid &&
              typeof isHandleUnique === "boolean" &&
              isHandleUnique && (
                <MdOutlineCheck
                  size={25}
                  color="green"
                  className="absolute top-1 right-1"
                />
              )}
          </fieldset>
          <p className="error text-end">
            {typeof isHandleUnique === "boolean" && !isHandleUnique ? (
              "This handle is taken"
            ) : (
              <>&nbsp;</>
            )}
          </p>
        </div>

        <div className="mb-5">
          <fieldset className="border border-borderDarkGray px-4 py-4 rounded-md bg-white">
            <legend className="text-textExtraLight px-1">Profile Image</legend>
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
            {context?.account?.profiles?.length === 0 ? (
              <p className="font-light text-blueBase italic text-sm mt-4">
                Tip: Upload your profile image now to enjoy{" "}
                <span className="text-orange-600">GAS FREE</span>.
              </p>
            ) : (
              <p className="font-light text-blueBase italic text-sm mt-4">
                &nbsp;
              </p>
            )}
          </fieldset>
          <p className="error text-end">
            {imageSizeError ? imageSizeError : <>&nbsp;</>}
          </p>
        </div>

        <button
          type="submit"
          className={`btn-dark w-40 rounded-full ${
            disabled ? "disabled" : "opacity-100"
          }`}
          disabled={disabled}
        >
          Create Profile
        </button>

        {/* `Wallet` Account: Hidden button to execute `write` function */}
        <button ref={executeTxnBtnRef} className="hidden" onClick={execute}>
          Execute
        </button>
      </actionFetcher.Form>

      {/* `first profile` || `TRADITIONAL` Account: Info/Spiner and Error message */}
      {(isFirstProfile || accountType === "TRADITIONAL") && (
        <>
          {/* Info and spinner */}
          {(uploadingImage || connectServerLoading) && (
            <BackdropWithInfo>
              <h6
                className={`text-base text-center ${
                  connectServerLoading ? "text-orange-600" : ""
                }`}
              >
                {uploadingImage
                  ? "Uploading Image."
                  : connectServerLoading
                  ? "Transaction Submitted. Waiting..."
                  : null}
              </h6>
              <div className="mt-5">
                <Spinner
                  size="sm"
                  color={connectServerLoading ? "orange" : "default"}
                />
              </div>
            </BackdropWithInfo>
          )}

          {/* Error message */}
          <div className="mt-1 px-2">
            <p className="error text-center">
              {uploadImageError ? (
                "Failed to upload the image. Please try again."
              ) : connectServerError ? (
                "Error occcurred while attempting to create a profile. Please try again."
              ) : (
                <>&nbsp;</>
              )}
            </p>
          </div>
        </>
      )}

      {/* All Accounts */}
      {(isCreateProfileSuccess || isCreateProfileError) && (
        <BackdropWithInfo>
          {isCreateProfileSuccess ? (
            <>
              <h6 className="px-2 mt-2 text-center">
                <span className="text-blueBase">{handle}</span> Profile NFT
                Minted
              </h6>
              <div className="mt-6 text-center">
                <Link to="/profiles">
                  <h6 className="btn-light w-max mx-auto px-5 py-2 rounded-full font-light text-center text-base cursor-pointer">
                    Go to profiles dashboard
                  </h6>
                </Link>
                <h6
                  className="btn-orange w-max mx-auto px-5 py-2 rounded-full mt-6 font-light text-center text-base cursor-pointer"
                  onClick={clearForm}
                >
                  Create a new profile
                </h6>
                <Link to="/upload">
                  <h6
                    className="btn-blue w-max mx-auto px-5 py-2 rounded-full mt-6 font-light text-center text-base cursor-pointer"
                    onClick={clearForm}
                  >
                    Start sharing videos
                  </h6>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h6 className="text-base px-2 mt-2 text-center">
                Create <span className="text-blueBase">{handle}</span> Profile
                Failed
              </h6>
              <div className="mt-6">
                <h6
                  className="font-light text-orange-400 text-center text-base cursor-pointer"
                  onClick={clearForm}
                >
                  Try again
                </h6>
              </div>
            </>
          )}
          {/* {isCreateProfileSuccess ? (
            actionStatus === "Ok" ? (
              <>
                <h6 className="px-2 mt-2 text-center">
                  <span className="text-blueBase">{handle}</span> Profile NFT
                  Minted
                </h6>
                <div className="mt-6 text-center">
                  <Link to="/profiles">
                    <h6 className="btn-light w-max mx-auto px-5 py-2 rounded-full font-light text-center text-base cursor-pointer">
                      Go to profiles dashboard
                    </h6>
                  </Link>
                  <h6
                    className="btn-orange w-max mx-auto px-5 py-2 rounded-full mt-6 font-light text-center text-base cursor-pointer"
                    onClick={clearForm}
                  >
                    Create a new profile
                  </h6>
                  <Link to="/upload">
                    <h6
                      className="btn-blue w-max mx-auto px-5 py-2 rounded-full mt-6 font-light text-center text-base cursor-pointer"
                      onClick={clearForm}
                    >
                      Start sharing videos
                    </h6>
                  </Link>
                </div>
              </>
            ) : actionStatus === "Error" ? (
              <>
                <h6 className="text-base px-2 mt-2 text-center">
                  Create <span className="text-blueBase">{handle}</span> Profile
                  Failed
                </h6>
                <div className="mt-6">
                  <h6
                    className="font-light text-orange-400 text-center text-base cursor-pointer"
                    onClick={clearForm}
                  >
                    Try again
                  </h6>
                </div>
              </>
            ) : (
              <Spinner />
            )
          ) : (
            <>
              <h6 className="text-base px-2 mt-2 text-center">
                Minting <span className="text-blueBase">{handle}</span> Profile
                NFT
              </h6>
              <div className="mt-4">
                <Spinner size="sm" />
              </div>
            </>
          )} */}
        </BackdropWithInfo>
      )}
    </div>
  )
}
