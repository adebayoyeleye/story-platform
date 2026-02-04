import * as React from "react"
import { cn } from "../../lib/cn"

type Props = {
  title: string
  description?: string
  defaultOpen?: boolean
  rightSlot?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Collapsible({
  title,
  description,
  defaultOpen = false,
  rightSlot,
  children,
  className,
}: Props) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <section className={cn("border rounded-md bg-card", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between gap-3 p-4 text-left",
          "hover:bg-muted/50 transition-colors"
        )}
        aria-expanded={open}
      >
        <div>
          <div className="font-semibold">{title}</div>
          {description && <div className="text-sm text-muted-foreground">{description}</div>}
        </div>

        <div className="flex items-center gap-3">
          {rightSlot}
          <span className="text-sm text-muted-foreground">{open ? "Hide" : "Show"}</span>
        </div>
      </button>

      {open && <div className="border-t p-4">{children}</div>}
    </section>
  )
}
