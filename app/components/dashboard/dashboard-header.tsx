export function DashboardHeader() {
  return (
    <div className="sticky z-20 top-0 left-0 right-0 h-[40px] grid grid-cols-5 bg-gray-100">
      <div className="h-full col-span-2 flex items-center justify-center">
        <span className="text-textDark">Video</span>
      </div>
      <div className="h-full flex items-center justify-center">
        <span className="text-textDark">Visibility</span>
      </div>
      <div className="h-full flex items-center justify-center">
        <span className="text-textDark">Date</span>
      </div>
      <div className="h-full flex items-center justify-center">
        <span className="text-textDark">Likes</span>
      </div>
    </div>
  )
}
