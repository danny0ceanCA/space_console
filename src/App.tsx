import { useState } from 'react';
import BootScreen from './components/BootScreen';
import Identification from './components/Identification';
import Hub from './pages/Hub';
import MathLab from './pages/MathLab';
import ExplorationBay from './pages/ExplorationBay';
import ResearchDeck from './pages/ResearchDeck';

export default function App() {
  const [stage, setStage] = useState<'boot'|'identify'|'hub'|'math'|'explore'|'research'>('boot');
  const [name, setName] = useState('');

  if (stage === 'boot') return <BootScreen onDone={() => setStage('identify')} />;
  if (stage === 'identify') return <Identification onIdentified={n => { setName(n); setStage('hub'); }} />;
  if (stage === 'hub') return <Hub onEnter={dept => setStage(dept)} />;
  if (stage === 'math') return <MathLab onReturn={() => setStage('hub')} />;
  if (stage === 'explore') return <ExplorationBay onReturn={() => setStage('hub')} />;
  if (stage === 'research') return <ResearchDeck onReturn={() => setStage('hub')} />;
  return null;
}
