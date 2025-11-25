export type BookStatus = "read" | "reading" | "unread" | "unreleased"

export interface Book {
  readonly id: string
  readonly title?: string
  readonly authors?: readonly string[]
  readonly thumbnail?: string
  readonly publishedDate?: string
  readonly description?: string
  readonly status: BookStatus
  readonly order: number
}

export interface SeriesData {
  readonly name: string
  readonly books: readonly Book[]
  readonly background: string
  readonly titleColor: string
  readonly titleFont: string
}

export interface BannerConfig {
  readonly seriesName: string
  readonly background: string
  readonly titleColor: string
  readonly titleFont: string
}

// Type guards
export function isValidBookStatus(value: unknown): value is BookStatus {
  return (
    typeof value === "string" &&
    (value === "read" || value === "reading" || value === "unread" || value === "unreleased")
  )
}

export function isValidColor(value: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)
}

export function isValidFontFamily(value: string): boolean {
  const allowedFonts = [
    "'Dancing Script', cursive",
    "'Great Vibes', cursive",
    "'Pacifico', cursive",
    "'Satisfy', cursive",
    "'Kalam', cursive",
    "'Caveat', cursive",
    "'Permanent Marker', cursive",
    "'Amatic SC', cursive",
    "'Shadows Into Light', cursive",
    "'Indie Flower', cursive",
    "'Arial', sans-serif",
  ]
  return allowedFonts.includes(value)
}

