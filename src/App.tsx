import { useState, useRef, useCallback } from "react"
import { Book } from "./types"
import { BannerPreview, BannerPreviewHandle } from "./components/BannerPreview"
import { BannerControls } from "./components/BannerControls"
import { useBannerConfig } from "./hooks/useBannerConfig"
import { useBooks } from "./hooks/useBooks"
import { Toaster } from "./components/ui/toaster"

function App(): JSX.Element {
  const { books, addBook, removeBook } = useBooks()
  const {
    config,
    seriesData,
    updateSeriesName,
    updateBackground,
    updateTitleColor,
    updateTitleFont,
  } = useBannerConfig(books)

  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const bannerPreviewRef = useRef<BannerPreviewHandle>(null)

  const handleSelectBook = useCallback(
    (book: Book) => {
      addBook(book)
    },
    [addBook]
  )

  const handleRemoveBook = useCallback(
    (bookId: string) => {
      removeBook(bookId)
    },
    [removeBook]
  )

  const handleDownload = useCallback(async (): Promise<void> => {
    setIsGenerating(true)
    try {
      await bannerPreviewRef.current?.download()
    } finally {
      setIsGenerating(false)
    }
  }, [])

  return (
    <>
      <div
        className="relative w-full"
        style={{ minHeight: "100vh" }}
      >
        <BannerControls
          config={config}
          isGenerating={isGenerating}
          onSeriesNameChange={updateSeriesName}
          onTitleFontChange={updateTitleFont}
          onTitleColorChange={updateTitleColor}
          onBackgroundChange={updateBackground}
          onAddBook={handleSelectBook}
          onDownload={handleDownload}
        />

        <BannerPreview
          ref={bannerPreviewRef}
          data={seriesData}
          onRemoveBook={handleRemoveBook}
        />
      </div>
      <Toaster />
    </>
  )
}

export default App


