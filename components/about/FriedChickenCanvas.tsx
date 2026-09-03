"use client";

import React, { useRef, useMemo, Suspense, useState, useEffect } from "react";
import Image from "next/image";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Float, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface ModelProps {
  activePhase: number; // 0: Quality (initial), 1: Conviviality, 2: Speed, 3: Quality (last)
  scrollProgress: number; // 0 to 1
  onLoaded?: () => void;
}

function ChickenModel({ activePhase, scrollProgress, onLoaded }: ModelProps) {
  const gltf = useGLTF("/Crispy-FriedChicken.glb");
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (gltf?.scene && onLoaded) {
      onLoaded();
    }
  }, [gltf, onLoaded]);

  const targetRotation = useMemo(() => new THREE.Euler(), []);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);

  // Standard Quality Rest Pose (matching the reference image: bulb top-left, bone bottom-right)
  const QUALITY_ROTATION = { x: 0.15, y: -0.2, z: -0.42 };
  const QUALITY_POSITION = { x: 0, y: -0.05, z: 0 };

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const idleFloatX = Math.sin(state.clock.elapsedTime * 1.4) * 0.03;
    const idleFloatZ = Math.cos(state.clock.elapsedTime * 1.1) * 0.03;

    // Timeline transitions:
    // 0.00 - 0.25: Quality (initial)
    // 0.25 - 0.55: Conviviality (moves/tilts left)
    // 0.55 - 0.80: Speed (moves/tilts right)
    // 0.80 - 1.00: Quality (last - returns to quality position)

    if (scrollProgress < 0.25) {
      targetRotation.set(
        QUALITY_ROTATION.x + idleFloatX,
        QUALITY_ROTATION.y,
        QUALITY_ROTATION.z + idleFloatZ
      );
      targetPosition.set(QUALITY_POSITION.x, QUALITY_POSITION.y, QUALITY_POSITION.z);
    } else if (scrollProgress < 0.55) {
      const t = (scrollProgress - 0.25) / 0.3;
      targetRotation.set(
        THREE.MathUtils.lerp(QUALITY_ROTATION.x, 0.1, t) + idleFloatX,
        THREE.MathUtils.lerp(QUALITY_ROTATION.y, -1.05, t),
        THREE.MathUtils.lerp(QUALITY_ROTATION.z, -0.85, t) + idleFloatZ
      );
      targetPosition.set(
        THREE.MathUtils.lerp(0, -0.22, t),
        THREE.MathUtils.lerp(-0.05, 0.08, t),
        THREE.MathUtils.lerp(0, 0.15, t)
      );
    } else if (scrollProgress < 0.8) {
      const t = (scrollProgress - 0.55) / 0.25;
      targetRotation.set(
        THREE.MathUtils.lerp(0.1, 0.35, t) + idleFloatX,
        THREE.MathUtils.lerp(-1.05, 0.95, t),
        THREE.MathUtils.lerp(-0.85, 0.55, t) + idleFloatZ
      );
      targetPosition.set(
        THREE.MathUtils.lerp(-0.22, 0.22, t),
        THREE.MathUtils.lerp(0.08, 0.05, t),
        THREE.MathUtils.lerp(0.15, 0.15, t)
      );
    } else {
      const t = (scrollProgress - 0.8) / 0.2;
      targetRotation.set(
        THREE.MathUtils.lerp(0.35, QUALITY_ROTATION.x, t) + idleFloatX,
        THREE.MathUtils.lerp(0.95, QUALITY_ROTATION.y, t),
        THREE.MathUtils.lerp(0.55, QUALITY_ROTATION.z, t) + idleFloatZ
      );
      targetPosition.set(
        THREE.MathUtils.lerp(0.22, QUALITY_POSITION.x, t),
        THREE.MathUtils.lerp(0.05, QUALITY_POSITION.y, t),
        THREE.MathUtils.lerp(0.15, QUALITY_POSITION.z, t)
      );
    }

    // Smooth physics damping
    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      targetRotation.x,
      6,
      delta
    );
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetRotation.y,
      6,
      delta
    );
    groupRef.current.rotation.z = THREE.MathUtils.damp(
      groupRef.current.rotation.z,
      targetRotation.z,
      6,
      delta
    );

    groupRef.current.position.x = THREE.MathUtils.damp(
      groupRef.current.position.x,
      targetPosition.x,
      5,
      delta
    );
    groupRef.current.position.y = THREE.MathUtils.damp(
      groupRef.current.position.y,
      targetPosition.y,
      5,
      delta
    );
    groupRef.current.position.z = THREE.MathUtils.damp(
      groupRef.current.position.z,
      targetPosition.z,
      5,
      delta
    );
  });

  return (
    <group ref={groupRef}>
      <primitive
        object={gltf.scene}
        scale={0.95}
        position={[0, 0, 0]}
      />
    </group>
  );
}

// Fallback image component
export function FallbackChicken({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-[180px] h-[220px] sm:w-[220px] sm:h-[270px] drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)] ${className}`}>
      <Image
        src="/fried_chicken.png"
        alt="Crispy Fried Chicken Drumstick"
        fill
        priority
        className="object-contain"
      />
    </div>
  );
}

// Preload model
if (typeof window !== "undefined") {
  useGLTF.preload("/Crispy-FriedChicken.glb");
}

export default function FriedChickenCanvas({
  activePhase,
  scrollProgress,
}: ModelProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="w-full h-full relative flex items-center justify-center cursor-grab active:cursor-grabbing">
      {/* Fallback Image shown while loading or if WebGL encounters an issue */}
      {(!isLoaded || hasError) && (
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
            isLoaded && !hasError ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <FallbackChicken />
        </div>
      )}

      {!hasError && (
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 4.4], fov: 38 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
            stencil: false,
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
          onError={() => setHasError(true)}
          className={`w-full h-full transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Studio lighting tailored for crispy golden texture */}
          <ambientLight intensity={0.7} />
          
          <directionalLight
            position={[4, 5, 4]}
            intensity={2.2}
            color="#fff5ea"
          />

          <directionalLight
            position={[-4, 2, -3]}
            intensity={1.4}
            color="#38bdf8"
          />

          <directionalLight
            position={[0, -4, 2]}
            intensity={0.6}
            color="#f59e0b"
          />

          <pointLight
            position={
              activePhase === 1
                ? [-2.5, 0.5, 2]
                : activePhase === 2
                ? [2.5, 0.5, 2]
                : [0, -2, 2]
            }
            intensity={1.8}
            color="#ef4444"
            distance={6}
          />

          <Suspense fallback={null}>
            <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.2}>
              <ChickenModel
                activePhase={activePhase}
                scrollProgress={scrollProgress}
                onLoaded={() => setIsLoaded(true)}
              />
            </Float>
          </Suspense>

          <ContactShadows
            position={[0, -1.3, 0]}
            opacity={0.35}
            scale={3.5}
            blur={2.0}
            far={3}
            color="#000000"
          />
        </Canvas>
      )}
    </div>
  );
}
