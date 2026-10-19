'use strict';
/* Doodle Board BD \u2014 canvas drawing, gallery, i18n. Depends on DoodlePure (js/pure.js). */
(function () {
  var P = window.DoodlePure;
  var LS_CURRENT = 'doodle-board-bd:current';
  var LS_GALLERY = 'doodle-board-bd:gallery';
  var LS_LANG = 'doodle-board-bd:lang';
  var PALETTE = ['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#2563eb', '#8b5cf6', '#ec4899', '#78350f', '#64748b'];

  var I18N = {
    en: {
      appTitle: 'Doodle Board BD',
      subtitle: 'Draw, sketch and save \u2014 fully offline.',
      toolBrush: 'Brush', toolEraser: 'Eraser', toolLine: 'Line', toolRect: 'Rectangle', toolCircle: 'Circle',
      colorLabel: 'Color', sizeLabel: 'Size', bgLabel: 'Background',
      undo: 'Undo', redo: 'Redo', clear: 'Clear',
      emptyHint: 'Draw here \u2014 pick a brush and start sketching.',
      galleryTitle: 'Saved drawings', namePlaceholder: 'Drawing name', saveDrawing: 'Save drawing',
      galleryEmpty: 'No saved drawings yet.',
      exportPng: 'Download PNG', exportJson: 'Export gallery JSON', importJson: 'Import gallery JSON',
      erasePlaceholder: 'Type DELETE to erase everything', eraseAll: 'Erase everything',
      disclaimer: 'Personal drawing board. Everything stays in your browser \u2014 nothing is uploaded. Drawings are stored in this browser\u2019s local storage.',
      strokesLabel: '{n} stroke(s)', canvasSize: 'Canvas: {w} \u00d7 {h} px',
      load: 'Load', del: 'Delete', loaded: 'Loaded \u201c{name}\u201d.', saved: 'Saved \u201c{name}\u201d.',
      deleted: 'Deleted \u201c{name}\u201d.', cleared: 'Canvas cleared.', erased: 'Everything erased.',
      nameRequired: 'Please enter a name (1\u201360 characters).',
      galleryFull: 'Gallery is full (max 10 drawings). Delete one first.',
      importOk: 'Gallery imported ({n} drawing(s)).', importBad: 'Invalid file \u2014 import rejected, your drawings are unchanged.',
      storageFull: 'Browser storage is full \u2014 could not save this drawing.',
      confirmClear: 'Clear the canvas? Unsaved drawing will be lost.',
      confirmDelete: 'Delete \u201c{name}\u201d?', confirmErase: 'Erase all saved drawings and the current canvas? Type DELETE first.'
    },
    bn: {
      appTitle: '\u09a1\u09c1\u09a1\u09b2 \u09ac\u09cb\u09b0\u09cd\u09a1 \u09ac\u09bf\u09a1\u09bf',
      subtitle: '\u0986\u0981\u0995\u09c1\u09a8, \u09b8\u09cd\u0995\u09c7\u099a \u0995\u09b0\u09c1\u09a8 \u0986\u09b0 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3 \u0995\u09b0\u09c1\u09a8 \u2014 \u09b8\u09ae\u09cd\u09aa\u09c2\u09b0\u09cd\u09a3 \u0985\u09ab\u09b2\u09be\u0987\u09a8\u0964',
      toolBrush: '\u09ac\u09cd\u09b0\u09be\u09b6', toolEraser: '\u0987\u09b0\u09c7\u099c\u09be\u09b0', toolLine: '\u09b0\u09c7\u0996\u09be', toolRect: '\u0986\u09af\u09bc\u09a4\u0995\u09cd\u09b7\u09c7\u09a4\u09cd\u09b0', toolCircle: '\u09ac\u09c3\u09a4\u09cd\u09a4',
      colorLabel: '\u09b0\u0982', sizeLabel: '\u0986\u0995\u09be\u09b0', bgLabel: '\u09aa\u099f\u09ad\u09c2\u09ae\u09bf',
      undo: '\u09aa\u09c2\u09b0\u09cd\u09ac\u09be\u09ac\u09b8\u09cd\u09a5\u09be', redo: '\u09aa\u09c1\u09a8\u09b0\u09be\u09af\u09bc', clear: '\u09ae\u09c1\u099b\u09c1\u09a8',
      emptyHint: '\u098f\u0996\u09be\u09a8\u09c7 \u0986\u0981\u0995\u09c1\u09a8 \u2014 \u098f\u0995\u099f\u09bf \u09ac\u09cd\u09b0\u09be\u09b6 \u09ac\u09c7\u099b\u09c7 \u09a8\u09bf\u09af\u09bc\u09c7 \u09b8\u09cd\u0995\u09c7\u099a \u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09c1\u09a8\u0964',
      galleryTitle: '\u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u099b\u09ac\u09bf', namePlaceholder: '\u099b\u09ac\u09bf\u09b0 \u09a8\u09be\u09ae', saveDrawing: '\u099b\u09ac\u09bf \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3',
      galleryEmpty: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u099b\u09ac\u09bf \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09af\u09bc\u09a8\u09bf\u0964',
      exportPng: 'PNG \u09a1\u09be\u0989\u09a8\u09b2\u09cb\u09a1', exportJson: '\u0997\u09cd\u09af\u09be\u09b2\u09be\u09b0\u09bf JSON \u09b0\u09aa\u09cd\u09a4\u09be\u09a8\u09bf', importJson: '\u0997\u09cd\u09af\u09be\u09b2\u09be\u09b0\u09bf JSON \u0986\u09ae\u09a6\u09be\u09a8\u09bf',
      erasePlaceholder: '\u09b8\u09ac \u09ae\u09c1\u099b\u09a4\u09c7 DELETE \u09b2\u09bf\u0996\u09c1\u09a8', eraseAll: '\u09b8\u09ac \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09c1\u09a8',
      disclaimer: '\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u0997\u09a4 \u0986\u0981\u0995\u09be\u09b0 \u09ac\u09cb\u09b0\u09cd\u09a1\u0964 \u09b8\u09ac\u0995\u09bf\u099b\u09c1 \u0986\u09aa\u09a8\u09be\u09b0 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7\u0987 \u09a5\u09be\u0995\u09c7 \u2014 \u0995\u09bf\u099b\u09c1\u0987 \u0986\u09aa\u09b2\u09cb\u09a1 \u09b9\u09af\u09bc \u09a8\u09be\u0964 \u099b\u09ac\u09bf\u0997\u09c1\u09b2\u09cb \u098f\u0987 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7\u09b0 \u09b2\u09cb\u0995\u09be\u09b2 \u09b8\u09cd\u099f\u09cb\u09b0\u09c7\u099c\u09c7 \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09af\u09bc\u0964',
      strokesLabel: '{n}\u099f\u09bf \u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u0995', canvasSize: '\u0995\u09cd\u09af\u09be\u09a8\u09ad\u09be\u09b8: {w} \u00d7 {h} \u09aa\u09bf\u0995\u09cd\u09b8\u09c7\u09b2',
      load: '\u09b2\u09cb\u09a1', del: '\u09ae\u09c1\u099b\u09c1\u09a8', loaded: '\u201c{name}\u201d \u09b2\u09cb\u09a1 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964', saved: '\u201c{name}\u201d \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      deleted: '\u201c{name}\u201d \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964', cleared: '\u0995\u09cd\u09af\u09be\u09a8\u09ad\u09be\u09b8 \u09aa\u09b0\u09bf\u09b7\u09cd\u0995\u09be\u09b0\u0964', erased: '\u09b8\u09ac \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964',
      nameRequired: '\u098f\u0995\u099f\u09bf \u09a8\u09be\u09ae \u09a6\u09bf\u09a8 (\u09e7\u2013\u09ec\u09e6 \u0985\u0995\u09cd\u09b7\u09b0)\u0964',
      galleryFull: '\u0997\u09cd\u09af\u09be\u09b2\u09be\u09b0\u09bf \u09aa\u09c2\u09b0\u09cd\u09a3 (\u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u09e7\u09e6\u099f\u09bf \u099b\u09ac\u09bf)\u0964 \u0986\u0997\u09c7 \u098f\u0995\u099f\u09bf \u09ae\u09c1\u099b\u09c1\u09a8\u0964',
      importOk: '\u0997\u09cd\u09af\u09be\u09b2\u09be\u09b0\u09bf \u0986\u09ae\u09a6\u09be\u09a8\u09bf \u09b9\u09af\u09bc\u09c7\u099b\u09c7 ({n}\u099f\u09bf \u099b\u09ac\u09bf)\u0964', importBad: '\u0985\u09ac\u09c8\u09a7 \u09ab\u09be\u0987\u09b2 \u2014 \u0986\u09ae\u09a6\u09be\u09a8\u09bf \u09ac\u09be\u09a4\u09bf\u09b2, \u0986\u09aa\u09a8\u09be\u09b0 \u099b\u09ac\u09bf\u0997\u09c1\u09b2\u09cb \u0985\u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09bf\u09a4 \u0986\u099b\u09c7\u0964',
      storageFull: '\u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0 \u09b8\u09cd\u099f\u09cb\u09b0\u09c7\u099c \u09aa\u09c2\u09b0\u09cd\u09a3 \u2014 \u098f\u0987 \u099b\u09ac\u09bf\u099f\u09bf \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09a3 \u0995\u09b0\u09be \u09af\u09be\u09af\u09bc\u09a8\u09bf\u0964',
      confirmClear: '\u0995\u09cd\u09af\u09be\u09a8\u09ad\u09be\u09b8 \u09ae\u09c1\u099b\u09ac\u09c7\u09a8? \u0985\u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u099b\u09ac\u09bf \u09b9\u09be\u09b0\u09bf\u09af\u09bc\u09c7 \u09af\u09be\u09ac\u09c7\u0964',
      confirmDelete: '\u201c{name}\u201d \u09ae\u09c1\u099b\u09ac\u09c7\u09a8?', confirmErase: '\u09b8\u09ac \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u099b\u09ac\u09bf \u0993 \u09ac\u09b0\u09cd\u09a4\u09ae\u09be\u09a8 \u0995\u09cd\u09af\u09be\u09a8\u09ad\u09be\u09b8 \u09ae\u09c1\u099b\u09ac\u09c7\u09a8? \u0986\u0997\u09c7 DELETE \u09b2\u09bf\u0996\u09c1\u09a8\u0964'
    }
  };

  var canvas = document.getElementById('board');
  var ctx = canvas.getContext('2d');
  var wrap = document.getElementById('canvasWrap');
  var emptyHint = document.getElementById('emptyHint');
  var langBtn = document.getElementById('langBtn');
  var sizeRange = document.getElementById('sizeRange');
  var sizeValue = document.getElementById('sizeValue');
  var customColor = document.getElementById('customColor');
  var bgColor = document.getElementById('bgColor');
  var undoBtn = document.getElementById('undoBtn');
  var redoBtn = document.getElementById('redoBtn');
  var clearBtn = document.getElementById('clearBtn');
  var saveBtn = document.getElementById('saveBtn');
  var drawingName = document.getElementById('drawingName');
  var formError = document.getElementById('formError');
  var importError = document.getElementById('importError');
  var galleryEl = document.getElementById('gallery');
  var galleryEmpty = document.getElementById('galleryEmpty');
  var exportPngBtn = document.getElementById('exportPngBtn');
  var exportJsonBtn = document.getElementById('exportJsonBtn');
  var importFile = document.getElementById('importFile');
  var eraseConfirm = document.getElementById('eraseConfirm');
  var eraseBtn = document.getElementById('eraseBtn');
  var strokeCountEl = document.getElementById('strokeCount');
  var canvasSizeEl = document.getElementById('canvasSize');

  var lang = 'en';
  try { lang = localStorage.getItem(LS_LANG) === 'bn' ? 'bn' : 'en'; } catch (e) { lang = 'en'; }
  var tool = 'brush';
  var color = '#2563eb';
  var size = 6;
  var bg = '#ffffff';
  var strokes = [];
  var history = P.createHistory();
  var gallery = [];
  var drawing = null; // in-progress stroke
  var preview = null; // in-progress shape preview

  function t(key, vars) {
    var s = (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function fmtNum(n) { return lang === 'bn' ? P.toBnDigits(n) : String(n); }
  function snapshot() { return JSON.parse(JSON.stringify(strokes)); }

  function applyLang() {
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    langBtn.textContent = lang === 'bn' ? 'English' : '\u09ac\u09be\u0982\u09b2\u09be';
    sizeValue.textContent = fmtNum(size);
    renderMeta();
    renderGallery();
    try { localStorage.setItem(LS_LANG, lang); } catch (e) { /* storage unavailable */ }
  }

  function buildPalette() {
    var pal = document.getElementById('palette');
    pal.innerHTML = '';
    PALETTE.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch' + (c === color ? ' active' : '');
      b.style.background = c;
      b.setAttribute('aria-label', c);
      b.addEventListener('click', function () {
        color = c; customColor.value = c;
        pal.querySelectorAll('.swatch').forEach(function (s) { s.classList.toggle('active', s === b); });
      });
      pal.appendChild(b);
    });
  }

  function fitCanvas() {
    var dpr = window.devicePixelRatio || 1;
    var w = Math.max(280, wrap.clientWidth);
    var h = Math.round(w * 520 / 900);
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    render();
  }
  function pos(e) {
    var r = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    return {
      x: Math.round(((e.clientX - r.left) * canvas.width / r.width / dpr) * 10) / 10,
      y: Math.round(((e.clientY - r.top) * canvas.height / r.height / dpr) * 10) / 10
    };
  }
  function drawStroke(s, isPreview) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.setLineDash(isPreview ? [6, 4] : []);
    if (s.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = s.color;
      ctx.fillStyle = s.color;
    }
    ctx.lineWidth = s.size;
    if (s.tool === 'brush' || s.tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (var i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
      ctx.stroke();
      if (s.points.length === 1) { ctx.beginPath(); ctx.arc(s.points[0].x, s.points[0].y, s.size / 2, 0, Math.PI * 2); ctx.fill(); }
    } else if (s.tool === 'line') {
      ctx.beginPath(); ctx.moveTo(s.x0, s.y0); ctx.lineTo(s.x1, s.y1); ctx.stroke();
    } else if (s.tool === 'rect') {
      ctx.strokeRect(Math.min(s.x0, s.x1), Math.min(s.y0, s.y1), Math.abs(s.x1 - s.x0), Math.abs(s.y1 - s.y0));
    } else if (s.tool === 'circle') {
      var rx = Math.abs(s.x1 - s.x0) / 2, ry = Math.abs(s.y1 - s.y0) / 2;
      ctx.beginPath();
      ctx.ellipse((s.x0 + s.x1) / 2, (s.y0 + s.y1) / 2, Math.max(rx, 0.1), Math.max(ry, 0.1), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
  function render() {
    var dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    strokes.forEach(function (s) { drawStroke(s, false); });
    if (preview) drawStroke(preview, true);
    emptyHint.style.display = strokes.length === 0 && !preview ? 'flex' : 'none';
    undoBtn.disabled = history.past.length === 0;
    redoBtn.disabled = history.future.length === 0;
    renderMeta();
  }
  function renderMeta() {
    var st = P.strokeStats(strokes);
    strokeCountEl.textContent = t('strokesLabel', { n: fmtNum(st.strokes) });
    var dpr = window.devicePixelRatio || 1;
    canvasSizeEl.textContent = t('canvasSize', { w: fmtNum(Math.round(canvas.width / dpr)), h: fmtNum(Math.round(canvas.height / dpr)) });
  }
  function persistCurrent() {
    try { localStorage.setItem(LS_CURRENT, JSON.stringify({ strokes: strokes, bg: bg })); } catch (e) { /* ignore */ }
  }
  function persistGallery() {
    try { localStorage.setItem(LS_GALLERY, JSON.stringify(gallery)); } catch (e) { /* ignore */ }
  }
  function showError(el, msg) {
    if (!msg) { el.hidden = true; el.textContent = ''; return; }
    el.hidden = false; el.textContent = msg;
  }
  function commit(stroke) {
    P.pushHistory(history, snapshot());
    strokes.push(stroke);
    render();
    persistCurrent();
  }

  canvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    var p = pos(e);
    if (tool === 'brush' || tool === 'eraser') {
      drawing = { tool: tool, color: color, size: size, points: [p] };
    } else {
      drawing = { tool: tool, color: color, size: size, x0: p.x, y0: p.y, x1: p.x, y1: p.y };
    }
    render();
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!drawing) return;
    var p = pos(e);
    if (drawing.points) {
      var last = drawing.points[drawing.points.length - 1];
      if (Math.abs(p.x - last.x) >= 0.5 || Math.abs(p.y - last.y) >= 0.5) drawing.points.push(p);
      preview = null;
    } else {
      drawing.x1 = p.x; drawing.y1 = p.y;
      preview = drawing;
    }
    render();
    if (drawing.points) drawStroke(drawing, false);
  });
  function endStroke(e) {
    if (!drawing) return;
    var finished = drawing;
    drawing = null; preview = null;
    if (finished.points && finished.points.length === 0) { render(); return; }
    commit(finished);
  }
  canvas.addEventListener('pointerup', endStroke);
  canvas.addEventListener('pointercancel', function () { drawing = null; preview = null; render(); });

  document.querySelectorAll('.tool-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      tool = b.getAttribute('data-tool');
      document.querySelectorAll('.tool-btn').forEach(function (x) { x.classList.toggle('active', x === b); });
    });
  });
  customColor.addEventListener('input', function () { color = customColor.value; buildPalette(); });
  sizeRange.addEventListener('input', function () { size = P.clampBrush(sizeRange.value); sizeValue.textContent = fmtNum(size); });
  bgColor.addEventListener('input', function () {
    if (!P.isValidHexColor(bgColor.value)) return;
    P.pushHistory(history, snapshot());
    bg = bgColor.value;
    render(); persistCurrent();
  });
  undoBtn.addEventListener('click', function () {
    var prev = P.undoHistory(history, snapshot());
    if (prev === null) return;
    strokes = prev; render(); persistCurrent();
  });
  redoBtn.addEventListener('click', function () {
    var next = P.redoHistory(history, snapshot());
    if (next === null) return;
    strokes = next; render(); persistCurrent();
  });
  clearBtn.addEventListener('click', function () {
    if (strokes.length === 0) return;
    if (!window.confirm(t('confirmClear'))) return;
    P.pushHistory(history, snapshot());
    strokes = []; render(); persistCurrent();
    showError(formError, t('cleared'));
  });
  langBtn.addEventListener('click', function () { lang = lang === 'bn' ? 'en' : 'bn'; applyLang(); });

  function thumbFor(savedStrokes, bgColorValue) {
    var off = document.createElement('canvas');
    var w = 340, h = Math.round(340 * canvas.height / Math.max(canvas.width, 1));
    off.width = w; off.height = h;
    var octx = off.getContext('2d');
    octx.fillStyle = bgColorValue; octx.fillRect(0, 0, w, h);
    var sx = w / (canvas.width / (window.devicePixelRatio || 1));
    var sy = h / (canvas.height / (window.devicePixelRatio || 1));
    savedStrokes.forEach(function (s) {
      octx.save();
      octx.scale(sx, sy);
      octx.lineCap = 'round'; octx.lineJoin = 'round';
      if (s.tool === 'eraser') { octx.globalCompositeOperation = 'destination-out'; octx.strokeStyle = 'rgba(0,0,0,1)'; }
      else { octx.strokeStyle = s.color; octx.fillStyle = s.color; }
      octx.lineWidth = s.size;
      if (s.points) {
        octx.beginPath(); octx.moveTo(s.points[0].x, s.points[0].y);
        for (var i = 1; i < s.points.length; i++) octx.lineTo(s.points[i].x, s.points[i].y);
        octx.stroke();
        if (s.points.length === 1) { octx.beginPath(); octx.arc(s.points[0].x, s.points[0].y, s.size / 2, 0, Math.PI * 2); octx.fill(); }
      } else if (s.tool === 'line') { octx.beginPath(); octx.moveTo(s.x0, s.y0); octx.lineTo(s.x1, s.y1); octx.stroke(); }
      else if (s.tool === 'rect') { octx.strokeRect(Math.min(s.x0, s.x1), Math.min(s.y0, s.y1), Math.abs(s.x1 - s.x0), Math.abs(s.y1 - s.y0)); }
      else if (s.tool === 'circle') {
        octx.beginPath();
        octx.ellipse((s.x0 + s.x1) / 2, (s.y0 + s.y1) / 2, Math.max(Math.abs(s.x1 - s.x0) / 2, 0.1), Math.max(Math.abs(s.y1 - s.y0) / 2, 0.1), 0, 0, Math.PI * 2);
        octx.stroke();
      }
      octx.restore();
    });
    return off.toDataURL('image/png');
  }

  function renderGallery() {
    galleryEl.innerHTML = '';
    galleryEmpty.style.display = gallery.length === 0 ? 'block' : 'none';
    gallery.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'g-item';
      var img = document.createElement('img');
      img.alt = item.name;
      img.src = thumbFor(item.strokes, item.bg);
      var meta = document.createElement('div');
      meta.className = 'g-meta';
      var nameEl = document.createElement('div');
      nameEl.className = 'g-name'; nameEl.textContent = item.name;
      var dateEl = document.createElement('div');
      dateEl.className = 'g-date';
      dateEl.textContent = new Date(item.createdAt).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB');
      meta.appendChild(nameEl); meta.appendChild(dateEl);
      var actions = document.createElement('div');
      actions.className = 'g-actions';
      var loadBtn = document.createElement('button');
      loadBtn.type = 'button'; loadBtn.className = 'btn primary'; loadBtn.textContent = t('load');
      loadBtn.addEventListener('click', function () {
        P.pushHistory(history, snapshot());
        strokes = JSON.parse(JSON.stringify(item.strokes));
        bg = item.bg; bgColor.value = item.bg;
        render(); persistCurrent();
        showError(formError, t('loaded', { name: item.name }));
      });
      var delBtn = document.createElement('button');
      delBtn.type = 'button'; delBtn.className = 'btn danger'; delBtn.textContent = t('del');
      delBtn.addEventListener('click', function () {
        if (!window.confirm(t('confirmDelete', { name: item.name }))) return;
        gallery = gallery.filter(function (g) { return g.id !== item.id; });
        persistGallery(); renderGallery();
        showError(formError, t('deleted', { name: item.name }));
      });
      actions.appendChild(loadBtn); actions.appendChild(delBtn);
      card.appendChild(img); card.appendChild(meta); card.appendChild(actions);
      galleryEl.appendChild(card);
    });
  }

  saveBtn.addEventListener('click', function () {
    showError(formError, '');
    if (!P.validateDrawingName(drawingName.value)) { showError(formError, t('nameRequired')); return; }
    if (gallery.length >= P.MAX_GALLERY) { showError(formError, t('galleryFull')); return; }
    var item = {
      id: 'd' + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36),
      name: drawingName.value.trim(),
      createdAt: Date.now(),
      bg: bg,
      strokes: snapshot()
    };
    gallery.push(item);
    try { persistGallery(); } catch (e) { gallery.pop(); showError(formError, t('storageFull')); return; }
    drawingName.value = '';
    renderGallery();
    showError(formError, t('saved', { name: item.name }));
  });
  exportPngBtn.addEventListener('click', function () {
    var a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'doodle-board-bd.png';
    document.body.appendChild(a); a.click(); a.remove();
  });
  exportJsonBtn.addEventListener('click', function () {
    var blob = new Blob([JSON.stringify({ app: 'doodle-board-bd', version: 1, gallery: gallery }, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'doodle-board-bd-gallery.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });
  importFile.addEventListener('change', function () {
    showError(importError, '');
    var file = importFile.files && importFile.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        if (!P.validateGalleryImport(data)) throw new Error('invalid');
        gallery = data.gallery;
        persistGallery(); renderGallery();
        showError(importError, t('importOk', { n: fmtNum(gallery.length) }));
      } catch (e) {
        showError(importError, t('importBad'));
      }
    };
    reader.onerror = function () { showError(importError, t('importBad')); };
    reader.readAsText(file);
    importFile.value = '';
  });
  eraseConfirm.addEventListener('input', function () {
    eraseBtn.disabled = eraseConfirm.value !== 'DELETE';
  });
  eraseBtn.addEventListener('click', function () {
    if (eraseConfirm.value !== 'DELETE') return;
    if (!window.confirm(t('confirmErase'))) return;
    gallery = []; strokes = []; history = P.createHistory();
    bg = '#ffffff'; bgColor.value = '#ffffff';
    try { localStorage.removeItem(LS_GALLERY); localStorage.removeItem(LS_CURRENT); } catch (e) { /* ignore */ }
    eraseConfirm.value = ''; eraseBtn.disabled = true;
    render(); renderGallery();
    showError(formError, t('erased'));
  });

  // Restore persisted state
  try {
    var savedGallery = JSON.parse(localStorage.getItem(LS_GALLERY) || 'null');
    if (Array.isArray(savedGallery) && P.validateGalleryImport({ app: 'doodle-board-bd', version: 1, gallery: savedGallery })) {
      gallery = savedGallery;
    }
    var savedCurrent = JSON.parse(localStorage.getItem(LS_CURRENT) || 'null');
    if (savedCurrent && P.validateStrokes(savedCurrent.strokes) && P.isValidHexColor(savedCurrent.bg)) {
      strokes = savedCurrent.strokes;
      bg = savedCurrent.bg; bgColor.value = bg;
    }
  } catch (e) { /* corrupted storage: start empty */ }

  buildPalette();
  applyLang();
  fitCanvas();
  render();
  var resizeTimer = null;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitCanvas, 150);
  });
})();
