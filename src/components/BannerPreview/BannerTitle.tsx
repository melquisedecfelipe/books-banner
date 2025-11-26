import { memo, useMemo } from "react"

interface BannerTitleProps {
  readonly name: string
  readonly color: string
  readonly font: string
}

const TITLE_MARGIN_BOTTOM = "48px"

export const BannerTitle = memo(function BannerTitle({
  name,
  color,
  font,
}: BannerTitleProps): JSX.Element {
  const titleStyle = useMemo(
    () => ({
      marginBottom: TITLE_MARGIN_BOTTOM,
      color,
      fontFamily: font,
    }),
    [color, font]
  )

  return (
    <h1 className="text-7xl font-bold text-center" style={titleStyle}>
      {name}
    </h1>
  )
})

