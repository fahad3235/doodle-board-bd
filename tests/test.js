'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const P = require('../js/pure.js');

const brush = (points) => ({ tool: 'brush', color: '#2563eb', size: 6, points });
const rect = { tool: 'rect', color: '#ef4444', size: 4, x0: 10, y0: 10, x1: 100, y1: 80 };

test('hex color validation', () => {
  assert.equal(P.isValidHexColor('#2563eb'), true);
  assert.equal(P.isValidHexColor('#FFFFFF'), true);
  assert.equal(P.isValidHexColor('2563eb'), false);
  assert.equal(P.isValidHexColor('#12345'), false);
  assert.equal(P.isValidHexColor('#gggggg'), false);
  assert.equal(P.isValidHexColor(123), false);
});

test('brush size clamp', () => {
  assert.equal(P.clampBrush(0), 1);
  assert.equal(P.clampBrush(51), 50);
  assert.equal(P.clampBrush(6.4), 6);
  assert.equal(P.clampBrush('12'), 12);
  assert.equal(P.clampBrush(NaN), 6);
});

test('stroke validation: freehand + shapes', () => {
  assert.equal(P.isValidStroke(brush([{ x: 1, y: 2 }])), true);
  assert.equal(P.isValidStroke(rect), true);
  assert.equal(P.isValidStroke({ tool: 'brush', color: '#2563eb', size: 6, points: [] }), false);
  assert.equal(P.isValidStroke({ tool: 'star', color: '#2563eb', size: 6, points: [{ x: 1, y: 1 }] }), false);
  assert.equal(P.isValidStroke({ tool: 'rect', color: '#ef4444', size: 4, x0: -1, y0: 0, x1: 5, y1: 5 }), false);
  assert.equal(P.isValidStroke({ tool: 'brush', color: '#2563eb', size: 6, points: [{ x: 1, y: 1, z: 2 }] }), false);
  assert.equal(P.isValidStroke({ tool: 'brush', color: '#2563eb', size: 6, points: [{ x: 1, y: 1 }], extra: 1 }), false);
  assert.equal(P.isValidStroke({ tool: 'line', color: '#000000', size: 2, x0: 0, y0: 0, x1: 5000, y1: 5000 }), true);
});

test('history: push/undo/redo + 50 cap', () => {
  const h = P.createHistory();
  assert.equal(P.undoHistory(h, []), null);
  assert.equal(P.redoHistory(h, []), null);
  P.pushHistory(h, ['a']);
  P.pushHistory(h, ['a', 'b']);
  assert.deepEqual(P.undoHistory(h, ['a', 'b', 'c']), ['a', 'b']);
  assert.deepEqual(P.redoHistory(h, ['a', 'b']), ['a', 'b', 'c']);
  // cap: push 60 snapshots, only 50 retained
  const h2 = P.createHistory();
  for (let i = 0; i < 60; i++) P.pushHistory(h2, [i]);
  assert.equal(h2.past.length, 50);
  assert.equal(h2.past[0][0], 10);
  // push clears redo
  P.pushHistory(h2, [999]);
  assert.equal(h2.future.length, 0);
});

test('gallery import validation: valid + 10 malformed rejected', () => {
  const item = { id: 'd1', name: 'Test', createdAt: 1000, bg: '#ffffff', strokes: [brush([{ x: 1, y: 1 }]), rect] };
  const good = { app: 'doodle-board-bd', version: 1, gallery: [item] };
  assert.equal(P.validateGalleryImport(good), true);
  const bad = [
    null, [], 'x', { app: 'other', version: 1, gallery: [] },
    { app: 'doodle-board-bd', version: 2, gallery: [] },
    { app: 'doodle-board-bd', version: 1, gallery: [{ ...item, name: '' }] },
    { app: 'doodle-board-bd', version: 1, gallery: [{ ...item, strokes: [brush([{ x: -5, y: 1 }])] }] },
    { app: 'doodle-board-bd', version: 1, gallery: [{ ...item, bg: 'red' }] },
    { app: 'doodle-board-bd', version: 1, gallery: [item, item] }, // duplicate id
    { app: 'doodle-board-bd', version: 1, gallery: [{ ...item, extra: 1 }] },
    { app: 'doodle-board-bd', version: 1, gallery: [], extra: 1 },
    { app: 'doodle-board-bd', version: 1, gallery: Array.from({ length: 11 }, (_, i) => ({ ...item, id: 'd' + i })) },
  ];
  for (const b of bad) assert.equal(P.validateGalleryImport(b), false, JSON.stringify(b).slice(0, 80));
});

test('drawing name validation', () => {
  assert.equal(P.validateDrawingName('  Cat  '), true);
  assert.equal(P.validateDrawingName(''), false);
  assert.equal(P.validateDrawingName('   '), false);
  assert.equal(P.validateDrawingName('x'.repeat(61)), false);
  assert.equal(P.validateDrawingName('x'.repeat(60)), true);
});

test('stroke stats', () => {
  assert.deepEqual(P.strokeStats([]), { strokes: 0, points: 0 });
  assert.deepEqual(P.strokeStats([brush([{ x: 1, y: 1 }, { x: 2, y: 2 }]), rect]), { strokes: 2, points: 4 });
});

test('Bengali digits', () => {
  assert.equal(P.toBnDigits('Size 6'), 'Size \u09ec');
  assert.equal(P.toBnDigits(12345), '\u09e7\u09e8\u09e9\u09ea\u09eb');
});
