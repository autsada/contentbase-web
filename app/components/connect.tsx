import { Link, useLocation } from "@remix-run/react"
import { MdSmartphone, MdOutlineEmail } from "react-icons/md"
import { FaGoogle } from "react-icons/fa"

interface Props {
  setOpen: (open: boolean) => void
}

export function Connect({ setOpen }: Props) {
  const { pathname } = useLocation()

  return (
    <div className="absolute inset-0 bg-gray-50 text-center py-16 opacity-[98%]">
      <button
        className="absolute top-4 right-8 py-2 px-3 text-textExtraLight"
        onClick={setOpen.bind(undefined, false)}
      >
        &#10005;
      </button>
      <div className="py-[20px]">
        <div className="w-[120px] h-[120px] rounded-full overflow-hidden my-0 mx-auto">
          <img
            src="/logo.png"
            alt="CTB"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <p className="self-center font-extralight text-textLight mt-5 mb-3">
        Connect to ContentBase Platform
      </p>
      <div className="px-10 mb-5">
        <button
          className="bg-white font-semibold shadow-md hover:bg-neutral-50 focus:outline-none rounded-[30px] w-3/4 px-5"
          onClick={setOpen.bind(undefined, false)}
        >
          <Link
            to="connect/phone"
            replace={pathname.startsWith("/connect") ? true : false}
            className="flex w-full items-center justify-around"
          >
            <MdSmartphone size={20} />
            Connect with Phone
          </Link>
        </button>
      </div>
      <div className="px-10 mb-6">
        <button
          className="btn-light rounded-[30px] w-3/4 px-5"
          onClick={setOpen.bind(undefined, false)}
        >
          <Link
            to="connect/email"
            replace={pathname.startsWith("/connect") ? true : false}
            className="flex w-full items-center justify-around"
          >
            <MdOutlineEmail size={20} />
            Connect with Email
          </Link>
        </button>
      </div>
      <div className="px-10">
        <button className="btn-dark rounded-[30px] w-3/4 justify-around px-5">
          <FaGoogle size={16} color="white" />
          Connect with Google
        </button>
      </div>
      <div className="w-3/4 my-10 mx-auto px-8 flex items-center">
        <div className="h-[1px] flex-grow border-b border-neutral-200 rounded-md" />
        <label className="mx-2 font-thin text-xs text-textExtraLight">OR</label>
        <div className="h-[1px] flex-grow border-b border-neutral-200 rounded-md" />
      </div>
      <div className="px-10 mb-6">
        <button
          className="btn-orange rounded-[30px] w-3/4 px-5"
          onClick={setOpen.bind(undefined, false)}
        >
          <Link
            to="connect/wallet"
            replace={pathname.startsWith("/connect") ? true : false}
            className="flex w-full items-center justify-around"
          >
            Connect Wallet
          </Link>
        </button>
      </div>
    </div>
  )
}
