"use client";

import { Eye, EyeOff, Trash2, Type, Image as ImageIcon } from "lucide-react";
import { EditableElement } from "@/types/editor";

type Props = {
  elements: EditableElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onVisibility: (id: string, visible: boolean) => void;
  onDelete: (id: string) => void;
};

export function LayersPanel({ elements, selectedId, onSelect, onVisibility, onDelete }: Props) {
  return (
    <section className="border-t border-line p-4">
      <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-white/40">Layers</div>
      <div className="thin-scrollbar max-h-64 space-y-2 overflow-auto">
        {elements.map((element) => {
          const selected = selectedId === element.id;
          const Icon = element.type === "text" ? Type : ImageIcon;

          return (
            <div
              className={`flex items-center gap-2 rounded border px-2 py-2 text-sm ${
                selected ? "border-violet bg-violet/15" : "border-line bg-black/20"
              }`}
              key={element.id}
            >
              <button className="text-white/60 hover:text-white" onClick={() => onVisibility(element.id, !element.visible)}>
                {element.visible ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => onSelect(element.id)}>
                <Icon className="shrink-0 text-white/45" size={15} />
                <span className="truncate">{element.name}</span>
              </button>
              {element.isAdded ? (
                <button className="text-white/45 hover:text-rose" onClick={() => onDelete(element.id)}>
                  <Trash2 size={15} />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
