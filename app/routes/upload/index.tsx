import { Link } from "@remix-run/react"

export default function Upload() {
  return (
    <div className="page">
      <div className="p-10 flex flex-col justify-around items-center">
        <Link to="video">
          <div className="mb-10 btn-orange w-44 h-20 flex items-center justify-center rounded-xl cursor-pointer">
            <h6 className="font-normal text-white">Share Video</h6>
          </div>
        </Link>
        <Link to="post">
          <div className="mb-10 btn-dark w-44 h-20 flex items-center justify-center rounded-xl cursor-pointer">
            <h6 className="font-normal text-white">Share Post</h6>
          </div>
        </Link>
      </div>
    </div>
  )
}
