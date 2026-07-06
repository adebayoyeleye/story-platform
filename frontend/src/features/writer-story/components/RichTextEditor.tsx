import { useEffect, useMemo } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import Typography from "@tiptap/extension-typography"
import { cn } from "@/lib/cn"
import {
  PLACEHOLDER,
  TOOLBAR,
  type EditorMode,
} from "./editorConfig"

type Props = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  /** Selects extensions, toolbar buttons, and output post-processing. */
  mode?: EditorMode
}

const EMPTY_DOC = "<p></p>"

export function RichTextEditor({
  value,
  onChange,
  disabled = false,
  mode = "prose",
}: Props) {
  const flags = TOOLBAR[mode]

  // Mode-specific StarterKit configuration. Poems disable headings and
  // lists at the schema level — disabling at the toolbar alone would
  // still let a paste insert them. Schema is the only honest gate.
  const starterKit = useMemo(() => {
    if (mode === "poem") {
      return StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        horizontalRule: false,
        codeBlock: false,
      })
    }
    // prose + article: stock StarterKit
    return StarterKit
  }, [mode])

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      starterKit,
      TextAlign.configure({
        types: ["paragraph"],
        alignments: ["left", "center", "right"],
      }),
      Placeholder.configure({
        placeholder: PLACEHOLDER[mode],
      }),
      CharacterCount,
      Typography, // smart quotes, em-dashes, ellipsis. Off-by-default unwanted? It's prose; we want it.
    ],
    content: value || EMPTY_DOC,
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[320px] rounded-md border border-input bg-background px-4 py-3",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background",
          // Reading-style body inside the editor so writers see what
          // readers will see. font-serif + read-body sizing.
          "font-serif",
          // Poems preserve whitespace at the schema can't fully enforce
          // — display-time CSS finishes the job.
          mode === "poem" && "whitespace-pre-wrap"
        ),
        // CRITICAL for poems: schema preserves blank lines (paragraph
        // breaks) but leading spaces in a line need this hint or the
        // browser may collapse them on render inside contentEditable.
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [editor, disabled])

  useEffect(() => {
    if (!editor) return
    const next = value || EMPTY_DOC
    if (editor.getHTML() !== next) {
      editor.commands.setContent(next, { emitUpdate: false })
    }
  }, [editor, value])

  if (!editor) return null

  return (
    <div className="grid gap-2">
      <Toolbar editor={editor} flags={flags} disabled={disabled} />
      <EditorContent editor={editor} />
    </div>
  )
}

// ---------- Toolbar ----------

function Toolbar({
  editor,
  flags,
  disabled,
}: {
  editor: NonNullable<ReturnType<typeof useEditor>>
  flags: ReturnType<() => typeof TOOLBAR[EditorMode]>
  disabled: boolean
}) {
  return (
    <div
      className="flex flex-wrap gap-1 border border-border rounded-md p-1 bg-surface-muted/40"
      role="toolbar"
      aria-label="Formatting"
    >
      {flags.bold && (
        <ToolButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
          label="Bold"
        >
          <span className="font-bold">B</span>
        </ToolButton>
      )}

      {flags.italic && (
        <ToolButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
          label="Italic"
        >
          <span className="italic">I</span>
        </ToolButton>
      )}

      {flags.heading && (
        <>
          <ToolDivider />
          <ToolButton
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            disabled={disabled}
            label="Heading 2"
          >
            H2
          </ToolButton>
          <ToolButton
            active={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            disabled={disabled}
            label="Heading 3"
          >
            H3
          </ToolButton>
        </>
      )}

      {(flags.list || flags.blockquote) && <ToolDivider />}

      {flags.list && (
        <>
          <ToolButton
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
            label="Bullet list"
          >
            •
          </ToolButton>
          <ToolButton
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={disabled}
            label="Numbered list"
          >
            1.
          </ToolButton>
        </>
      )}

      {flags.blockquote && (
        <ToolButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
          label="Quote"
        >
          “
        </ToolButton>
      )}

      <ToolDivider />

      {flags.alignLeft && (
        <ToolButton
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          disabled={disabled}
          label="Align left"
        >
          ⇤
        </ToolButton>
      )}

      {flags.alignCenter && (
        <ToolButton
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          disabled={disabled}
          label="Align center"
        >
          ⇔
        </ToolButton>
      )}

      {flags.alignRight && (
        <ToolButton
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          disabled={disabled}
          label="Align right"
        >
          ⇥
        </ToolButton>
      )}
    </div>
  )
}

function ToolButton({
  active,
  onClick,
  disabled,
  label,
  children,
}: {
  active: boolean
  onClick: () => void
  disabled: boolean
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-sm text-sm",
        "text-muted-foreground hover:text-foreground hover:bg-surface",
        active && "bg-surface text-foreground shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "transition-colors"
      )}
    >
      {children}
    </button>
  )
}

function ToolDivider() {
  return <span aria-hidden="true" className="w-px self-stretch bg-border mx-1" />
}