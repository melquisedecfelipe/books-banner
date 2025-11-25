import { useState, useCallback, useMemo } from "react"
import { Book } from "@/types"

interface UseBooksReturn {
  books: readonly Book[]
  addBook: (book: Book) => void
  removeBook: (bookId: string) => void
  updateBookOrder: (bookId: string, newOrder: number) => void
  booksCount: number
}

export function useBooks(): UseBooksReturn {
  const [books, setBooks] = useState<readonly Book[]>([])

  const addBook = useCallback((book: Book) => {
    setBooks((prev) => {
      const newBook: Book = {
        ...book,
        order: prev.length,
      }
      return [...prev, newBook]
    })
  }, [])

  const removeBook = useCallback((bookId: string) => {
    setBooks((prev) => {
      const filtered = prev.filter((b) => b.id !== bookId)
      return filtered.map((book, index) => ({ ...book, order: index }))
    })
  }, [])

  const updateBookOrder = useCallback((bookId: string, newOrder: number) => {
    setBooks((prev) => {
      const bookIndex = prev.findIndex((b) => b.id === bookId)
      if (bookIndex === -1) return prev

      const newBooks = [...prev]
      const [movedBook] = newBooks.splice(bookIndex, 1)
      newBooks.splice(newOrder, 0, { ...movedBook, order: newOrder })

      return newBooks.map((book, index) => ({ ...book, order: index }))
    })
  }, [])

  const booksCount = useMemo(() => books.length, [books])

  return {
    books,
    addBook,
    removeBook,
    updateBookOrder,
    booksCount,
  }
}

