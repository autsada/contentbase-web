import { Link, useLocation } from "@remix-run/react"
import { MdPerson } from "react-icons/md"
import type { UserRecord } from "firebase-admin/auth"

import type { Profile } from "~/types"
import { IoSearchOutline } from "react-icons/io5"

interface Props {
  user: UserRecord | null
  openDrawer: (open: boolean) => void
  profile: Profile | null
  isDrawerOpen: boolean
}

export function Nav({ user, openDrawer, profile, isDrawerOpen }: Props) {
  const { pathname } = useLocation()

  return (
    <div className="w-full h-[70px] px-4 flex items-center justify-between gap-x-3 border-b border-borderExtraLightGray shadow-neutral-300">
      <div className="w-[120px] h-full flex items-center justify-start">
        {!isDrawerOpen && (
          <Link to="/">
            <img
              src="/logo.png"
              alt="CTB"
              className="w-[55px] h-[55px] rounded-full object-cover"
            />
          </Link>
        )}
      </div>

      <div className="relative h-[50px] flex items-center justify-between rounded-full overflow-hidden">
        {!pathname.startsWith("/auth") ? (
          <>
            <IoSearchOutline size={25} className="absolute" />
            <div className="pl-6 h-full">
              <input
                type="text"
                className="text-textLight text-lg h-full w-full outline-none focus:outline-none"
              />
            </div>
          </>
        ) : (
          <p>&nbsp;</p>
        )}
      </div>

      <div className="w-[120px] h-full flex items-center justify-end">
        {pathname.startsWith("/auth") ? (
          <Link to="auth" replace={true} className="px-4">
            &#10005;
          </Link>
        ) : (
          <>
            {!user ? (
              <Link to="auth">
                <button className="btn-orange h-9 px-4 rounded-full">
                  Log in
                </button>
              </Link>
            ) : (
              <div className="w-[40px] h-[40px] bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden">
                <div onClick={openDrawer.bind(undefined, true)}>
                  {!profile || !profile.imageURI ? (
                    <MdPerson size={30} color="#3f3f46" />
                  ) : (
                    <img
                      src={profile.imageURI}
                      alt={profile.originalHandle}
                      className="w-full h-full object-cover leading-[40px] text-center text-xs"
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
