import { useDropzone } from "react-dropzone"
import { MdFileUpload } from "react-icons/md"

import type { SelectedFile } from "~/types"

interface Props {
  isPreparingError: boolean | undefined
  file: SelectedFile | null
  onDropFile: (acceptedFiles: File[]) => void
  onNext: () => void
  publishId?: number | null
}

export function UploadVideoContent({
  isPreparingError,
  file,
  onDropFile,
  onNext,
  publishId,
}: Props) {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    isDragAccept,
  } = useDropzone({
    onDrop: onDropFile,
    accept: {
      "video/*": [],
    },
  })

  return (
    <div className="w-full h-full flex flex-col">
      <h6 className="text-center mb-5">Upload a Video File</h6>

      <div
        className={
          "relative flex-grow w-full mb-5 flex flex-col justify-center items-center cursor-pointer bg-gray-50"
        }
        {...getRootProps({
          isDragActive,
          isDragReject,
          isDragAccept,
        })}
      >
        <input {...getInputProps({ multiple: false })} />
        {!file ? (
          <>
            <MdFileUpload size={30} className="mb-5" />
            <h6 className="px-4 text-base text-center">
              Drag and drop a video file to upload
            </h6>
            <p className="mb-2 px-4 font-light text-center text-textExtraLight">
              Your video is invisible to the public until you share it.
            </p>
          </>
        ) : (
          <div className="w-full h-[240px]">
            <video controls className="w-full h-full">
              <source src={file.preview} />
            </video>
          </div>
        )}

        {isPreparingError && (
          <div className="absolute inset-0 bg-white opacity-90 flex flex-col justify-center px-10">
            <p className="error">
              An error occurred while preparing to upload the file, please close
              this page and try again.
            </p>
          </div>
        )}
      </div>

      <div className="h-12 w-full mb-10">
        {file && !isPreparingError ? (
          <button
            className={`btn-orange w-4/5 h-full rounded-full ${
              !publishId ? "opacity-50" : "opacity-100"
            }`}
            disabled={!file || !publishId}
            onClick={onNext}
          >
            {!publishId ? "PREPARING..." : "NEXT"}
          </button>
        ) : (
          <>&nbsp;</>
        )}
      </div>
    </div>
  )
}
