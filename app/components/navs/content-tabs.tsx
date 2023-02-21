import { Link, useLocation } from "@remix-run/react"

export function ContentTabs() {
  const { pathname } = useLocation()

  return (
    <div className="py-4 flex max-w-full w-full items-center overflow-x-auto scrollbar-hide">
      <Link to="/">
        <div
          className={`${
            pathname === "/" ? "border-b-2" : "border-none"
          } mx-4 border-borderExtraDarkGray w-max`}
        >
          <h6
            className={`text-base ${
              pathname === "/" ? "text-textDark" : "text-textExtraLight"
            }`}
          >
            Videos
          </h6>
        </div>
      </Link>
      <Link to="blogs">
        <div
          className={`${
            pathname === "/blogs" ? "border-b-2" : "border-none"
          } mx-4 border-borderExtraDarkGray w-max`}
        >
          <h6
            className={`text-base ${
              pathname === "/blogs" ? "text-textDark" : "text-textExtraLight"
            }`}
          >
            Blogs
          </h6>
        </div>
      </Link>
      <Link to="history">
        <div
          className={`${
            pathname === "/history" ? "border-b-2" : "border-none"
          } mx-4 border-borderExtraDarkGray w-max`}
        >
          <h6
            className={`text-base ${
              pathname === "/history" ? "text-textDark" : "text-textExtraLight"
            }`}
          >
            Watch History
          </h6>
        </div>
      </Link>
      <Link to="liked">
        <div
          className={`${
            pathname === "/liked" ? "border-b-2" : "border-none"
          } mx-4 border-borderExtraDarkGray w-max`}
        >
          <h6
            className={`text-base ${
              pathname === "/liked" ? "text-textDark" : "text-textExtraLight"
            }`}
          >
            Liked
          </h6>
        </div>
      </Link>
      <Link to="headers">
        <div
          className={`${
            pathname === "/headers" ? "border-b-2" : "border-none"
          } mx-4 border-borderExtraDarkGray w-max`}
        >
          <h6
            className={`text-base ${
              pathname === "/headers" ? "text-textDark" : "text-textExtraLight"
            }`}
          >
            Headers
          </h6>
        </div>
      </Link>
    </div>
  )
}
