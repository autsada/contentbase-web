import { IoSearchOutline } from "react-icons/io5"

export default function Search() {
  return (
    <>
      <div className="h-full">
        <input
          type="text"
          className="font-semibold text-lg text-textLight w-full h-full outline-none focus:outline-none"
        />
      </div>

      <IoSearchOutline size={25} className="" />
    </>
  )
}
