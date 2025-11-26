import { Book, BookStatus } from "@/types"
import { Card, CardContent } from "./ui/card"
import { Select } from "./ui/select"
import { cn } from "@/lib/utils"

interface BookCardProps {
  book: Book
  onStatusChange: (bookId: string, status: BookStatus) => void
  onRemove: (bookId: string) => void
}

const statusOptions: { value: BookStatus; label: string }[] = [
  { value: "read", label: "Lido" },
  { value: "reading", label: "Lendo" },
  { value: "unread", label: "Sem ler" },
  { value: "unreleased", label: "Sem lançar" },
]

const statusColors: Record<BookStatus, string> = {
  read: "border-green-500 bg-green-50",
  reading: "border-blue-500 bg-blue-50",
  unread: "border-gray-300 bg-gray-50",
  unreleased: "border-orange-500 bg-orange-50",
}

export function BookCard({ book, onStatusChange, onRemove }: BookCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", statusColors[book.status])}>
      <CardContent className="p-3">
        <div className="relative">
          {book.thumbnail ? (
            <img
              src={book.thumbnail}
              alt={book.title}
              className="w-full aspect-[2/3] object-cover rounded-md mb-2"
            />
          ) : book.status === "unreleased" ? (
            <div className="w-full aspect-[2/3] bg-gray-100 border-2 border-dashed border-gray-400 rounded-md mb-2 flex items-center justify-center relative">
              <div className="relative z-10">
                <span className="text-4xl text-gray-600 font-bold">?</span>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-[2/3] bg-gray-200 rounded-md mb-2 flex items-center justify-center text-gray-400 text-xs">
              Sem capa
            </div>
          )}
          <button
            onClick={() => onRemove(book.id)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            aria-label="Remover livro"
          >
            ×
          </button>
        </div>
        <div className="space-y-2">
          <Select
            value={book.status}
            onValueChange={(value) => onStatusChange(book.id, value as BookStatus)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

