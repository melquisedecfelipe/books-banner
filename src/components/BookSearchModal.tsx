import { memo, useState, useCallback, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Book, BookStatus } from "@/types"
import { Search, Loader2, CheckCircle2 } from "lucide-react"
import { useBookSearch, type BookSearchResult } from "@/hooks/useBookSearch"

interface BookSearchModalProps {
  readonly onAddBook: (book: Book) => void
  readonly trigger: React.ReactNode
}

interface StatusOption {
  readonly value: BookStatus
  readonly label: string
}

const STATUS_OPTIONS: readonly StatusOption[] = [
  {
    value: "read",
    label: "Lido",
  },
  {
    value: "reading",
    label: "Em Andamento",
  },
  {
    value: "unread",
    label: "Sem Ler",
  },
] as const

const DEFAULT_BOOK_TITLE = "Livro"
const ENTER_KEY = "Enter"

function generateBookId(): string {
  return `search-${Date.now()}-${Math.random().toString(36).substring(7)}`
}

function isValidBookStatus(value: string): value is BookStatus {
  return STATUS_OPTIONS.some((option) => option.value === value)
}

function handleImageError(e: React.SyntheticEvent<HTMLImageElement>): void {
  const target = e.target as HTMLImageElement
  target.style.display = "none"
  const parent = target.parentElement
  if (parent) {
    parent.classList.add("bg-gray-200")
    parent.innerHTML =
      '<div class="w-full h-full flex items-center justify-center text-xs text-gray-500">Erro</div>'
  }
}

export const BookSearchModal = memo(function BookSearchModal({
  onAddBook,
  trigger,
}: BookSearchModalProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCover, setSelectedCover] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<BookStatus | null>(null)
  const { searchResults, isSearching, search, reset } = useBookSearch()

  const handleSearch = useCallback((): void => {
    void search(searchQuery)
    setSelectedCover(null)
    setSelectedStatus(null)
  }, [searchQuery, search])

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === ENTER_KEY) {
        handleSearch()
      }
    },
    [handleSearch]
  )

  const handleSelectCover = useCallback((thumbnail: string): void => {
    setSelectedCover(thumbnail)
    setSelectedStatus(null)
  }, [])

  const handleStatusChange = useCallback((value: string): void => {
    if (isValidBookStatus(value)) {
      setSelectedStatus(value)
    }
  }, [])

  const handleAddBook = useCallback((): void => {
    if (!selectedCover || !selectedStatus) {
      return
    }

    const book: Book = {
      id: generateBookId(),
      title: DEFAULT_BOOK_TITLE,
      thumbnail: selectedCover,
      status: selectedStatus,
      order: 0,
    }

    onAddBook(book)

    // Reset and close
    setOpen(false)
    setSearchQuery("")
    reset()
    setSelectedCover(null)
    setSelectedStatus(null)
  }, [selectedCover, selectedStatus, onAddBook, reset])

  const handleDialogChange = useCallback(
    (isOpen: boolean): void => {
      setOpen(isOpen)
      if (!isOpen) {
        setSearchQuery("")
        reset()
        setSelectedCover(null)
        setSelectedStatus(null)
      }
    },
    [reset]
  )

  const canAddBook = useMemo(
    (): boolean => selectedCover !== null && selectedStatus !== null,
    [selectedCover, selectedStatus]
  )

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] w-[calc(100vw-2rem)] sm:w-full overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Buscar Capas</DialogTitle>
          <DialogDescription>
            Pesquise pelo nome do livro ou série. Se não encontrar resultados, você pode fazer o upload manual da capa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Digite o nome do livro ou série..."
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isSearching} type="button">
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Search Results - Grid of Covers */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                Capas encontradas ({searchResults.length}):
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectCover(result.thumbnail)}
                    className={`relative aspect-[2/3] rounded-lg border-2 transition-colors overflow-hidden ${
                      selectedCover === result.thumbnail
                        ? "border-blue-500 ring-1 ring-blue-500"
                        : "border-border hover:border-blue-500/50"
                    }`}
                    type="button"
                  >
                    <img
                      src={result.thumbnail}
                      alt="Capa do livro"
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                    {selectedCover === result.thumbnail && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-blue-500" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status Selection */}
          {selectedCover && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Selecione o status do livro:</h3>
              <RadioGroup
                key={selectedCover}
                value={selectedStatus || undefined}
                onValueChange={handleStatusChange}
                className="flex flex-wrap gap-3 sm:gap-4"
              >
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <div key={value} className="flex items-center gap-2">
                    <RadioGroupItem value={value} id={value} />
                    <Label htmlFor={value} className="text-sm cursor-pointer whitespace-nowrap">
                      {label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button onClick={handleAddBook} disabled={!canAddBook} type="button" className="w-full sm:w-auto">
            Adicionar Livro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

