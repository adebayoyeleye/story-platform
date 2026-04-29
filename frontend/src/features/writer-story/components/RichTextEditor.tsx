import { useEffect } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import { Button } from "@/components/ui/Button"

type Props = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const EMPTY_DOC = "<p></p>"

export function RichTextEditor({ value, onChange, disabled = false }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["paragraph"],
        alignments: ["left", "center"],
      }),
    ],
    content: value || EMPTY_DOC,
    editorProps: {
      attributes: {
        class:
          "min-h-[320px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none",
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
      editor.commands.setContent(next, false)
    }
  }, [editor, value])

  if (!editor) return null

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
        >
          Bold
        </Button>

        <Button
          type="button"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
        >
          Italic
        </Button>

        <Button
          type="button"
          variant={editor.isActive({ textAlign: "left" }) ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          disabled={disabled}
        >
          Left
        </Button>

        <Button
          type="button"
          variant={editor.isActive({ textAlign: "center" }) ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          disabled={disabled}
        >
          Center
        </Button>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}