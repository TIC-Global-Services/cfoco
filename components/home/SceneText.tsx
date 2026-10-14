"use client";

import { Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { damp, scrollState } from "@/lib/home/scroll";
import { CAMERA } from "./config";
import { useTextControls } from "./controls";

const FONT = "/fonts/Geist-Medium.ttf";
const GRADIENT = ["#d9a46c", "#c3a79a", "#8e9de3"]; // same stops as .text-gradient

/**
 * One DOM text element mirrored in 3D. The DOM stays the source of truth for
 * layout (responsive, Tailwind) and for screen readers — its text is made
 * transparent (html.t3d) and rendered here as SDF type instead.
 */
type Item = {
  el: HTMLElement;
  section: HTMLElement;
  index: number;
  text: string;
  fontPx: number;
  lineHeight: number;
  letterSpacing: number; // em
  align: "left" | "center";
  gradient: boolean;
  nowrap: boolean;
  /** position within its section (reading order) and how many the section has — for the staggered reveal */
  order: number;
  count: number;
  /** solid colour (data-t3d-color), instead of white / the gradient */
  color: string | null;
  /** an icon (data-t3d-icon) drawn as a textured plane instead of type */
  icon: string | null;
  /** an image (data-t3d-img="url") drawn as a textured plane */
  img: string | null;
  /** a rounded box (data-t3d-box): fill / border / radius from the element's
   *  --box-bg / --box-border / --box-radius, so the DOM can drop its own copy */
  box: { bg: string; border: string; radius: number; w: number; h: number } | null;
  /** the link it belongs to: hovering / focusing it lights the line up */
  link: HTMLElement | null;
  /** section options: pinned to the real (moving) camera rather than the authored one,
   *  and an explicit scroll range for the reveal (data-reveal="from,to") */
  pinned: boolean;
  revealRange: [number, number] | "intro" | null;
  /** boxes inside boxes draw later (the Contact Us arrow on its pill): nesting depth */
  level: number;
  /** shown only while this ancestor has data-open="true" (a dropdown) */
  gate: HTMLElement | null;
  /** its text changes at runtime (data-t3d-live): re-read every frame */
  live: boolean;
  /** render-order offset: sections marked data-t3d-layer="top" (the navbar) draw over everything */
  layer: number;
};

function collect(): Item[] {
  const items: Item[] = [];
  document.querySelectorAll<HTMLElement>("[data-t3d]").forEach((el) => {
    const section = el.closest("section") as HTMLElement | null;
    if (!section) return;
    const range = section.dataset.reveal === "intro" ? "intro" : section.dataset.reveal?.split(",").map(Number);
    const cs = getComputedStyle(el);
    const fontPx = parseFloat(cs.fontSize);
    const lh = parseFloat(cs.lineHeight);
    const ls = parseFloat(cs.letterSpacing);
    items.push({
      el,
      section,
      index: Number(section.dataset.index ?? 0),
      text: (el.textContent ?? "").trim(),
      fontPx,
      lineHeight: Number.isFinite(lh) ? lh / fontPx : 1.2,
      letterSpacing: Number.isFinite(ls) ? ls / fontPx : 0,
      align: cs.textAlign === "center" ? "center" : "left",
      gradient: el.classList.contains("text-gradient"),
      nowrap: cs.whiteSpace === "pre-line" || cs.whiteSpace === "pre" || cs.whiteSpace === "nowrap",
      order: items.filter((o) => o.section === section).length,
      count: 0,
      color: el.dataset.t3dColor ?? null,
      icon: el.dataset.t3dIcon ?? null,
      img: el.dataset.t3dImg ?? null,
      box:
        el.dataset.t3dBox !== undefined
          ? {
              bg: cs.getPropertyValue("--box-bg").trim() || "transparent",
              border: cs.getPropertyValue("--box-border").trim() || "transparent",
              radius: parseFloat(cs.getPropertyValue("--box-radius")) || 0,
              w: Math.round(el.offsetWidth),
              h: Math.round(el.offsetHeight),
            }
          : null,
      link: el.closest("a, button"),
      pinned: section.dataset.t3dPinned !== undefined,
      revealRange: range === "intro" ? "intro" : range?.length === 2 ? [range[0], range[1]] : null,
      level: (() => {
        let n = 0;
        for (let a = el.parentElement?.closest("[data-t3d-box]"); a; a = a.parentElement?.closest("[data-t3d-box]")) n++;
        return n;
      })(),
      gate: el.closest<HTMLElement>("[data-t3d-gate]"),
      live: el.dataset.t3dLive !== undefined,
      layer: section.dataset.t3dLayer === "top" ? 30 : 0,
    });
  });
  for (const it of items) it.count = items.filter((o) => o.section === it.section).length;
  return items;
}

function gradientTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 1;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 256, 0);
  grd.addColorStop(0, GRADIENT[0]);
  grd.addColorStop(0.45, GRADIENT[1]);
  grd.addColorStop(1, GRADIENT[2]);
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 1);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Glyphs write alpha 0 into the scene buffer so the bloom pass skips them
 * (Scene.tsx masks bloom by alpha), and always pass the depth test so the room
 * can never hide the copy — while still writing depth, so the hero (drawn
 * later, in front) correctly covers it.
 */
function textMaterial(map: THREE.Texture | null) {
  const m = new THREE.MeshBasicMaterial({ color: "#ffffff", map, transparent: true, toneMapped: false });
  m.blending = THREE.CustomBlending;
  m.blendEquation = THREE.AddEquation;
  m.blendSrc = THREE.SrcAlphaFactor;
  m.blendDst = THREE.OneMinusSrcAlphaFactor;
  m.blendSrcAlpha = THREE.ZeroFactor;
  m.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
  m.depthFunc = THREE.AlwaysDepth;
  m.depthWrite = true;
  return m;
}

// 24-unit line icons (lucide shapes), stroked onto a canvas
const ICONS: Record<string, (g: CanvasRenderingContext2D) => void> = {
  linkedin: (g) => {
    g.strokeRect(2.5, 2.5, 19, 19);
    g.stroke(new Path2D("M7 10v7M7 7v.01M11 17v-4a2.5 2.5 0 0 1 5 0v4M11 10v7"));
  },
  mail: (g) => {
    g.stroke(new Path2D("M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"));
    g.stroke(new Path2D("m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"));
  },
  "volume-on": (g) => {
    g.stroke(new Path2D("M11 5 6 9H2v6h4l5 4V5z"));
    g.stroke(new Path2D("M15.5 8.5a5 5 0 0 1 0 7"));
    g.stroke(new Path2D("M19 5a10 10 0 0 1 0 14"));
  },
  "volume-off": (g) => {
    g.stroke(new Path2D("M11 5 6 9H2v6h4l5 4V5z"));
    g.stroke(new Path2D("m22 9-6 6M16 9l6 6"));
  },
  menu: (g) => {
    g.stroke(new Path2D("M4 7h16M4 12h16M4 17h16"));
  },
  close: (g) => {
    g.stroke(new Path2D("M6 6l12 12M18 6 6 18"));
  },
  "chevron-down": (g) => {
    g.stroke(new Path2D("m6 9 6 6 6-6"));
  },
  "arrow-up-right": (g) => {
    g.stroke(new Path2D("M7 17 17 7M8 7h9v9"));
  },
  instagram: (g) => {
    g.stroke(new Path2D("M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z"));
    g.stroke(new Path2D("M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"));
    g.stroke(new Path2D("M17.5 6.5h.01"));
  },
};

function iconTexture(name: string) {
  const S = 128;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  g.scale(S / 24, S / 24);
  g.strokeStyle = "#ffffff";
  g.lineWidth = 1.6;
  g.lineCap = g.lineJoin = "round";
  ICONS[name]?.(g);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** a rounded box at 2× its css size: fill, then a hairline border */
function boxTexture(b: NonNullable<Item["box"]>) {
  const S = 2;
  const c = document.createElement("canvas");
  c.width = Math.max(2, b.w * S);
  c.height = Math.max(2, b.h * S);
  const g = c.getContext("2d")!;
  g.scale(S, S);
  const r = Math.min(b.radius, b.h / 2, b.w / 2);
  const path = () => {
    g.beginPath();
    g.roundRect(0.75, 0.75, b.w - 1.5, b.h - 1.5, r);
  };
  path();
  g.fillStyle = b.bg;
  g.fill();
  if (b.border !== "transparent") {
    g.strokeStyle = b.border;
    g.lineWidth = 1;
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

type Live = { x: number; y: number; z: number; rx: number; ry: number; h: number; open: number };

const GLOW = new THREE.Color("#d9a46c");
const SHADOW = new THREE.Color("#000000");

const easeOutQuart = (x: number) => 1 - Math.pow(1 - x, 4);

/**
 * 0..1 reveal of one line: each rises up through its own mask, one after
 * another. The opening section plays it in time once the loader clears;
 * every other section plays it as you scroll it in.
 */
function reveal(it: Item, p: number, now: number, reduced: boolean) {
  const d = p - it.index;
  let k: number;
  if (it.revealRange === "intro") k = (now - scrollState.introAt) / 1.2;
  else if (it.revealRange) k = (p - it.revealRange[0]) / (it.revealRange[1] - it.revealRange[0]);
  else if (it.index === 0 && d > -0.05) k = (now - scrollState.introAt) / 1.6; // ≈1.6 s for the whole block
  else if (d < 0) k = (d + 0.44) / 0.32; // scrolled in over -0.44 → -0.12
  else return 1; // leaving: handled by the recede
  if (reduced) return k > 0 ? 1 : 0;
  // the whole stagger fits inside k = 0..1
  const st = it.count > 1 ? Math.min(0.14, 0.45 / (it.count - 1)) : 0;
  const span = 1 - st * (it.count - 1);
  return easeOutQuart(THREE.MathUtils.clamp((k - it.order * st) / span, 0, 1));
}

export function SceneText() {
  const ctl = useTextControls();
  const [items, setItems] = useState<Item[]>([]);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const live = useRef<Live[]>([]);

  const mats = useMemo(() => {
    const grad = gradientTexture();
    // solid colours and icons, made on first use
    const extra = new Map<string, { mat: THREE.MeshBasicMaterial; base: THREE.Color }>();
    const get = (key: string, make: () => THREE.MeshBasicMaterial, color: string, boost = 1) => {
      let e = extra.get(key);
      if (!e) extra.set(key, (e = { mat: make(), base: new THREE.Color(color).multiplyScalar(boost) }));
      return e.mat;
    };
    return {
      plain: textMaterial(null),
      gradient: textMaterial(grad),
      grad,
      extra,
      colored: (c: string) => get(`c:${c}`, () => textMaterial(null), c),
      icon: (name: string, c: string) => get(`i:${name}:${c}`, () => textMaterial(iconTexture(name)), c),
      image: (url: string) =>
        get(
          `img:${url}`,
          () => {
            const t = new THREE.TextureLoader().load(url);
            t.colorSpace = THREE.SRGBColorSpace;
            t.anisotropy = 4;
            return textMaterial(t);
          },
          "#ffffff",
          // a touch hotter than the type: logos sit in the vignetted corners and their whites are off-white
          1.35,
        ),
      box: (b: NonNullable<Item["box"]>) =>
        get(`box:${b.bg}:${b.border}:${b.radius}:${b.w}x${b.h}`, () => textMaterial(boxTexture(b)), "#ffffff"),
    };
  }, []);
  useEffect(
    () => () => {
      mats.plain.dispose();
      mats.gradient.dispose();
      mats.grad.dispose();
      for (const { mat } of mats.extra.values()) {
        mat.map?.dispose();
        mat.dispose();
      }
    },
    [mats],
  );

  // hide the DOM copy while 3D text is on; (re)collect on resize / font load
  useEffect(() => {
    const root = document.documentElement;
    if (!ctl.enabled) {
      root.classList.remove("t3d");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems([]);
      return;
    }
    root.classList.add("t3d");
    let t = 0;
    const refresh = () => {
      clearTimeout(t);
      t = window.setTimeout(() => setItems(collect()), 120);
    };
    refresh();
    void document.fonts?.ready.then(refresh);
    window.addEventListener("resize", refresh);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", refresh);
      root.classList.remove("t3d");
    };
  }, [ctl.enabled]);

  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const tmp = useMemo(
    () => ({
      q: new THREE.Quaternion(),
      m: new THREE.Matrix4(),
      up: new THREE.Vector3(0, 1, 0),
      right: new THREE.Vector3(),
      camUp: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      e: new THREE.Euler(),
      lean: new THREE.Quaternion(),
      cur: { x: 0, y: 0 },
      camRight: new THREE.Vector3(),
      camUp2: new THREE.Vector3(),
      camFwd: new THREE.Vector3(),
      outline: new THREE.Color(),
    }),
    [],
  );

  useFrame((state, rawDelta) => {
    if (!items.length) return;
    const dt = Math.min(rawDelta, 1 / 20);
    const t = state.clock.elapsedTime;
    const vw = state.size.width;
    const vh = state.size.height;
    const D = ctl.depth;

    // authored camera frame — the copy is world-fixed, so the cursor orbit gives it parallax
    tmp.q.setFromRotationMatrix(tmp.m.lookAt(CAMERA.position, CAMERA.target, tmp.up));
    tmp.right.set(1, 0, 0).applyQuaternion(tmp.q);
    tmp.camUp.set(0, 1, 0).applyQuaternion(tmp.q);
    tmp.fwd.set(0, 0, -1).applyQuaternion(tmp.q);
    const halfH = D * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const wpp = (2 * halfH) / vh; // world units per css px at depth D

    // HDR level that lands on white after exposure + tone mapping
    const gain = 1.12 / Math.max(state.gl.toneMappingExposure, 0.05);
    mats.plain.color.setScalar(gain);
    mats.gradient.color.setScalar(gain);
    for (const { mat, base } of mats.extra.values()) mat.color.copy(base).multiplyScalar(gain);
    // the moving camera's frame, for sections pinned to the lens (the footer)
    const cam = state.camera as THREE.PerspectiveCamera;
    const camRight = tmp.camRight.set(1, 0, 0).applyQuaternion(cam.quaternion);
    const camUp2 = tmp.camUp2.set(0, 1, 0).applyQuaternion(cam.quaternion);
    const camFwd = tmp.camFwd.set(0, 0, -1).applyQuaternion(cam.quaternion);

    const on = scrollState.hasPointer && !scrollState.reducedMotion;
    tmp.cur.x = ((scrollState.pointer.x + 1) / 2) * vw;
    tmp.cur.y = ((1 - scrollState.pointer.y) / 2) * vh;
    const p = scrollState.progress;
    const motion = scrollState.reducedMotion ? 0 : 1;
    const now = performance.now() / 1000;

    items.forEach((it, i) => {
      const g = groups.current[i];
      const mesh = meshes.current[i] as (THREE.Mesh & { fillOpacity: number; outlineOpacity: number }) | null;
      if (!g || !mesh) return;
      const sec = it.section;
      const L = (live.current[i] ??= { x: 0, y: 0, z: 0, rx: 0, ry: 0, h: 0, open: 0 });
      // dropdowns: fade with their menu
      if (it.gate) L.open = damp(L.open, it.gate.dataset.open === "true" ? 1 : 0, 14, dt);
      const op = (sec.style.visibility === "hidden" ? 0 : parseFloat(sec.style.opacity || "0")) * (it.gate ? L.open : 1);
      const rv = reveal(it, p, now, scrollState.reducedMotion);
      g.visible = op > 0.003 && rv > 0.001;
      if (!g.visible) return;

      const r = it.el.getBoundingClientRect();
      // not laid out (display: none — e.g. the desktop nav on a phone): nothing to draw
      if (r.width === 0 && r.height === 0) {
        g.visible = false;
        return;
      }
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      // <0 coming in, >0 leaving; sections with their own reveal range (footer, navbar) don't tip on the way
      const d = it.revealRange ? 0 : p - it.index;

      // surreal depth: copy drifts back and tips away as its section fades
      const away = 1 - op;
      let tz = away * 2.4 * motion;
      let trx = -d * 0.45 * away * motion;
      let try_ = 0;
      // the cursor draws a block toward it: it leans to face the pointer and floats forward
      // (not the footer: it holds still, its links only glow)
      if (on && !it.pinned) {
        const dx = Math.max(r.left - tmp.cur.x, 0, tmp.cur.x - r.right);
        const dy = Math.max(r.top - tmp.cur.y, 0, tmp.cur.y - r.bottom);
        const near = Math.exp(-Math.hypot(dx, dy) / 220);
        const dirX = THREE.MathUtils.clamp((tmp.cur.x - cx) / (r.width / 2 || 1), -1, 1);
        const dirY = THREE.MathUtils.clamp((tmp.cur.y - cy) / (r.height / 2 || 1), -1, 1);
        try_ += dirX * 0.16 * near * ctl.lean;
        trx += dirY * 0.12 * near * ctl.lean;
        tz -= 0.35 * near * ctl.lean;
      }
      // links: hovered / focused ones glow (and, outside the footer, float forward)
      L.h = damp(L.h, it.link?.matches(":hover, :focus-visible") ? 1 : 0, 10, dt);
      if (!it.pinned) tz -= 0.25 * L.h * motion;
      L.z = damp(L.z, tz, 6, dt);
      L.rx = damp(L.rx, trx, 6, dt);
      L.ry = damp(L.ry, try_, 6, dt);

      // screen px → world at depth D (+ the block's own z offset, scaled so it stays in place on screen)
      const depth = D + L.z;
      const k = depth / D;
      const sx = (cx - vw / 2) * wpp * k;
      const sy = (vh / 2 - cy) * wpp * k + (it.pinned ? 0 : Math.sin(t * 0.6 + i) * 0.006 * motion);
      if (it.pinned) {
        g.position.copy(cam.position).addScaledVector(camRight, sx).addScaledVector(camUp2, sy).addScaledVector(camFwd, depth);
        g.quaternion.copy(cam.quaternion);
      } else {
        g.position.copy(CAMERA.position).addScaledVector(tmp.right, sx).addScaledVector(tmp.camUp, sy).addScaledVector(tmp.fwd, depth);
        g.quaternion.copy(tmp.q);
      }
      tmp.e.set(L.rx, L.ry, 0);
      g.quaternion.multiply(tmp.lean.setFromEuler(tmp.e));
      g.scale.setScalar(k);

      const fo = op * Math.min(1, rv * 1.6);
      if (it.icon || it.img || it.box) {
        // icons / images / boxes: a plane the size of their box, rising and fading in like the type
        mesh.position.set(0, (1 - rv) * -r.height * wpp, 0);
        mesh.scale.set(r.width * wpp, r.height * wpp, 1);
        (mesh.material as THREE.MeshBasicMaterial).opacity = fo;
        return;
      }
      // the text block hangs from the group centre; while revealing it sits lower,
      // clipped to its own box, so it slides up into view as if from behind a ledge
      const h = r.height * wpp;
      const drop = (1 - rv) * h * 1.08;
      mesh.position.set(it.align === "center" ? 0 : (-r.width / 2) * wpp, h / 2 - drop, (1 - rv) * -0.12);
      mesh.rotation.x = (1 - rv) * 0.5 * motion;
      const tm2 = mesh as unknown as { clipRect: number[] | null };
      if (rv < 1) tm2.clipRect = [-1e4, -h * 1.12 + drop, 1e4, h * 0.12 + drop];
      else if (tm2.clipRect) tm2.clipRect = null;
      if (it.live) {
        const txt = (it.el.textContent ?? "").trim();
        const tt = mesh as unknown as { text: string };
        if (tt.text !== txt) tt.text = txt;
      }
      mesh.fillOpacity = fo;
      mesh.outlineOpacity = (0.16 + 0.5 * L.h) * fo;
      if (it.link) (mesh as unknown as { outlineColor: number }).outlineColor = tmp.outline.copy(SHADOW).lerp(GLOW, L.h).getHex();
      // layout props re-run troika's layout, so only touch them when they really change (resize)
      const tm = mesh as unknown as { fontSize: number; maxWidth: number };
      const fs = it.fontPx * wpp;
      const mw = it.nowrap ? Infinity : r.width * wpp * 1.03;
      if (Math.abs(tm.fontSize - fs) > fs * 0.002) tm.fontSize = fs;
      if (mw !== tm.maxWidth && Math.abs(tm.maxWidth - mw) > mw * 0.01) tm.maxWidth = mw;
    });
  });

  return (
    <>
      {items.map((it, i) => (
        <group
          key={`${it.index}-${i}-${it.text.slice(0, 12)}`}
          ref={(g) => {
            groups.current[i] = g;
          }}
          visible={false}
        >
          {it.icon || it.img || it.box ? (
            <mesh
              ref={(m: THREE.Mesh | null) => {
                meshes.current[i] = m;
              }}
              material={it.box ? mats.box(it.box) : it.img ? mats.image(it.img) : mats.icon(it.icon!, it.color ?? "#ffffff")}
              // boxes sit under the type drawn on them
              renderOrder={(it.box ? -10 + it.level : -1) + it.layer}
            >
              <planeGeometry />
            </mesh>
          ) : (
          <Text
            ref={(m: THREE.Mesh | null) => {
              meshes.current[i] = m;
            }}
            font={FONT}
            sdfGlyphSize={64}
            anchorX={it.align === "center" ? "center" : "left"}
            anchorY="top"
            textAlign={it.align}
            lineHeight={it.lineHeight}
            letterSpacing={it.letterSpacing}
            whiteSpace={it.nowrap ? "nowrap" : "normal"}
            material={it.color ? mats.colored(it.color) : it.gradient ? mats.gradient : mats.plain}
            outlineWidth={0}
            outlineBlur="70%"
            outlineColor="#000000"
            renderOrder={-1 + it.layer}
          >
            {it.text}
          </Text>
          )}
        </group>
      ))}
    </>
  );
}
