"use client";

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { Center, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Preload 3D model assets
useGLTF.preload("/footerlogo.glb");
useGLTF.preload("/footer_logo.glb");

function LogoModel({
  modelPath,
  position = [0, 0, 0],
  rotation = [0, Math.PI, 0],
  scale = 1,
}: {
  modelPath: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const { scene } = useGLTF(modelPath);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * ResponsiveCamera calculates the exact camera distance to fit the CFOCO 3D logo
 * inside any viewport without ANY clipping on mobile, iPhone, tablet, or desktop.
 * Tuned values: fov 12, modelWidth 1.65, modelHeight 0.54, paddingW 1.26, paddingH 1.25.
 */
function ResponsiveCamera({
  fov = 12,
  modelWidth = 1.65,
  modelHeight = 0.54,
  paddingW = 1.26,
  paddingH = 1.25,
}: {
  fov?: number;
  modelWidth?: number;
  modelHeight?: number;
  paddingW?: number;
  paddingH?: number;
}) {
  const { camera, size, invalidate } = useThree();

  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const tanHalf = Math.tan((fov * Math.PI) / 360);

    const targetW = modelWidth * paddingW;
    const targetH = modelHeight * paddingH;

    const zForW = targetW / (2 * tanHalf * aspect);
    const zForH = targetH / (2 * tanHalf);
    const z = Math.max(zForW, zForH, 1.2);

    if ("fov" in camera) {
      (camera as THREE.PerspectiveCamera).fov = fov;
    }
    camera.position.set(0, 0, z);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    // Demand frameloop needs invalidate to paint on camera update
    invalidate();
  }, [camera, size, fov, modelWidth, modelHeight, paddingW, paddingH, invalidate]);

  return null;
}

// Crisp, instant fallback for loading state or low-power WebGL context fallback
function LogoFallback() {
  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none select-none p-2 sm:p-4">
      <div className="relative w-full h-full max-h-[85%]">
        <Image
          src="/cfc-footer-bg.png"
          alt="CFOCO 3D logo"
          fill
          priority
          className="object-contain"
          sizes="(max-width: 768px) 90vw, 800px"
        />
      </div>
    </div>
  );
}

export default function FooterLogoCanvas({ modelPath }: { modelPath: string }) {
  const [isMobile, setIsMobile] = useState(false);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (contextLost) {
    return <LogoFallback />;
  }

  return (
    <div
      className="relative w-full h-full pointer-events-none select-none touch-none"
      role="img"
      aria-label="CFOCO 3D logo"
    >
      <Suspense fallback={<LogoFallback />}>
        <Canvas
          frameloop="demand"
          dpr={isMobile ? [1, 1.2] : [1, 1.5]}
          camera={{ position: [0, 0, 3.2], fov: 12 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "default",
            depth: true,
            stencil: false,
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.85;

            const canvasEl = gl.domElement;
            canvasEl.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              console.warn("Footer WebGL Context Lost. Switching to fallback image.");
              setContextLost(true);
            });
          }}
        >
          {/* Tuned Lighting Setup */}
          <ambientLight intensity={4.4} />
          <directionalLight position={[3, 4, 5]} intensity={3.6} />
          <directionalLight position={[-3, -2, 2]} intensity={1.2} />

          {/* Center component precisely centers the 3D model geometry */}
          <Center>
            <LogoModel
              modelPath={modelPath}
              position={[0, 0, 0]}
              rotation={[0, Math.PI, 0]}
              scale={1}
            />
          </Center>

          {/* Dynamically computes camera distance to prevent any edge or comb clipping */}
          <ResponsiveCamera
            fov={12}
            modelWidth={1.65}
            modelHeight={0.54}
            paddingW={1.26}
            paddingH={1.25}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}
