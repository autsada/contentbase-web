import { Link } from "@remix-run/react"
import { BackdropWithInfo } from "~/components/backdrop-info"
import { useAccountContext } from "../profile"

export default function Profiles() {
  const { account, hasProfile } = useAccountContext()

  return (
    <div className="page text-start">
      <div className="w-full p-4 border-b-[1px] border-borderLightGray">
        <h6 className="text-base">Your Profiles</h6>
        <div className="w-full py-2 px-4">
          {!hasProfile && (
            <>
              <p className="font-light text-textLight">
                You don't have any profile yet.
              </p>
            </>
          )}
        </div>
        <div className="mt-4 mb-2">
          <Link to="create">
            <button className="btn-dark w-40 rounded-full">
              Create Profile
            </button>
          </Link>
        </div>
      </div>

      {account && typeof hasProfile === "boolean" && !hasProfile && (
        <BackdropWithInfo>
          <div className="px-2">
            <p className="mb-2 text-blueBase">
              You will need a profile to upload, share, like, and comment on
              ContentBase.
            </p>
            <h6 className="text-base">
              Would you like to create your first profile now?
            </h6>
          </div>

          <div className="my-6">
            <Link to="create">
              <button className="btn-dark w-36 rounded-full">
                Yes, please
              </button>
            </Link>
          </div>

          <div className="mb-2">
            <Link to="/" className="cursor-pointer">
              <h6 className="text-orange-400 text-center text-base">
                Maybe Later
              </h6>
            </Link>
          </div>
        </BackdropWithInfo>
      )}
    </div>
  )
}
