import { memo, useMemo } from "react"
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
} as const

const PROGRESS_CONTAINER_STYLES = {
  marginTop: "48px",
  gap: `${PROGRESS_GAP}px`,
  maxWidth: "100%",
} as const

interface StatusIconProps {
  readonly book: Book
}

function StatusIcon({ book }: StatusIconProps): JSX.Element {
  const config = STATUS_ICON_CONFIG[book.status]
  const { Icon, colors } = config

  const iconContainerStyle = useMemo(
    () => ({
      width: `${PROGRESS_ICON_SIZE}px`,
      height: `${PROGRESS_ICON_SIZE}px`,
      borderWidth: `${PROGRESS_ICON_BORDER_WIDTH}px`,
      borderStyle: "solid" as const,
      borderColor: colors.border,
      backgroundColor: colors.background,
    }),
    [colors]
  )

  const iconStyle = useMemo(
    () => ({
      width: `${PROGRESS_ICON_INNER_SIZE}px`,
      height: `${PROGRESS_ICON_INNER_SIZE}px`,
      color: colors.icon,
    }),
    [colors.icon]
  )

  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center border-2"
      style={iconContainerStyle}
    >
      <Icon
        className="w-5 h-5"
        strokeWidth={PROGRESS_ICON_STROKE_WIDTH}
        style={iconStyle}
      />
    </div>
  )
}

export const SeriesProgress = memo(function SeriesProgress({
  books,
  titleColor,
}: SeriesProgressProps): JSX.Element | null {
  const sortedBooks = useMemo(
    () => [...books].sort((a, b) => a.order - b.order),
    [books]
  )

  const connectorLineStyle = useMemo(
    () => ({
      height: `${PROGRESS_LINE_HEIGHT}px`,
      width: `${PROGRESS_LINE_WIDTH}px`,
      marginLeft: `${PROGRESS_LINE_MARGIN}px`,
      marginRight: `${PROGRESS_LINE_MARGIN}px`,
      backgroundColor: titleColor,
      border: "none" as const,
    }),
    [titleColor]
  )

  if (sortedBooks.length === 0) {
    return null
  }

  return (
    <div
      className="flex items-center justify-start sm:justify-center gap-2 w-full overflow-x-auto sm:overflow-x-visible flex-nowrap sm:flex-wrap"
      style={{
        ...PROGRESS_CONTAINER_STYLES,
        WebkitOverflowScrolling: "touch",
        boxSizing: "border-box",
      }}
    >
      {sortedBooks.map((book, index) => {
        const showConnector = index < sortedBooks.length - 1

        return (
          <div
            key={book.id}
            className="flex items-center flex-shrink-0"
            style={{ gap: `${PROGRESS_GAP}px` }}
          >
            <div className="relative">
              <StatusIcon book={book} />
            </div>
            {showConnector && (
              <div
                data-progress-line="true"
                className="h-1 w-12 mx-1 flex-shrink-0"
                style={connectorLineStyle}
              />
            )}
          </div>
        )
      })}
    </div>
  )
})

