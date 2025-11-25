import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  readonly orientation?: "horizontal" | "vertical"
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          "m-0",
          className
        )}
        role="group"
        {...props}
      />
    )
  }
)
ButtonGroup.displayName = "ButtonGroup"

interface ButtonGroupItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly isFirst?: boolean
  readonly isLast?: boolean
  readonly orientation?: "horizontal" | "vertical"
}

const ButtonGroupItem = React.forwardRef<
  HTMLButtonElement,
  ButtonGroupItemProps
>(
  (
    {
      className,
      isFirst = false,
      isLast = false,
      orientation = "horizontal",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          orientation === "horizontal"
            ? cn(
                "border-r-0",
                isFirst && "rounded-l-md",
                isLast && "rounded-r-md border-r",
                !isFirst && !isLast && "rounded-none"
              )
            : cn(
                "border-b-0",
                isFirst && "rounded-t-md",
                isLast && "rounded-b-md border-b",
                !isFirst && !isLast && "rounded-none"
              ),
          className
        )}
        {...props}
      />
    )
  }
)
ButtonGroupItem.displayName = "ButtonGroupItem"

export { ButtonGroup, ButtonGroupItem }

