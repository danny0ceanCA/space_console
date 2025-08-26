import BackgroundCanvas from '../components/BackgroundCanvas';
import HeaderBar from '../components/HeaderBar';

export default function Hub({ onEnter }: { onEnter: (dept: 'math'|'explore'|'research') => void }) {
  return (
    <div className="relative min-h-screen p-6 space-y-4">
      <BackgroundCanvas mode="bay" imageUrl="/bg-math.jpg" reducedMotion />
      <HeaderBar title="Galactic Hub" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <button onClick={() => onEnter('math')} className="p-4 bg-black/40 rounded border border-white/20">Math Lab</button>
        <button onClick={() => onEnter('explore')} className="p-4 bg-black/40 rounded border border-white/20">Exploration Bay</button>
        <button onClick={() => onEnter('research')} className="p-4 bg-black/40 rounded border border-white/20">Research Deck</button>
      </div>
    </div>
  );
}
