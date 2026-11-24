"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Center, Preload, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Preload 3D model asset immediately so it downloads when the user opens the page
// useGLTF.preload("/footerlogo9.glb");

export function preloadFooterLogo(path: string = "/footerlogo9.glb") {
  if (typeof window !== "undefined") {
    try {
      useGLTF.preload(path);
    } catch {
      // Ignore
    }
  }
}

if (typeof window !== "undefined") {
  preloadFooterLogo("/footerlogo9.glb");
}

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
 * Ensures the demand frameloop paints the canvas immediately upon model load
 */
function SceneReady() {
  const { invalidate } = useThree();

  useEffect(() => {
    invalidate();
  }, [invalidate]);

  return null;
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
      // eslint-disable-next-line react-hooks/immutability
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

export default function FooterLogoCanvas({
  modelPath = "/footerlogo9.glb",
}: {
  modelPath?: string;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    preloadFooterLogo(modelPath);
  }, [modelPath]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="relative w-full h-full pointer-events-none select-none touch-none"
      role="img"
      aria-label="CFOCO 3D logo"
    >
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
        }}
      >
        {/* Tuned Lighting Setup */}
        <ambientLight intensity={4.4} />
        <directionalLight position={[3, 4, 5]} intensity={3.6} />
        <directionalLight position={[-3, -2, 2]} intensity={1.2} />

        <Suspense fallback={null}>
          {/* Center component precisely centers the 3D model geometry */}
          <Center>
            <LogoModel
              modelPath={modelPath}
              position={[0, 0, 0]}
              rotation={[0, Math.PI, 0]}
              scale={0.90}
            />
          </Center>
          <Preload all />
          <SceneReady />
        </Suspense>

        {/* Dynamically computes camera distance to prevent any edge or comb clipping */}
        <ResponsiveCamera
          fov={12}
          modelWidth={1.65}
          modelHeight={0.54}
          paddingW={1.26}
          paddingH={1.25}
        />
      </Canvas>
    </div>
  );
}
