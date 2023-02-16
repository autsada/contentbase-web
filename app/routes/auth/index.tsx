import { Link, useNavigate } from "@remix-run/react"
import { MdSmartphone, MdOutlineEmail } from "react-icons/md"

export default function Connect() {
  const navigate = useNavigate()

  return (
    <div className="absolute inset-0 bg-gray-100 text-center py-6 px-5 opacity-[98%]">
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

      <h4 className="self-center mt-5 mb-8">
        Let's share, like, and comment on content NFTs.
      </h4>

      <div className="mb-8">
        <Link
          to="phone"
          replace={true}
          className="btn-light bg-white flex justify-between items-center w-72 h-14 rounded-full mx-auto px-3"
        >
          <div className=" w-14 flex justify-center items-center">
            <MdSmartphone size={22} />
          </div>
          <button className="w-full text-lg ml-5 flex justify-start items-center focus:outline-none">
            Continue with Phone
          </button>
        </Link>
      </div>

      <div className="mb-8">
        <Link
          to="email"
          replace={true}
          className="btn-dark flex justify-between items-center w-72 h-14 rounded-full mx-auto px-3"
        >
          <div className="w-14 flex justify-center items-center">
            <MdOutlineEmail size={20} color="white" />
          </div>
          <button className="w-full text-lg ml-5 flex justify-start items-center text-white focus:outline-none">
            Continue with Email
          </button>
        </Link>
      </div>
      <div className="w-3/4 my-10 mx-auto px-8 flex items-center">
        <div className="h-[1px] flex-grow border-b border-neutral-300 rounded-md" />
        <label className="mx-2 font-thin text-base text-textLight">OR</label>
        <div className="h-[1px] flex-grow border-b border-neutral-300 rounded-md" />
      </div>
      <div className="mb-6">
        <Link
          to="wallet"
          replace={true}
          className="btn-orange flex justify-between items-center w-72 h-14 rounded-full mx-auto px-3 hover:bg-orange-600"
        >
          <button className="w-full text-lg text-white focus:outline-none">
            Continue with Wallet
          </button>
        </Link>
      </div>
    </div>
  )
}
