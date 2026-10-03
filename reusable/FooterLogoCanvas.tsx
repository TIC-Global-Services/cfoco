"use client";

import { Suspense, useRef } from "react";
import { Bounds, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function LogoModel({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // state.pointer contains normalized mouse coordinates (-1 to 1)
    const targetX = (state.pointer.y * Math.PI) / 42; // up/down tilt (very subtle)
    const targetY = (state.pointer.x * Math.PI) / 42; // left/right tilt (very subtle)

    // Smoothly interpolate current rotation towards the target rotation
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      Math.PI / 2 - targetX,
      0.08
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetY,
      0.08
    );
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 2, 0, 0]}>
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