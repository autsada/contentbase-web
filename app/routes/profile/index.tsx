import { useProfileContext } from "../profile"

export default function Profile() {
  const { balance } = useProfileContext()

  return (
    <div className="page py-5">
      <h6>Balance: {!balance ? "0" : Number(balance).toFixed(4)}</h6>
      <form method="post" action="/logout">
        <button
          type="submit"
          className="btn-orange text-sm rounded-3xl w-max h-8 px-4"
        >
          Logout
        </button>
      </form>
    </div>
  )
}
