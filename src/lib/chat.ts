export async function streamChat({
  conversationId,
  message,
  system,
  max_completion_tokens,
  onMessage,
}: {
  conversationId: string;
  message: string;
  system?: string;
  max_completion_tokens?: number;
  onMessage: (text: string) => void;
}): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, message, system, max_completion_tokens }),
  });
  const data = await res.json();
  const full = typeof data.reply === 'string' ? data.reply : '';
  onMessage(full);
  return full;
}
