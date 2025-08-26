export default function HeaderBar({ title }: { title: string }) {
  return (
    <header className="w-full px-6 py-4 bg-black/40 backdrop-blur border-b border-white/10">
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}
