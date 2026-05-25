"use client";

import { MutableRefObject, useEffect, useRef, useState } from "react";
import { addImageLayer, getCanvasElement, getEditableElement, replaceImage, syncSelection } from "@/lib/editorDom";
import { Asset, EditableElement, ImageSettings, TemplateProject } from "@/types/editor";

type Props = {
  project: TemplateProject;
  selectedId: string | null;
  iframeRef: MutableRefObject<HTMLIFrameElement | null>;
  onSelect: (id: string | null) => void;
  onAddElement: (element: EditableElement) => void;
  onImageSettings: (id: string, settings: ImageSettings) => void;
  onHtmlChange: (html: string) => void;
};

const defaultSettings: ImageSettings = { fit: "cover", x: 50, y: 50, zoom: 100 };

export function EditorCanvas({
  project,
  selectedId,
  iframeRef,
  onSelect,
  onAddElement,
  onImageSettings,
  onHtmlChange
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [scale, setScale] = useState(0.64);
  const frameWrapRef = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef(0.64);
  const projectRef = useRef(project);

  useEffect(() => {
    setLoaded(false);
  }, [project.id]);

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  useEffect(() => {
    const container = frameWrapRef.current;
    if (!container) return;

    function updateScale() {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const gutter = window.innerWidth < 1024 ? 28 : 64;
      const availableWidth = Math.max(280, rect.width - gutter);
      const availableHeight = Math.max(280, rect.height - gutter);
      const next = Math.min(1, availableWidth / 1080, availableHeight / 1080);
      scaleRef.current = next;
      setScale(next);
    }

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    window.addEventListener("orientationchange", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", updateScale);
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const doc = iframeRef.current?.contentDocument ?? null;
    syncSelection(doc, selectedId ?? undefined);
  }, [iframeRef, loaded, selectedId]);

  function assetById(assetId: string) {
    return projectRef.current.assets.find((asset) => asset.id === assetId) ?? null;
  }

  function serialize() {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    onHtmlChange(`<!DOCTYPE html>\n${doc.documentElement.outerHTML}`);
  }

  function installListeners() {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;

    doc.addEventListener("click", (event) => {
      const target = event.target as HTMLElement | null;
      const editable = target?.closest<HTMLElement>("[data-editor-id]");
      onSelect(editable?.dataset.editorId ?? null);
    });

    doc.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    doc.addEventListener("drop", (event) => {
      event.preventDefault();
      const assetId = event.dataTransfer?.getData("application/x-mixdro-asset");
      const asset = assetId ? assetById(assetId) : null;
      if (!asset) return;

      const target = event.target as HTMLElement | null;
      const editable = target?.closest<HTMLElement>("[data-editor-id]");
      const imageTarget = editable?.dataset.type === "image" ? editable : null;

      if (imageTarget?.dataset.editorId) {
        const id = imageTarget.dataset.editorId;
        const settings = projectRef.current.imageSettings[id] ?? defaultSettings;
        replaceImage(doc, id, asset.dataUrl, settings);
        onImageSettings(id, settings);
        onSelect(id);
        serialize();
        return;
      }

      const added = addImageLayer(doc, asset.dataUrl, asset.name);
      if (added) {
        const canvas = getCanvasElement(doc);
        const rect = canvas?.getBoundingClientRect();
        const img = getEditableElement(doc, added.id);
        if (rect && img) {
          const left = Math.round((event.clientX - rect.left) / scaleRef.current - 210);
          const top = Math.round((event.clientY - rect.top) / scaleRef.current - 210);
          img.style.left = `${Math.max(0, left)}px`;
          img.style.top = `${Math.max(0, top)}px`;
          const settings = { ...defaultSettings, left: Math.max(0, left), top: Math.max(0, top), width: 420, height: 420 };
          onImageSettings(added.id, settings);
        }
        onAddElement(added);
        onSelect(added.id);
        serialize();
      }
    });
  }

  return (
    <div
      className="flex min-w-0 flex-1 items-center justify-center overflow-auto bg-[radial-gradient(circle_at_center,rgba(124,106,247,0.11),transparent_42%),#0b0b12] p-3 lg:p-8"
      ref={frameWrapRef}
    >
      <div className="relative" style={{ width: 1080 * scale, height: 1080 * scale }}>
        <div className="absolute rounded border border-white/10 bg-black/20 shadow-2xl" style={{ inset: -Math.max(4, 20 * scale) }} />
        <iframe
          className="relative block origin-top-left rounded bg-transparent shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
          ref={iframeRef}
          sandbox="allow-same-origin allow-scripts allow-popups"
          srcDoc={project.html}
          style={{
            width: 1080,
            height: 1080,
            transform: `scale(${scale})`
          }}
          title="Template preview"
          onLoad={() => {
            setLoaded(true);
            installListeners();
          }}
        />
      </div>
    </div>
  );
}
