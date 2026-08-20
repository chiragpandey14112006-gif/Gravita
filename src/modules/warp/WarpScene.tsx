'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useParameterStore } from '../../engine/store/useParameterStore';
import * as THREE from 'three';

export default function WarpScene() {
  const gridRef = useRef<THREE.Mesh>(null);
  
  const warpVelocity = useParameterStore(state => state.warpVelocity);
  const warpBubbleRadius = useParameterStore(state => state.warpBubbleRadius);

  // Custom shader for warp grid deformation
  const customMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      velocity: { value: warpVelocity },
      radius: { value: warpBubbleRadius },
      color: { value: new THREE.Color('#B98CFF') }
    },
    vertexShader: `
      uniform float time;
      uniform float velocity;
      uniform float radius;
      varying vec3 vPos;
      
      void main() {
        vPos = position;
        vec3 pos = position;
        
        // Simple Alcubierre deformation approximation
        // The bubble moves forward along Z.
        float bubbleZ = (fract(time * velocity * 0.1) - 0.5) * 50.0; 
        
        float distToBubble = length(vec3(pos.x, 0.0, pos.z - bubbleZ));
        
        // Shape function f(rs)
        float sigma = 2.0; // wall thickness
        float f = (tanh(sigma * (distToBubble + radius)) - tanh(sigma * (distToBubble - radius))) / (2.0 * tanh(sigma * radius));
        
        // Deformation
        if (distToBubble > radius * 0.5 && distToBubble < radius * 1.5) {
          // Stretch and compress space
          pos.y += f * 2.0 * (1.0 - distToBubble/radius) * sin(distToBubble * 3.14);
        }
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying vec3 vPos;
      void main() {
        // Grid pattern
        float gridX = step(0.95, fract(vPos.x * 2.0));
        float gridZ = step(0.95, fract(vPos.z * 2.0));
        float grid = max(gridX, gridZ);
        
        if (grid < 0.5) discard;
        
        float dist = length(vPos);
        float alpha = 1.0 - smoothstep(10.0, 30.0, dist);
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    wireframe: false,
    side: THREE.DoubleSide
  });

  useFrame(({ clock }) => {
    if (gridRef.current) {
      const material = gridRef.current.material as THREE.ShaderMaterial;
      material.uniforms.time.value = clock.getElapsedTime();
      material.uniforms.velocity.value = warpVelocity;
      material.uniforms.radius.value = warpBubbleRadius;
    }
  });

  return (
    <group>
      {/* Ship */}
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.5, 2, 8]} />
        <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
        <pointLight color="#B98CFF" intensity={2} distance={10} />
      </mesh>

      {/* Deformable Space Grid */}
      <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[100, 100, 200, 200]} />
        <primitive object={customMaterial} attach="material" />
      </mesh>
    </group>
  );
}
