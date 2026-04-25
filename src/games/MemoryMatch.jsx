import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

const COLORS = [
  { name: 'Sage', value: '#9abea5' },
  { name: 'Sky', value: '#8a99d0' },
  { name: 'Cream', value: '#efe8d2' },
  { name: 'Moss', value: '#6b8b7b' },
  { name: 'Lilac', value: '#b1bbe0' },
  { name: 'Rose', value: '#d4a5a5' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateCards() {
  const selected = shuffle(COLORS).slice(0, 5);
  const pairs = shuffle(
    [...selected, ...selected].map((c, i) => ({
      id: i,
      colorName: c.name,
      value: c.value,
      matched: false,
    }))
  );
  return pairs;
}

// Small "ding" sound for matches
function playMatchSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

function playFlipSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 400 + Math.random() * 200;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.04, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {}
}

/**
 * Memory Match – 5 pairs (10 cards) of pastel colors.
 * Features: flip sounds, match sounds, celebration, and restart.
 */
export default function MemoryMatch({ onComplete }) {
  const [cards, setCards] = useState(() => generateCards());
  const [flipped, setFlipped] = useState([]);
  const [matchCount, setMatchCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);
  const lockRef = useRef(false);
  const totalPairs = 5;

  const handleFlip = useCallback(
    (index) => {
      if (lockRef.current || completed) return;
      if (cards[index].matched || flipped.includes(index)) return;

      playFlipSound();
      const next = [...flipped, index];
      setFlipped(next);

      if (next.length === 2) {
        setMoves((m) => m + 1);
        lockRef.current = true;

        if (cards[next[0]].colorName === cards[next[1]].colorName) {
          playMatchSound();
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c, i) =>
                i === next[0] || i === next[1] ? { ...c, matched: true } : c
              )
            );
            setMatchCount((m) => m + 1);
            setFlipped([]);
            lockRef.current = false;
          }, 400);
        } else {
          setTimeout(() => {
            setFlipped([]);
            lockRef.current = false;
          }, 700);
        }
      }
    },
    [cards, flipped, completed]
  );

  useEffect(() => {
    if (matchCount === totalPairs && !completed) {
      setCompleted(true);
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [matchCount, completed, onComplete]);

  const handleReset = useCallback(() => {
    setCards(generateCards());
    setFlipped([]);
    setMatchCount(0);
    setMoves(0);
    setCompleted(false);
    lockRef.current = false;
  }, []);

  const isFlipped = (i) => flipped.includes(i) || cards[i].matched;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-xs sm:max-w-sm">
        <p className="text-sage-600 text-sm sm:text-base">
          {completed ? '🎉 All matched!' : 'Match the color pairs'}
        </p>
        <button
          onClick={handleReset}
          className="text-sage-400 hover:text-sage-600 cursor-pointer p-1"
          title="Restart game"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full max-w-xs sm:max-w-sm">
        {cards.map((card, i) => {
          const flippedState = isFlipped(i);
          return (
            <motion.button
              key={`${card.id}-${cards.length}`}
              onClick={() => handleFlip(i)}
              whileTap={!flippedState && !completed ? { scale: 0.9 } : {}}
              className="aspect-square rounded-2xl cursor-pointer relative overflow-hidden"
              style={{ perspective: 600 }}
            >
              <motion.div
                animate={{ rotateY: flippedState ? 180 : 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Back face (question mark) */}
                <div
                  className="absolute inset-0 rounded-2xl bg-sage-100 border-2 border-sage-200/80 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-sage-300 text-lg sm:text-2xl">?</span>
                </div>
                {/* Front face (color) */}
                <div
                  className={`absolute inset-0 rounded-2xl flex items-center justify-center shadow-md transition-opacity ${
                    card.matched ? 'opacity-40' : ''
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: card.value,
                  }}
                >
                  {card.matched && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-white text-lg drop-shadow"
                    >
                      ✓
                    </motion.span>
                  )}
                </div>
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-xs text-sage-500">
        <span>Moves: {moves}</span>
        <span>Matched: {matchCount}/{totalPairs}</span>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {[...Array(totalPairs)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i < matchCount ? 1.2 : 1,
              backgroundColor: i < matchCount ? '#86a397' : '#dce8e0',
            }}
            className="w-2 h-2 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
