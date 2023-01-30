import { Spinner } from "../spinner"

export default function InfoSpinner() {
  return (
    <div className="bg-white w-full p-4 rounded-2xl">
      <p className="font-light text-textLight px-2 mt-2">
        Processing login, please wait
      </p>
      <div className="mt-4">
        <Spinner size="sm" />
      </div>
    </div>
  )
}
