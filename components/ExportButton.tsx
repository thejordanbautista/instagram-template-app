"use client";

import html2canvas from "html2canvas";
import { Download } from "lucide-react";
import { MutableRefObject } from "react";
import { getCanvasElement, getSerializableHtml, syncSelection } from "@/lib/editorDom";

type Props = {
  iframeRef: MutableRefObject<HTMLIFrameElement | null>;
  fileName: string;
  compact?: boolean;
};

export function ExportButton({ iframeRef, fileName, compact }: Props) {
  async function exportPng() {
    const doc = iframeRef.current?.contentDocument;
    const canvasElement = getCanvasElement(doc ?? null);
    if (!doc || !canvasElement) return;

    syncSelection(doc, undefined);
    await doc.fonts?.ready;

    const exportFrame = document.createElement("iframe");
    exportFrame.setAttribute("aria-hidden", "true");
    exportFrame.sandbox.add("allow-same-origin");
    exportFrame.sandbox.add("allow-scripts");
    exportFrame.style.position = "fixed";
    exportFrame.style.left = "-1200px";
    exportFrame.style.top = "0";
    exportFrame.style.width = "1080px";
    exportFrame.style.height = "1080px";
    exportFrame.style.border = "0";
    exportFrame.style.opacity = "0";

    let rendered: HTMLCanvasElement;
    try {
      rendered = await new Promise<HTMLCanvasElement>((resolve, reject) => {
        exportFrame.onload = async () => {
          try {
            const exportDoc = exportFrame.contentDocument;
            const exportCanvasElement = getCanvasElement(exportDoc ?? null);
            if (!exportDoc || !exportCanvasElement) throw new Error("Could not prepare export canvas.");

            await exportDoc.fonts?.ready;
            await new Promise((fontResolve) => window.setTimeout(fontResolve, 250));

            const captured = await html2canvas(exportCanvasElement, {
              backgroundColor: null,
              scale: 1,
              width: 1080,
              height: 1080,
              windowWidth: 1080,
              windowHeight: 1080,
              useCORS: true,
              allowTaint: true,
              foreignObjectRendering: true,
              logging: false
            });
            resolve(captured);
          } catch (error) {
            reject(error);
          }
        };
        exportFrame.srcdoc = getSerializableHtml(doc);
        document.body.appendChild(exportFrame);
      });
    } finally {
      exportFrame.remove();
    }

    const link = document.createElement("a");
    link.download = `${fileName.replace(/\.html?$/i, "") || "template"}-export.png`;
    link.href = rendered.toDataURL("image/png");
    link.click();
  }

  return (
    <button
      className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
      onClick={exportPng}
      type="button"
    >
      <Download size={16} />
      <span className={compact ? "hidden sm:inline" : ""}>Export PNG</span>
    </button>
  );
}
