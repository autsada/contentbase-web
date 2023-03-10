import { MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md"

import { getTextExcerpt, secondsToHourFormat } from "~/utils"
import type { Publish } from "~/types"
import { useDashboardContext } from "~/routes/dashboard"

interface Props {
  publish: Publish
}

export function PublishItem({ publish }: Props) {
  const {
    displayPublish,
    deletingId,
    isDeleting,
    showDeleteError,
    setShowDeleteError,
  } = useDashboardContext()

  return (
    <div className="relative w-full h-[100px]">
      <div
        className="relative w-full h-full grid grid-cols-5 mb-2 border-b border-b-gray-100 cursor-pointer"
        onClick={displayPublish.bind(undefined, publish?.id)}
      >
        <div className="h-full col-span-2 flex flex-col items-center justify-center">
          <div className="relative z-10 w-4/5 h-[70px] flex items-center justify-center border-0 bg-black">
            <img
              src={
                publish?.thumbSource === "custom" && publish?.thumbnail
                  ? publish?.thumbnail
                  : publish?.playback?.thumbnail
              }
              alt={publish?.title || ""}
              className="w-full h-full object-cover"
            />

            {publish?.playback?.duration && (
              <span className="absolute bottom-[1px] right-[2px] p-0 text-white text-xs">
                {secondsToHourFormat(publish.playback.duration)}
              </span>
            )}
          </div>
          <p className="text-sm mt-1">
            {getTextExcerpt(publish?.title || "title", 16)}
          </p>
        </div>
        <div className="h-full flex flex-col items-center justify-center">
          {publish?.isPublic ? (
            <MdOutlineVisibility className="text-green-500" />
          ) : publish?.tokenId ? (
            <MdOutlineVisibilityOff />
          ) : (
            <span className="mt-1 text-sm text-textExtraLight">Draft</span>
          )}
        </div>
        <div className="h-full flex items-center justify-center">
          <span className="text-sm text-textExtraLight">
            {new Date(publish?.createdAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="h-full flex items-center justify-center">
          {publish?.tokenId ? (
            <span className="text-sm text-textExtraLight">
              {publish?.likesCount}
            </span>
          ) : (
            <button className="font-semibold text-sm text-orange-600">
              Edit
            </button>
          )}
        </div>
      </div>
      {/* This for closing the error mask */}
      {publish?.id === deletingId && showDeleteError && !isDeleting && (
        <div className="absolute z-30 inset-0 flex flex-col items-center justify-center bg-white opacity-90">
          <span
            className="absolute top-0 right-2 p-2 text-xs cursor-pointer"
            onClick={setShowDeleteError.bind(undefined, false)}
          >
            &#9587;
          </span>
          <span className="error">
            Error occurred while attempting to delete the publish
          </span>
        </div>
      )}

      {deletingId === publish?.id && isDeleting && (
        <div className="absolute z-30 inset-0 flex items-center justify-center bg-white opacity-90">
          <span className="error">
            Deleting the publish, you can savely leave this screen.
          </span>
        </div>
      )}
    </div>
  )
}
