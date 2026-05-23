import { EditableElement, ImageSettings } from "@/types/editor";

export function getIframeDocument(iframe: HTMLIFrameElement | null) {
  return iframe?.contentDocument ?? null;
}

export function getCanvasElement(doc: Document | null) {
  return doc?.querySelector<HTMLElement>("[data-template-canvas]") ?? null;
}

export function getEditableElement(doc: Document | null, id: string) {
  return doc?.querySelector<HTMLElement>(`[data-editor-id="${id}"]`) ?? null;
}

export function syncSelection(doc: Document | null, selectedId?: string) {
  doc?.querySelectorAll<HTMLElement>("[data-editor-selected='true']").forEach((element) => {
    delete element.dataset.editorSelected;
  });

  if (selectedId) {
    const element = getEditableElement(doc, selectedId);
    if (element) element.dataset.editorSelected = "true";
  }
}

export function updateTextElement(doc: Document | null, id: string, text: string) {
  const element = getEditableElement(doc, id);
  if (!element) return;
  element.innerText = text;
}

export function patchTextStyle(doc: Document | null, id: string, property: keyof CSSStyleDeclaration, value: string) {
  const element = getEditableElement(doc, id);
  if (!element) return;
  element.style[property as any] = value;
}

export function setElementVisibility(doc: Document | null, id: string, visible: boolean) {
  const element = getEditableElement(doc, id);
  if (!element) return;
  if (visible) delete element.dataset.editorHidden;
  else element.dataset.editorHidden = "true";
}

export function deleteElement(doc: Document | null, id: string) {
  getEditableElement(doc, id)?.remove();
}

export function replaceImage(doc: Document | null, id: string, dataUrl: string, settings: ImageSettings) {
  const element = getEditableElement(doc, id);
  if (!element) return;

  if (element.tagName === "IMG") {
    const image = element as HTMLImageElement;
    image.src = dataUrl;
    image.style.objectFit = settings.fit;
    image.style.objectPosition = `${settings.x}% ${settings.y}%`;
    image.style.transform = `scale(${settings.zoom / 100})`;
    image.style.transformOrigin = `${settings.x}% ${settings.y}%`;
    image.style.width = image.style.width || "100%";
    image.style.height = image.style.height || "100%";
    return;
  }

  element.style.backgroundImage = `url("${dataUrl}")`;
  element.style.backgroundRepeat = "no-repeat";
  element.style.backgroundPosition = `${settings.x}% ${settings.y}%`;
  element.style.backgroundSize = settings.fit === "cover" ? `${settings.zoom}%` : "contain";
}

export function addImageLayer(doc: Document | null, dataUrl: string, name: string): EditableElement | null {
  const canvas = getCanvasElement(doc);
  if (!canvas) return null;

  const id = `image-added-${Date.now()}`;
  const img = doc!.createElement("img");
  img.src = dataUrl;
  img.alt = name;
  img.dataset.editorId = id;
  img.dataset.editable = "true";
  img.dataset.type = "image";
  img.dataset.name = name;
  img.dataset.editorAdded = "true";
  img.style.position = "absolute";
  img.style.left = "120px";
  img.style.top = "120px";
  img.style.width = "420px";
  img.style.height = "420px";
  img.style.objectFit = "cover";
  img.style.objectPosition = "50% 50%";
  img.style.zIndex = "20";
  canvas.appendChild(img);

  return {
    id,
    type: "image",
    name,
    selector: `[data-editor-id="${id}"]`,
    tagName: "img",
    visible: true,
    isAdded: true
  };
}

export function getSerializableHtml(doc: Document | null) {
  if (!doc) return "";
  doc.querySelectorAll<HTMLElement>("[data-editor-selected='true']").forEach((element) => {
    delete element.dataset.editorSelected;
  });
  return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
}
