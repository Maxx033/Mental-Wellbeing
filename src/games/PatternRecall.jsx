import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

const PATTERNS = [
  [1, 0, 1, 0, 0, 1, 0, 1, 0],
  [0, 1, 0, 1, 1, 1, 0, 1, 0],
  [1, 1, 0, 0, 1, 0, 0, 1, 1],
  [0, 0, 1, 1, 0, 1, 1, 0, 0],
  [1, 0, 0, 0, 1, 0, 0, 0, 1],
  [0, 1, 1, 1, 0, 0, 1, 1, 0],
  [1, 1, 1, 0, 0, 0, 1, 0, 1],
  [0, 1, 0, 0, 1, 1, 1, 0, 0],
];

function playCorrectSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
      g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.25);
    });
  } catch {}
}

function playWrongSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 200;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.05, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

function playTapSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 350 + Math.random() * 150;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.04, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {}
}

/**
 * Pattern Recall – memorize a lit-up pattern on a 3×3 grid, then reproduce it.
 * Features: sound feedback, restart, round-by-round progress, difficulty scaling.
 */
export default function PatternRecall({ onComplete }) {
  const [phase, setPhase] = useState('showing');
  const [patternIndex, setPatternIndex] = useState(
    () => Math.floor(Math.random() * PATTERNS.length)
  );
  const [userGrid, setUserGrid] = useState(Array(9).fill(0));
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [completed, setCompleted] = useState(false);
  const maxRounds = 4;

  const currentPattern = PATTERNS[patternIndex % PATTERNS.length];

  // Show time decreases with rounds for difficulty
  const showTime = Math.max(1500, 3000 - (round - 1) * 400);

  useEffect(() => {
    if (phase !== 'showing') return;
    const timer = setTimeout(() => setPhase('recalling'), showTime);
    return () => clearTimeout(timer);
  }, [phase, patternIndex, showTime]);

  const toggleCell = useCallback(
    (index) => {
      if (phase !== 'recalling') return;
      playTapSound();
      setUserGrid((prev) => {
        const next = [...prev];
        next[index] = next[index] ? 0 : 1;
        return next;
      });
    },
    [phase]
  );

  const handleSubmit = useCallback(() => {
    const correct = userGrid.every((v, i) => v === currentPattern[i]);

    if (correct) {
      playCorrectSound();
      setScore((s) => s + 1);
    } else {
      playWrongSound();
    }

    setPhase('result');

    setTimeout(() => {
      if (round >= maxRounds) {
        setCompleted(true);
        if (onComplete) onComplete();
      } else {
        setRound((r) => r + 1);
        setPatternIndex((i) => (i + 1) % PATTERNS.length);
        setUserGrid(Array(9).fill(0));
        setPhase('showing');
      }
    }, 1500);
  }, [userGrid, currentPattern, round, onComplete]);

  const handleReset = useCallback(() => {
    setPhase('showing');
    setPatternIndex(Math.floor(Math.random() * PATTERNS.length));
    setUserGrid(Array(9).fill(0));
    setScore(0);
    setRound(1);
    setCompleted(false);
  }, []);

  const isCorrect =
    phase === 'result' && userGrid.every((v, i) => v === currentPattern[i]);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex items-center justify-between w-full max-w-[240px] sm:max-w-[280px]">
        <p className="text-sage-600 text-sm sm:text-base">
          {phase === 'showing'
            ? '👀 Memorize...'
            : phase === 'recalling'
            ? '🧠 Recreate it!'
            : completed
            ? `🎉 Done! Score: ${score}/${maxRounds}`
            : isCorrect
            ? '✨ Perfect!'
            : '❌ Not quite!'}
        </p>
        <button
          onClick={handleReset}
          className="text-sage-400 hover:text-sage-600 cursor-pointer p-1"
          title="Restart game"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Countdown during showing */}
      {phase === 'showing' && (
        <div className="h-1 w-full max-w-[240px] sm:max-w-[280px] bg-sage-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: showTime / 1000, ease: 'linear' }}
            className="h-full bg-sage-400 rounded-full"
          />
        </div>
      )}

      {/* 3x3 grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {Array.from({ length: 9 }, (_, i) => {
          const active =
            phase === 'showing'
              ? currentPattern[i]
              : phase === 'result'
              ? currentPattern[i]
              : userGrid[i];

          const isWrong =
            phase === 'result' && userGrid[i] !== currentPattern[i];
          const isUserCorrect =
            phase === 'result' && userGrid[i] === currentPattern[i] && userGrid[i] === 1;

          return (
            <motion.button
              key={i}
              onClick={() => toggleCell(i)}
              whileTap={phase === 'recalling' ? { scale: 0.9 } : {}}
              animate={{
                backgroundColor: active
                  ? isWrong
                    ? 'rgba(200,100,100,0.35)'
                    : isUserCorrect
                    ? 'rgba(110,170,130,0.65)'
                    : 'rgba(134,163,151,0.55)'
                  : 'rgba(240,245,242,0.8)',
                borderColor: active
                  ? isWrong
                    ? 'rgba(200,100,100,0.5)'
                    : 'rgba(134,163,151,0.5)'
                  : 'rgba(184,209,191,0.3)',
                scale: phase === 'showing' && currentPattern[i] ? 1.05 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 cursor-pointer transition-shadow ${
                active && !isWrong ? 'shadow-lg' : 'shadow-sm'
              } ${phase === 'recalling' ? 'hover:shadow-md hover:border-sage-300' : ''}`}
            />
          );
        })}
      </div>

      {/* Submit button */}
      {phase === 'recalling' && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleSubmit}
          className="px-6 py-2.5 min-h-[48px] rounded-2xl bg-sage-400 hover:bg-sage-500 text-cream-50 text-sm font-medium shadow-md transition-colors cursor-pointer"
        >
          Check Pattern
        </motion.button>
      )}

      {/* Round & score */}
      <div className="flex items-center gap-4">
        <div className="flex gap-1.5">
          {[...Array(maxRounds)].map((_, i) => (
            <div
              key={i}
              className={`w-6 h-1.5 rounded-full transition-all duration-300 ${
                i < round
                  ? i < score
                    ? 'bg-sage-400'
                    : 'bg-sage-200'
                  : 'bg-sage-100'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-sage-500">
          Round {Math.min(round, maxRounds)}/{maxRounds} · Score {score}
        </span>
      </div>
    </div>
  );
}
