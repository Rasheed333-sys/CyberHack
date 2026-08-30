import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function CyclingStatus({ labels, intervalMs = 1400 }: { labels: string[]; intervalMs?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (labels.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % labels.length), intervalMs);
    return () => clearInterval(id);
  }, [labels, intervalMs]);

  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-cyan">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-blink" />
      <AnimatePresence mode="wait">
        <motion.span
          key={labels[index]}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.18 }}
        >
          {labels[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}