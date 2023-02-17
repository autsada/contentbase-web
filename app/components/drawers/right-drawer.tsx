import { Link } from "@remix-run/react"
import type { Profile } from "~/types"
import { ProfileItem } from "../profile/profile-item"

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
  return (
    <div
      className={`fixed z-[10000] top-0 right-0 h-screen w-[90%] bg-white pt-12 overflow-hidden transition-all duration-300 ${className}`}
    >
      <button
        className="absolute top-3 right-6 text-lg text-textLight"
        onClick={openDrawer.bind(undefined, false)}
      >
        &#10005;
      </button>
      <div className="w-full border-b border-borderGray">
        <h6 className="px-4 text-textLight">Logged in as</h6>
        <ProfileItem
          profile={profile as Profile}
          isInUsed={true}
          switchProfile={switchProfile}
        />
      </div>
      <div className="w-full border-b border-borderGray">
        <h6 className="px-4 mt-4 text-textLight">Other profiles</h6>
        {profiles &&
          profiles.length > 0 &&
          (profiles as Profile[])
            .filter((p) => p.id !== profile?.id)
            .map((p) => (
              <ProfileItem
                key={p.id}
                profile={p}
                isInUsed={p.id === profile?.id}
                switchProfile={switchProfile}
              />
            ))}
      </div>
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
    </div>
  )
}
