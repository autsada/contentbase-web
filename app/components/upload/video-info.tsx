import { useState, useCallback, useEffect } from "react"
import { Link, useFetcher } from "@remix-run/react"
import { useDropzone } from "react-dropzone"
import {
  MdFileUpload,
  MdOutlineClose,
  MdOutlineKeyboardBackspace,
  MdOutlineWarning,
} from "react-icons/md"
import { IoCaretDownSharp } from "react-icons/io5"
import { toast } from "react-toastify"
import { doc, onSnapshot } from "firebase/firestore"

import { Spinner } from "../spinner"
import { firestore, playbacksCollection } from "~/client/firebase.client"
import { contentCategories } from "~/constants"
import type { SelectedFile } from "~/types"
import type { GetPublishAction } from "~/routes/api/queries/$publishId"

interface Props {
  file?: SelectedFile | null
  goBack: (step: "upload") => void
  closeModal: () => void
  publishId?: number | null
  title?: string
}

export function UploadVideoInfo({
  file,
  goBack,
  closeModal,
  publishId,
  title,
}: Props) {
  const [thumbnail, setThumbnail] = useState<SelectedFile | null>(null)
  const [primaryCat, setPrimaryCat] =
    useState<typeof contentCategories[number]>()
  const [secondaryCat, setSecondaryCat] =
    useState<typeof contentCategories[number]>()
  const [tertiaryCat, setTertiaryCat] =
    useState<typeof contentCategories[number]>()
  const [visibility, setVisibility] = useState<"share" | "draft">("share")

  const getPublishFetcher = useFetcher<GetPublishAction>()
  const publish = getPublishFetcher?.data?.publish

  // TODO: Listen to the playback in Firestore and if the playback is updated, call the `API` service to query the publish.
  useEffect(() => {
    if (typeof document === "undefined" || !publishId) return

    const unsubscribe = onSnapshot(
      doc(firestore, playbacksCollection, `${publishId}`),
      {
        next: (doc) => {
          if (doc.exists()) {
            // Fetch the publish from database
            getPublishFetcher.submit(null, {
              method: "post",
              action: `/api/queries/${publishId}`,
            })
          }
        },
        error: (error) => {
          console.error(error)
        },
      }
    )

    return () => {
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publishId])

  const onDropThumbanil = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0] as SelectedFile

    if (selectedFile.size / 1000 > 2048) {
      // Maximum allowed image size = 2mb
      return
    }
    const fileWithPreview = Object.assign(selectedFile, {
      preview: URL.createObjectURL(selectedFile),
    })

    setThumbnail(fileWithPreview)
  }, [])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    isDragAccept,
  } = useDropzone({
    onDrop: onDropThumbanil,
    accept: {
      "image/*": [],
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

  function onChangeVisibility(e: React.ChangeEvent<HTMLInputElement>) {
    setVisibility(e.target.value as "share" | "draft")
  }

  async function onUpdateDraft() {
    try {
      toast.success("Saving draft and close", { theme: "dark" })
    } catch (error) {}
  }

  //   async function onShare() {
  //     try {
  //       if (visibility === "draft") {
  //         onUpdateDraft()
  //       }
  //     } catch (error) {}
  //   }

  return (
    <div className="absolute z-[10020] inset-0 w-full bg-white rounded-xl flex flex-col h-full max-h-full overflow-y-scroll">
      <div className="w-full h-[50px] min-h-[50px] flex justify-between items-center">
        <div className="w-[60px] h-full flex items-center justify-center">
          <MdOutlineKeyboardBackspace
            size={25}
            className="text-blue-400 cursor-pointer"
            onClick={goBack.bind(undefined, "upload")}
          />
        </div>
        <div className="h-full flex-grow flex items-center justify-start">
          <>&nbsp;</>
        </div>
        <div className="w-[60px] h-full flex items-center justify-center">
          <Link
            to="/content"
            replace={true}
            className="m-0 p-0"
            onClick={closeModal.bind(undefined, onUpdateDraft)}
          >
            <MdOutlineClose
              size={25}
              className="text-textExtraLight cursor-pointer"
            />
          </Link>
        </div>
      </div>

      {true ? (
        <>
          <h6 className="text-center">Video Details</h6>

          <form className="w-full flex-grow px-5 mb-5">
            <div className="w-full text-start mt-5 mb-8">
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
                    defaultValue={title || publish?.title || ""}
                  />
                </label>
              </fieldset>
            </div>

            <div className="w-full text-start mb-8">
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

            <div className="w-full text-start mb-8">
              <fieldset>
                <legend className="font-semibold text-lg text-textDark">
                  Thumbnail
                </legend>
                <label htmlFor="" className="font-light text-textExtraLight">
                  Choose auto generated or upload a custom image.
                </label>
                <div className="mt-2 w-full grid grid-flow-row gap-1 grid-cols-2">
                  <div
                    className={`h-[80px] flex flex-col items-center justify-center bg-gray-50 opacity-60`}
                  >
                    {publish && publish.playback ? (
                      <img
                        src={publish.playback.thumbnail}
                        alt="thumbnail_1"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        <MdOutlineWarning className="text-textRegular" />
                        <p className="text-center font-light text-xs text-textLight">
                          Generating a thumbnail...
                        </p>
                      </>
                    )}
                  </div>
                  <div
                    className="h-[80px] flex flex-col items-center justify-center bg-gray-50"
                    {...getRootProps({
                      isDragActive,
                      isDragReject,
                      isDragAccept,
                    })}
                  >
                    <input {...getInputProps({ multiple: false })} />
                    {thumbnail ? (
                      <img
                        src={thumbnail.preview}
                        alt={thumbnail.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <>
                        <MdFileUpload size={25} />
                        <label className="font-light text-textExtraLight text-sm text-center">
                          Custom thumbnail
                          <p className="text-center">(2MB or less)</p>
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </fieldset>
            </div>

            <div className="w-full text-start mb-8">
              <fieldset>
                <legend className="font-semibold text-lg text-textDark">
                  Category
                </legend>
                <label htmlFor="" className="font-light text-textExtraLight">
                  You can choose up to 3 relevant categories.
                </label>
              </fieldset>
              <div className="mt-3 w-full">
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

            <div className="w-full text-start mb-8">
              <legend className="font-semibold text-lg text-textDark">
                Visibility
              </legend>
              <label htmlFor="" className="font-light text-textExtraLight">
                Share or Save draft.
              </label>
              <fieldset className="px-5">
                <div className="py-2">
                  <label htmlFor="share">
                    <input
                      className="mr-2 appearance-none w-[14px] h-[14px] rounded-full transition-all border-[1px] border-gray-500 checked:border-none checked:bg-orange-500"
                      type="radio"
                      name="share"
                      value="share"
                      checked={visibility === "share"}
                      onChange={onChangeVisibility}
                    />
                    Share
                  </label>
                </div>
                <div className="py-2">
                  <label htmlFor="draft">
                    <input
                      className="mr-2 appearance-none w-[15px] h-[15px] rounded-full transition-all border-[1px] border-gray-500 checked:border-none checked:bg-orange-500"
                      type="radio"
                      name="draft"
                      value="draft"
                      checked={visibility === "draft"}
                      onChange={onChangeVisibility}
                    />
                    Save draft
                  </label>
                </div>
              </fieldset>
            </div>

            <div className="w-full text-start mb-8">
              <fieldset>
                <legend className="font-semibold text-lg text-textDark">
                  Video Playback
                </legend>
                <label htmlFor="" className="font-light text-textExtraLight">
                  You can savely "SHARE" or "SAVE DRAFT" without waiting for the
                  upload to be finished.
                </label>
              </fieldset>
              <div className="relative w-full h-[200px] min-h-[200px] flex items-center justify-center bg-gray-100 mt-4">
                {publish && publish.playback ? (
                  <video
                    controls
                    className="w-full h-full"
                    poster={publish.playback.thumbnail}
                  >
                    <source src={publish.playback.hls} type="video/mp4" />
                    <source src={publish.playback.dash} type="video/oog" />
                  </video>
                ) : file ? (
                  <video controls className="w-full h-full">
                    <source src={file.preview} type="video/mp4" />
                  </video>
                ) : null}

                {(!publish || !publish.playback) && (
                  <div className="absolute inset-0 flex flex-col justify-center items-center bg-white opacity-80">
                    <p className="text-textExtraLight">
                      {publish?.publishURI
                        ? "Transcoding video..."
                        : "Uploading video..."}
                    </p>
                    <div className="absolute">
                      <Spinner color="orange" size="sm" />
                    </div>
                  </div>
                )}
              </div>
              <div className="w-full py-5">
                <div className="pb-2">
                  <p className="font-light text-textExtraLight">
                    Playback link
                  </p>
                  <div className="pb-2">
                    {publishId ? (
                      <a
                        href={` http://localhost:3000/watch/${publishId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-lg text-blueBase"
                      >
                        http://localhost:3000/watch/{publishId}
                      </a>
                    ) : (
                      <p>&nbsp;</p>
                    )}
                  </div>
                </div>
                <div className="pb-2">
                  <p className="font-light text-textExtraLight">Filename</p>
                  <p className="text-lg">
                    {publish && publish.filename ? (
                      publish.filename
                    ) : (
                      <>&nbsp;</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <button className={`btn-orange w-4/5 h-12 mb-10 rounded-full`}>
              {visibility === "share" ? "SHARE" : "SAVE DRAFT"}
            </button>
          </form>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center px-10">
          <p className="error">
            Oops, something went wrong. Please retry upload the video.
          </p>
        </div>
      )}
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
