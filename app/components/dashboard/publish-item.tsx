import { MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md"

import type { NexusGenFieldTypes } from "~/graphql/public-apis/typegen"
import { getTextExcerpt } from "~/utils"

interface Props {
  publish: NexusGenFieldTypes["Publish"]
}

export function PublishItem({ publish }: Props) {
  return (
    <div className="h-[80px] grid grid-cols-5 mb-4">
      <div className="h-full col-span-2 flex flex-col items-center justify-center">
        <img
          src={publish.playback?.thumbnail}
          alt={publish.title || ""}
          className="w-3/5 h-[50px] border-0 object-cover"
        />
        <p className="text-sm mt-1">
          {getTextExcerpt(publish.title || "title", 16)}
        </p>
      </div>
      <div className="h-full flex flex-col items-center py-2">
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
      <div className="h-full flex items-start justify-center py-2">
        <span className="text-sm text-textExtraLight">
          {new Date(publish.createdAt).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      <div className="h-full flex items-start justify-center py-2">
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
