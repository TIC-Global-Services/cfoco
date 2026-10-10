"use client";

import React, { Suspense, useRef, useEffect, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, Center, OrbitControls, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import Image from "next/image";

interface ChickenBucketCanvasProps {
  modelPath?: string;
  className?: string;
}

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
      // eslint-disable-next-line react-hooks/immutability
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
  isMobile,
}: {
  modelPath: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  floatingAnim: boolean;
  isMobile: boolean;
}) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);

  const baseRotX = (rotation.x * Math.PI) / 180;
  const baseRotY = (rotation.y * Math.PI) / 180;
  const baseRotZ = (rotation.z * Math.PI) / 180;

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // On desktop, add subtle mouse pointer tilt. Skip on mobile to save CPU cycles.
    if (!isMobile) {
      const targetX = baseRotX + (state.pointer.y * Math.PI) / 32;
      const targetY = baseRotY + (state.pointer.x * Math.PI) / 32;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetX,
        0.08
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetY,
        0.08
      );
    }
    groupRef.current.rotation.z = baseRotZ;
  });

  const modelNode = (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      rotation={[baseRotX, baseRotY, baseRotZ]}
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
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#E5A823]/25 via-[#FFBF00]/10 to-transparent blur-xl transform-gpu animate-pulse" />

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

// ── Main Canvas Wrapper ─────────────────────────────────────────────────────
export default function ChickenBucketCanvas({
  modelPath = "/chicken_bucket.glb",
  className = "",
}: ChickenBucketCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasContextError, setHasContextError] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const controls = {
    position: { x: 0.1, y: -0.05, z: 0 },
    rotation: { x: -10, y: -130, z: -10 },
    scale: 0.55,
    camera: { x: 0, y: 1.25, z: 4.1 },
    fov: 38,
    interactiveOrbit: true,
    autoRotate: true,
    autoRotateSpeed: 3.4,
    floatingAnim: false,
    lightIntensity: 2.6,
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Performance Optimization: Suspend 3D render loop when scrolled out of view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: "250px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Clean disposal on unmount
  useEffect(() => {
    return () => {
      useGLTF.clear(modelPath);
    };
  }, [modelPath]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-[340px] xs:max-w-[380px] sm:max-w-[460px] md:max-w-[560px] lg:max-w-[660px] xl:max-w-[720px] aspect-[1/0.92] mx-auto select-none ${className}`}
      style={{
        touchAction: "pan-y",
      }}
    >
      {/* Background Ambient Radial Glow (Hardware-accelerated) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] bg-gradient-to-t from-[#E5A823]/15 via-[#FFBF00]/5 to-transparent rounded-full blur-[40px] sm:blur-[80px] transform-gpu pointer-events-none -z-10" />

      {/* Ground Contact Shadow */}
      <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[55%] h-5 sm:h-6 bg-black/70 rounded-full blur-lg sm:blur-xl transform-gpu pointer-events-none -z-10" />

      {/* Ground Warm Reflection */}
      <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[65%] h-8 sm:h-10 bg-[#FFBF00]/10 rounded-full blur-xl sm:blur-2xl transform-gpu pointer-events-none -z-10" />

      {hasContextError ? (
        <LoadingFallback />
      ) : (
        <Canvas
          // Suspend 100% of GPU rendering when not in viewport
          frameloop={
            !isInView
              ? "never"
              : controls.autoRotate || controls.floatingAnim
              ? "always"
              : "demand"
          }
          // Cap DPR at 1 on mobile to prevent memory pressure on mobile GPUs
          dpr={isMobile ? 1 : [1, 1.2]}
          camera={{
            position: [controls.camera.x, controls.camera.y, controls.camera.z],
            fov: controls.fov,
          }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "default",
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
          className={`w-full h-full ${
            isMobile ? "cursor-default" : "cursor-grab active:cursor-grabbing"
          }`}
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
              isMobile={isMobile}
            />

            {/*
              Orbit Controls:
              On mobile: Disable 1-finger touch rotation so native page scrolling is NEVER blocked.
              Bucket auto-rotates smoothly on its own.
              On desktop: Keep interactive mouse drag rotation enabled.
            */}
            {controls.interactiveOrbit && (
              <OrbitControls
                makeDefault
                enableZoom={false}
                enablePan={false}
                enableRotate={!isMobile}
                autoRotate={controls.autoRotate}
                autoRotateSpeed={controls.autoRotateSpeed}
                enableDamping={true}
                dampingFactor={0.05}
                rotateSpeed={0.7}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 1.75}
              />
            )}
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}

// Preload model
useGLTF.preload("/chicken_bucket.glb");
