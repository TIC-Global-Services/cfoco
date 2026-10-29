"use client";

import { Line, TransformControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { button, useControls } from "leva";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { bumpRoutes } from "@/lib/home/scroll";
import { ROBOT_RUN, VENDING_STOP } from "./config";

/**
 * ?debug only: the robot's routes on the floor, to shape them by hand. Click a waypoint and drag it (the arrows move
 * it along the floor); the robot follows the new curve straight away (scroll to watch it). The two outlines are the
 * robot's width (0.9 m): keep furniture outside them. Edits stay in this browser until "reset"; "copy routes" puts
 * them on the clipboard as code, to paste over the three arrays in ROBOT_RUN (config.ts).
 */

const ROUTES = [
  { key: "route", label: "kiosks → vending", color: "#33d1ff" },
  { key: "kitchenRoute", label: "vending → kitchen", color: "#ffb020" },
  { key: "exitRoute", label: "kitchen → patrol", color: "#9b7bff" },
] as const;
type RouteKey = (typeof ROUTES)[number]["key"];

/** points two routes share: moving one moves it in both, and the code keeps their names */
const NAMED = new Map<THREE.Vector3, string>([
  [ROBOT_RUN.start, "ROBOT_START"],
  [VENDING_STOP, "VENDING_STOP"],
]);
const STORE = "cfoco.robot-routes";
/** half the robot's width, metres */
const HALF_WIDTH = 0.45;
const Y = 0.03;

type Saved = Record<RouteKey, { x: number; z: number; name?: string }[]>;

function save() {
  const out = {} as Saved;
  for (const { key } of ROUTES) out[key] = ROBOT_RUN[key].map((v) => ({ x: v.x, z: v.z, name: NAMED.get(v) }));
  try {
    localStorage.setItem(STORE, JSON.stringify(out));
  } catch {
    /* private mode: edits just don't survive a reload */
  }
}

function load() {
  let saved: Saved | null = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORE) ?? "null");
  } catch {
    return;
  }
  if (!saved) return;
  const byName = new Map([...NAMED].map(([v, n]) => [n, v]));
  for (const { key } of ROUTES) {
    const pts = saved[key];
    if (!Array.isArray(pts) || pts.length < 2) continue;
    const next = pts.map((p) => {
      const named = p.name ? byName.get(p.name) : undefined;
      const v = named ?? new THREE.Vector3();
      return v.set(p.x, 0, p.z);
    });
    ROBOT_RUN[key].splice(0, ROBOT_RUN[key].length, ...next);
  }
  bumpRoutes();
}

function code() {
  const f = (n: number) => +n.toFixed(2);
  const vec = (v: THREE.Vector3) => `new THREE.Vector3(${f(v.x)}, 0, ${f(v.z)})`;
  const lines = ["// shared points (replace their definitions above ROBOT_RUN):"];
  for (const [v, n] of NAMED) lines.push(`const ${n} = ${vec(v)};`);
  for (const { key, label } of ROUTES) {
    lines.push("", `  // ${label}`, `  ${key}: [`);
    for (const v of ROBOT_RUN[key]) lines.push(`    ${NAMED.get(v) ?? vec(v)},`);
    lines.push("  ],");
  }
  return lines.join("\n");
}

/** the curve the robot drives (same settings as ServeRobot), and the two edges of its footprint */
function outline(points: THREE.Vector3[]) {
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.5);
  const n = Math.max(24, Math.round(curve.getLength() * 6));
  const mid: THREE.Vector3[] = [];
  const left: THREE.Vector3[] = [];
  const right: THREE.Vector3[] = [];
  const side = new THREE.Vector3();
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const p = curve.getPointAt(u).setY(Y);
    const t = curve.getTangentAt(Math.min(Math.max(u, 0.001), 0.999));
    side.set(-t.z, 0, t.x).normalize().multiplyScalar(HALF_WIDTH);
    mid.push(p);
    left.push(p.clone().add(side));
    right.push(p.clone().sub(side));
  }
  return { mid, left, right };
}

/** clips the whole scene above `y` (null: no clipping); returns the undo */
function clipAbove(gl: THREE.WebGLRenderer, y: number | null) {
  const before = gl.clippingPlanes;
  gl.clippingPlanes = y === null ? [] : [new THREE.Plane(new THREE.Vector3(0, -1, 0), y)];
  return () => {
    gl.clippingPlanes = before;
  };
}

export function RouteEditor() {
  // the saved edits are applied once, before the first outlines are drawn
  const [tick, setTick] = useState(() => (load(), 0));
  const [sel, setSel] = useState<{ route: RouteKey; i: number } | null>(null);
  const [handle, setHandle] = useState<THREE.Mesh | null>(null);

  const changed = () => {
    bumpRoutes();
    save();
    setTick((t) => t + 1);
  };

  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as unknown as { target: THREE.Vector3; update: () => void } | null;

  const { "hide ceiling": hideCeiling } = useControls(
    "Robot route editor",
    {
      "top-down view": button(() => {
        // straight down, the back wall at the top of the screen
        camera.position.set(0.5, 24, 3.4);
        controls?.target.set(0.5, 0, 2.4);
        controls?.update();
      }),
      "hide ceiling": true,
      "copy routes": button(() => {
        const text = code();
        console.log(text);
        navigator.clipboard?.writeText(text).catch(() => {});
      }),
      "add point after selected": button(() => {
        const s = sel;
        if (!s) return;
        const pts = ROBOT_RUN[s.route];
        const a = pts[s.i];
        const b = pts[Math.min(s.i + 1, pts.length - 1)];
        const v = a === b ? a.clone().add(new THREE.Vector3(0.6, 0, 0)) : a.clone().lerp(b, 0.5);
        pts.splice(s.i + 1, 0, v);
        setSel({ route: s.route, i: s.i + 1 });
        changed();
      }),
      "delete selected": button(() => {
        const s = sel;
        if (!s) return;
        const pts = ROBOT_RUN[s.route];
        if (pts.length <= 2 || NAMED.has(pts[s.i])) return; // keep the shared start / vending stop
        pts.splice(s.i, 1);
        setSel(null);
        changed();
      }),
      "reset (back to config.ts)": button(() => {
        try {
          localStorage.removeItem(STORE);
        } catch {
          /* nothing stored */
        }
        window.location.reload();
      }),
    },
    { collapsed: false },
    [sel],
  );

  // cut the room off at 4.2 m (the ceiling is one mesh with the walls, the lamps hang low): the floor shows from above
  const gl = useThree((s) => s.gl);
  useEffect(() => clipAbove(gl, hideCeiling ? 4.2 : null), [hideCeiling, gl]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- `tick` is how a drag asks for new outlines
  const lines = useMemo(() => ROUTES.map((r) => ({ ...r, ...outline(ROBOT_RUN[r.key]) })), [tick]);
  const selected = sel ? ROBOT_RUN[sel.route][sel.i] : null;

  return (
    <group>
      {lines.map((l) => (
        <group key={l.key}>
          <Line points={l.mid} color={l.color} lineWidth={2.5} depthTest={false} />
          <Line points={l.left} color={l.color} lineWidth={1} transparent opacity={0.55} depthTest={false} />
          <Line points={l.right} color={l.color} lineWidth={1} transparent opacity={0.55} depthTest={false} />
          {ROBOT_RUN[l.key].map((v, i) => {
            const on = sel?.route === l.key && sel.i === i;
            return (
              <mesh
                key={i}
                position={[v.x, Y + 0.12, v.z]}
                renderOrder={10}
                onClick={(e) => {
                  e.stopPropagation();
                  setSel({ route: l.key, i });
                }}
              >
                <sphereGeometry args={[NAMED.has(v) ? 0.2 : 0.14, 16, 12]} />
                <meshBasicMaterial color={on ? "#ffffff" : l.color} depthTest={false} />
              </mesh>
            );
          })}
        </group>
      ))}
      {selected && (
        <>
          <mesh ref={setHandle} position={[selected.x, Y + 0.12, selected.z]} visible={false}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
          </mesh>
          {handle && (
            <TransformControls
              object={handle}
              mode="translate"
              showY={false}
              size={0.8}
              onObjectChange={() => {
                selected.set(handle.position.x, 0, handle.position.z);
                changed();
              }}
            />
          )}
        </>
      )}
    </group>
  );
}
