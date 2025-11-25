import { useRef, useImperativeHandle, forwardRef, useCallback } from "react"
import { SeriesData } from "@/types"
import { useImageConverter } from "@/hooks/useImageConverter"
import { BannerExportService } from "@/services/bannerExportService"
import { BookCover } from "./BannerPreview/BookCover"
import { BannerTitle } from "./BannerPreview/BannerTitle"
import { SeriesProgress } from "./BannerPreview/SeriesProgress"

interface BannerPreviewProps {
  readonly data: SeriesData
  readonly onRemoveBook?: (bookId: string) => void
}

export interface BannerPreviewHandle {
  download: () => Promise<void>
}

export const BannerPreview = forwardRef<BannerPreviewHandle, BannerPreviewProps>(
  ({ data, onRemoveBook }, ref) => {
    const bannerRef = useRef<HTMLDivElement>(null)
    const { convertToBase64 } = useImageConverter()

    const handleDownload = useCallback(async (): Promise<void> => {
      if (!bannerRef.current) {
        return
      }

      try {
        await BannerExportService.exportBanner(bannerRef.current, data, {
          convertToBase64,
        })
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error generating banner:", error.message)
        } else {
          console.error("Error generating banner:", error)
        }
        alert("Erro ao gerar o banner. Tente novamente.")
      }
    }, [data, convertToBase64])

    useImperativeHandle(
      ref,
      () => ({
        download: handleDownload,
      }),
      [handleDownload]
    )

    return (
      <div className="absolute inset-0" style={{ width: "100vw", height: "100vh" }}>
        <div
          ref={bannerRef}
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundColor: data.background,
            width: "100vw",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {data.name && (
            <BannerTitle name={data.name} color={data.titleColor} font={data.titleFont} />
          )}

          {data.books.length > 0 ? (
            <>
              <div
                className="flex flex-wrap justify-center items-center"
                style={{ gap: "60px", width: "100%" }}
              >
                {data.books.map((book) => (
                  <BookCover
                    key={book.id}
                    book={book}
                    background={data.background}
                    onRemove={onRemoveBook}
                  />
                ))}
              </div>
              <SeriesProgress books={data.books} titleColor={data.titleColor} />
            </>
          ) : (
            <div className="text-gray-400 text-center text-2xl">
              Adicione livros para ver o preview
            </div>
          )}
        </div>
      </div>
    )
  }
)

BannerPreview.displayName = "BannerPreview"

