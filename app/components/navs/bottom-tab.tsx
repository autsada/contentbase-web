import { Link, useLocation } from "@remix-run/react"
import { BsPlusCircle } from "react-icons/bs"
import { AiOutlineHome, AiTwotoneHome } from "react-icons/ai"
import { IoWalletOutline, IoWallet } from "react-icons/io5"

export default function BottomTab() {
  const { pathname } = useLocation()

  return (
    <div className="fixed z-[9999] bottom-0 w-full h-[80px] flex items-center justify-between px-10 bg-white">
      <Link to="/">
        {pathname === "/" ||
        pathname === "/blogs" ||
        pathname === "/history" ||
        pathname === "/liked" ? (
          <AiTwotoneHome size={34} className="text-textLight cursor-pointer" />
        ) : (
          <AiOutlineHome size={34} className="text-textLight cursor-pointer" />
        )}
      </Link>
      <Link to="/content?upload=true">
        <BsPlusCircle size={34} className="text-textLight cursor-pointer" />
      </Link>
      <Link to="/wallet">
        {pathname === "/wallet" ? (
          <IoWallet size={32} className="text-textLight cursor-pointer" />
        ) : (
          <IoWalletOutline
            size={32}
            className="text-textLight cursor-pointer"
          />
        )}
      </Link>
    </div>
  )
}
