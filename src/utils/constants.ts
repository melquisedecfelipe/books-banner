import { BookStatus } from "@/types"

export const DEFAULT_BACKGROUND_COLOR = "#ffffff"
export const DEFAULT_TITLE_COLOR = "#000000"
export const DEFAULT_TITLE_FONT = "'Dancing Script', cursive"

export const FONT_OPTIONS = [
  { value: "'Dancing Script', cursive", label: "Dancing Script (Caligrafia)" },
  { value: "'Great Vibes', cursive", label: "Great Vibes (Elegante)" },
  { value: "'Pacifico', cursive", label: "Pacifico (Casual)" },
  { value: "'Satisfy', cursive", label: "Satisfy (Script)" },
  { value: "'Kalam', cursive", label: "Kalam (Mão Livre)" },
  { value: "'Caveat', cursive", label: "Caveat (Natural)" },
  { value: "'Permanent Marker', cursive", label: "Permanent Marker (Marcador)" },
  { value: "'Amatic SC', cursive", label: "Amatic SC (Estilizada)" },
  { value: "'Shadows Into Light', cursive", label: "Shadows Into Light (Sombra)" },
  { value: "'Indie Flower', cursive", label: "Indie Flower (Floral)" },
  { value: "'Arial', sans-serif", label: "Arial (Padrão)" },
] as const

export const BOOK_STATUS_OPTIONS: readonly { value: BookStatus; label: string }[] = [
  { value: "read", label: "Lido" },
  { value: "reading", label: "Lendo" },
  { value: "unread", label: "Sem ler" },
  { value: "unreleased", label: "Sem lançar" },
] as const

export const BANNER_DIMENSIONS = {
  width: 1920,
  height: 1080,
} as const

export const IMAGE_LOAD_TIMEOUT = 3000
export const RENDER_DELAY = 500

/**
 * Constants for "no cover" placeholder styling
 * Used in both React component and canvas export
 */
export const NO_COVER_PLACEHOLDER = {
  backgroundColor: "#e5e7eb", // bg-gray-200
  textColor: "#9ca3af", // text-gray-400
  fontSize: 12, // text-xs
  fontFamily: "Arial",
  text: "Sem capa",
  borderWidth: 2,
  borderStyle: "dashed",
  borderColor: "#9ca3af", // text-gray-400
  borderDashPattern: [5, 5], // For canvas dashed line
} as const

