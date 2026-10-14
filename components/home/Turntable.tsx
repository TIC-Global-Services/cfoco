"use client";

import { RoundedBox } from "@react-three/drei";
import { type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Spring, damp, scrollState, soundApi } from "@/lib/home/scroll";
import { createStudioEnv } from "@/lib/home/studio";
import { CAMERA } from "./config";
import { useTurntableControls } from "./controls";

// A classic turntable standing on the front-right table of the room — the
// sound toggle you can find in the scene. Click it (or the small
// SOUND button, Sound.tsx) and the record spins up and the tonearm swings onto
// the groove; again, and the arm lifts off and the platter coasts to a stop.

// model units: the plinth is 1 wide; the group is scaled to the button's width
const PLINTH = { w: 1, h: 0.13, d: 0.78 };
/** plinth centre above its own underside (half the plinth + the feet) */
const LIFT = PLINTH.h / 2 + 0.03;

/** a walnut wedge (stand) that holds the deck up at the back: right triangle in z/y, across x */
function wedgeGeometry(tilt: number) {
  const D = PLINTH.d;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0); // front edge, on the table
  shape.lineTo(-D, 0);
  shape.lineTo(-D, Math.max(D * Math.tan(tilt), 0.002));
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: PLINTH.w * 0.92, bevelEnabled: false });
  // the shape is drawn in x/y and extruded along z: turn it so its x runs along z (back = -z)
  // and the extrusion runs across the deck, then centre it
  g.rotateY(-Math.PI / 2);
  g.translate(PLINTH.w * 0.46, 0, 0);
  return g;
}
const RECORD_R = 0.31;
const RECORD_AT = new THREE.Vector3(-0.12, PLINTH.h / 2 + 0.035, 0);
const ARM_PIVOT = new THREE.Vector3(0.34, PLINTH.h / 2, -0.24);
const ARM_LEN = 0.42;
/** arm yaw: parked beside the record, and resting in the groove */
const ARM_PARK = -0.1;
const ARM_PLAY = -0.62;
const RPM = (33.3 / 60) * Math.PI * 2;

function recordTexture() {
  const S = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const R = S / 2;
  g.fillStyle = "#08080a";
  g.fillRect(0, 0, S, S);
  // grooves: fine rings, with a few wider gaps between "tracks"
  const gaps = [0.52, 0.64, 0.77, 0.88];
  for (let r = R * 0.4; r < R * 0.985; r += 1.6) {
    const f = r / R;
    const gap = gaps.some((x) => Math.abs(f - x) < 0.006);
    g.strokeStyle = gap
      ? "rgba(70,70,78,0.9)"
      : `rgba(${28 + Math.random() * 22},${28 + Math.random() * 22},${32 + Math.random() * 22},0.85)`;
    g.lineWidth = gap ? 2.4 : 0.8;
    g.beginPath();
    g.arc(R, R, r, 0, Math.PI * 2);
    g.stroke();
  }
  // the label
  g.fillStyle = "#c4161c";
  g.beginPath();
  g.arc(R, R, R * 0.36, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "rgba(255,220,180,0.55)";
  g.lineWidth = 3;
  g.beginPath();
  g.arc(R, R, R * 0.33, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#fff4e6";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = `600 ${S * 0.07}px Geist, Helvetica, Arial, sans-serif`;
  g.fillText("CFOCO", R, R - S * 0.075);
  g.font = `500 ${S * 0.026}px Geist, Helvetica, Arial, sans-serif`;
  g.fillText("SIDE A  ·  33⅓", R, R + S * 0.075);
  // spindle hole
  g.fillStyle = "#d9d9de";
  g.beginPath();
  g.arc(R, R, S * 0.012, 0, Math.PI * 2);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function woodTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#5b331b";
  g.fillRect(0, 0, 512, 128);
  for (let i = 0; i < 90; i++) {
    const y = Math.random() * 128;
    g.strokeStyle = `rgba(${Math.random() < 0.5 ? "30,14,6" : "140,86,48"},${0.12 + Math.random() * 0.2})`;
    g.lineWidth = 0.6 + Math.random() * 2;
    g.beginPath();
    g.moveTo(0, y);
    for (let x = 0; x <= 512; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 3);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function Turntable() {
  const ctl = useTurntableControls();
  const gl = useThree((s) => s.gl);
  const root = useRef<THREE.Group>(null);
  const deck = useRef<THREE.Group>(null);
  const record = useRef<THREE.Mesh>(null);
  const arm = useRef<THREE.Group>(null);

  const kit = useMemo(() => {
    const env = createStudioEnv(gl);
    const std = (o: THREE.MeshStandardMaterialParameters) => {
      // opaque: it is part of the room, so the 3D copy draws over it
      return new THREE.MeshStandardMaterial({ envMap: env, envMapIntensity: 1.1, ...o });
    };
    const vinyl = new THREE.MeshPhysicalMaterial({
      map: recordTexture(),
      color: "#ffffff",
      roughness: 0.32,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMap: env,
      envMapIntensity: 1.3,
    });
    const edge = std({ color: "#0a0a0c", roughness: 0.3 });
    return {
      env,
      wood: std({ map: woodTexture(), roughness: 0.38 }),
      top: std({ color: "#17120f", roughness: 0.55 }),
      chrome: std({ color: "#e8e8ee", metalness: 1, roughness: 0.18, envMapIntensity: 1.6 }),
      platter: std({ color: "#2b2b30", metalness: 0.9, roughness: 0.3 }),
      vinyl: [edge, vinyl, edge] as THREE.Material[],
      led: new THREE.MeshBasicMaterial({ color: "#ff3b1f", toneMapped: false }),
    };
  }, [gl]);
  const wedge = useMemo(() => wedgeGeometry(THREE.MathUtils.degToRad(ctl.tilt)), [ctl.tilt]);
  useEffect(() => () => wedge.dispose(), [wedge]);

  useEffect(
    () => () => {
      kit.env.dispose();
      for (const m of [kit.wood, kit.top, kit.chrome, kit.platter, kit.led, ...kit.vinyl]) {
        (m as THREE.MeshStandardMaterial).map?.dispose();
        m.dispose();
      }
    },
    [kit],
  );

  const s = useMemo(
    () => ({
      hovered: false,
      spin: 0,
      speed: 0,
      armYaw: ARM_PARK,
      armLift: 0,
      hover: new Spring(),
      press: new Spring(),
      prevState: "locked" as typeof scrollState.sound,
    }),
    [],
  );

  useFrame((state, rawDelta) => {
    const g = root.current;
    if (!g) return;
    const dt = Math.min(rawDelta, 1 / 20);
    const t = state.clock.elapsedTime;
    const snd = scrollState.sound;
    const on = snd === "on";
    if (snd !== s.prevState) {
      s.press.kick(-3); // the whole deck dips when you hit it
      s.prevState = snd;
    }
    const hover = s.hover.step(s.hovered ? 1 : 0, dt, 140, 0.55);
    const press = s.press.step(0, dt, 260, 0.3);
    const motion = scrollState.reducedMotion ? 0 : 1;

    // on the ledge, turned to face the lens, tipped up on its stand so the platter shows;
    // hovering lifts it off the ledge a little
    const [x, y, z] = ctl.position;
    // `position` is the table point under the deck's centre; the deck hinges on its front edge
    g.position.set(x, y + (hover * 0.05 + press * 0.015) * ctl.size, z);
    g.rotation.set(0, Math.atan2(CAMERA.position.x - x, CAMERA.position.z - z) + THREE.MathUtils.degToRad(ctl.yaw), 0);
    g.scale.setScalar(ctl.size);
    if (deck.current) deck.current.rotation.x = THREE.MathUtils.degToRad(ctl.tilt) + (hover * 0.06 + press * 0.03) * motion;

    // record: spins up like a real platter, coasts down when stopped
    s.speed = damp(s.speed, on ? RPM : 0, on ? 1.6 : 0.9, dt);
    s.spin -= s.speed * dt;
    if (record.current) record.current.rotation.y = s.spin;
    // tonearm: lifts, swings, lowers into the groove (and the reverse)
    s.armYaw = damp(s.armYaw, on ? ARM_PLAY : ARM_PARK, 3.2, dt);
    const travelling = Math.abs(s.armYaw - (on ? ARM_PLAY : ARM_PARK)) > 0.02;
    s.armLift = damp(s.armLift, travelling ? 0.16 : 0, 8, dt);
    if (arm.current) {
      arm.current.rotation.set(0, s.armYaw, 0);
      arm.current.rotateX(-s.armLift - (on && !travelling ? Math.sin(t * RPM) * 0.004 : 0));
    }

    // power lamp: green when playing, amber while it waits for a tap, dim red when off (steady — no blinking)
    kit.led.color.set(on ? "#3dff7a" : snd === "locked" ? "#ffb02e" : "#ff3b1f");
    const glow = on ? 2.2 : snd === "locked" ? 1.4 : 0.5;
    kit.led.color.multiplyScalar(glow);
  });

  const events = {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      s.hovered = scrollState.soundHover = true;
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      s.hovered = scrollState.soundHover = false;
      document.body.style.cursor = "";
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      soundApi.toggle();
    },
  };

  return (
    <>
      <group ref={root}>
        {/* the stand: front edge at the hinge, deck centre over `position` */}
        <mesh geometry={wedge} position={[0, 0, PLINTH.d / 2]} material={kit.wood} />
        <group position={[0, 0, PLINTH.d / 2]}>
          <group ref={deck}>
            <group position={[0, LIFT, -PLINTH.d / 2]}>
              {/* invisible hit area — cheap to raycast, unlike the parts */}
              <mesh position={[0, 0.06, 0]} {...events}>
                <boxGeometry args={[PLINTH.w * 1.05, 0.3, PLINTH.d * 1.05]} />
                <meshBasicMaterial visible={false} />
              </mesh>
              {/* plinth */}
              <RoundedBox args={[PLINTH.w, PLINTH.h, PLINTH.d]} radius={0.03} smoothness={3} material={kit.wood} />
              <mesh position={[0, PLINTH.h / 2 + 0.001, 0]} rotation-x={-Math.PI / 2} material={kit.top}>
                <planeGeometry args={[PLINTH.w - 0.05, PLINTH.d - 0.05]} />
              </mesh>
              {/* feet */}
              {[-1, 1].flatMap((x) =>
                [-1, 1].map((z) => (
                  <mesh key={`${x}${z}`} position={[x * 0.42, -PLINTH.h / 2 - 0.015, z * 0.3]} material={kit.chrome}>
                    <cylinderGeometry args={[0.04, 0.05, 0.03, 16]} />
                  </mesh>
                )),
              )}
              {/* platter + record */}
              <mesh position={[RECORD_AT.x, PLINTH.h / 2 + 0.015, RECORD_AT.z]} material={kit.platter}>
                <cylinderGeometry args={[RECORD_R + 0.015, RECORD_R + 0.015, 0.03, 48]} />
              </mesh>
              <mesh ref={record} position={RECORD_AT} material={kit.vinyl}>
                <cylinderGeometry args={[RECORD_R, RECORD_R, 0.008, 64]} />
              </mesh>
              <mesh position={[RECORD_AT.x, RECORD_AT.y + 0.015, RECORD_AT.z]} material={kit.chrome}>
                <cylinderGeometry args={[0.008, 0.008, 0.03, 12]} />
              </mesh>
              {/* tonearm */}
              <mesh position={[ARM_PIVOT.x, ARM_PIVOT.y + 0.03, ARM_PIVOT.z]} material={kit.chrome}>
                <cylinderGeometry args={[0.045, 0.055, 0.06, 24]} />
              </mesh>
              <group ref={arm} position={[ARM_PIVOT.x, ARM_PIVOT.y + 0.075, ARM_PIVOT.z]}>
                {/* counterweight */}
                <mesh position={[0, 0, -0.09]} rotation-x={Math.PI / 2} material={kit.platter}>
                  <cylinderGeometry args={[0.03, 0.03, 0.06, 16]} />
                </mesh>
                {/* arm tube, then the headshell dropping toward the groove */}
                <mesh position={[0, 0, ARM_LEN / 2]} rotation-x={Math.PI / 2} material={kit.chrome}>
                  <cylinderGeometry args={[0.009, 0.009, ARM_LEN, 10]} />
                </mesh>
                <mesh position={[-0.02, -0.02, ARM_LEN + 0.02]} rotation-y={0.4} material={kit.top}>
                  <boxGeometry args={[0.045, 0.025, 0.07]} />
                </mesh>
              </group>
              {/* power lamp */}
              <mesh position={[0.38, PLINTH.h / 2 + 0.006, 0.28]} material={kit.led}>
                <sphereGeometry args={[0.018, 12, 8]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </>
  );
}
