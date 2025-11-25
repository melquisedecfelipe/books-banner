import { isValidImageUrl } from "@/utils/validation"

/**
 * Service for handling image operations
 */
export class ImageService {
  /**
   * Converts all images in an element to base64
   * @param element - DOM element containing images
   * @param convertToBase64 - Function to convert image URL to base64
   * @returns Promise that resolves when all images are converted
   */
  static async convertImagesToBase64(
    element: HTMLElement,
    convertToBase64: (url: string) => Promise<string>
  ): Promise<void> {
    const images = element.querySelectorAll<HTMLImageElement>("img")
    const imagePromises = Array.from(images).map(async (img) => {
      const src = img.getAttribute("src")
      if (!src || src.startsWith("data:")) {
        return Promise.resolve()
      }

      if (!isValidImageUrl(src)) {
        console.warn("Invalid image URL:", src)
        return Promise.resolve()
      }

      try {
        const base64 = await convertToBase64(src)
        img.setAttribute("src", base64)

        return new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
          } else {
            const timeout = setTimeout(() => resolve(), 3000)
            img.onload = () => {
              clearTimeout(timeout)
              resolve()
            }
            img.onerror = () => {
              clearTimeout(timeout)
              resolve()
            }
          }
        })
      } catch (error) {
        console.warn("Failed to convert image:", error)
        return Promise.resolve()
      }
    })

    await Promise.all(imagePromises)
  }

  /**
   * Waits for all images in an element to load
   * @param element - DOM element containing images
   * @param timeout - Timeout in milliseconds
   * @returns Promise that resolves when all images are loaded
   */
  static async waitForImagesToLoad(
    element: HTMLElement,
    timeout: number = 3000
  ): Promise<void> {
    const images = element.querySelectorAll<HTMLImageElement>("img")
    const imagePromises = Array.from(images).map((img) => {
      return new Promise<void>((resolve) => {
        if (img.complete && img.naturalWidth > 0) {
          resolve()
        } else {
          const timeoutId = setTimeout(() => resolve(), timeout)
          img.onload = () => {
            clearTimeout(timeoutId)
            resolve()
          }
          img.onerror = () => {
            clearTimeout(timeoutId)
            resolve()
          }
        }
      })
    })

    await Promise.all(imagePromises)
  }
}

