import { useAppContext } from "~/root"

export default function Wallet() {
  const context = useAppContext()

  return (
    <div className="page py-5">
      <h6 className="text-sm mb-5">{context?.account?.address}</h6>
      <p>{context?.balance ? Number(context.balance).toFixed(6) : "0"}</p>
    </div>
  )
}
