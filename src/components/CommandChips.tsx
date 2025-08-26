import { Command } from '../lib/commands';

export default function CommandChips({ commands, onSelect }: { commands: Command[]; onSelect: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {commands.map(c => (
        <button
          key={c.value}
          onClick={() => onSelect(c.value)}
          className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 rounded"
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
