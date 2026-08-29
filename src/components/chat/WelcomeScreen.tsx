import { motion } from 'framer-motion';

export default function WelcomeScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mx-auto mb-5 h-10 w-10 rounded-sm border border-neon/40 bg-neon/10 flex items-center justify-center">
          <span className="text-neon font-mono text-lg font-bold">C</span>
        </div>
        <h1 className="font-mono text-2xl sm:text-3xl font-semibold tracking-tight text-glow">
          CYBER<span className="text-neon">HACK</span>
        </h1>
        <p className="mt-2 text-sm text-white/50">Your private gateway to the web.</p>
        <p className="mt-4 max-w-md mx-auto text-xs text-white/35 leading-relaxed font-mono">
          Search. Research. Browse. Understand.
          <br />
          Designed with privacy and security at its core.
        </p>
      </motion.div>
    </div>
  );
}