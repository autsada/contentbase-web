import { useMemo } from "react"
import { Link } from "@remix-run/react"

import { BackdropWithInfo } from "~/components/backdrop-info"
import { useProfileContext } from "../profiles"
import type { Profile } from "~/types"
import { ProfileItem } from "~/components/profiles/profile-item"

export default function Profiles() {
  const context = useProfileContext()
  const usedProfile = useMemo(() => context?.profile, [context?.profile])
  const profiles = useMemo(
    () => context?.account?.profiles,
    [context?.account?.profiles]
  ) as Profile[]

  return (
    <div className="page text-start">
      <div className="py-6 bg-gray-100">
        <Link to="create">
          <button className="btn-dark w-44 rounded-full">
            Create new Profile
          </button>
        </Link>
      </div>
      <div className="w-full">
        {!profiles || profiles.length === 0 ? (
          <p className="font-light text-textLight text-center">
            You don't have any profile yet.
          </p>
        ) : (
          <>
            {profiles.map((profile) => (
              <ProfileItem
                key={profile.id}
                profile={profile}
                isInUsed={profile.id === usedProfile?.id}
              />
            ))}
          </>
        )}
      </div>

      {context?.account &&
        typeof context?.hasProfile === "boolean" &&
        !context?.hasProfile && (
          <BackdropWithInfo>
            <div className="px-2">
              <h6 className="text-center mb-2">Create First Prifile</h6>
              <p className="mb-2 text-blueBase">
                You will need a profile to upload, share, like, and comment on{" "}
                <strong className="text-blueDark">ContentBase</strong>.
              </p>
              <h6 className="text-base">
                Would you like to create your first profile now?
              </h6>
              <p className="font-thin text-textLight italic text-sm mt-1">
                Note: You will NOT pay gas fee for the first profile.
              </p>
            </div>

            <div className="my-6">
              <Link to="create">
                <button className="btn-dark w-36 rounded-full">
                  Yes, please
                </button>
              </Link>
            </div>

            <div className="mb-2">
              <Link to="/" className="cursor-pointer">
                <h6 className="text-orange-400 text-center text-base">
                  Maybe Later
                </h6>
              </Link>
            </div>
          </BackdropWithInfo>
        )}
    </div>
  )
}
