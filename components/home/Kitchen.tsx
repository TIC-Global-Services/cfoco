"use client";

import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import "@/lib/home/draco";
import { scrollState, smoothstep } from "@/lib/home/scroll";
import { sharpen } from "@/lib/home/textures";
import { EXPORT_NAMES, KITCHEN } from "./config";
import { useKitchenRigControls, useRoomControls } from "./controls";

const URL = "/models/new_kitchen_animate.glb";
/** scroll position (sections) from which the kitchen can be in frame */
const KITCHEN_SEEN_FROM = 4.0;


/**
 * The model's steel (hoods, fryers, prep station, shelving) has warm baked into its colour textures (its "LightGray"
 * averages a brown), so under the scene's neutral light it read as bronze. Its colour is pulled toward grey in the
 * shader (the texture's detail stays) and lifted a little: `amount` 0 = as authored, 1 = fully grey.
 */
const STEEL = { amount: { value: 0.85 }, lift: { value: 1.25 } };
const isSteel = (m: THREE.Material) =>
  /metal|alumin|steel|chrome|LightGray|GDLM504|Color B03|LavenderBlush/i.test(m.name) ||
  // untitled metals too, but not the scanned pieces with their own metalness maps (the fried chicken in the baskets)
  (((m as THREE.MeshStandardMaterial).metalness ?? 0) >= 0.5 && !(m as THREE.MeshStandardMaterial).metalnessMap);
function steel(m: THREE.Material) {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.steelAmount = STEEL.amount;
    sh.uniforms.steelLift = STEEL.lift;
    sh.fragmentShader = sh.fragmentShader
      .replace("void main() {", "uniform float steelAmount;\nuniform float steelLift;\nvoid main() {")
      .replace(
        "#include <map_fragment>",
        "#include <map_fragment>\n" +
          "diffuseColor.rgb = mix(diffuseColor.rgb, vec3(dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)) * steelLift), steelAmount);",
      );
  };
  m.customProgramCacheKey = () => "kitchen-steel";
}

/**
 * The room's shell: the floor, ceiling and four walls are single big planes with their own textures. Their colour is
 * a light, saturated ochre that under any light read as a bright orange box; the Blender look is a dark, low-key
 * room. Dimmed here, set from the rig (see lightKitchen).
 */
const FLOOR = "Material.040";
const SHELL = new Set(["Material.043", "Material.045", "Material.004", "Material.005", "Material.044"]);
/**
 * The prep station's three monitors: each picture is a quad lying exactly in the plane of its bezel's front face
 * (`_auto_1`, 0 mm apart), so the two fought over the depth buffer and the screen's edges shimmered in a sawtooth.
 * The picture is pulled toward the lens in depth only (polygon offset), and shown as a lit display (emissive) rather
 * than a print that depends on the room's light.
 */
const isScreen = (m: THREE.Material) => /^ChatGPT_Image/.test(m.name);
/**
 * The picture (1536 × 1024) is a menu board on a transparent margin, and the screens are opaque: the margin's hidden
 * colour (black) showed as a dark, smeared band round every screen. Only the board's own rectangle is mapped (pixels
 * 66–1470 across, 94–925 down, a few in from its edge; glTF uvs run top-down).
 */
const SCREEN_CROP = { u0: 66 / 1536, u1: 1470 / 1536, v0: 94 / 1024, v1: 925 / 1024 };
function screen(m: THREE.MeshStandardMaterial) {
  m.polygonOffset = true;
  m.polygonOffsetFactor = -1;
  m.polygonOffsetUnits = -4;
  if (m.map) {
    const t = m.map.clone();
    t.repeat.set(SCREEN_CROP.u1 - SCREEN_CROP.u0, SCREEN_CROP.v1 - SCREEN_CROP.v0);
    t.offset.set(SCREEN_CROP.u0, SCREEN_CROP.v0);
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    t.needsUpdate = true;
    m.map = t;
  }
  m.emissive.set("#ffffff");
  m.emissiveMap = m.map;
  m.color.set("#000000"); // its light is its own; only a faint glassy reflection on top
  m.roughness = 0.3;
  m.metalness = 0;
}

/**
 * One of the three monitors had its picture mapped mirror-wise (logo top right, columns reversed). Each triangle's uv
 * handedness (does u run the same way round the face as on the others?) is compared with the majority's, and the odd
 * ones out have u flipped. On a copy of the geometry: the loaded one is shared.
 */
function unmirror(mesh: THREE.Mesh) {
  const geo = mesh.geometry.clone();
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  if (!uv) return;
  const index = geo.index;
  const count = (index ? index.count : pos.count) / 3;
  const at = (i: number) => (index ? index.getX(i) : i);
  const [a, b, c, e1, e2, n] = [0, 0, 0, 0, 0, 0].map(() => new THREE.Vector3());
  const hand: number[] = [];
  for (let t = 0; t < count; t++) {
    const [i0, i1, i2] = [at(t * 3), at(t * 3 + 1), at(t * 3 + 2)];
    a.fromBufferAttribute(pos, i0);
    b.fromBufferAttribute(pos, i1);
    c.fromBufferAttribute(pos, i2);
    e1.subVectors(b, a);
    e2.subVectors(c, a);
    n.crossVectors(e1, e2);
    const du1 = uv.getX(i1) - uv.getX(i0);
    const dv1 = uv.getY(i1) - uv.getY(i0);
    const du2 = uv.getX(i2) - uv.getX(i0);
    const dv2 = uv.getY(i2) - uv.getY(i0);
    // sign of the uv-space winding against the face's: equal on faces mapped the same way round
    hand.push(Math.sign(du1 * dv2 - du2 * dv1));
  }
  const majority = Math.sign(hand.reduce((s, h) => s + h, 0));
  if (!majority) return;
  const flip = new Set<number>();
  hand.forEach((h, t) => {
    if (h === -majority) for (let k = 0; k < 3; k++) flip.add(at(t * 3 + k));
  });
  if (!flip.size) return;
  flip.forEach((i) => uv.setX(i, 1 - uv.getX(i)));
  uv.needsUpdate = true;
  mesh.geometry = geo;
}

type Rig = ReturnType<typeof useKitchenRigControls>;
type KitchenLights = { prep: THREE.SpotLight; fry: THREE.SpotLight; hood: THREE.SpotLight; hemi: THREE.HemisphereLight };
type Surfaces = {
  all: THREE.MeshStandardMaterial[];
  screens: THREE.MeshStandardMaterial[];
  shell: THREE.MeshStandardMaterial[];
  floor: THREE.MeshStandardMaterial[];
};
/** the kitchen's own lights, faded in only while the camera is in it (see Kitchen) */
function lightKitchen(lights: KitchenLights, surf: Surfaces, rig: Rig, p: number, scene: THREE.Scene) {
  const presence = smoothstep(KITCHEN.outFrom, KITCHEN.outTo, p) * (1 - smoothstep(KITCHEN.exitFrom, KITCHEN.exitTo, p));
  for (const s of [lights.prep, lights.fry, lights.hood]) {
    s.color.set(rig.overColor);
    s.angle = rig.overAngle;
  }
  lights.prep.intensity = rig.prepIntensity * presence;
  lights.fry.intensity = rig.fryIntensity * presence;
  lights.hood.intensity = rig.hoodIntensity * presence;
  lights.hemi.intensity = rig.kHemiIntensity * presence;
  lights.hemi.color.set(rig.kHemiSky);
  lights.hemi.groundColor.set(rig.kHemiGround);
  for (const m of surf.screens) m.emissiveIntensity = rig.screenGlow;

  // How much of the environment each surface takes. three only honours a material's envMapIntensity when the material
  // has its own envMap (with just scene.environment it uses scene.environmentIntensity for all), so the kitchen's
  // materials are handed the scene's map explicitly; until then every surface took the full environment and the room
  // read as one flat, evenly lit box. The equipment keeps enough to read as steel, the shell takes very little (the
  // Blender look is a dark, low-key room), the floor a little more than the walls (matte).
  const env = scene.environment;
  const k = scene.environmentIntensity;
  for (const m of surf.all) {
    if (m.envMap !== env) {
      m.envMap = env;
      m.needsUpdate = true;
    }
    m.envMapIntensity = rig.envIntensity * k;
  }
  for (const m of surf.shell) {
    m.color.setScalar(rig.wallTone);
    m.envMapIntensity = rig.wallEnv * k;
  }
  for (const m of surf.floor) {
    m.color.setScalar(rig.floorTone); // dark…
    m.roughness = rig.floorRough; // …and matte: multiplies its roughness map
    m.envMapIntensity = rig.floorEnv * k;
  }
}

/**
 * The kitchen, where it was built: on the restaurant's open side (see KITCHEN).
 * It always stands there; the camera goes over to it for its step and comes back.
 */
export function Kitchen() {
  const { scene, animations } = useGLTF(URL);
  const gl = useThree((s) => s.gl);
  const room = useRoomControls();
  const rig = useKitchenRigControls();
  // Lit like the rest of the room: its own materials under the scene's default lights and environment.
  // Two-sided: its walls are single planes, and from the restaurant's side they vanished (the way in showed black).
  // the surfaces the rig drives are gathered with the clone they belong to (one memo: a second run never mixes them)
  const { model, surf } = useMemo(() => {
    const surf: Surfaces = { all: [], screens: [], shell: [], floor: [] };
    const done = new Map<THREE.Material, THREE.Material>();
    const m = scene.clone(true);
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map((x) => {
        let c = done.get(x);
        if (!c) {
          c = x.clone();
          c.side = THREE.DoubleSide;
          if (isSteel(c)) steel(c);
          const std = c as THREE.MeshStandardMaterial;
          if (std.isMeshStandardMaterial) surf.all.push(std);
          if (isScreen(c)) {
            screen(std);
            surf.screens.push(std);
          }
          if (SHELL.has(c.name)) surf.shell.push(std);
          if (c.name === FLOOR) surf.floor.push(std);
          done.set(x, c);
        }
        return c;
      });
      mesh.material = Array.isArray(mesh.material) ? mats : mats[0];
      if (!Array.isArray(mesh.material) && isScreen(mesh.material)) unmirror(mesh);
    });
    sharpen(m, gl);
    return { model: m, surf };
  }, [scene, gl]);

  const holder = useRef<THREE.Group>(null);
  const three = useThree((s) => s.scene);
  // its own light: until now it had only the room's environment reflections (every direct light in the scene is off
  // by default), so it read flat and muddy, with nothing to shape the steel. Two overhead pools (the prep station on
  // the left, the fryer line on the right, as the camera looks) and a soft sky/ground fill, faded in only while the
  // camera is in the kitchen. Always mounted, at 0 when out of it: adding or removing a light recompiles every shader.
  const lights = useMemo(() => {
    const make = (x: number, z: number) => {
      const s = new THREE.SpotLight("#ffffff", 0, 0, 1, 1, 2);
      s.position.set(x, 4.9, z);
      s.target.position.set(x, 0, z + 0.8);
      return s;
    };
    const prep = make(5.2, -3.2);
    const fry = make(1.0, -3.6);
    const hood = make(3.0, -1.2); // under the small centre hood, washing the back wall
    const hemi = new THREE.HemisphereLight("#ffffff", "#000000", 0);
    return { prep, fry, hood, hemi };
  }, []);
  useFrame(() => lightKitchen(lights, surf, rig, scrollState.progress, three));

  useFrame(() => {
    // the camera only sees the kitchen from the wall pan on: before that none of its 26 MB is drawn (or animated)
    if (holder.current) holder.current.visible = scrollState.progress > KITCHEN_SEEN_FROM;
    STEEL.amount.value = rig.steelGrey;
    STEEL.lift.value = rig.steelLift;
  });

  // the model's own animation: plays once as the camera comes into the kitchen, then holds its last pose (no loop).
  // Scrolling back out of the kitchen rewinds it, so it plays again on the way back in
  const { actions } = useAnimations(animations, model);
  const playing = useRef(false);
  useEffect(() => {
    const all = Object.values(actions);
    all.forEach((a) => {
      if (!a) return;
      a.setLoop(THREE.LoopOnce, 1);
      a.clampWhenFinished = true;
      a.reset();
      a.paused = true; // shows its first pose until the camera arrives
      a.play();
    });
    playing.current = false;
    return () => all.forEach((a) => a?.stop());
  }, [actions]);
  useFrame(() => {
    const inKitchen = scrollState.progress >= KITCHEN.outTo - 0.15; // as the camera comes to rest on the authored view
    if (inKitchen === playing.current) return;
    playing.current = inKitchen;
    Object.values(actions).forEach((a) => {
      if (!a) return;
      a.reset();
      a.paused = !inKitchen;
      a.play();
    });
  });

  // the model is in its own frame: KITCHEN.origin / KITCHEN.turn put it in the room's, then the same placement as the room itself
  return (
    <group
      name={EXPORT_NAMES.kitchen}
      position={room.position}
      rotation={room.rotation.map((d) => THREE.MathUtils.degToRad(d)) as [number, number, number]}
      scale={room.scale}
    >
      <group ref={holder} position={KITCHEN.origin} rotation={[0, KITCHEN.turn, 0]}>
        <primitive object={model} />
      </group>
      {/* outside the holder: it is hidden until the wall pan, and a hidden light changes the light count (recompiles) */}
      <group position={KITCHEN.origin} rotation={[0, KITCHEN.turn, 0]}>
        <primitive object={lights.prep} />
        <primitive object={lights.prep.target} />
        <primitive object={lights.fry} />
        <primitive object={lights.fry.target} />
        <primitive object={lights.hood} />
        <primitive object={lights.hood.target} />
        <primitive object={lights.hemi} />
      </group>
    </group>
  );
}

useGLTF.preload(URL);
