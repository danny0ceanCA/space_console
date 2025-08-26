import { useState } from 'react';
import BackgroundCanvas from './BackgroundCanvas';

export default function Identification({ onIdentified }: { onIdentified: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <BackgroundCanvas mode="bay" imageUrl="/bg-math.jpg" reducedMotion />
      <div className="bg-black/50 p-6 rounded border border-white/20 backdrop-blur text-center">
        <h2 className="mb-4 text-xl">Identify Yourself</h2>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          className="px-3 py-2 rounded bg-black/40 border border-white/20 mb-4 w-64"
          placeholder="Callsign"
        />
        <button
          onClick={() => name && onIdentified(name)}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded border border-white/30"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
