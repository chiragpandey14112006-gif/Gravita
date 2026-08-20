import { create } from 'zustand';

export type SimulationMode = 'acoustic' | 'magnetic' | 'warp';

interface ParameterState {
  mode: SimulationMode;
  setMode: (mode: SimulationMode) => void;
  
  // Acoustic Levitation params
  acousticFreq: number;
  acousticElements: number;
  
  // Magnetic Levitation params
  magneticTemp: number; // 0 = below Tc, 1 = above Tc
  magneticFieldStrength: number;
  magneticTrackShape: 'straight' | 'loop' | 'wavy';
  
  // Warp params
  warpVelocity: number;
  warpBubbleRadius: number;

  setParam: <K extends keyof Omit<ParameterState, 'setParam' | 'setMode'>>(key: K, value: ParameterState[K]) => void;
}

export const useParameterStore = create<ParameterState>((set) => ({
  mode: 'magnetic', // Starting with magnetic for Phase 1
  setMode: (mode) => set({ mode }),

  acousticFreq: 40000,
  acousticElements: 64,

  magneticTemp: 1.0,
  magneticFieldStrength: 1.0,
  magneticTrackShape: 'straight',

  warpVelocity: 0.5,
  warpBubbleRadius: 10,

  setParam: (key, value) => set((state) => ({ ...state, [key]: value })),
}));
