import type { ContentFormat } from "@/types"

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

export function toEditorHtml(content: string, format?: ContentFormat): string {
  if (format === "RICH_TEXT_HTML") {
    return content || "<p></p>"
  }

  const trimmed = (content || "").trim()
  if (!trimmed) return "<p></p>"

  return trimmed
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("")
}