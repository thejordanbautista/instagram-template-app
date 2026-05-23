"use client";

import { useEffect, useMemo, useRef } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { AssetSidebar } from "@/components/AssetSidebar";
import { EditorCanvas } from "@/components/EditorCanvas";
import { ExportButton } from "@/components/ExportButton";
import { LayersPanel } from "@/components/LayersPanel";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { TemplateUploader } from "@/components/TemplateUploader";
import {
  deleteElement,
  getEditableElement,
  getIframeDocument,
  getSerializableHtml,
  patchTextStyle,
  replaceImage,
  setElementVisibility,
  syncSelection,
  updateTextElement
} from "@/lib/editorDom";
import { loadProjects, upsertProject } from "@/lib/storage";
import { useEditorStore } from "@/lib/store";
import { Asset, ImageSettings, TemplateProject } from "@/types/editor";

const fallbackImageSettings: ImageSettings = { fit: "cover", x: 50, y: 50, zoom: 100 };

export default function EditorPage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const {
    currentProject,
    selectedId,
    projects,
    addAsset,
    addElement,
    removeElement,
    setCurrentProject,
    setImageSettings,
    setProjects,
    setSelectedId,
    updateCurrentProject,
    updateElement
  } = useEditorStore();

  useEffect(() => {
    if (currentProject) return;
    try {
      const loaded = loadProjects();
      setProjects(loaded);

      let currentId = new URLSearchParams(window.location.search).get("id");
      if (!currentId) {
        try {
          currentId = window.sessionStorage.getItem("mixdro-current-project");
        } catch (error) {
          console.warn("Could not read editor session handoff.", error);
        }
      }

      const project = loaded.find((item) => item.id === currentId) ?? loaded[0] ?? null;
      if (project) setCurrentProject(project);
    } catch (error) {
      console.error("Could not load editor project.", error);
    }
  }, [currentProject, setCurrentProject, setProjects]);

  const selected = useMemo(
    () => currentProject?.elements.find((element) => element.id === selectedId) ?? null,
    [currentProject?.elements, selectedId]
  );

  if (!currentProject) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink p-6">
        <div className="max-w-md rounded border border-line bg-panel p-6 text-center">
          <h1 className="text-xl font-black">No project loaded</h1>
          <p className="mt-2 text-sm leading-6 text-white/50">
            The editor could not find the uploaded template. Go back and upload it again; the next import will pass the project id in the URL.
          </p>
          <button
            className="mt-5 rounded-md bg-violet px-4 py-2 text-sm font-bold text-white"
            onClick={() => router.push("/")}
            type="button"
          >
            Back to library
          </button>
        </div>
      </main>
    );
  }

  const project = currentProject;
  const doc = () => getIframeDocument(iframeRef.current);

  function importProject(project: TemplateProject) {
    try {
      setProjects(upsertProject(project));
    } catch (error) {
      console.warn("Project opened without local save.", error);
    }
    setCurrentProject(project);
    try {
      window.sessionStorage.setItem("mixdro-current-project", project.id);
    } catch (error) {
      console.warn("Could not write editor session handoff.", error);
    }
    router.replace(`/editor?id=${encodeURIComponent(project.id)}`);
  }

  function saveProject() {
    const html = getSerializableHtml(doc());
    const savedProject = { ...project, html: html || project.html, updatedAt: Date.now() };
    setCurrentProject(savedProject);
    setProjects(upsertProject(savedProject));
    try {
      window.sessionStorage.setItem("mixdro-current-project", savedProject.id);
    } catch (error) {
      console.warn("Could not write editor session handoff.", error);
    }
  }

  function handleAsset(asset: Asset) {
    addAsset(asset);
  }

  function handleTextChange(text: string) {
    if (!selected) return;
    updateTextElement(doc(), selected.id, text);
    updateElement(selected.id, { text });
  }

  function handleTextStyle(property: string, value: string) {
    if (!selected || !value) return;
    patchTextStyle(doc(), selected.id, property as keyof CSSStyleDeclaration, value);
  }

  function applyImageSettings(id: string, next: ImageSettings) {
    const element = getEditableElement(doc(), id);
    if (element?.tagName === "IMG") {
      const img = element as HTMLImageElement;
      img.style.objectFit = next.fit;
      img.style.objectPosition = `${next.x}% ${next.y}%`;
      img.style.transform = `scale(${next.zoom / 100})`;
      img.style.transformOrigin = `${next.x}% ${next.y}%`;
      if (next.left !== undefined) img.style.left = `${next.left}px`;
      if (next.top !== undefined) img.style.top = `${next.top}px`;
      if (next.width !== undefined) img.style.width = `${next.width}px`;
      if (next.height !== undefined) img.style.height = `${next.height}px`;
    } else if (element) {
      element.style.backgroundPosition = `${next.x}% ${next.y}%`;
      element.style.backgroundSize = next.fit === "cover" ? `${next.zoom}%` : "contain";
    }
    setImageSettings(id, next);
  }

  function handleImageReplace(assetId: string) {
    if (!selected) return;
    const asset = project.assets.find((item) => item.id === assetId);
    if (!asset) return;
    const settings = project.imageSettings[selected.id] ?? fallbackImageSettings;
    replaceImage(doc(), selected.id, asset.dataUrl, settings);
    setImageSettings(selected.id, settings);
  }

  function handleVisibility(id: string, visible: boolean) {
    setElementVisibility(doc(), id, visible);
    updateElement(id, { visible });
  }

  function handleDelete(id: string) {
    deleteElement(doc(), id);
    removeElement(id);
  }

  return (
    <main className="flex h-screen min-h-0 flex-col overflow-hidden bg-ink">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-panel px-4">
        <div className="flex min-w-0 items-center gap-3">
          <button className="rounded border border-line p-2 text-white/70 hover:border-violet hover:text-white" onClick={() => router.push("/")}>
            <ArrowLeft size={17} />
          </button>
          <div className="min-w-0">
            <div className="truncate text-sm font-black">{project.name}</div>
            <div className="truncate text-xs text-white/38">{project.originalFileName}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TemplateUploader compact onProject={importProject} />
          <button
            className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-panel2 px-4 py-2 text-sm font-bold transition hover:border-violet"
            onClick={saveProject}
          >
            <Save size={16} />
            Save Project
          </button>
          <ExportButton iframeRef={iframeRef} fileName={project.originalFileName} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <AssetSidebar assets={project.assets} onAsset={handleAsset} />
        <EditorCanvas
          iframeRef={iframeRef}
          project={project}
          selectedId={selectedId}
          onAddElement={addElement}
          onHtmlChange={(html) => updateCurrentProject({ html })}
          onImageSettings={setImageSettings}
          onSelect={(id) => {
            setSelectedId(id);
            syncSelection(doc(), id ?? undefined);
          }}
        />
        <div className="flex h-full w-80 shrink-0 flex-col border-l border-line bg-panel">
          <PropertiesPanel
            assets={project.assets}
            imageSettings={selected ? project.imageSettings[selected.id] : undefined}
            selected={selected}
            onDelete={() => selected && handleDelete(selected.id)}
            onImageReplace={handleImageReplace}
            onImageSettings={(settings) => selected && applyImageSettings(selected.id, settings)}
            onTextChange={handleTextChange}
            onTextStyle={handleTextStyle}
          />
          <LayersPanel
            elements={project.elements}
            selectedId={selectedId}
            onDelete={handleDelete}
            onSelect={(id) => {
              setSelectedId(id);
              syncSelection(doc(), id);
            }}
            onVisibility={handleVisibility}
          />
        </div>
      </div>
    </main>
  );
}
