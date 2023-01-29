import React from "react"

interface Props {
  size?: "xs" | "sm" | "base" | "md" | "lg"
}

export function Spinner({ size = "base" }: Props) {
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
          : "w-16 h-16"
      } mx-auto border-t border-t-gray-400 border-r border-r-gray-400 rounded-full border-b border-b-gray-200 border-l border-l-gray-200 animate-spin`}
    ></div>
  )
}
