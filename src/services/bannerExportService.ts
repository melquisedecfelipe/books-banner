import { SeriesData, Book } from "@/types"
import { BANNER_DIMENSIONS } from "@/utils/constants"
import {
  PROGRESS_ICON_SIZE,
  PROGRESS_ICON_INNER_SIZE,
  PROGRESS_ICON_BORDER_WIDTH,
  PROGRESS_LINE_HEIGHT,
  PROGRESS_LINE_WIDTH,
  PROGRESS_LINE_MARGIN,
  PROGRESS_GAP,
  STATUS_COLORS,
} from "@/utils/progressConstants"

interface BannerExportOptions {
  convertToBase64: (url: string) => Promise<string>
}

/**
 * Layout constants for banner export
 * Calculated to fit exactly 6 covers per row: 6 * COVER_WIDTH + 5 * COVER_GAP = 1920
 */
const COVER_WIDTH = 220
const COVER_HEIGHT = 320 // 220 * 1.5 (aspect ratio 2:3)
const COVER_GAP = 48
const TITLE_FONT_SIZE = 72
const TITLE_TO_COVERS_GAP = 48
const COVERS_TO_PROGRESS_GAP = 48

/**
 * Service for exporting banners to images
 * Generates images directly on canvas without depending on DOM
 */
export class BannerExportService {
  /**
   * Exports a banner to a PNG image
   * @param _element - Unused (kept for compatibility)
   * @param data - Series data for styling
   * @param options - Export options
   * @returns Promise that resolves when export is complete
   */
  static async exportBanner(
    _element: HTMLElement,
    data: SeriesData,
    options: BannerExportOptions
  ): Promise<void> {
    const { convertToBase64 } = options

    // Create canvas
    const canvas = document.createElement("canvas")
    canvas.width = BANNER_DIMENSIONS.width
    canvas.height = BANNER_DIMENSIONS.height
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("Failed to get canvas context")
    }

    // Draw background
    ctx.fillStyle = data.background
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Calculate layout
    const layout = this.calculateLayout(data.books.length)

    // Draw title
    if (data.name) {
      this.drawTitle(ctx, data, layout.titleY)
    }

    // Draw book covers
    await this.drawBookCovers(ctx, data, layout, convertToBase64)

    // Draw progress
    if (data.books.length > 0) {
      this.drawProgress(ctx, data, layout.progressY)
    }

    // Download
    this.downloadCanvas(canvas, data.name)
  }

  /**
   * Calculates the layout for the banner
   */
  private static calculateLayout(bookCount: number): {
    readonly booksPerRow: number
    readonly rows: number
    readonly startY: number
    readonly titleY: number
    readonly progressY: number
  } {
    // Calculate how many books fit per row (max 6 per row)
    const availableWidth = BANNER_DIMENSIONS.width - 2 * COVER_GAP
    const calculatedBooksPerRow = Math.floor(
      (availableWidth + COVER_GAP) / (COVER_WIDTH + COVER_GAP)
    )
    const booksPerRow = Math.min(calculatedBooksPerRow, 6)
    const rows = Math.ceil(bookCount / booksPerRow)

    // Calculate total content height
    const totalCoversHeight = rows * COVER_HEIGHT
    const totalCoversGaps = (rows - 1) * COVER_GAP
    const coversAreaHeight = totalCoversHeight + totalCoversGaps
    const totalContentHeight =
      TITLE_FONT_SIZE +
      TITLE_TO_COVERS_GAP +
      coversAreaHeight +
      COVERS_TO_PROGRESS_GAP +
      PROGRESS_ICON_SIZE

    // Center content vertically
    const contentStartY = (BANNER_DIMENSIONS.height - totalContentHeight) / 2

    // Calculate positions relative to content start
    const titleY = contentStartY
    const titleBottom = titleY + TITLE_FONT_SIZE
    const startY = titleBottom + TITLE_TO_COVERS_GAP
    const progressY = startY + coversAreaHeight + COVERS_TO_PROGRESS_GAP

    return {
      booksPerRow,
      rows,
      startY,
      titleY,
      progressY,
    }
  }

  /**
   * Draws the title on the canvas
   */
  private static drawTitle(
    ctx: CanvasRenderingContext2D,
    data: SeriesData,
    y: number
  ): void {
    ctx.save()

    ctx.font = `${TITLE_FONT_SIZE}px ${data.titleFont}`
    ctx.fillStyle = data.titleColor
    ctx.textAlign = "center"
    ctx.textBaseline = "top"

    const x = BANNER_DIMENSIONS.width / 2
    ctx.fillText(data.name, x, y)

    ctx.restore()
  }

  /**
   * Draws all book covers on the canvas
   */
  private static async drawBookCovers(
    ctx: CanvasRenderingContext2D,
    data: SeriesData,
    layout: ReturnType<typeof this.calculateLayout>,
    convertToBase64: (url: string) => Promise<string>
  ): Promise<void> {
    const sortedBooks = [...data.books].sort((a, b) => a.order - b.order)

    for (let i = 0; i < sortedBooks.length; i++) {
      const book = sortedBooks[i]
      const row = Math.floor(i / layout.booksPerRow)
      const col = i % layout.booksPerRow

      // Calculate books in this row
      const booksInRow = Math.min(
        layout.booksPerRow,
        sortedBooks.length - row * layout.booksPerRow
      )

      // Calculate startX for this row (centered)
      const rowWidth = booksInRow * COVER_WIDTH + (booksInRow - 1) * COVER_GAP
      const rowStartX = (BANNER_DIMENSIONS.width - rowWidth) / 2

      const x = rowStartX + col * (COVER_WIDTH + COVER_GAP)
      const y = layout.startY + row * (COVER_HEIGHT + COVER_GAP)

      await this.drawBookCover(ctx, book, data.background, x, y, convertToBase64)
    }
  }

  /**
   * Draws a single book cover on the canvas
   */
  private static async drawBookCover(
    ctx: CanvasRenderingContext2D,
    book: Book,
    background: string,
    x: number,
    y: number,
    convertToBase64: (url: string) => Promise<string>
  ): Promise<void> {
    if (book.status === "unreleased") {
      this.drawUnreleasedPlaceholder(ctx, background, x, y)
      return
    }

    if (!book.thumbnail) {
      this.drawNoCoverPlaceholder(ctx, x, y)
      return
    }

    try {
      // Convert to base64 if needed
      let imageUrl = book.thumbnail
      if (!imageUrl.startsWith("data:")) {
        imageUrl = await convertToBase64(imageUrl)
      }

      // Load image
      const img = await this.loadImage(imageUrl)
      ctx.drawImage(img, x, y, COVER_WIDTH, COVER_HEIGHT)
    } catch (error) {
      console.warn("Failed to load book cover:", error)
      this.drawNoCoverPlaceholder(ctx, x, y)
    }
  }

  /**
   * Draws an unreleased placeholder
   */
  private static drawUnreleasedPlaceholder(
    ctx: CanvasRenderingContext2D,
    background: string,
    x: number,
    y: number
  ): void {
    ctx.save()

    // Background
    ctx.fillStyle = "#fefefe"
    ctx.globalAlpha = 0.7
    ctx.fillRect(x, y, COVER_WIDTH, COVER_HEIGHT)

    // Border
    ctx.globalAlpha = 1
    ctx.strokeStyle = background
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(x, y, COVER_WIDTH, COVER_HEIGHT)

    // Question mark
    ctx.fillStyle = background
    ctx.font = "120px serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("?", x + COVER_WIDTH / 2, y + COVER_HEIGHT / 2)

    ctx.restore()
  }

  /**
   * Draws a no-cover placeholder
   */
  private static drawNoCoverPlaceholder(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ): void {
    ctx.save()

    ctx.fillStyle = "#e5e7eb"
    ctx.fillRect(x, y, COVER_WIDTH, COVER_HEIGHT)

    ctx.fillStyle = "#9ca3af"
    ctx.font = "16px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("Sem capa", x + COVER_WIDTH / 2, y + COVER_HEIGHT / 2)

    ctx.restore()
  }

  /**
   * Draws the progress indicator
   */
  private static drawProgress(
    ctx: CanvasRenderingContext2D,
    data: SeriesData,
    y: number
  ): void {
    const sortedBooks = [...data.books].sort((a, b) => a.order - b.order)
    const totalWidth =
      sortedBooks.length * PROGRESS_ICON_SIZE +
      (sortedBooks.length - 1) * (PROGRESS_LINE_WIDTH + 2 * PROGRESS_LINE_MARGIN) +
      (sortedBooks.length - 1) * PROGRESS_GAP
    const startX = (BANNER_DIMENSIONS.width - totalWidth) / 2

    sortedBooks.forEach((book, index) => {
      const iconX = startX + index * (PROGRESS_ICON_SIZE + PROGRESS_LINE_WIDTH + 2 * PROGRESS_LINE_MARGIN + PROGRESS_GAP)
      const iconY = y

      // Draw icon
      this.drawProgressIcon(ctx, book.status, iconX, iconY)

      // Draw connector line (except for last book)
      if (index < sortedBooks.length - 1) {
        const lineX = iconX + PROGRESS_ICON_SIZE + PROGRESS_LINE_MARGIN
        const lineY = iconY + PROGRESS_ICON_SIZE / 2 - PROGRESS_LINE_HEIGHT / 2
        ctx.fillStyle = data.titleColor
        ctx.fillRect(lineX, lineY, PROGRESS_LINE_WIDTH, PROGRESS_LINE_HEIGHT)
      }
    })
  }

  /**
   * Draws a progress icon
   */
  private static drawProgressIcon(
    ctx: CanvasRenderingContext2D,
    status: Book["status"],
    x: number,
    y: number
  ): void {
    const colors = STATUS_COLORS[status]

    ctx.save()

    // Draw circle background
    ctx.fillStyle = colors.background
    ctx.beginPath()
    ctx.arc(
      x + PROGRESS_ICON_SIZE / 2,
      y + PROGRESS_ICON_SIZE / 2,
      PROGRESS_ICON_SIZE / 2 - PROGRESS_ICON_BORDER_WIDTH / 2,
      0,
      2 * Math.PI
    )
    ctx.fill()

    // Draw border
    ctx.strokeStyle = colors.border
    ctx.lineWidth = PROGRESS_ICON_BORDER_WIDTH
    ctx.stroke()

    // Draw icon (simplified - using text for now)
    ctx.fillStyle = colors.icon
    ctx.font = `${PROGRESS_ICON_INNER_SIZE}px Arial`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    const iconSymbol = this.getStatusIconSymbol(status)
    ctx.fillText(
      iconSymbol,
      x + PROGRESS_ICON_SIZE / 2,
      y + PROGRESS_ICON_SIZE / 2
    )

    ctx.restore()
  }

  /**
   * Gets the symbol for a status icon
   */
  private static getStatusIconSymbol(status: Book["status"]): string {
    switch (status) {
      case "read":
        return "✓"
      case "reading":
        return "📖"
      case "unread":
        return "○"
      case "unreleased":
        return "📅"
      default:
        return "○"
    }
  }

  /**
   * Loads an image from a URL
   */
  private static loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  /**
   * Downloads the canvas as a PNG image
   */
  private static downloadCanvas(canvas: HTMLCanvasElement, seriesName: string): void {
    const link = document.createElement("a")
    const sanitizedName = seriesName.trim() || "banner"
    link.download = `${sanitizedName}-${Date.now()}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }
}
