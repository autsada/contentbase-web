import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useDropzone } from "react-dropzone"
import debounce from "lodash/debounce"
import {
  useFetcher,
  Link,
  useRevalidator,
  useLoaderData,
  useCatch,
} from "@remix-run/react"
import { MdOutlineCheck } from "react-icons/md"
import { useHydrated } from "remix-utils"
import { json, redirect } from "@remix-run/node"
import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import type { ChangeEvent } from "react"

import { BackdropWithInfo } from "~/components/backdrop-info"
import { Spinner } from "~/components/spinner"
import ErrorComponent from "~/components/error"
import { useCreateProfile } from "~/hooks/profile-contract"
import { clientAuth } from "~/client/firebase.client"
import { requireAuth } from "~/server/auth.server"
import { queryAccountByUid } from "~/graphql/public-apis"
import { createFirstProfile, createProfile } from "~/graphql/server"
import { uploadImage, wait } from "~/utils"
import {
  FIRST_PROFILE_ID,
  MAX_HANDLE_LENGTH,
  MIN_HANDLE_LENGTH,
} from "~/constants"
import type { validateActionType } from "./validate-handle"
import FirstprofileNotification from "~/components/firstprofile-notification"

export type SelectedFile = File & {
  path: string
  preview: string
}

export async function loader({ request }: LoaderArgs) {
  const { user, headers } = await requireAuth(request)

  if (!user) {
    return redirect("/auth", { headers })
  }
  const account = await queryAccountByUid(user.uid)
  let hasProfile = account?.profiles?.length > 0

  return json({ user, account, hasProfile }, { headers })
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
  const isHandleLenValid =
    handle &&
    handle.length >= MIN_HANDLE_LENGTH &&
    handle.length <= MAX_HANDLE_LENGTH
  const [file, setFile] = useState<SelectedFile | null>(null)
  const [imageSizeError, setImageSizeError] = useState("")
  const [uploadingImage, setUploadingImage] = useState<boolean>()
  const [uploadImageError, setUploadImageError] = useState<boolean>()
  const [connectServerLoading, setConnectServerLoading] = useState<boolean>()
  const [connectServerError, setConnectServerError] = useState<boolean>()
  const [isCreateProfileSuccess, setIsCreateProfileSuccess] =
    useState<boolean>()
  const [isCreateProfileError, setIsCreateProfileError] = useState<boolean>()
  const [imageURI, setImageURI] = useState("") // For `WALLET` account, we need to set the image uri to state in order to pass it to wagmi hook.
  const [retryCount, setRetryCount] = useState(0)
  const [noWriteError, setNoWriteError] = useState<boolean>() // If, for some reason, there is no `write` transaction after magmi prepare transaction done, use this state to inform user.

  const data = useLoaderData<typeof loader>()
  const validateFetcher = useFetcher<validateActionType>()
  const isHandleUnique = validateFetcher?.data?.isUnique
  const actionFetcher = useFetcher<typeof action>()
  const actionStatus = actionFetcher?.data?.status
  const loaderFetcher = useFetcher()
  const revalidator = useRevalidator()
  const hydrated = useHydrated()
  // const context = useAppContext()
  const accountType = data?.account?.type
  // Check if it is the first profile of the user or not
  const isFirstProfile =
    typeof data?.hasProfile === "boolean" && !data?.hasProfile

  const [firstProfileModalVisible, setFirstProfileModalVisible] =
    useState<boolean>()

  // When the button should be disabled
  const disabled =
    !hydrated ||
    !handle ||
    !isHandleLenValid ||
    !isHandleUnique ||
    !!imageSizeError

  const executeTxnBtnRef = useRef<HTMLButtonElement>(null)
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
  } = useCreateProfile(
    handle,
    imageURI,
    accountType === "WALLET" && !!isHandleUnique
  )

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

  /**
   * Check whether we have already notified user to create their first profile or not.
   */
  useEffect(() => {
    if (typeof document === "undefined") return

    const isNotified = window.localStorage.getItem(FIRST_PROFILE_ID)

    if (isFirstProfile && !isNotified) {
      setFirstProfileModalVisible(true)
    } else {
      setFirstProfileModalVisible(false)
    }
  }, [isFirstProfile])

  const closeFirstProfileNotificationModal = useCallback(() => {
    setFirstProfileModalVisible(false)
    if (typeof document !== "undefined") {
      window.localStorage.setItem(FIRST_PROFILE_ID, `${Date.now()}`)
    }
  }, [])

  const handleValidateHandle = useCallback((handle: string) => {
    if (
      handle &&
      (handle.length < MIN_HANDLE_LENGTH || handle.length > MAX_HANDLE_LENGTH)
    ) {
      return
    }

    validateFetcher.submit(
      { handle },
      { method: "post", action: "/validate-handle" }
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
        // Refetch the profile in the root component to update `nav` and `drawer` UIs
        loaderFetcher.submit(null, { method: "get", action: "/" })
        setConnectServerError(false)
        setIsCreateProfileSuccess(true)
      }

      if (actionStatus === "Error") {
        setIsCreateProfileError(true)
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionStatus])

  // Create profile logic
  // TODO: Find a way to prevent reupload an image when `WALLET` account rejects the transaction.
  async function handleCreateProfile() {
    try {
      if (!clientAuth || !data?.account) {
        actionFetcher.submit(null, {
          method: "post",
          action: "/auth/reauthenticate",
        })
        return
      }

      let imageURI: string = ""

      // If user upload an image
      if (file) {
        setUploadingImage(true)
        imageURI = await uploadImage({ file, handle, oldImageURI: null })
        if (!imageURI) {
          setUploadImageError(true)
          setUploadingImage(false)
          return
        }

        if (uploadImageError) setUploadImageError(false)
      }

      // If first profile or a traditional account, call the server.
      if (isFirstProfile || accountType === "TRADITIONAL") {
        // The owner address
        const address = data?.account.address

        setConnectServerLoading(true)
        setUploadingImage(false)

        // Get user's id token
        const user = clientAuth.currentUser
        const idToken = await user?.getIdToken()
        // For some reason, if no idToken or uid from `account` and `user` don't match, we need to log user out and have them to sign in again
        if (!idToken || data?.account.uid !== user?.uid) {
          setConnectServerLoading(false)
          actionFetcher.submit(null, {
            method: "post",
            action: "/auth/reauthenticate",
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
          if (file && imageURI) {
            setImageURI(imageURI)
            // Wait 1000ms to make sure the `write` function is available
            await wait(1000)
            setUploadingImage(false)
          } else {
            // Don't need to wait
          }

          createProfileForWallet()
        }
      }
    } catch (error) {
      setConnectServerLoading(false)
      setConnectServerError(true)
    }
  }

  // `WALLET` Account: create profile
  async function createProfileForWallet() {
    // try {
    if (!executeTxnBtnRef || !executeTxnBtnRef.current) return

    executeTxnBtnRef.current.click()
  }

  // `WALLET` Account: Listen to wagmi transaction success and revalidate the states.
  useEffect(() => {
    if (isWaitSuccess) {
      revalidator.revalidate()
      // Refetch the profile in the root component to update `nav` and `drawer` UIs
      loaderFetcher.submit(null, { method: "get", action: "/" })
      setIsCreateProfileSuccess(true)
      clearForm()
    }

    if (isWaitError || noWriteError) {
      setIsCreateProfileError(true)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWaitSuccess, isWaitError, noWriteError])

  // `WALLET` Account: execute write transaction
  async function execute() {
    if (write) {
      write()
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

  /**
   * Reset states so user can create a new profile
   */
  function clearForm() {
    setHandle("")
    setFile(null)
    if (uploadingImage) setUploadingImage(false)
    if (uploadImageError) setUploadImageError(false)
    if (connectServerLoading) setConnectServerLoading(false)
    if (connectServerError) setConnectServerError(false)
    if (isCreateProfileSuccess) setIsCreateProfileSuccess(false)
  }

  return (
    <div className="page p-4 text-start">
      <actionFetcher.Form className="px-5" onSubmit={handleCreateProfile}>
        <h5 className="mb-5 text-center">
          {isFirstProfile ? "Create First Profile" : "Create Profile"}
        </h5>
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
                placeholder="What do you want to be called?"
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
            {typeof isHandleLenValid === "boolean" && !isHandleLenValid ? (
              "At least 3 characters."
            ) : typeof isHandleUnique === "boolean" && !isHandleUnique ? (
              "This handle is taken or invalid."
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
            {isFirstProfile ? (
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
          disabled={disabled || isPrepareLoading}
        >
          Create Profile
        </button>
      </actionFetcher.Form>
      {/* `Wallet` Account: Hidden button to execute `write` function */}
      <button ref={executeTxnBtnRef} className="hidden" onClick={execute}>
        Execute
      </button>

      {/* Show first profile notification modal for the first time user logged in */}
      {typeof firstProfileModalVisible === "boolean" &&
        firstProfileModalVisible && (
          <FirstprofileNotification
            title="Welcome to ContentBase"
            onIntentToCreateProfile={closeFirstProfileNotificationModal}
          />
        )}

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

      {/* NOT `first profile` and `WALLET` Account */}
      {!isFirstProfile && accountType === "WALLET" && (
        <>
          {/* Info and spinner */}
          {(uploadingImage || isWriteLoading || isWaitLoading) && (
            <BackdropWithInfo>
              <h6
                className={`text-base text-center ${
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
            <p className="error text-center">
              {uploadImageError ? (
                "Failed to upload the image. Please try again."
              ) : isWriteError ? (
                writeError?.message
              ) : isWaitError ? (
                waitError?.message
              ) : isCreateProfileError ? (
                "Failed to connect to wallet. Please check your wallet and ensure you use the correct network and have enough funds to pay gas fee."
              ) : (
                <>&nbsp;</>
              )}
            </p>
          </div>
        </>
      )}

      {/* All Accounts */}
      {isCreateProfileSuccess && (
        <BackdropWithInfo>
          <h6 className="px-2 mt-2 text-center">
            <span className="text-blueBase">{handle}</span> Profile NFT Minted
          </h6>
          <div className="mt-6 text-center">
            <Link to="/upload">
              <h6
                className="btn-blue w-max mx-auto px-5 py-2 rounded-full mt-6 font-light text-center text-base cursor-pointer"
                onClick={clearForm}
              >
                Start sharing
              </h6>
            </Link>
            <h6
              className="btn-orange w-max mx-auto px-5 py-2 rounded-full mt-6 font-light text-center text-base cursor-pointer"
              onClick={clearForm}
            >
              Create new profile
            </h6>
          </div>
        </BackdropWithInfo>
      )}
    </div>
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
