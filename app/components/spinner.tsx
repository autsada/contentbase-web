interface Props {
  size?: "xs" | "sm" | "base" | "md" | "lg" | { w: string; h: string }
  color?: "default" | "blue" | "orange"
}

export function Spinner({ size = "base", color = "default" }: Props) {
  return (
    <div
      className={`${
        size === "xs"
          ? "w-10 h-10"
          : size === "sm"
          ? "w-14 h-14"
          : size === "md"
          ? "w-20 h-20"
          : size === "lg"
          ? "w-24 h-24"
          : typeof size === "object"
          ? `${size.w} ${size.h}`
          : "w-16 h-16"
      } mx-auto border-[2px] rounded-full animate-spin ${
        color === "blue"
          ? "border-t-blue-400 border-r-blue-400 border-b-blue-100 border-l-blue-100"
          : color === "orange"
          ? "border-t-orange-400 border-r-orange-400 border-b-orange-100 border-l-orange-100"
          : "border-t-gray-400 border-r-gray-400 border-b-gray-100 border-l-gray-100"
      }`}
    ></div>
  )
}
