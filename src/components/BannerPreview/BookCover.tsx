import { memo } from "react"
import { Book } from "@/types"
import { X } from "lucide-react"

interface BookCoverProps {
  readonly book: Book
  readonly background: string
  readonly onRemove?: (bookId: string) => void
}

export const BookCover = memo(function BookCover({
  book,
  background,
  onRemove,
}: BookCoverProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    const target = e.target as HTMLImageElement
    target.style.display = "none"
  }

  return (
    <div className="relative group" style={{ width: "220px", flexShrink: 0 }}>
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
        <div className="w-full aspect-[2/3] bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
          Sem capa
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

function UnreleasedPlaceholder({ background }: UnreleasedPlaceholderProps) {
  return (
    <div
      className="w-full aspect-[2/3] border-2 border-dashed flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: "#fefefe",
        opacity: 0.7,
      }}
    >
      <div
        className="absolute inset-0 border-2 border-dashed pointer-events-none"
        style={{
          borderColor: background,
        }}
      />
      <span
        className="font-bold absolute inset-0 z-10"
        style={{
          fontSize: "120px",
          lineHeight: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          color: background,
          margin: 0,
          padding: 0,
        }}
      >
        ?
      </span>
    </div>
  )
}

