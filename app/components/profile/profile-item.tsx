import { useEffect } from "react"
import { Link, useFetcher } from "@remix-run/react"
import { MdPerson, MdCheck } from "react-icons/md"
import { IoIosRadioButtonOff } from "react-icons/io"
import { toast } from "react-toastify"

import { Spinner } from "../spinner"
import type { Profile } from "~/types"
import type { SwitchProfileActionType } from "~/routes/auth/switch-profile"

interface Props {
  profile: Profile // The profile to be displayed
  loggedInProfile: Profile // The current logged in profile
  openDrawer: (o: boolean) => void
}

export function ProfileItem({ profile, loggedInProfile, openDrawer }: Props) {
  const isSameProfile = profile?.id === loggedInProfile?.id
  const isOwner =
    profile?.owner?.toLowerCase() === loggedInProfile?.owner?.toLowerCase()

  const switchProfileFetcher = useFetcher<SwitchProfileActionType>()
  const switchProfileLoading =
    switchProfileFetcher?.state === "submitting" ||
    switchProfileFetcher?.state === "loading"

  // When switch profile done.
  useEffect(() => {
    if (switchProfileFetcher?.data?.status === "Ok") {
      openDrawer(false)
      toast.success(`Logged in as @${profile?.handle}`, { theme: "dark" })
    }

    if (switchProfileFetcher?.data?.status === "Error") {
      toast.error("Switch profile failed", { theme: "colored" })
      openDrawer(false)
    }
  }, [switchProfileFetcher?.data, openDrawer, profile?.handle])

  function switchProfile() {
    // Recheck to ensure the logged in profile and the profile has the same owner.
    if (!isOwner || !switchProfile) return

    switchProfileFetcher.submit(
      {
        address: loggedInProfile?.owner,
        tokenId: profile?.tokenId,
      },
      // Call the action in the logged in profile route
      {
        method: "post",
        action: `/auth/switch-profile`,
      }
    )
  }

  if (!profile || !isOwner) return null

  return (
    <div className="relative">
      <Link to={`/${profile?.originalHandle}/${profile?.id}`}>
        <div className="w-full py-2 px-4 cursor-pointer hover:bg-gray-50 border-b border-gray-50">
          <div className="relative w-full text-start">
            <h6 className="text-base">{profile?.originalHandle}</h6>
            {switchProfileLoading && (
              <p className="absolute top-0 right-0 font-thin text-sm text-orange-500">
                Switching to @{profile?.handle}...
              </p>
            )}
          </div>
          <div key={profile?.id} className="h-[60px]  mt-1 flex items-center">
            <div className="mr-5 h-[60px]">
              <div className="w-[60px] h-[60px] bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden">
                {!profile?.imageURI ? (
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

            <div className="flex-grow px-2">
              <p>
                @{profile?.handle}{" "}
                {profile?.default && (
                  <span className="font-light italic text-textExtraLight">
                    [DEFAULT]
                  </span>
                )}
              </p>
              <div className="flex justify-start items-start">
                <button className="h-max w-max py-1 m-0 font-light text-textExtraLight mr-5">
                  <span className="p-0 m-0 text-textDark mr-1">
                    {profile?.followersCount}
                  </span>{" "}
                  Followers
                </button>
                <button className="h-max w-max py-1 m-0 font-light text-textExtraLight">
                  <span className="text-textDark mr-1">
                    {profile?.followingCount}
                  </span>{" "}
                  Following
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="absolute top-0 right-3 h-full flex items-center justify-center">
        <button
          className="w-10 h-full flex items-center justify-center ml-2 outline-none"
          disabled={switchProfileLoading || isSameProfile || !isOwner}
          onClick={switchProfile}
        >
          {isSameProfile ? (
            <MdCheck size={26} className="text-orange-500" />
          ) : typeof switchProfileLoading === "boolean" &&
            switchProfileLoading ? (
            <Spinner size={{ w: "w-5", h: "h-5" }} color="orange" />
          ) : (
            <IoIosRadioButtonOff size={26} className="text-textExtraLight" />
          )}
        </button>
      </div>
    </div>
  )
}
