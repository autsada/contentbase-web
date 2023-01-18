export function Nav() {
  return (
    <div className="w-screen flex h-14 items-center py-[10px] border-b border-neutral-200 shadow-neutral-300">
      <div className="h-full flex items-center justify-center w-[80px]">
        <div className="w-[45px] h-[45px] rounded-full overflow-hidden">
          <img
            src="/logo.png"
            alt="CTB"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="h-full flex items-center justify-center flex-grow bg-neutral-100 rounded-3xl px-1">
        Search
      </div>
      <div className="h-full flex items-center justify-center w-[100px]">
        <button className="btn-orange text-xs rounded-3xl py-1">Connect</button>
      </div>
    </div>
  )
}
