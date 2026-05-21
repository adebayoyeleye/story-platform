import { useMemo } from "react"
import DOMPurify from "dompurify"

type Props = {
  html: string
}

export function RichTextContent({ html }: Props) {
  const sanitized = useMemo(() => {
    return DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
    })
  }, [html])

  return (
    <div
      className="story-richtext"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}