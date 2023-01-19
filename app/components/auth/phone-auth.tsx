import React from "react"

interface Props {
  submit: (lat: number, lng: number) => void
  country?: string | null
}

export function PhoneAuth({ submit }: Props) {
  React.useEffect(() => {
    let render = true

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        if (typeof latitude === "number" && typeof longitude === "number") {
          if (render) submit(latitude, longitude)
        }
      },
      (error) => {
        console.warn(error.message)
      }
    )

    return () => {
      render = false
    }
  }, [submit])

  return <div>PhoneAuth</div>
}
