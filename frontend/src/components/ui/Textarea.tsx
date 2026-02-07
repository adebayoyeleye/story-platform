import * as React from "react"
import { cn } from "@/lib/cn"

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: Props) {
  return (
    <textarea
      className={cn(
        "min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      {...props}
    />
  )
}
