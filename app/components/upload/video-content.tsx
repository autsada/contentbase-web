import { useState, useCallback } from "react"
import { Link } from "@remix-run/react"
import { useDropzone } from "react-dropzone"
import { MdFileUpload } from "react-icons/md"

import type { SelectedFile } from "~/types"
import { Backdrop } from "../backdrop"

interface Props {
  openModal: (open: boolean) => void
}

export function UploadVideoContent({ openModal }: Props) {
  const [videoFile, setVideoFile] = useState<SelectedFile | null>(null)

  const onDropVideo = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0] as SelectedFile

      if (selectedFile.size / 1000 > 51200) {
        // Maximum allowed image size = 50mb
        return
      }

      const fileWithPreview = Object.assign(selectedFile, {
        preview: URL.createObjectURL(selectedFile),
      })

      setVideoFile(fileWithPreview)
    },
    [setVideoFile]
  )

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    isDragAccept,
  } = useDropzone({
    onDrop: onDropVideo,
    accept: {
      "video/*": [],
    },
  })

  return (
    <div className="fixed z-[10010] inset-0 py-5 px-2">
      <Backdrop />
      <form className="relative z-[10010] w-full bg-white pt-8 pb-5 px-5 rounded-xl flex flex-col h-full max-h-full overflow-y-scroll">
        <Link to="/content" replace={true}>
          <button
            className="absolute top-3 right-6 text-lg text-textLight"
            onClick={openModal.bind(undefined, false)}
          >
            &#10005;
          </button>
        </Link>

        <h6 className="text-center mb-5">Upload Video</h6>

        <div
          className={
            "flex-grow w-full mb-5 flex flex-col justify-center items-center cursor-pointer bg-gray-50"
          }
          {...getRootProps({
            isDragActive,
            isDragReject,
            isDragAccept,
          })}
        >
          <input {...getInputProps({ multiple: false })} />
          {!videoFile ? (
            <>
              <MdFileUpload size={30} className="mb-5" />
              <h6 className="px-2 text-base text-center">
                Drag and drop a video file to upload
              </h6>
              <p className="mb-2 px-2 font-light text-center text-textExtraLight">
                Your video is invisible to the public until you share it.
              </p>
            </>
          ) : (
            <p>Uploaded</p>
          )}
        </div>
      </form>
    </div>
  )
}
