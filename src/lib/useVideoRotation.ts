import { useEffect, useState } from "react";

/**
 * Rotate through a set of videos that share a base filename.
 * Files must follow the naming pattern `/videos/${baseName}-N.mp4`.
 * The hook discovers available files via HEAD requests and cycles
 * through them on an interval.
 */
export default function useVideoRotation(baseName: string, intervalMs = 10000) {
  const [urls, setUrls] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function discover() {
      const found: string[] = [];
      for (let i = 1; ; i++) {
        const url = `/videos/${baseName}-${i}.mp4`;
        try {
          const res = await fetch(url, { method: "HEAD" });
          if (!res.ok) break;
          found.push(url);
        } catch {
          break;
        }
      }
      if (!cancelled && found.length) {
        setUrls(found);
      }
    }
    discover();
    return () => {
      cancelled = true;
    };
  }, [baseName]);

  useEffect(() => {
    if (urls.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % urls.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [urls, intervalMs]);

  return urls[index];
}

