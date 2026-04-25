import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const PHASES = [
  { label: 'Breathe In', duration: 4000, scale: 1 },
  { label: 'Hold', duration: 4000, scale: 1 },
  { label: 'Breathe Out', duration: 4000, scale: 0.5 },
  { label: 'Hold', duration: 4000, scale: 0.5 },
];

/**
 * Full-screen SOS breathing modal.
 * High-contrast design: white circle on dark background.
 * Uses fixed inset-0 to cover all browser UI (including mobile chrome).
 */
export default function SOSModal({ isOpen, onClose }) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const phase = PHASES[phaseIndex];

  // Cycle through breathing phases
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setPhaseIndex((i) => (i + 1) % PHASES.length);
    }, phase.duration);
    return () => clearTimeout(timer);
  }, [isOpen, phaseIndex, phase.duration]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) setPhaseIndex(0);
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1a2520 0%, #0f1321 50%, #1e2641 100%)' }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-12 h-12 min-h-[48px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
            aria-label="Close SOS"
          >
            <X size={24} />
          </button>

          {/* Title */}
          <motion.p
            key={phase.label + phaseIndex}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/90 text-2xl sm:text-4xl font-light tracking-[0.15em] mb-8 sm:mb-12"
          >
            {phase.label}
          </motion.p>

          {/* High-contrast breathing circle */}
          <div className="relative flex items-center justify-center">
            {/* Outer glow */}
            <motion.div
              animate={{ scale: phase.scale, opacity: phase.scale > 0.7 ? 0.5 : 0.2 }}
              transition={{ duration: phase.duration / 1000, ease: 'easeInOut' }}
              className="absolute w-56 h-56 sm:w-80 sm:h-80 rounded-full blur-2xl"
              style={{ background: 'rgba(134,163,151,0.3)' }}
            />
            {/* Inner circle */}
            <motion.div
              animate={{ scale: phase.scale }}
              transition={{ duration: phase.duration / 1000, ease: 'easeInOut' }}
              className="w-48 h-48 sm:w-72 sm:h-72 rounded-full flex items-center justify-center"
              style={{
                background:
                  'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.95) 0%, rgba(220,232,224,0.8) 50%, rgba(134,163,151,0.6) 100%)',
                boxShadow:
                  '0 0 80px rgba(134,163,151,0.35), 0 0 120px rgba(134,163,151,0.15)',
              }}
            >
              <span className="text-sage-800 text-xl sm:text-3xl font-light tracking-wider">
                {Math.ceil(phase.duration / 1000)}s
              </span>
            </motion.div>
          </div>

          {/* Phase dots */}
          <div className="flex gap-3 mt-10 sm:mt-14">
            {PHASES.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  i === phaseIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Subtle instruction */}
          <p className="text-white/40 text-xs sm:text-sm mt-6 sm:mt-8 tracking-wide">
            Focus only on your breath
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
