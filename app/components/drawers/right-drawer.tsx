interface Props {
  openDrawer: (open: boolean) => void
  className?: string
}

export default function RightDrawer({ openDrawer, className }: Props) {
  return (
    <div
      className={`fixed z-[10000] top-0 right-0 h-screen w-3/5 bg-white overflow-hidden transition-all duration-300 ${
        className ? className : ""
      }`}
    >
      Drawer
      <button className="mt-5" onClick={openDrawer.bind(undefined, false)}>
        close
      </button>
    </div>
  )
}
