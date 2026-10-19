'use strict';
/* Pure (DOM-free) logic for Doodle Board BD \u2014 shared by the app and node tests. */
(function (root) {
  var TOOLS = ['brush', 'eraser', 'line', 'rect', 'circle'];
  var MAX_HISTORY = 50;
  var MAX_GALLERY = 10;
  var MAX_STROKES = 2000;
  var MAX_POINTS = 20000;

  function isPlainObject(v) {
    return v !== null && typeof v === 'object' && !Array.isArray(v);
  }
  function isFiniteNumber(v) {
    return typeof v === 'number' && isFinite(v);
  }
  function isValidHexColor(v) {
    return typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
  }
  function clampBrush(v) {
    var n = Math.round(Number(v));
    if (!isFinite(n)) return 6;
    if (n < 1) return 1;
    if (n > 50) return 50;
    return n;
  }
  function isValidPoint(p) {
    return isPlainObject(p) && isFiniteNumber(p.x) && isFiniteNumber(p.y) &&
      p.x >= 0 && p.x <= 5000 && p.y >= 0 && p.y <= 5000 &&
      Object.keys(p).length === 2;
  }
  function isValidStroke(s) {
    if (!isPlainObject(s)) return false;
    if (TOOLS.indexOf(s.tool) === -1) return false;
    if (!isValidHexColor(s.color)) return false;
    if (!isFiniteNumber(s.size) || s.size < 1 || s.size > 50) return false;
    if (s.tool === 'brush' || s.tool === 'eraser') {
      if (!Array.isArray(s.points) || s.points.length < 1 || s.points.length > MAX_POINTS) return false;
      for (var i = 0; i < s.points.length; i++) if (!isValidPoint(s.points[i])) return false;
      return Object.keys(s).length === 4;
    }
    // shape strokes
    var keys = ['tool', 'color', 'size', 'x0', 'y0', 'x1', 'y1'];
    if (Object.keys(s).length !== keys.length) return false;
    for (var j = 0; j < 4; j++) {
      var k = ['x0', 'y0', 'x1', 'y1'][j];
      if (!isFiniteNumber(s[k]) || s[k] < 0 || s[k] > 5000) return false;
    }
    return true;
  }
  function validateStrokes(strokes) {
    if (!Array.isArray(strokes) || strokes.length > MAX_STROKES) return false;
    for (var i = 0; i < strokes.length; i++) if (!isValidStroke(strokes[i])) return false;
    return true;
  }
  function validateGalleryItem(item) {
    if (!isPlainObject(item)) return false;
    if (typeof item.id !== 'string' || item.id.length === 0 || item.id.length > 64) return false;
    if (typeof item.name !== 'string' || item.name.length === 0 || item.name.length > 60) return false;
    if (!isFiniteNumber(item.createdAt) || item.createdAt < 0) return false;
    if (!isValidHexColor(item.bg)) return false;
    if (!validateStrokes(item.strokes)) return false;
    return Object.keys(item).length === 5;
  }
  function validateGalleryImport(data) {
    if (!isPlainObject(data)) return false;
    if (data.app !== 'doodle-board-bd' || data.version !== 1) return false;
    if (!Array.isArray(data.gallery) || data.gallery.length > MAX_GALLERY) return false;
    var ids = {};
    for (var i = 0; i < data.gallery.length; i++) {
      if (!validateGalleryItem(data.gallery[i])) return false;
      if (ids[data.gallery[i].id]) return false;
      ids[data.gallery[i].id] = true;
    }
    return Object.keys(data).length === 3;
  }
  function validateDrawingName(name) {
    if (typeof name !== 'string') return false;
    var t = name.trim();
    return t.length >= 1 && t.length <= 60;
  }
  function createHistory() {
    return { past: [], future: [] };
  }
  function pushHistory(history, snapshot) {
    history.past.push(snapshot);
    if (history.past.length > MAX_HISTORY) history.past.shift();
    history.future = [];
    return history;
  }
  function undoHistory(history, current) {
    if (history.past.length === 0) return null;
    history.future.push(current);
    return history.past.pop();
  }
  function redoHistory(history, current) {
    if (history.future.length === 0) return null;
    history.past.push(current);
    return history.future.pop();
  }
  function strokeStats(strokes) {
    var points = 0;
    for (var i = 0; i < strokes.length; i++) {
      if (strokes[i].points) points += strokes[i].points.length;
      else points += 2;
    }
    return { strokes: strokes.length, points: points };
  }
  function toBnDigits(str) {
    var map = ['\u09e6', '\u09e7', '\u09e8', '\u09e9', '\u09ea', '\u09eb', '\u09ec', '\u09ed', '\u09ee', '\u09ef'];
    return String(str).replace(/[0-9]/g, function (d) { return map[Number(d)]; });
  }

  var api = {
    TOOLS: TOOLS, MAX_HISTORY: MAX_HISTORY, MAX_GALLERY: MAX_GALLERY,
    isValidHexColor: isValidHexColor, clampBrush: clampBrush,
    isValidStroke: isValidStroke, validateStrokes: validateStrokes,
    validateGalleryItem: validateGalleryItem,
    validateGalleryImport: validateGalleryImport,
    validateDrawingName: validateDrawingName,
    createHistory: createHistory, pushHistory: pushHistory,
    undoHistory: undoHistory, redoHistory: redoHistory,
    strokeStats: strokeStats, toBnDigits: toBnDigits
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DoodlePure = api;
})(typeof window !== 'undefined' ? window : globalThis);
