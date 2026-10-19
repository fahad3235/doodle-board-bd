# Doodle Board BD

A free, fully offline bilingual (Bangla/English) drawing board for Bangladesh.
Draw freehand, erase, draw lines/rectangles/circles, save drawings to a
local gallery, and export PNG or JSON -- nothing ever leaves the browser.

Live site: https://fahad3235.github.io/doodle-board-bd/ (GitHub Pages)

## Features

- **Canvas drawing** -- freehand brush with pointer (mouse + touch) input,
  smooth strokes, live preview for shapes.
- **Tools** -- brush, eraser, line, rectangle, circle.
- **Colors** -- 12 preset swatches + custom color picker; background color picker.
- **Brush size** -- slider, 1-50 px.
- **Undo / redo** -- snapshot history, capped at 50 steps.
- **Gallery** -- save up to 10 named drawings in the browser, reload them
  onto the canvas, delete them; thumbnails rendered from the saved strokes.
- **Export** -- download the current canvas as PNG; export/import the whole
  gallery as JSON (strict validation -- malformed files are rejected with
  your drawings untouched).
- **Persistence** -- current canvas + gallery + language survive reloads
  via localStorage. Erase-everything requires typing `DELETE`.
- **Bilingual** -- EN/Bangla toggle, persisted; Bengali digits when
  Bangla is active.
- **Responsive** -- works at 390 px mobile width; toolbar wraps.

## Stack

Vanilla HTML + CSS + JavaScript. No build step, no dependencies, no
network requests. Vector stroke model: the canvas is re-rendered from a
strokes array, so resizing never loses quality.

## Run locally

```sh
# any static server, e.g.
python3 -m http.server 8000
# open http://localhost:8000/
```

Or open `index.html` directly (file:// works).

## Testing

```sh
node --test tests/test.js   # 8 unit tests (pure logic)
node tests/smoke.mjs        # 24 headless-Chrome checks (raw CDP, /opt/meta-chromium/chrome)
```

See `TEST_RESULTS.md` for the exact verified results.

## Limitations

- Drawings live in one browser's localStorage (max 10 gallery slots);
  clearing browser data deletes them -- use JSON export for backup.
- No multi-user / cloud sync, no layers, no fill, no text tool.
- Strokes are capped at 2000 per canvas, 20000 points per stroke, to
  keep localStorage usable.
- Personal drawing tool -- not a professional illustration app.

## Status

PUBLISHED_AND_VERIFIED -- 8/8 unit + 24/24 headless-Chrome smoke checks,
0 console errors.
