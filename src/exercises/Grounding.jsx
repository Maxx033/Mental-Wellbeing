import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  {
    count: 5,
    sense: 'SEE',
    color: 'text-sage-600',
    prompt: 'Name 5 things you can see around you.',
    icon: '👁️',
  },
  {
    count: 4,
    sense: 'TOUCH',
    color: 'text-slate-blue-500',
    prompt: 'Name 4 things you can physically feel.',
    icon: '✋',
  },
  {
    count: 3,
    sense: 'HEAR',
    color: 'text-sage-500',
    prompt: 'Name 3 things you can hear right now.',
    icon: '👂',
  },
  {
    count: 2,
    sense: 'SMELL',
    color: 'text-slate-blue-400',
    prompt: 'Name 2 things you can smell.',
    icon: '👃',
  },
  {
    count: 1,
    sense: 'TASTE',
    color: 'text-sage-400',
    prompt: 'Name 1 thing you can taste.',
    icon: '👅',
  },
];

/**
 * 5-4-3-2-1 Grounding Exercise.
 * Steps the user through five senses with animated prompts.
 */
export default function Grounding() {
  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const next = useCallback(() => {
    if (!isLast) setStepIndex((i) => i + 1);
  }, [isLast]);

  // Auto-advance every 10 seconds
  useEffect(() => {
    if (isLast) return;
    const timer = setTimeout(next, 10000);
    return () => clearTimeout(timer);
  }, [stepIndex, next, isLast]);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Progress bar */}
      <div className="flex gap-2 w-full max-w-xs">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full overflow-hidden bg-sage-100"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: i <= stepIndex ? '100%' : '0%' }}
              transition={{ duration: 0.5 }}
              className="h-full bg-sage-400 rounded-full"
            />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-5 w-full"
        >
          {/* Emoji & counter */}
          <span className="text-5xl sm:text-7xl">{step.icon}</span>

          <div className="flex items-baseline gap-2">
            <span className={`text-5xl sm:text-7xl font-extrabold ${step.color}`}>
              {step.count}
            </span>
            <span className={`text-xl sm:text-2xl font-semibold ${step.color}`}>
              {step.sense}
            </span>
          </div>

          <p className="text-sage-600 text-base sm:text-lg text-center max-w-sm leading-relaxed">
            {step.prompt}
          </p>

          {/* Manual advance */}
          {!isLast && (
            <button
              onClick={next}
              className="mt-2 px-8 py-3 min-h-[48px] rounded-3xl bg-sage-400 hover:bg-sage-500 text-cream-50 text-sm sm:text-base font-medium transition-colors shadow-md cursor-pointer"
            >
              Next →
            </button>
          )}
          {isLast && (
            <p className="text-sage-400 text-sm mt-2 italic">
              You are grounded. Take a slow breath.
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
