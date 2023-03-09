import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { Link, useFetcher } from "@remix-run/react"
import { useDropzone } from "react-dropzone"
import { MdFileUpload, MdOutlineClose, MdOutlineWarning } from "react-icons/md"
import { IoCaretDownSharp, IoTrashOutline } from "react-icons/io5"
import { RxDotsVertical } from "react-icons/rx"
import { toast } from "react-toastify"
import { doc, onSnapshot } from "firebase/firestore"
import _ from "lodash"

import { Backdrop } from "../backdrop"
import { Spinner } from "../spinner"
import { ConfirmModal } from "../confirm-modal"
import {
  clientAuth,
  firestore,
  playbacksCollection,
} from "~/client/firebase.client"
import { contentCategories } from "~/constants"
import type {
  Publish,
  PublishCategory,
  SelectedFile,
  ThumbSource,
} from "~/types"
import { uploadThumbnail } from "~/utils/upload-apis"
import type { GetPublishAction } from "~/routes/api/queries/$publishId"
import type { EstimateGasCreatePublishAction } from "~/routes/dashboard/estimate-publish"
import type { CreatePublishNFTAction } from "~/routes/dashboard/create-nft"
import type { UpdatePublishAction } from "~/routes/dashboard/update-publish"

interface Props {
  handle: string
  file?: SelectedFile | null
  goBack: (step: "upload") => void
  closeModal: (cb?: () => void) => void
  publishId?: number | null
  defaultTitle?: string
  selectedPublish?: Publish // This prop will be available when user open the info modal from one of their saved publishes
}

export function UploadVideoInfo({
  handle,
  file,
  goBack,
  closeModal,
  publishId,
  defaultTitle,
  selectedPublish,
}: Props) {
  const getPublishFetcher = useFetcher<GetPublishAction>()
  // A publish to display
  const publish = (getPublishFetcher?.data?.publish ||
    selectedPublish) as Publish
  const updatePublishFetcher = useFetcher<UpdatePublishAction>()
  const estimateGasFetcher = useFetcher<EstimateGasCreatePublishAction>()
  const createPublishNFTFetcher = useFetcher<CreatePublishNFTAction>()

  const [title, setTitle] = useState<string | undefined>(
    () => publish?.title || defaultTitle
  )
  const [description, setDescription] = useState<string | undefined>(
    () => publish?.description || undefined
  )
  const [thumbnail, setThumbnail] = useState<SelectedFile | null>(null)
  const [isThumbnailError, setIsThumbnailError] = useState(false)
  // Use this state for user to confirm if they really want to upload a new thumbnail
  const [isRequestToChangeThumbnail, setIsRequestToChangeThumbnail] =
    useState(false)
  // Use this state to open upload dialog
  const [isIntentToChangeThumbnail, setIsIntentToChangeThumbnail] =
    useState<boolean>()
  // This state will make user be able to switch between uploaded custom thumbnail and the auto generated one.
  const [thumbSource, setThumbSource] = useState<ThumbSource | undefined>(() =>
    publish
      ? publish.thumbSource ||
        (publish?.playback?.thumbnail ? "generated" : undefined)
      : undefined
  )
  const [primaryCategory, setPrimaryCategory] = useState<
    PublishCategory | undefined
  >(() => publish?.primaryCategory || undefined)
  const [secondaryCategory, setSecondaryCategory] = useState<
    PublishCategory | undefined
  >(() => publish?.secondaryCategory || undefined)
  const [visibility, setVisibility] = useState<"share" | "draft">(() =>
    publish?.isPublic ? "share" : "draft"
  )
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)

  // When user intents to upload a new thumbnail, under the hood we will click this div
  const uploadRef = useRef<HTMLDivElement>(null)

  // Check if user updates the publish, if so we need to update the publish in the database.
  // Use undefined for falsy values
  const oldData = useMemo(
    () => ({
      title: publish?.title ?? undefined,
      description: publish?.description ?? undefined,
      primaryCategory: publish?.primaryCategory ?? undefined,
      secondaryCategory: publish?.secondaryCategory ?? undefined,
      isPublic: publish?.isPublic,
      thumbSource:
        publish?.thumbSource ||
        (publish?.playback?.thumbnail ? "generated" : undefined),
    }),
    [
      publish?.title,
      publish?.description,
      publish?.primaryCategory,
      publish?.secondaryCategory,
      publish?.isPublic,
      publish?.thumbSource,
      publish?.playback?.thumbnail,
    ]
  )
  const newData = useMemo(
    () => ({
      title: title ?? publish?.title ?? undefined,
      description: description ?? undefined,
      primaryCategory,
      secondaryCategory,
      isPublic: visibility === "share",
      thumbSource,
    }),
    [
      title,
      publish?.title,
      description,
      primaryCategory,
      secondaryCategory,
      visibility,
      thumbSource,
    ]
  )
  const isDataChanged = useMemo(
    () => !_.isEqual(oldData, newData),
    [oldData, newData]
  )
  const isVisibilityChanged = useMemo(
    () => !_.isEqual(oldData.isPublic, newData.isPublic),
    [oldData.isPublic, newData.isPublic]
  )

  // Listen to the playback in Firestore and if the playback is updated, call the `API` service to query the publish.
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
      setIsThumbnailError(true)
      return
    }
    const fileWithPreview = Object.assign(selectedFile, {
      preview: URL.createObjectURL(selectedFile),
    })

    setIsThumbnailError(false)
    setThumbnail(fileWithPreview)
    setThumbSource("custom")
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

  const handleChangeTitle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value)
    },
    []
  )

  const handleChangeDescription = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(e.target.value)
    },
    []
  )

  // A function to switch between a generated and a custom thumbnail
  const selectThumbnail = useCallback(
    (s: "generated" | "custom") => {
      setThumbSource(s)
      if (isRequestToChangeThumbnail && s === "generated")
        setIsRequestToChangeThumbnail(false)
    },
    [isRequestToChangeThumbnail]
  )

  const onRequestToChangeThumbnail = useCallback((r: boolean) => {
    setIsRequestToChangeThumbnail(r)
    if (!r) setIsIntentToChangeThumbnail(false)
  }, [])

  const onConfirmToChangeThumbnail = useCallback((c: boolean) => {
    setIsIntentToChangeThumbnail(c)
  }, [])

  const clearThumbnailFile = useCallback(() => {
    setThumbnail(null)
    setIsRequestToChangeThumbnail(false)
    setIsIntentToChangeThumbnail(false)
  }, [])

  // When user click to change image, click the upload ref to open the upload dialog as user will not click the upload box directly
  useEffect(() => {
    if (
      isRequestToChangeThumbnail &&
      isIntentToChangeThumbnail &&
      uploadRef?.current
    ) {
      uploadRef.current.click()
    }
  }, [isRequestToChangeThumbnail, isIntentToChangeThumbnail])

  const handleChangePrimaryCat = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPrimaryCategory(e.target.value as typeof contentCategories[number])
    },
    []
  )

  const handleChangeSecondaryCat = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSecondaryCategory(e.target.value as typeof contentCategories[number])
    },
    []
  )

  const onChangeVisibility = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVisibility(e.target.value as "share" | "draft")
    },
    []
  )

  async function savePublishDetails(idToken: string, publishId: number) {
    // Only send the data that has been changed
    let updatedData: Record<string, any> = {}
    if (!_.isEqual(oldData.title, newData.title)) {
      updatedData.title = newData.title || ""
    }
    if (!_.isEqual(oldData.description, newData.description)) {
      updatedData.description = newData.description || ""
    }
    if (!_.isEqual(oldData.primaryCategory, newData.primaryCategory)) {
      updatedData.primaryCategory = newData.primaryCategory || ""
    }
    if (!_.isEqual(oldData.secondaryCategory, newData.secondaryCategory)) {
      updatedData.secondaryCategory = newData.secondaryCategory || ""
    }
    if (!_.isEqual(oldData.isPublic, newData.isPublic)) {
      updatedData.isPublic = newData.isPublic
    }
    if (!_.isEqual(oldData.thumbSource, newData.thumbSource)) {
      updatedData.thumbSource = newData.thumbSource || ""
    }

    // If user update data or use a custom thumbnail, update the publish
    updatePublishFetcher.submit(
      {
        handle,
        idToken,
        publishId: publishId.toString(),
        ...updatedData,
      },
      { method: "post", action: "/dashboard/update-publish" }
    )
    toast.success("Saving draft and close", { theme: "dark" })
  }

  /**
   * The logic when user closes a modal
   */
  async function onCloseModal() {
    try {
      if (!publish || !clientAuth) return

      // Get user's id token
      const user = clientAuth.currentUser
      const idToken = await user?.getIdToken()

      // At this point we should have id token as we will force user to reauthenticate if they don't earlier since they enter the dashboard page.
      if (!idToken) return

      savePublish(idToken, publish.id)
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * The logic to update the publish
   * Compose of 2 steps:
   * 1. Upload a thumbnail if user upload a new custom thumbnail
   * 2. Update the publish details in database
   */
  async function savePublish(idToken: string, publishId: number) {
    try {
      // If user uploads a thumbnail, upload thumbnail without waiting
      if (thumbnail) {
        uploadThumbnail({
          idToken,
          file: thumbnail,
          handle,
          publishId,
        })
      }

      // Save the publish
      if (isDataChanged) {
        savePublishDetails(idToken, publishId)
      }

      // Before closing reset `step` to `upload` so user can start upload again
      goBack("upload")
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Use this function when the publish visibility isn't changed but other values
   */
  async function onUpdatePublish() {
    try {
      if (!publish || !clientAuth) return

      // Get user's id token
      const user = clientAuth.currentUser
      const idToken = await user?.getIdToken()

      // At this point we should have id token as we will force user to reauthenticate if they don't earlier since they enter the dashboard page.
      if (!idToken) return

      // Update the publish
      savePublish(idToken, publish.id)
    } catch (error) {
      console.error(error)
    }
  }

  /**
   * Use this function when a publish visibility changed.
   * This function will mint a pubish NFT for the first time user sets the publish to public.
   */
  async function onRequestToChangeVisibility() {
    try {
      if (!publish || !clientAuth) return

      // Get user's id token
      const user = clientAuth.currentUser
      const idToken = await user?.getIdToken()

      // At this point we should have id token as we will force user to reauthenticate if they don't earlier since they enter the dashboard page.
      if (!idToken) return

      // We have 2 cases - visibility is `Public` or `Private`
      // For both cases, we will update the publish in the database
      // For `Public` case, if it is the first time user sets the publish to `Public` (we call it `Share` the publish) we will need to 1. mint a publish NFT, and 2. update the publish in the database

      if (visibility === "share" && !publish?.tokenId) {
        // This is the first time user make the publish `Public` so they will need to mint a publish NFT first, we will have one more step for user to confirm if they really need to do that as they will need to pay some gas fee.
        // So we will inform them an estimated gas fee and have them make a final decision.

        // At this point the publish must already have a metadata uri
        if (!publish.metadataURI) return
        // Inform user an estimate gas fee and ask them to confirm
        estimateGasFetcher.submit(
          { idToken, metadataURI: publish.metadataURI },
          { method: "post", action: "/dashboard/estimate-publish" }
        )
      }

      setConfirmModalVisible(true)
    } catch (error) {
      console.error(error)
    }
  }

  async function onConfirmChangeVisibility() {
    try {
      if (!publish || !clientAuth) return

      // Get user's id token
      const user = clientAuth.currentUser
      const idToken = await user?.getIdToken()

      // At this point we should have id token as we will force user to reauthenticate if they don't earlier since they enter the dashboard page.
      if (!idToken) return

      // Mint a publish NFT for the first time user set the publish to `Public`
      if (visibility === "share" && !publish?.tokenId) {
        // The publish must have metadata uri
        if (!publish.metadataURI) return
        createPublishNFTFetcher.submit(
          { idToken, metadataURI: publish.metadataURI },
          { method: "post", action: "/dashboard/create-nft" }
        )
      }

      // Close confirm modal
      setConfirmModalVisible(false)

      // Update the publish details
      savePublish(idToken, publish.id)
    } catch (error) {
      console.error(error)
    }
  }

  // Set all states to original when user cancel changes
  const undoChanges = useCallback(() => {
    if (thumbnail) setThumbnail(null)

    if (!_.isEqual(oldData.thumbSource, newData.thumbSource)) {
      setThumbSource(oldData.thumbSource)
    }
    if (!_.isEqual(oldData.title, newData.title)) {
      setTitle(oldData.title)
    }
    if (!_.isEqual(oldData.description, newData.description)) {
      setDescription(oldData.description)
    }
    if (!_.isEqual(oldData.primaryCategory, newData.primaryCategory)) {
      setPrimaryCategory(oldData.primaryCategory)
    }
    if (!_.isEqual(oldData.secondaryCategory, newData.secondaryCategory)) {
      setSecondaryCategory(oldData.secondaryCategory)
    }
    if (!_.isEqual(oldData.isPublic, newData.isPublic)) {
      setVisibility(oldData.isPublic ? "share" : "draft")
    }
    if (isRequestToChangeThumbnail) setIsIntentToChangeThumbnail(false)
    if (isIntentToChangeThumbnail) setIsIntentToChangeThumbnail(false)
  }, [
    thumbnail,
    oldData,
    newData,
    isRequestToChangeThumbnail,
    isIntentToChangeThumbnail,
  ])

  const onCancelChangeVisibility = useCallback(() => {
    setConfirmModalVisible(false)
    undoChanges()
  }, [undoChanges])

  return (
    <div className="absolute z-[10020] inset-0 w-full bg-white rounded-xl flex flex-col h-full max-h-full overflow-y-scroll">
      <div className="relative">
        <div className="w-full h-[50px] min-h-[50px] flex justify-between items-center">
          <div className="h-full pl-5 flex items-center justify-center">
            {isDataChanged || thumbnail ? (
              <button
                className="font-semibold text-blueBase cursor-pointer"
                onClick={undoChanges}
              >
                Undo changes
              </button>
            ) : (
              <>&nbsp;</>
            )}
          </div>
          <div className="h-full flex-grow flex items-center justify-start">
            <>&nbsp;</>
          </div>
          <div className="w-[60px] h-full flex items-center justify-center">
            <Link
              to="/dashboard"
              replace={true}
              preventScrollReset={true}
              className="m-0 p-0"
              // If user changes the visibility and they close the modal, we need to have them confirm if they want to save the changes.
              onClick={
                isVisibilityChanged
                  ? onRequestToChangeVisibility
                  : closeModal.bind(undefined, onCloseModal)
              }
            >
              <MdOutlineClose
                size={25}
                className="text-textExtraLight cursor-pointer"
              />
            </Link>
          </div>
        </div>

        {(publish && publish.isUploadingError) ||
        !publish ||
        !publish.metadataURI ? (
          <div className="w-full h-full flex items-center justify-center px-10">
            <p className="error">
              Oops, something went wrong. Please retry upload the video.
            </p>
          </div>
        ) : (
          <>
            <h6 className="text-center">Video Details</h6>

            <updatePublishFetcher.Form
              className="w-full flex-grow px-5 mb-5"
              onSubmit={
                isVisibilityChanged
                  ? onRequestToChangeVisibility
                  : closeModal.bind(undefined, onUpdatePublish)
              }
            >
              <div className="relative w-full text-start mt-5 mb-8">
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
                      value={title}
                      onChange={handleChangeTitle}
                    />
                  </label>
                </fieldset>
                <span className="absolute left-5 -bottom-5 error">
                  {visibility === "share" && !title && "Title must be set"}
                </span>
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
                      value={description}
                      onChange={handleChangeDescription}
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
                  <div className="mt-2 w-full grid grid-flow-row gap-1 grid-cols-2 relative">
                    <div className={"h-[100px]"}>
                      <div
                        className={`h-full w-full flex flex-col items-center justify-center bg-gray-50 cursor-pointer ${
                          thumbSource === "generated"
                            ? "opacity-100 border-[3px] border-orange-600"
                            : "opacity-60 border-[3px] border-transparent"
                        }`}
                        onClick={
                          !publish || !publish.playback
                            ? undefined
                            : selectThumbnail.bind(undoChanges, "generated")
                        }
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
                    </div>

                    {/* We need a relative wrapper div for use to absolute position the three dots and a dialog for user to click to confirm upload.  */}
                    <div className="relative h-[100px] flex items-center justify-center">
                      <div
                        className="h-full w-full flex items-center justify-center relative"
                        {...(!publish?.thumbnail || isRequestToChangeThumbnail
                          ? {
                              ...(thumbnail
                                ? {}
                                : getRootProps({
                                    isDragActive,
                                    isDragReject,
                                    isDragAccept,
                                  })),
                            }
                          : {})}
                      >
                        <div
                          ref={uploadRef}
                          className={`h-full w-full flex flex-col items-center justify-center bg-gray-50 cursor-pointer relative ${
                            thumbSource === "custom"
                              ? "opacity-100 border-[3px] border-orange-600"
                              : "opacity-60 border-[3px] border-transparent"
                          }`}
                          onClick={
                            !thumbnail && !publish?.thumbnail
                              ? undefined
                              : selectThumbnail.bind(undoChanges, "custom")
                          }
                        >
                          {(!publish?.thumbnail ||
                            isRequestToChangeThumbnail) && (
                            <input {...getInputProps({ multiple: false })} />
                          )}
                          {thumbnail ? (
                            <>
                              <img
                                src={thumbnail.preview}
                                alt={thumbnail.name}
                                className="w-full h-full object-cover"
                              />
                              <div
                                className="absolute right-[3px] top-[3px] p-[2px] bg-white rounded-sm cursor-pointer"
                                onClick={clearThumbnailFile}
                              >
                                <IoTrashOutline size={22} className="error" />
                              </div>
                            </>
                          ) : publish?.thumbnail ? (
                            <>
                              <img
                                src={publish.thumbnail}
                                alt={publish.title || ""}
                                className="w-full h-full object-cover"
                              />
                            </>
                          ) : (
                            <>
                              <MdFileUpload size={25} />
                              <label className="font-light text-textExtraLight text-sm text-center">
                                Custom thumbnail
                                <p className="text-center">(2MB or less)</p>
                              </label>
                              {isThumbnailError && (
                                <span className="absolute bottom-0 error text-center">
                                  File too big.
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* To allow user to open upload box to change the thumbnail */}
                      <>
                        {/* These 3 dots will allow user to click to request to upload a new custom thumbnail */}
                        {publish?.thumbnail && !thumbnail && (
                          <div
                            className="absolute right-[3px] top-[3px] p-[2px] bg-white rounded-[4px] cursor-pointer"
                            onClick={onRequestToChangeThumbnail.bind(
                              undefined,
                              !isRequestToChangeThumbnail
                            )}
                          >
                            <RxDotsVertical size={22} />
                          </div>
                        )}

                        {/* Use this div to allow user to open the upload dialog */}
                        {isRequestToChangeThumbnail && !thumbnail && (
                          <div
                            className="absolute py-2 px-4 bg-white rounded-md cursor-pointer"
                            onClick={onConfirmToChangeThumbnail.bind(
                              undefined,
                              true
                            )}
                          >
                            Change?
                          </div>
                        )}
                      </>
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
                <div className="relative mt-3 w-full">
                  <fieldset className="relative pl-5 border border-borderGray rounded-md">
                    <legend className="font-normal text-base">
                      Primary Category
                      <abbr
                        title="This field is mandatory"
                        aria-label="required"
                      >
                        *
                      </abbr>
                    </legend>
                    <CategorySelect
                      name="primary"
                      preSelectOption="Primary category is mandatory"
                      value={primaryCategory}
                      handleSelect={handleChangePrimaryCat}
                      options={contentCategories}
                    />
                  </fieldset>
                  <span className="error absolute left-5 -bottom-5">
                    {visibility === "share" &&
                      !primaryCategory &&
                      "Primary category must be set"}
                  </span>

                  {primaryCategory && (
                    <fieldset className="relative pl-5 border border-borderGray rounded-md mb-3">
                      <legend className="font-normal text-base">
                        Secondary Category
                      </legend>
                      <CategorySelect
                        name="secondary"
                        preSelectOption="Secondary category is optional"
                        value={secondaryCategory}
                        handleSelect={handleChangeSecondaryCat}
                        options={contentCategories.filter(
                          (cat) => cat !== primaryCategory
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
                  {publish?.tokenId
                    ? "Public or Private"
                    : "Share or Save draft."}
                </label>
                <fieldset className="px-5">
                  <div className="py-2">
                    <label htmlFor="share">
                      <input
                        className="mr-2 appearance-none w-[14px] h-[14px] rounded-full transition-all border-[1px] border-gray-500 checked:border-none checked:bg-orange-500 cursor-pointer"
                        type="radio"
                        name="share"
                        value="share"
                        checked={visibility === "share"}
                        onChange={onChangeVisibility}
                      />
                      {publish?.tokenId ? "Public" : "Share"}
                    </label>
                  </div>
                  <div className="py-2">
                    <label htmlFor="draft">
                      <input
                        className="mr-2 appearance-none w-[15px] h-[15px] rounded-full transition-all border-[1px] border-gray-500 checked:border-none checked:bg-orange-500 cursor-pointer"
                        type="radio"
                        name="draft"
                        value="draft"
                        checked={visibility === "draft"}
                        onChange={onChangeVisibility}
                      />
                      {publish?.tokenId ? "Private" : "Save draft"}
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
                    You can savely "SHARE" or "SAVE DRAFT" without waiting for
                    the upload to be finished.
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

              {visibility === "share" ? (
                <button
                  type="submit"
                  className={`btn-orange w-4/5 h-12 mb-10 rounded-full ${
                    (
                      publish?.tokenId
                        ? !isDataChanged
                        : !title || !primaryCategory
                    )
                      ? "opacity-30 cursor-not-allowed"
                      : "opacity-100"
                  }`}
                  disabled={
                    publish?.tokenId
                      ? !isDataChanged
                      : !title || !primaryCategory
                  }
                >
                  {publish?.tokenId ? "SAVE" : "SHARE"}
                </button>
              ) : (
                <button
                  type="submit"
                  className={`btn-orange w-4/5 h-12 mb-10 rounded-full ${
                    !isDataChanged && !thumbnail
                      ? "opacity-30 cursor-not-allowed"
                      : "opacity-100"
                  }`}
                  disabled={!isDataChanged && !thumbnail}
                >
                  {publish?.tokenId ? "SAVE" : "SAVE DRAFT"}
                </button>
              )}
            </updatePublishFetcher.Form>
          </>
        )}

        {/* Show spinner when the data is not ready yet */}
        {(!publishId || !publish) && (
          <Backdrop bgWhite={true} withSpinner={true} />
        )}

        {/* Show confirm modal when user updates the visibility */}
        <ConfirmModal
          title="Do you want to continue?"
          visible={confirmModalVisible}
          onCancel={onCancelChangeVisibility}
          onConfirm={closeModal.bind(undefined, onConfirmChangeVisibility)}
        >
          <div>
            {publish?.tokenId ? (
              <p>
                This will make the publish{" "}
                {visibility === "share" ? "visible to PUBLIC" : "PRIVATE"}.
              </p>
            ) : (
              <>
                {estimateGasFetcher?.data?.gas && (
                  <>
                    <p>
                      You are going to mint a publish NFT in order to share the
                      publish.
                    </p>
                    <span>
                      You will pay gas fee for about:{" "}
                      {estimateGasFetcher?.data?.gas} ETH
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </ConfirmModal>
      </div>
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
