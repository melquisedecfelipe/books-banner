import { isValidColor, isValidFontFamily } from "@/types"

/**
 * Validates and sanitizes a color value
 * @param color - Color value to validate
 * @returns Valid color or default fallback
 */
export function validateColor(color: string): string {
  if (isValidColor(color)) {
    return color
  }
  return "#000000"
}

/**
 * Validates and sanitizes a font family value
 * @param font - Font family to validate
 * @returns Valid font or default fallback
 */
export function validateFontFamily(font: string): string {
  if (isValidFontFamily(font)) {
    return font
  }
  return "'Dancing Script', cursive"
}

/**
 * Validates a series name during input (preserves spaces)
 * @param name - Series name to validate
 * @returns Sanitized name (max 100 characters, preserves internal spaces)
 */
export function validateSeriesName(name: string): string {
  // Only limit length, preserve all spaces during typing
  return name.slice(0, 100)
}

/**
 * Sanitizes a series name for final use (removes leading/trailing spaces)
 * @param name - Series name to sanitize
 * @returns Sanitized name (trimmed, max 100 characters)
 */
export function sanitizeSeriesName(name: string): string {
  return name.trim().slice(0, 100)
}

/**
 * Validates an image URL
 * @param url - URL to validate
 * @returns true if URL is valid and safe
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const allowedProtocols = ["https:", "http:", "data:"]
    const allowedHosts = [
      "covers.openlibrary.org",
      "api.allorigins.win",
      "openlibrary.org",
    ]

    if (!allowedProtocols.includes(urlObj.protocol)) {
      return false
    }

    if (urlObj.protocol === "data:") {
      return url.startsWith("data:image/")
    }

    if (urlObj.hostname && !allowedHosts.some((host) => urlObj.hostname.includes(host))) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Validates file type for image uploads
 * @param file - File to validate
 * @returns true if file is a valid image
 */
export function isValidImageFile(file: File): boolean {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return false
  }

  if (file.size > maxSize) {
    return false
  }

  return true
}

