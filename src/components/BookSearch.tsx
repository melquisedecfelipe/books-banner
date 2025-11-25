import { ManualBookAdd } from "./ManualBookAdd"
import { Book } from "@/types"

interface BookSearchProps {
  readonly onAddManualBook: (book: Book) => void
}

export function BookSearch({ onAddManualBook }: BookSearchProps) {
  return <ManualBookAdd onAddBook={onAddManualBook} />
}

