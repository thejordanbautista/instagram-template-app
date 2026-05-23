"use client";

import { create } from "zustand";
import { Asset, EditableElement, ImageSettings, TemplateProject } from "@/types/editor";

type EditorState = {
  projects: TemplateProject[];
  currentProject: TemplateProject | null;
  selectedId: string | null;
  setProjects: (projects: TemplateProject[]) => void;
  setCurrentProject: (project: TemplateProject | null) => void;
  setSelectedId: (id: string | null) => void;
  updateCurrentProject: (patch: Partial<TemplateProject>) => void;
  setElements: (elements: EditableElement[]) => void;
  addAsset: (asset: Asset) => void;
  addElement: (element: EditableElement) => void;
  updateElement: (id: string, patch: Partial<EditableElement>) => void;
  removeElement: (id: string) => void;
  setImageSettings: (id: string, settings: ImageSettings) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  projects: [],
  currentProject: null,
  selectedId: null,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project, selectedId: null }),
  setSelectedId: (id) => set({ selectedId: id }),
  updateCurrentProject: (patch) =>
    set((state) => ({
      currentProject: state.currentProject ? { ...state.currentProject, ...patch, updatedAt: Date.now() } : null
    })),
  setElements: (elements) =>
    set((state) => ({
      currentProject: state.currentProject ? { ...state.currentProject, elements, updatedAt: Date.now() } : null
    })),
  addAsset: (asset) =>
    set((state) => ({
      currentProject: state.currentProject
        ? { ...state.currentProject, assets: [asset, ...state.currentProject.assets], updatedAt: Date.now() }
        : null
    })),
  addElement: (element) =>
    set((state) => ({
      currentProject: state.currentProject
        ? { ...state.currentProject, elements: [...state.currentProject.elements, element], updatedAt: Date.now() }
        : null
    })),
  updateElement: (id, patch) =>
    set((state) => ({
      currentProject: state.currentProject
        ? {
            ...state.currentProject,
            elements: state.currentProject.elements.map((element) =>
              element.id === id ? { ...element, ...patch } : element
            ),
            updatedAt: Date.now()
          }
        : null
    })),
  removeElement: (id) =>
    set((state) => ({
      selectedId: state.selectedId === id ? null : state.selectedId,
      currentProject: state.currentProject
        ? {
            ...state.currentProject,
            elements: state.currentProject.elements.filter((element) => element.id !== id),
            updatedAt: Date.now()
          }
        : null
    })),
  setImageSettings: (id, settings) =>
    set((state) => ({
      currentProject: state.currentProject
        ? {
            ...state.currentProject,
            imageSettings: { ...state.currentProject.imageSettings, [id]: settings },
            updatedAt: Date.now()
          }
        : null
    }))
}));
