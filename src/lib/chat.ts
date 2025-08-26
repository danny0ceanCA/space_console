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
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (!line) continue;
      try {
        const obj = JSON.parse(line);
        if (typeof obj.reply === 'string') {
          full += obj.reply;
          onMessage(full);
        }
      } catch {
        full += line;
        onMessage(full);
      }
    }
  }
  if (buffer.trim()) {
    try {
      const obj = JSON.parse(buffer.trim());
      if (typeof obj.reply === 'string') {
        full += obj.reply;
      } else {
        full += buffer.trim();
      }
    } catch {
      full += buffer.trim();
    }
    onMessage(full);
  }
  return full;
}
