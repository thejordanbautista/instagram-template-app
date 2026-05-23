"use client";

import { AlignCenter, AlignLeft, AlignRight, Trash2 } from "lucide-react";
import { Asset, EditableElement, ImageSettings } from "@/types/editor";

type Props = {
  selected: EditableElement | null;
  assets: Asset[];
  imageSettings?: ImageSettings;
  onTextChange: (text: string) => void;
  onTextStyle: (property: string, value: string) => void;
  onImageReplace: (assetId: string) => void;
  onImageSettings: (settings: ImageSettings) => void;
  onDelete: () => void;
};

const defaultImageSettings: ImageSettings = { fit: "cover", x: 50, y: 50, zoom: 100 };

export function PropertiesPanel({
  selected,
  assets,
  imageSettings,
  onTextChange,
  onTextStyle,
  onImageReplace,
  onImageSettings,
  onDelete
}: Props) {
  const settings = imageSettings ?? defaultImageSettings;

  return (
    <aside className="flex min-h-0 w-full flex-1 flex-col bg-panel">
      <div className="border-b border-line p-4">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Properties</div>
        <div className="mt-1 truncate text-lg font-bold">{selected?.name ?? "No selection"}</div>
      </div>

      <div className="thin-scrollbar flex-1 overflow-auto p-4">
        {!selected ? (
          <div className="rounded border border-dashed border-line p-4 text-sm leading-5 text-white/45">
            Select text or an image region on the canvas to edit it.
          </div>
        ) : null}

        {selected?.type === "text" ? (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-white/45">Text</span>
              <textarea
                className="h-36 w-full resize-none rounded border border-line bg-black/35 p-3 text-sm outline-none focus:border-violet"
                value={selected.text ?? ""}
                onChange={(event) => onTextChange(event.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/45">Size</span>
                <input
                  className="w-full rounded border border-line bg-black/35 px-3 py-2 text-sm"
                  min={6}
                  type="number"
                  onChange={(event) => onTextStyle("fontSize", `${event.target.value}px`)}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/45">Line</span>
                <input
                  className="w-full rounded border border-line bg-black/35 px-3 py-2 text-sm"
                  step="0.05"
                  type="number"
                  onChange={(event) => onTextStyle("lineHeight", event.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/45">Weight</span>
                <select
                  className="w-full rounded border border-line bg-black/35 px-3 py-2 text-sm"
                  onChange={(event) => onTextStyle("fontWeight", event.target.value)}
                >
                  <option value="">Keep</option>
                  <option value="400">Regular</option>
                  <option value="700">Bold</option>
                  <option value="800">Extra</option>
                  <option value="900">Black</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-white/45">Tracking</span>
                <input
                  className="w-full rounded border border-line bg-black/35 px-3 py-2 text-sm"
                  step="0.01"
                  type="number"
                  onChange={(event) => onTextStyle("letterSpacing", `${event.target.value}em`)}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-bold text-white/45">Color</span>
              <input
                className="h-10 w-full rounded border border-line bg-black/35"
                type="color"
                onChange={(event) => onTextStyle("color", event.target.value)}
              />
            </label>

            <div>
              <div className="mb-2 text-xs font-bold text-white/45">Align</div>
              <div className="grid grid-cols-3 gap-2">
                <button className="rounded border border-line bg-black/25 p-2 hover:border-violet" onClick={() => onTextStyle("textAlign", "left")}>
                  <AlignLeft className="mx-auto" size={16} />
                </button>
                <button className="rounded border border-line bg-black/25 p-2 hover:border-violet" onClick={() => onTextStyle("textAlign", "center")}>
                  <AlignCenter className="mx-auto" size={16} />
                </button>
                <button className="rounded border border-line bg-black/25 p-2 hover:border-violet" onClick={() => onTextStyle("textAlign", "right")}>
                  <AlignRight className="mx-auto" size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {selected?.type === "image" ? (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-white/45">Replace With Asset</span>
              <select
                className="w-full rounded border border-line bg-black/35 px-3 py-2 text-sm"
                defaultValue=""
                onChange={(event) => event.target.value && onImageReplace(event.target.value)}
              >
                <option value="">Choose image</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold text-white/45">Fit</span>
              <select
                className="w-full rounded border border-line bg-black/35 px-3 py-2 text-sm"
                value={settings.fit}
                onChange={(event) => onImageSettings({ ...settings, fit: event.target.value as "cover" | "contain" })}
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
              </select>
            </label>

            {[
              ["Zoom", "zoom", 30, 220],
              ["Move X", "x", 0, 100],
              ["Move Y", "y", 0, 100]
            ].map(([label, key, min, max]) => (
              <label className="block" key={key}>
                <span className="mb-2 block text-xs font-bold text-white/45">{label}</span>
                <input
                  className="w-full accent-violet"
                  max={Number(max)}
                  min={Number(min)}
                  type="range"
                  value={settings[key as keyof ImageSettings] as number}
                  onChange={(event) => onImageSettings({ ...settings, [key]: Number(event.target.value) })}
                />
              </label>
            ))}

            {selected.isAdded ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Left", "left"],
                  ["Top", "top"],
                  ["Width", "width"],
                  ["Height", "height"]
                ].map(([label, key]) => (
                  <label className="block" key={key}>
                    <span className="mb-2 block text-xs font-bold text-white/45">{label}</span>
                    <input
                      className="w-full rounded border border-line bg-black/35 px-3 py-2 text-sm"
                      min={0}
                      type="number"
                      value={(settings[key as keyof ImageSettings] as number | undefined) ?? ""}
                      onChange={(event) => onImageSettings({ ...settings, [key]: Number(event.target.value) })}
                    />
                  </label>
                ))}
              </div>
            ) : null}

            {selected.isAdded ? (
              <button className="flex w-full items-center justify-center gap-2 rounded border border-rose/40 bg-rose/10 px-3 py-2 text-sm font-bold text-rose" onClick={onDelete}>
                <Trash2 size={15} />
                Delete Layer
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
