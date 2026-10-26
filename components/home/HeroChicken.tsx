"use client";

import { useGLTF } from "@react-three/drei";
import { type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import "@/lib/home/draco";
import { normalizeByPrincipalAxes } from "@/lib/home/shape";
import { Spring, damp, robotRide, sampleTrack, scrollState, smoothstep } from "@/lib/home/scroll";
import { createStudioEnv } from "@/lib/home/studio";
import { portraitness } from "./CameraRig";
import {
  ANIM_FROM,
  ANIM_TO,
  BUCKET_HEIGHT,
  BUCKET_KEYS,
  BUCKET_YAW,
  CAMERA,
  CHICKEN_KEYS,
  CHICKEN_LAND_Y,
  CHICKEN_LENGTH,
  DROP_SIM,
  DROP_START,
  FADE_IN,
  HERO_HIDDEN,
  SWAP_FROM,
  SWAP_TO,
  TOSS_OUT,
  ROBOT_RUN,
  WALL,
  type Pose,
} from "./config";
import {
  useBucketControls,
  useChickenControls,
  useHeroControls,
  useHeroLightControls,
  useInteractionControls,
} from "./controls";

const RAW_URL = "/models/raw_chicken.glb";
const FRIED_URL = "/models/chicken_fried.glb";
const BUCKET_URL = "/models/bucket_drop.glb";

// ---------------------------------------------------------------------------
// Raw ⇄ fried swap. Both meshes carry the same dissolve field (a bottom-to-top
// sweep broken up by noise, evaluated in world space). The raw one keeps what
// is *above* the front and the fried one what is *below*, so together they
// always cover the silhouette exactly, with a hot edge glowing where they meet.
// ---------------------------------------------------------------------------

type Dissolve = {
  uMix: { value: number };
  uCenter: { value: THREE.Vector3 };
  uExtent: { value: number };
};

function applyDissolve(mat: THREE.MeshStandardMaterial, u: Dissolve, side: "raw" | "fried") {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWPos;")
      .replace(
        "#include <project_vertex>",
        "vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;\n#include <project_vertex>",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        varying vec3 vWPos;
        uniform float uMix;
        uniform vec3 uCenter;
        uniform float uExtent;
        float dHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        float dNoise(vec3 x) {
          vec3 i = floor(x), f = fract(x);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(mix(dHash(i), dHash(i + vec3(1,0,0)), f.x), mix(dHash(i + vec3(0,1,0)), dHash(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(dHash(i + vec3(0,0,1)), dHash(i + vec3(1,0,1)), f.x), mix(dHash(i + vec3(0,1,1)), dHash(i + vec3(1,1,1)), f.x), f.y),
            f.z);
        }
        float dField() {
          vec3 r = (vWPos - uCenter) / uExtent;
          float g = clamp(r.y * 0.9 + 0.5, 0.0, 1.0);
          float n = dNoise(r * 7.0) * 0.65 + dNoise(r * 19.0) * 0.35;
          return g * 0.6 + n * 0.4;
        }`,
      )
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
        float dEdge = 0.05;
        float dF = dField();
        float dT = mix(-dEdge, 1.0 + dEdge, uMix);
        ${side === "raw" ? "if (dF < dT) discard;" : "if (dF >= dT) discard;"}`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          float live = smoothstep(0.0, 0.04, uMix) * (1.0 - smoothstep(0.96, 1.0, uMix));
          float rim = 1.0 - smoothstep(0.0, dEdge, abs(dF - dT));
          totalEmissiveRadiance += vec3(1.0, 0.42, 0.08) * rim * live * 4.0;
        }`,
      );
  };
  mat.customProgramCacheKey = () => `dissolve-${side}`;
}

const lerpPose = (keys: Pose[], p: number) => {
  const [a, b, k] = sampleTrack(keys, p);
  return {
    x: a.x + (b.x - a.x) * k,
    y: a.y + (b.y - a.y) * k,
    d: a.d + (b.d - a.d) * k,
    s: a.s + (b.s - a.s) * k,
  };
};

const setCursor = (c: string) => {
  document.body.style.cursor = c;
};

// ---------------------------------------------------------------------------

export function HeroChicken() {
  const raw = useGLTF(RAW_URL);
  const fried = useGLTF(FRIED_URL);
  const bucketGltf = useGLTF(BUCKET_URL);
  const gl = useThree((s) => s.gl);

  const root = useRef<THREE.Group>(null);
  const hero = useHeroControls();
  const chickenC = useChickenControls();
  const bucketC = useBucketControls();
  const heroL = useHeroLightControls();
  const ix = useInteractionControls();
  const yaw = useRef(0);

  // hero-only studio reflections (the room keeps the scene environment)
  const studio = useMemo(() => createStudioEnv(gl), [gl]);
  useEffect(() => () => studio.dispose(), [studio]);

  // Everything below mutates the graph, so work on private clones —
  // the cached GLTFs stay pristine across StrictMode double-invokes and HMR.
  const rig = useMemo(() => {
    const dissolve: Dissolve = {
      uMix: { value: 0 },
      uCenter: { value: new THREE.Vector3() },
      uExtent: { value: CHICKEN_LENGTH },
    };

    const fadeMats: THREE.MeshStandardMaterial[] = [];
    const heroMats: THREE.MeshStandardMaterial[] = [];
    const bucketMats: THREE.MeshStandardMaterial[] = [];
    const maxAniso = gl.capabilities.getMaxAnisotropy();

    // --- raw chicken (morph-target animation) ---
    const rawModel = cloneSkinned(raw.scene);
    rawModel.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.frustumCulled = false; // morphed — bounds are unreliable
      const mat = (m.material as THREE.MeshStandardMaterial).clone();
      mat.transparent = true; // drawn in the transparent pass, like the bucket (see SceneText)
      mat.envMap = studio;
      applyDissolve(mat, dissolve, "raw");
      m.material = mat;
      fadeMats.push(mat);
    });
    const mixer = new THREE.AnimationMixer(rawModel);
    const actions = raw.animations.map((clip) => {
      const a = mixer.clipAction(clip);
      a.setLoop(THREE.LoopOnce, 1);
      a.clampWhenFinished = true;
      a.play();
      return a;
    });
    const rawNorm = normalizeByPrincipalAxes(rawModel, CHICKEN_LENGTH);

    // --- fried chicken (same pose, length and centre as the raw one) ---
    const friedModel = fried.scene.clone(true);
    friedModel.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.frustumCulled = false;
      const mat = (m.material as THREE.MeshStandardMaterial).clone();
      mat.transparent = true;
      mat.envMap = studio;
      applyDissolve(mat, dissolve, "fried");
      m.material = mat;
      fadeMats.push(mat);
    });
    const friedNorm = normalizeByPrincipalAxes(friedModel, CHICKEN_LENGTH);
    heroMats.push(...fadeMats);

    // shared orientation: chicken stands upright, spun around world-up
    const spin = new THREE.Group();
    const tilt = new THREE.Group();
    tilt.rotation.set(-0.08, 0, -1.48); // long axis upright (bone end down), a hair off-vertical
    const fix = new THREE.Group(); // user rotation / scale from the panel
    fix.add(rawNorm.object, friedNorm.object);
    tilt.add(fix);
    spin.add(tilt);

    // --- bucket + its pile of fried pieces (base-centre at origin, BUCKET_HEIGHT tall) ---
    const bucketModel = bucketGltf.scene.clone(true);
    bucketModel.updateMatrixWorld(true);
    // sized by the cup alone — the falling piece starts far above it
    const cup = bucketModel.getObjectByName("Circle")!;
    const box = new THREE.Box3().setFromObject(cup);
    const bucketScale = BUCKET_HEIGHT / (box.max.y - box.min.y);
    const bucketRadius = (Math.max(box.max.x - box.min.x, box.max.z - box.min.z) / 2) * bucketScale;
    bucketModel.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
    const pileMats: THREE.MeshStandardMaterial[] = [];
    bucketModel.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const src = m.material as THREE.MeshStandardMaterial;
      let mat: THREE.MeshStandardMaterial;
      if (m.name === "Circle" || m.name === "Circle002") {
        // printed cup (Circle) and its rolled rim (Circle002, untextured; the loader strips the dots from node names): glossy coated
        // cardboard — a clearcoat catches the studio strips as crisp highlights
        const band = m.name === "Circle";
        mat = new THREE.MeshPhysicalMaterial({
          name: src.name,
          map: band ? src.map : null,
          color: band ? "#ffffff" : "#f4efe6",
          roughness: band ? 0.42 : 0.5,
          metalness: 0,
          clearcoat: 0.8,
          clearcoatRoughness: 0.18,
          side: THREE.DoubleSide,
        });
        if (band && src.map) {
          src.map.anisotropy = maxAniso; // keeps the logo sharp at grazing angles
          src.map.needsUpdate = true;
        }
        bucketMats.push(mat);
      } else {
        // fried pieces: lit like the hero
        mat = src.clone();
        pileMats.push(mat);
      }
      mat.envMap = studio;
      // drawn in the transparent pass (still fully opaque) so it lands after the 3D copy,
      // which sits behind the hero and draws over the room (see SceneText)
      mat.transparent = true;
      m.material = mat;
    });
    heroMats.push(...pileMats);
    // the baked drop: every piece's clip, scrubbed by hand (see DROP_SIM)
    const dropMixer = new THREE.AnimationMixer(bucketModel);
    const dropActions = bucketGltf.animations.map((clip) => {
      const a = dropMixer.clipAction(clip);
      a.setLoop(THREE.LoopOnce, 1);
      a.clampWhenFinished = true;
      a.play();
      return a;
    });
    const faller = bucketModel.getObjectByName("fried011")!;
    const scaled = new THREE.Group();
    scaled.scale.setScalar(bucketScale);
    scaled.add(bucketModel);
    const bucket = new THREE.Group();
    bucket.add(scaled);

    return {
      dissolve,
      mixer,
      actions,
      rawObj: rawNorm.object,
      friedObj: friedNorm.object,
      spin,
      fix,
      bucket,
      bucketFix: scaled,
      bucketScale,
      bucketRadius,
      fadeMats,
      heroMats,
      bucketMats,
      dropMixer,
      dropActions,
      faller,
    };
  }, [raw, fried, bucketGltf, studio, gl]);

  // Studio rig that travels with the hero. Always mounted (intensity 0 when
  // unused) so the light count never changes and nothing recompiles mid-scroll.
  const lights = useMemo(() => {
    const key = new THREE.SpotLight("#ffffff", 0, 10, 0.6, 1, 2);
    const rim = new THREE.SpotLight("#ffffff", 0, 9, 0.42, 0.9, 2);
    const cursor = new THREE.PointLight("#ffffff", 0, 5, 2);
    const glow = new THREE.PointLight("#ff7a1f", 0, 7, 2);
    const bucketKey = new THREE.SpotLight("#ffffff", 0, 12, 0.5, 0.8, 2);
    const group = new THREE.Group();
    group.add(key, key.target, rim, rim.target, cursor, glow, bucketKey, bucketKey.target);
    return { group, key, rim, cursor, glow, bucketKey };
  }, []);

  // pointer interaction state (mutated by events and the frame loop, never rendered)
  const it = useMemo(
    () => ({
      hover: false,
      bucketHover: false,
      dragging: false,
      lastX: 0,
      lastY: 0,
      dragDX: 0,
      dragDY: 0,
      pitchTarget: 0,
      yaw: 0,
      yawVel: 0,
      prevP: -1,
      prevX: NaN,
      prevY: NaN,
      hoverS: new Spring(),
      pitch: new Spring(),
      leanX: new Spring(),
      leanZ: new Spring(),
      stretch: new Spring(),
      squash: new Spring(),
      hop: new Spring(),
      spinBoost: new Spring(),
      bucketWobble: new Spring(),
      bucketDip: new Spring(),
      bucketHoverS: new Spring(),
      simT: NaN, // drop clip time
    }),
    [],
  );

  // drag-to-spin lives on window so it keeps tracking outside the chicken
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!it.dragging) return;
      it.dragDX += e.clientX - it.lastX;
      it.dragDY += e.clientY - it.lastY;
      it.lastX = e.clientX;
      it.lastY = e.clientY;
    };
    const up = () => {
      if (!it.dragging) return;
      it.dragging = false;
      it.pitchTarget = 0;
      document.body.style.userSelect = "";
      setCursor(it.hover ? "grab" : "");
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      setCursor("");
    };
  }, [it]);

  const chickenFree = () => scrollState.progress < DROP_START && scrollState.progress > FADE_IN * 0.4;
  const inBucket = () => scrollState.progress >= TOSS_OUT && scrollState.progress < BUCKET_KEYS[2].p + 0.2;

  const chickenEvents = {
    onPointerOver: () => {
      if (!chickenFree()) return;
      it.hover = true;
      if (!it.dragging) setCursor("grab");
    },
    onPointerOut: () => {
      it.hover = false;
      if (!it.dragging) setCursor("");
    },
    onPointerDown: (e: ThreeEvent<PointerEvent>) => {
      if (!chickenFree() || e.pointerType === "touch") return;
      e.stopPropagation();
      it.dragging = true;
      it.lastX = e.nativeEvent.clientX;
      it.lastY = e.nativeEvent.clientY;
      document.body.style.userSelect = "none";
      setCursor("grabbing");
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      if (e.delta > 6) return; // that was a drag
      if (chickenFree()) {
        // a flick: spin + hop + squash
        it.yawVel += 10 * (Math.random() < 0.5 ? -1 : 1);
        it.hop.kick(2.2);
        it.squash.kick(-5);
      } else if (inBucket()) {
        it.bucketDip.kick(-1.4);
        it.bucketWobble.kick((Math.random() - 0.5) * 4);
      }
    },
  };

  const bucketEvents = {
    onPointerOver: () => {
      if (scrollState.progress < BUCKET_KEYS[0].p + 0.4 || scrollState.progress > BUCKET_KEYS[3].p - 0.2) return;
      it.bucketHover = true;
      it.bucketWobble.kick(1.6 * (Math.random() < 0.5 ? -1 : 1));
      setCursor("pointer");
    },
    onPointerOut: () => {
      it.bucketHover = false;
      if (!it.dragging) setCursor("");
    },
    onClick: chickenEvents.onClick,
  };

  const tmp = useMemo(
    () => ({
      camQuat: new THREE.Quaternion(),
      camMat: new THREE.Matrix4(),
      up: new THREE.Vector3(0, 1, 0),
      right: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      back: new THREE.Vector3(),
      camUp: new THREE.Vector3(),
      pos: new THREE.Vector3(),
      ray: new THREE.Vector3(),
      pointer: new THREE.Vector2(),
      cursor: new THREE.Vector2(),
      yawQ: new THREE.Quaternion(),
      leanQ: new THREE.Quaternion(),
      lightC: new THREE.Vector3(),
      // the bucket's own frame (the lens frame, turning toward the wall's view as it travels there)
      wallQuat: new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(WALL.eye, WALL.target, new THREE.Vector3(0, 1, 0))),
      baseQuat: new THREE.Quaternion(),
      spinQ: new THREE.Quaternion(),
      wallPos: new THREE.Vector3(),
      lr: new THREE.Vector3(),
      lu: new THREE.Vector3(),
      lb: new THREE.Vector3(),
      lf: new THREE.Vector3(),
    }),
    [],
  );

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 20);
    const p = scrollState.progress;
    const t = state.clock.elapsedTime;
    const motion = scrollState.reducedMotion ? 0 : 1;
    const group = root.current;
    if (!group) return;

    group.visible = !HERO_HIDDEN.some(([a, b]) => p > a && p < b);
    if (!group.visible) {
      lights.key.intensity = lights.rim.intensity = lights.cursor.intensity = lights.glow.intensity = lights.bucketKey.intensity = 0;
      return;
    }

    // camera frame (the hero is solved against the authored CAMERA pose, not the
    // parallax-orbiting real camera, so it stays put in the world)
    const cam = state.camera as THREE.PerspectiveCamera;
    tmp.camQuat.setFromRotationMatrix(tmp.camMat.lookAt(CAMERA.position, CAMERA.target, tmp.up));
    tmp.right.set(1, 0, 0).applyQuaternion(tmp.camQuat);
    tmp.camUp.set(0, 1, 0).applyQuaternion(tmp.camQuat);
    tmp.fwd.set(0, 0, -1).applyQuaternion(tmp.camQuat);
    tmp.back.copy(tmp.fwd).negate();
    // other lenses (portrait phones): scale layout + size so the composition holds
    const k = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) / Math.tan(THREE.MathUtils.degToRad(CAMERA.fov / 2));
    // …but that sizes by height: on a phone the (wide) bucket would overflow the width — shrink it there
    const portrait = portraitness(state.size.width / state.size.height);
    const fit = 1 - 0.42 * portrait;

    const deg = THREE.MathUtils.degToRad;
    const place = (obj: THREE.Object3D, x: number, y: number, d: number, s: number, off: number[]) => {
      tmp.pos
        .copy(CAMERA.position)
        .addScaledVector(tmp.right, (x + off[0] + hero.offset[0]) * k)
        .addScaledVector(tmp.camUp, (y + off[1] + hero.offset[1]) * k)
        .addScaledVector(tmp.fwd, d - off[2] - hero.offset[2]);
      obj.position.copy(tmp.pos);
      obj.scale.setScalar(s * k * hero.scale);
    };

    // pointer: gentle drift of the subject (the room stays locked)
    tmp.pointer.x = damp(tmp.pointer.x, scrollState.pointer.x, 3, delta);
    tmp.pointer.y = damp(tmp.pointer.y, scrollState.pointer.y, 3, delta);
    tmp.cursor.x = damp(tmp.cursor.x, scrollState.pointer.x, 12, delta);
    tmp.cursor.y = damp(tmp.cursor.y, scrollState.pointer.y, 12, delta);
    const drift = hero.parallax;

    // ---- the drop: plays in real time once the chicken lets go (it falls; the pile jostles on impact), rewinds when scrolled back ----
    const simTarget = p >= DROP_START ? DROP_SIM.settle : DROP_SIM.from;
    const prevSim = it.simT;
    if (Number.isNaN(it.simT)) it.simT = simTarget; // (re)load mid-page: no replay
    else if (it.simT < simTarget) it.simT = Math.min(simTarget, it.simT + delta);
    else it.simT = Math.max(simTarget, it.simT - delta * 3);
    if (it.simT !== prevSim) {
      for (const a of rig.dropActions) a.time = it.simT;
      rig.dropMixer.update(0);
    }
    rig.faller.visible = false; // the hero chicken is the piece that falls
    const falling = it.simT > prevSim && it.simT < DROP_SIM.impact;
    scrollState.dropFall = falling ? THREE.MathUtils.clamp((it.simT - (DROP_SIM.impact - 0.35)) / 0.35, 0, 1) : 0;
    // landing: the bucket takes the hit
    if (prevSim < DROP_SIM.impact && it.simT >= DROP_SIM.impact) {
      scrollState.dropHits++;
      it.bucketDip.kick(-2.2);
      it.bucketWobble.kick((Math.random() - 0.5) * 3);
    }
    it.prevP = p;
    const dip = it.bucketDip.step(0, delta, 170, 0.32);
    const wob = it.bucketWobble.step(0, delta, 70, 0.14);
    const bucketHover = it.bucketHoverS.step(it.bucketHover ? 1 : 0, delta, 120, 0.6);

    // ---- bucket ----
    const b = lerpPose(BUCKET_KEYS, p);
    // only drawn while it can be in frame
    rig.bucket.visible = p > BUCKET_KEYS[0].p && p < BUCKET_KEYS[BUCKET_KEYS.length - 1].p;
    // smaller, but with its rim kept where it was (base raised by what the cup lost)
    place(rig.bucket, b.x, b.y + BUCKET_HEIGHT * b.s * (1 - fit) + dip * 0.12, b.d, b.s * fit, bucketC.offset);
    // …then, once the chicken is in, it travels to the ordering wall (world space) and stands in front of the middle kiosk,
    // turned to the camera's view of the wall; then it slips into that kiosk's screen, shrinking (see WALL)
    const wb = smoothstep(WALL.panFrom + 0.05, WALL.panTo, p);
    rig.bucket.quaternion.copy(tmp.camQuat);
    if (wb > 0) {
      tmp.wallPos.copy(WALL.bucket);
      tmp.wallPos.y += Math.sin(Math.PI * wb) * 0.35; // a little hop on the way
      rig.bucket.position.lerp(tmp.wallPos, wb);
      rig.bucket.scale.multiplyScalar(1 - 0.38 * wb); // smaller beside the kiosks (they stand ≈2 m)
      rig.bucket.quaternion.slerp(tmp.wallQuat, wb);
      // then the robot slides up beside it and takes it on its tray (see ROBOT_RUN): it hops over and rides along
      const load = smoothstep(ROBOT_RUN.loadFrom, ROBOT_RUN.loadTo, p);
      if (load > 0 && robotRide.ready) {
        tmp.wallPos.copy(robotRide.tray);
        tmp.wallPos.y += Math.sin(Math.PI * load) * 0.2; // lifted straight over and set down
        rig.bucket.position.lerp(tmp.wallPos, load);
        rig.bucket.scale.multiplyScalar(1 + (ROBOT_RUN.bucketScale - 1) * load);
        rig.bucket.quaternion.multiply(tmp.spinQ.setFromAxisAngle(tmp.up, load * Math.PI * 2)); // turns once on the way
      }
    }
    tmp.baseQuat.copy(rig.bucket.quaternion);
    tmp.lr.set(1, 0, 0).applyQuaternion(tmp.baseQuat);
    tmp.lu.set(0, 1, 0).applyQuaternion(tmp.baseQuat);
    tmp.lf.set(0, 0, -1).applyQuaternion(tmp.baseQuat);
    tmp.lb.copy(tmp.lf).negate();
    // pivots on its base: wobble rolls it on screen, the cursor tips it toward you
    rig.bucket.rotateZ(wob * 0.06 - tmp.pointer.x * 0.04 * ix.lean);
    rig.bucket.rotateX(tmp.pointer.y * 0.035 * ix.lean + bucketHover * 0.03);
    rig.bucket.rotateY(BUCKET_YAW + tmp.pointer.x * 0.25 * drift);
    const bs = rig.bucketScale * bucketC.scale;
    rig.bucketFix.scale.set(bs * (1 - dip * 0.035), bs * (1 + dip * 0.07), bs * (1 - dip * 0.035));
    rig.bucketFix.rotation.set(deg(bucketC.rotation[0]), deg(bucketC.rotation[1]), deg(bucketC.rotation[2]));

    // ---- chicken ----
    const free = lerpPose(CHICKEN_KEYS, p);
    const hop = it.hop.step(0, delta, 55, 0.28);
    const idle = (Math.sin(t * 0.9) * 0.025 + Math.sin(t * 1.7 + 1.3) * 0.01) * motion;
    const cx = free.x + tmp.pointer.x * 0.1 * drift;
    // gravity: the chicken falls from its hover into the cup, landing exactly when the pile is hit
    const fall = THREE.MathUtils.clamp((it.simT - DROP_SIM.from) / (DROP_SIM.impact - DROP_SIM.from), 0, 1);
    const cy = free.y + (CHICKEN_LAND_Y - free.y) * fall * fall + tmp.pointer.y * 0.06 * drift + idle + hop * 0.08;
    const cd = free.d;
    const cs = free.s;

    // the opening: rises from below the frame (see CHICKEN_KEYS) and turns into place as you start scrolling
    const fade = smoothstep(0, FADE_IN, p);
    const hoverAmt = it.hoverS.step((it.hover && p < DROP_START) || it.dragging ? 1 : 0, delta, 140, 0.45);
    const grow = 1 + (ix.hoverScale - 1) * hoverAmt;
    // a touch smaller on phones, so it clears the title above and the copy below
    place(rig.spin, cx, cy, cd, cs * grow * (1 - 0.15 * portrait), chickenC.offset);

    // squash & stretch: stretch along the fall, squash on impact
    const vy = Number.isNaN(it.prevY) ? 0 : (cy - it.prevY) / Math.max(delta, 1e-3);
    const vx = Number.isNaN(it.prevX) ? 0 : (cx - it.prevX) / Math.max(delta, 1e-3);
    it.prevY = cy;
    it.prevX = cx;
    const stretch = it.stretch.step(THREE.MathUtils.clamp(-vy * 0.05, -0.06, 0.22) * motion, delta, 200, 0.7);
    const squash = it.squash.step(0, delta, 260, 0.22);
    const sy = Math.max(0.6, 1 + stretch + squash * 0.07);
    const sxz = 1 / Math.sqrt(sy);
    rig.spin.scale.set(rig.spin.scale.x * sxz, rig.spin.scale.y * sy, rig.spin.scale.z * sxz);

    // ---- yaw: authored spin + scroll momentum + drag/flick ----
    const dragging = it.dragging && chickenFree();
    if (p < DROP_START) {
      yaw.current += delta * 0.35 * motion;
      const boost = it.spinBoost.step(THREE.MathUtils.clamp(scrollState.velocity * 0.04, -2.5, 2.5) * motion, delta, 30, 0.9);
      const dyaw = it.dragDX * 0.0105 * ix.dragSpeed;
      if (dragging) {
        it.yaw += dyaw;
        it.yawVel = damp(it.yawVel, dyaw / Math.max(delta, 1e-3), 18, delta); // carried into the release
        it.pitchTarget = THREE.MathUtils.clamp(it.pitchTarget + it.dragDY * 0.006 * ix.dragSpeed, -0.55, 0.55);
      } else {
        it.yaw += (it.yawVel + boost) * delta;
        it.yawVel *= Math.exp(-delta * 1.8); // inertia
      }
    } else {
      it.yawVel = 0; // let go: the orientation freezes as it falls
    }
    it.dragDX = it.dragDY = 0;

    rig.spin.visible = fade > 0.002 && it.simT < DROP_SIM.impact;
    tmp.yawQ.setFromAxisAngle(tmp.up, yaw.current + it.yaw + Math.min(p, DROP_START) * 1.6 + deg(hero.spin) - (1 - fade) * 2.2);

    // lean: toward the cursor, into the path's motion (banking), idle sway, drag pitch
    const pitch = it.pitch.step(dragging ? it.pitchTarget : 0, delta, 90, 0.42);
    const leanPitch = it.leanX.step(
      -tmp.pointer.y * 0.12 * ix.lean + Math.sin(t * 0.53) * 0.025 * motion,
      delta,
      60,
      0.5,
    );
    const leanRoll = it.leanZ.step(
      -tmp.pointer.x * 0.14 * ix.lean + THREE.MathUtils.clamp(vx * 0.35, -0.35, 0.35) + Math.sin(t * 0.7) * 0.035 * motion,
      delta,
      60,
      0.5,
    );
    tmp.leanQ.setFromAxisAngle(tmp.back, leanRoll);
    rig.spin.quaternion.copy(tmp.leanQ);
    tmp.leanQ.setFromAxisAngle(tmp.right, leanPitch + pitch);
    rig.spin.quaternion.multiply(tmp.leanQ).multiply(tmp.yawQ);
    rig.fix.rotation.set(deg(chickenC.rotation[0]), deg(chickenC.rotation[1]), deg(chickenC.rotation[2]));
    rig.fix.scale.setScalar(chickenC.scale);

    // ---- raw → fried ----
    const mix = smoothstep(SWAP_FROM, SWAP_TO, p);
    rig.dissolve.uMix.value = mix;
    rig.dissolve.uCenter.value.copy(rig.spin.position);
    rig.dissolve.uExtent.value = CHICKEN_LENGTH * rig.spin.scale.x;
    rig.rawObj.visible = mix < 1;
    rig.friedObj.visible = mix > 0;

    // authored animation, scrubbed by scroll (only while the raw one is visible)
    if (rig.rawObj.visible) {
      const a = THREE.MathUtils.clamp((p - ANIM_FROM) / (ANIM_TO - ANIM_FROM), 0, 1);
      for (const action of rig.actions) {
        const clip = action.getClip();
        const first = clip.tracks.reduce((m, tr) => Math.min(m, tr.times[0]), Infinity);
        action.paused = false;
        action.enabled = true;
        action.time = Math.min(first + a * (clip.duration - first), clip.duration - 1e-4);
      }
      rig.mixer.update(0);
    }

    // ---- lights ----
    for (const m of rig.heroMats) m.envMapIntensity = heroL.envIntensity;
    for (const m of rig.bucketMats) {
      m.envMapIntensity = heroL.bucketEnv;
      if ((m as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial) (m as THREE.MeshPhysicalMaterial).clearcoat = heroL.bucketGloss;
    }
    // only lit while there is a hero in frame (no light pools on an empty floor)
    const presence = fade * (1 - smoothstep(BUCKET_KEYS[3].p - 0.35, HERO_HIDDEN[0][0], p));
    const S = k * hero.scale; // rig scales with the hero
    // the rig follows the chicken, then settles on the pile once it is tossed
    const bh = BUCKET_HEIGHT * b.s * fit * bucketC.scale * S;
    const c = tmp.lightC
      .copy(rig.bucket.position)
      .addScaledVector(tmp.lu, bh * 1.05)
      .lerp(rig.spin.position, 1 - smoothstep(DROP_START, TOSS_OUT, p));

    lights.key.position.copy(c).addScaledVector(tmp.lr, -2.2 * S).addScaledVector(tmp.lu, 2.4 * S).addScaledVector(tmp.lb, 2.6 * S);
    lights.key.target.position.copy(c);
    lights.key.color.set(heroL.keyColor);
    lights.key.intensity = heroL.keyIntensity * presence;

    lights.rim.position.copy(c).addScaledVector(tmp.lr, 2.0 * S).addScaledVector(tmp.lu, 1.8 * S).addScaledVector(tmp.lf, 2.4 * S);
    lights.rim.target.position.copy(c);
    lights.rim.color.set(heroL.rimColor);
    lights.rim.intensity = heroL.rimIntensity * presence;

    // cursor light: rides the pointer ray, a little in front of the chicken
    tmp.ray.set(tmp.cursor.x, tmp.cursor.y, 0.5).unproject(cam).sub(cam.position).normalize();
    const along = Math.max(0.5, cd - 1.3) / Math.max(0.2, tmp.ray.dot(tmp.fwd));
    lights.cursor.position.copy(cam.position).addScaledVector(tmp.ray, along);
    lights.cursor.visible = heroL.cursorIntensity > 0; // an unlit light still costs every pixel's shader a loop
    lights.cursor.color.set(heroL.cursorColor);
    lights.cursor.intensity =
      heroL.cursorIntensity * presence * (scrollState.hasPointer ? 1 : 0.5) * (1 + (heroL.cursorHoverBoost - 1) * Math.max(hoverAmt, bucketHover));

    // the fryer flash: a hot orange glow from behind that peaks mid-swap — backlights
    // the chicken and spills onto the room around it
    lights.glow.position.copy(c).addScaledVector(tmp.fwd, 0.7 * S).addScaledVector(tmp.camUp, -0.3 * S);
    // bucket key: from the camera side, above and right, aimed at the printed band
    const bucketIn = smoothstep(BUCKET_KEYS[0].p, BUCKET_KEYS[1].p, p) * (1 - smoothstep(BUCKET_KEYS[2].p, BUCKET_KEYS[3].p, p));
    tmp.pos.copy(rig.bucket.position).addScaledVector(tmp.lu, bh * 0.55);
    lights.bucketKey.target.position.copy(tmp.pos);
    lights.bucketKey.position.copy(tmp.pos).addScaledVector(tmp.lr, 1.6 * S).addScaledVector(tmp.lu, 2.2 * S).addScaledVector(tmp.lb, 3.2 * S);
    lights.bucketKey.color.set(heroL.bucketKeyColor);
    lights.bucketKey.intensity = heroL.bucketKeyIntensity * bucketIn;

    lights.glow.intensity = heroL.fryGlow * Math.pow(Math.sin(Math.PI * mix), 1.5) * (0.85 + 0.15 * Math.sin(t * 23));
  });

  const r = rig.bucketRadius;
  return (
    <>
      <primitive object={lights.group} />
      <group ref={root}>
        <primitive object={rig.bucket}>
          {/* invisible hit areas — cheap to raycast, unlike the real meshes */}
          <mesh position={[0, BUCKET_HEIGHT / 2, 0]} {...bucketEvents}>
            <cylinderGeometry args={[r * 0.95, r * 0.8, BUCKET_HEIGHT, 16]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        </primitive>
        <primitive object={rig.spin}>
          <mesh {...chickenEvents}>
            <capsuleGeometry args={[CHICKEN_LENGTH * 0.24, CHICKEN_LENGTH * 0.52, 4, 12]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        </primitive>
      </group>
    </>
  );
}

useGLTF.preload(RAW_URL);
useGLTF.preload(FRIED_URL);
useGLTF.preload(BUCKET_URL);
