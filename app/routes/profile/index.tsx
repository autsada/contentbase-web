import { BackdropWithInfo } from "~/components/backdrop-info"
import { useAccountContext } from "../profile"

export default function Profiles() {
  const { account, hasProfile } = useAccountContext()

  return (
    <div className="page py-5">
      <h6>Profiles</h6>

      {account && typeof hasProfile === "boolean" && !hasProfile && (
        <BackdropWithInfo>
          <h6 className="text-center text-base">Create your first profile</h6>
        </BackdropWithInfo>
      )}
    </div>
  )
}
