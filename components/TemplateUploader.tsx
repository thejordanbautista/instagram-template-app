"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { parseTemplate } from "@/lib/templateParser";
import { TemplateProject } from "@/types/editor";

type Props = {
  onProject: (project: TemplateProject) => void | Promise<void>;
  compact?: boolean;
  large?: boolean;
};

export function TemplateUploader({ onProject, compact, large }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleFile(file?: File) {
    if (!file) return;

    try {
      setStatus("loading");
      setMessage(`Importing ${file.name}...`);

      if (!/\.html?$/i.test(file.name) && file.type !== "text/html") {
        throw new Error("Please choose an HTML file.");
      }

      const source = await file.text();
      const parsed = parseTemplate(file.name, source);
      const now = Date.now();

      await onProject({
        id: crypto.randomUUID(),
        name: parsed.name,
        html: parsed.html,
        originalFileName: file.name,
        elements: parsed.elements,
        assets: [],
        imageSettings: {},
        createdAt: now,
        updatedAt: now
      });

      setStatus("ready");
      setMessage(`Imported ${parsed.elements.length} editable layers.`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Import failed.");
      console.error(error);
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const label = status === "loading" ? "Importing..." : compact ? "HTML" : "Upload HTML";

  if (large) {
    return (
      <div
        className="rounded border border-dashed border-line bg-black/25 p-5 text-center transition hover:border-violet"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleFile(event.dataTransfer.files?.[0]);
        }}
      >
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-line bg-violet px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
          disabled={status === "loading"}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <Upload size={16} />
          {label}
        </button>
        <div className="mt-3 text-xs text-white/45">Choose an HTML file or drop it here.</div>
        {message ? (
          <div className={`mt-2 text-xs ${status === "error" ? "text-rose" : "text-white/55"}`}>{message}</div>
        ) : null}
        <input
          className="sr-only"
          ref={inputRef}
          type="file"
          accept=".html,.htm,text/html"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-line bg-violet px-4 py-2 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
        disabled={status === "loading"}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        <Upload size={16} />
        {label}
      </button>
      <input
        className="sr-only"
        ref={inputRef}
        type="file"
        accept=".html,.htm,text/html"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      {message && !compact ? (
        <div className={`max-w-72 truncate text-xs ${status === "error" ? "text-rose" : "text-white/45"}`}>{message}</div>
      ) : null}
    </div>
  );
}
