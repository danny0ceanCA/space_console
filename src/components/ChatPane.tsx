import { Console, Msg } from './Console';
import type { Command } from '../lib/commands';

export default function ChatPane({ messages, onSubmit, commands }: { messages: Msg[]; onSubmit: (t: string) => void; commands: Command[] }) {
  return (
    <Console messages={messages} onSubmit={onSubmit} placeholder="Type command..." commands={commands} />
  );
}
