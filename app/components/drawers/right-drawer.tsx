import { Link } from "@remix-run/react"

interface Props {
  openDrawer: (open: boolean) => void
  className?: string
}

export default function RightDrawer({ openDrawer, className }: Props) {
  return (
    <div
      className={`fixed z-[10000] top-0 right-0 h-screen w-3/5 bg-white pt-12 overflow-hidden transition-all duration-300 ${
        className ? className : ""
      }`}
    >
      <button
        className="absolute top-3 right-6 text-lg text-textLight"
        onClick={openDrawer.bind(undefined, false)}
      >
        &#10005;
      </button>
      <div className="w-full py-2 px-5">
        <Link to="profile">
          <div className="py-5 text-center font-semibold text-lg">Profiles</div>
        </Link>
        <Link to="profile/wallet">
          <div className="py-5 text-center font-semibold text-lg">Wallet</div>
        </Link>
        <div className="py-5 text-center font-semibold text-lg">
          <button className="btn-orange text-sm rounded-3xl w-max h-8 px-5">
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
