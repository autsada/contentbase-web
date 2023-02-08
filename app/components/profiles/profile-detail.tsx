import { Link } from "@remix-run/react"
import { useMemo } from "react"
import { MdArrowBackIosNew, MdPerson } from "react-icons/md"

import type { Profile } from "~/types"

interface Props {
  profile: Profile
  loggedInProfile: Profile
  isOwner: boolean // Whether the account owns the profile or not
  closeModal: () => void
}

export function ProfileDetail({
  isOwner,
  profile,
  closeModal,
  loggedInProfile,
}: Props) {
  // Check whehter the logged in profile and the displayed profile is the same or not.
  const isSameProfile = useMemo(
    () => profile?.id === loggedInProfile?.id,
    [profile?.id, loggedInProfile?.id]
  )

  /**
   * TODO: Add logic to fetch uploaded videos of the profile
   */

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
      <div className="w-full mt-[20px] h-[40px] flex justify-end items-start">
        {/* Allow the user to change their profile image if the displayed and the logged in is the same profile. */}
        {isSameProfile && (
          <button className="btn-orange mr-3 h-6 px-3 rounded-full font-normal text-xs">
            Change image
          </button>
        )}
      </div>
      <div className="mt-1">
        <h6>{profile.originalHandle}</h6>
        <h6 className="font-normal text-base text-textDark">
          @{profile.handle}{" "}
          {/* Display `DEFAULT` if the user is the owner of the profile */}
          {isOwner && profile.default && (
            <span className="font-thin italic text-textExtraLight">
              [DEFAULT]
            </span>
          )}
        </h6>
        <div className="w-full mt-1 flex justify-center items-center gap-x-3">
          {isSameProfile ? (
            <Link to={`/profiles/${profile.originalHandle}/followers`}>
              <p className="font-light text-textLight">
                {profile.followersCount} followers
              </p>
            </Link>
          ) : (
            <p className="font-light text-textLight">
              {profile.followersCount} followers
            </p>
          )}
          {/* Show following if logged in and displayed profile is the same profile */}
          {isSameProfile && (
            <Link to={`/profiles/${profile.originalHandle}/following`}>
              <p className="font-light text-textLight">
                {profile.followingCount} following
              </p>
            </Link>
          )}
          <p className="font-light text-textLight">
            {profile.publishesCount} videos
          </p>
        </div>
        {/* Add the ability to follow/unfollow if the logged in and displayed is NOT the same profile. */}
        {!isSameProfile && (
          <div className="w-full my-2">
            {!profile?.isFollowing ? (
              <button className="btn-dark w-3/5 rounded-full">Follow</button>
            ) : (
              <button className="btn-light w-3/5 rounded-full text-error">
                Unfollow
              </button>
            )}
          </div>
        )}
      </div>
      {/* TODO: Display Videos */}
      <div>Videos</div>
    </div>
  )
}
