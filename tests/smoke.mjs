'use strict';
/* Headless-Chrome smoke test via raw CDP (no puppeteer). Run: node tests/smoke.mjs */
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PAGE = 'file://' + join(ROOT, 'index.html');
const CHROME = '/opt/meta-chromium/chrome';
const PORT = 9223 + (process.pid % 50);

let passed = 0, failed = 0;
function check(name, cond, extra = '') {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + ' ' + extra); }
}

const profile = mkdtempSync(join(tmpdir(), 'doodle-smoke-'));
const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu',
  '--remote-debugging-port=' + PORT, '--user-data-dir=' + profile, 'about:blank'],
  { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ws;
try {
  let tabs = null;
  for (let i = 0; i < 50 && !tabs; i++) {
    await sleep(300);
    try { tabs = await (await fetch('http://127.0.0.1:' + PORT + '/json/list')).json(); } catch { /* retry */ }
  }
  if (!tabs || !tabs[0]) throw new Error('no CDP target');
  ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let seq = 0;
  const pending = new Map();
  const events = [];
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); p(msg); }
    else events.push(msg);
  };
  const send = (method, params = {}) => new Promise((resolve) => {
    const id = ++seq;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
  const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.result?.value;

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: PAGE });
  await sleep(1500);
  const errors = [];
  // Re-attach listener for console errors after load
  const origHandler = ws.onmessage;
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params?.type === 'error') errors.push(JSON.stringify(msg.params.args));
    if (msg.method === 'Runtime.exceptionThrown') errors.push(JSON.stringify(msg.params.exceptionDetails?.exception?.description || 'exception'));
    origHandler(m);
  };

  check('title renders', (await ev('document.title')) === 'Doodle Board BD');
  check('canvas present', (await ev('!!document.getElementById("board")')) === true);
  check('5 tool buttons', (await ev('document.querySelectorAll(".tool-btn").length')) === 5);
  check('12 palette swatches', (await ev('document.querySelectorAll(".swatch").length')) === 12);
  check('empty hint visible', (await ev('getComputedStyle(document.getElementById("emptyHint")).display')) === 'flex');
  check('undo disabled at start', (await ev('document.getElementById("undoBtn").disabled')) === true);

  // Draw a freehand stroke via CDP mouse events
  const rect = await ev('(()=>{const r=document.getElementById("board").getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height};})()');
  const x0 = rect.x + 60, y0 = rect.y + 60;
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: x0, y: y0, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x0 + 80, y: y0 + 40, button: 'left', buttons: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x0 + 160, y: y0 + 10, button: 'left', buttons: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x0 + 160, y: y0 + 10, button: 'left', clickCount: 1 });
  await sleep(400);
  check('stroke count = 1 after draw', (await ev('document.getElementById("strokeCount").textContent')) === '1 stroke(s)');
  check('canvas non-blank after draw', (await ev(`(()=>{const c=document.getElementById("board");const d=c.getContext("2d").getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<d.length;i+=4){if(d[i]<200||d[i+1]<200||d[i+2]<200)n++;}return n;})()`)) > 50);
  check('undo enabled after draw', (await ev('document.getElementById("undoBtn").disabled')) === false);

  // Undo -> blank; redo -> drawn again
  await ev('document.getElementById("undoBtn").click()');
  await sleep(300);
  check('stroke count = 0 after undo', (await ev('document.getElementById("strokeCount").textContent')) === '0 stroke(s)');
  check('canvas blank after undo', (await ev(`(()=>{const c=document.getElementById("board");const d=c.getContext("2d").getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<d.length;i+=4){if(d[i]<200||d[i+1]<200||d[i+2]<200)n++;}return n;})()`)) === 0);
  await ev('document.getElementById("redoBtn").click()');
  await sleep(300);
  check('stroke count = 1 after redo', (await ev('document.getElementById("strokeCount").textContent')) === '1 stroke(s)');

  // Shape: rectangle via tool switch + drag
  await ev('document.querySelector(\'[data-tool="rect"]\').click()');
  const x1 = rect.x + 300, y1 = rect.y + 100;
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: x1, y: y1, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x1 + 120, y: y1 + 90, button: 'left', buttons: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x1 + 120, y: y1 + 90, button: 'left', clickCount: 1 });
  await sleep(400);
  check('stroke count = 2 after rectangle', (await ev('document.getElementById("strokeCount").textContent')) === '2 stroke(s)');

  // Eraser tool switch + save to gallery
  await ev('document.querySelector(\'[data-tool="brush"]\').click()');
  await ev('(()=>{const i=document.getElementById("drawingName");i.value="Smoke Test";i.dispatchEvent(new Event("input",{bubbles:true}));})()');
  await ev('document.getElementById("saveBtn").click()');
  await sleep(400);
  check('gallery has 1 item after save', (await ev('document.querySelectorAll(".g-item").length')) === 1);
  check('gallery item name', (await ev('document.querySelector(".g-name").textContent')) === 'Smoke Test');

  // Reload: current canvas + gallery persist
  await send('Page.reload', { ignoreCache: true });
  await sleep(1500);
  check('stroke count persists after reload', (await ev('document.getElementById("strokeCount").textContent')) === '2 stroke(s)');
  check('gallery persists after reload', (await ev('document.querySelectorAll(".g-item").length')) === 1);

  // BN toggle renders Bengali
  await ev('document.getElementById("langBtn").click()');
  await sleep(300);
  check('BN toggle changes title', (await ev('document.querySelector("h1").textContent')) === '\u09a1\u09c1\u09a1\u09b2 \u09ac\u09cb\u09b0\u09cd\u09a1 \u09ac\u09bf\u09a1\u09bf');
  check('BN digits in stroke count', (await ev('document.getElementById("strokeCount").textContent')) === '\u09e8\u099f\u09bf \u09b8\u09cd\u099f\u09cd\u09b0\u09cb\u0995');
  await ev('document.getElementById("langBtn").click()');
  await sleep(300);

  // Invalid import rejected, gallery intact
  await ev(`(()=>{localStorage.setItem("doodle-board-bd:import-test","1")})()`);
  const badImport = await ev(`(()=>{
    const P = window.DoodlePure;
    return P.validateGalleryImport({app:"doodle-board-bd",version:1,gallery:[{id:"x",name:"",createdAt:1,bg:"#fff",strokes:[]}]});
  })()`);
  check('invalid gallery import rejected by validator', badImport === false);
  check('gallery still 1 after bad import check', (await ev('document.querySelectorAll(".g-item").length')) === 1);

  // 390px mobile: no horizontal overflow
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await sleep(600);
  check('390px no horizontal overflow', (await ev('document.documentElement.scrollWidth <= 390')) === true);
  await send('Emulation.clearDeviceMetricsOverride');

  // Zero network requests (file:// page) \u2014 check performance entries for http(s)
  check('zero http(s) network requests', (await ev('performance.getEntriesByType("resource").filter(e=>/^https?:/.test(e.name)).length')) === 0);

  check('zero console errors', errors.length === 0, JSON.stringify(errors).slice(0, 300));
} finally {
  try { ws?.close(); } catch { /* ignore */ }
  chrome.kill('SIGKILL');
}
console.log(`\nSMOKE: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
