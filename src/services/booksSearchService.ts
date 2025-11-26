interface BookSearchResult {
  readonly id: string
  readonly thumbnail: string
}

interface OpenLibraryWork {
  readonly key: string
  readonly cover_i?: number
}

interface OpenLibraryResponse {
  readonly docs?: readonly OpenLibraryWork[]
}

interface GoogleBooksVolume {
  readonly id: string
  readonly volumeInfo?: {
    readonly imageLinks?: {
      readonly thumbnail?: string
      readonly smallThumbnail?: string
      readonly medium?: string
      readonly large?: string
    }
  }
}

interface GoogleBooksResponse {
  readonly items?: readonly GoogleBooksVolume[]
}

const OPEN_LIBRARY_SEARCH_BASE = "https://openlibrary.org/search.json"
const OPEN_LIBRARY_COVERS_BASE = "https://covers.openlibrary.org/b/id"
const GOOGLE_BOOKS_API_BASE = "https://www.googleapis.com/books/v1/volumes"
const MAX_RESULTS = 50

/**
 * Searches for book covers using both Google Books and Open Library APIs
 * Returns only a list of cover image URLs
 */
export async function searchBooks(query: string): Promise<readonly BookSearchResult[]> {
  if (!query.trim()) {
    return []
  }

  try {
    const encodedQuery = encodeURIComponent(query)
    
    // Search both APIs in parallel
    const [openLibraryResults, googleBooksResults] = await Promise.allSettled([
      searchOpenLibrary(encodedQuery),
      searchGoogleBooks(encodedQuery),
    ])

    // Collect all cover URLs
    const coverUrls = new Set<string>()

    // Add Open Library covers
    if (openLibraryResults.status === "fulfilled") {
      openLibraryResults.value.forEach((cover) => {
        if (cover.thumbnail) {
          coverUrls.add(cover.thumbnail)
        }
      })
    }

    // Add Google Books covers
    if (googleBooksResults.status === "fulfilled") {
      googleBooksResults.value.forEach((cover) => {
        if (cover.thumbnail) {
          coverUrls.add(cover.thumbnail)
        }
      })
    }

    // Convert Set to array and create results
    const results: BookSearchResult[] = Array.from(coverUrls)
      .slice(0, MAX_RESULTS)
      .map((thumbnail, index) => ({
        id: `cover-${Date.now()}-${index}`,
        thumbnail,
      }))

    return results
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao buscar livros: ${error.message}`)
    }
    throw new Error("Erro desconhecido ao buscar livros")
  }
}

/**
 * Search Open Library for book covers
 */
async function searchOpenLibrary(query: string): Promise<readonly BookSearchResult[]> {
  const url = `${OPEN_LIBRARY_SEARCH_BASE}?q=${query}&fields=key,cover_i&limit=${MAX_RESULTS}`

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Books-Banner/1.0 (https://github.com/your-repo)",
    },
  })

  if (!response.ok) {
    return []
  }

  const data = (await response.json()) as OpenLibraryResponse

  if (!data.docs || data.docs.length === 0) {
    return []
  }

  return data.docs
    .filter((work) => work.cover_i)
    .map((work) => ({
      id: `${work.key.replace("/works/", "")}-${work.cover_i}`,
      thumbnail: `${OPEN_LIBRARY_COVERS_BASE}/${work.cover_i}-M.jpg`,
    }))
}

/**
 * Search Google Books for book covers
 */
async function searchGoogleBooks(query: string): Promise<readonly BookSearchResult[]> {
  const url = `${GOOGLE_BOOKS_API_BASE}?q=${query}&maxResults=${MAX_RESULTS}&langRestrict=pt`

  const response = await fetch(url)

  if (!response.ok) {
    return []
  }

  const data = (await response.json()) as GoogleBooksResponse

  if (!data.items || data.items.length === 0) {
    return []
  }

  return data.items
    .filter((volume) => volume.volumeInfo?.imageLinks)
    .map((volume) => {
      const imageLinks = volume.volumeInfo!.imageLinks!
      // Prefer medium, then large, then thumbnail
      const thumbnail =
        imageLinks.medium ||
        imageLinks.large ||
        imageLinks.thumbnail?.replace("&edge=curl", "").replace("zoom=1", "zoom=0") ||
        imageLinks.smallThumbnail?.replace("&edge=curl", "").replace("zoom=1", "zoom=0")

      return {
        id: volume.id,
        thumbnail: thumbnail || "",
      }
    })
    .filter((result) => result.thumbnail)
}

