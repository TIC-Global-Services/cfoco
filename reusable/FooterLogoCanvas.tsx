"use client";

import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { Center, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Preload 3D model asset
useGLTF.preload("/cfc_logo.glb");

function LogoModel({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * ResponsiveCamera calculates the exact camera distance to fit the CFOCO 3D logo
 * inside any viewport without ANY clipping on mobile, iPhone, tablet, or desktop.
 * It accounts for both width and height with safe padding.
 */
function ResponsiveCamera({
  modelWidth = 1.875,
  modelHeight = 0.576,
}: {
  modelWidth?: number;
  modelHeight?: number;
}) {
  const { camera, size, invalidate } = useThree();

  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const fov = 38;
    const tanHalf = Math.tan((fov * Math.PI) / 360);

    // Provide 18% breathing room on width, 25% on height
    // Guarantees rooster comb, feet, and outer 'C'/'O' letters are NEVER cut off
    const targetW = modelWidth * 1.18;
    const targetH = modelHeight * 1.25;

    const zForW = targetW / (2 * tanHalf * aspect);
    const zForH = targetH / (2 * tanHalf);
    const z = Math.max(zForW, zForH, 1.2);

    camera.position.set(0, 0, z);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    // Demand frameloop needs invalidate to paint on camera update
    invalidate();
  }, [camera, size, modelWidth, modelHeight, invalidate]);

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
          // "demand" frameloop only redraws when mounted, resized, or updated,
          // saving 100% idle GPU on iPhone/mobile and preventing thermal throttling
          frameloop="demand"
          // Cap DPR at 1.5 to prevent massive 3x retina framebuffers that crash mobile Safari
          dpr={isMobile ? [1, 1.2] : [1, 1.5]}
          camera={{ position: [0, 0, 5], fov: 38 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "default",
            depth: true,
            stencil: false,
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.15;

            // Graceful WebGL context recovery for iOS Safari low-memory scenarios
            const canvasEl = gl.domElement;
            canvasEl.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              console.warn("Footer WebGL Context Lost. Switching to fallback image.");
              setContextLost(true);
            });
          }}
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[3, 4, 5]} intensity={2.2} />
          <directionalLight position={[-3, -2, 2]} intensity={1.2} />

          {/* Center component precisely centers the 3D model geometry at (0, 0, 0) */}
          <Center>
            <LogoModel modelPath={modelPath} />
          </Center>

          {/* Dynamically computes camera distance to prevent any edge or comb clipping */}
          <ResponsiveCamera />
        </Canvas>
      </Suspense>
    </div>
  );
}