import { Link } from "@remix-run/react"
import { IoIosRadioButtonOff } from "react-icons/io"
import { MdPerson, MdCheck } from "react-icons/md"

import type { Profile } from "~/types"

interface Props {
  profile: Profile
  isInUsed: boolean
  switchProfile: (p: Profile) => void
}

export function ProfileItem({ isInUsed, profile, switchProfile }: Props) {
  return (
    <div className="relative">
      <Link to={`/${profile.originalHandle}/${profile.id}`}>
        <div className="w-full py-2 px-4 cursor-pointer hover:bg-gray-50">
          <div className="w-[60px] text-center">
            <h6 className="text-lg">{profile.originalHandle}</h6>
          </div>
          <div key={profile.id} className="mt-1 flex items-center">
            <div className="mr-5 h-[60px]">
              <div className="w-[60px] h-[60px] bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden">
                {!profile.imageURI ? (
                  <MdPerson size={30} color="#3f3f46" />
                ) : (
                  <img
                    src={profile.imageURI}
                    alt={profile.originalHandle}
                    className="w-full h-full object-cover leading-[60px] text-center text-xs"
                  />
                )}
              </div>
            </div>
            <div className="h-[60px] flex-grow px-2">
              <p>
                @{profile.handle}{" "}
                {profile.default && (
                  <span className="font-light italic text-textExtraLight">
                    [DEFAULT]
                  </span>
                )}
              </p>
              <div className="flex justify-start items-start">
                <button className="h-max w-max py-1 m-0 font-light text-sm text-textExtraLight mr-5">
                  <span className="p-0 m-0 text-textDark mr-1">
                    {profile.followersCount}
                  </span>{" "}
                  Followers
                </button>
                <button className="h-max w-max py-1 m-0 font-light text-sm text-textExtraLight">
                  <span className="text-textDark mr-1">
                    {profile.followingCount}
                  </span>{" "}
                  Following
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
      <div className="absolute top-0 right-0 h-full w-14 flex items-center justify-center">
        <button
          className="w-4/5 h-3/5 flex items-center justify-center ml-2"
          disabled={isInUsed}
          onClick={switchProfile.bind(undefined, profile)}
        >
          {isInUsed ? (
            <MdCheck size={26} className="text-orange-500" />
          ) : (
            <IoIosRadioButtonOff size={26} className="text-textExtraLight" />
          )}
        </button>
      </div>
    </div>
  )
}
