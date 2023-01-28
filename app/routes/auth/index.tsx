import { Link, useNavigate } from "@remix-run/react"
import { MdSmartphone, MdOutlineEmail } from "react-icons/md"

export default function Connect() {
  const navigate = useNavigate()

  return (
    <div className="absolute inset-0 bg-gray-100 text-center py-10 opacity-[98%]">
      {/* <Form method="post" className="absolute top-4 right-8 px-4"> */}
      <button
        type="submit"
        className="absolute top-4 right-8 p-4 text-textExtraLight outline-none"
        onClick={() => navigate(-1)}
      >
        &#10005;
      </button>
      {/* </Form> */}
      <div className="py-[20px]">
        <div className="w-[120px] h-[120px] rounded-full overflow-hidden my-0 mx-auto">
          <img
            src="/logo.png"
            alt="CTB"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <p className="self-center font-extralight text-textLight mt-5 mb-4">
        Connect to ContentBase Platform
      </p>

      <div className="px-10 mb-8">
        <Link
          to="phone"
          className="btn-light bg-white flex justify-between items-center w-64 h-11 rounded-full mx-auto px-5"
        >
          <div className=" w-12 flex justify-center items-center">
            <MdSmartphone size={20} />
          </div>
          <button className="w-full ml-5 flex justify-start items-center focus:outline-none">
            Login with Phone
          </button>
        </Link>
      </div>

      <div className="px-10 mb-8">
        <Link
          to="email"
          className="btn-dark flex justify-between items-center w-64 h-11 rounded-full mx-auto px-5"
        >
          <div className="w-12 flex justify-center items-center">
            <MdOutlineEmail size={20} color="white" />
          </div>
          <button className="w-full ml-5 flex justify-start items-center text-white focus:outline-none">
            Login with Email
          </button>
        </Link>
      </div>
      <div className="w-3/4 my-10 mx-auto px-8 flex items-center">
        <div className="h-[1px] flex-grow border-b border-neutral-200 rounded-md" />
        <label className="mx-2 font-thin text-xs text-textExtraLight">OR</label>
        <div className="h-[1px] flex-grow border-b border-neutral-200 rounded-md" />
      </div>
      <div className="px-10 mb-6">
        <Link
          to="wallet"
          className="btn-orange flex justify-between items-center w-64 h-11 rounded-full mx-auto px-5 hover:bg-orange-600"
        >
          <button className="w-full text-white focus:outline-none">
            Login with Wallet
          </button>
        </Link>
      </div>
    </div>
  )
}
