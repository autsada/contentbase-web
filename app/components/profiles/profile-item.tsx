import { Link } from "@remix-run/react"
import { IoIosRadioButtonOn, IoIosRadioButtonOff } from "react-icons/io"
import { MdPerson } from "react-icons/md"

import type { Profile } from "~/types"

interface Props {
  profile: Profile
  isInUsed: boolean
}

export function ProfileItem({ isInUsed, profile }: Props) {
  return (
    <Link to={`${profile.originalHandle}/${profile.id}`}>
      <div
        key={profile.id}
        className="w-full py-2 px-4 flex items-center border-b border-borderExtraLightGray cursor-pointer hover:bg-gray-50"
      >
        <div className="mr-5">
          <div className="w-[60px] h-[60px] bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden">
            {!profile.imageURI ? (
              <MdPerson size={30} color="#3f3f46" />
            ) : (
              <img
                src={profile.imageURI}
                alt={profile.originalHandle}
                className="object-cover"
              />
            )}
          </div>
        </div>
        <div className="flex-grow px-2">
          <h6 className="text-base">{profile.originalHandle}</h6>
          <p className="font-light text-textLight">
            @{profile.handle}{" "}
            {profile.default && (
              <span className="font-thin italic text-textExtraLight">
                [DEFAULT]
              </span>
            )}
          </p>
          <div className="flex mt-1">
            <p className="font-light text-sm text-textExtraLight mr-5">
              <span className="text-textDark">{profile.followersCount}</span>{" "}
              Followers
            </p>
            <p className="font-light text-sm text-textExtraLight">
              <span className="text-textDark">{profile.followingCount}</span>{" "}
              Following
            </p>
          </div>
        </div>
        <div>
          {isInUsed ? (
            <IoIosRadioButtonOn size={26} className="text-orange-500" />
          ) : (
            <IoIosRadioButtonOff size={26} className="text-textExtraLight" />
          )}
        </div>
      </div>
    </Link>
  )
}
