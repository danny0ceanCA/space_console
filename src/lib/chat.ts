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
  if (!res.body) {
    throw new Error('No response body');
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    onMessage(full);
  }
  return full;
}
