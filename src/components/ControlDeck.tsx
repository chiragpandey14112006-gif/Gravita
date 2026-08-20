'use client';

import { useParameterStore } from '../engine/store/useParameterStore';
import { Settings, Maximize2, Share2, Info } from 'lucide-react';

export function ControlDeck() {
  const { mode, setMode } = useParameterStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none flex justify-center">
      <div className="pointer-events-auto w-full max-w-4xl bg-panel/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
        
        {/* Header / Mode Switcher */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div className="flex gap-2 bg-black/40 p-1 rounded-lg">
            {(['acoustic', 'magnetic', 'warp'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-4 py-2 rounded-md text-sm font-medium uppercase tracking-wider transition-colors ${
                  mode === m
                    ? 'bg-primary/20 text-primary border border-primary/50'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          
          <div className="flex gap-4 text-white/50">
            <button className="hover:text-white transition-colors"><Info size={20} /></button>
            <button className="hover:text-white transition-colors"><Share2 size={20} /></button>
            <button className="hover:text-white transition-colors"><Settings size={20} /></button>
            <button className="hover:text-white transition-colors"><Maximize2 size={20} /></button>
          </div>
        </div>

        {/* Dynamic Controls based on mode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2">
            {mode === 'magnetic' && <MagneticControls />}
            {mode === 'acoustic' && <AcousticControls />}
            {mode === 'warp' && <WarpControls />}
          </div>
          
          {/* Readout Ticker */}
          <div className="bg-black/50 rounded-xl p-4 font-mono text-xs text-primary border border-primary/20 shadow-[0_0_15px_rgba(124,242,198,0.1)]">
            <div className="flex justify-between border-b border-primary/20 pb-2 mb-2">
              <span className="uppercase text-primary/70">System Status</span>
              <span className="animate-pulse">LIVE</span>
            </div>
            {mode === 'magnetic' && <MagneticReadout />}
            {mode === 'acoustic' && <AcousticReadout />}
            {mode === 'warp' && <WarpReadout />}
          </div>
        </div>
      </div>
    </div>
  );
}

function AcousticControls() {
  const { acousticFreq, acousticElements, setParam } = useParameterStore();
  
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Transducer Frequency</span>
          <span className="font-mono text-secondary">{(acousticFreq / 1000).toFixed(1)} kHz</span>
        </div>
        <input 
          type="range" 
          min="20000" max="60000" step="1000" 
          value={acousticFreq}
          onChange={(e) => setParam('acousticFreq', parseFloat(e.target.value))}
          className="w-full accent-secondary"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Active Elements</span>
          <span className="font-mono text-secondary">{acousticElements}</span>
        </div>
        <input 
          type="range" 
          min="8" max="128" step="8" 
          value={acousticElements}
          onChange={(e) => setParam('acousticElements', parseFloat(e.target.value))}
          className="w-full accent-secondary"
        />
      </div>
    </div>
  );
}

function AcousticReadout() {
  const { acousticFreq, acousticElements } = useParameterStore();
  
  return (
    <div className="space-y-2 text-secondary">
      <div className="flex justify-between">
        <span className="text-secondary/70">Freq:</span>
        <span>{acousticFreq} Hz</span>
      </div>
      <div className="flex justify-between">
        <span className="text-secondary/70">Elements:</span>
        <span>{acousticElements}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-secondary/70">Nodes:</span>
        <span>Stable</span>
      </div>
    </div>
  );
}

function WarpControls() {
  const { warpVelocity, warpBubbleRadius, setParam } = useParameterStore();
  
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Warp Velocity (v/c)</span>
          <span className="font-mono text-warp">{warpVelocity.toFixed(2)} c</span>
        </div>
        <input 
          type="range" 
          min="0" max="2" step="0.05" 
          value={warpVelocity}
          onChange={(e) => setParam('warpVelocity', parseFloat(e.target.value))}
          className="w-full accent-warp"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Bubble Radius</span>
          <span className="font-mono text-warp">{warpBubbleRadius.toFixed(1)} m</span>
        </div>
        <input 
          type="range" 
          min="5" max="30" step="1" 
          value={warpBubbleRadius}
          onChange={(e) => setParam('warpBubbleRadius', parseFloat(e.target.value))}
          className="w-full accent-warp"
        />
      </div>
    </div>
  );
}

function WarpReadout() {
  const { warpVelocity, warpBubbleRadius } = useParameterStore();
  
  return (
    <div className="space-y-2 text-warp">
      <div className="flex justify-between">
        <span className="text-warp/70">v/c:</span>
        <span>{warpVelocity.toFixed(2)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-warp/70">Radius:</span>
        <span>{warpBubbleRadius}m</span>
      </div>
      <div className="flex justify-between">
        <span className="text-warp/70">Exotic Matter:</span>
        <span>Required</span>
      </div>
    </div>
  );
}

function MagneticControls() {
  const { magneticTemp, magneticFieldStrength, setParam } = useParameterStore();
  
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Coolant Temperature</span>
          <span className="font-mono text-primary">{Math.round(magneticTemp * 100)} K</span>
        </div>
        <input 
          type="range" 
          min="0" max="1" step="0.01" 
          value={magneticTemp}
          onChange={(e) => setParam('magneticTemp', parseFloat(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-white/40 uppercase">
          <span>Liquid Nitrogen (77K)</span>
          <span>Room Temp (293K)</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-white/70">Magnetic Field Strength</span>
          <span className="font-mono text-primary">{magneticFieldStrength.toFixed(2)} T</span>
        </div>
        <input 
          type="range" 
          min="0" max="3" step="0.1" 
          value={magneticFieldStrength}
          onChange={(e) => setParam('magneticFieldStrength', parseFloat(e.target.value))}
          className="w-full accent-primary"
        />
      </div>
    </div>
  );
}

function MagneticReadout() {
  const { magneticTemp, magneticFieldStrength } = useParameterStore();
  const isSuperconducting = magneticTemp < 0.5;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-primary/70">State:</span>
        <span>{isSuperconducting ? 'Meissner Effect Active' : 'Normal State'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-primary/70">Flux Pinning:</span>
        <span>{isSuperconducting ? 'LOCKED' : 'NONE'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-primary/70">B-Field:</span>
        <span>{magneticFieldStrength.toFixed(2)} Tesla</span>
      </div>
    </div>
  );
}
