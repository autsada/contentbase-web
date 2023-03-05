import { BackdropWithInfo } from "./backdrop-info"

interface Props {
  title?: string
  modalVisible: boolean
  onOk: () => void
  onCancel: () => void
}

export default function FirstprofileNotification({
  title,
  modalVisible,
  onOk,
  onCancel,
}: Props) {
  if (!modalVisible) return null

  return (
    <BackdropWithInfo zIndex="z-[10000]">
      <div className="px-2">
        <h6 className="text-center mt-2 mb-5">
          {title ? title : "Create First Profile"}
        </h6>
        <div className="mb-4 p-4 bg-gray-100 rounded-2xl">
          <p className="font-semibold text-left text-lg text-blueBase">
            You are almost there!, now you only need to{" "}
            <strong className="text-orange-500">
              create your first profile
            </strong>{" "}
            so you can upload, share, like, and comment on{" "}
            <strong className="font-bold text-blueDark text-lg">
              ContentBase
            </strong>
            .
          </p>
        </div>
        <h6 className="text-center">
          Would you like to create your first profile now?{" "}
          <span className="text-orange-500">It's FREE!</span>
        </h6>
      </div>

      <div className="my-6">
        <button className="btn-dark w-36 rounded-full" onClick={onOk}>
          Yes, please
        </button>
      </div>

      <div className="mb-2">
        <h6
          className="text-orange-400 text-center text-base"
          onClick={onCancel}
        >
          Maybe Later
        </h6>
      </div>
    </BackdropWithInfo>
  )
}
