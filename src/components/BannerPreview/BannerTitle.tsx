import { memo } from "react"

interface BannerTitleProps {
  readonly name: string
  readonly color: string
  readonly font: string
}

export const BannerTitle = memo(function BannerTitle({
  name,
  color,
  font,
}: BannerTitleProps) {
  return (
    <h1
      className="text-7xl font-bold text-center"
      style={{
        marginBottom: "48px",
        color,
        fontFamily: font,
      }}
    >
      {name}
    </h1>
  )
})

