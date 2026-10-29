"use client";

import { useThree } from "@react-three/fiber";
import { button, useControls } from "leva";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { EDITOR_LIGHTS, EXPORT_NAMES } from "./config";
import { useLightControls } from "./controls";

/**
 * ?debug only: "Lights ↔ three.js editor". Downloads the room as it stands now (restaurant, kitchen, machines, robot)
 * with the four room lights of the Light panel as named lights, to open in threejs.org/editor (File → Import). Move /
 * aim / recolour the lights there, File → Export → GLB, then `npm run lights:import <file> -- --write` puts them into
 * the Light panel's defaults (controls.ts). Textures are capped at 1024 px, so the file stays a few tens of MB.
 */

type LightValues = ReturnType<typeof useLightControls>;

/** a directional / spot light aimed at `target`, with the target as its child at (0, 0, -1) as glTF expects */
function aimed<T extends THREE.DirectionalLight | THREE.SpotLight>(light: T, target: THREE.Vector3) {
  light.lookAt(target);
  light.add(light.target);
  light.target.position.set(0, 0, -1);
  return light;
}

function lightsFor(l: LightValues) {
  const group = new THREE.Group();
  group.name = "lights";
  const key = new THREE.DirectionalLight(l.keyColor, l.keyIntensity);
  key.position.fromArray(l.keyPos);
  aimed(key, new THREE.Vector3());
  key.name = EDITOR_LIGHTS.key;
  const fill = new THREE.DirectionalLight(l.fillColor, l.fillIntensity);
  fill.position.fromArray(l.fillPos);
  aimed(fill, new THREE.Vector3());
  fill.name = EDITOR_LIGHTS.fill;
  const point = new THREE.PointLight(l.pointColor, l.pointIntensity, l.pointDistance, 2);
  point.position.fromArray(l.pointPos);
  point.name = EDITOR_LIGHTS.point;
  const spot = new THREE.SpotLight(l.spotColor, l.spotIntensity, 0, l.spotAngle, l.spotPenumbra, 2);
  spot.position.fromArray(l.spotPos);
  aimed(spot, new THREE.Vector3().fromArray(l.spotTarget));
  spot.name = EDITOR_LIGHTS.spot;
  group.add(key, fill, point, spot);
  group.updateMatrixWorld(true);
  return group;
}

/** hides what shouldn't go into the file (hit boxes, the scene's own lights) for the export; returns the undo */
function hideExtras(roots: THREE.Object3D[]) {
  const hidden: THREE.Object3D[] = [];
  for (const r of roots)
    r.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | undefined;
      if (o.visible && ((o as THREE.Light).isLight || (m && !Array.isArray(m) && !m.visible))) hidden.push(o);
    });
  for (const o of hidden) o.visible = false;
  return () => hidden.forEach((o) => (o.visible = true));
}

async function exportForEditor(scene: THREE.Scene, l: LightValues) {
  const names = new Set<string>(Object.values(EXPORT_NAMES));
  const roots = scene.children.flatMap((c) => (names.has(c.name) ? [c] : c.children.filter((g) => names.has(g.name))));
  const lights = lightsFor(l);
  const restore = hideExtras(roots);
  try {
    const glb = (await new GLTFExporter().parseAsync([...roots, lights], {
      binary: true,
      onlyVisible: true,
      maxTextureSize: 1024,
    })) as ArrayBuffer;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([glb], { type: "model/gltf-binary" }));
    a.download = "cfoco-room-lights.glb";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
  } finally {
    restore();
  }
}

export function EditorExport() {
  const scene = useThree((s) => s.scene);
  const light = useLightControls();
  useControls(
    "Lights ↔ three.js editor",
    {
      "export room + lights (.glb)": button(() => {
        exportForEditor(scene, light).catch((e) => console.error("export for the three.js editor failed", e));
      }),
      "open threejs.org/editor": button(() => window.open("https://threejs.org/editor/", "_blank", "noopener")),
    },
    { collapsed: false },
    [scene, light],
  );
  return null;
}
