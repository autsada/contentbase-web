import { Link } from "@remix-run/react"

import { BackdropWithInfo } from "./backdrop-info"

interface Props {
  title?: string
  onIntentToCreateProfile?: () => void
}

export default function FirstprofileNotification({
  title,
  onIntentToCreateProfile,
}: Props) {
  return (
    <BackdropWithInfo>
      <div className="px-2">
        <h6 className="text-center mt-2 mb-5">
          {title ? title : "Create First Profile"}
        </h6>
        <div className="mb-4 p-4 bg-gray-100 rounded-2xl">
          <p className="font-light text-left text-lg text-blueBase">
            You are almost there!, now you only need to{" "}
            <strong className="font-semibold text-orange-500">
              create your first profile
            </strong>{" "}
            so you can upload, share, like, and comment on{" "}
            <strong className="font-semibold text-blueDark text-lg">
              ContentBase
            </strong>
            .
          </p>
        </div>
        <h6 className="text-center">
          Would you like to create your first profile now?{" "}
          <span className="text-orange-600">It's FREE.</span>
        </h6>
      </div>

      <div className="my-6">
        {onIntentToCreateProfile ? (
          <button
            className="btn-dark w-36 rounded-full"
            onClick={onIntentToCreateProfile}
          >
            Yes, please
          </button>
        ) : (
          <Link to="/create">
            <button className="btn-dark w-36 rounded-full">Yes, please</button>
          </Link>
        )}
      </div>

      <div className="mb-2">
        <Link
          to="/"
          className="cursor-pointer"
          onClick={onIntentToCreateProfile || undefined}
        >
          <h6 className="text-orange-400 text-center text-base">Maybe Later</h6>
        </Link>
      </div>
    </BackdropWithInfo>
  )
}
