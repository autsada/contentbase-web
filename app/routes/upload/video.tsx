import { useState, useCallback } from "react"
import { useCatch } from "@remix-run/react"
import { useDropzone } from "react-dropzone"
import { MdFileUpload } from "react-icons/md"
import { IoCaretDownSharp } from "react-icons/io5"

import ErrorComponent from "~/components/error"
import { contentCategories } from "~/constants"
import type { SelectedFile } from "~/types"

export default function UploadVideo() {
  const [videoFile, setVideoFile] = useState<SelectedFile | null>(null)
  const [primaryCat, setPrimaryCat] =
    useState<typeof contentCategories[number]>()
  const [secondaryCat, setSecondaryCat] =
    useState<typeof contentCategories[number]>()
  const [tertiaryCat, setTertiaryCat] =
    useState<typeof contentCategories[number]>()

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

  function handleChangePrimaryCat(e: React.ChangeEvent<HTMLSelectElement>) {
    setPrimaryCat(e.target.value as typeof contentCategories[number])
  }

  function handleChangeSecondaryCat(e: React.ChangeEvent<HTMLSelectElement>) {
    setSecondaryCat(e.target.value as typeof contentCategories[number])
  }

  function handleChangeTertiaryCat(e: React.ChangeEvent<HTMLSelectElement>) {
    setTertiaryCat(e.target.value as typeof contentCategories[number])
  }

  return (
    <div className="page pt-5 px-3">
      <form action="w-full">
        <div
          className={`w-full h-[200px] mb-5 flex flex-col ${
            !videoFile ? "justify-end" : "justify-center"
          } items-center cursor-pointer bg-gray-50`}
          {...getRootProps({
            isDragActive,
            isDragReject,
            isDragAccept,
          })}
        >
          <input {...getInputProps({ multiple: false })} />
          {!videoFile ? (
            <>
              <div className="w-full flex-grow flex items-center justify-center">
                <MdFileUpload size={30} />
              </div>
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
        <div className="w-full text-start mb-5">
          <fieldset className="pl-5 border border-borderGray rounded-md">
            <legend className="font-semibold text-lg text-textDark">
              Title
              <abbr title="This field is mandatory" aria-label="required">
                *
              </abbr>
            </legend>
            <label htmlFor="title">
              <input
                type="text"
                name="title"
                required={true}
                placeholder="Content title"
                className="block w-full h-10 text-lg outline-none placeholder:font-light placeholder:text-textExtraLight placeholder:text-base"
                minLength={1}
                maxLength={100}
              />
            </label>
          </fieldset>
        </div>

        <div className="w-full text-start mb-5">
          <fieldset className="pl-5 border border-borderGray rounded-md">
            <legend className="font-semibold text-lg text-textDark">
              Description
            </legend>
            <label htmlFor="description">
              <textarea
                rows={4}
                name="description"
                placeholder="Content description"
                className="block w-full text-lg outline-none placeholder:font-light placeholder:text-textExtralLight placeholder:text-base"
                maxLength={5000}
              />
            </label>
          </fieldset>
        </div>

        <div className="w-full text-start mb-5">
          <fieldset className="pl-5">
            <legend className="font-semibold text-lg text-textDark">
              Thumbnail
            </legend>
            <label htmlFor="" className="font-light text-textExtraLight">
              If you don't have a thumbnail, it will be auto generated from the
              video.
            </label>
            <div className="mt-2 h-24 w-44 flex flex-col items-center justify-center bg-gray-50">
              <MdFileUpload size={25} />
            </div>
          </fieldset>
        </div>

        <div className="w-full text-start mb-5">
          <fieldset className="pl-5">
            <legend className="font-semibold text-lg text-textDark">
              Category
            </legend>
            <label htmlFor="" className="font-light text-textExtraLight">
              You can choose up to 3 relevant categories.
            </label>
          </fieldset>
          <div className="mt-3 px-5 w-full">
            <fieldset className="relative pl-5 border border-borderGray rounded-md mb-3">
              <legend className="font-normal text-base">
                Primary Category
                <abbr title="This field is mandatory" aria-label="required">
                  *
                </abbr>
              </legend>
              <CategorySelect
                name="primary"
                preSelectOption="Primary category is mandatory"
                value={primaryCat}
                handleSelect={handleChangePrimaryCat}
                options={contentCategories}
              />
            </fieldset>

            {primaryCat && (
              <fieldset className="relative pl-5 border border-borderGray rounded-md mb-3">
                <legend className="font-normal text-base">
                  Secondary Category
                </legend>
                <CategorySelect
                  name="secondary"
                  preSelectOption="Secondary category is optional"
                  value={secondaryCat}
                  handleSelect={handleChangeSecondaryCat}
                  options={contentCategories.filter(
                    (cat) => cat !== primaryCat
                  )}
                />
              </fieldset>
            )}

            {primaryCat && secondaryCat && (
              <fieldset className="relative pl-5 border border-borderGray rounded-md mb-3">
                <legend className="font-normal text-base">
                  Tertiary Category
                </legend>
                <CategorySelect
                  name="Tertiary"
                  preSelectOption="Tertiary category is optional"
                  value={tertiaryCat}
                  handleSelect={handleChangeTertiaryCat}
                  options={contentCategories.filter(
                    (cat) => cat !== primaryCat && cat !== secondaryCat
                  )}
                />
              </fieldset>
            )}
          </div>
        </div>

        <div className="mt-10 px-5">
          <button className="btn-orange w-full h-12 rounded-full">SHARE</button>
        </div>
      </form>
    </div>
  )
}

function CategorySelect({
  name,
  preSelectOption,
  value,
  handleSelect,
  options,
}: {
  name: string
  preSelectOption: string
  value: typeof contentCategories[number] | undefined
  handleSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: typeof contentCategories | typeof contentCategories[number][]
}) {
  return (
    <>
      <select
        name={name}
        className="relative z-10 w-full py-2 bg-transparent text-lg text-textExtraLight appearance-none outline-none focus:outline-none cursor-pointer"
        value={value}
        onChange={handleSelect}
      >
        <option value="">{preSelectOption}</option>
        {options.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <div className="absolute z-0 top-0 right-2 h-full flex flex-col justify-center">
        <IoCaretDownSharp />
      </div>
    </>
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
