import { memo } from "react"
import { Book, BookStatus } from "@/types"
import { Check, BookOpen, Circle, Calendar, LucideIcon } from "lucide-react"
import {
  PROGRESS_ICON_SIZE,
  PROGRESS_ICON_INNER_SIZE,
  PROGRESS_ICON_BORDER_WIDTH,
  PROGRESS_ICON_STROKE_WIDTH,
  PROGRESS_LINE_HEIGHT,
  PROGRESS_LINE_WIDTH,
  PROGRESS_LINE_MARGIN,
  PROGRESS_GAP,
  STATUS_COLORS,
} from "@/utils/progressConstants"

interface SeriesProgressProps {
  readonly books: readonly Book[]
  readonly titleColor: string
}

interface StatusIconConfig {
  readonly Icon: LucideIcon
  readonly colors: {
    readonly background: string
    readonly border: string
    readonly icon: string
  }
}

const STATUS_ICON_CONFIG: Record<BookStatus, StatusIconConfig> = {
  read: {
    Icon: Check,
    colors: STATUS_COLORS.read,
  },
  reading: {
    Icon: BookOpen,
    colors: STATUS_COLORS.reading,
  },
  unread: {
    Icon: Circle,
    colors: STATUS_COLORS.unread,
  },
  unreleased: {
    Icon: Calendar,
    colors: STATUS_COLORS.unreleased,
  },
}

export const SeriesProgress = memo(function SeriesProgress({
  books,
  titleColor,
}: SeriesProgressProps) {
  if (books.length === 0) {
    return null
  }

  const sortedBooks = [...books].sort((a, b) => a.order - b.order)

  const getStatusIcon = (book: Book): JSX.Element => {
    const config = STATUS_ICON_CONFIG[book.status]
    const { Icon, colors } = config

    return (
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center border-2"
        style={{
          width: `${PROGRESS_ICON_SIZE}px`,
          height: `${PROGRESS_ICON_SIZE}px`,
          borderWidth: `${PROGRESS_ICON_BORDER_WIDTH}px`,
          borderStyle: "solid",
          borderColor: colors.border,
          backgroundColor: colors.background,
        }}
      >
        <Icon
          className="w-5 h-5"
          strokeWidth={PROGRESS_ICON_STROKE_WIDTH}
          style={{
            width: `${PROGRESS_ICON_INNER_SIZE}px`,
            height: `${PROGRESS_ICON_INNER_SIZE}px`,
            color: colors.icon,
          }}
        />
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-center gap-2"
      style={{
        marginTop: "48px",
        gap: `${PROGRESS_GAP}px`,
      }}
    >
      {sortedBooks.map((book, index) => {
        const showConnector = index < sortedBooks.length - 1

        return (
          <div
            key={book.id}
            className="flex items-center"
            style={{ gap: `${PROGRESS_GAP}px` }}
          >
            <div className="relative">{getStatusIcon(book)}</div>
            {showConnector && (
              <div
                data-progress-line="true"
                className="h-1 w-12 mx-1"
                style={{
                  height: `${PROGRESS_LINE_HEIGHT}px`,
                  width: `${PROGRESS_LINE_WIDTH}px`,
                  marginLeft: `${PROGRESS_LINE_MARGIN}px`,
                  marginRight: `${PROGRESS_LINE_MARGIN}px`,
                  backgroundColor: titleColor,
                  border: "none",
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
})

