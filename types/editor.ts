export type EditableKind = "text" | "image";

export type EditableElement = {
  id: string;
  type: EditableKind;
  name: string;
  selector: string;
  tagName: string;
  text?: string;
  visible: boolean;
  isAdded?: boolean;
};

export type Asset = {
  id: string;
  name: string;
  dataUrl: string;
  createdAt: number;
};

export type ImageSettings = {
  fit: "cover" | "contain";
  x: number;
  y: number;
  zoom: number;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
};

export type TemplateProject = {
  id: string;
  name: string;
  html: string;
  originalFileName: string;
  elements: EditableElement[];
  assets: Asset[];
  imageSettings: Record<string, ImageSettings>;
  updatedAt: number;
  createdAt: number;
};

export type ParsedTemplate = {
  name: string;
  html: string;
  elements: EditableElement[];
};
