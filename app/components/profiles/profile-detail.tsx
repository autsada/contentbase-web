import { Link } from "@remix-run/react"
import { MdArrowBackIosNew, MdPerson } from "react-icons/md"

import type { Profile } from "~/types"

interface Props {
  profile: Profile
  isOwner: boolean
  closeModal: () => void
}

export function ProfileDetail({ profile, closeModal, isOwner }: Props) {
  return (
    <div className="page absolute inset-0">
      <div className="w-full py-[20px] h-[100px] bg-blueBase">
        <div className="absolute left-5 h-[60px] flex items-center">
          <MdArrowBackIosNew size={30} color="white" onClick={closeModal} />
        </div>
        <div className="w-[140px] h-[140px] mx-auto bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden">
          {!profile.imageURI ? (
            <MdPerson size={80} color="#3f3f46" />
          ) : (
            <img
              src={profile.imageURI}
              alt={profile.originalHandle}
              className="object-cover"
            />
          )}
        </div>
      </div>
      <div className="mt-[70px]">
        <h6>{profile.originalHandle}</h6>
        <h6 className="font-normal text-base text-textDark">
          @{profile.handle}{" "}
          {profile.default && (
            <span className="font-thin italic text-textExtraLight">
              [DEFAULT]
            </span>
          )}
        </h6>
        <div className="w-full mt-1 flex justify-center items-center gap-x-3">
          {isOwner ? (
            <Link to={`/profiles/${profile.originalHandle}/followers`}>
              <p className="font-light text-textLight">
                {profile.followersCount} Followers
              </p>
            </Link>
          ) : (
            <p className="font-light text-textLight">
              {profile.followersCount} Followers
            </p>
          )}
          {isOwner && (
            <Link to={`/profiles/${profile.originalHandle}/following`}>
              <p className="font-light text-textLight">
                {profile.followingCount} Following
              </p>
            </Link>
          )}
          <p className="font-light text-textLight">
            {profile.publishesCount} Videos
          </p>
        </div>
      </div>
    </div>
  )
}
