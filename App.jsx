import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wind,
  Zap,
  Brain,
  Layout,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Heart,
  Sparkles,
  ShieldAlert,
  Trophy,
  BookOpen,
  Gamepad2,
  Home,
  Flower2,
  Grid3x3,
  Puzzle,
  CheckCircle2,
  Headphones,
} from 'lucide-react';

import { useTimer } from './hooks/useTimer';
import { useCalmCount } from './hooks/useCalmCount';
import { useJournal } from './hooks/useJournal';

import BoxBreathing from './exercises/BoxBreathing';
import BellowsBreath from './exercises/BellowsBreath';
import Grounding from './exercises/Grounding';
import FocusDot from './exercises/FocusDot';
import SOSModal from './components/SOSModal';
import ParticlesBackground from './components/ParticlesBackground';
import Leaderboard from './components/Leaderboard';
import JournalPanel from './components/JournalPanel';
import MeditationPanel from './components/MeditationPanel';
import { stopSound } from './audio/soundEngine';

import ZenGarden from './games/ZenGarden';
import MemoryMatch from './games/MemoryMatch';
import PatternRecall from './games/PatternRecall';

/* ───────── Mood config ───────── */
const MOODS = [
  {
    id: 'anxious',
    label: 'Anxious',
    subtitle: 'Box Breathing',
    icon: Wind,
    gradient: 'from-sage-300 to-sage-500',
    bgHover: 'hover:shadow-sage-300/40',
    Component: BoxBreathing,
  },
  {
    id: 'lethargic',
    label: 'Lethargic',
    subtitle: 'Bellows Breath',
    icon: Zap,
    gradient: 'from-slate-blue-300 to-slate-blue-500',
    bgHover: 'hover:shadow-slate-blue-300/40',
    Component: BellowsBreath,
  },
  {
    id: 'overwhelmed',
    label: 'Overwhelmed',
    subtitle: '5-4-3-2-1 Grounding',
    icon: Brain,
    gradient: 'from-sage-400 to-sage-600',
    bgHover: 'hover:shadow-sage-400/40',
    Component: Grounding,
  },
  {
    id: 'distracted',
    label: 'Distracted',
    subtitle: 'Focus Dot',
    icon: Layout,
    gradient: 'from-slate-blue-200 to-sage-400',
    bgHover: 'hover:shadow-slate-blue-200/40',
    Component: FocusDot,
  },
];

/* ───────── Mini-Games config ───────── */
const GAMES = [
  {
    id: 'zen-garden',
    label: 'Zen Garden',
    subtitle: 'Place stones on sand',
    icon: Flower2,
    gradient: 'from-cream-300 to-sage-300',
    Component: ZenGarden,
  },
  {
    id: 'memory-match',
    label: 'Memory Match',
    subtitle: 'Match color pairs',
    icon: Puzzle,
    gradient: 'from-slate-blue-200 to-slate-blue-400',
    Component: MemoryMatch,
  },
  {
    id: 'pattern-recall',
    label: 'Pattern Recall',
    subtitle: 'Memorize & recreate',
    icon: Grid3x3,
    gradient: 'from-sage-200 to-sage-400',
    Component: PatternRecall,
  },
];

/* ───────── Tabs ───────── */
const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'meditate', label: 'Meditate', icon: Headphones },
  { id: 'games', label: 'Games', icon: Gamepad2 },
  { id: 'progress', label: 'Progress', icon: Trophy },
  { id: 'journal', label: 'Journal', icon: BookOpen },
];

/* ───────── Helpers ───────── */
function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const pageVariants = {
  initial: { opacity: 0, y: 30, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.97 },
};

/* ───────── Time-based greeting ───────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', emoji: '🌅' };
  if (h < 17) return { text: 'Good Afternoon', emoji: '☀️' };
  if (h < 21) return { text: 'Good Evening', emoji: '🌇' };
  return { text: 'Good Night', emoji: '🌙' };
}

export default function App() {
  const [tab, setTab] = useState('home');
  const [activeMood, setActiveMood] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [sosOpen, setSOSOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const {
    todayCount,
    weeklyCount,
    weeklyLeaderboard,
    streak,
    increment: bumpCalm,
  } = useCalmCount();

  const { todayNote, recentNotes, saveNote } = useJournal();
  const { seconds, isRunning, start, pause, reset, progress } = useTimer(60);

  const activeExercise = MOODS.find((m) => m.id === activeMood);
  const activeGameObj = GAMES.find((g) => g.id === activeGame);
  const greeting = getGreeting();

  // ── Handlers ──
  const handleSelectMood = useCallback((id) => {
    setActiveMood(id);
  }, []);

  const handleSelectGame = useCallback((id) => {
    setActiveGame(id);
  }, []);

  const handleBack = useCallback(() => {
    setActiveMood(null);
    setActiveGame(null);
    reset();
  }, [reset]);

  const celebrate = useCallback(() => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  }, []);

  const handleComplete = useCallback(() => {
    bumpCalm();
    celebrate();
    setTimeout(() => {
      handleBack();
    }, 1200);
  }, [bumpCalm, celebrate, handleBack]);

  const handleGameComplete = useCallback(() => {
    bumpCalm();
    celebrate();
    setTimeout(() => {
      setActiveGame(null);
    }, 1200);
  }, [bumpCalm, celebrate]);

  // Whether we're in a sub-screen
  const inSubScreen = activeMood || activeGame;

  return (
    <div className="min-h-screen-dynamic bg-cream-100 flex flex-col relative overflow-hidden">
      {/* Ambient particles */}
      <ParticlesBackground />

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 10 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-24 h-24 rounded-full bg-sage-400/20 flex items-center justify-center animate-glow-pulse">
                <CheckCircle2 size={48} className="text-sage-500" />
              </div>
              <p className="text-sage-700 text-xl font-semibold">+1 Calm ✨</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ────────── HEADER ────────── */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-10 pt-5 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sage-400 flex items-center justify-center shadow-md animate-gentle-bob">
            <Sparkles size={18} className="text-cream-50" />
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-sage-800 tracking-tight">
            Mindful<span className="text-sage-400">.</span>
          </h1>
        </div>

        {/* Daily calm count badge */}
        <div className="glass rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm animate-glow-pulse">
          <Heart size={16} className="text-sage-400" />
          <span className="text-sm sm:text-base font-semibold text-sage-700">
            {todayCount}
          </span>
          <span className="text-xs text-sage-500 hidden sm:inline">
            calm{todayCount !== 1 ? 's' : ''} today
          </span>
        </div>
      </header>

      {/* ────────── MAIN CONTENT ────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-5 sm:px-10 pb-28 pt-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* ═══════════ HOME TAB ═══════════ */}
          {tab === 'home' && !inSubScreen && (
            <motion.div
              key="home"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full max-w-xl flex flex-col items-center"
            >
              {/* Greeting */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-center mb-6"
              >
                <p className="text-3xl sm:text-4xl mb-1">{greeting.emoji}</p>
                <h2 className="text-2xl sm:text-4xl font-bold text-sage-800">
                  {greeting.text}
                </h2>
                <p className="text-sage-500 text-sm sm:text-base mt-1">
                  How are you feeling right now?
                </p>
              </motion.div>

              {/* Streak badge */}
              {streak > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className="glass rounded-2xl px-5 py-2.5 flex items-center gap-2 mb-6 shadow-sm"
                >
                  <span className="text-orange-400">🔥</span>
                  <span className="text-sm font-semibold text-sage-700">
                    {streak} day streak
                  </span>
                </motion.div>
              )}

              {/* Mood grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
                {MOODS.map((mood, i) => (
                  <motion.button
                    key={mood.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    onClick={() => handleSelectMood(mood.id)}
                    className={`
                      glass rounded-3xl p-5 sm:p-6 flex items-center gap-4
                      min-h-[72px] sm:min-h-[88px]
                      shadow-lg ${mood.bgHover} hover:shadow-xl
                      transition-all duration-300 group cursor-pointer
                      active:scale-[0.97] w-full text-left
                    `}
                  >
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${mood.gradient} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <mood.icon size={22} className="text-cream-50" />
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-sage-800 group-hover:text-sage-900 transition-colors">
                        {mood.label}
                      </p>
                      <p className="text-xs sm:text-sm text-sage-500">
                        {mood.subtitle}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Quick stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex gap-4 mt-8 text-center"
              >
                <div className="glass rounded-2xl px-5 py-3 shadow-sm">
                  <p className="text-xl font-bold text-sage-700">{todayCount}</p>
                  <p className="text-[10px] text-sage-500">Today</p>
                </div>
                <div className="glass rounded-2xl px-5 py-3 shadow-sm">
                  <p className="text-xl font-bold text-sage-700">{weeklyCount}</p>
                  <p className="text-[10px] text-sage-500">This Week</p>
                </div>
                <div className="glass rounded-2xl px-5 py-3 shadow-sm">
                  <p className="text-xl font-bold text-sage-700">{streak}</p>
                  <p className="text-[10px] text-sage-500">Streak</p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ═══════════ ACTIVE EXERCISE ═══════════ */}
          {tab === 'home' && activeMood && (
            <motion.div
              key={`exercise-${activeMood}`}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full max-w-xl flex flex-col items-center"
            >
              {/* Back button */}
              <button
                onClick={handleBack}
                className="self-start flex items-center gap-2 text-sage-500 hover:text-sage-700 transition-colors mb-4 min-h-[48px] cursor-pointer"
              >
                <ArrowLeft size={20} />
                <span className="text-sm sm:text-base font-medium">Back</span>
              </button>

              {/* Timer ring */}
              <div className="relative w-20 h-20 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40" cy="40" r="34"
                    fill="none"
                    stroke="rgba(134,163,151,0.15)"
                    strokeWidth="5"
                  />
                  <circle
                    cx="40" cy="40" r="34"
                    fill="none"
                    stroke="var(--color-sage-400)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 34}`}
                    strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress)}`}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-sage-700 tabular-nums">
                    {formatTime(seconds)}
                  </span>
                </div>
              </div>

              {/* Timer controls */}
              <div className="flex items-center gap-3 mb-6">
                {!isRunning ? (
                  <button
                    onClick={start}
                    className="flex items-center gap-2 px-5 py-2.5 min-h-[48px] rounded-2xl bg-sage-400 hover:bg-sage-500 text-cream-50 text-sm font-medium shadow-md transition-colors cursor-pointer"
                  >
                    <Play size={16} /> {seconds === 60 ? 'Start' : 'Resume'}
                  </button>
                ) : (
                  <button
                    onClick={pause}
                    className="flex items-center gap-2 px-5 py-2.5 min-h-[48px] rounded-2xl bg-sage-300 hover:bg-sage-400 text-cream-50 text-sm font-medium shadow-md transition-colors cursor-pointer"
                  >
                    <Pause size={16} /> Pause
                  </button>
                )}
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-4 py-2.5 min-h-[48px] rounded-2xl bg-cream-200 hover:bg-cream-300 text-sage-600 text-sm font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* Exercise component */}
              <div className="glass rounded-3xl p-6 sm:p-10 w-full shadow-xl">
                <activeExercise.Component />
              </div>

              {/* Complete buttons */}
              <div className="flex flex-col items-center gap-3 mt-5">
                {seconds === 0 && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleComplete}
                    className="px-8 py-3 min-h-[48px] rounded-3xl bg-gradient-to-r from-sage-400 to-sage-500 hover:from-sage-500 hover:to-sage-600 text-cream-50 text-base font-semibold shadow-lg transition-all cursor-pointer"
                  >
                    ✨ Mark as Complete
                  </motion.button>
                )}
                {/* Always show a secondary "I'm done" button so calms can be counted anywhere */}
                {seconds > 0 && (
                  <button
                    onClick={handleComplete}
                    className="text-sage-400 hover:text-sage-600 text-xs sm:text-sm underline-offset-2 underline transition-colors cursor-pointer min-h-[44px]"
                  >
                    I feel calmer — finish early
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══════════ ACTIVE GAME ═══════════ */}
          {tab === 'games' && activeGame && (
            <motion.div
              key={`game-${activeGame}`}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full max-w-xl flex flex-col items-center"
            >
              <button
                onClick={() => setActiveGame(null)}
                className="self-start flex items-center gap-2 text-sage-500 hover:text-sage-700 transition-colors mb-4 min-h-[48px] cursor-pointer"
              >
                <ArrowLeft size={20} />
                <span className="text-sm sm:text-base font-medium">Back</span>
              </button>

              <div className="glass rounded-3xl p-6 sm:p-8 w-full shadow-xl">
                <activeGameObj.Component onComplete={handleGameComplete} />
              </div>

              <button
                onClick={handleGameComplete}
                className="mt-4 text-sage-400 hover:text-sage-600 text-xs sm:text-sm underline-offset-2 underline transition-colors cursor-pointer min-h-[44px]"
              >
                Finish & earn a calm
              </button>
            </motion.div>
          )}

          {/* ═══════════ GAMES TAB ═══════════ */}
          {tab === 'games' && !activeGame && (
            <motion.div
              key="games-list"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="w-full max-w-xl flex flex-col items-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <p className="text-3xl mb-1">🎮</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-sage-800">
                  Mindful Games
                </h2>
                <p className="text-sage-500 text-sm sm:text-base mt-1">
                  Calming activities to ease your mind
                </p>
              </motion.div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4 w-full">
                {GAMES.map((game, i) => (
                  <motion.button
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    onClick={() => handleSelectGame(game.id)}
                    className="glass rounded-3xl p-5 sm:p-6 flex items-center gap-4 min-h-[80px] shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer active:scale-[0.97] w-full text-left"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.gradient} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <game.icon size={24} className="text-sage-800" />
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-semibold text-sage-800">
                        {game.label}
                      </p>
                      <p className="text-xs sm:text-sm text-sage-500">
                        {game.subtitle}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sage-400 text-xs mt-6 text-center italic"
              >
                Each completed game earns you a calm ✨
              </motion.p>
            </motion.div>
          )}

          {/* ═══════════ PROGRESS TAB ═══════════ */}
          {tab === 'progress' && (
            <motion.div
              key="progress"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="w-full max-w-xl flex flex-col items-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <p className="text-3xl mb-1">🏆</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-sage-800">
                  Your Progress
                </h2>
                <p className="text-sage-500 text-sm sm:text-base mt-1">
                  Weekly leaderboard & stats
                </p>
              </motion.div>

              <Leaderboard
                weeklyLeaderboard={weeklyLeaderboard}
                streak={streak}
                todayCount={todayCount}
              />
            </motion.div>
          )}

          {/* ═══════════ MEDITATE TAB ═══════════ */}
          {tab === 'meditate' && (
            <motion.div
              key="meditate"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="w-full max-w-xl flex flex-col items-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <p className="text-3xl mb-1">🧘</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-sage-800">
                  Meditate
                </h2>
                <p className="text-sage-500 text-sm sm:text-base mt-1">
                  Immerse yourself in calming soundscapes
                </p>
              </motion.div>

              <MeditationPanel
                onComplete={() => {
                  bumpCalm();
                  celebrate();
                }}
              />
            </motion.div>
          )}

          {/* ═══════════ JOURNAL TAB ═══════════ */}
          {tab === 'journal' && (
            <motion.div
              key="journal"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4 }}
              className="w-full max-w-xl flex flex-col items-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <p className="text-3xl mb-1">📝</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-sage-800">
                  Journal
                </h2>
                <p className="text-sage-500 text-sm sm:text-base mt-1">
                  Reflect on your mindfulness journey
                </p>
              </motion.div>

              <JournalPanel
                todayNote={todayNote}
                recentNotes={recentNotes}
                onSave={saveNote}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ────────── BOTTOM NAV ────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40">
        <div className="glass border-t border-sage-100/50 px-4 py-2 sm:px-8">
          <div className="flex items-center justify-around max-w-lg mx-auto">
            {TABS.map((t) => {
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTab(t.id);
                    // Reset sub-screens when switching tabs
                    if (t.id !== 'home') setActiveMood(null);
                    if (t.id !== 'games') setActiveGame(null);
                    if (t.id !== 'meditate') stopSound();
                    reset();
                  }}
                  className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-300 cursor-pointer min-h-[48px] min-w-[56px] ${
                    isActive
                      ? 'nav-pill-active'
                      : 'text-sage-400 hover:text-sage-600'
                  }`}
                >
                  <t.icon size={20} />
                  <span className="text-[10px] sm:text-xs font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ────────── SOS FAB ────────── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setSOSOpen(true)}
        className="fixed bottom-20 right-5 z-50 w-14 h-14 min-h-[48px] rounded-full flex items-center justify-center shadow-2xl cursor-pointer animate-float"
        style={{
          background:
            'linear-gradient(135deg, var(--color-sage-400) 0%, var(--color-slate-blue-400) 100%)',
          boxShadow:
            '0 8px 32px rgba(134,163,151,0.35), 0 4px 12px rgba(99,119,193,0.25)',
        }}
        aria-label="SOS - Emergency Breathing"
      >
        <ShieldAlert size={22} className="text-cream-50" />
      </motion.button>

      {/* SOS Modal */}
      <SOSModal isOpen={sosOpen} onClose={() => setSOSOpen(false)} />
    </div>
  );
}
