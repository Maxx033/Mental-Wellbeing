import { motion } from 'framer-motion';

/**
 * Bellows Breath – rapid rhythmic breathing.
 * Uses the pulse-bellows keyframe from index.css for a pumping animation
 * combined with a Framer Motion instruction overlay.
 */
export default function BellowsBreath() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl sm:text-3xl font-semibold text-slate-blue-600 tracking-wide text-center"
      >
        Bellows Breath
      </motion.p>

      <p className="text-sage-600 text-sm sm:text-base text-center max-w-xs leading-relaxed">
        Breathe rapidly in and out through your nose, keeping your mouth closed.
        Match the rhythm of the pulse.
      </p>

      {/* Pulsing circle */}
      <div className="relative flex items-center justify-center w-52 h-52 sm:w-72 sm:h-72">
        <div className="absolute inset-0 rounded-full bg-slate-blue-200/40 blur-xl animate-bellows" />
        <div
          className="w-44 h-44 sm:w-60 sm:h-60 rounded-full flex items-center justify-center animate-bellows"
          style={{
            background:
              'radial-gradient(circle, var(--color-slate-blue-300) 0%, var(--color-slate-blue-400) 60%, var(--color-slate-blue-500) 100%)',
            boxShadow: '0 0 60px rgba(99,119,193,0.40)',
          }}
        >
          <motion.span
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            className="text-cream-50 text-lg sm:text-2xl font-bold tracking-wider select-none"
          >
            PULSE
          </motion.span>
        </div>
      </div>

      <p className="text-sage-500 text-xs sm:text-sm italic">
        Continue for the duration of the timer
      </p>
    </div>
  );
}
