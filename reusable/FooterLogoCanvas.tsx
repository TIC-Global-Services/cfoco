"use client";

import { Suspense } from "react";
import { Bounds, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

function LogoModel({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

export default function FooterLogoCanvas({ modelPath }: { modelPath: string }) {
  // Check mobile purely for dpr scaling
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;

  return (
    <div className="h-full w-full cursor-default" role="img" aria-label="CFOCO 3D logo">
      <Canvas
        dpr={isMobile ? 1 : [1, 1.2]}
        camera={{ position: [0, 0, 5], fov: 38 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[3, 4, 5]} intensity={2} />
        <directionalLight position={[-3, -2, 2]} intensity={1} />
        <Suspense fallback={null}>
          <Bounds fit clip margin={0.45}>
            <LogoModel modelPath={modelPath} />
          </Bounds>
        </Suspense>
      </Canvas>
    </div>
  );
}