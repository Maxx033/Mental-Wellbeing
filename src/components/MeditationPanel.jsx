import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Timer, ChevronDown } from 'lucide-react';
import { startSound, stopSound, getSoundTypes, setVolume } from '../audio/soundEngine';

const DURATIONS = [
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '∞', seconds: Infinity },
];

/**
 * Meditation panel – select a soundscape, set a duration, and meditate.
 * Features a live breathing guide and animated visualizer.
 */
export default function MeditationPanel({ onComplete }) {
  const [selectedSound, setSelectedSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(DURATIONS[1]); // 5min default
  const [elapsed, setElapsed] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  const masterRef = useRef(null);
  const intervalRef = useRef(null);
  const soundTypes = getSoundTypes();
  const selectedInfo = soundTypes.find((s) => s.id === selectedSound);

  // Timer tick
  useEffect(() => {
    if (isPlaying && duration.seconds !== Infinity) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= duration.seconds) {
            // Time's up
            handleStop();
            if (onComplete) onComplete();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, duration.seconds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSound();
      clearInterval(intervalRef.current);
    };
  }, []);

  const handlePlay = useCallback(() => {
    if (!selectedSound) return;
    const master = startSound(selectedSound, muted ? 0 : volume);
    masterRef.current = master;
    setIsPlaying(true);
    setElapsed(0);
  }, [selectedSound, volume, muted]);

  const handleStop = useCallback(() => {
    stopSound();
    setIsPlaying(false);
    setElapsed(0);
    clearInterval(intervalRef.current);
    masterRef.current = null;
  }, []);

  const handlePause = useCallback(() => {
    stopSound();
    setIsPlaying(false);
    clearInterval(intervalRef.current);
  }, []);

  const handleResume = useCallback(() => {
    if (!selectedSound) return;
    const master = startSound(selectedSound, muted ? 0 : volume);
    masterRef.current = master;
    setIsPlaying(true);
  }, [selectedSound, volume, muted]);

  const handleVolumeChange = useCallback(
    (e) => {
      const v = parseFloat(e.target.value);
      setVolumeState(v);
      setMuted(false);
      if (masterRef.current) {
        setVolume(masterRef.current, v);
      }
    },
    []
  );

  const toggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    if (masterRef.current) {
      setVolume(masterRef.current, next ? 0 : volume);
    }
  }, [muted, volume]);

  // Format time
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const remaining =
    duration.seconds === Infinity ? '∞' : formatTime(duration.seconds - elapsed);
  const progress =
    duration.seconds === Infinity ? 0 : elapsed / duration.seconds;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xl flex flex-col items-center"
    >
      {/* ── Sound Selector ── */}
      {!isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full mb-6"
        >
          <p className="text-sage-600 text-sm font-medium mb-3">
            Choose your soundscape
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {soundTypes.map((sound) => (
              <button
                key={sound.id}
                onClick={() => setSelectedSound(sound.id)}
                className={`glass rounded-2xl p-3 sm:p-4 flex flex-col items-center gap-2 min-h-[80px] cursor-pointer transition-all duration-300 ${
                  selectedSound === sound.id
                    ? 'ring-2 ring-sage-400 shadow-lg scale-[1.02]'
                    : 'hover:shadow-md'
                }`}
              >
                <span className="text-2xl">{sound.emoji}</span>
                <span className="text-xs sm:text-sm font-medium text-sage-700">
                  {sound.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Duration Picker (before playing) ── */}
      {!isPlaying && selectedSound && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mb-6"
        >
          <p className="text-sage-600 text-sm font-medium mb-3">Duration</p>
          <div className="flex gap-2 flex-wrap">
            {DURATIONS.map((d) => (
              <button
                key={d.label}
                onClick={() => setDuration(d)}
                className={`px-4 py-2 rounded-2xl text-sm font-medium min-h-[40px] cursor-pointer transition-all ${
                  duration.label === d.label
                    ? 'bg-sage-400 text-cream-50 shadow-md'
                    : 'bg-sage-50 text-sage-600 hover:bg-sage-100'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Active Meditation View ── */}
      {isPlaying && selectedInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center w-full"
        >
          {/* Sound name */}
          <p className="text-sage-500 text-sm font-medium tracking-wider uppercase mb-2">
            {selectedInfo.label}
          </p>

          {/* Breathing visualizer */}
          <div className="relative w-52 h-52 sm:w-64 sm:h-64 flex items-center justify-center mb-6">
            {/* Outer rotating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full"
              style={{
                border: '2px dashed rgba(134,163,151,0.2)',
              }}
            />

            {/* Pulsing glow layers */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full blur-xl"
              style={{
                background: `radial-gradient(circle, var(--color-sage-300) 0%, transparent 70%)`,
              }}
            />

            <motion.div
              animate={{
                scale: [0.7, 1, 0.7],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, rgba(255,255,255,0.6) 0%, var(--color-sage-200) 50%, var(--color-sage-300) 100%)`,
                boxShadow: '0 0 50px rgba(134,163,151,0.3)',
              }}
            >
              <div className="text-center">
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-sage-700 text-xs sm:text-sm font-medium"
                >
                  Breathe
                </motion.p>
                <p className="text-sage-800 text-xl sm:text-2xl font-bold tabular-nums mt-1">
                  {remaining}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Progress bar */}
          {duration.seconds !== Infinity && (
            <div className="w-full max-w-xs h-1.5 bg-sage-100 rounded-full overflow-hidden mb-6">
              <motion.div
                animate={{ width: `${progress * 100}%` }}
                className="h-full bg-sage-400 rounded-full"
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>
          )}

          {/* Breathing guide text */}
          <motion.p
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="text-sage-500 text-xs sm:text-sm italic mb-6"
          >
            Inhale... hold... exhale... hold...
          </motion.p>
        </motion.div>
      )}

      {/* ── Controls ── */}
      <div className="flex items-center gap-4">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            disabled={!selectedSound}
            className="flex items-center gap-2 px-8 py-3 min-h-[48px] rounded-3xl bg-gradient-to-r from-sage-400 to-sage-500 hover:from-sage-500 hover:to-sage-600 disabled:opacity-40 disabled:cursor-not-allowed text-cream-50 text-base font-semibold shadow-lg transition-all cursor-pointer"
          >
            <Play size={20} /> Begin Meditation
          </button>
        ) : (
          <>
            {elapsed > 0 ? (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 px-6 py-2.5 min-h-[48px] rounded-2xl bg-sage-300 hover:bg-sage-400 text-cream-50 text-sm font-medium shadow-md transition-colors cursor-pointer"
              >
                <Pause size={16} /> Pause
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="flex items-center gap-2 px-6 py-2.5 min-h-[48px] rounded-2xl bg-sage-400 hover:bg-sage-500 text-cream-50 text-sm font-medium shadow-md transition-colors cursor-pointer"
              >
                <Play size={16} /> Resume
              </button>
            )}
            <button
              onClick={() => {
                handleStop();
                if (elapsed > 30 && onComplete) onComplete();
              }}
              className="px-6 py-2.5 min-h-[48px] rounded-2xl bg-cream-200 hover:bg-cream-300 text-sage-600 text-sm font-medium transition-colors cursor-pointer"
            >
              End Session
            </button>
          </>
        )}
      </div>

      {/* ── Volume control ── */}
      {(isPlaying || selectedSound) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 mt-5 w-full max-w-xs"
        >
          <button
            onClick={toggleMute}
            className="text-sage-500 hover:text-sage-700 transition-colors cursor-pointer"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1.5 bg-sage-100 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sage-400
              [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <span className="text-xs text-sage-500 w-8 text-right tabular-nums">
            {Math.round((muted ? 0 : volume) * 100)}
          </span>
        </motion.div>
      )}

      {/* ── Tip ── */}
      {!isPlaying && (
        <p className="text-sage-400 text-xs mt-6 text-center italic max-w-xs">
          Find a comfortable position, close your eyes, and let the sound guide you inward ✨
        </p>
      )}
    </motion.div>
  );
}
