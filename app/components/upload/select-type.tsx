interface Props {
  selectType: (type: UploadType) => void
}

export type UploadType = "SelectType" | "Video" | "Blog" | "Course"

export function SelectType({ selectType }: Props) {
  return (
    <>
      <h6 className="text-center mb-5">What do you want to share?</h6>

      <button
        className="my-10 btn-orange w-44 h-20 font-normal text-lg text-white rounded-xl"
        onClick={selectType.bind(undefined, "Video")}
      >
        Share Video
      </button>

      <button
        className="my-10 btn-dark w-44 h-20 font-normal text-lg text-white rounded-xl"
        onClick={selectType.bind(undefined, "Blog")}
      >
        Share Post
      </button>
    </>
  )
}
