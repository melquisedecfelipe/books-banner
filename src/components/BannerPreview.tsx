import { useRef, useImperativeHandle, forwardRef, useCallback, useMemo } from "react"
import { SeriesData } from "@/types"
import { useImageConverter } from "@/hooks/useImageConverter"
import { BannerExportService } from "@/services/bannerExportService"
import { BookCover } from "./BannerPreview/BookCover"
import { BannerTitle } from "./BannerPreview/BannerTitle"
import { SeriesProgress } from "./BannerPreview/SeriesProgress"
import { useToast } from "@/hooks/use-toast"

interface BannerPreviewProps {
  readonly data: SeriesData
  readonly onRemoveBook?: (bookId: string) => void
}

export interface BannerPreviewHandle {
  readonly download: () => Promise<void>
}

const CONTAINER_STYLES = {
  minHeight: "100vh",
} as const

const BANNER_CONTENT_STYLES = {
  width: "100%",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
  boxSizing: "border-box" as const,
} as const

const BOOKS_CONTAINER_STYLES = {
  gap: "48px",
  width: "100%",
  maxWidth: "100%",
} as const

const ERROR_MESSAGE = "Erro ao gerar o banner. Tente novamente."

export const BannerPreview = forwardRef<BannerPreviewHandle, BannerPreviewProps>(
  ({ data, onRemoveBook }, ref) => {
    const bannerRef = useRef<HTMLDivElement>(null)
    const { convertToBase64 } = useImageConverter()
    const { toast } = useToast()

    const handleDownload = useCallback(async (): Promise<void> => {
      if (!bannerRef.current) {
        return
      }

      try {
        await BannerExportService.exportBanner(bannerRef.current, data, {
          convertToBase64,
        })
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error"
        
        toast({
          title: ERROR_MESSAGE,
          description: errorMessage,
          variant: "destructive",
        })
      }
    }, [data, convertToBase64, toast])

    useImperativeHandle(
      ref,
      () => ({
        download: handleDownload,
      }),
      [handleDownload]
    )

    const outerContainerStyle = useMemo(
      () => ({
        ...CONTAINER_STYLES,
        backgroundColor: data.background,
      }),
      [data.background]
    )

    const bannerContentStyle = useMemo(
      () => ({
        ...BANNER_CONTENT_STYLES,
        backgroundColor: data.background,
      }),
      [data.background]
    )

    return (
      <div
        className="relative sm:absolute sm:inset-0 w-full"
        style={outerContainerStyle}
      >
        <div
          ref={bannerRef}
          className="w-full sm:absolute sm:inset-0 sm:h-full"
          style={bannerContentStyle}
        >
          {data.name && (
            <BannerTitle name={data.name} color={data.titleColor} font={data.titleFont} />
          )}

          {data.books.length > 0 ? (
            <>
              <div
                className="flex flex-wrap justify-center items-center"
                style={BOOKS_CONTAINER_STYLES}
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

