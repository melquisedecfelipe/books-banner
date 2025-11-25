/**
 * Constants for progress indicator styling
 */
export const PROGRESS_ICON_SIZE = 40 // w-10 h-10 = 40px
export const PROGRESS_ICON_INNER_SIZE = 20 // w-5 h-5 = 20px
export const PROGRESS_ICON_BORDER_WIDTH = 2
export const PROGRESS_ICON_STROKE_WIDTH = 3

export const PROGRESS_LINE_HEIGHT = 4 // h-1 = 4px
export const PROGRESS_LINE_WIDTH = 48 // w-12 = 48px
export const PROGRESS_LINE_MARGIN = 4 // mx-1 = 4px

export const PROGRESS_CONTAINER_MARGIN_TOP = 32 // mt-8 = 32px
export const PROGRESS_GAP = 8 // gap-2 = 8px

/**
 * Status icon color configurations
 */
export const STATUS_COLORS = {
  read: {
    background: "#dcfce7", // green-100
    border: "#16a34a", // green-600
    icon: "#16a34a", // green-600
  },
  reading: {
    background: "#dbeafe", // blue-100
    border: "#2563eb", // blue-600
    icon: "#2563eb", // blue-600
  },
  unread: {
    background: "#f3f4f6", // gray-100
    border: "#9ca3af", // gray-400
    icon: "#9ca3af", // gray-400
  },
  unreleased: {
    background: "#ffedd5", // orange-100
    border: "#fb923c", // orange-400
    icon: "#f97316", // orange-600
  },
} as const

