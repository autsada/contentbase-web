import { Link } from "@remix-run/react"

export function Nav() {
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
      <div className="h-[45px] mx-3 flex items-center justify-center flex-grow bg-neutral-50 rounded-full">
        Search
      </div>
      <div className="h-full flex items-center justify-center">
        <button className="btn-orange text-sm rounded-3xl w-max h-8 px-4">
          <Link to="connect">Connect</Link>
        </button>
      </div>
    </div>
  )
}
