import { Link, useLocation } from "@remix-run/react"
import { BsPlusCircle, BsCircleFill } from "react-icons/bs"
import { AiOutlineHome, AiTwotoneHome } from "react-icons/ai"
import { IoWalletOutline, IoWallet } from "react-icons/io5"

export default function BottomTab() {
  const { pathname } = useLocation()

  return (
    <div className="fixed z-[9999] bottom-0 w-full h-[80px] flex items-center justify-between px-10 bg-gray-50">
      <Link to="/">
        {pathname === "/" ? (
          <AiTwotoneHome size={34} className="text-textLight" />
        ) : (
          <AiOutlineHome size={34} className="text-textLight" />
        )}
      </Link>
      <Link to="/upload">
        {pathname === "/upload" ? (
          <BsCircleFill size={34} className="text-textLight" />
        ) : (
          <BsPlusCircle size={34} className="text-textLight" />
        )}
      </Link>
      <Link to="/wallet">
        {pathname === "/wallet" ? (
          <IoWallet size={32} className="text-textLight" />
        ) : (
          <IoWalletOutline size={32} className="text-textLight" />
        )}
      </Link>
    </div>
  )
}
