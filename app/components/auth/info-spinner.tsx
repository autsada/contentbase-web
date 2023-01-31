import { Spinner } from "../spinner"

export default function InfoSpinner() {
  return (
    <div className="bg-white w-full p-4 rounded-2xl">
      <h6 className="text-base px-2 mt-2">Processing login</h6>
      <div className="mt-4">
        <Spinner size="sm" />
      </div>
    </div>
  )
}
