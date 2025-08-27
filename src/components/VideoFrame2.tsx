import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface VideoFrame2Props {
  sources: string[];
  interval?: number;
}

export default function VideoFrame2({ sources, interval = 5000 }: VideoFrame2Props) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * sources.length));

  useEffect(() => {
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

