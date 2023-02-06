import { useProfileContext } from "../profile"

export default function Wallet() {
  const context = useProfileContext()

  return (
    <div className="page py-5">
      <p>{context?.balance ? Number(context.balance).toFixed(6) : "0"}</p>
    </div>
  )
}
