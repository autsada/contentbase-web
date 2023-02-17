import { Link } from "@remix-run/react"

import { BackdropWithInfo } from "~/components/backdrop-info"
import { ProfileItem } from "~/components/profile/profile-item"
import { useProfileContext } from "../profiles"
import type { Profile } from "~/types"

export default function Profiles() {
  const context = useProfileContext()

  return (
    <div className="page text-start">
      <div className="w-full">
        {!context?.account?.profiles ||
        context?.account?.profiles.length === 0 ? (
          <div className="p-6">
            <p className="text-lg text-center">
              You don't have any profile yet.
            </p>
          </div>
        ) : (
          (context?.account?.profiles as Profile[]).map((profile) => (
            <ProfileItem
              key={profile.id}
              profile={profile}
              isInUsed={profile.id === context?.loggedInProfile?.id}
              switchProfile={context?.switchProfile}
            />
          ))
        )}

        <div className="py-6">
          <Link to="create">
            <button className="btn-dark w-44 rounded-full">
              Create new Profile
            </button>
          </Link>
        </div>
      </div>

      {context?.account &&
        typeof context?.hasProfile === "boolean" &&
        !context?.hasProfile && (
          <BackdropWithInfo>
            <div className="px-2">
              <h5 className="text-center mb-2">Create First Profile</h5>
              <div className="mb-4 p-4 bg-gray-100 rounded-2xl">
                <p className="font-light text-center text-lg text-blueBase">
                  You will need a profile to upload, share, like, and comment on{" "}
                  <strong className="font-semibold text-blueDark text-base">
                    ContentBase
                  </strong>
                  .
                </p>
              </div>
              <h6 className="text-center">
                Would you like to create your first profile now?
              </h6>
              <p className="text-center text-textExtraLight italic mt-1">
                Note: It's <span className="text-orange-600">FREE</span> to
                create the first profile.
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
