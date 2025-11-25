import { useRef, useCallback } from "react"
import { ButtonGroup, ButtonGroupItem } from "./ui/button-group"
import { Book, BookStatus } from "@/types"
import { isValidImageFile } from "@/utils/validation"
import { CheckCircle2, BookOpen, Circle, Calendar } from "lucide-react"

interface ManualBookAddProps {
  readonly onAddBook: (book: Book) => void
}

type FileInputStatus = "read" | "reading" | "unread"

export function ManualBookAdd({ onAddBook }: ManualBookAddProps) {
  const fileInputRefs = {
    read: useRef<HTMLInputElement>(null),
    reading: useRef<HTMLInputElement>(null),
    unread: useRef<HTMLInputElement>(null),
  }

  const handleFileSelect = useCallback(
    (status: BookStatus) => {
      return (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0]
        if (!file) {
          return
        }

        if (!isValidImageFile(file)) {
          alert("Por favor, selecione uma imagem válida (JPEG, PNG, WebP ou GIF, máximo 5MB)")
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result
          if (typeof result !== "string") {
            return
          }

          const book: Book = {
            id: `manual-${Date.now()}-${status}`,
            thumbnail: result,
            status,
            order: 0,
          }
          onAddBook(book)

          // Reset input
          const inputRef = fileInputRefs[status as FileInputStatus]
          if (inputRef.current) {
            inputRef.current.value = ""
          }
        }
        reader.onerror = () => {
          alert("Erro ao ler o arquivo. Tente novamente.")
        }
        reader.readAsDataURL(file)
      }
    },
    [onAddBook]
  )

  const handleAddUnreleased = useCallback(() => {
    const book: Book = {
      id: `unreleased-${Date.now()}`,
      status: "unreleased",
      order: 0,
    }
    onAddBook(book)
  }, [onAddBook])

  const handleOpenFileSelector = useCallback((status: FileInputStatus) => {
    fileInputRefs[status].current?.click()
  }, [])

  return (
    <>
      <input
        ref={fileInputRefs.read}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect("read")}
        className="hidden"
        id="cover-upload-read"
        aria-label="Upload cover for read book"
      />
      <input
        ref={fileInputRefs.reading}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect("reading")}
        className="hidden"
        id="cover-upload-reading"
        aria-label="Upload cover for reading book"
      />
      <input
        ref={fileInputRefs.unread}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect("unread")}
        className="hidden"
        id="cover-upload-unread"
        aria-label="Upload cover for unread book"
      />

      <ButtonGroup className="h-8">
        <ButtonGroupItem
          onClick={() => handleOpenFileSelector("read")}
          className="h-8 text-xs px-3"
          type="button"
          isFirst
        >
          <CheckCircle2 className="w-3 h-3 mr-1.5 text-green-600" />
          Lido
        </ButtonGroupItem>

        <ButtonGroupItem
          onClick={() => handleOpenFileSelector("reading")}
          className="h-8 text-xs px-3"
          type="button"
        >
          <BookOpen className="w-3 h-3 mr-1.5 text-blue-600" />
          Em Andamento
        </ButtonGroupItem>

        <ButtonGroupItem
          onClick={() => handleOpenFileSelector("unread")}
          className="h-8 text-xs px-3"
          type="button"
        >
          <Circle className="w-3 h-3 mr-1.5 text-gray-600" />
          Sem Ler
        </ButtonGroupItem>

        <ButtonGroupItem
          onClick={handleAddUnreleased}
          className="h-8 text-xs px-3"
          type="button"
          isLast
        >
          <Calendar className="w-3 h-3 mr-1.5 text-orange-600" />
          Não Lançado
        </ButtonGroupItem>
      </ButtonGroup>
    </>
  )
}

