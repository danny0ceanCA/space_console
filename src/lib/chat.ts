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
  if (!res.ok) {
    const errorMessage = typeof data?.error === 'string' ? data.error : 'Chat request failed.';
    throw new Error(errorMessage);
  }
  if (typeof data.reply !== 'string' || !data.reply.trim()) {
    throw new Error('Received an empty response from the assistant.');
  }
  onMessage(data.reply);
  return data.reply;
}
