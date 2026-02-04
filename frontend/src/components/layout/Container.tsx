import * as React from "react"
import { cn } from "@/lib/cn"

type Props = React.HTMLAttributes<HTMLDivElement>

export function Container({ className, ...props }: Props) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    />
  )
}
