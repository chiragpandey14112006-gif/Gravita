import { SceneManager } from '../engine/scene/SceneManager';
import { ControlDeck } from '../components/ControlDeck';

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-void">
      {/* Background 3D Canvas */}
      <SceneManager />

      {/* Title / Marketing Shell (Top Left) */}
      <div className="absolute top-8 left-8 pointer-events-none z-10">
        <h1 className="text-4xl font-sans font-bold tracking-tight text-white drop-shadow-lg">
          Gravita <span className="text-primary font-mono text-2xl font-normal ml-2">v0.1</span>
        </h1>
        <p className="text-white/70 font-sans mt-2 max-w-sm">
          An Interactive 3D Theoretical Physics Sandbox.
        </p>
      </div>

      {/* UI Controls overlay */}
      <ControlDeck />
    </main>
  );
}
