interface Props {
  visible: boolean
  title?: string
  children?: React.ReactNode
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  visible,
  title = "Please confirm",
  children,
  onConfirm,
  onCancel,
}: Props) {
  if (!visible) return null

  return (
    <div className="fixed inset-0 flex justify-center items-center">
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="relative z-[100] w-4/5 py-5 rounded-2xl bg-white">
        <div className="w-full my-5 px-6">
          <h6 className="mb-4 text-center">{title}</h6>
          <>{children}</>
        </div>

        <div className="flex items-center justify-around">
          <button onClick={onCancel} className="error">
            Cancel
          </button>
          <button onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}
