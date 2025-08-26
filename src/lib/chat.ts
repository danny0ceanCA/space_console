export async function streamChat({
  conversationId,
  message,
  system,
  onMessage,
}: {
  conversationId: string;
  message: string;
  system?: string;
  onMessage: (text: string) => void;
}): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, message, system }),
  });
  const data = await res.json();
  const full = typeof data.reply === 'string' ? data.reply : '';
  onMessage(full);
  return full;
}
