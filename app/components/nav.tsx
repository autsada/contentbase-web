import { Link, useLocation } from "@remix-run/react"
import { MdPerson } from "react-icons/md"
import { IoSearchOutline } from "react-icons/io5"
import type { UserRecord } from "firebase-admin/auth"

import type { Profile } from "~/types"
import { getPageTitle } from "~/utils"

interface Props {
  user: UserRecord | null
  openDrawer: (open: boolean) => void
  profile: Profile | null
}

export function Nav({ user, openDrawer, profile }: Props) {
  const { pathname } = useLocation()
  const pageTitle = getPageTitle(pathname)

  return (
    <div className="w-full h-[70px] px-4 flex items-center justify-between gap-x-5 border-b border-borderExtraLightGray shadow-neutral-300">
      <div className="w-[70px] h-full flex items-center justify-start">
        <Link to="/">
          <img
            src="/logo.png"
            alt="CTB"
            className="w-[55px] h-[55px] rounded-full object-fit"
          />
        </Link>
      </div>

      <div className="relative h-[50px] flex-grow flex items-center justify-between rounded-full overflow-hidden">
        {pathname.startsWith("/auth") ? null : !pageTitle ? (
          <>
            <input
              type="text"
              className="block h-full w-4/5 outline-none focus:outline-none"
            />

            <IoSearchOutline size={25} className="absolute right-0" />
          </>
        ) : (
          <div className="w-full">
            <h5 className="text-center">{pageTitle}</h5>
          </div>
        )}
      </div>

      <div className="w-[60px] h-full flex items-center justify-end">
        {pathname.startsWith("/auth") ? (
          <Link to="auth" replace={true} className="px-4">
            &#10005;
          </Link>
        ) : (
          <>
            {!user ? (
              <Link to="auth">
                <button className="btn-orange text-sm rounded-3xl w-max h-8 px-4">
                  Login
                </button>
              </Link>
            ) : (
              <div className="w-[40px] h-[40px] p-4 bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden">
                <div onClick={openDrawer.bind(undefined, true)}>
                  {!profile || !profile.imageURI ? (
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
            )}
          </>
        )}
      </div>
    </div>
  )
}
