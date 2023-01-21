import { Link } from "@remix-run/react"

interface Props {
  openConnectModal?: (open: boolean) => void
}

export function Nav({ openConnectModal }: Props) {
  return (
    <div className="w-screen flex h-16 items-center py-[10px] border-b border-borderExtraLightGray shadow-neutral-300">
      <div className="h-full flex items-center justify-center w-[80px]">
        <div className="w-[45px] h-[45px] rounded-full overflow-hidden">
          <Link to="/">
            <img
              src="/logo.png"
              alt="CTB"
              className="w-full h-full object-cover"
            />
          </Link>
        </div>
      </div>
      <div className="h-full flex items-center justify-center flex-grow bg-neutral-100 rounded-3xl px-1">
        Search
      </div>
      <div className="h-full flex items-center justify-center px-4 w-max">
        <button
          className="btn-orange text-xs rounded-3xl w-max h-6 px-3"
          onClick={
            openConnectModal
              ? openConnectModal.bind(undefined, true)
              : undefined
          }
        >
          Connect
        </button>
      </div>
    </div>
  )
}
