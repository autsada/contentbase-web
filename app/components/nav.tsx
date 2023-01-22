import { Link, useLocation } from "@remix-run/react"

export function Nav() {
  const { pathname } = useLocation()

  return (
    <div className="w-screen h-[70px] px-3 flex items-center border-b border-borderExtraLightGray shadow-neutral-300">
      <div className="h-full flex items-center justify-center">
        <div className="w-[60px] h-[60px] rounded-full overflow-hidden">
          <Link to="/">
            <img
              src="/logo.png"
              alt="CTB"
              className="w-full h-full object-cover"
            />
          </Link>
        </div>
      </div>
      <div className="flex-grow mx-3">
        {!pathname.startsWith("/connect") && (
          <div className="h-[45px] flex items-center justify-center bg-neutral-50 rounded-full">
            Search
          </div>
        )}
      </div>
      <div className="h-full flex items-center justify-center">
        {pathname.startsWith("/connect") ? (
          <Link to="/" className="px-4">
            &#10005;
          </Link>
        ) : (
          <Link to="connect">
            <button className="btn-orange text-sm rounded-3xl w-max h-8 px-4">
              Connect
            </button>
          </Link>
        )}
      </div>
    </div>
  )
}
