"use client";

import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import { fieldId, useFieldError } from "./Field";

const BTN =
  "rounded px-2 py-1 text-xs font-semibold text-ink hover:bg-mint-50 aria-pressed:bg-green-700 aria-pressed:text-white disabled:opacity-40";

/**
 * Rich text limited to what the sanitiser keeps (h2–h4, paragraphs, lists, bold/italic, links, blockquote).
 * The HTML is submitted through a hidden input and sanitised again on the server.
 */
export function RichTextField({ name, label, defaultValue, hint, required }: { name: string; label: string; defaultValue?: string; hint?: string; required?: boolean }) {
  const [html, setHtml] = useState(defaultValue ?? "");
  const error = useFieldError(name);
  const id = fieldId(name);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        link: { openOnClick: false, autolink: true, protocols: ["mailto"], HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
    ],
    content: defaultValue ?? "",
    editorProps: {
      attributes: {
        id,
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": `${id}-label`,
        ...(error ? { "aria-invalid": "true", "aria-describedby": `${id}-error` } : {}),
        class: "rich min-h-48 px-4 py-3 text-sm leading-relaxed focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      setHtml(editor.isEmpty ? "" : editor.getHTML());
      editor.view.dom.closest("form")?.dispatchEvent(new Event("input", { bubbles: true }));
    },
  });

  const s = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            link: e.isActive("link"),
          }
        : null,
  });

  function setLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link address (https://… or mailto:…). Leave empty to remove the link.", prev ?? "https://");
    if (url === null) return;
    if (!url.trim()) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else if (/^(https?:\/\/|mailto:)/i.test(url.trim())) editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    else window.alert("Links must start with https://, http:// or mailto:.");
  }

  const tool = (label: string, pressed: boolean | undefined, run: () => void) => (
    <button type="button" className={BTN} aria-pressed={!!pressed} onClick={run} disabled={!editor}>
      {label}
    </button>
  );

  return (
    <div>
      <p id={`${id}-label`} className="block text-sm font-semibold text-ink">
        {label}
        {required && (
          <span className="text-red-700" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </p>
      <div className={`mt-1.5 overflow-hidden rounded-md border bg-white ${error ? "border-red-600" : "border-line"} focus-within:border-green-700`}>
        <div role="toolbar" aria-label={`${label} formatting`} className="flex flex-wrap gap-1 border-b border-line bg-mint-50/60 px-2 py-1.5">
          {tool("H2", s?.h2, () => editor?.chain().focus().toggleHeading({ level: 2 }).run())}
          {tool("H3", s?.h3, () => editor?.chain().focus().toggleHeading({ level: 3 }).run())}
          {tool("Bold", s?.bold, () => editor?.chain().focus().toggleBold().run())}
          {tool("Italic", s?.italic, () => editor?.chain().focus().toggleItalic().run())}
          {tool("• List", s?.bullet, () => editor?.chain().focus().toggleBulletList().run())}
          {tool("1. List", s?.ordered, () => editor?.chain().focus().toggleOrderedList().run())}
          {tool("Quote", s?.quote, () => editor?.chain().focus().toggleBlockquote().run())}
          {tool("Link", s?.link, setLink)}
        </div>
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={html} />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
