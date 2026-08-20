'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

// Adaptive quality governor: rolling average FPS sampled every 30 frames; 
// if below target, step down quality.

export function PerformanceGovernor() {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  
  useFrame(() => {
    frameCount.current++;
    
    if (frameCount.current >= 30) {
      const now = performance.now();
      const delta = now - lastTime.current;
      const fps = (30 / delta) * 1000;
      
      // Future logic:
      // if (fps < 45) { degrade quality }
      // else if (fps > 55) { increase quality }

      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  return null;
}
