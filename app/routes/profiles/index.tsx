import { useMemo } from "react"
import { Link } from "@remix-run/react"
import { MdOutlineCheck, MdPerson } from "react-icons/md"

import { BackdropWithInfo } from "~/components/backdrop-info"
import { useProfileContext } from "../profiles"
import type { Profile } from "~/types"

export default function Profiles() {
  const context = useProfileContext()
  const usedProfile = useMemo(() => context?.profile, [context?.profile])
  const profiles = useMemo(
    () => context?.account?.profiles,
    [context?.account?.profiles]
  ) as Profile[]

  return (
    <div className="page text-start">
      <div className="w-full border-b-[1px] border-borderLightGray">
        <div className="w-full">
          {!profiles || profiles.length === 0 ? (
            <p className="font-light text-textLight text-center">
              You don't have any profile yet.
            </p>
          ) : (
            <>
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="w-full py-1 px-4 flex items-center border-b border-borderExtraLightGray cursor-pointer"
                >
                  <div className="mr-5">
                    <div className="w-[50px] h-[50px] bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden">
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
                      @{profile.handle}
                    </p>
                    <div className="flex mt-1">
                      <p className="font-light text-sm text-textExtraLight mr-5">
                        <span className="text-textDark">
                          {profile.followersCount}
                        </span>{" "}
                        Followers
                      </p>
                      <p className="font-light text-sm text-textExtraLight">
                        <span className="text-textDark">
                          {profile.followingCount}
                        </span>{" "}
                        Following
                      </p>
                    </div>
                  </div>
                  <div>
                    {profile.id === usedProfile?.id && (
                      <MdOutlineCheck
                        size={26}
                        className="text-textExtraLight"
                      />
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        <div className="py-6">
          <Link to="create">
            <button className="btn-dark w-40 rounded-full">
              Create Profile
            </button>
          </Link>
        </div>
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
