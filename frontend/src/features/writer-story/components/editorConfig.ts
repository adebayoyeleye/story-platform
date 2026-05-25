import type { ContentType } from "@/types"

/**
 * The editor mode controls which Tiptap extensions load, which toolbar
 * buttons render, and how output is post-processed.
 *
 * Modes are derived from ContentType — but kept as their own narrow
 * union so future variants (a hypothetical "lyrics" mode, a "newsletter"
 * mode) can be added without touching the domain.
 */
export type EditorMode = "prose" | "article" | "poem"

export function modeForContentType(type: ContentType): EditorMode {
  switch (type) {
    case "STORY_WITH_CHAPTERS":
    case "SHORT_STORY":
      return "prose"
    case "ARTICLE":
      return "article"
    case "POEM":
      return "poem"
  }
}

/**
 * Per-mode placeholder text. Shown when the editor is empty.
 * Short and inviting — never bossy ("Start writing your masterpiece!").
 */
export const PLACEHOLDER: Record<EditorMode, string> = {
  prose:   "Begin the chapter…",
  article: "Begin the article…",
  poem:    "Begin the poem…",
}

/**
 * Per-mode toolbar visibility flags. Keep this declarative — adding a
 * new button is a matter of adding a flag and a button definition, not
 * re-wiring conditionals.
 */
export type ToolbarFlags = {
  bold: boolean
  italic: boolean
  heading: boolean
  list: boolean
  blockquote: boolean
  alignLeft: boolean
  alignCenter: boolean
  alignRight: boolean
}

export const TOOLBAR: Record<EditorMode, ToolbarFlags> = {
  prose: {
    bold: true, italic: true,
    heading: true, list: true, blockquote: true,
    alignLeft: true, alignCenter: true, alignRight: false,
  },
  article: {
    bold: true, italic: true,
    heading: true, list: true, blockquote: true,
    alignLeft: true, alignCenter: true, alignRight: false,
  },
  poem: {
    // Poems strip down. Headings and lists make no sense in verse.
    // Right-align IS exposed because poets sometimes want it for
    // shaped poems.
    bold: true, italic: true,
    heading: false, list: false, blockquote: false,
    alignLeft: true, alignCenter: true, alignRight: true,
  },
}