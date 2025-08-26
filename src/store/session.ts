import { useState } from 'react';

export function useSession() {
  const [user, setUser] = useState<string | null>(null);
  return { user, setUser };
}
