import { useState, useCallback } from "react"
import { searchBooks } from "@/services/booksSearchService"
import { useToast } from "@/hooks/use-toast"

export interface BookSearchResult {
  readonly id: string
  readonly thumbnail: string
}

interface UseBookSearchReturn {
  readonly searchResults: readonly BookSearchResult[]
  readonly isSearching: boolean
  readonly search: (query: string) => Promise<void>
  readonly reset: () => void
}

const EMPTY_QUERY_MESSAGE = {
  title: "Campo vazio",
  description: "Por favor, digite o nome do livro ou série",
} as const

const NO_RESULTS_MESSAGE = {
  title: "Nenhum resultado encontrado",
  description: "Não foram encontradas capas. Por favor, tente novamente ou faça o upload da capa manualmente.",
} as const

const SEARCH_ERROR_MESSAGE = {
  title: "Erro na busca",
} as const

const UNKNOWN_ERROR_MESSAGE = "Erro desconhecido"

export function useBookSearch(): UseBookSearchReturn {
  const [searchResults, setSearchResults] = useState<readonly BookSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const search = useCallback(
    async (query: string): Promise<void> => {
      const trimmedQuery = query.trim()
      if (!trimmedQuery) {
        toast(EMPTY_QUERY_MESSAGE)
        return
      }

      setIsSearching(true)
      setSearchResults([])

      try {
        const results = await searchBooks(trimmedQuery)

        if (results.length === 0) {
          toast(NO_RESULTS_MESSAGE)
          return
        }

        setSearchResults(results)
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE

        toast({
          ...SEARCH_ERROR_MESSAGE,
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsSearching(false)
      }
    },
    [toast]
  )

  const reset = useCallback((): void => {
    setSearchResults([])
    setIsSearching(false)
  }, [])

  return {
    searchResults,
    isSearching,
    search,
    reset,
  }
}

