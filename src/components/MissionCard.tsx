import { deptAccent, Dept } from '../lib/theme';

interface MathData { prompt: string }
interface ExploreData { prompt: string; options: string[] }
interface ResearchData { prompt: string; suggestion?: string }

type Props =
  | { mode: 'math'; data: MathData; onAnswer: (n: number) => void; onHint: () => void; onSteps: () => void; onNext: () => void }
  | { mode: 'explore'; data: ExploreData }
  | { mode: 'research'; data: ResearchData };

export default function MissionCard(props: Props) {
  const { mode, data } = props as any;
  return (
    <div className={`p-4 rounded-lg bg-black/40 border border-white/10 ${deptAccent(mode as Dept)}`}>
      <h2 className="text-lg mb-2">Mission</h2>
      {'prompt' in data && <p className="mb-4">{data.prompt}</p>}
      {mode === 'math' && 'onAnswer' in props && (
        <div className="flex gap-2">
          <button onClick={() => (props as any).onHint()} className="px-2 py-1 bg-white/10 rounded">Hint</button>
          <button onClick={() => (props as any).onSteps()} className="px-2 py-1 bg-white/10 rounded">Steps</button>
          <button onClick={() => (props as any).onAnswer(42)} className="px-2 py-1 bg-white/10 rounded">Answer 42</button>
        </div>
      )}
      {mode === 'explore' && 'options' in data && (
        <ul className="list-disc list-inside">
          {data.options.map((o: string) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      )}
      {mode === 'research' && 'suggestion' in data && (
        <p className="text-sm text-white/60">{data.suggestion}</p>
      )}
    </div>
  );
}
