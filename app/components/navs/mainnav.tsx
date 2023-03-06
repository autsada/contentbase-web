import { Link, useLocation } from "@remix-run/react"
import { MdPerson } from "react-icons/md"
import type { UserRecord } from "firebase-admin/auth"

import type { Profile } from "~/types"
import { IoSearchOutline } from "react-icons/io5"
import { getPageTitle } from "~/utils"

interface Props {
  user: UserRecord | null
  openDrawer: (open: boolean) => void
  profile: Profile | null
  isDrawerOpen: boolean
}

export function MainNav({ user, openDrawer, profile, isDrawerOpen }: Props) {
  const { pathname } = useLocation()

  return (
    <div className="w-full h-[80px] px-4 flex items-center justify-between gap-x-2 border-b border-borderExtraLightGray shadow-neutral-300">
      <div className="w-[80px] h-full flex items-center justify-start">
        {!isDrawerOpen && (
          <Link to="/">
            <img
              src="/logo.png"
              alt="CTB"
              className="w-[65px] h-[65px] rounded-full object-cover"
            />
          </Link>
        )}
      </div>

      <div className="h-full flex-grow flex items-center justify-center">
        {pathname.startsWith("/auth") ? (
          <p>&nbsp;</p>
        ) : pathname.startsWith("/dashboard") ||
          pathname.startsWith("/wallet") ||
          pathname.startsWith("/settings") ? (
          <h6>{getPageTitle(pathname)}</h6>
        ) : (
          <div className="relative h-[50px] w-full flex items-center justify-start rounded-full overflow-hidden">
            <IoSearchOutline size={25} />
            <div className="relative w-full h-full ml-2">
              <input
                type="text"
                className="absolute inset-0 text-lg outline-none focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="w-[80px] h-full flex items-center justify-end">
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
