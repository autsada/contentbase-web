import { Link } from "@remix-run/react"
import { MdOutlinePersonAddAlt, MdOutlineDashboard } from "react-icons/md"
import { IoSettingsOutline, IoLogOutOutline } from "react-icons/io5"

import { ProfileItem } from "../profile/profile-item"
import type { Profile } from "~/types"

interface Props {
  openDrawer: (open: boolean) => void
  className?: string
  profile: Profile | null
  profiles: Profile[]
}

export default function RightDrawer({
  openDrawer,
  className = "-right-[100%]",
  profile,
  profiles,
}: Props) {
  const otherProfiles =
    profiles &&
    profiles.length > 1 &&
    profile &&
    profiles.filter((p) => !!p && p.id !== profile?.id)

  return (
    <div
      className={`fixed z-[10000] top-0 right-0 h-screen w-[90%] max-h-full bg-white pt-2 overflow-hidden transition-all duration-300 ${className} overflow-y-scroll`}
    >
      <button
        className="absolute top-3 right-6 text-lg text-textLight"
        onClick={openDrawer.bind(undefined, false)}
      >
        &#10005;
      </button>
      <div className="w-[55px] h-[55px] ml-4 mb-4 rounded-full overflow-hidden bg-red-300">
        <img
          src="/logo.png"
          alt="CTB"
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="w-full pl-5 pr-3 border-b border-borderGray">
        {profile ? (
          <>
            <h6 className="text-base text-textLight">Logged in as</h6>
            <ProfileItem
              profile={profile}
              loggedInProfile={profile}
              openDrawer={openDrawer}
            />
          </>
        ) : (
          <div className="mt-2 mb-4">
            <div className="px-5 py-2 bg-gray-100 rounded-2xl">
              <p className="font-light text-left text-lg text-blueBase">
                You are almost there!, now you only need to{" "}
                <Link to="/create">
                  <strong className="font-semibold text-orange-500">
                    create your first profile
                  </strong>
                </Link>{" "}
                so you can start follow, share, like, and comment on{" "}
                <strong className="font-semibold text-blueDark text-lg">
                  ContentBase
                </strong>
                .
              </p>
            </div>
          </div>
        )}
      </div>

      {otherProfiles && otherProfiles.length > 0 && (
        <div className="relative w-full pl-5 pr-3 border-b border-borderGray">
          <h6 className="text-base mt-4 text-textLight">Other profiles</h6>
          {otherProfiles &&
            otherProfiles.length > 0 &&
            otherProfiles.map((p) => (
              <ProfileItem
                key={p!.id}
                profile={p}
                loggedInProfile={profile}
                openDrawer={openDrawer}
              />
            ))}
        </div>
      )}

      <div className="w-full p-5">
        <div className="py-4 mb-2">
          <Link to="/create" className="flex items-start">
            <div className="text-start w-12">
              <MdOutlinePersonAddAlt size={26} />
            </div>
            <h6 className="font-normal text-lg">
              Create {!profile ? "first" : ""} Profile
            </h6>
          </Link>
        </div>
        <div className="py-4 mb-2">
          <Link to="/content" className="flex items-start">
            <div className="text-start w-12">
              <MdOutlineDashboard size={26} />
            </div>
            <h6 className="font-normal text-lg">Content Dashboard</h6>
          </Link>
        </div>
        <div className="py-4 mb-2">
          <Link to="/settings" className="flex items-start">
            <div className="text-start w-12">
              <IoSettingsOutline size={25} />
            </div>
            <h6 className="font-normal text-lg">Settings</h6>
          </Link>
        </div>

        <form
          action="/auth/logout"
          method="post"
          className="relative py-4 mb-2 flex items-start"
        >
          <div className="h-full text-start w-12">
            <IoLogOutOutline size={26} />
          </div>
          <h6 className="font-normal text-lg">Logout</h6>
          <button type="submit" className="absolute inset-0">
            {" "}
          </button>
        </form>
      </div>
    </div>
  )
}
