import { useState, useCallback, useMemo } from "react"
import { BannerConfig, SeriesData } from "@/types"
import { validateColor, validateFontFamily, validateSeriesName } from "@/utils/validation"
import {
  DEFAULT_BACKGROUND_COLOR,
  DEFAULT_TITLE_COLOR,
  DEFAULT_TITLE_FONT,
} from "@/utils/constants"

interface UseBannerConfigReturn {
  config: BannerConfig
  seriesData: SeriesData
  updateSeriesName: (name: string) => void
  updateBackground: (color: string) => void
  updateTitleColor: (color: string) => void
  updateTitleFont: (font: string) => void
}

export function useBannerConfig(books: SeriesData["books"]): UseBannerConfigReturn {
  const [seriesName, setSeriesName] = useState<string>("")
  const [background, setBackground] = useState<string>(DEFAULT_BACKGROUND_COLOR)
  const [titleColor, setTitleColor] = useState<string>(DEFAULT_TITLE_COLOR)
  const [titleFont, setTitleFont] = useState<string>(DEFAULT_TITLE_FONT)

  const updateSeriesName = useCallback((name: string) => {
    setSeriesName(validateSeriesName(name))
  }, [])

  const updateBackground = useCallback((color: string) => {
    setBackground(validateColor(color))
  }, [])

  const updateTitleColor = useCallback((color: string) => {
    setTitleColor(validateColor(color))
  }, [])

  const updateTitleFont = useCallback((font: string) => {
    setTitleFont(validateFontFamily(font))
  }, [])

  const config = useMemo<BannerConfig>(
    () => ({
      seriesName,
      background,
      titleColor,
      titleFont,
    }),
    [seriesName, background, titleColor, titleFont]
  )

  const seriesData = useMemo<SeriesData>(
    () => ({
      name: seriesName,
      books: [...books].sort((a, b) => a.order - b.order),
      background,
      titleColor,
      titleFont,
    }),
    [seriesName, books, background, titleColor, titleFont]
  )

  return {
    config,
    seriesData,
    updateSeriesName,
    updateBackground,
    updateTitleColor,
    updateTitleFont,
  }
}

