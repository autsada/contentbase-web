import { MdSmartphone, MdOutlineEmail } from "react-icons/md"
import { FaGoogle } from "react-icons/fa"

interface Props {
  setOpen: (open: boolean) => void
}

export function Connect({ setOpen }: Props) {
  return (
    <div className="absolute inset-0 bg-gray-50 text-center py-16 opacity-95">
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
        <button className="bg-white font-semibold shadow-md hover:bg-neutral-50 focus:outline-none rounded-[30px] w-3/4 justify-around px-5">
          <MdSmartphone size={20} />
          Connect with Phone
        </button>
      </div>
      <div className="px-10 mb-6">
        <button className="btn-light rounded-[30px] w-3/4 justify-around px-5">
          <MdOutlineEmail size={20} />
          Connect with Email
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
        <button className="btn-orange rounded-[30px] w-3/4 justify-around px-5">
          Connect Wallet
        </button>
      </div>
    </div>
  )
}
