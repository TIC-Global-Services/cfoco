"use client";

import { type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useModel, useModels, preloadModel } from "@/lib/home/models";
import { sharpen } from "@/lib/home/textures";
import { Spring, clamp, robotRide, routesChanged, scrollState, smoothstep, soundApi } from "@/lib/home/scroll";
import { createStudioEnv } from "@/lib/home/studio";
import { useKitchenLightControls } from "./controls";
import { EXPORT_NAMES, ROBOT_FACING, ROBOT_HEIGHT, ROBOT_RUN, ROBOT_URL } from "./config";
import { shadowTexture } from "./RisingMachines";

const ease = (t: number) => t * t * (3 - 2 * t);

/** shortest turn from a to b, radians */
const turnTo = (a: number, b: number) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a));

/**
 * The serving robot. Parked by the ordering kiosks; once the bucket has hopped onto its tray (HeroChicken reads
 * `robotRide`) it drives to the middle of the room and waits there facing the camera — scrubbed by scroll, so it rewinds too.
 */
export function ServeRobot() {
  const gltf = useModel(ROBOT_URL);
  const kl = useKitchenLightControls();
  const trayGltfs = useModels(ROBOT_RUN.trays.map((t) => t.url));
  const gl = useThree((s) => s.gl);
  const clock = useThree((s) => s.clock);
  const studio = useMemo(() => createStudioEnv(gl), [gl]);
  useEffect(() => () => studio.dispose(), [studio]);

  const rig = useMemo(() => {
    const src = gltf.scene;
    src.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(src);
    const size = box.getSize(new THREE.Vector3());
    const model = src.clone(true);
    // base-centre at the origin
    model.position.set(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
    const mats: THREE.MeshStandardMaterial[] = [];
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = (m.material as THREE.MeshStandardMaterial).clone();
      mat.envMap = studio;
      mat.envMapIntensity = 0.9;
      m.material = mat;
      mats.push(mat);
    });
    sharpen(model, gl);
    const scale = ROBOT_HEIGHT / size.y;
    const scaled = new THREE.Group();
    scaled.scale.setScalar(scale);
    scaled.add(model);
    const pivot = new THREE.Group(); // stands on the floor, turns with its heading
    pivot.add(scaled);

    // the fries and the coke on the bottom trays (the trays stand behind the face)
    ROBOT_RUN.trays.forEach((t, i) => {
      const item = trayGltfs[i].scene;
      item.updateMatrixWorld(true);
      const b = new THREE.Box3().setFromObject(item);
      const clone = item.clone(true);
      clone.position.set(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
      clone.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const mat = (m.material as THREE.MeshStandardMaterial).clone();
        mat.envMap = studio;
        mat.envMapIntensity = 0.9;
        m.material = mat;
      });
      const sc = new THREE.Group();
      sc.scale.setScalar(t.height / (b.max.y - b.min.y));
      sc.add(clone);
      const holder = new THREE.Group();
      holder.position.set(t.x, t.trayY * ROBOT_HEIGHT, t.z);
      holder.rotation.y = t.yaw;
      holder.add(sc);
      pivot.add(holder);
    });

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0 }),
    );
    shadow.renderOrder = -1;
    const w = Math.max(size.x, size.z) * scale * 1.7;
    shadow.scale.set(w, 1, w);

    const route = new THREE.CatmullRomCurve3(ROBOT_RUN.route, false, "catmullrom", 0.5);

    // a key from above, following it (the room is dim)
    const key = new THREE.SpotLight("#fff1e0", 0, 12, 0.8, 0.9, 2);
    const group = new THREE.Group();
    group.name = EXPORT_NAMES.robot;
    group.add(pivot, shadow, key, key.target);
    return { group, pivot, shadow, mats, route, key };
  }, [gltf, gl, trayGltfs, studio]);

  const tmp = useMemo(
    () => ({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      tan: new THREE.Vector3(),
      yaw: NaN,
      quat: new THREE.Quaternion(),
      up: new THREE.Vector3(0, 1, 0),
    }),
    [],
  );

  // tapped: it chirps, does a little hop and a full turn on the spot (the bucket on its tray goes round with it)
  const tap = useRef({ spin: new Spring(), to: 0, hopAt: -10 });

  // runs before the camera rig and the hero (they read where the tray is)
  useFrame((state, delta) => {
    const T = tap.current;
    const spin = T.spin.step(T.to, delta, 30, 0.7);
    const since = state.clock.elapsedTime - T.hopAt;
    const hop = since >= 0 && since < 0.45 ? Math.sin((since / 0.45) * Math.PI) * 0.12 : 0;
    const p = scrollState.progress;
    const R = ROBOT_RUN;
    // the route editor (?debug) moves the waypoints in place: re-measure the curve
    if (routesChanged()) rig.route.updateArcLengths();
    robotRide.ready = true;
    // parked by the kiosks until the camera leaves for the kitchen, then along the route to the middle of the room, where it waits
    const du = clamp((p - R.driveFrom) / (R.driveTo - R.driveFrom));
    const s = du * 0.65 + ease(du) * 0.35; // mostly steady speed
    const onRoute = tmp.a;
    onRoute.copy(rig.route.getPointAt(s));
    rig.route.getTangentAt(Math.min(Math.max(s, 0.001), 0.999), tmp.tan);
    // parked facing into the room (+x), swings round to its heading as it sets off, and ends turned toward the camera (+z) where it waits
    const faceRoom = Math.PI / 2;
    const heading = Math.atan2(tmp.tan.x, tmp.tan.z);
    const swing = smoothstep(R.driveFrom - 0.05, R.driveFrom + 0.25, p);
    const square = smoothstep(0.82, 1, s);
    const driving = turnTo(faceRoom, heading);
    const aim = driving + (turnTo(driving, R.stopYaw) - driving) * square;
    const yaw = faceRoom + (aim - faceRoom) * swing;
    tmp.yaw = Number.isNaN(tmp.yaw) ? yaw : tmp.yaw + (turnTo(tmp.yaw, yaw) - tmp.yaw) * (1 - Math.exp(-delta * 8));

    rig.pivot.position.set(onRoute.x, hop, onRoute.z);
    rig.pivot.rotation.set(0, tmp.yaw + ROBOT_FACING + spin, 0);
    rig.shadow.position.set(onRoute.x, 0.012, onRoute.z);
    (rig.shadow.material as THREE.MeshBasicMaterial).opacity = 0.55;

    // the bucket rides on the tray
    const back = ROBOT_RUN.trayBack;
    robotRide.tray.set(
      onRoute.x - Math.sin(tmp.yaw + ROBOT_FACING) * back,
      ROBOT_HEIGHT * ROBOT_RUN.trayY + hop,
      onRoute.z - Math.cos(tmp.yaw + ROBOT_FACING) * back,
    );
    robotRide.quaternion.setFromAxisAngle(tmp.up, tmp.yaw + spin);

    rig.key.position.set(onRoute.x - 1.2, 3.4, onRoute.z + 2.0);
    rig.key.target.position.set(onRoute.x, ROBOT_HEIGHT * 0.5, onRoute.z);
    rig.key.color.set(kl.robotColor);
    rig.key.intensity = kl.robotIntensity;
  }, -2);

  return (
    <primitive
      object={rig.group}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => (document.body.style.cursor = "")}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        const T = tap.current;
        T.to += Math.PI * 2;
        T.hopAt = clock.elapsedTime;
        soundApi.play("blip");
      }}
    />
  );
}

preloadModel(ROBOT_URL);
for (const t of ROBOT_RUN.trays) preloadModel(t.url);
