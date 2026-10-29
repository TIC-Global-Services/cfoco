"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import "@/lib/home/draco";
import { sharpen } from "@/lib/home/textures";
import { clamp, easeInOutOvershoot, robotRide, routesChanged, scrollState, smoothstep } from "@/lib/home/scroll";
import { createStudioEnv } from "@/lib/home/studio";
import { useKitchenLightControls } from "./controls";
import { EXPORT_NAMES, ROBOT_FACING, ROBOT_HEIGHT, ROBOT_RUN, ROBOT_URL } from "./config";
import { shadowTexture } from "./RisingMachines";

const ease = (t: number) => t * t * (3 - 2 * t);

/** shortest turn from a to b, radians */
const turnTo = (a: number, b: number) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a));

/**
 * The serving robot. It slides up out of the floor at the ordering wall, the
 * bucket is put on its tray (HeroChicken reads `robotRide`), and it drives the
 * bucket across the restaurant to the vending machine — scrubbed by scroll, so
 * it rewinds too. Afterwards it rolls up and down the middle of the room on its own.
 */
export function ServeRobot() {
  const gltf = useGLTF(ROBOT_URL);
  const kl = useKitchenLightControls();
  const trayGltfs = useGLTF(ROBOT_RUN.trays.map((t) => t.url));
  const gl = useThree((s) => s.gl);
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
    const inKitchen = new THREE.CatmullRomCurve3(ROBOT_RUN.kitchenRoute, false, "catmullrom", 0.5);
    const outKitchen = new THREE.CatmullRomCurve3(ROBOT_RUN.exitRoute, false, "catmullrom", 0.5);
    const { centre, rx, rz } = ROBOT_RUN.patrol;
    const loop = new THREE.CatmullRomCurve3(
      Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return new THREE.Vector3(centre.x + Math.sin(a) * rx, 0, centre.z + Math.cos(a) * rz);
      }),
      true,
    );

    // a key from above, following it (the room is dim)
    const key = new THREE.SpotLight("#fff1e0", 0, 12, 0.8, 0.9, 2);
    const group = new THREE.Group();
    group.name = EXPORT_NAMES.robot;
    group.add(pivot, shadow, key, key.target);
    return { group, pivot, shadow, mats, route, inKitchen, outKitchen, loop, key, hiddenY: -ROBOT_HEIGHT - 0.3 };
  }, [gltf, gl, trayGltfs, studio]);

  const tmp = useMemo(
    () => ({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      tan: new THREE.Vector3(),
      yaw: NaN,
      exitAt: NaN,
      quat: new THREE.Quaternion(),
      up: new THREE.Vector3(0, 1, 0),
    }),
    [],
  );

  // runs before the camera rig and the hero (they read where the tray is)
  useFrame((state, delta) => {
    const p = scrollState.progress;
    const R = ROBOT_RUN;
    // the route editor (?debug) moves the waypoints in place: re-measure the curves
    if (routesChanged()) for (const c of [rig.route, rig.inKitchen, rig.outKitchen]) c.updateArcLengths();
    const rise = clamp((p - R.riseFrom) / (R.riseTo - R.riseFrom));
    rig.group.visible = rise > 0;
    robotRide.ready = rise > 0;
    if (!rig.group.visible) {
      rig.key.intensity = 0;
      tmp.yaw = NaN;
      return;
    }

    // where it is: at the wall until it sets off, along the route, waiting at the vending machine, then on patrol
    const s = ease(clamp((p - R.driveFrom) / (R.driveTo - R.driveFrom)));
    const route = rig.route;
    // on into the kitchen (k up to 1), and back out again (r)
    const k = ease(clamp((p - R.kitchenFrom) / (R.kitchenTo - R.kitchenFrom)));
    // the way out runs on the clock once the kitchen view is reached (scrolling back before that resets it)
    const now = state.clock.elapsedTime;
    if (p < R.exitAt) tmp.exitAt = NaN;
    else if (Number.isNaN(tmp.exitAt)) tmp.exitAt = now;
    const raw = Number.isNaN(tmp.exitAt) ? 0 : clamp((now - tmp.exitAt - R.exitDelay) / R.exitTime);
    const r = ease(raw);
    const onRoute = tmp.a;
    if (r > 0) {
      onRoute.copy(rig.outKitchen.getPointAt(r));
      rig.outKitchen.getTangentAt(Math.min(Math.max(r, 0.001), 0.999), tmp.tan);
    } else if (k > 0) {
      onRoute.copy(rig.inKitchen.getPointAt(k));
      rig.inKitchen.getTangentAt(Math.min(Math.max(k, 0.001), 0.999), tmp.tan);
    } else {
      onRoute.copy(route.getPointAt(s));
      route.getTangentAt(Math.min(Math.max(s, 0.001), 0.999), tmp.tan);
    }
    let heading = Math.atan2(tmp.tan.x, tmp.tan.z);

    const patrol = smoothstep(0.8, 1, raw);
    if (patrol > 0) {
      const u = (((state.clock.elapsedTime / R.patrol.lap) % 1) + 1) % 1;
      rig.loop.getPointAt(u, tmp.b);
      rig.loop.getTangentAt(u, tmp.tan);
      onRoute.lerp(tmp.b, ease(patrol));
      heading += (turnTo(heading, Math.atan2(tmp.tan.x, tmp.tan.z)) - heading) * ease(patrol);
    }

    // it comes up facing into the room (+x), then swings round to its heading as it sets off
    const faceRoom = Math.PI / 2;
    const swing = smoothstep(R.driveFrom - 0.05, R.driveFrom + 0.25, p);
    const target = turnTo(faceRoom, heading);
    const yaw = faceRoom + (target - faceRoom) * swing;
    tmp.yaw = Number.isNaN(tmp.yaw) ? yaw : tmp.yaw + (turnTo(tmp.yaw, yaw) - tmp.yaw) * (1 - Math.exp(-delta * 8));

    // slides up out of the floor with a little overshoot
    const lift = rig.hiddenY * (1 - easeInOutOvershoot(rise, 0.09));
    rig.pivot.position.set(onRoute.x, lift, onRoute.z);
    rig.pivot.rotation.set(0, tmp.yaw + ROBOT_FACING, 0);
    rig.shadow.position.set(onRoute.x, 0.012, onRoute.z);
    (rig.shadow.material as THREE.MeshBasicMaterial).opacity = 0.55 * smoothstep(0.5, 1, rise);

    // the bucket rides on the tray
    const back = ROBOT_RUN.trayBack;
    robotRide.tray.set(
      onRoute.x - Math.sin(tmp.yaw + ROBOT_FACING) * back,
      ROBOT_HEIGHT * ROBOT_RUN.trayY + lift,
      onRoute.z - Math.cos(tmp.yaw + ROBOT_FACING) * back,
    );
    robotRide.quaternion.setFromAxisAngle(tmp.up, tmp.yaw);

    rig.key.position.set(onRoute.x - 1.2, 3.4, onRoute.z + 2.0);
    rig.key.target.position.set(onRoute.x, ROBOT_HEIGHT * 0.5, onRoute.z);
    rig.key.color.set(kl.robotColor);
    rig.key.intensity = kl.robotIntensity * smoothstep(0, 0.4, rise);
  }, -2);

  return <primitive object={rig.group} />;
}

useGLTF.preload(ROBOT_URL);
for (const t of ROBOT_RUN.trays) useGLTF.preload(t.url);
