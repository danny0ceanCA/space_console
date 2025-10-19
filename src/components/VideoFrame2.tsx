import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface MediaSource {
  url: string;
  type: 'image' | 'video';
}

interface VideoFrame2Props {
  /**
   * Base name of the media files to rotate through. Any file in
   * `/videos` whose name begins with this prefix will be included in the
   * rotation. The match is case-insensitive and whitespace is treated the
   * same as hyphens. Supports both video and PNG image files.
   */
  prefix: string;
  /** Time between video swaps in milliseconds */
  interval?: number;
}

export default function VideoFrame2({ prefix, interval = 15000 }: VideoFrame2Props) {
  const backend = useMemo(() => {
    const envBackend = ((import.meta as any).env.VITE_BACKEND_URL || '').trim();
    return envBackend ? envBackend.replace(/\/$/, '') : '';
  }, []);

  const [sources, setSources] = useState<MediaSource[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const slug = prefix.toLowerCase().replace(/\s+/g, '-');

    async function load() {
      try {
        const url = backend
          ? `${backend}/api/media?prefix=${encodeURIComponent(slug)}`
          : `/api/media?prefix=${encodeURIComponent(slug)}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Media request failed with status ${res.status}`);
        }
        const payload = await res.json();
        const items = Array.isArray(payload?.files) ? payload.files : [];
        const mapped = items
          .map((item: any) => {
            if (!item || typeof item !== 'object') return null;
            const type: MediaSource['type'] = item.type === 'image' ? 'image' : 'video';
            const rawUrl = typeof item.url === 'string' ? item.url : '';
            if (!rawUrl) return null;
            const normalized = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
            const url = backend ? `${backend}${normalized}` : normalized;
            return { url, type } satisfies MediaSource;
          })
          .filter(Boolean) as MediaSource[];
        setSources(mapped);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Failed to load media sources', err);
        setSources([]);
      }
    }

    load();
    return () => controller.abort();
  }, [prefix, backend]);

  useEffect(() => {
    if (sources.length) {
      setIndex(Math.floor(Math.random() * sources.length));
    } else {
      setIndex(0);
    }
  }, [sources]);

  // Cycle through available sources on a timer when more than one item exists
  useEffect(() => {
    if (sources.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => {
        if (sources.length <= 1) return prev;
        let next = prev;
        while (next === prev) {
          next = Math.floor(Math.random() * sources.length);
        }
        return next;
      });
    }, interval);
    return () => clearInterval(id);
  }, [sources, interval]);

  const src = sources[index];
  if (!src) return null;

  return (
    <div className="relative w-full pb-[85.25%] overflow-hidden">
      <AnimatePresence mode="wait">
        {src.type === 'video' ? (
          <motion.video
            key={src.url}
            src={src.url}
            loop
            autoPlay
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover rounded"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 0 }}
            transition={{ duration: 1 }}
          />
        ) : (
          <motion.img
            key={src.url}
            src={src.url}
            className="absolute top-0 left-0 w-full h-full object-cover rounded"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 0 }}
            transition={{ duration: 1 }}
            alt=""
          />
        )}
      </AnimatePresence>
    </div>
  );
}

