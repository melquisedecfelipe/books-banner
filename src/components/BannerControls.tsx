import { memo } from "react"
import { Input } from "./ui/input"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { BookSearch } from "./BookSearch"
import { Download, Loader2 } from "lucide-react"
import { BannerConfig, Book } from "@/types"
import { FONT_OPTIONS } from "@/utils/constants"

interface BannerControlsProps {
  readonly config: BannerConfig
  readonly isGenerating: boolean
  readonly onSeriesNameChange: (name: string) => void
  readonly onTitleFontChange: (font: string) => void
  readonly onTitleColorChange: (color: string) => void
  readonly onBackgroundChange: (color: string) => void
  readonly onAddBook: (book: Book) => void
  readonly onDownload: () => void
}

export const BannerControls = memo(function BannerControls({
  config,
  isGenerating,
  onSeriesNameChange,
  onTitleFontChange,
  onTitleColorChange,
  onBackgroundChange,
  onAddBook,
  onDownload,
}: BannerControlsProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 bg-transparent pointer-events-none">
      <div className="flex justify-center p-2 sm:p-4 pointer-events-auto">
        <Card className="w-full sm:w-auto">
          <CardContent className="p-3">
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
              {/* Row 1: Nome da Série e Fonte do Título */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1">
                  <label className="text-xs font-medium whitespace-nowrap">
                    Nome da Série
                  </label>
                  <Input
                    value={config.seriesName}
                    onChange={(e) => onSeriesNameChange(e.target.value)}
                    className="h-8 text-sm w-full sm:w-48"
                    maxLength={100}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1">
                  <label className="text-xs font-medium whitespace-nowrap">
                    Fonte do Título
                  </label>
                  <select
                    value={config.titleFont}
                    onChange={(e) => onTitleFontChange(e.target.value)}
                    className="h-8 text-xs px-2 rounded-md border border-input bg-background w-full sm:w-auto"
                  >
                    {FONT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Cores */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium whitespace-nowrap">
                  Cores
                </label>
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground whitespace-nowrap">
                      Título
                    </label>
                    <Input
                      type="color"
                      value={config.titleColor}
                      onChange={(e) => onTitleColorChange(e.target.value)}
                      className="w-10 h-8 p-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground whitespace-nowrap">
                      Fundo
                    </label>
                    <Input
                      type="color"
                      value={config.background}
                      onChange={(e) => onBackgroundChange(e.target.value)}
                      className="w-10 h-8 p-1"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Adicionar Livro e Botão Baixar */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1">
                  <label className="text-xs font-medium whitespace-nowrap">
                    Adicionar Livro
                  </label>
                  <div className="w-full sm:w-auto overflow-x-auto">
                    <BookSearch onAddManualBook={onAddBook} />
                  </div>
                </div>

                <Button
                  onClick={onDownload}
                  disabled={isGenerating}
                  size="sm"
                  className="h-8 w-full sm:w-auto"
                  type="button"
                >
                  {isGenerating ? (
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3 mr-1.5" />
                  )}
                  {isGenerating ? "Baixando..." : "Baixar"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

