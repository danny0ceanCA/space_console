import { useEffect, useMemo, useState } from "react";

export default function useVideoRotation(baseName: string, intervalMs = 30000) {
  const videos = useMemo(() => {
    const modules = import.meta.glob<string>("/videos/*.mp4", { eager: true });
    return Object.entries(modules)
      .filter(([path]) => path.startsWith(`/videos/${baseName}`))
      .sort(([a], [b]) => {
        const getNum = (p: string) => {
          const m = p.match(/-(\d+)\.mp4$/);
          return m ? parseInt(m[1], 10) : 0;
        };
        return getNum(a) - getNum(b);
      })
      .map(([, url]) => url);
  }, [baseName]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (videos.length <= 1) return;
    const id = setInterval(() => {
      setIndex(i => (i + 1) % videos.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [videos, intervalMs]);

  return videos[index % videos.length] || "";
}
