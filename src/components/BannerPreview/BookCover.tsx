import { memo, useMemo } from "react"
import { Book } from "@/types"
import { X } from "lucide-react"
import { NO_COVER_PLACEHOLDER } from "@/utils/constants"

interface BookCoverProps {
  readonly book: Book
  readonly background: string
  readonly onRemove?: (bookId: string) => void
}

const COVER_WIDTH = "220px"
const UNRELEASED_BACKGROUND_COLOR = "#fefefe"
const UNRELEASED_OPACITY = 0.7
const UNRELEASED_FONT_SIZE = "120px"
const UNRELEASED_QUESTION_MARK = "?"

export const BookCover = memo(function BookCover({
  book,
  background,
  onRemove,
}: BookCoverProps): JSX.Element {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    const target = e.target as HTMLImageElement
    target.style.display = "none"
  }

  const containerStyle = useMemo(
    () => ({
      width: COVER_WIDTH,
      flexShrink: 0,
    }),
    []
  )

  const noCoverStyle = useMemo(
    () => ({
      backgroundColor: NO_COVER_PLACEHOLDER.backgroundColor,
      color: NO_COVER_PLACEHOLDER.textColor,
      fontSize: `${NO_COVER_PLACEHOLDER.fontSize}px`,
      fontFamily: NO_COVER_PLACEHOLDER.fontFamily,
      borderWidth: `${NO_COVER_PLACEHOLDER.borderWidth}px`,
      borderStyle: NO_COVER_PLACEHOLDER.borderStyle,
      borderColor: NO_COVER_PLACEHOLDER.borderColor,
    }),
    []
  )

  return (
    <div className="relative group" style={containerStyle}>
      {book.thumbnail ? (
        <img
          src={book.thumbnail}
          alt={book.title || "Book cover"}
          className="w-full aspect-[2/3] object-cover"
          loading="lazy"
          onError={handleImageError}
        />
      ) : book.status === "unreleased" ? (
        <UnreleasedPlaceholder background={background} />
      ) : (
        <div
          className="w-full aspect-[2/3] flex items-center justify-center relative"
          style={noCoverStyle}
        >
          {NO_COVER_PLACEHOLDER.text}
        </div>
      )}

      {onRemove && (
        <button
          onClick={() => onRemove(book.id)}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
          aria-label="Remover livro"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
})

interface UnreleasedPlaceholderProps {
  readonly background: string
}

function UnreleasedPlaceholder({
  background,
}: UnreleasedPlaceholderProps): JSX.Element {
  const containerStyle = useMemo(
    () => ({
      backgroundColor: UNRELEASED_BACKGROUND_COLOR,
      opacity: UNRELEASED_OPACITY,
    }),
    []
  )

  const borderStyle = useMemo(
    () => ({
      borderColor: background,
    }),
    [background]
  )

  const questionMarkStyle = useMemo(
    () => ({
      fontSize: UNRELEASED_FONT_SIZE,
      lineHeight: "1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "serif",
      color: background,
      margin: 0,
      padding: 0,
    }),
    [background]
  )

  return (
    <div
      className="w-full aspect-[2/3] flex items-center justify-center relative overflow-hidden"
      style={containerStyle}
    >
      <div
        className="absolute inset-0 border-2 border-dashed pointer-events-none"
        style={borderStyle}
      />
      <span className="font-bold absolute inset-0 z-10" style={questionMarkStyle}>
        {UNRELEASED_QUESTION_MARK}
      </span>
    </div>
  )
}

