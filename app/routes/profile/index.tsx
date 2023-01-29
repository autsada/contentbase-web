import { useProfileContext } from "../profile"

export default function Profile() {
  const { user, account, balance } = useProfileContext()

  console.log("account: ", account)
  // console.log("user: ", user)
  console.log("balance: ", balance)
  return <div>Profile</div>
}
