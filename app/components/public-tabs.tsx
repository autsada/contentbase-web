import { Link, useLocation } from "@remix-run/react"

export default function PublicTabs() {
  const { pathname } = useLocation()

  return (
    <div className="py-4 px-2 flex items-center gap-x-4">
      <Link to="/">
        <div
          className={`${
            pathname === "/" ? "border-b-2" : "border-none"
          } border-borderExtraDarkGray`}
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
          } border-borderExtraDarkGray`}
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
      <Link to="audio">
        <div
          className={`${
            pathname === "/audio" ? "border-b-2" : "border-none"
          } border-borderExtraDarkGray`}
        >
          <h6
            className={`text-base ${
              pathname === "/audio" ? "text-textDark" : "text-textExtraLight"
            }`}
          >
            Audio
          </h6>
        </div>
      </Link>
      <Link to="premium">
        <div
          className={`${
            pathname === "/premium" ? "border-b-2" : "border-none"
          } border-borderExtraDarkGray`}
        >
          <h6
            className={`text-base ${
              pathname === "/premium" ? "text-textDark" : "text-textExtraLight"
            }`}
          >
            Premium
          </h6>
        </div>
      </Link>
      <Link to="headers">
        <div
          className={`${
            pathname === "/headers" ? "border-b-2" : "border-none"
          } border-borderExtraDarkGray`}
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
