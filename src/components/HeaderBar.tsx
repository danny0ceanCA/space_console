import { ArrowLeft } from "lucide-react";

export default function HeaderBar({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <header className="w-full px-6 py-4 bg-black/40 backdrop-blur border-b border-white/10 flex items-center gap-4">
      {onBack && (
        <button
          onClick={onBack}
          className="p-2 rounded bg-white/10 hover:bg-white/20 border border-white/20"
        >
          <ArrowLeft size={16} />
          <span className="sr-only">Back to hub</span>
        </button>
      )}
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}
