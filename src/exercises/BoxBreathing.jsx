import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PHASES = [
  { label: 'Breathe In', duration: 4000, scale: 1.0 },
  { label: 'Hold', duration: 4000, scale: 1.0 },
  { label: 'Breathe Out', duration: 4000, scale: 0.55 },
  { label: 'Hold', duration: 4000, scale: 0.55 },
];

/**
 * Box Breathing – a 4-phase cycle (in → hold → out → hold, 4 s each).
 * Renders a breathing circle that scales with each phase.
 */
export default function BoxBreathing() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phase = PHASES[phaseIndex];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPhaseIndex((i) => (i + 1) % PHASES.length);
    }, phase.duration);
    return () => clearTimeout(timeout);
  }, [phaseIndex, phase.duration]);

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* Phase label */}
      <motion.p
        key={phase.label + phaseIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl sm:text-3xl font-semibold text-sage-700 tracking-wide"
      >
        {phase.label}
      </motion.p>

      {/* Breathing circle */}
      <div className="relative flex items-center justify-center w-52 h-52 sm:w-72 sm:h-72">
        {/* Glow ring */}
        <motion.div
          animate={{ scale: phase.scale }}
          transition={{ duration: phase.duration / 1000, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-sage-200/50 blur-xl"
        />
        {/* Main circle */}
        <motion.div
          animate={{ scale: phase.scale }}
          transition={{ duration: phase.duration / 1000, ease: 'easeInOut' }}
          className="w-44 h-44 sm:w-60 sm:h-60 rounded-full flex items-center justify-center"
          style={{
            background:
              'radial-gradient(circle, var(--color-sage-300) 0%, var(--color-sage-400) 60%, var(--color-sage-500) 100%)',
            boxShadow: '0 0 60px rgba(134,163,151,0.45)',
          }}
        >
          <span className="text-cream-50 text-lg sm:text-2xl font-medium select-none">
            {Math.ceil(phase.duration / 1000)}s
          </span>
        </motion.div>
      </div>

      {/* Phase indicators */}
      <div className="flex gap-2">
        {PHASES.map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              i === phaseIndex ? 'bg-sage-500' : 'bg-sage-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
