'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useParameterStore } from '../../engine/store/useParameterStore';
import * as THREE from 'three';

export default function AcousticScene() {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  
  const acousticFreq = useParameterStore(state => state.acousticFreq);
  const acousticElements = useParameterStore(state => state.acousticElements);
  
  const particleCount = 20;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!particlesRef.current) return;
    
    const t = clock.getElapsedTime();
    
    // Simulate standing waves. Nodes are pressure minima where particles are stable.
    // The distance between nodes is related to the frequency (wavelength/2).
    // In air, v = 343 m/s. Wavelength = 343 / freq.
    // 40kHz = 0.008575m (8.5mm).
    // We scale this up for visualization.
    const wavelength = (343 / acousticFreq) * 100; // Scaled up
    
    for (let i = 0; i < particleCount; i++) {
      // Find nearest node
      const nodeIndex = (i - particleCount / 2);
      const targetY = nodeIndex * (wavelength / 2);
      
      // Add some jitter based on elements count (fewer elements = less stable trap)
      const stability = acousticElements / 64; 
      const jitterX = (Math.random() - 0.5) * (1 - stability) * 0.2;
      const jitterZ = (Math.random() - 0.5) * (1 - stability) * 0.2;
      
      // Slight vertical oscillation
      const currentY = targetY + Math.sin(t * 10 + i) * 0.05;

      dummy.position.set(jitterX, currentY, jitterZ);
      
      // Rotate the particle slightly
      dummy.rotation.x = t + i;
      dummy.rotation.y = t * 0.5 + i;
      
      dummy.updateMatrix();
      particlesRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    particlesRef.current.instanceMatrix.needsUpdate = true;
  });

  const particleGeo = useMemo(() => new THREE.SphereGeometry(0.1, 16, 16), []);
  const particleMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#FF6B4A', emissive: '#FF6B4A', emissiveIntensity: 0.2 }), []);

  return (
    <group>
      {/* Top Transducer Array */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[2, 2, 0.2, 32]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Bottom Transducer Array */}
      <mesh position={[0, -3, 0]}>
        <cylinderGeometry args={[2, 2, 0.2, 32]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Levitating Particles */}
      <instancedMesh ref={particlesRef} args={[particleGeo, particleMat, particleCount]} />

      <gridHelper args={[50, 50, '#222222', '#111111']} position={[0, -3.1, 0]} />
    </group>
  );
}
