import { useAccountContext } from "../profile"

export default function Wallet() {
  const { balance } = useAccountContext()

  return (
    <div className="page py-5">
      <p>{balance ? Number(balance).toFixed(6) : "0"}</p>
    </div>
  )
}
