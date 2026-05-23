import { EditableElement, ParsedTemplate } from "@/types/editor";

const TEXT_TAGS = new Set(["H1", "H2", "H3", "H4", "H5", "H6", "P", "SPAN", "DIV"]);

function cleanName(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 52);
}

function uniqueId(prefix: string, index: number) {
  return `${prefix}-${index}-${Math.random().toString(36).slice(2, 8)}`;
}

function selectorFor(id: string) {
  return `[data-editor-id="${id}"]`;
}

function looksLikeImagePlaceholder(element: Element) {
  const dataset = (element as HTMLElement).dataset;
  const classes = Array.from(element.classList ?? []).join(" ").toLowerCase();
  const label = element.textContent?.toLowerCase() ?? "";
  const style = (element as HTMLElement).getAttribute("style")?.toLowerCase() ?? "";

  return (
    dataset.type === "image" ||
    element.tagName === "IMG" ||
    classes.includes("image") ||
    classes.includes("photo") ||
    classes.includes("placeholder") ||
    label.includes("add artist photo") ||
    style.includes("background-image")
  );
}

function hasVisibleOwnText(element: Element) {
  const ownText = Array.from(element.childNodes)
    .filter((node) => node.nodeType === 3)
    .map((node) => node.textContent ?? "")
    .join(" ");

  if (cleanName(ownText)) return true;

  const hasOnlyInlineChildren = Array.from(element.children).every((child) =>
    ["SPAN", "BR", "STRONG", "EM", "B", "I"].includes(child.tagName)
  );

  return hasOnlyInlineChildren && cleanName(element.textContent ?? "").length > 0;
}

function shouldTreatAsText(element: Element) {
  const htmlElement = element as HTMLElement;
  if (htmlElement.dataset.type === "image") return false;
  if (htmlElement.dataset.type === "text") return true;
  if (htmlElement.dataset.editable === "true") return TEXT_TAGS.has(element.tagName);
  if (!TEXT_TAGS.has(element.tagName)) return false;
  if (looksLikeImagePlaceholder(element)) return false;

  const text = cleanName(element.textContent ?? "");
  if (!text || text.length > 240) return false;

  return hasVisibleOwnText(element);
}

function canvasCandidate(doc: Document) {
  const explicit = doc.querySelector("[data-template-canvas], .canvas, #canvas");
  if (explicit) return explicit;

  const sized = Array.from(doc.body.querySelectorAll<HTMLElement>("*")).find((element) => {
    const style = element.getAttribute("style") ?? "";
    return /1080px/.test(style) && /(height|width)/.test(style);
  });

  return sized ?? doc.body;
}

function extractHead(doc: Document) {
  const nodes = Array.from(doc.head.querySelectorAll("style, link[rel='stylesheet'], link[rel='preconnect']"));
  return nodes.map((node) => node.outerHTML).join("\n");
}

function annotate(canvas: Element) {
  const elements: EditableElement[] = [];
  let textIndex = 1;
  let imageIndex = 1;

  const candidates = Array.from(canvas.querySelectorAll<HTMLElement>("*"));
  candidates.forEach((element) => {
    const forcedType = element.dataset.type;
    const isImage = forcedType === "image" || looksLikeImagePlaceholder(element);
    const isText = !isImage && shouldTreatAsText(element);

    if (!isImage && !isText) return;
    if (element.closest("[data-editor-id]")) return;

    const type = isImage ? "image" : "text";
    const index = type === "image" ? imageIndex++ : textIndex++;
    const id = element.dataset.editorId || uniqueId(type, index);
    const fallback = type === "image" ? `Image ${index}` : `Text ${index}`;
    const className = typeof element.className === "string" ? element.className : "";
    const name =
      element.dataset.name ||
      cleanName(element.getAttribute("aria-label") ?? "") ||
      cleanName(className.replace(/[-_]/g, " ")) ||
      cleanName(element.textContent ?? "") ||
      fallback;

    element.dataset.editorId = id;
    element.dataset.editable = "true";
    element.dataset.type = type;

    elements.push({
      id,
      type,
      name,
      selector: selectorFor(id),
      tagName: element.tagName.toLowerCase(),
      text: type === "text" ? element.textContent ?? "" : undefined,
      visible: true
    });
  });

  return elements;
}

export function parseTemplate(fileName: string, source: string): ParsedTemplate {
  const parser = new DOMParser();
  const doc = parser.parseFromString(source, "text/html");
  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error("That HTML file could not be parsed.");
  }

  const canvas = canvasCandidate(doc);
  const canvasClone = canvas.cloneNode(true) as HTMLElement;
  const elements = annotate(canvasClone);
  const title = doc.querySelector("title")?.textContent?.trim() || fileName.replace(/\.html?$/i, "");
  const head = extractHead(doc);

  canvasClone.setAttribute("data-template-canvas", "true");
  canvasClone.style.width = "1080px";
  canvasClone.style.height = "1080px";
  canvasClone.style.margin = "0";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1080">
${head}
<style>
  html, body { margin: 0 !important; width: 1080px; height: 1080px; overflow: hidden; background: transparent !important; }
  body { display: block !important; padding: 0 !important; }
  [data-editor-id] { cursor: pointer; }
  [data-editor-hidden="true"] { display: none !important; }
  [data-editor-selected="true"] { outline: 4px solid rgba(124,106,247,0.95); outline-offset: -4px; }
</style>
</head>
<body>${canvasClone.outerHTML}</body>
</html>`;

  return { name: title, html, elements };
}

export function htmlToProjectName(fileName: string) {
  return fileName.replace(/\.html?$/i, "").replace(/[-_]+/g, " ");
}
