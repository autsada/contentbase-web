interface Props {
  setOpen: (open: boolean) => void
}

export function Connect({ setOpen }: Props) {
  return (
    <div className="absolute inset-0 bg-white">
      <h4>Connect</h4>
      <button onClick={setOpen.bind(undefined, false)}>Close</button>
    </div>
  )
}
