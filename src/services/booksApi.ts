interface OpenLibraryDoc {
  readonly key: string
  readonly title: string
  readonly author_name?: readonly string[]
  readonly first_publish_year?: number
  readonly isbn?: readonly string[]
  readonly cover_i?: number
  readonly cover_edition_key?: string
  readonly language?: readonly string[]
  readonly edition_key?: readonly string[]
}

interface OpenLibraryResponse {
  readonly docs: readonly OpenLibraryDoc[]
  readonly numFound: number
}

export interface BookVolume {
  readonly id: string
  readonly title: string
  readonly authors?: readonly string[]
  readonly publishedDate?: number
  readonly isbn?: string
  readonly coverId?: number
  readonly coverEditionKey?: string
  readonly thumbnail?: string
}

const OPEN_LIBRARY_BASE_URL = "https://openlibrary.org"
const OPEN_LIBRARY_COVERS_BASE_URL = "https://covers.openlibrary.org"
const MAX_RESULTS = 40
const SEARCH_LIMIT = 100

const PORTUGUESE_LANGUAGE_CODES = ["por", "pt", "pt-BR", "pt-PT", "por-BR", "por-PT"] as const

/**
 * Validates search query
 */
function validateSearchQuery(query: string): string {
  const sanitized = query.trim().slice(0, 200)
  if (sanitized.length === 0) {
    throw new Error("Search query cannot be empty")
  }
  return sanitized
}

/**
 * Checks if a document is in Portuguese
 */
function isPortugueseBook(doc: OpenLibraryDoc): boolean {
  if (!doc.language || doc.language.length === 0) {
    return false
  }

  return doc.language.some((lang) =>
    PORTUGUESE_LANGUAGE_CODES.some((code) =>
      lang.toLowerCase().includes(code.toLowerCase())
    )
  )
}

/**
 * Checks if a document has a cover
 */
function hasCover(doc: OpenLibraryDoc): boolean {
  return !!(doc.cover_i || doc.cover_edition_key || doc.isbn)
}

/**
 * Generates thumbnail URL from document data
 */
function generateThumbnailUrl(doc: OpenLibraryDoc): string | undefined {
  if (doc.cover_i) {
    return `${OPEN_LIBRARY_COVERS_BASE_URL}/b/id/${doc.cover_i}-M.jpg`
  }

  const isbn = doc.isbn?.[0] || doc.isbn?.[1]
  if (isbn) {
    return `${OPEN_LIBRARY_COVERS_BASE_URL}/b/isbn/${isbn}-M.jpg`
  }

  const coverEditionKey = doc.cover_edition_key || doc.edition_key?.[0]
  if (coverEditionKey) {
    return `${OPEN_LIBRARY_COVERS_BASE_URL}/b/olid/${coverEditionKey}-M.jpg`
  }

  return undefined
}

/**
 * Maps OpenLibrary document to BookVolume
 */
function mapToBookVolume(doc: OpenLibraryDoc): BookVolume | null {
  if (!doc.title || !hasCover(doc)) {
    return null
  }

  const thumbnail = generateThumbnailUrl(doc)
  if (!thumbnail) {
    return null
  }

  const isbn = doc.isbn?.[0] || doc.isbn?.[1]

  return {
    id: doc.key,
    title: doc.title,
    authors: doc.author_name,
    publishedDate: doc.first_publish_year,
    isbn,
    coverId: doc.cover_i,
    coverEditionKey: doc.cover_edition_key || doc.edition_key?.[0],
    thumbnail,
  }
}

/**
 * Searches for books in Open Library API
 * @param query - Search query string
 * @returns Promise with array of BookVolume results
 */
export async function searchBooks(query: string): Promise<readonly BookVolume[]> {
  try {
    const sanitizedQuery = validateSearchQuery(query)
    const searchParams = new URLSearchParams({
      q: sanitizedQuery,
      limit: String(SEARCH_LIMIT),
      fields: "key,title,author_name,first_publish_year,isbn,cover_i,cover_edition_key,language,edition_key",
    })

    const url = `${OPEN_LIBRARY_BASE_URL}/search.json?${searchParams.toString()}`
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch books: ${response.status} ${response.statusText}`)
    }

    const data: OpenLibraryResponse = await response.json()

    if (!data.docs || data.docs.length === 0) {
      return []
    }

    // Filter Portuguese books with covers
    const portugueseBooks = data.docs.filter(
      (doc) => doc.title && hasCover(doc) && isPortugueseBook(doc)
    )

    if (portugueseBooks.length === 0) {
      return []
    }

    // Map to BookVolume and filter out nulls
    const volumes = portugueseBooks
      .map(mapToBookVolume)
      .filter((volume): volume is BookVolume => volume !== null)
      .slice(0, MAX_RESULTS)

    return volumes
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error searching books:", error.message)
    } else {
      console.error("Error searching books:", error)
    }
    return []
  }
}

/**
 * Gets thumbnail URL from BookVolume
 * @param volume - BookVolume to extract thumbnail from
 * @returns Thumbnail URL or undefined
 */
export function getBookThumbnail(volume: BookVolume): string | undefined {
  return volume.thumbnail
}

