import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface VideoFrame2Props {
  /**
   * Base name of the video files to rotate through. Any file in
   * `/public/videos` whose name begins with this prefix will be
   * included in the rotation. The match is case-insensitive and
   * whitespace is treated the same as hyphens.
   */
  prefix: string;
  /** Time between video swaps in milliseconds */
  interval?: number;
}

export default function VideoFrame2({ prefix, interval = 5000 }: VideoFrame2Props) {
  // Gather all video assets that start with the provided prefix.
  const sources = useMemo(() => {
    const modules = (import.meta as any).glob('/public/videos/*', { eager: true, as: 'url' });
    const slug = prefix.toLowerCase().replace(/\s+/g, '-');
    return Object.entries(modules)
      .filter(([path]) => path.toLowerCase().includes(slug))
      .map(([, url]) => url as string);
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
    <div className="relative w-full pb-[56.25%] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.video
          key={src}
          src={src}
          loop
          autoPlay
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover rounded"
          initial={{ opacity: 0, rotate: -10 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 10 }}
          transition={{ duration: 1 }}
        />
      </AnimatePresence>
    </div>
  );
}

