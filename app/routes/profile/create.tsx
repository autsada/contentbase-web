import { useEffect, useState, useCallback, useMemo } from "react"
import { useDropzone } from "react-dropzone"
import debounce from "lodash/debounce"
import { useFetcher, Link } from "@remix-run/react"
import { MdOutlineCheck } from "react-icons/md"
import { useAccount } from "wagmi"
import { useHydrated } from "remix-utils"
import { json } from "@remix-run/node"
import type { ActionArgs } from "@remix-run/node"
import type { ChangeEvent } from "react"

import { useAccountContext } from "../profile"
import { avatarsStorageFolder, clientAuth } from "~/client/firebase.client"
import { UPLOAD_SERVICE_URL } from "~/constants"
import { createFirstProfile } from "~/graphql/server"
import type { validateActionType } from "./validate-handle"
import { BackdropWithInfo } from "~/components/backdrop-info"
import { Spinner } from "~/components/spinner"

type SelectedFile = File & {
  path: string
  preview: string
}

export async function action({ request }: ActionArgs) {
  try {
    // Get the `idToken` from the request
    const form = await request.formData()
    const { handle, imageURI, owner, idToken } = Object.fromEntries(form) as {
      handle: string
      imageURI?: string
      owner: string
      idToken: string
    }

    // Call create profile function
    await createFirstProfile({ handle, imageURI, owner }, idToken)

    return json({ status: "Ok" })
  } catch (error) {
    console.log("error: ", error)
    return json({ status: "Error" })
  }
}

export default function CreateProfile() {
  const [handle, setHandle] = useState("")
  const [isHandleLenValid, setIsHandleLenValid] = useState<
    boolean | undefined
  >()
  const [file, setFile] = useState<SelectedFile | null>(null)
  const [uploadError, setUploadError] = useState("")
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  const validateFetcher = useFetcher<validateActionType>()
  const isHandleUnique = validateFetcher?.data?.isUnique
  const actionFetcher = useFetcher<typeof action>()
  const actionStatus = actionFetcher?.data?.status
  const hydrated = useHydrated()
  const { isConnected } = useAccount()
  const { account } = useAccountContext()

  // When the button should be disabled
  const disabled =
    !hydrated ||
    !handle ||
    !isHandleLenValid ||
    !isHandleUnique ||
    !file ||
    !!uploadError

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

  const handleValidateHandle = useCallback((handle: string) => {
    if (handle && handle.length < 3) {
      setIsHandleLenValid(false)
      return
    }

    setIsHandleLenValid(true)
    validateFetcher.submit(
      { handle },
      { method: "post", action: "profile/validate-handle" }
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

  /**
   * When the action finished and status Ok, remove error (if any)
   */
  useEffect(() => {
    if (actionStatus && actionStatus === "Ok") {
      if (error) setError("")
    }
  }, [error, actionStatus])

  async function createProfile() {
    try {
      if (!clientAuth || !account) {
        setError("Something not right, please refresh the page and try again")
        return
      }
      const accountType = account.type
      // The owner address
      const address = account.address

      setProcessing(true)
      const user = clientAuth.currentUser
      const idToken = await user?.getIdToken()
      // For some reason, if no idToken or uid from `account` and `user` don't match, we need to log user out and have them to sign in again
      if (!idToken || account.uid !== user?.uid) {
        setProcessing(false)
        actionFetcher.submit(null, {
          method: "post",
          action: "/reauthenticate",
        })
        return
      }

      // Profile image url
      let imageURI: string = ""

      if (file) {
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
      }

      // Check if it is the first profile of the user or not
      const isFirstProfile = account.profiles?.length === 0

      if (isFirstProfile) {
        // Call the `createFirstProfile` mutation in the `Server` service for both `TRADITIONAL` and `WALLET` accounts as the platform will be responsible for the gas fee for users first profiles.
        actionFetcher.submit(
          { handle, imageURI, owner: address, idToken },
          { method: "post" }
        )
      } else {
        // If NOT first prifile, how to create a profile depends on the account type.

        if (accountType === "TRADITIONAL") {
          // A. Call the `Server` service to create a profile
        }

        if (accountType === "WALLET") {
          // B. Connect to the blockchain directly.
        }
      }
    } catch (error) {
      setProcessing(false)
      setError(
        "An error occurred while attempting to create a profile. Please try again."
      )
    }
  }

  /**
   * Reset states so user can create a new profile
   */
  function clearForm() {
    setHandle("")
    setFile(null)
    if (processing) setProcessing(false)
    if (error) setError("")
    if (isHandleLenValid) setIsHandleLenValid(false)
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
                    className="object-cover"
                  />
                )}
              </div>
            </div>
            <p className="font-thin text-textLight italic text-sm mt-4">
              Hint: you can set the profile image later.
            </p>
          </fieldset>
          <p className="error text-end">
            {uploadError ? uploadError : <>&nbsp;</>}
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
      </actionFetcher.Form>
      {error && <p className="error mt-4 px-5 text-center">{error}</p>}

      {/* Show backdrop and progression information */}
      {processing && (
        <BackdropWithInfo>
          {actionStatus === "Ok" || actionStatus === "Error" ? (
            actionStatus === "Ok" ? (
              <>
                <h6 className="text-base px-2 mt-2 text-center">
                  <span className="text-blueBase">{handle}'s</span> Profile
                  Created
                </h6>
                <div className="mt-6 text-center">
                  <Link to="/profile">
                    <h6 className="font-light text-blueBase text-center text-base cursor-pointer">
                      Go to profiles dashboard
                    </h6>
                  </Link>
                  <h6
                    className="mt-4 font-light text-orange-400 text-center text-base cursor-pointer"
                    onClick={clearForm}
                  >
                    Create a new profile
                  </h6>
                </div>
              </>
            ) : actionStatus === "Error" ? (
              <>
                <h6 className="text-base px-2 mt-2 text-center">
                  Create <span className="text-blueBase">{handle}'s</span>{" "}
                  Profile Failed
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
                Creating <span className="text-blueBase">{handle}'s</span>{" "}
                Profile
              </h6>
              <div className="mt-4">
                <Spinner size="sm" />
              </div>
            </>
          )}
        </BackdropWithInfo>
      )}
    </div>
  )
}
