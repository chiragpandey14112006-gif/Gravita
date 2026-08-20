'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useParameterStore } from '../../engine/store/useParameterStore';
import * as THREE from 'three';

export default function MagneticScene() {
  const diskRef = useRef<THREE.Mesh>(null);
  const vaporRef = useRef<THREE.InstancedMesh>(null);
  
  const magneticTemp = useParameterStore(state => state.magneticTemp);
  const magneticFieldStrength = useParameterStore(state => state.magneticFieldStrength);
  
  // Track geometry
  const trackCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5, 0, 0),
      new THREE.Vector3(-2.5, 0, 2.5),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(2.5, 0, -2.5),
      new THREE.Vector3(5, 0, 0),
    ]);
  }, []);

  const vaporCount = 200;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Simple physics simulation loop
  useFrame(({ clock }) => {
    if (!diskRef.current) return;
    
    const t = clock.getElapsedTime();
    
    // Animate disk along track as a baseline
    const position = trackCurve.getPoint(Math.abs(Math.sin(t * 0.2)));
    
    const isSuperconducting = magneticTemp < 0.5;
    const targetHeight = isSuperconducting ? 0.5 + (magneticFieldStrength * 0.5) : 0.05;
    
    diskRef.current.position.set(position.x, THREE.MathUtils.lerp(diskRef.current.position.y, targetHeight, 0.1), position.z);
    
    if (isSuperconducting) {
      diskRef.current.rotation.x = Math.sin(t * 5) * 0.05;
      diskRef.current.rotation.z = Math.cos(t * 4) * 0.05;
    } else {
      diskRef.current.rotation.x = 0;
      diskRef.current.rotation.z = 0;
    }

    // Vapor simulation (boil-off when cooled)
    if (vaporRef.current && isSuperconducting) {
      for (let i = 0; i < vaporCount; i++) {
        const timeOffset = t + i * 0.1;
        
        // Emitted from disk position
        const x = diskRef.current.position.x + Math.sin(timeOffset * 2.1) * 0.3;
        const z = diskRef.current.position.z + Math.cos(timeOffset * 3.2) * 0.3;
        const y = diskRef.current.position.y - 0.2 - ((timeOffset * 0.5) % 1.5); // fall down

        const scale = Math.max(0, 1 - ((timeOffset * 0.5) % 1.5)); // shrink as it falls
        
        dummy.position.set(x, y, z);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        
        vaporRef.current.setMatrixAt(i, dummy.matrix);
      }
      vaporRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const vaporGeo = useMemo(() => new THREE.SphereGeometry(0.05, 8, 8), []);
  const vaporMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.3 }), []);

  return (
    <group>
      {/* The Track */}
      <mesh>
        <tubeGeometry args={[trackCurve, 64, 0.2, 8, false]} />
        <meshStandardMaterial color="#555555" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Superconductor Disk */}
      <mesh ref={diskRef} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
        <meshStandardMaterial 
          color={magneticTemp < 0.5 ? '#ffffff' : '#333333'} 
          emissive={magneticTemp < 0.5 ? '#7CF2C6' : '#000000'}
          emissiveIntensity={magneticTemp < 0.5 ? 0.5 : 0}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
      
      {/* Vapor particles */}
      <instancedMesh ref={vaporRef} args={[vaporGeo, vaporMat, vaporCount]} visible={magneticTemp < 0.5} />

      {/* Floor for reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#05060A" roughness={1} />
      </mesh>
      <gridHelper args={[50, 50, '#222222', '#111111']} position={[0, -1.99, 0]} />
    </group>
  );
}
