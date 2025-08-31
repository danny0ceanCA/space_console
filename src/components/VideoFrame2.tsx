import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface VideoFrame2Props {
  /**
   * Base name of the media files to rotate through. Any file in
   * `/public/videos` whose name begins with this prefix will be
   * included in the rotation. The match is case-insensitive and
   * whitespace is treated the same as hyphens. Supports both video and
   * PNG image files.
   */
  prefix: string;
  /** Time between video swaps in milliseconds */
  interval?: number;
}

export default function VideoFrame2({ prefix, interval = 15000 }: VideoFrame2Props) {
  // Gather all media assets that start with the provided prefix and
  // construct URLs that point to the backend server instead of the Vite
  // dev server. This allows other devices on the network to load the
  // videos correctly.
  const sources = useMemo(() => {
    // Default to current origin if no backend URL is provided so that the
    // Vite dev server proxy can still serve videos during development.
    const backend = (
      (import.meta as any).env.VITE_BACKEND_URL || window.location.origin
    ).replace(/\/$/, '');

    // Use glob in URL mode so Vite treats public assets as URLs rather than
    // attempting to bundle them. The keys remain the original filenames so we
    // can construct requests to the backend without hashed names.
    const modules = (import.meta as any).glob('/videos/*', {
      eager: true,
      as: 'url',
    });
    const slug = prefix.toLowerCase().replace(/\s+/g, '-');
    return Object.keys(modules)
      .filter((path) => path.toLowerCase().includes(slug))
      .map((path) => {
        const file = path.split('/').pop() as string;
        const ext = file.split('.').pop()?.toLowerCase();
        const type = ext === 'png' ? 'image' : 'video';
        return { url: `${backend}/videos/${file}`, type };
      });
  }, [prefix]);

  const [index, setIndex] = useState(() =>
    sources.length ? Math.floor(Math.random() * sources.length) : 0
  );

  // When the sources change, pick a new random starting index
  useEffect(() => {
    if (sources.length) {
      setIndex(Math.floor(Math.random() * sources.length));
    }
  }, [sources]);

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

