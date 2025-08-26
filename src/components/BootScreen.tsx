import { motion } from 'framer-motion';
import BackgroundCanvas from './BackgroundCanvas';

export default function BootScreen({ onDone }: { onDone: () => void }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <BackgroundCanvas mode="boot" />
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <p className="mb-6 text-xl tracking-wider">Booting Galactic Console...</p>
        <button
          onClick={onDone}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded border border-white/30"
        >
          Enter
        </button>
      </motion.div>
    </div>
  );
}
