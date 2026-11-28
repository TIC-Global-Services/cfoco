"use client";

import { type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useModel, preloadModel } from "@/lib/home/models";
import { sharpen } from "@/lib/home/textures";
import { Spring, clamp, damp, easeInBack, easeInOutOvershoot, easeOutCubic, scrollState, smoothstep, soundApi } from "@/lib/home/scroll";
import { createStudioEnv } from "@/lib/home/studio";
import { portraitness } from "./CameraRig";
import { useMachineLightControls } from "./controls";
import { BUCKET_URL, BUCKET_YAW, CAMERA, DROP_SIM, EXPORT_NAMES, KIOSK_URL, type RisingMachine } from "./config";

/** a soft dark blob, fading to nothing at the edge */
/**
 * The bucket's picture, on white, swapped in for the centre kiosk's screen image (base colour and emissive: both are the
 * model's 1080 × 1350 "screen" texture, of which the glass uses only this rectangle of its uv space) once the 3D bucket has
 * gone into the machine. It is the same bucket: the 3D one (bucket_drop_new.glb, its pile settled), rendered once,
 * standing straight up with its logo to the front (see paintBucket).
 */
const SCREEN_UV = { u0: 0.1914, u1: 0.7808, v0: 0.1471, v1: 0.8621 };
const flatCanvas = document.createElement("canvas");
flatCanvas.width = 1080;
flatCanvas.height = 1350;
const flatTex = (() => {
  const g = flatCanvas.getContext("2d")!;
  g.fillStyle = "#fff";
  g.fillRect(0, 0, flatCanvas.width, flatCanvas.height);
  const t = new THREE.CanvasTexture(flatCanvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.flipY = false; // glTF uv convention, like the screen's own image
  t.anisotropy = 8;
  return t;
})();
let bucketPainted = false;

/** renders the 3D bucket (settled, upright, logo to the front) into the screen picture; once per page */
function paintBucket(gl: THREE.WebGLRenderer, gltf: { scene: THREE.Object3D; animations: THREE.AnimationClip[] }, env: THREE.Texture) {
  if (bucketPainted) return;
  bucketPainted = true;

  const rw = (SCREEN_UV.u1 - SCREEN_UV.u0) * flatCanvas.width;
  const rh = (SCREEN_UV.v1 - SCREEN_UV.v0) * flatCanvas.height;
  const SS = 2; // rendered at twice the size and scaled down: smooth edges without a multisampled target
  const W = Math.round(rw * SS);
  const H = Math.round(rh * SS);

  // the bucket with its pile as it lies once the drop has settled
  const model = gltf.scene.clone(true);
  const mixer = new THREE.AnimationMixer(model);
  for (const clip of gltf.animations) {
    const a = mixer.clipAction(clip);
    a.setLoop(THREE.LoopOnce, 1);
    a.clampWhenFinished = true;
    a.play();
  }
  mixer.setTime(DROP_SIM.settle);
  const spin = new THREE.Group();
  spin.rotation.y = BUCKET_YAW; // the printed logo to the lens, as in the hero
  spin.add(model);
  model.updateMatrixWorld(true);
  const c = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
  model.position.set(-c.x, 0, -c.z); // stood on its own axis, straight up
  spin.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(spin);
  const size = box.getSize(new THREE.Vector3());
  const mid = box.getCenter(new THREE.Vector3());

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#ffffff");
  scene.environment = env;
  scene.environmentIntensity = 0.9;
  const key = new THREE.DirectionalLight("#fff4e6", 2.2);
  key.position.set(2, 3, 4);
  const fill = new THREE.DirectionalLight("#ffffff", 0.8);
  fill.position.set(-3, 1, 2);
  scene.add(spin, key, fill);

  // straight on, a long lens (little perspective), the whole bucket filling most of the screen rectangle
  const cam = new THREE.PerspectiveCamera(18, W / H, 0.1, 200);
  const half = THREE.MathUtils.degToRad(cam.fov / 2);
  const fitH = size.y / 0.8 / 2 / Math.tan(half);
  const fitW = size.x / 1.0 / 2 / (Math.tan(half) * cam.aspect);
  cam.position.set(mid.x, mid.y, mid.z + size.z / 2 + Math.max(fitH, fitW));
  cam.lookAt(mid);

  const rt = new THREE.WebGLRenderTarget(W, H);
  rt.texture.colorSpace = THREE.SRGBColorSpace;
  const prev = gl.getRenderTarget();
  gl.setRenderTarget(rt);
  gl.render(scene, cam);
  const px = new Uint8Array(W * H * 4);
  gl.readRenderTargetPixels(rt, 0, 0, W, H, px);
  gl.setRenderTarget(prev);
  rt.dispose();

  // gl rows run bottom-up; the canvas top-down
  const shot = document.createElement("canvas");
  shot.width = W;
  shot.height = H;
  const img = new ImageData(W, H);
  const row = W * 4;
  for (let y = 0; y < H; y++) img.data.set(px.subarray((H - 1 - y) * row, (H - y) * row), y * row);
  shot.getContext("2d")!.putImageData(img, 0, 0);

  const g = flatCanvas.getContext("2d")!;
  g.imageSmoothingQuality = "high";
  g.drawImage(shot, SCREEN_UV.u0 * flatCanvas.width, SCREEN_UV.v0 * flatCanvas.height, rw, rh);
  flatTex.needsUpdate = true;
}

export function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(0,0,0,1)");
  grad.addColorStop(0.5, "rgba(0,0,0,0.55)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

const setCursor = (c: string) => {
  document.body.style.cursor = c;
};

/**
 * Machines that rise into frame from below (the ordering kiosks, then the
 * vending machine — see config). Each comes up spinning round to face you,
 * overshooting and settling with a little squash, and its screen boots up once
 * it lands. While they stand they float and sway, lean toward the cursor, lift
 * on hover and spin on a click. Lit like the hero (its studio reflections plus
 * a key/rim pair that follows the centre one).
 *
 * `height`: on-screen height in metres; `facing`: turns the model's front to the lens;
 * `lit`: brings its own key/rim pair (off for pieces another set already lights);
 * `clips`: plays the model's own animation while hovered, finishing the cycle after;
 * `phoneFit`: how much smaller it gets on a tall phone (default: more for a row of several);
 * `world`: x / y / d are room coordinates (metres, y up from the floor) instead of lens-relative — the
 * machines stand in the room and the camera comes to them (see WALL). They rise out of the floor with the
 * intro (`from` / `to` are seconds after it starts, see scrollState.introAt) and stay there for good.
 */
export function RisingMachines({
  url,
  height,
  machines,
  facing = 0,
  lit = true,
  clips = false,
  phoneFit,
  world = false,
  viewDir = [-1, 0],
}: {
  url: string;
  height: number;
  machines: RisingMachine[];
  facing?: number;
  lit?: boolean;
  clips?: boolean;
  phoneFit?: number;
  world?: boolean;
  /** world only: the way the camera looks at them, on the floor (x, z) — [-1, 0]: down -x (the left wall's kiosks), [0, 1]: down +z (the vending machine against the kitchen wall) */
  viewDir?: readonly [number, number];
}) {
  const gltf = useModel(url);
  const ml = useMachineLightControls();
  /** first / last scroll progress any of them can be in frame */
  const shownFrom = Math.min(...machines.map((k) => k.from));
  const shownTo = Math.max(...machines.map((k) => k.outTo));
  /** below the frame, even for the tallest */
  const hiddenY = world ? -height - 0.3 : -2.6 - height;
  const gl = useThree((s) => s.gl);

  const studio = useMemo(() => createStudioEnv(gl), [gl]);
  useEffect(() => () => studio.dispose(), [studio]);

  // the centre kiosk's screen shows the very bucket that went into it (world: the ordering wall only)
  const bucketGltf = useModel(BUCKET_URL);
  useEffect(() => {
    if (world) paintBucket(gl, bucketGltf, studio);
  }, [world, gl, bucketGltf, studio]);

  const rig = useMemo(() => {
    const src = gltf.scene;
    src.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(src);
    const size = box.getSize(new THREE.Vector3());
    const scale = height / size.y;
    const group = new THREE.Group();
    group.name = EXPORT_NAMES.machines;

    // standing in the room: a soft contact shadow on the floor under each, so it reads as planted
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0 });
    const shadowGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

    const kiosks = machines.map((k, i) => {
      const shadow = new THREE.Mesh(shadowGeo, shadowMat.clone());
      shadow.renderOrder = -1;
      shadow.visible = false;
      if (world) group.add(shadow);
      const model = src.clone(true);
      // base-centre at the origin
      model.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
      const mats: THREE.MeshStandardMaterial[] = [];
      const screens: THREE.MeshStandardMaterial[] = [];
      model.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const mat = (m.material as THREE.MeshStandardMaterial).clone();
        mat.envMap = studio;
        // transparent pass (still opaque), like the hero: lands after the 3D copy
        mat.transparent = true;
        m.material = mat;
        if (mat.emissiveMap) {
          mat.userData.emissive = mat.emissiveIntensity;
          screens.push(mat);
        } else mats.push(mat);
      });
      sharpen(model, gl);
      const scaled = new THREE.Group();
      scaled.scale.setScalar(scale);
      scaled.add(model);
      const pivot = new THREE.Group(); // base-centre, everything turns / squashes around it
      pivot.add(scaled);
      group.add(pivot);
      // the model's own clips, scrubbed by hand (see the frame loop)
      const mixer = new THREE.AnimationMixer(model);
      const actions = clips
        ? gltf.animations.map((clip) => {
            const a = mixer.clipAction(clip);
            a.play();
            return { a, dur: clip.duration, t: 0 };
          })
        : [];
      return {
        mixer,
        actions,
        k,
        i,
        pivot,
        shadow,
        scaled,
        mats,
        screens,
        hover: false,
        hoverS: new Spring(),
        squash: new Spring(),
        hop: new Spring(),
        lean: new Spring(),
        spin: new Spring(),
        spinTo: 0,
        prevT: NaN,
      };
    });

    return { group, kiosks, scale, width: size.x * scale, depth: size.z * scale };
  }, [gltf, gl, studio, height, machines, clips]);

  // a key from above-front and a cool rim from behind, always mounted (no recompiles)
  const lights = useMemo(() => {
    const key = new THREE.SpotLight("#fff1e0", 0, 14, 0.7, 0.9, 2);
    const rim = new THREE.SpotLight("#9fb6ff", 0, 12, 0.7, 0.9, 2);
    // a soft warm fill right in front of the face, so the screen and the front panel read clearly
    const fill = new THREE.PointLight("#ffe6c8", 0, 7, 2);
    // standing in the room they are lit by the key and the fill alone: every light costs every pixel of the room's shaders
    rim.visible = !world;
    const group = new THREE.Group();
    group.add(key, key.target, rim, rim.target, fill);
    return { group, key, rim, fill };
  }, [world]);

  const tmp = useMemo(
    () => ({
      q: new THREE.Quaternion(),
      m: new THREE.Matrix4(),
      up: new THREE.Vector3(0, 1, 0),
      right: new THREE.Vector3(),
      camUp: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      c: new THREE.Vector3(),
      pointer: new THREE.Vector2(),
    }),
    [],
  );

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 20);
    const p = scrollState.progress;
    const t = state.clock.elapsedTime;
    const motion = scrollState.reducedMotion ? 0 : 1;

    rig.group.visible = world || (p > shownFrom && p < shownTo);
    if (!rig.group.visible) {
      lights.key.intensity = lights.rim.intensity = lights.fill.intensity = 0;
      return;
    }

    // the authored lens (not the cursor-orbiting real camera), like the hero
    const cam = state.camera as THREE.PerspectiveCamera;
    tmp.q.setFromRotationMatrix(tmp.m.lookAt(CAMERA.position, CAMERA.target, tmp.up));
    tmp.right.set(1, 0, 0).applyQuaternion(tmp.q);
    tmp.camUp.set(0, 1, 0).applyQuaternion(tmp.q);
    tmp.fwd.set(0, 0, -1).applyQuaternion(tmp.q);
    // in the room: the lights are laid out for the way the camera looks at them
    if (world) tmp.fwd.set(viewDir[0], 0, viewDir[1]), tmp.right.set(-viewDir[1], 0, viewDir[0]);
    const kf = world ? 1 : Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) / Math.tan(THREE.MathUtils.degToRad(CAMERA.fov / 2));
    // phones: three across won't fit the narrow frame — smaller, closer together, the sides further forward
    const portrait = world ? 0 : portraitness(state.size.width / state.size.height);
    const fit = 1 - (phoneFit ?? (machines.length > 1 ? 0.55 : 0.2)) * portrait;
    const spread = 1 - 0.63 * portrait;

    tmp.pointer.x = damp(tmp.pointer.x, scrollState.pointer.x, 3, delta);
    tmp.pointer.y = damp(tmp.pointer.y, scrollState.pointer.y, 3, delta);

    let presence = 0;
    tmp.c.set(0, 0, 0);
    for (const it of rig.kiosks) {
      const { k, pivot } = it;
      const rise = world
        ? clamp((performance.now() / 1000 - scrollState.introAt - k.from) / (k.to - k.from))
        : clamp((p - k.from) / (k.to - k.from));
      const out = world ? 0 : clamp((p - k.outFrom) / (k.outTo - k.outFrom));
      const shown = rise > 0 && out < 1;
      pivot.visible = shown;
      it.shadow.visible = world && shown;
      presence = Math.max(presence, smoothstep(0, 0.4, rise) * (1 - smoothstep(0.6, 1, out)));
      if (!shown) {
        it.prevT = rise;
        continue;
      }

      // landing: once it settles (scrolling down), a squash, and the screen wakes
      if (it.prevT < 0.9 && rise >= 0.9) it.squash.kick(-3.2);
      it.prevT = rise;

      const up = easeInOutOvershoot(rise, 0.09);
      const down = easeInBack(out, 1.3);
      const side = world ? 0 : Math.sign(k.x);
      const hover = it.hoverS.step(it.hover ? 1 : 0, delta, 120, 0.55);
      const hop = it.hop.step(0, delta, 60, 0.3);
      const squash = it.squash.step(0, delta, 220, 0.25);
      const spin = it.spin.step(it.spinTo, delta, 28, 0.62);
      // own clips: run while hovered; once let go, each finishes its cycle and rests at the start
      if (it.actions.length) {
        let moved = false;
        for (const c of it.actions) {
          if (!it.hover && c.t === 0) continue;
          c.t += delta;
          if (c.t >= c.dur) c.t = it.hover ? c.t - c.dur : 0;
          c.a.time = c.t;
          moved = true;
        }
        if (moved) it.mixer.update(0);
      }

      // standing in the room they sit still on the floor: no bobbing, no lifting on hover, no swaying toward the cursor
      const float = world ? 0 : (Math.sin(t * 1.1 + it.i * 2.1) * 0.03 + Math.sin(t * 0.47 + it.i) * 0.015) * motion * rise;
      // offset from where it stands: up from below the frame, back down at the end
      const lift = (hiddenY - k.y) * (1 - up + down) + float + (world ? 0 : hover * 0.07) + hop * 0.12;
      // phones step into the room (CameraRig): the sides come forward too, clear of the booths
      const d = k.d - (side !== 0 && machines.length > 1 ? 1.0 * portrait : 0);

      // the base stays on the floor whatever the lens; only the motion scales with it
      if (world) pivot.position.set(k.x, k.y + lift, k.d);
      else
        pivot.position
          .copy(CAMERA.position)
          .addScaledVector(tmp.right, (k.x * spread + tmp.pointer.x * 0.06) * kf)
          .addScaledVector(tmp.camUp, k.y + lift * kf)
          .addScaledVector(tmp.fwd, d);
      if (world) pivot.quaternion.identity();
      else pivot.quaternion.copy(tmp.q);
      // rising: comes up turned away (the centre a half turn, the sides from outside) and tipped back
      const turnIn = (1 - easeOutCubic(rise)) * (side === 0 ? Math.PI : 1.6 * side);
      const sinkTurn = easeInBack(out, 1.3) * 0.6 * (side === 0 ? 1 : side);
      const cursor = world ? 0 : 1;
      const lean = it.lean.step(cursor * -tmp.pointer.x * 0.05 + (1 - rise) * 0.1 * (side || 1), delta, 50, 0.45);
      pivot.rotateZ(lean + cursor * Math.sin(t * 0.6 + it.i) * 0.008 * motion);
      pivot.rotateX(-(1 - easeOutCubic(rise)) * 0.22 + cursor * (tmp.pointer.y * 0.03 + hover * 0.04));
      pivot.rotateY(facing + k.yaw + turnIn + sinkTurn + spin + cursor * tmp.pointer.x * 0.18);

      if (world) {
        const w = Math.max(rig.width, rig.depth) * 1.7;
        it.shadow.position.set(k.x, 0.012, k.d);
        it.shadow.scale.set(w, 1, w);
        (it.shadow.material as THREE.MeshBasicMaterial).opacity = 0.55 * smoothstep(0.5, 1, rise);
      }

      const sy = Math.max(0.7, 1 + squash * 0.06);
      const s = kf * fit;
      pivot.scale.set(s / Math.sqrt(sy), s * sy, s / Math.sqrt(sy));

      // screen boots up as it lands, then breathes; dims as it leaves
      const on = smoothstep(0.75, 1, rise) * (1 - smoothstep(0, 0.5, out));
      const flicker = on < 1 && on > 0 ? 0.6 + 0.4 * Math.sin(t * 60 + it.i) : 1;
      // the centre kiosk's screen shows the flat bucket once the 3D one has gone into the machine
      const white = world && it.i === 0 ? scrollState.screenWhite : 0;
      for (const m of it.screens) {
        const base = m.userData.emissive * (world ? ml.screenGlow : 1) * on * flicker * (0.92 + 0.08 * Math.sin(t * 2 + it.i));
        m.userData.map ??= m.emissiveMap;
        m.userData.base ??= m.map;
        m.userData.color ??= m.color.clone();
        const flat = white > 0.5;
        m.emissiveMap = flat ? flatTex : m.userData.map;
        m.map = flat ? flatTex : m.userData.base;
        // the flat picture is shown as it is (its own colours, no light added on top): emissive only
        m.color.copy(m.userData.color).multiplyScalar(flat ? 0 : 1);
        m.emissiveIntensity = flat ? 1 : base + (Math.max(base, 1.2) - base) * white;
        if (white > 0 || m.userData.wasWhite) m.emissive.setScalar(1); // plain white while the bucket is in
        m.userData.wasWhite = white > 0;
      }
      for (const m of it.mats) m.envMapIntensity = world ? ml.envIntensity : 0.9;

      if (world ? k.d === machines[0].d : side === 0) tmp.c.copy(pivot.position);
    }

    // light rig on the centre kiosk, at mid-height
    tmp.c.addScaledVector(tmp.camUp, height * 0.55 * kf * fit);
    lights.key.position.copy(tmp.c).addScaledVector(tmp.right, -1.8).addScaledVector(tmp.camUp, 2.8).addScaledVector(tmp.fwd, -3.2);
    lights.key.target.position.copy(tmp.c);
    lights.key.color.set(ml.keyColor);
    lights.rim.color.set(ml.rimColor);
    lights.fill.color.set(ml.fillColor);
    lights.key.intensity = (world ? ml.keyIntensity : 26) * presence;
    lights.rim.position.copy(tmp.c).addScaledVector(tmp.right, 2.2).addScaledVector(tmp.camUp, 2.0).addScaledVector(tmp.fwd, 2.6);
    lights.rim.target.position.copy(tmp.c);
    lights.rim.intensity = (world ? ml.rimIntensity : 30) * presence;
    lights.fill.position.copy(tmp.c).addScaledVector(tmp.fwd, -1.8).addScaledVector(tmp.camUp, 0.3);
    lights.fill.intensity = (world ? ml.fillIntensity : 0) * presence;
  });

  const events = (it: (typeof rig.kiosks)[number]) => ({
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      it.hover = true;
      setCursor("pointer");
    },
    onPointerOut: () => {
      it.hover = false;
      setCursor("");
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      // a full turn and a hop
      it.spinTo += Math.PI * 2 * (Math.random() < 0.5 ? -1 : 1);
      it.hop.kick(2.4);
      it.squash.kick(-3);
      soundApi.play("blip");
    },
  });

  return (
    <>
      {lit && <primitive object={lights.group} />}
      <primitive object={rig.group}>
        {rig.kiosks.map((it) => (
          <primitive key={it.i} object={it.pivot}>
            {/* invisible hit box, cheap to raycast (pivot space is model space × kf·fit) */}
            <mesh position={[0, height / 2, 0]} {...events(it)}>
              <boxGeometry args={[rig.width, height, rig.depth]} />
              <meshBasicMaterial visible={false} />
            </mesh>
          </primitive>
        ))}
      </primitive>
    </>
  );
}

preloadModel(KIOSK_URL);
