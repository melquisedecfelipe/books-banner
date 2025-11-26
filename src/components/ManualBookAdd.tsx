import { memo, useRef, useCallback } from "react"
import { ButtonGroup, ButtonGroupItem } from "./ui/button-group"
import { Book, BookStatus } from "@/types"
import { isValidImageFile } from "@/utils/validation"
import { CheckCircle2, BookOpen, Circle, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ManualBookAddProps {
  readonly onAddBook: (book: Book) => void
}

type FileInputStatus = "read" | "reading" | "unread"

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/jpg,image/png,image/webp,image/gif"
const INVALID_IMAGE_MESSAGE = "Por favor, selecione uma imagem válida (JPEG, PNG, WebP ou GIF, máximo 5MB)"
const FILE_READ_ERROR_MESSAGE = "Erro ao ler o arquivo. Tente novamente."

const STATUS_BUTTONS = [
  {
    status: "read" as const,
    label: "Lido",
    Icon: CheckCircle2,
    iconColor: "text-green-600",
  },
  {
    status: "reading" as const,
    label: "Em Andamento",
    Icon: BookOpen,
    iconColor: "text-blue-600",
  },
  {
    status: "unread" as const,
    label: "Sem Ler",
    Icon: Circle,
    iconColor: "text-gray-600",
  },
] as const

export const ManualBookAdd = memo(function ManualBookAdd({
  onAddBook,
}: ManualBookAddProps): JSX.Element {
  const { toast } = useToast()

  const fileInputRefs = {
    read: useRef<HTMLInputElement>(null),
    reading: useRef<HTMLInputElement>(null),
    unread: useRef<HTMLInputElement>(null),
  }

  const createBookFromFile = useCallback(
    (file: File, status: BookStatus): void => {
      if (!isValidImageFile(file)) {
        toast({
          title: "Arquivo inválido",
          description: INVALID_IMAGE_MESSAGE,
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>): void => {
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
      reader.onerror = (): void => {
        toast({
          title: "Erro ao ler arquivo",
          description: FILE_READ_ERROR_MESSAGE,
          variant: "destructive",
        })
      }
      reader.readAsDataURL(file)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toast, onAddBook]
  )

  const handleFileSelect = useCallback(
    (status: BookStatus) => {
      return (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0]
        if (!file) {
          return
        }

        createBookFromFile(file, status)
      }
    },
    [createBookFromFile]
  )

  const handleAddUnreleased = useCallback((): void => {
    const book: Book = {
      id: `unreleased-${Date.now()}`,
      status: "unreleased",
      order: 0,
    }
    onAddBook(book)
  }, [onAddBook])

  const handleOpenFileSelector = useCallback((status: FileInputStatus): void => {
    fileInputRefs[status].current?.click()
  }, [])

  return (
    <>
      {STATUS_BUTTONS.map(({ status }) => (
        <input
          key={status}
          ref={fileInputRefs[status]}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          onChange={handleFileSelect(status)}
          className="hidden"
          id={`cover-upload-${status}`}
          aria-label={`Upload cover for ${status} book`}
        />
      ))}

      <ButtonGroup className="h-8">
        {STATUS_BUTTONS.map(({ status, label, Icon, iconColor }, index) => (
          <ButtonGroupItem
            key={status}
            onClick={() => handleOpenFileSelector(status)}
            className="h-8 text-xs px-3"
            type="button"
            isFirst={index === 0}
          >
            <Icon className={`w-3 h-3 mr-1.5 ${iconColor}`} />
            {label}
          </ButtonGroupItem>
        ))}

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
})


