import { useCallback } from "react"
import { isValidImageUrl } from "@/utils/validation"

const PROXY_URL = "https://api.allorigins.win/raw?url="

/**
 * Converts an image URL to base64
 * Handles CORS issues with fallback to proxy
 */
export function useImageConverter() {
  const convertToBase64 = useCallback(async (url: string): Promise<string> => {
    if (!isValidImageUrl(url)) {
      throw new Error("Invalid image URL")
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            reject(new Error("Could not get canvas context"))
            return
          }

          ctx.drawImage(img, 0, 0)
          const base64 = canvas.toDataURL("image/png")
          resolve(base64)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        // Fallback to proxy if CORS fails
        const proxyUrl = `${PROXY_URL}${encodeURIComponent(url)}`
        fetch(proxyUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Proxy request failed")
            }
            return response.blob()
          })
          .then((blob) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              const result = reader.result
              if (typeof result === "string") {
                resolve(result)
              } else {
                reject(new Error("Failed to read blob"))
              }
            }
            reader.onerror = () => reject(new Error("Failed to read blob"))
            reader.readAsDataURL(blob)
          })
          .catch(() => {
            // Last fallback: return original URL
            resolve(url)
          })
      }

      img.src = url
    })
  }, [])

  return { convertToBase64 }
}

