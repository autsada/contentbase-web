import { MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md"

import { getTextExcerpt, secondsToHourFormat } from "~/utils"
import type { Publish } from "~/types"

interface Props {
  publish: Publish
  selectPublish: (id: number) => void
}

export function PublishItem({ publish, selectPublish }: Props) {
  return (
    <div
      className="h-[100px] grid grid-cols-5 mb-2 border-b border-b-gray-100"
      onClick={selectPublish.bind(undefined, publish?.id)}
    >
      <div className="h-full col-span-2 flex flex-col items-center justify-center">
        <div className="relative w-4/5 h-[70px] flex items-center justify-center border-0 bg-black">
          <img
            src={publish.playback?.thumbnail}
            alt={publish.title || ""}
            className="w-full h-full object-contain"
          />

          {publish.playback?.duration && (
            <span className="absolute bottom-[1px] right-[2px] p-0 text-white text-xs">
              {secondsToHourFormat(publish.playback.duration)}
            </span>
          )}
        </div>
        <p className="text-sm mt-1">
          {getTextExcerpt(publish.title || "title", 16)}
        </p>
      </div>
      <div className="h-full flex flex-col items-center justify-center">
        {publish.isPublic ? (
          <>
            <MdOutlineVisibility />
            <span className="mt-1 text-sm text-textExtraLight">Public</span>
          </>
        ) : (
          <>
            <MdOutlineVisibilityOff />
            <span className="mt-1 text-sm text-textExtraLight">Draft</span>
          </>
        )}
      </div>
      <div className="h-full flex items-center justify-center">
        <span className="text-sm text-textExtraLight">
          {new Date(publish.createdAt).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      <div className="h-full flex items-center justify-center">
        {publish.isPublic ? (
          <span className="text-sm text-textExtraLight">
            {publish.likesCount}
          </span>
        ) : (
          <button className="font-semibold text-sm text-orange-600">
            Edit
          </button>
        )}
      </div>
    </div>
  )
}
