import { useEffect, useState, useCallback, useMemo } from "react"
import type { ChangeEvent } from "react"
import { useDropzone } from "react-dropzone"
import debounce from "lodash/debounce"
import { useFetcher } from "@remix-run/react"
import { MdOutlineCheck } from "react-icons/md"

import type { validateActionType } from "./validate-handle"

type SelectedFile = File & {
  path: string
  preview: string
}

export default function CreateProfile() {
  const [handle, setHandle] = useState("")
  const [isHandleLenValid, setIsHandleLenValid] = useState<
    boolean | undefined
  >()

  const [file, setFile] = useState<SelectedFile | null>(null)
  const [uploadError, setUploadError] = useState("File too big")

  const fetcher = useFetcher<validateActionType>()
  const isHandleUnique = fetcher?.data?.isUnique

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
    fetcher.submit(
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

  return (
    <div className="page p-4 text-start">
      <fetcher.Form className="px-5">
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
              "Handle taken"
            ) : (
              <>&nbsp;</>
            )}
          </p>
        </div>

        <div className="mb-5">
          <fieldset className="border border-borderDarkGray px-4 py-4 rounded-md bg-white">
            <legend className="text-textExtraLight px-1">Image</legend>
            <p className="block w-full pl-1 font-light text-blue-400 text-sm">
              Your profile image
            </p>
            <div className="w-[150px] h-[150px] mx-auto border border-borderLightGray">
              <div
                className="w-full h-full rounded-full bg-gray-100 overflow-hidden"
                {...getRootProps({ isDragActive, isDragReject, isDragAccept })}
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

        <button type="submit" className="btn-dark w-40 rounded-full">
          Create Profile
        </button>
      </fetcher.Form>
    </div>
  )
}
