import { useState } from 'react';
import CommandChips from './CommandChips';
import type { Command } from '../lib/commands';

export type Msg = { role: 'assistant' | 'user'; text: string };

export function Console({
  messages,
  onSubmit,
  placeholder,
  commands = [],
}: {
  messages: Msg[];
  onSubmit: (t: string) => void;
  placeholder?: string;
  commands?: Command[];
}) {
  const [input, setInput] = useState('');
  const submit = () => {
    if (!input.trim()) return;
    onSubmit(input);
    setInput('');
  };
  return (
    <div className="bg-black/40 p-4 rounded-lg border border-white/10 flex flex-col h-full max-h-screen overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-2 mb-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === 'assistant' ? 'text-green-300' : 'text-blue-300'}
          >
            {m.text.split(/\n\n+/).map((para, j) => (
              <p key={j} className="mb-2">
                {para}
              </p>
            ))}
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded bg-black/60 border border-white/20 mb-2"
      />
      <CommandChips
        commands={commands}
        onSelect={v => {
          setInput(v);
          submit();
        }}
      />
    </div>
  );
}
