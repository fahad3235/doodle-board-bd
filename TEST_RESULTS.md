# TEST_RESULTS -- doodle-board-bd (run 2026-10-19, 09:00 slot)

## Unit tests -- 8/8 PASS
`node --test tests/test.js`
- hex color validation
- brush size clamp
- stroke validation: freehand + shapes (7 invalid variants rejected)
- history: push/undo/redo + 50 cap (60 pushes -> 50 retained, oldest dropped)
- gallery import validation: 1 valid + 10 malformed rejected
  (wrong app, wrong version, empty name, out-of-range point, bad bg,
  duplicate id, extra key on item, extra top-level key, 11 items)
- drawing name validation
- stroke stats
- Bengali digits

## Headless-Chrome smoke -- 24/24 PASS
`node tests/smoke.mjs` (raw CDP, /opt/meta-chromium/chrome, file://)
- title, canvas, 5 tool buttons, 12 palette swatches, empty hint, undo disabled
- freehand draw -> 1 stroke, canvas non-blank, undo enabled
- undo -> 0 strokes + blank canvas; redo -> 1 stroke
- rectangle shape drag -> 2 strokes
- save to gallery -> 1 item named "Smoke Test"
- reload -> strokes + gallery persist
- BN toggle -> Bengali title + Bengali-digit stroke count
- invalid gallery import rejected by validator, gallery intact
- 390px mobile: no horizontal overflow
- zero http(s) network requests
- zero console errors

## Repair cycles
- 1 test-harness fix (not an app bug): CDP `Input.dispatchMouseEvent`
  for `mouseMoved` during a drag must carry `buttons: 1`, otherwise
  Chrome never dispatches pointermove/pointerup to the capture target.
  The first smoke run showed 21/24 with the rectangle shape not
  committing; after the harness fix, 24/24 green. The app was unchanged.
  Verified in isolation (dbg scripts): with `buttons: 1`, pointerdown ->
  pointermove -> pointerup all arrive and the shape commits.
- 0 app-logic repairs.

## Source hygiene
- All shipped sources pure ASCII (Bengali emitted as \uXXXX escapes in
  JS, numeric entities in HTML); verified with `grep -rP '[^\x00-\x7F]'`.
- No secrets. No network requests by design.
