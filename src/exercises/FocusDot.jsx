import { motion } from 'framer-motion';

/**
 * Point of Focus – a slowly moving dot the user tracks with their eyes.
 * Uses the focus-dot keyframe animation from index.css.
 */
export default function FocusDot() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl sm:text-3xl font-semibold text-sage-700 tracking-wide text-center"
      >
        Point of Focus
      </motion.p>

      <p className="text-sage-600 text-sm sm:text-base text-center max-w-xs leading-relaxed">
        Follow the moving dot with your eyes. Let everything else fade away.
      </p>

      {/* Dot arena */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl bg-sage-50 border border-sage-200 overflow-hidden shadow-inner">
        {/* Trailing glow */}
        <div
          className="absolute w-16 h-16 rounded-full blur-xl bg-sage-300/50 animate-focus-dot"
          style={{ transform: 'translate(-50%, -50%)' }}
        />
        {/* Dot */}
        <div
          className="absolute w-5 h-5 sm:w-6 sm:h-6 rounded-full animate-focus-dot"
          style={{
            background:
              'radial-gradient(circle, var(--color-sage-400) 0%, var(--color-sage-500) 100%)',
            boxShadow: '0 0 20px rgba(134,163,151,0.6)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      <p className="text-sage-500 text-xs sm:text-sm italic">
        Keep your gaze soft and steady
      </p>
    </div>
  );
}
