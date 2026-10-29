"use client";

import { useGLTF } from "@react-three/drei";
import { type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import "@/lib/home/draco";
import { Spring, clamp, damp, easeInBack, easeInOutOvershoot, easeOutCubic, scrollState, smoothstep } from "@/lib/home/scroll";
import { createStudioEnv } from "@/lib/home/studio";
import { portraitness } from "./CameraRig";
import { useMachineLightControls } from "./controls";
import { CAMERA, KIOSK_URL, VENDING_URL, type RisingMachine } from "./config";

/** a soft dark blob, fading to nothing at the edge */
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
  const gltf = useGLTF(url);
  const ml = useMachineLightControls();
  /** first / last scroll progress any of them can be in frame */
  const shownFrom = Math.min(...machines.map((k) => k.from));
  const shownTo = Math.max(...machines.map((k) => k.outTo));
  /** below the frame, even for the tallest */
  const hiddenY = world ? -height - 0.3 : -2.6 - height;
  const gl = useThree((s) => s.gl);

  const studio = useMemo(() => createStudioEnv(gl), [gl]);
  useEffect(() => () => studio.dispose(), [studio]);

  const rig = useMemo(() => {
    const src = gltf.scene;
    src.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(src);
    const size = box.getSize(new THREE.Vector3());
    const scale = height / size.y;
    const group = new THREE.Group();

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
  }, [gltf, studio, height, machines, clips]);

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
      for (const m of it.screens) m.emissiveIntensity = m.userData.emissive * (world ? ml.screenGlow : 1) * on * flicker * (0.92 + 0.08 * Math.sin(t * 2 + it.i));
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

useGLTF.preload(KIOSK_URL);
useGLTF.preload(VENDING_URL);
