import { useState, useCallback } from "react"
import { Link } from "@remix-run/react"
import { MdExpandMore } from "react-icons/md"

import { ProfileItem } from "../profile/profile-item"
import type { Profile } from "~/types"
import { Backdrop } from "../backdrop"

interface Props {
  openDrawer: (open: boolean) => void
  className?: string
  profile: Profile | null
  profiles: Profile[]
  switchProfile: (p: Profile) => void
}

export default function RightDrawer({
  openDrawer,
  className = "-right-[100%]",
  profile,
  profiles,
  switchProfile,
}: Props) {
  const loggedInProfile =
    profile ||
    (profiles &&
      profiles.length > 0 &&
      (profiles.find((p) => p.default) || profiles[0]))
  const otherProfiles =
    profiles &&
    profiles.length > 1 &&
    loggedInProfile &&
    profiles.filter((p) => p.id !== loggedInProfile.id)

  const [isShowOtherProfiles, setIsShowOtherProfiles] = useState(false)

  const showOtherProfiles = useCallback((show: boolean) => {
    setIsShowOtherProfiles(show)
  }, [])

  return (
    <div
      className={`fixed z-[10000] top-0 right-0 h-screen w-[90%] bg-white pt-2 overflow-hidden transition-all duration-300 ${className}`}
    >
      <button
        className="absolute top-3 right-6 text-lg text-textLight"
        onClick={openDrawer.bind(undefined, false)}
      >
        &#10005;
      </button>
      <div className="w-[55px] h-[55px] ml-4 mb-2 rounded-full overflow-hidden bg-red-300">
        <img
          src="/logo.png"
          alt="CTB"
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="w-full border-b border-borderGray">
        {loggedInProfile ? (
          <>
            <h6 className="text-base px-4 text-textLight">Logged in as</h6>
            <ProfileItem
              profile={loggedInProfile}
              isInUsed={true}
              switchProfile={switchProfile}
            />
          </>
        ) : (
          <div className="px-4">
            <div className="px-5 py-2 bg-gray-100 rounded-2xl">
              <p className="font-light text-left text-lg text-blueBase">
                You are almost there!, now you only need to{" "}
                <strong className="text-orange-500">
                  create your first profile
                </strong>{" "}
                so you can upload, share, like, and comment on{" "}
                <strong className="font-semibold text-blueDark text-lg">
                  ContentBase
                </strong>
                .
              </p>
            </div>
          </div>
        )}
        <Link to="/create">
          <button className="btn-dark px-5 rounded-full my-2">
            Create {!loggedInProfile ? "first" : ""} Profile
          </button>
        </Link>
      </div>
      {otherProfiles && otherProfiles.length > 0 && (
        <div className="relative w-full border-b border-borderGray">
          <h6 className="text-base px-4 mt-4 text-textLight">Other profiles</h6>
          {otherProfiles && otherProfiles.length > 0 && (
            <>
              <MdExpandMore
                size={30}
                className="absolute right-3 -top-1"
                onClick={showOtherProfiles.bind(undefined, true)}
              />
              <ProfileItem
                key={otherProfiles[0].id}
                profile={otherProfiles[0]}
                isInUsed={otherProfiles[0].id === profile?.id}
                switchProfile={switchProfile}
              />
            </>
          )}
        </div>
      )}
      <div className="w-full py-2 px-5">
        <Link to="/settings">
          <div className="py-5 text-center font-semibold text-lg">Settings</div>
        </Link>
        <Link to="/wallet">
          <div className="py-5 text-center font-semibold text-lg">Wallet</div>
        </Link>
        <div className="py-5 text-center font-semibold text-lg">
          <form action="/auth/logout" method="post">
            <button className="text-lg text-orange-500 rounded-3xl w-max h-8 px-5">
              Logout
            </button>
          </form>
        </div>
      </div>

      {isShowOtherProfiles && (
        <div className="fixed inset-0 bg-transparent flex items-center justify-end">
          <Backdrop />
          <div className="relative z-[100] w-[90%] bg-white py-5">
            <button
              className="absolute top-2 right-5 text-lg text-textLight"
              onClick={showOtherProfiles.bind(undefined, false)}
            >
              &#10005;
            </button>
            <h6 className="text-base px-4 text-textLight">Other profiles</h6>
            <div className="w-full">
              {otherProfiles &&
                otherProfiles.length > 0 &&
                otherProfiles.map((p) => (
                  <ProfileItem
                    key={p.id}
                    profile={p}
                    isInUsed={p.id === profile?.id}
                    switchProfile={switchProfile}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
