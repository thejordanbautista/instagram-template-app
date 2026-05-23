# MixDro Local Editor

A personal, local-first Next.js editor for 1080x1080 HTML/CSS social graphics.

## Run Locally

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## What Works

- Upload an HTML template from the home screen or editor toolbar.
- Extract and render the template's 1080x1080 `.canvas` area inside an isolated iframe.
- Preserve embedded styles and Google Font stylesheet links from the uploaded file.
- Auto-detect editable text and image/photo/placeholder regions.
- Prioritize template hints like:

```html
<div data-editable="true" data-type="text" data-name="Main Headline">...</div>
<div data-editable="true" data-type="image" data-name="Artist Photo"></div>
```

- Click layers in the preview or Layers panel to select them.
- Edit text live from the Properties panel.
- Upload image assets, replace selected image placeholders, and adjust fit, position, and zoom.
- Drag an uploaded image onto an image placeholder to replace it.
- Drag an uploaded image onto empty canvas space to add a new image layer.
- Hide/show layers and delete added image layers.
- Export the 1080x1080 canvas as a PNG.
- Save projects locally in `localStorage` and reopen/delete them from the library.

## Notes

This is intentionally built as a personal MVP: no backend, no accounts, no cloud sync. Uploaded images are stored as base64 data URLs in browser storage, so very large projects can hit localStorage limits.
