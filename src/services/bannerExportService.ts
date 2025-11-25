import html2canvas from "html2canvas"
import { SeriesData } from "@/types"
import { BANNER_DIMENSIONS, RENDER_DELAY } from "@/utils/constants"
import {
  PROGRESS_ICON_SIZE,
  PROGRESS_ICON_INNER_SIZE,
  PROGRESS_ICON_BORDER_WIDTH,
  PROGRESS_ICON_STROKE_WIDTH,
  PROGRESS_LINE_HEIGHT,
  PROGRESS_LINE_WIDTH,
  PROGRESS_LINE_MARGIN,
  PROGRESS_CONTAINER_MARGIN_TOP,
  PROGRESS_GAP,
} from "@/utils/progressConstants"
import { ImageService } from "./imageService"

interface BannerExportOptions {
  convertToBase64: (url: string) => Promise<string>
}

/**
 * Service for exporting banners to images
 */
export class BannerExportService {
  /**
   * Exports a banner element to a PNG image
   * @param element - Banner element to export
   * @param data - Series data for styling
   * @param options - Export options
   * @returns Promise that resolves when export is complete
   */
  static async exportBanner(
    element: HTMLElement,
    data: SeriesData,
    options: BannerExportOptions
  ): Promise<void> {
    const { convertToBase64 } = options

    // Convert all images to base64
    await ImageService.convertImagesToBase64(element, convertToBase64)

    // Calculate scale factor
    const viewportWidth = window.innerWidth || BANNER_DIMENSIONS.width
    const widthScale = BANNER_DIMENSIONS.width / viewportWidth

    if (!Number.isFinite(widthScale) || widthScale <= 0) {
      throw new Error("Invalid width scale calculation")
    }

    // Create clone for export
    const clone = this.createExportClone(element, data, widthScale)

    // Copy converted image sources to clone
    this.copyImageSources(element, clone)

    // Wait for images to load
    await ImageService.waitForImagesToLoad(clone)

    // Wait for rendering
    await new Promise((resolve) => setTimeout(resolve, RENDER_DELAY))

    // Capture with html2canvas
    const canvas = await html2canvas(clone, {
      backgroundColor: data.background,
      width: BANNER_DIMENSIONS.width,
      height: BANNER_DIMENSIONS.height,
      scale: 1,
      useCORS: false,
      allowTaint: false,
      logging: false,
      imageTimeout: 15000,
    })

    // Cleanup
    if (document.body.contains(clone)) {
      document.body.removeChild(clone)
    }

    // Download
    this.downloadCanvas(canvas, data.name)
  }

  private static createExportClone(
    element: HTMLElement,
    data: SeriesData,
    widthScale: number
  ): HTMLElement {
    const clone = element.cloneNode(true) as HTMLElement
    const computedStyle = window.getComputedStyle(element)

    // Apply base styles
    clone.style.cssText = element.style.cssText
    clone.style.backgroundColor = computedStyle.backgroundColor || data.background
    clone.style.display = computedStyle.display || "flex"
    clone.style.flexDirection = computedStyle.flexDirection || "column"
    clone.style.alignItems = computedStyle.alignItems || "center"
    clone.style.justifyContent = computedStyle.justifyContent || "center"

    // Position clone off-screen
    clone.style.position = "fixed"
    clone.style.left = "-9999px"
    clone.style.top = "0"
    clone.style.width = `${BANNER_DIMENSIONS.width}px`
    clone.style.height = `${BANNER_DIMENSIONS.height}px`
    clone.style.opacity = "1"
    clone.style.visibility = "visible"
    clone.style.zIndex = "-1"
    clone.style.pointerEvents = "none"

    document.body.appendChild(clone)

    // Scale internal elements
    this.scaleCloneElements(clone, data, widthScale)

    return clone
  }

  private static scaleCloneElements(
    clone: HTMLElement,
    data: SeriesData,
    widthScale: number
  ): void {
    const titleElement = clone.querySelector("h1")
    if (titleElement) {
      const baseFontSize = 72
      titleElement.style.fontSize = `${baseFontSize * widthScale}px`
      titleElement.style.marginTop = `${80 * widthScale}px`
      titleElement.style.marginBottom = `${100 * widthScale}px`
      titleElement.style.color = data.titleColor
      titleElement.style.fontFamily = data.titleFont
    }

    // Scale book covers
    const bookCovers = clone.querySelectorAll<HTMLElement>("[style*='width: 320px']")
    bookCovers.forEach((cover) => {
      cover.style.width = `${320 * widthScale}px`
    })

    // Scale gap
    const gapContainer = clone.querySelector<HTMLElement>("[style*='gap: 60px']")
    if (gapContainer) {
      gapContainer.style.gap = `${60 * widthScale}px`
    }


    // Scale question marks
    const questionMarks = clone.querySelectorAll<HTMLElement>("[style*='fontSize: 120px']")
    questionMarks.forEach((qm) => {
      qm.style.fontSize = `${120 * widthScale}px`
    })

    // Scale unreleased placeholders
    const unreleasedPlaceholders = clone.querySelectorAll<HTMLElement>("[style*='opacity: 0.7']")
    unreleasedPlaceholders.forEach((placeholder) => {
      placeholder.style.backgroundColor = "#fefefe"
      placeholder.style.opacity = "0.7"

      const bgColor = data.background
      const borderDiv = placeholder.querySelector<HTMLElement>("div[class*='border-dashed']")
      if (borderDiv) {
        borderDiv.style.borderColor = bgColor
      }

      const questionMark = placeholder.querySelector<HTMLElement>("span")
      if (questionMark) {
        questionMark.style.color = bgColor
        questionMark.style.display = "flex"
        questionMark.style.alignItems = "center"
        questionMark.style.justifyContent = "center"
        questionMark.style.position = "absolute"
        questionMark.style.top = "0"
        questionMark.style.left = "0"
        questionMark.style.right = "0"
        questionMark.style.bottom = "0"
        questionMark.style.margin = "0"
        questionMark.style.padding = "0"
        questionMark.style.width = "100%"
        questionMark.style.height = "100%"
      }

      placeholder.style.display = "flex"
      placeholder.style.alignItems = "center"
      placeholder.style.justifyContent = "center"
    })

    // Scale series progress component
    // Find the progress container by looking for flex container with gap-2 and mt-8
    const allDivs = clone.querySelectorAll<HTMLElement>("div")
    let progressContainer: HTMLElement | null = null
    
    for (const div of Array.from(allDivs)) {
      const classList = div.className || ""
      if (classList.includes("flex") && classList.includes("items-center") && classList.includes("justify-center")) {
        // Check if it has children with rounded-full (progress icons)
        const hasProgressIcons = div.querySelector("div[class*='rounded-full']")
        if (hasProgressIcons) {
          progressContainer = div
          break
        }
      }
    }
    
    if (progressContainer) {
      // Apply margin-top and gap explicitly
      progressContainer.style.marginTop = `${PROGRESS_CONTAINER_MARGIN_TOP * widthScale}px`
      progressContainer.style.gap = `${PROGRESS_GAP * widthScale}px`

      // Scale progress icons (the rounded-full divs)
      const progressIcons = progressContainer.querySelectorAll<HTMLElement>(
        "div[class*='rounded-full']"
      )
      progressIcons.forEach((icon) => {
        icon.style.width = `${PROGRESS_ICON_SIZE * widthScale}px`
        icon.style.height = `${PROGRESS_ICON_SIZE * widthScale}px`
        icon.style.borderWidth = `${PROGRESS_ICON_BORDER_WIDTH * widthScale}px`
        icon.style.borderStyle = "solid"
      })

      // Scale progress SVG icons inside the rounded-full divs
      const progressSvgs = progressContainer.querySelectorAll<SVGElement>("svg")
      progressSvgs.forEach((svg) => {
        svg.style.width = `${PROGRESS_ICON_INNER_SIZE * widthScale}px`
        svg.style.height = `${PROGRESS_ICON_INNER_SIZE * widthScale}px`

        const strokeWidth =
          svg.getAttribute("strokeWidth") ||
          String(PROGRESS_ICON_STROKE_WIDTH)
        svg.setAttribute(
          "strokeWidth",
          String(parseFloat(strokeWidth) * widthScale)
        )
      })

      // Scale progress lines (connectors between icons)
      const progressLines = progressContainer.querySelectorAll<HTMLElement>(
        "[data-progress-line='true']"
      )
      progressLines.forEach((line) => {
        line.style.height = `${PROGRESS_LINE_HEIGHT * widthScale}px`
        line.style.width = `${PROGRESS_LINE_WIDTH * widthScale}px`
        line.style.marginLeft = `${PROGRESS_LINE_MARGIN * widthScale}px`
        line.style.marginRight = `${PROGRESS_LINE_MARGIN * widthScale}px`
        // Use title color for lines
        line.style.setProperty("background-color", data.titleColor, "important")
        line.style.setProperty("background", data.titleColor, "important")
        // Remove any color classes that might override
        line.className = line.className.replace(/bg-\w+-\d+/g, "").trim()
      })

      // Scale inner wrapper divs (the ones containing each icon)
      const iconWrappers = progressContainer.querySelectorAll<HTMLElement>(
        "div[class*='flex'][class*='items-center']"
      )
      iconWrappers.forEach((wrapper) => {
        // Check if this wrapper contains a rounded-full div (it's an icon wrapper)
        if (wrapper.querySelector("div[class*='rounded-full']")) {
          wrapper.style.gap = `${PROGRESS_GAP * widthScale}px`
        }
      })
    }

  }

  private static copyImageSources(original: HTMLElement, clone: HTMLElement): void {
    const originalImages = original.querySelectorAll<HTMLImageElement>("img")
    const cloneImages = clone.querySelectorAll<HTMLImageElement>("img")

    originalImages.forEach((originalImg, index) => {
      if (cloneImages[index]) {
        cloneImages[index].src = originalImg.src
        cloneImages[index].setAttribute("src", originalImg.src)
      }
    })
  }

  private static downloadCanvas(canvas: HTMLCanvasElement, seriesName: string): void {
    const link = document.createElement("a")
    const sanitizedName = seriesName.trim() || "banner"
    link.download = `${sanitizedName}-${Date.now()}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }
}

