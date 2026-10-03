"use client";

import React, { Suspense, useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF, Center, OrbitControls, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import Image from "next/image";

interface ChickenBucketCanvasProps {
  modelPath?: string;
  className?: string;
}

// ── Camera Controller linked to Leva ────────────────────────────────────────
function CameraController({
  pos,
  fov,
}: {
  pos: { x: number; y: number; z: number };
  fov: number;
}) {
  const { camera, invalidate } = useThree();

  useEffect(() => {
    camera.position.set(pos.x, pos.y, pos.z);
    if ("fov" in camera) {
      const persCamera = camera as THREE.PerspectiveCamera;
      persCamera.fov = fov;
      persCamera.updateProjectionMatrix();
    }
    invalidate();
  }, [camera, pos.x, pos.y, pos.z, fov, invalidate]);

  return null;
}

// ── 3D Bucket Model Component ───────────────────────────────────────────────
function BucketModel({
  modelPath,
  position,
  rotation,
  scale,
  floatingAnim,
}: {
  modelPath: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  floatingAnim: boolean;
}) {
  const { scene } = useGLTF(modelPath);

  // Convert degrees to radians for exact angle adjustments
  const rotEuler = useMemo(() => {
    return new THREE.Euler(
      (rotation.x * Math.PI) / 180,
      (rotation.y * Math.PI) / 180,
      (rotation.z * Math.PI) / 180
    );
  }, [rotation.x, rotation.y, rotation.z]);

  const modelNode = (
    <group
      position={[position.x, position.y, position.z]}
      rotation={rotEuler}
      scale={scale}
    >
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );

  if (floatingAnim) {
    return (
      <Float
        speed={1.5}
        rotationIntensity={0.1}
        floatIntensity={0.15}
        floatingRange={[-0.03, 0.03]}
      >
        {modelNode}
      </Float>
    );
  }

  return modelNode;
}

// ── Fallback Placeholder (Shown while loading or if WebGL encounters issues) ─
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none z-10">
      <div className="relative w-48 sm:w-60 md:w-72 h-48 sm:h-60 md:h-72 flex items-center justify-center">
        {/* Soft Golden Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#E5A823]/25 via-[#FFBF00]/10 to-transparent blur-2xl animate-pulse" />

        {/* Silhouette Image */}
        <div className="relative w-3/4 h-3/4 opacity-60">
          <Image
            src="/cfc_bucket.png"
            alt="Loading 3D Chicken Bucket..."
            fill
            sizes="(max-width: 768px) 240px, 320px"
            className="object-contain filter grayscale"
            priority
          />
        </div>

        {/* Spinner Badge */}
        <div className="absolute bottom-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-lg">
          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-[#E5A823] rounded-full animate-spin" />
          <span className="text-[11px] font-medium tracking-wider text-neutral-300 uppercase">
            Loading 3D
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main Canvas Wrapper with Leva Controls ──────────────────────────────────
export default function ChickenBucketCanvas({
  modelPath = "/chicken_bucket.glb",
  className = "",
}: ChickenBucketCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasContextError, setHasContextError] = useState(false);

  // Hardcoded coordinates tuned from Leva
  const controls = {
    position: { x: 0.1, y: -0.05, z: 0 },
    rotation: { x: -10, y: -130, z: -10},
    scale: 0.60,
    camera: { x: 0, y: 1.25, z: 4.1 },
    fov: 38,
    interactiveOrbit: true,
    autoRotate: true,
    autoRotateSpeed: 3.4,
    floatingAnim: false,
    lightIntensity: 2.6,
  };

  // Clean disposal on unmount
  useEffect(() => {
    return () => {
      useGLTF.clear(modelPath);
    };
  }, [modelPath]);

  return (
    <>
      <div
        ref={containerRef}
        className={`relative w-full max-w-[340px] xs:max-w-[380px] sm:max-w-[460px] md:max-w-[560px] lg:max-w-[660px] xl:max-w-[720px] aspect-[1/0.92] mx-auto select-none ${className}`}
        style={{
          // Allows normal vertical page scrolling on touch devices
          touchAction: "pan-y",
        }}
      >
        {/* Background Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-gradient-to-t from-[#E5A823]/15 via-[#FFBF00]/5 to-transparent rounded-full blur-[70px] sm:blur-[100px] pointer-events-none -z-10" />

        {/* Ground Contact Shadow */}
        <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[55%] h-6 bg-black/70 rounded-full blur-xl pointer-events-none -z-10" />

        {/* Ground Warm Reflection */}
        <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[65%] h-10 bg-[#FFBF00]/10 rounded-full blur-2xl pointer-events-none -z-10" />

        {hasContextError ? (
          <LoadingFallback />
        ) : (
          <Canvas
            // Demand frameloop only redraws when parameters change, saving 100% idle GPU
            frameloop={
              controls.autoRotate || controls.floatingAnim
                ? "always"
                : "demand"
            }
            dpr={[1, 1.5]}
            camera={{
              position: [
                controls.camera.x,
                controls.camera.y,
                controls.camera.z,
              ],
              fov: controls.fov,
            }}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: "high-performance",
              stencil: false,
              depth: true,
            }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.15;
              const canvas = gl.domElement;
              canvas.addEventListener("webglcontextlost", (e) => {
                e.preventDefault();
                console.warn("WebGL Context Lost on ChickenBucketCanvas.");
                setHasContextError(true);
              });
              canvas.addEventListener("webglcontextrestored", () => {
                console.log("WebGL Context Restored on ChickenBucketCanvas.");
                setHasContextError(false);
              });
            }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            <Suspense
              fallback={
                <Html as="div" fullscreen zIndexRange={[100, 0]}>
                  <LoadingFallback />
                </Html>
              }
            >
              {/* Live Camera Controller */}
              <CameraController pos={controls.camera} fov={controls.fov} />

              {/* Studio Lighting */}
              <ambientLight intensity={1.3} color="#FFFBF5" />
              <directionalLight
                position={[5, 8, 5]}
                intensity={controls.lightIntensity}
                color="#FFF5EA"
              />
              <directionalLight
                position={[-5, 5, -2]}
                intensity={controls.lightIntensity * 0.6}
                color="#FFE8D6"
              />
              <directionalLight
                position={[0, -2, 4]}
                intensity={0.9}
                color="#FFD180"
              />
              <directionalLight
                position={[0, 8, -4]}
                intensity={1.2}
                color="#FFFFFF"
              />

              {/* Tuned 3D Bucket Model */}
              <BucketModel
                modelPath={modelPath}
                position={controls.position}
                rotation={controls.rotation}
                scale={controls.scale}
                floatingAnim={controls.floatingAnim}
              />

              {/* Optional Orbit Controls */}
              {controls.interactiveOrbit && (
                <OrbitControls
                  makeDefault
                  enableZoom={false}
                  enablePan={false}
                  autoRotate={controls.autoRotate}
                  autoRotateSpeed={controls.autoRotateSpeed}
                  enableDamping={true}
                  dampingFactor={0.05}
                  rotateSpeed={0.7}
                  minPolarAngle={Math.PI / 4}
                  maxPolarAngle={Math.PI / 1.75}
                  touches={{
                    ONE: THREE.TOUCH.ROTATE,
                  }}
                />
              )}
            </Suspense>
          </Canvas>
        )}
      </div>
    </>
  );
}

// Preload model
useGLTF.preload("/chicken_bucket.glb");
