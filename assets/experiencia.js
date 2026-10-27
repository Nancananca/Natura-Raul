
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const M = JSON.parse(document.getElementById('modelo').textContent);
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const es = (v, d = 2) => Number(v).toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d });
const Q = new URLSearchParams(location.search);
// ── Motor de calidad ──────────────────────────────────────────────────────────────────
const R = new THREE.WebGLRenderer({ canvas: $('#c'), antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
R.setPixelRatio(Math.min(devicePixelRatio, 1.75)); R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
R.toneMapping = THREE.NeutralToneMapping; R.toneMappingExposure = .9; R.localClippingEnabled = true;
const L2 = new CSS2DRenderer({ element: $('#lbl') });
const S = new THREE.Scene();
const camP = new THREE.PerspectiveCamera(42, 1, .05, 4000); const camO = new THREE.OrthographicCamera(-10, 10, 10, -10, .1, 800);
camO.up.set(0,0,-1);
let cam = camP;
const ctl = new OrbitControls(camP, R.domElement); ctl.enableDamping = true; ctl.maxPolarAngle = Math.PI * .497; ctl.minDistance = .4; ctl.maxDistance = 320;
const ctlO = new OrbitControls(camO, R.domElement); ctlO.enableRotate = false; ctlO.enabled = false; ctlO.screenSpacePanning = true;
ctlO.mouseButtons.LEFT = THREE.MOUSE.PAN; ctlO.mouseButtons.RIGHT = THREE.MOUSE.PAN;
ctlO.touches.ONE = THREE.TOUCH.PAN; ctlO.touches.TWO = THREE.TOUCH.DOLLY_PAN;
ctlO.minZoom = .5; ctlO.maxZoom = 5;
const composer = new EffectComposer(R); const rp = new RenderPass(S, camP); composer.addPass(rp);
const gtao = new GTAOPass(S, camP, 1, 1); gtao.blendIntensity = .9; composer.addPass(gtao);
try { gtao.updateGtaoMaterial({ radius: .45, distanceExponent: 1.6, thickness: 1.2, scale: 1, samples: 16 }); gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 }); } catch (e) {}
composer.addPass(new OutputPass()); const smaa = new SMAAPass(1, 1); composer.addPass(smaa);
const W = (x, y, z) => new THREE.Vector3(x, z, y);   // modelo (x, y, z↑) → three (x, y↑, z)
// ── Materiales: mundo y maqueta ─────────────────────────────────────────────────────────
const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .9, ...o });
function texRuido(c1, c2, n = 256, tipo = 'ruido') {
  const cv = document.createElement('canvas'); cv.width = cv.height = n; const x = cv.getContext('2d'); x.fillStyle = c1; x.fillRect(0, 0, n, n);
  if (tipo === 'tablas') { for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? c2 : c1; x.globalAlpha = .35; x.fillRect(0, i * n / 16, n, n / 16 - 1); } x.globalAlpha = .12; x.fillStyle = '#000'; for (let i = 0; i < 16; i++) x.fillRect(0, i * n / 16, n, 1); }
  else if (tipo === 'losas') { x.strokeStyle = c2; x.lineWidth = 2; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(0, i * n / 4); x.lineTo(n, i * n / 4); x.stroke(); x.beginPath(); x.moveTo(i * n / 4, 0); x.lineTo(i * n / 4, n); x.stroke(); } }
  for (let i = 0; i < n * n / 18; i++) { x.globalAlpha = Math.random() * .08; x.fillStyle = Math.random() < .5 ? '#000' : '#fff'; x.fillRect(Math.random() * n, Math.random() * n, 2, 2); }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const T = { madera: texRuido('#b98d63', '#9c7149', 256, 'tablas'), piedra: texRuido('#e2dccf', '#cfc7b7', 256, 'losas'), estuco: texRuido('#f5f4ef', '#e9e7e0'), cesped: texRuido('#7f9a55', '#6b8646'), asfalto: texRuido('#55565a', '#4a4b4f'), lamas: texRuido('#8f5f33', '#7a4f2a', 128, 'tablas') };
for (const [k, r] of [['madera', 2], ['piedra', 1.5], ['cesped', 6], ['asfalto', 8], ['estuco', 2]]) T[k].repeat.set(r, r);
const MUNDO = {
  estuco: std('#ffffff', { map: T.estuco, roughness: .95 }), estucoInt: std('#efe2d8', { roughness: .95 }), losa: std('#cdc6ba', { roughness: .95 }), canto: std('#cfc8bc'),
  tabique: std('#f3efe8'), acero: std('#2f3330', { metalness: .6, roughness: .45 }), cim: std('#9e978b'), madera: std('#ffffff', { map: T.madera, roughness: .7 }),
  lamas: std('#ffffff', { map: T.lamas, roughness: .65 }), vidrio: new THREE.MeshPhysicalMaterial({ color: '#c7dce4', transparent: true, opacity: .28, roughness: .04, metalness: .1, depthWrite: false }),
  carpinteria: std('#2b2d2b', { metalness: .5, roughness: .5 }), puerta: std('#c08a66', { map: T.madera }), sueloMadera: std('#ffffff', { map: T.madera, roughness: .6 }), sueloPiedra: std('#ffffff', { map: T.piedra, roughness: .8 }),
  sueloGaraje: std('#b8b3aa'), cesped: std('#ffffff', { map: T.cesped }), tierra: std('#c9bea8'), asfalto: std('#ffffff', { map: T.asfalto }), acera: std('#ffffff', { map: T.piedra }), piedra: std('#dcd3c1'),
  agua: new THREE.MeshPhysicalMaterial({ color: '#5fa9b8', roughness: .05, metalness: .1, transmission: .2, transparent: true, opacity: .85 }), tela: std('#d9cfbf'), lino: std('#f1ece2'), blanco: std('#f6f4f0', { roughness: .4 }),
  encimera: std('#e9e5dc', { roughness: .35 }), oscuro: std('#2a2a28'), hoja: std('#5f7a43'), hojaOlivo: std('#8a9a72'), pino: std('#4f6b3a'), tronco: std('#6b5240'), seto: std('#56713f'),
  coche1: std('#e8e6e1', { metalness: .3, roughness: .35 }), coche2: std('#3c4a55', { metalness: .3, roughness: .35 }), luz: new THREE.MeshStandardMaterial({ color: '#fff3d6', emissive: '#ffcf8a', emissiveIntensity: 0 }),
  fv: std('#1d2738', { metalness: .4, roughness: .3 }), grava: std('#b9b2a5'), vecina: std('#ddc4b6', { roughness: .95 }),
};
for (const k of ['estuco', 'estucoInt', 'tabique']) MUNDO[k].side = THREE.DoubleSide;
const CLAY = std('#f4f2ee', { roughness: 1 }), CLAY2 = std('#e6e2da', { roughness: 1 }), CLAYW = std('#d8bf98', { roughness: .8 });
const MAQ = new Proxy({}, { get: (_, k) => ({ vidrio: new THREE.MeshStandardMaterial({ color: '#dfe7ea', transparent: true, opacity: .35, depthWrite: false }), agua: new THREE.MeshStandardMaterial({ color: '#dfe7ea' }),
  madera: CLAYW, lamas: CLAYW, puerta: CLAYW, cesped: CLAY2, tierra: CLAY2, asfalto: CLAY2, acera: CLAY, sueloMadera: CLAYW, hoja: CLAY, hojaOlivo: CLAY, pino: CLAY, seto: CLAY, tronco: CLAYW, luz: CLAY }[k] || CLAY) });
const MAQV = {}; for (const k of Object.keys(MUNDO)) MAQV[k] = MAQ[k];
CLAY.side = THREE.DoubleSide;
Object.assign(MAQV, {sueloPiedra:CLAY2, sueloGaraje:CLAY2, carpinteria:std('#7b8279'), acero:std('#7b8279')});
const todos = [];   // mallas con material intercambiable
function mesh(geo, mk, parent, sombra = true) { const m = new THREE.Mesh(geo, MUNDO[mk]); m.userData.mk = mk; m.castShadow = sombra && mk !== 'vidrio' && mk !== 'agua'; m.receiveShadow = true; parent.add(m); todos.push(m); return m; }
function caja(x0, y0, z0, x1, y1, z1, mk, parent, sombra = true) { const m = mesh(new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(z1 - z0), Math.abs(y1 - y0)), mk, parent, sombra); m.position.copy(W((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)); return m; }
function rcaja(x0, y0, z0, x1, y1, z1, mk, parent, r = .06) { const m = mesh(new RoundedBoxGeometry(Math.abs(x1 - x0), Math.abs(z1 - z0), Math.abs(y1 - y0), 3, r), mk, parent); m.position.copy(W((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)); return m; }
function plano(x0, y0, x1, y1, z, mk, parent, rep) { const g = new THREE.PlaneGeometry(x1 - x0, y1 - y0); if (rep) { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (x1 - x0) / rep, uv.getY(i) * (y1 - y0) / rep); }
  const m = mesh(g, mk, parent, false); m.rotation.x = -Math.PI / 2; m.position.copy(W((x0 + x1) / 2, (y0 + y1) / 2, z)); return m; }
// ── La casa (desde el modelo único) ─────────────────────────────────────────────────────
function muroGeo(p) {
  const [x0, y0, z0, x1, y1, z1] = p.box; const along = p.eje === 'y' ? y1 - y0 : x1 - x0, H = z1 - z0, Tk = p.eje === 'y' ? x1 - x0 : y1 - y0;
  const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(along, 0); sh.lineTo(along, H); sh.lineTo(0, H); sh.lineTo(0, 0);
  for (const h of p.huecos || []) { const pa = new THREE.Path();
    if (h.forma === 'circulo') pa.absarc((h.u0 + h.u1) / 2, (h.v0 + h.v1) / 2, (h.u1 - h.u0) / 2, 0, Math.PI * 2, true);
    else { const v1 = Math.min(h.v1, H - .02); pa.moveTo(h.u0, h.v0); pa.lineTo(h.u0, v1); pa.lineTo(h.u1, v1); pa.lineTo(h.u1, h.v0); pa.lineTo(h.u0, h.v0); }
    sh.holes.push(pa); }
  const g = new THREE.ExtrudeGeometry(sh, { depth: Tk, bevelEnabled: false, curveSegments: 48 });
  const m = new THREE.Matrix4();
  if (p.eje === 'x') m.set(1, 0, 0, x0, 0, 1, 0, z0, 0, 0, 1, y0, 0, 0, 0, 1); else m.set(0, 0, 1, x0, 0, 1, 0, z0, 1, 0, 0, y0, 0, 0, 0, 1);
  g.applyMatrix4(m);
  if(m.determinant()<0){ for(const attr of Object.values(g.attributes)){for(let i=0;i<attr.count;i+=3){for(let j=0;j<attr.itemSize;j++){const a=(i+1)*attr.itemSize+j,b=(i+2)*attr.itemSize+j,tmp=attr.array[a];attr.array[a]=attr.array[b];attr.array[b]=tmp;}}attr.needsUpdate=true;} }
  return g;
}
const USO_SUELO = { estar: 'sueloMadera', dormir: 'sueloMadera', trabajar: 'sueloMadera', guardar: 'sueloMadera', cocinar: 'sueloPiedra', agua: 'sueloPiedra', paso: 'sueloPiedra', garaje: 'sueloGaraje', exterior: 'madera' };
function casa({ interior = true, ox = 0, espejo = false } = {}) {
  const G = new THREE.Group(); G.userData.casa = true;
  const piezas = [];
  for (const p of M.piezas) {
    if (!interior && (p.cat === 'interior' || p.cat === 'cimentacion' || p.cat === 'escalera')) continue;
    const g = new THREE.Group(); g.userData.p = p; G.add(g); piezas.push(g);
    if (p.cat === 'escalera') { const E = M.escalera; for (let i = 0; i < E.n - 1; i++) { const y = E.y0 + i * E.hu, z = (i + 1) * E.ch; caja(E.x0, y, z - .05, E.x1, y + E.hu + .02, z, 'madera', g); caja(E.x0, y, z - .2, E.x1, y + E.hu, z - .05, 'blanco', g); }
      caja(7.5, 3, 3.0, 7.53, 7.5, 4.1, 'vidrio', g); continue; }
    if (p.cat === 'complemento') { for (const l of M.lamas) { if ((l.tipo === 'lama') !== (p.id === 'LM-01')) continue; const [a, b, c, d, e, f] = l.box; caja(a, b, c, d, e, f, 'lamas', g); } continue; }
    if ((p.cat === 'muro' || p.cat === 'fachada' || p.cat === 'interior') && p.eje) {
      const mk = p.cat === 'interior' ? 'tabique' : p.rol === 'interior' || p.rol === 'sectorizacion' ? 'estucoInt' : 'estuco';
      const m = mesh(muroGeo(p), mk, g);
      for (const h of p.huecos || []) { const [x0, y0, z0, x1, y1, z1] = p.box; const t = p.eje === 'y' ? (x0 + x1) / 2 : (y0 + y1) / 2; const a0 = (p.eje === 'y' ? y0 : x0) + h.u0, a1 = (p.eje === 'y' ? y0 : x0) + h.u1;
        if (p.cat === 'interior') continue;
        if (h.forma === 'circulo') { const c = mesh(new THREE.CircleGeometry((h.u1 - h.u0) / 2, 48), 'vidrio', g, false); c.position.copy(p.eje === 'x' ? W((a0 + a1) / 2, t, z0 + (h.v0 + h.v1) / 2) : W(t, (a0 + a1) / 2, z0 + (h.v0 + h.v1) / 2)); if (p.eje === 'y') c.rotation.y = Math.PI / 2;
          const ring = mesh(new THREE.TorusGeometry((h.u1 - h.u0) / 2, .03, 8, 64), 'carpinteria', g); ring.position.copy(c.position); if (p.eje === 'y') ring.rotation.y = Math.PI / 2; continue; }
        const puerta = h.tipo === 'puerta' && /entrada|garaje/.test(h.nombre);
        const pl = mesh(new THREE.PlaneGeometry(a1 - a0, h.v1 - h.v0), puerta ? 'puerta' : 'vidrio', g, false); pl.material.side = THREE.DoubleSide;
        pl.position.copy(p.eje === 'x' ? W((a0 + a1) / 2, t, z0 + (h.v0 + h.v1) / 2) : W(t, (a0 + a1) / 2, z0 + (h.v0 + h.v1) / 2)); if (p.eje === 'y') pl.rotation.y = Math.PI / 2;
        // marco
        const fr = (ax0, az0, ax1, az1) => { const b = p.eje === 'x' ? [ax0, t - .04, az0, ax1, t + .04, az1] : [t - .04, ax0, az0, t + .04, ax1, az1]; caja(...b, 'carpinteria', g); };
        if (!puerta) { fr(a0, z0 + h.v0, a1, z0 + h.v0 + .05); fr(a0, z0 + h.v1 - .05, a1, z0 + h.v1); fr(a0, z0 + h.v0, a0 + .05, z0 + h.v1); fr(a1 - .05, z0 + h.v0, a1, z0 + h.v1); }
      }
      continue;
    }
    const [x0, y0, z0, x1, y1, z1] = p.box;
    const mk = p.cat === 'forjado' ? 'losa' : p.cat === 'viga' || p.cat === 'pilar' ? 'acero' : p.cat === 'cimentacion' ? 'cim' : 'losa';
    caja(x0, y0, z0, x1, y1, z1, mk, g);
  }
  // Carpinterías grandes, portón, barandillas
  const extra = new THREE.Group(); extra.userData.p = { fase: 10, nivel: 'PB', cat: 'carpinteria' }; G.add(extra); piezas.push(extra);
  for (const c of M.carpinterias) { const z0 = c.nivel === 'PB' ? 0 : 3;
    if (c.tipo === 'porton') { for (let i = 0; i < 25; i++) caja(c.a0, -.12, i * .1, c.a1, -.06, i * .1 + .085, 'lamas', extra); continue; }
    caja(c.a0, c.cara - .015, z0, c.a1, c.cara + .015, z0 + c.v1, 'vidrio', extra, false);
    const n = c.a1 - c.a0 > 5 ? 3 : 2; for (let i = 0; i <= n; i++) { const x = c.a0 + (c.a1 - c.a0) * i / n; caja(x - .03, c.cara - .04, z0, x + .03, c.cara + .04, z0 + c.v1, 'carpinteria', extra); }
    caja(c.a0, c.cara - .04, z0 + c.v1 - .05, c.a1, c.cara + .04, z0 + c.v1, 'carpinteria', extra); }
  caja(0, 14.97, 3.0, 9, 15.0, 4.1, 'vidrio', extra, false); caja(0, 14.95, 4.06, 9, 15.02, 4.1, 'carpinteria', extra);
  for (const b of [[-.2, -.2, 9.2, .02], [-.2, 11.98, 9.2, 12.2], [-.2, -.2, .02, 12.2], [8.98, -.2, 9.2, 12.2]]) caja(b[0], b[1], 5.78, b[2], b[3], 6.12, 'oscuro', extra);   // albardilla perimetral
  plano(.02, .02, 8.98, 11.98, 6.006, 'grava', extra);                                                                    // acabado de cubierta (grava)
  for (let i = 0; i < 6; i++) { const x0 = .8 + (i % 3) * 1.15, y0 = 4.6 + Math.floor(i / 3) * 2.0; const m = caja(x0, y0, 6.12, x0 + 1.0, y0 + 1.7, 6.16, 'fv', extra); m.rotation.x = -.2; }
  // Suelos terminados
  const suelos = new THREE.Group(); suelos.userData.p = { fase: 10, nivel: 'PB', cat: 'acabado' }; G.add(suelos); piezas.push(suelos);
  if (interior) for (const e of M.espacios) { if (e.uso === 'vacio') continue; const [x0, y0, x1, y1] = e.r; const z = e.nivel === 'PB' ? .004 : 3.004; plano(x0 + .04, y0 + .04, x1 - .04, y1 - .04, z, USO_SUELO[e.uso] || 'sueloPiedra', suelos, 1.5); }
  if (interior) {   // trasdosados interiores de medianeras y techos (acabado de yeso)
    const fin = new THREE.Group(); fin.userData.p = { fase: 10, nivel: 'PB', cat: 'acabado' }; G.add(fin); piezas.push(fin);
    for (const p of M.piezas) { if (p.rol !== 'medianera') continue; const z0 = p.nivel === 'PB' ? 0 : 3, h = 2.74, L = p.a1 - p.a0, oeste = p.box[3] <= .001;
      const m = mesh(new THREE.PlaneGeometry(L, h), 'tabique', fin, false); m.rotation.y = oeste ? Math.PI / 2 : -Math.PI / 2; m.position.copy(W(oeste ? .006 : 8.994, (p.a0 + p.a1) / 2, z0 + h / 2)); }
    for (const [x0, y0, x1, y1, z] of [[0, 0, 9, 3, 2.735], [0, 3, 7.5, 7.5, 2.735], [0, 7.5, 9, 15, 2.735], [0, 0, 9, 12, 5.735]]) {
      const m = mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), 'tabique', fin, false); m.rotation.x = Math.PI / 2; m.position.copy(W((x0 + x1) / 2, (y0 + y1) / 2, z)); }
    muebles(G, piezas); }
  G.userData.piezas = piezas;
  if (espejo) { G.scale.x = -1; G.position.x = ox + 9; } else G.position.x = ox;
  S.add(G); return G;
}
// ── Mobiliario (mismas posiciones que los planos) ───────────────────────────────────────
function muebles(G, piezas) {
  const F = new THREE.Group(); F.userData.p = { fase: 11, nivel: 'PB', cat: 'mobiliario' }; G.add(F); piezas.push(F);
  const z1 = 3.0;
  const cama = (x0, y0, x1, y1, z, cab) => { rcaja(x0, y0, z, x1, y1, z + .32, 'madera', F, .02); rcaja(x0 + .03, y0 + .03, z + .32, x1 - .03, y1 - .03, z + .52, 'lino', F, .08);
    if (cab === 'x1') caja(x1 - .06, y0, z, x1, y1, z + 1.05, 'madera', F); else caja(x0, y0, z, x0 + .06, y1, z + 1.05, 'madera', F); };
  const armario = (x0, y0, x1, y1, z) => rcaja(x0, y0, z, x1, y1, z + 2.4, 'madera', F, .01);
  const coche = (x0, y0, mk) => { rcaja(x0, y0, .18, x0 + 1.85, y0 + 4.6, .82, mk, F, .2); rcaja(x0 + .15, y0 + 1.2, .82, x0 + 1.7, y0 + 3.5, 1.42, 'vidrio', F, .18);
    for (const [a, b] of [[.15, .8], [1.7, .8], [.15, 3.8], [1.7, 3.8]]) { const r = mesh(new THREE.CylinderGeometry(.33, .33, .22, 20), 'oscuro', F); r.rotation.z = Math.PI / 2; r.position.copy(W(x0 + a, y0 + b, .33)); } };
  coche(.6, .7, 'coche1'); coche(3.4, .7, 'coche2');
  // cocina con isla
  rcaja(.07, 6.07, 0, 5.2, 6.7, .88, 'madera', F, .01); caja(.07, 6.07, .88, 5.2, 6.72, .92, 'encimera', F); armario(5.2, 6.07, 5.93, 7.3, 0);
  rcaja(1.4, 7.5, 0, 4.4, 8.5, .88, 'madera', F, .01); caja(1.35, 7.45, .88, 4.45, 8.55, .92, 'encimera', F);
  for (let i = 0; i < 4; i++) { const t = mesh(new THREE.CylinderGeometry(.19, .17, .05, 20), 'tela', F); t.position.copy(W(1.8 + i * .75, 8.85, .66)); const pa = mesh(new THREE.CylinderGeometry(.02, .02, .64, 8), 'oscuro', F); pa.position.copy(W(1.8 + i * .75, 8.85, .32)); }
  for (let i = 0; i < 3; i++) { const l = mesh(new THREE.SphereGeometry(.11, 20, 12), 'luz', F); l.position.copy(W(1.9 + i, 8.0, 2.25)); l.userData.lampara = true; caja(1.9 + i - .005, 7.995, 2.36, 1.9 + i + .005, 8.005, 2.74, 'oscuro', F, false); }
  // comedor y salón
  rcaja(1.6, 10.2, .72, 2.55, 12.2, .76, 'madera', F, .01); for (const [a, b] of [[1.62, 10.25], [2.5, 10.25], [1.62, 12.12], [2.5, 12.12]]) caja(a, b, 0, a + .05, b + .05, .72, 'madera', F);
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) { const x = s < 0 ? 1.15 : 2.65, y = 10.45 + i * .65; rcaja(x, y, .42, x + .45, y + .45, .47, 'madera', F, .01); }
  rcaja(.1, 12.6, 0, 1.0, 14.9, .42, 'tela', F, .1); rcaja(1.0, 14.0, 0, 2.6, 14.9, .42, 'tela', F, .1); rcaja(.1, 12.6, .42, .35, 14.9, .8, 'tela', F, .08); rcaja(1.0, 14.65, .42, 2.6, 14.9, .8, 'tela', F, .08);
  rcaja(1.5, 12.9, 0, 2.4, 13.7, .38, 'madera', F, .02); rcaja(3.6, 13.1, 0, 4.4, 13.9, .45, 'lino', F, .12); rcaja(5.5, 12.4, 0, 5.93, 14.6, .5, 'madera', F, .01);
  { const l = mesh(new THREE.CylinderGeometry(.35, .35, .04, 32), 'luz', F); l.position.copy(W(2.1, 11.2, 2.42)); l.userData.lampara = true; }
  // dormitorio 4 y baño PB
  cama(7.0, 12.2, 8.93, 13.7, 0, 'x1'); armario(6.07, 11.4, 6.67, 13.6, 0);
  rcaja(8.5, 7.62, 0, 8.88, 8.25, .42, 'blanco', F, .08); rcaja(8.45, 8.55, .6, 8.93, 9.3, .85, 'blanco', F, .04); caja(7.57, 9.45, 0, 8.93, 10.43, .04, 'blanco', F); caja(7.57, 9.45, .04, 7.6, 10.43, 2.0, 'vidrio', F, false);
  // P1
  cama(.07, .75, 2.07, 2.25, z1, 'x0'); armario(.1, 2.42, 2.6, 2.95, z1); rcaja(3.3, .15, z1 + .72, 4.4, .75, z1 + .76, 'madera', F, .01);
  cama(7.0, .75, 8.93, 2.25, z1, 'x1'); armario(4.57, .1, 5.17, 2.0, z1);
  rcaja(.07, 3.1, z1, .82, 4.85, z1 + .55, 'blanco', F, .1); rcaja(2.3, 4.55, z1, 2.68, 5.2, z1 + .42, 'blanco', F, .08); rcaja(1.1, 4.7, z1 + .6, 1.9, 5.2, z1 + .85, 'blanco', F, .04);
  caja(.07, 5.32, z1, 1.27, 6.52, z1 + .04, 'blanco', F); caja(1.25, 5.32, z1, 1.28, 6.52, z1 + 2.0, 'vidrio', F, false); rcaja(.07, 6.7, z1 + .6, .6, 8.15, z1 + .85, 'blanco', F, .04); rcaja(2.35, 5.32, z1, 2.73, 5.95, z1 + .42, 'blanco', F, .08);
  armario(3.07, 4.57, 3.67, 8.2, z1); armario(5.4, 5.6, 5.93, 8.2, z1); rcaja(4.1, 6.0, z1, 4.9, 7.2, z1 + .9, 'madera', F, .01);
  cama(.07, 9.2, 2.07, 11.0, z1, 'x0'); rcaja(3.6, 10.0, z1, 4.4, 10.8, z1 + .45, 'tela', F, .12);
  rcaja(8.25, 9.4, z1 + .72, 8.93, 11.2, z1 + .76, 'madera', F, .01); rcaja(7.6, 10.05, z1, 8.1, 10.55, z1 + .5, 'oscuro', F, .06); rcaja(6.07, 9.15, z1, 6.5, 11.85, z1 + 2.2, 'madera', F, .01);
  // terraza
  for (const x of [1.0, 2.3]) rcaja(x, 13.1, z1, x + .7, 14.9, z1 + .32, 'tela', F, .06);
  { const t = mesh(new THREE.CylinderGeometry(.45, .45, .04, 32), 'madera', F); t.position.copy(W(5.0, 13.8, z1 + .72)); }
  for (const y of [12.3, 14.4]) rcaja(7.4, y, z1, 8.9, y + .45, z1 + .55, 'madera', F, .02);
  for (const y of [12.52, 14.62]) { const s = mesh(new THREE.SphereGeometry(.35, 16, 12), 'hoja', F); s.position.copy(W(8.15, y, z1 + .85)); s.scale.set(2, 1, .6); }
}
// ── Mejoras de materia: relieve (normal maps) generado a partir de las mismas texturas ─────────────
function normalDe(tex, fuerza = 2) {
  const src = tex.image, n = src.width, x = src.getContext('2d').getImageData(0, 0, n, n).data, cv = document.createElement('canvas'); cv.width = cv.height = n;
  const o = cv.getContext('2d'), out = o.createImageData(n, n), L = (i, j) => { i = (i + n) % n; j = (j + n) % n; const k = (j * n + i) * 4; return (x[k] + x[k + 1] + x[k + 2]) / 765; };
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const dx = (L(i + 1, j) - L(i - 1, j)) * fuerza, dy = (L(i, j + 1) - L(i, j - 1)) * fuerza; const l = Math.hypot(dx, dy, 1), k = (j * n + i) * 4;
    out.data[k] = (-dx / l * .5 + .5) * 255; out.data[k + 1] = (-dy / l * .5 + .5) * 255; out.data[k + 2] = (1 / l * .5 + .5) * 255; out.data[k + 3] = 255; }
  o.putImageData(out, 0, 0); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.copy(tex.repeat); return t;
}
for (const [mk, tk, f] of [['estuco', 'estuco', 5], ['madera', 'madera', 3], ['lamas', 'lamas', 3], ['sueloMadera', 'madera', 2], ['sueloPiedra', 'piedra', 2.5], ['acera', 'piedra', 2.5], ['cesped', 'cesped', 2]]) { MUNDO[mk].normalMap = normalDe(T[tk], f); MUNDO[mk].normalScale = new THREE.Vector2(.6, .6); }
MUNDO.vidrio.envMapIntensity = 1.6; MUNDO.vidrio.roughness = .02; MUNDO.vidrio.metalness = .25; MUNDO.carpinteria.envMapIntensity = 1.2; MUNDO.agua.envMapIntensity = 1.5;
const GHOST = new THREE.MeshStandardMaterial({ color: '#e9eef0', transparent: true, opacity: .14, roughness: 1, depthWrite: false, side: THREE.DoubleSide });
const GHOSTL = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: .7 });
const JARDV = new THREE.MeshStandardMaterial({ color: '#8d9a72', roughness: 1 });   // jardines vecinos (solo en la parcela de ejemplo)
const MPAR = new THREE.MeshBasicMaterial({ color: '#dfff57', transparent: true, opacity: .1, depthWrite: false }), LPAR = new THREE.LineBasicMaterial({ color: '#dfff57' }), LVEC = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: .32 });
const LEX = new THREE.LineDashedMaterial({ color: '#ff7a59', dashSize: .6, gapSize: .4 });
// ── La unidad: una sola Natura adosada, colocable ─────────────────────────────────────
const casaRaiz = new THREE.Group(); const casaDentro = new THREE.Group(); casaRaiz.add(casaDentro); S.add(casaRaiz);
const CASA = casa({ interior: true }); S.remove(CASA); casaDentro.add(CASA);
// Entrada, terraza de piedra y jardín (dentro de la parcela, se mueven con la casa)
const EXT = new THREE.Group(); CASA.add(EXT);
plano(1.5,-4.8,6,0,.045,'piedra',EXT,1.5); plano(6.6,-4.8,8.3,0,.045,'piedra',EXT,1);
plano(0,15,9,16.4,.045,'piedra',EXT,1.2); plano(9.3,4.8,12.1,7.5,.045,'piedra',EXT,1.2);
for(const x of [9.7,11.0])rcaja(x,5.2,.05,x+.75,7.1,.37,'tela',EXT,.05);
for(const [x0,x1] of [[0,1.5],[8.3,9]])plano(x0,-4.8,x1,0,.045,'grava',EXT);
// Huellas (coordenadas de modelo) para comprobaciones
const HUELLA_PB = [[0, 0], [9, 0], [9, 15], [0, 15]], HUELLA_P1 = [[0, 0], [9, 0], [9, 12], [0, 12]];
const COLOC = { x: 0, z: 0, rot: 0, espejo: false, retranqueo: 5, lateral: 0, mover: false };
function aplicarColocacion() {
  casaRaiz.position.set(COLOC.x, 0, COLOC.z); casaRaiz.rotation.y = COLOC.rot;
  casaDentro.scale.x = COLOC.espejo ? -1 : 1; casaDentro.position.set(COLOC.espejo ? 4.5 : -4.5, 0, -7.5);
  casaRaiz.updateMatrixWorld(true); sombraEncuadre(); comprobar(); clearTimeout(aplicarColocacion.t); aplicarColocacion.t = setTimeout(cesped, 260);
}
const aMundo = (x, y) => { const v = W(x, y, 0); CASA.localToWorld(v); return [v.x, v.z]; };   // modelo → plano del mundo (x, z)
// ── Geometría 2D (plano x,z del mundo; norte = −z) ───────────────────────────────────
const dentro = (p, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > p[1]) !== (zj > p[1]) && p[0] < (xj - xi) * (p[1] - zi) / (zj - zi) + xi) c = !c; } return c; };
const distSeg = (p, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L = dx * dx + dz * dz || 1; const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L)); return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dz); };
const enBorde = (p, poly) => poly.some((a, i) => distSeg(p, a, poly[(i + 1) % poly.length]) < 1e-5);
const incluido = (p, poly) => enBorde(p, poly) || dentro(p, poly);
const interiorEstricto = (p, poly) => !enBorde(p, poly) && dentro(p, poly);
function solapan(A, B) {
  const cross = (a,b,c) => (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  if (A.some(p => interiorEstricto(p,B)) || B.some(p => interiorEstricto(p,A))) return true;
  for (let i=0;i<A.length;i++) for (let j=0;j<B.length;j++) {
    const a=A[i], b=A[(i+1)%A.length], c=B[j], d=B[(j+1)%B.length];
    if (cross(a,b,c)*cross(a,b,d)<-1e-10 && cross(c,d,a)*cross(c,d,b)<-1e-10) return true;
    const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];
    if (interiorEstricto(mid,B)) return true;
  }
  return A.every(p => enBorde(p,B)) && B.every(p => enBorde(p,A));
}
const areaPoly = (poly) => Math.abs(poly.reduce((s, p, i) => { const q = poly[(i + 1) % poly.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2);
const centroide = (poly) => [poly.reduce((s, p) => s + p[0], 0) / poly.length, poly.reduce((s, p) => s + p[1], 0) / poly.length];
// ── Sitio: parcela (demo o Catastro), entorno, ortofoto ───────────────────────────────
const SITIO = { tipo: 'demo', rc: null, ldt: 'Parcela de ejemplo · 9,00 × 25,00 m entre medianeras', E0: 440000, N0: 4474000, lat: 40.42, lon: -3.70, parcela: [], vecinas: [], edificios: [], area: 225, frente: null };
const ENT = new THREE.Group(); S.add(ENT);
const SUELO = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), MUNDO.tierra); SUELO.rotation.x = -Math.PI / 2; SUELO.position.y = -.03; SUELO.receiveShadow = true; S.add(SUELO); SUELO.userData.mk = 'tierra'; todos.push(SUELO);
T.tierra = (() => { const t = texRuido('#b9ad93', '#a89c82', 256); t.repeat.set(400, 400); return t; })(); MUNDO.tierra.map = T.tierra; MUNDO.tierra.color.set('#ffffff'); MUNDO.tierra.needsUpdate = true;
let ORTO = null;
function limpiarEntorno() { for (const o of [...ENT.children]) { ENT.remove(o); o.traverse((m) => { m.geometry?.dispose?.(); }); } if (ORTO) { ORTO.material.map?.dispose(); S.remove(ORTO); ORTO = null; } }
function lineaPoly(poly, mat, y = .05, cerrar = true, rayada = false) { const pts = poly.map(([x, z]) => new THREE.Vector3(x, y, z)); if (cerrar) pts.push(pts[0].clone()); const g = new THREE.BufferGeometry().setFromPoints(pts); const l = new THREE.Line(g, mat); if (rayada) l.computeLineDistances(); ENT.add(l); return l; }
function volumen(poly, h, mat = GHOST) {
  const sh = new THREE.Shape(poly.map(([x, z]) => new THREE.Vector2(x, -z))); const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false }); g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, mat); m.renderOrder = 2; ENT.add(m); const e = new THREE.LineSegments(new THREE.EdgesGeometry(g, 25), GHOSTL); e.renderOrder = 3; ENT.add(e); m.userData.ghost = e; return m;
}
const LPAR_M = new THREE.MeshBasicMaterial({ color: '#dfff57', transparent: true, opacity: .9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
function cinta(poly, w, mat, y = .05) { const pos = [], n = poly.length;
  for (let i = 0; i < n; i++) { const a = poly[i], b = poly[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / L * w / 2, nz = (b[0] - a[0]) / L * w / 2;
    const q = [[a[0] - nx, a[1] - nz], [a[0] + nx, a[1] + nz], [b[0] + nx, b[1] + nz], [b[0] - nx, b[1] - nz]]; for (const k of [0, 1, 2, 0, 2, 3]) pos.push(q[k][0], y, q[k][1]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); const m = new THREE.Mesh(g, mat); m.material.side = THREE.DoubleSide; m.renderOrder = 4; ENT.add(m); return m; }
function rellenoParcela(poly) { const sh = new THREE.Shape(poly.map(([x, z]) => new THREE.Vector2(x, -z))); const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, MUNDO.cesped); m.position.y = -.025; m.receiveShadow = true; m.userData.mk = 'cesped'; todos.push(m);
  // UV en metros para la textura de césped
  const uv = g.attributes.uv, pos = g.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / 4, pos.getZ(i) / 4); ENT.add(m);
  const v = new THREE.Mesh(g.clone(), MPAR); v.position.y = -.02; ENT.add(v); return m; }
function sitioDemo() {
  limpiarEntorno(); SITIO.tipo = 'demo'; SITIO.rc = null; SITIO.ldt = 'Parcela de ejemplo · 9,00 × 25,00 m entre medianeras'; SITIO.lat = 40.42; SITIO.lon = -3.70;
  SITIO.parcela = [[-4.5, -12.5], [4.5, -12.5], [4.5, 12.5], [-4.5, 12.5]]; SITIO.area = 225; SITIO.vecinas = []; SITIO.edificios = [];
  for (const k of [-3, -2, -1, 1, 2, 3]) { const x0 = -4.5 + 9 * k; const p = [[x0, -12.5], [x0 + 9, -12.5], [x0 + 9, 12.5], [x0, 12.5]]; SITIO.vecinas.push(p);
    SITIO.edificios.push({ poly: [[x0, -7.5], [x0 + 9, -7.5], [x0 + 9, 7.5], [x0, 7.5]], h: 3 }, { poly: [[x0, -7.5], [x0 + 9, -7.5], [x0 + 9, 4.5], [x0, 4.5]], h: 6.1 }); }
  const suelo = (w, h, mk, z, y, rep) => { const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / rep, uv.getY(i) * h / rep);
    const a = new THREE.Mesh(g, MUNDO[mk]); a.rotation.x = -Math.PI / 2; a.position.set(0, y, z); a.receiveShadow = true; a.userData.mk = mk; todos.push(a); ENT.add(a); };
  suelo(90, 9, 'asfalto', -18.5, .002, 6); suelo(90, 3, 'acera', -14, .01, 1.5); suelo(90, 3, 'acera', -23, .01, 1.5);
  T.asfalto.repeat.set(1, 1); construirEntorno(); ajustarACalle(); }
function construirEntorno() {
  rellenoParcela(SITIO.parcela); lineaPoly(SITIO.parcela, LPAR, .06); cinta(SITIO.parcela, .16, LPAR_M);
  for (const p of SITIO.vecinas) { lineaPoly(p, LVEC, .04); if (SITIO.tipo === 'demo') { const sh = new THREE.Shape(p.map(([x, z]) => new THREE.Vector2(x, -z))); const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, JARDV); m.position.y = .003; m.receiveShadow = true; m.userData.vecina = true; ENT.add(m); } }
  vistaCapas();
}
// ── Catastro (servicios INSPIRE, CORS abierto) y PNOA ─────────────────────────────────
const CAT = 'https://ovc.catastro.meh.es';
const posList = (s) => { const m = s.match(/<gml:posList[^>]*>([^<]+)</); if (!m) return null; const v = m[1].trim().split(/\s+/).map(Number); const out = []; for (let i = 0; i + 1 < v.length; i += 2) out.push([v[i], v[i + 1]]); return out; };
function utm2ll(E, N, zona = 30) { const a = 6378137, f = 1 / 298.257222101, k0 = .9996, e2 = f * (2 - f), ep2 = e2 / (1 - e2), x = E - 500000, Mm = N / k0;
  const mu = Mm / (a * (1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 ** 3 / 256)), e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const p1 = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu) + (21 * e1 * e1 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu) + (151 * e1 ** 3 / 96) * Math.sin(6 * mu);
  const C1 = ep2 * Math.cos(p1) ** 2, T1 = Math.tan(p1) ** 2, N1 = a / Math.sqrt(1 - e2 * Math.sin(p1) ** 2), R1 = a * (1 - e2) / Math.pow(1 - e2 * Math.sin(p1) ** 2, 1.5), D = x / (N1 * k0);
  const lat = p1 - (N1 * Math.tan(p1) / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ep2) * D ** 4 / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ep2 - 3 * C1 * C1) * D ** 6 / 720);
  const lon = ((zona - 1) * 6 - 180 + 3) * Math.PI / 180 + (D - (1 + 2 * T1 + C1) * D ** 3 / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ep2 + 24 * T1 * T1) * D ** 5 / 120) / Math.cos(p1);
  return [lat * 180 / Math.PI, lon * 180 / Math.PI]; }
async function texto(url) { const r = await fetch(url); if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); }
async function rcPorCoordenadas(lat, lon) {
  const t = await texto(`${CAT}/ovcservweb/OVCSWLocalizacionRC/OVCCoordenadas.asmx/Consulta_RCCOOR?SRS=EPSG:4326&Coordenada_X=${lon}&Coordenada_Y=${lat}`);
  const a = t.match(/<pc1>([^<]+)<\/pc1>/), b = t.match(/<pc2>([^<]+)<\/pc2>/), d = t.match(/<ldt>([^<]+)<\/ldt>/); if (!a || !b) throw new Error('No hay parcela catastral en ese punto (puede ser vía pública).'); return { rc: a[1] + b[1], ldt: d ? d[1] : '' };
}
async function cargarCatastro(entrada) {
  estado('Consultando el Catastro…'); let rc = null, ldt = '';
  const s = entrada.trim(); const g = s.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || s.match(/[?&](?:q|ll|query)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/) || s.match(/^\s*(-?\d{1,2}\.\d+)\s*[,; ]\s*(-?\d{1,3}\.\d+)\s*$/);
  if (g) { const r = await rcPorCoordenadas(+g[1], +g[2]); rc = r.rc; ldt = r.ldt; } else { rc = s.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 14); if (rc.length !== 14) throw new Error('Escribe una referencia catastral (14 o 20 caracteres) o unas coordenadas «lat, lon».'); }
  const t = await texto(`${CAT}/INSPIRE/wfsCP.aspx?service=wfs&version=2&request=getfeature&STOREDQUERIE_ID=GetParcel&refcat=${rc}&srsname=EPSG::25830`);
  const pts = posList(t); if (!pts) throw new Error('El Catastro no devuelve geometría para ' + rc + '.');
  const area = +(t.match(/areaValue[^>]*>([\d.]+)</) || [0, 0])[1];
  const E0 = pts.reduce((s, p) => s + p[0], 0) / pts.length, N0 = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  const [lat, lon] = utm2ll(E0, N0);
  if (!ldt) { try { const r = await rcPorCoordenadas(lat, lon); ldt = r.ldt; } catch (e) {} }
  Object.assign(SITIO, { tipo: 'catastro', rc, ldt: ldt || 'Parcela ' + rc, E0, N0, lat, lon, area: area || 0 });
  const loc = ([E, N]) => [E - E0, -(N - N0)];
  SITIO.parcela = pts.slice(0, -1).map(loc); SITIO.area = SITIO.area || areaPoly(SITIO.parcela);
  estado('Parcela encontrada. Cargando el entorno (parcelas y edificios)…');
  const L = 150, bb = `${(E0 - L).toFixed(1)},${(N0 - L).toFixed(1)},${(E0 + L).toFixed(1)},${(N0 + L).toFixed(1)}`;
  const [tcp, tbu] = await Promise.all([texto(`${CAT}/INSPIRE/wfsCP.aspx?service=wfs&version=2&request=getfeature&typenames=CP:CadastralParcel&bbox=${bb}&srsname=EPSG::25830`).catch(() => ''),
    texto(`${CAT}/INSPIRE/wfsBU.aspx?service=wfs&version=2&request=getfeature&typenames=BU:BuildingPart&bbox=${bb}&srsname=EPSG::25830`).catch(() => '')]);
  SITIO.vecinas = tcp.split('<cp:CadastralParcel ').slice(1).filter((b) => !b.includes('CP.' + rc)).map((b) => posList(b)).filter(Boolean).map((p) => p.slice(0, -1).map(loc));
  SITIO.edificios = tbu.split('<bu-ext2d:BuildingPart ').slice(1).map((b) => { const p = posList(b); const fl = +(b.match(/numberOfFloorsAboveGround>(\d+)</) || [0, 0])[1]; return p ? { poly: p.slice(0, -1).map(loc), h: Math.max(fl, 0) * 3.0, rcp: (b.match(/BU\.(\w{14})/) || [])[1] } : null; })
    .filter((b) => b && b.h > 0).map((b) => ({ ...b, existente: dentro(centroide(b.poly), SITIO.parcela) }));
  limpiarEntorno(); construirEntorno(); cargarOrto(E0, N0, 160); ajustarACalle(); sol(); actualizarEntorno();
  estado(`${SITIO.ldt} · ${SITIO.vecinas.length} parcelas y ${SITIO.edificios.length} volúmenes en el entorno`);
  try { history.replaceState(null, '', '?rc=' + rc); } catch (e) {}
  panel();
}
function cargarOrto(E0, N0, L) {
  const url = `https://www.ign.es/wms-inspire/pnoa-ma?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=OI.OrthoimageCoverage&STYLES=&CRS=EPSG:25830&BBOX=${E0 - L},${N0 - L},${E0 + L},${N0 + L}&WIDTH=2048&HEIGHT=2048&FORMAT=image/jpeg`;
  new THREE.TextureLoader().setCrossOrigin('anonymous').load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2 * L, 2 * L), new THREE.MeshStandardMaterial({ map: t, roughness: 1 })); m.rotation.x = -Math.PI / 2; m.position.y = -.01; m.receiveShadow = true; ORTO = m; S.add(m); vistaCapas(); });
}
// Frente a calle: el lado de la parcela cuyo exterior no pertenece a ninguna otra parcela
function ajustarACalle() {
  const P = SITIO.parcela, n = P.length; let mejor = null;
  for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 2) continue;
    const t = [(b[0] - a[0]) / L, (b[1] - a[1]) / L]; let nrm = [t[1], -t[0]]; const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (dentro([mid[0] + nrm[0] * .3, mid[1] + nrm[1] * .3], P)) nrm = [-nrm[0], -nrm[1]];
    let libre = 0; for (const d of [2, 5, 9]) { const q = [mid[0] + nrm[0] * d, mid[1] + nrm[1] * d]; if (!SITIO.vecinas.some((v) => dentro(q, v)) && !SITIO.edificios.some((e) => dentro(q, e.poly))) libre++; }
    const s = libre * 100 + L * (SITIO.tipo === 'demo' ? -1 : .1); if (!mejor || s > mejor.s) mejor = { s, a, b, nrm, mid, t, L }; }
  if (!mejor) return; SITIO.frente = mejor;
  COLOC.rot = Math.atan2(-mejor.nrm[0], -mejor.nrm[1]); colocarDesdeFrente();
}
function colocarDesdeFrente() { const f = SITIO.frente; if (!f) { aplicarColocacion(); return; }
  const c = [f.mid[0] - f.nrm[0] * (COLOC.retranqueo + 7.5) + f.t[0] * COLOC.lateral, f.mid[1] - f.nrm[1] * (COLOC.retranqueo + 7.5) + f.t[1] * COLOC.lateral];
  COLOC.x = c[0]; COLOC.z = c[1]; aplicarColocacion(); }
// ── Comprobaciones de encaje ──────────────────────────────────────────────────────────
const RUMBO = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
let CHECK = {};
function comprobar() {
  const P = SITIO.parcela; if (!P.length) return;
  const pb = HUELLA_PB.map(([x, y]) => aMundo(x, y)), muestras = [];
  for (let i = 0; i < 4; i++) { const a = pb[i], b = pb[(i + 1) % 4]; for (let k = 0; k <= 6; k++) muestras.push([a[0] + (b[0] - a[0]) * k / 6, a[1] + (b[1] - a[1]) * k / 6]); }
  const fuera = muestras.filter((p) => !incluido(p, P)).length;
  let dmin = 1e9; for (const p of muestras) for (let i = 0; i < P.length; i++) dmin = Math.min(dmin, distSeg(p, P[i], P[(i + 1) % P.length]));
  const f = SITIO.frente; let dFrente = null; if (f) dFrente = Math.min(distSeg(pb[0], f.a, f.b), distSeg(pb[1], f.a, f.b));
  const jard = new THREE.Vector3(0, 0, 1).applyQuaternion(casaRaiz.quaternion); const az = (Math.atan2(jard.x, -jard.z) * 180 / Math.PI + 360) % 360;
  const solapes = SITIO.edificios.filter((e) => !e.existente && solapan(pb, e.poly)).length;
  CHECK = { dentro: fuera === 0, fuera, dmin: fuera ? 0 : dmin, dFrente, ocup: 135 / SITIO.area, az, rumbo: RUMBO[Math.round(az / 45) % 8], solapes,
    existentes: SITIO.edificios.filter((e) => e.existente).length, frente: f ? f.L : null };
  pintarChecks(); const ag = $('#aguja'); if (ag) ag.setAttribute('transform', `rotate(${-(camAzimut() * 180 / Math.PI)})`);
}
function pintarChecks() { const el = $('#checks'); if (!el) return; const C = CHECK, li = (ok, t) => `<li class="${ok === true ? 'ok' : ok === false ? 'ko' : 'av'}"><i>${ok === true ? '✓' : ok === false ? '✗' : '!'}</i><span>${t}</span></li>`;
  el.innerHTML = [li(C.dentro, C.dentro ? 'La casa cabe dentro de la parcela' : `La huella sale de la parcela (${C.fuera} puntos fuera)`),
    C.frente != null ? li(C.frente >= 9 ? true : false, `Frente de parcela ${es(C.frente)} m · la casa necesita 9,00 m`) : '',
    C.dFrente != null ? li(C.dFrente >= 3 ? true : null, `Retranqueo a calle ${es(C.dFrente)} m`) : '',
    li(C.dmin >= .0 && C.dentro ? (C.dmin < .2 ? null : true) : false, `Distancia mínima a linderos ${es(C.dmin)} m${C.dmin < .2 && C.dentro ? ' (adosada a medianera)' : ''}`),
    li(C.ocup <= .7 ? true : null, `Ocupación ${es(C.ocup * 100, 0)} % de ${es(SITIO.area, 0)} m²`),
    li(['S', 'SE', 'SO'].includes(C.rumbo) ? true : null, `Jardín y salón orientados al ${C.rumbo} (${es(C.az, 0)}°)`),
    C.solapes ? li(false, `Choca con ${C.solapes} edificio(s) vecino(s)`) : '', C.existentes ? li(null, `${C.existentes} volumen(es) existente(s) en la parcela, a sustituir`) : ''].join(''); }
// ── Césped instanciado (solo en la parte libre de la parcela) ─────────────────────────
let PASTO = null; const tViento = { value: 0 };
function cesped() {
  if (PASTO) { S.remove(PASTO); PASTO.geometry.dispose(); PASTO = null; }
  const P = SITIO.parcela; if (!P.length) return; const xs = P.map((p) => p[0]), zs = P.map((p) => p[1]); const x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs);
  const inv = new THREE.Matrix4().copy(CASA.matrixWorld).invert(), v = new THREE.Vector3(), n = Math.min(60000, Math.round(areaPoly(P) * 260)), pts = [];
  for (let i = 0; i < n * 3 && pts.length < n; i++) { const x = x0 + Math.random() * (x1 - x0), z = z0 + Math.random() * (z1 - z0); if (!dentro([x, z], P)) continue;
    v.set(x, 0, z).applyMatrix4(inv); const lx = v.x, ly = v.z;            // en coordenadas de modelo (x, y)
    if (lx > -.3 && lx < 9.3 && ly > -.3 && ly < 15.3) continue; if (ly < 0 && ly > -5.2 && ((lx > 1.3 && lx < 6.2) || (lx > 6.4 && lx < 8.5) || lx < 1.6 || lx > 8.1)) continue;
    if(ly>14.8 && ly<16.6 && lx>-.1 && lx<9.1)continue; if(lx>9.2 && lx<12.2 && ly>4.7 && ly<7.6)continue; pts.push([x, z]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-.012, 0, 0, .012, 0, 0, 0, 1, 0], 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
  const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .9, side: THREE.DoubleSide });
  mat.onBeforeCompile = (sh) => { sh.uniforms.uT = tViento; sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec4 wp = instanceMatrix * vec4(0.,0.,0.,1.); float w = sin(uT*1.6 + wp.x*.7 + wp.z*.5)*.06 + sin(uT*3.1 + wp.x*2.3)*.02; transformed.x += w * position.y * position.y; transformed.z += w*.6 * position.y * position.y;`); };
  const im = new THREE.InstancedMesh(g, mat, pts.length); const o = new THREE.Object3D(), col = new THREE.Color();
  pts.forEach(([x, z], i) => { o.position.set(x, 0, z); o.rotation.set((Math.random() - .5) * .3, Math.random() * 6.28, (Math.random() - .5) * .3); o.scale.set(1 + Math.random(), .12 + Math.random() * .16, 1); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
    im.setColorAt(i, col.setHSL(.24 + Math.random() * .05, .38 + Math.random() * .15, .3 + Math.random() * .14)); });
  im.receiveShadow = true; im.userData.pasto = true; PASTO = im; S.add(im); PASTO.visible = ESTADO.modo !== 'maqueta';
}
// ── Árboles de mejor calidad: copas de racimos con variación, instanciadas ─────────────
function copa(semilla, tipo) { const R2 = (() => { let s = semilla; return () => (s = (s * 16807) % 2147483647) / 2147483647; })(); const gs = [];
  const n = tipo === 'olivo' ? 9 : 12; for (let i = 0; i < n; i++) { const g = new THREE.IcosahedronGeometry(tipo === 'olivo' ? .55 + R2() * .35 : .7 + R2() * .4, 1); const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) p.setXYZ(k, p.getX(k) * (1 + (R2() - .5) * .25), p.getY(k) * (tipo === 'pino' ? .5 : .85) * (1 + (R2() - .5) * .25), p.getZ(k) * (1 + (R2() - .5) * .25));
    const a = R2() * 6.28, r = tipo === 'olivo' ? R2() * 1.0 : R2() * 1.9; g.translate(Math.cos(a) * r, (R2() - .3) * (tipo === 'pino' ? .5 : .8), Math.sin(a) * r); gs.push(g); }
  const m = mergeGeometries(gs); m.computeVertexNormals(); return m; }
function arbol(x, z, tipo, esc = 1, s = 7) { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(esc);
  const h = tipo === 'pino' ? 7.5 : 2.2; const tr = new THREE.Mesh(new THREE.CylinderGeometry(.12, .2, h, 7), MUNDO.tronco); tr.position.y = h / 2; tr.rotation.z = tipo === 'olivo' ? .12 : .04; tr.castShadow = true; tr.userData.mk = 'tronco'; todos.push(tr); g.add(tr);
  const c = new THREE.Mesh(copa(s, tipo), MUNDO[tipo === 'olivo' ? 'hojaOlivo' : 'pino']); c.position.y = h + (tipo === 'pino' ? .2 : .5); c.castShadow = true; c.receiveShadow = true; c.userData.mk = tipo === 'olivo' ? 'hojaOlivo' : 'pino'; todos.push(c); g.add(c); return g; }
const ARB = new THREE.Group(); CASA.add(ARB);
ARB.add(Object.assign(arbol(0, 0, 'olivo', 1.15, 11), {})); ARB.children[0].position.copy(W(-2.2, 14.3, 0));
const olivo2 = arbol(0, 0, 'olivo', .8, 23); olivo2.position.copy(W(.75, -3.6, 0)); ARB.add(olivo2);
for (const [x, y] of [[8.6, -.6], [.4, -.6]]) { const m = mesh(new THREE.BoxGeometry(.5, .5, 3.6), 'piedra', ARB); m.position.copy(W(x, -2.6, .25)); const s = mesh(new THREE.SphereGeometry(.3, 12, 8), 'hoja', ARB); s.scale.set(1, .7, 6); s.position.copy(W(x, -2.6, .62)); }
// ── Luz: sol real en la latitud de la parcela + entorno PMREM ─────────────────────────
const sky = new Sky(); sky.scale.setScalar(2500); S.add(sky); const SU = sky.material.uniforms; SU.turbidity.value = 3.2; SU.rayleigh.value = 1.2; SU.mieCoefficient.value = .003; SU.mieDirectionalG.value = .82;
const skyEnv = new Sky(); skyEnv.scale.setScalar(1000); const envScene = new THREE.Scene(); envScene.add(skyEnv); const pmrem = new THREE.PMREMGenerator(R); let envRT = null;
function actualizarEntorno() { for (const k of ['turbidity', 'rayleigh', 'mieCoefficient', 'mieDirectionalG']) skyEnv.material.uniforms[k].value = SU[k].value; skyEnv.material.uniforms.sunPosition.value.copy(SU.sunPosition.value);
  envRT?.dispose(); envRT = pmrem.fromScene(envScene, 0, .1, 2000); S.environment = envRT.texture; }
const hemi = new THREE.HemisphereLight('#f7f1e6', '#a39784', .35); S.add(hemi);
const sun = new THREE.DirectionalLight('#fff1dc', 3); sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -.0003; sun.shadow.normalBias = .025; sun.shadow.radius = 3; S.add(sun, sun.target);
function sombraEncuadre() { const c = new THREE.Vector3(); CASA.localToWorld(c.copy(W(4.5, 7.5, 0))); sun.target.position.copy(c); Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 220 }); sun.shadow.camera.updateProjectionMatrix(); }
const luces = []; for (const [x, y, z] of [[2.5, 8, 2.4], [2.5, 12.5, 2.4], [7.5, 12.5, 2.4], [1.5, 1.5, 5.4], [6.5, 1.5, 5.4], [3, 10, 5.4], [7.5, 10.5, 5.4], [4.5, 3, 2.4]]) { const l = new THREE.PointLight('#ffcf8a', 0, 9, 1.6); l.position.copy(W(x, y, z)); CASA.add(l); luces.push(l); }
const ESTADO = { modo: 'mundo', hora: +(Q.get('hora') || 17.5), estacion: Q.get('estacion') || 'verano', nivel: 'PB', alzado:'frente', maquetaPlanta: true, etiquetasPlanta: false, corte: 10.75 };
let interior = false, envT = 0;
function sol(env = false) {
  if(esDibujo()){luzPlanta();return;}
  const lat = SITIO.lat * Math.PI / 180, dec = { verano: 23.4, equinoccio: 0, invierno: -23.4 }[ESTADO.estacion] * Math.PI / 180;
  const Hh = (ESTADO.hora - (ESTADO.estacion === 'invierno' ? 1 : 2) + SITIO.lon / 15 - 12) * 15 * Math.PI / 180;   // hora oficial → solar (huso CET/CEST + longitud real)
  const sinE = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(Hh); const E = Math.asin(sinE);
  let A = Math.acos(Math.min(1, Math.max(-1, (Math.sin(dec) - Math.sin(E) * Math.sin(lat)) / (Math.cos(E) * Math.cos(lat))))); if (Hh > 0) A = 2 * Math.PI - A;
  const dir = new THREE.Vector3(Math.sin(A) * Math.cos(E), Math.sin(E), -Math.cos(A) * Math.cos(E));   // norte = −z (real, del Catastro)
  SU.sunPosition.value.copy(dir); sun.position.copy(sun.target.position).addScaledVector(dir, 120);
  const dia = Math.max(0, Math.min(1, (E * 180 / Math.PI + 2) / 14)), maq = ESTADO.modo === 'maqueta';
  sun.intensity = maq ? 2.6 : 3.4 * dia; hemi.intensity = maq ? 1.1 : (.06 + .3 * dia) * (interior ? 2.2 : 1); hemi.color.set(dia < .3 && !maq ? '#9fb2d6' : '#f7f1e6');
  S.environmentIntensity = maq ? .9 : (.12 + .88 * dia) * (interior ? 1.6 : 1);
  sun.color.set(E < .25 ? '#ffb27a' : '#fff1dc'); R.toneMappingExposure = maq ? 1.05 : (.92 + .25 * (1 - dia)) * (interior ? 1.25 : 1);
  const noche = !maq && dia < .35;
  for (const l of luces) l.intensity = noche ? 9 * (1 - dia) : (interior ? 1.4 : 0);
  MUNDO.luz.emissiveIntensity = noche ? 3 : 0;
  sky.visible = !maq && ESTADO.modo !== 'plano';
  S.background = maq ? new THREE.Color('#ecebe4') : ESTADO.modo === 'plano' ? new THREE.Color('#191a14') : null;
  S.fog = maq ? new THREE.Fog('#ecebe4', 120, 420) : new THREE.FogExp2(dia > .2 ? '#cdd7dc' : '#0d1018', .0022);
  if (env || performance.now() - envT > 400) { envT = performance.now(); if (!maq) actualizarEntorno(); else S.environment = null; }
  const hv = $('#hora-v'); if (hv) hv.textContent = `${String(Math.floor(ESTADO.hora)).padStart(2, '0')}:${String(Math.round((ESTADO.hora % 1) * 60)).padStart(2, '0')} · sol a ${es(E * 180 / Math.PI, 0)}° · ${RUMBO[Math.round(((A * 180 / Math.PI) + 360) % 360 / 45) % 8]}`;
}
// ── Modos ─────────────────────────────────────────────────────────────────────────────
const corteH = new THREE.Plane(new THREE.Vector3(0, -1, 0), 999), corteV = new THREE.Plane(new THREE.Vector3(0, 0, -1), 999);
for (const m of [...Object.values(MUNDO), CLAY, CLAY2, CLAYW, ...Object.values(MAQV)]) { m.clippingPlanes = [corteH, corteV]; m.clipShadows = true; }
function materiales(maq) { for (const m of todos) { const k = m.userData.mk; if (k) m.material = maq ? MAQV[k] : MUNDO[k]; } document.body.classList.toggle('clara', maq);
  GHOST.color.set(maq ? '#ffffff' : '#e9eef0'); GHOST.opacity = maq ? .5 : .14; JARDV.color.set(maq ? '#e6e2da' : '#8d9a72'); GHOSTL.color.set(maq ? '#9a958c' : '#ffffff'); if (PASTO) PASTO.visible = !maq; }
const PLAN_CAPS = new THREE.Group(); CASA.add(PLAN_CAPS);
for(const p of M.piezas){if(!['muro','fachada','interior'].includes(p.cat)||!['PB','P1'].includes(p.nivel))continue;
const [x0,y0,z0,x1,y1,z1]=p.box, along=p.eje==='y', start=along?y0:x0,end=along?y1:x1,cut=(p.nivel==='PB'?1.3:4.3),rel=cut-z0;
let cursor=start;const openings=(p.huecos||[]).filter(h=>h.v0<rel&&h.v1>rel).sort((a,b)=>a.u0-b.u0);
const segments=[];for(const h of openings){segments.push([cursor,start+h.u0]);cursor=start+h.u1;}segments.push([cursor,end]);
for(const [a,b] of segments){if(b-a<.001)continue;const g=new THREE.PlaneGeometry(along?x1-x0:b-a,along?b-a:y1-y0);g.rotateX(-Math.PI/2);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:'#465046',side:THREE.DoubleSide}));m.position.copy(W(along?(x0+x1)/2:(a+b)/2,along?(a+b)/2:(y0+y1)/2,cut+.003));m.userData.nivel=p.nivel;PLAN_CAPS.add(m);}}

const etiquetas = []; for (const e of M.espacios) { if (e.uso === 'vacio') continue; const d = document.createElement('div'); d.className = 'room'; d.innerHTML = `${e.n}<small>${es(e.area)} m²</small>`; const o = new CSS2DObject(d); const [x0, y0, x1, y1] = e.r; o.position.copy(W((x0 + x1) / 2, (y0 + y1) / 2, (e.nivel === 'PB' ? 0 : 3) + .1)); o.userData.nivel = e.nivel; o.visible = false; CASA.add(o); etiquetas.push(o); }
function visibilidad() {
  const md = ESTADO.modo;
  ENT.visible = EXT.visible = ARB.visible = SUELO.visible = !esDibujo();
  if(PASTO) PASTO.visible = !esDibujo() && md !== 'maqueta';
  PLAN_CAPS.children.forEach(m=>m.material.color.set(ESTADO.maquetaPlanta?'#858d80':'#465046'));
  PLAN_CAPS.children.forEach(m=>m.visible=md==='plano'&&m.userData.nivel===ESTADO.nivel);
  for (const g of CASA.userData.piezas) { const p = g.userData.p; let on = true;
    if (md === 'plano' && ESTADO.nivel === 'PB' && (p.nivel === 'P1' || p.nivel === 'CUB')) on = false; if (md === 'plano' && p.nivel === 'CUB') on = false;
    if (p.cat === 'cimentacion') on = false; g.visible = on; }
  corteH.constant = md === 'plano' ? (ESTADO.nivel === 'PB' ? 1.3 : 4.3) : 999;
  if (md === 'seccion') { corteV.normal.set(0, 0, -1); corteV.constant = ESTADO.corte; corteV.applyMatrix4(CASA.matrixWorld); } else { corteV.normal.set(0, 0, -1); corteV.constant = 999; }
  for (const o of etiquetas) o.visible = md === 'plano' && ESTADO.etiquetasPlanta && o.userData.nivel === ESTADO.nivel;
  for (const o of ENT.children) if (o.isMesh && o.userData.ghost) { const v = md !== 'seccion' && CAPAS.edificios && !o.userData.existente; o.visible = v; o.userData.ghost.visible = v; }
}
const CAPAS = { orto: true, edificios: false, parcelas: true, existente: false };
function vistaCapas() { if (ORTO) ORTO.visible = CAPAS.orto && !['maqueta','plano','alzado'].includes(ESTADO.modo); for (const o of ENT.children) { if (o.isLine && o.material === LVEC) o.visible = CAPAS.parcelas; if (o.userData.existente && o.isLine) o.visible = CAPAS.existente; } visibilidad(); }
// Vistas de dibujo del mismo modelo, sin iluminación ni efectos fotográficos.
const esDibujo = () => ['plano','alzado'].includes(ESTADO.modo);
const MATERIALES_PLANOS = {maqueta:{},acabados:{}};
const LINEAS_PLANAS = [];
function materialesPlanos() {
  const estilo = ESTADO.maquetaPlanta ? 'maqueta' : 'acabados';
  if (!Object.keys(MATERIALES_PLANOS.maqueta).length) {
    for (const [nombre,fuente] of Object.entries(MUNDO)) for (const tipo of ['maqueta','acabados']) {
      const base = tipo==='maqueta' ? MAQV[nombre] : fuente;
      MATERIALES_PLANOS[tipo][nombre] = new THREE.MeshBasicMaterial({color:base.color.clone(),map:tipo==='acabados'?fuente.map:null,
        transparent:base.transparent,opacity:base.opacity,depthWrite:base.depthWrite,side:THREE.DoubleSide,
        clippingPlanes:[corteH,corteV],toneMapped:false});
    }
    const tinta = new THREE.LineBasicMaterial({color:'#777b70',transparent:true,opacity:.55,clippingPlanes:[corteH,corteV],toneMapped:false});
    for (const m of todos) {
      let grupo=m.parent;while(grupo&&grupo!==CASA&&!grupo.userData.p)grupo=grupo.parent;
      if(!grupo?.userData.p||!m.geometry)continue;
      const borde=new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry,35),tinta);m.add(borde);LINEAS_PLANAS.push(borde);
    }
  }
  for(const m of todos)if(m.userData.mk)m.material=MATERIALES_PLANOS[estilo][m.userData.mk];
  LINEAS_PLANAS.forEach(l=>l.visible=true);
}
function actualizarPlantas() {
  const planta = ESTADO.modo === 'plano', dibujo=esDibujo();
  document.body.dataset.view = ESTADO.modo;
  $('#plan-tools').hidden = !dibujo;
  $('#floor-choices').hidden = !planta; $('#elevation-choices').hidden = ESTADO.modo!=='alzado';
  $('#plan-labels').hidden = !planta;
  $$('#tabs [data-t="luz"],#tabs [data-t="parcela"]').forEach(b=>b.hidden=dibujo);
  $$('[data-floor]').forEach(b => b.setAttribute('aria-pressed', planta && b.dataset.floor === ESTADO.nivel));
  $$('[data-elevation]').forEach(b=>b.setAttribute('aria-pressed',ESTADO.modo==='alzado'&&b.dataset.elevation===ESTADO.alzado));
  $$('[data-plan-style]').forEach(b => b.setAttribute('aria-pressed', (b.dataset.planStyle === 'maqueta') === ESTADO.maquetaPlanta));
  $('#plan-labels').setAttribute('aria-pressed', ESTADO.etiquetasPlanta);
}
function luzPlanta() {
  sky.visible = false;
  S.background = new THREE.Color('#ecebe4'); S.fog = null; S.environment = null;
  sun.visible=false; hemi.visible=false; sun.intensity=0; hemi.intensity=0;
  R.shadowMap.enabled=false; R.toneMappingExposure=1;
  for (const l of luces) {l.intensity=0;l.visible=false;}
  MUNDO.luz.emissiveIntensity = 0;
}
function setModo(m) {
  parar(); vuelo = null;
  ESTADO.modo = m;
  $$('#modes button').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === m));
  if (esDibujo() && innerWidth <= 900) {
    document.body.classList.add('panel-closed');
    $('#panel-toggle').textContent = 'Información +'; $('#panel-toggle').setAttribute('aria-expanded', 'false');
  }
  actualizarPlantas();
  materiales(m === 'maqueta' || (esDibujo() && ESTADO.maquetaPlanta));
  if (esDibujo()) { materialesPlanos();cam = camO; ctl.enabled = false; ctlO.enabled = true; }
  else { LINEAS_PLANAS.forEach(l=>l.visible=false);sun.visible=hemi.visible=true;luces.forEach(l=>l.visible=true);R.shadowMap.enabled=true;cam = camP; ctl.enabled = true; ctlO.enabled = false; }
  rp.camera = cam; gtao.camera = cam; gtao.enabled = !esDibujo();
  if (m === 'seccion') vuela('seccion');
  if (m === 'maqueta') vuela('maqueta');
  vistaCapas(); sol(true); panel(); resize();
}
function espacioPlanta(w, h) {
  const lateral = innerWidth > 900 && !document.body.classList.contains('panel-closed') ? 360 : 0;
  const arriba = innerWidth<=600?112:78, abajo = $('#plan-tools').offsetHeight + 34;
  return { ancho: Math.max(150, w-lateral-64), alto: Math.max(150, h-arriba-abajo), dx:lateral/2, dy:(abajo-arriba)/2 };
}
function encuadrePlano(a = innerWidth / (innerHeight - (innerWidth <= 900 ? 78 : 86))) {
  if(ESTADO.modo==='alzado')return encuadreAlzado(a);
  CASA.updateWorldMatrix(true, false);
  const alto = innerHeight - (innerWidth <= 900 ? 78 : 86), ancho = alto*a;
  const espacio = espacioPlanta(ancho, alto), horizontal = espacio.ancho/espacio.alto > 1.2;
  const escala = Math.min(espacio.ancho/(horizontal ? 15.8 : 9.8), espacio.alto/(horizontal ? 9.8 : 15.8));
  const h = alto/(2*escala);
  camO.left = -h*a; camO.right = h*a; camO.top = h; camO.bottom = -h; camO.zoom = 1;
  // En horizontal el acceso queda a la izquierda, igual que en los planos PDF.
  camO.up.copy(horizontal ? W(1,0,0) : W(0,-1,0)).transformDirection(CASA.matrixWorld);
  const centro = CASA.localToWorld(W(4.5,7.5,ESTADO.nivel === 'PB' ? 0 : 3));
  camO.position.copy(centro).add(new THREE.Vector3(0,80,0));
  ctlO.target.copy(centro); camO.lookAt(centro); camO.updateProjectionMatrix(); camO.updateMatrixWorld();
}
function encuadreAlzado(a) {
  CASA.updateWorldMatrix(true,false);
  const alto=innerHeight-(innerWidth<=900?78:86),espacio=espacioPlanta(alto*a,alto);
  const direcciones={frente:W(0,-1,0),jardin:W(0,1,0),izquierdo:W(1,0,0),derecho:W(-1,0,0)};
  const lateral=['izquierdo','derecho'].includes(ESTADO.alzado),escala=Math.min(espacio.ancho/(lateral?15.8:9.8),espacio.alto/7.2),h=alto/(2*escala);
  camO.left=-h*a;camO.right=h*a;camO.top=h;camO.bottom=-h;camO.zoom=1;camO.up.set(0,1,0);
  const centro=CASA.localToWorld(W(4.5,7.5,3.1)),direccion=direcciones[ESTADO.alzado].transformDirection(CASA.matrixWorld);
  camO.position.copy(centro).addScaledVector(direccion,80);ctlO.target.copy(centro);camO.lookAt(centro);camO.updateProjectionMatrix();camO.updateMatrixWorld();
}
$('#plan-tools').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.floor) { ESTADO.nivel = b.dataset.floor; setModo('plano'); }
  if (b.dataset.elevation) {ESTADO.alzado=b.dataset.elevation;setModo('alzado');}
  if (b.dataset.planStyle) {
    ESTADO.maquetaPlanta = b.dataset.planStyle === 'maqueta';
    materiales(ESTADO.maquetaPlanta); materialesPlanos();visibilidad(); luzPlanta(); actualizarPlantas();
  }
  if (b.id === 'plan-labels') { ESTADO.etiquetasPlanta = !ESTADO.etiquetasPlanta; visibilidad(); actualizarPlantas(); }
  if (b.id === 'plan-fit') resize();
});

// ── Vistas relativas a la casa (siguen a la casa al girarla o moverla) ─────────────────
const VISTAS = {
  aerea: { n: 'Aérea', p: [22, 31, 23], t: [4.5, 8, 1.5] }, calle: { n: 'Calle', p: [15, -17, 3.7], t: [4.2, 1, 3.1], f: 50 }, jardin: { n: 'Jardín', p: [13, 28, 4.6], t: [4.5, 12, 2.8], f: 48 },
  terraza: { n: 'Terraza', p: [.8, 14.7, 4.6], t: [6.5, 11.0, 4.3], f: 64 }, salon: { n: 'Salón', p: [.6, 10.4, 1.5], t: [5.6, 15.4, 1.3], f: 70 }, cocina: { n: 'Cocina', p: [4.6, 12.8, 1.6], t: [2.2, 6.4, 1.0], f: 64 },
  suite: { n: 'Suite', p: [5.5, 11.7, 4.6], t: [.6, 9.2, 3.95], f: 66 }, despacho: { n: 'Despacho · luna', p: [6.45, 9.3, 4.55], t: [7.6, 12.2, 4.55], f: 66 },
  parcela: { n: 'Parcela', p: [-17, -25, 31], t: [4.5, 9, 0] }, maqueta: { n: 'Maqueta', p: [-15, -17, 17], t: [4.5, 8, 2] }, seccion: { n: 'Sección', p: [4.5, 30, 4.4], t: [4.5, 9, 2.6], f: 40 },
};
const vMundo = (a) => { const v = W(...a); CASA.localToWorld(v); return v; };
let vuelo = null;
function vuela(k, dur = 1.6) { const v = VISTAS[k]; if (!v) return; if (esDibujo()) setModo('mundo');
  vuelo = { p0: camP.position.clone(), t0: ctl.target.clone(), p1: vMundo(v.p), t1: vMundo(v.t), f0: camP.fov, f1: v.f || 42, s: performance.now(), d: dur * 1000 }; $$('#chips button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === k)); }
$('#chips').innerHTML = ['parcela', 'aerea', 'calle', 'jardin', 'terraza', 'salon', 'cocina', 'suite', 'despacho'].map((k) => `<button data-v="${k}">${VISTAS[k].n}</button>`).join('') + '<span class="sep"></span><button id="rec">▶ Recorrido</button>';
let rec = null; const RUTA = ['parcela', 'calle', 'cocina', 'salon', 'jardin', 'terraza', 'suite', 'despacho', 'aerea'];
const TXT = { parcela: 'Tu parcela: la casa colocada sobre la parcela catastral real, con su orientación.', calle: 'La calle: lamas de madera que filtran la luz de los dormitorios y un zócalo de piedra clara.', cocina: 'Cocina con isla, abierta a la zona de día.',
  salon: 'Salón-comedor de 31,5 m² que se abre por completo al jardín.', jardin: 'El jardín y la terraza bajo la pérgola.', terraza: 'Terraza de 27 m² bajo pérgola de lamas, desde la suite.',
  suite: 'Suite con vestidor y baño propio.', despacho: 'Despacho con una ventana circular hacia el jardín.', aerea: 'Una vivienda, dos plantas y una terraza abierta al jardín.' };
function parar() { if (rec) { clearTimeout(rec); rec = null; $('#rec').textContent = '▶ Recorrido'; $('#cap').style.display = 'none'; } }
$('#chips').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.v) { parar(); vuela(b.dataset.v); }
  if (b.id === 'rec') { if (rec) return parar(); if (ESTADO.modo !== 'mundo') setModo('mundo'); let i = 0; b.textContent = '❚❚ Recorrido'; const paso = () => { const k = RUTA[i++ % RUTA.length]; vuela(k, 2.4); $('#cap').textContent = TXT[k]; $('#cap').style.display = 'block'; rec = setTimeout(paso, 5200); }; paso(); }
  if (b.id === 'foto') { render(); const a = document.createElement('a'); a.href = R.domElement.toDataURL('image/png'); a.download = `Natura_adosada_${SITIO.rc || 'demo'}.png`; a.click(); } });
// ── Panel ─────────────────────────────────────────────────────────────────────────────
let tab = 'casa';
const estado = (t, err=false) => { ESTADO.msg=t; ESTADO.err=err; };
$('#tabs').addEventListener('click', e=>{const b=e.target.closest('button');if(!b)return;tab=b.dataset.t;$$('#tabs button').forEach(x=>x.setAttribute('aria-selected',x===b));panel();});
function panel(){
 if(esDibujo()&&['luz','parcela'].includes(tab))tab='casa';
 $$('#tabs button').forEach(b=>b.setAttribute('aria-selected',b.dataset.t===tab));
 let h='';
 if(tab==='casa') h=`<span class="eyebrow">01 / LA VIVIENDA</span><h2>Una casa.<br><em>Muchas formas de vivirla.</em></h2><p>Dos plantas conectadas al jardín. Fachadas blancas, madera natural y una terraza que prolonga la vida al aire libre.</p><div class="kpi"><div><span>Construidos</span><b>243 m²</b></div><div><span>Dormitorios</span><b>4</b></div><div><span>Terraza</span><b>27 m²</b></div></div><h3>Recorre tu casa</h3><p>${ESTADO.modo==='alzado'?'Alzados y perfiles a escuadra, sin perspectiva, iluminación ni sombras. Elige la cara de la vivienda en la barra inferior. Arrastra para desplazar y usa la rueda para acercar.':ESTADO.modo==='plano'?'Vista superior a escuadra, sin iluminación ni sombras. Arrastra para desplazar la planta y usa la rueda o dos dedos para acercarte. En la barra inferior puedes cambiar de planta, alternar Maqueta y Acabados, o mostrar las estancias.':'Elige una vista en la barra inferior. Arrastra para girar y usa la rueda o dos dedos para acercarte.'}</p><h3>La distribución</h3><div class="fila"><button class="btn" data-floor="PB">Planta baja</button><button class="btn" data-floor="P1">Planta primera</button><button class="btn" data-section>Ver sección</button></div>${ESTADO.modo==='plano'?`<p class="hint">${ESTADO.nivel==='PB'?'Zona de día, dormitorio, baño y garaje.':'Tres dormitorios, dos baños, vestidor, despacho y terraza.'}</p>`:''}${ESTADO.modo==='seccion'?`<label for="corte">Posición del corte</label><input id="corte" type="range" min=".2" max="15" step=".05" value="${ESTADO.corte}">`:''}<p class="hint">Las superficies corresponden al programa del anteproyecto.</p>`;
 if(tab==='parcela') h=`<span class="eyebrow">02 / EL LUGAR</span><h2>La casa<br><em>en su parcela.</em></h2><p>La implantación conservada del proyecto reúne acceso, vivienda y jardín en una única escena.</p><div class="row"><span>Parcela</span><b>${es(SITIO.area,0)} m²</b></div><div class="row"><span>Huella de vivienda</span><b>135 m²</b></div><div class="row"><span>Jardín orientado</span><b>Norte · 352,6°</b></div><h3>Leer el emplazamiento</h3><p>El contorno luminoso delimita la parcela. Las líneas suaves muestran el contexto catastral.</p><div class="fila"><button class="btn pri" data-view="parcela">Ver parcela completa</button><button class="btn" id="contorno" aria-pressed="${CAPAS.parcelas}">Límites del entorno</button></div><p class="hint">Base geométrica del emplazamiento guardado. La jardinería ilustra la propuesta de uso exterior.</p>`;
 if(tab==='luz') h=`<span class="eyebrow">03 / LUZ Y SOMBRA</span><h2>Una casa<br><em>a cada hora.</em></h2><p>Explora cómo cambia la luz sobre las fachadas blancas, la celosía y la pérgola.</p><label for="hora">Hora del día</label><input id="hora" type="range" min="7" max="22" step=".25" value="${ESTADO.hora}"><div class="row"><b id="hora-v"></b></div><h3>Época del año</h3><div class="fila">${[['verano','Verano'],['equinoccio','Entretiempo'],['invierno','Invierno']].map(([k,t])=>`<button class="btn" data-est="${k}" aria-pressed="${ESTADO.estacion===k}">${t}</button>`).join('')}</div><p class="hint">Simulación orientativa con la ubicación y orientación guardadas; no sustituye un estudio de soleamiento.</p>`;
 if(tab==='materia') h=`<span class="eyebrow">04 / MATERIALIDAD</span><h2>Blanco, madera<br><em>y luz natural.</em></h2><div class="sw"><div><i style="background:#f5f3eb"></i><span>Blanco mineral<small>Fachadas exteriores</small></span></div><div><i style="background:#99734e"></i><span>Madera natural<small>Celosías y pérgola</small></span></div><div><i style="background:#d4c9b7"></i><span>Piedra clara<small>Accesos y cocina</small></span></div><div><i style="background:#c9d9db"></i><span>Vidrio<small>Continuidad y vistas</small></span></div></div><h3>Calidez hacia dentro</h3><p>Roble, lino y tonos minerales cálidos mantienen la atmósfera interior de la propuesta aprobada.</p><p class="hint">Imágenes de intención arquitectónica; acabados y mobiliario se concretarán durante el desarrollo del proyecto.</p>`;
 $('#body').innerHTML=h; actualizarPlantas();
 $$('#body [data-floor]').forEach(b=>b.onclick=()=>{ESTADO.nivel=b.dataset.floor;setModo('plano');});
 $$('#body [data-view]').forEach(b=>b.onclick=()=>{setModo('mundo');vuela(b.dataset.view);});
 $('#body [data-section]')?.addEventListener('click',()=>setModo('seccion'));
 $('#corte')?.addEventListener('input',e=>{ESTADO.corte=+e.target.value;visibilidad();});
 $('#hora')?.addEventListener('input',e=>{ESTADO.hora=+e.target.value;sol();});
 $$('#body [data-est]').forEach(b=>b.onclick=()=>{ESTADO.estacion=b.dataset.est;sol(true);panel();});
 $('#contorno')?.addEventListener('click',()=>{CAPAS.parcelas=!CAPAS.parcelas;vistaCapas();panel();});
 if(tab==='luz')sol();
}
$('#modes').addEventListener('click',e=>{const b=e.target.closest('button');if(b){if(b.dataset.m!=='mundo'){tab='casa';$$('#tabs button').forEach(x=>x.setAttribute('aria-selected',x.dataset.t==='casa'));}setModo(b.dataset.m);if(b.dataset.m==='mundo')vuela('aerea');}});

// ── Bucle ─────────────────────────────────────────────────────────────────────────────
function camAzimut() { const d = cam===camO ? camO.up.clone() : cam.getWorldDirection(new THREE.Vector3()); return Math.atan2(d.x, -d.z); }
function render() { if (cam === camP) composer.render(); else R.render(S, cam); L2.render(S, cam); }
function frame(t) {
  if (document.hidden || document.body.dataset.page !== 'modelo') { requestAnimationFrame(frame); return; }
  requestAnimationFrame(frame); tViento.value = t / 1000;
  if (vuelo) { const k = Math.min(1, (performance.now() - vuelo.s) / vuelo.d), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    camP.position.lerpVectors(vuelo.p0, vuelo.p1, e); ctl.target.lerpVectors(vuelo.t0, vuelo.t1, e); camP.fov = vuelo.f0 + (vuelo.f1 - vuelo.f0) * e; camP.updateProjectionMatrix(); if (k >= 1) vuelo = null; }
  // ¿cámara dentro de la casa? (en coordenadas de modelo)
  const lp = CASA.worldToLocal(camP.position.clone()); const d = cam === camP && lp.x > 0 && lp.x < 9 && lp.z > 0 && lp.z < 15 && lp.y > 0 && lp.y < 6 && ESTADO.modo === 'mundo';
  if (d !== interior) { interior = d; sol(); }
  (cam === camP ? ctl : ctlO).update();
  const ag = $('#aguja'); if (ag) ag.setAttribute('transform', `rotate(${-(camAzimut() * 180 / Math.PI)})`);
  render();
}
function resize() { const w = innerWidth, h = innerHeight - (innerWidth<=900?78:86); R.setSize(w, h, false); composer.setSize(w, h); L2.setSize(w, h); camP.aspect = w / h; camP.updateProjectionMatrix(); if (cam === camO) encuadrePlano(w/h); offsetView(w,h); }
function offsetView(w,h){const dx=innerWidth>900&&!document.body.classList.contains('panel-closed')?165:0;camP.setViewOffset(w,h,dx,0,w,h);const p=espacioPlanta(w,h);camO.setViewOffset(w,h,p.dx,p.dy,w,h);}
addEventListener('resize', resize); resize();
// Arranque
async function cargarGuardado() {
  const e = JSON.parse(document.getElementById('emplazamiento').textContent);
  if (e.formato !== 'nanca-emplazamiento/1' || !e.parcela?.utm || !e.casa) throw new Error('Emplazamiento no válido.');
  const [E0,N0]=e.origen, loc=([E,N])=>[E-E0,-(N-N0)];
  limpiarEntorno();
  Object.assign(SITIO, {tipo:e.sitio,rc:e.rc,ldt:e.direccion,E0,N0,lat:e.latlon[0],lon:e.latlon[1],area:e.parcela.area,
    parcela:e.parcela.utm.map(loc),vecinas:e.entorno.parcelas.map(p=>p.map(loc)),
    edificios:e.entorno.edificios.map(b=>({poly:b.utm.map(loc),h:b.altura,existente:b.existente})),frente:null});
  construirEntorno(); ajustarACalle();
  const [x,z]=loc(e.casa.centro_utm);
  Object.assign(COLOC,{x,z,rot:e.casa.giro_deg*Math.PI/180,espejo:e.casa.espejo,retranqueo:e.casa.retranqueo});
  aplicarColocacion(); sol(true);
  camP.position.copy(vMundo(VISTAS.parcela.p)); ctl.target.copy(vMundo(VISTAS.parcela.t));
  estado('Emplazamiento recuperado del archivo local. Ortofoto no cargada; la geometría guardada funciona sin conexión.'); panel();
}
requestAnimationFrame(frame);
// Automatización (imágenes del proyecto básico)
window.__vista = (k, modo, hora, est, nivel) => { if (modo) setModo(modo); if (hora != null) ESTADO.hora = hora; if (est) ESTADO.estacion = est; if (nivel) ESTADO.nivel = nivel; visibilidad(); sol(true); const v = VISTAS[k];
  if (v && modo !== 'plano') { vuelo = null; camP.position.copy(vMundo(v.p)); ctl.target.copy(vMundo(v.t)); camP.fov = v.f || 42; camP.updateProjectionMatrix(); ctl.update(); } panel(); };

await cargarGuardado(); setModo(Q.get('modo') || 'mundo');
window.__vista(Q.get('vista') || 'aerea', Q.get('modo') || 'mundo');
$('#carga').remove(); document.body.dataset.ready='true';
document.addEventListener('natura-page',()=>parar());

