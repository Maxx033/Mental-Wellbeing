import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

/**
 * Zen Garden – tap to place animated ripple stones on a sand canvas.
 * A meditative mini-game with no score, just peaceful interaction.
 * Features: sand rake patterns, stone shadows, and completion celebration.
 */
export default function ZenGarden({ onComplete }) {
  const [stones, setStones] = useState([]);
  const [ripples, setRipples] = useState([]);
  const [rakeLines, setRakeLines] = useState([]);
  const [completed, setCompleted] = useState(false);

  // Gentle "plop" sound via Web Audio API
  const playPlop = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300 + Math.random() * 200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      /* ignore audio errors */
    }
  }, []);

  const handleClick = useCallback(
    (e) => {
      if (completed) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now() + Math.random();

      playPlop();

      setStones((prev) => [
        ...prev,
        {
          id,
          x,
          y,
          size: Math.random() * 18 + 14,
          hue: Math.random() * 40 + 120,
          lightness: Math.random() * 15 + 40,
        },
      ]);
      setRipples((prev) => [...prev, { id, x, y }]);

      // Add circular rake lines around stone
      setRakeLines((prev) => [...prev, { id, x, y }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 1500);
    },
    [completed, playPlop]
  );

  // Auto-complete after 8 stones
  useEffect(() => {
    if (stones.length >= 8 && !completed) {
      setCompleted(true);
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [stones.length, completed, onComplete]);

  const handleReset = useCallback(() => {
    setStones([]);
    setRipples([]);
    setRakeLines([]);
    setCompleted(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-xs sm:max-w-sm">
        <p className="text-sage-600 text-sm sm:text-base">
          {completed ? '✨ Your garden is complete!' : 'Tap to place stones'}
        </p>
        {stones.length > 0 && (
          <button
            onClick={handleReset}
            className="text-sage-400 hover:text-sage-600 cursor-pointer p-1"
            title="Start over"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      <div
        onClick={handleClick}
        className="relative w-full aspect-square max-w-xs sm:max-w-sm rounded-3xl overflow-hidden cursor-pointer select-none"
        style={{
          background:
            'linear-gradient(145deg, #f0edd4 0%, #e8e4cc 50%, #dfd9be 100%)',
          boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.06)',
        }}
      >
        {/* Sand ripple pattern lines */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-full opacity-15"
            style={{
              top: `${8 + i * 8}%`,
              height: '1px',
              background:
                'repeating-linear-gradient(90deg, transparent, rgba(139,119,80,0.5) 2px, transparent 5px)',
            }}
          />
        ))}

        {/* Rake circles around stones */}
        {rakeLines.map((r) => (
          <motion.div
            key={`rake-${r.id}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.12 }}
            className="absolute rounded-full border border-sage-700/30 pointer-events-none"
            style={{
              left: r.x - 35,
              top: r.y - 35,
              width: 70,
              height: 70,
            }}
          />
        ))}
        {rakeLines.map((r) => (
          <motion.div
            key={`rake2-${r.id}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.08 }}
            transition={{ delay: 0.1 }}
            className="absolute rounded-full border border-sage-700/20 pointer-events-none"
            style={{
              left: r.x - 50,
              top: r.y - 50,
              width: 100,
              height: 100,
            }}
          />
        ))}

        {/* Placed stones with shadows */}
        {stones.map((stone) => (
          <motion.div key={stone.id} className="absolute" style={{ left: stone.x - stone.size / 2, top: stone.y - stone.size / 2 }}>
            {/* Shadow */}
            <div
              className="absolute rounded-full blur-sm opacity-20"
              style={{
                width: stone.size,
                height: stone.size * 0.5,
                top: stone.size * 0.7,
                left: 2,
                background: '#5a4a3a',
              }}
            />
            {/* Stone */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="rounded-full shadow-lg relative"
              style={{
                width: stone.size,
                height: stone.size,
                background: `radial-gradient(circle at 35% 30%, hsl(${stone.hue},22%,${stone.lightness + 15}%), hsl(${stone.hue},18%,${stone.lightness}%))`,
              }}
            />
          </motion.div>
        ))}

        {/* Ripple effects */}
        {ripples.map((r) => (
          <motion.div
            key={`ripple-${r.id}`}
            initial={{ scale: 0.3, opacity: 0.5 }}
            animate={{ scale: 3.5, opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute rounded-full border border-sage-600/15 pointer-events-none"
            style={{
              left: r.x - 25,
              top: r.y - 25,
              width: 50,
              height: 50,
            }}
          />
        ))}

        {/* Hint */}
        {stones.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.p
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-sage-500/50 text-sm"
            >
              Tap anywhere to begin...
            </motion.p>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i < stones.length ? 'bg-sage-400 scale-110' : 'bg-sage-200'
              }`}
            />
          ))}
        </div>
        <span className="text-sage-400 text-xs ml-1">{stones.length}/8</span>
      </div>
    </div>
  );
}
