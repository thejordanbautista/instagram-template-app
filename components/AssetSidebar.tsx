"use client";

import { ImagePlus } from "lucide-react";
import { Asset } from "@/types/editor";

type Props = {
  assets: Asset[];
  onAsset: (asset: Asset) => void;
  className?: string;
};

export function AssetSidebar({ assets, onAsset, className = "" }: Props) {
  async function handleFile(file?: File) {
    if (!file) return;
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    onAsset({
      id: crypto.randomUUID(),
      name: file.name,
      dataUrl,
      createdAt: Date.now()
    });
  }

  return (
    <aside className={`flex h-full w-64 shrink-0 flex-col border-r border-line bg-panel ${className}`}>
      <div className="border-b border-line p-4">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-line bg-panel2 px-3 py-2 text-sm font-bold transition hover:border-violet">
          <ImagePlus size={16} />
          Upload Image
          <input
            className="sr-only"
            type="file"
            accept="image/*"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
        </label>
      </div>

      <div className="thin-scrollbar flex-1 overflow-auto p-4">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-white/40">Assets</div>
        <div className="grid grid-cols-2 gap-3">
          {assets.map((asset) => (
            <div
              className="group cursor-grab overflow-hidden rounded border border-line bg-black/30"
              draggable
              key={asset.id}
              onDragStart={(event) => event.dataTransfer.setData("application/x-mixdro-asset", asset.id)}
              title={asset.name}
            >
              <img alt={asset.name} className="aspect-square w-full object-cover" src={asset.dataUrl} />
              <div className="truncate px-2 py-1 text-[11px] text-white/50 group-hover:text-white">{asset.name}</div>
            </div>
          ))}
        </div>

        {assets.length === 0 ? (
          <div className="rounded border border-dashed border-line p-4 text-sm leading-5 text-white/45">
            Upload images here, then drag one onto a placeholder or empty canvas.
          </div>
        ) : null}
      </div>
    </aside>
  );
}
