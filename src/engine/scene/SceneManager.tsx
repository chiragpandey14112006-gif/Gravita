'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stats, Sparkles, Stars } from '@react-three/drei';
import { useParameterStore } from '../store/useParameterStore';
import { Suspense, lazy, useRef } from 'react';
import * as THREE from 'three';

// Lazy load modules
const MagneticModule = lazy(() => import('../../modules/magnetic/MagneticScene'));
const AcousticModule = lazy(() => import('../../modules/acoustic/AcousticScene'));
const WarpModule = lazy(() => import('../../modules/warp/WarpScene'));

function LiveBackground() {
  const bgRef = useRef<THREE.Group>(null);
  const raysRef = useRef<THREE.Group>(null);
  const tunnelRef = useRef<THREE.Mesh>(null);
  
  useFrame((_state, delta) => {
    if (raysRef.current) {
      raysRef.current.rotation.z += delta * 0.2;
    }
    if (tunnelRef.current) {
      tunnelRef.current.rotation.z -= delta * 0.05;
    }
  });

  return (
    <group ref={bgRef} position={[0, 5, -40]} scale={2}>
      {/* Central Bright Ring */}
      <mesh>
        <torusGeometry args={[8, 0.2, 16, 100]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* Inner Cyan Glow Ring */}
      <mesh position={[0, 0, -1]}>
        <torusGeometry args={[8.5, 0.5, 16, 100]} />
        <meshBasicMaterial color="#7CF2C6" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Outer Blue/Violet Glow Ring */}
      <mesh position={[0, 0, -2]}>
        <torusGeometry args={[10, 1.5, 16, 100]} />
        <meshBasicMaterial color="#0055ff" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Radiating Light Rays */}
      <group ref={raysRef}>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 6]}>
            <planeGeometry args={[0.5, 60]} />
            <meshBasicMaterial 
              color="#7CF2C6" 
              transparent 
              opacity={0.15} 
              blending={THREE.AdditiveBlending} 
              depthWrite={false} 
            />
          </mesh>
        ))}
      </group>

      {/* Tunnel / Perspective Lines */}
      <mesh ref={tunnelRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 10]}>
        <cylinderGeometry args={[12, 40, 80, 24, 24, true]} />
        <meshBasicMaterial color="#0088ff" wireframe transparent opacity={0.1} depthWrite={false} />
      </mesh>
      
      {/* Dark Void Center */}
      <mesh position={[0, 0, -5]}>
        <circleGeometry args={[7.8, 32]} />
        <meshBasicMaterial color="#000000" depthWrite={false} />
      </mesh>

      {/* Ambient floating dust moving outward */}
      <Sparkles count={500} scale={40} size={3} speed={0.8} opacity={0.4} color="#7CF2C6" position={[0, 0, 15]} />
      <Stars radius={10} depth={50} count={2000} factor={4} saturation={1} fade speed={2} />
    </group>
  );
}

export function SceneManager() {
  const mode = useParameterStore((state) => state.mode);

  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]} // Adaptive pixel ratio limit
      >
        <color attach="background" args={['#05060A']} />
        <fog attach="fog" args={['#05060A', 30, 120]} />
        
        <LiveBackground />
        
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        
        <Suspense fallback={null}>
          {mode === 'magnetic' && <MagneticModule />}
          {mode === 'acoustic' && <AcousticModule />}
          {mode === 'warp' && <WarpModule />}
        </Suspense>

        <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
      </Canvas>
    </div>
  );
}
