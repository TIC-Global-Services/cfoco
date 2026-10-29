#!/usr/bin/env node
// Reads the room lights back from a file exported by threejs.org/editor (File → Export → GLB or GLTF) and prints
// them as the Light panel's values; with --write it also puts them into the defaults in components/home/controls.ts.
//
//   npm run lights:import ~/Downloads/scene.glb            # show what changed
//   npm run lights:import ~/Downloads/scene.glb -- --write  # and write it
//
// The lights are found by name ("key light", "fill light", "point light", "spot light": EDITOR_LIGHTS in
// components/home/config.ts), so keep those names in the editor. The key and fill are directional lights aimed at the
// room's origin, so only their position is kept; the spot keeps its aim (where it points at 1 m above the floor).

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const NAMES = { key: "key light", fill: "fill light", point: "point light", spot: "spot light" };
const CONTROLS = path.join(path.dirname(fileURLToPath(import.meta.url)), "../components/home/controls.ts");

const [file, ...flags] = process.argv.slice(2);
if (!file) {
  console.error("usage: npm run lights:import <exported .glb / .gltf> [-- --write]");
  process.exit(1);
}

function readGltf(p) {
  const buf = readFileSync(p);
  if (buf.readUInt32LE(0) !== 0x46546c67) return JSON.parse(buf.toString("utf8")); // .gltf
  const len = buf.readUInt32LE(12);
  return JSON.parse(buf.subarray(20, 20 + len).toString("utf8"));
}

// ---- 4×4 column-major matrices, as glTF stores them ----
const mul = (a, b) => {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
};
function local(n) {
  if (n.matrix) return n.matrix;
  const [x, y, z, w] = n.rotation ?? [0, 0, 0, 1];
  const [sx, sy, sz] = n.scale ?? [1, 1, 1];
  const [tx, ty, tz] = n.translation ?? [0, 0, 0];
  return [
    (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
    2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
    2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
    tx, ty, tz, 1,
  ];
}

const gltf = readGltf(file);
const defs = gltf.extensions?.KHR_lights_punctual?.lights ?? [];
const found = {};
const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function walk(i, parent) {
  const n = gltf.nodes[i];
  const m = mul(parent, local(n));
  const li = n.extensions?.KHR_lights_punctual?.light;
  if (li !== undefined) {
    const def = defs[li];
    // the editor's loader turns "key light" into "key_light"
    const names = [n.name, def.name].filter(Boolean).map((s) => s.toLowerCase().replace(/[\s_.]+/g, " ").trim());
    for (const [k, want] of Object.entries(NAMES)) if (names.includes(want)) found[k] = { def, m };
  }
  for (const c of n.children ?? []) walk(c, m);
}
for (const r of gltf.scenes?.[gltf.scene ?? 0]?.nodes ?? []) walk(r, I);

const missing = Object.keys(NAMES).filter((k) => !found[k]);
if (missing.length === 4) {
  console.error(`no lights named ${Object.values(NAMES).map((n) => `"${n}"`).join(", ")} in ${file}`);
  process.exit(1);
}

const r2 = (v) => Math.round(v * 100) / 100;
const toSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const hex = (rgb = [1, 1, 1]) =>
  "#" + rgb.map((c) => Math.round(Math.min(1, Math.max(0, toSrgb(c))) * 255).toString(16).padStart(2, "0")).join("");

const values = {};
for (const [k, { def, m }] of Object.entries(found)) {
  const pos = [m[12], m[13], m[14]];
  // the light looks down its local -z
  const d = [-m[8], -m[9], -m[10]];
  const dl = Math.hypot(...d) || 1;
  const dir = d.map((v) => v / dl);
  values[`${k}Color`] = hex(def.color);
  values[`${k}Intensity`] = r2(def.intensity ?? 1);
  values[`${k}Pos`] = pos.map(r2);
  if (k === "key" || k === "fill") {
    const toOrigin = pos.map((v) => -v);
    const ol = Math.hypot(...toOrigin) || 1;
    const dot = dir.reduce((s, v, i) => s + v * (toOrigin[i] / ol), 0);
    if (dot < Math.cos((5 * Math.PI) / 180))
      console.warn(`note: the ${NAMES[k]} was turned in the editor; the site aims it at the room's origin, so only its position is kept`);
  }
  if (k === "point" && def.range) values.pointDistance = r2(def.range);
  if (k === "spot") {
    const outer = def.spot?.outerConeAngle ?? Math.PI / 4;
    const inner = def.spot?.innerConeAngle ?? 0;
    values.spotAngle = r2(outer);
    values.spotPenumbra = r2(1 - inner / outer);
    // where it points: at 1 m above the floor, or 6 m ahead if it doesn't point down
    const t = dir[1] < -0.05 ? (1 - pos[1]) / dir[1] : 6;
    values.spotTarget = pos.map((v, i) => r2(v + dir[i] * t));
  }
}

console.log(`from ${file}${missing.length ? ` (not found: ${missing.map((k) => NAMES[k]).join(", ")})` : ""}:\n`);
for (const [k, v] of Object.entries(values)) console.log(`  ${k.padEnd(16)} ${JSON.stringify(v)}`);

if (!flags.includes("--write")) {
  console.log("\nrun again with -- --write to put these into components/home/controls.ts");
  process.exit(0);
}

const file_ = readFileSync(CONTROLS, "utf8");
// only inside the Light panel (useLightControls): the machine lights reuse names like keyIntensity
const from = file_.indexOf("export function useLightControls");
const to = file_.indexOf("export function", from + 1);
if (from < 0) throw new Error("couldn't find useLightControls in controls.ts");
let src = file_.slice(from, to < 0 ? undefined : to);
const set = (key, v) => {
  const re = Array.isArray(v)
    ? new RegExp(`(${key}: \\{ \\.\\.\\.xyz\\()\\[[^\\]]*\\]`)
    : typeof v === "string"
      ? new RegExp(`(${key}: \\{ value: )"[^"]*"`)
      : new RegExp(`(${key}: \\{ value: )-?[\\d.]+`);
  if (!re.test(src)) throw new Error(`couldn't find ${key} in controls.ts`);
  src = src.replace(re, `$1${Array.isArray(v) ? `[${v.join(", ")}]` : typeof v === "string" ? `"${v}"` : v}`);
};
for (const [k, v] of Object.entries(values)) set(k, v);
writeFileSync(CONTROLS, file_.slice(0, from) + src + (to < 0 ? "" : file_.slice(to)));
console.log("\nwritten to components/home/controls.ts — reload the page to see them");
