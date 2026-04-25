import { motion } from 'framer-motion';
import { Trophy, Flame, TrendingUp } from 'lucide-react';

/**
 * Weekly Leaderboard panel —
 * Shows last 4 weeks of calms, current streak, and a motivational message.
 */
export default function Leaderboard({ weeklyLeaderboard, streak, todayCount }) {
  const best = Math.max(...weeklyLeaderboard.map((w) => w.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full max-w-xl"
    >
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass rounded-2xl p-4 text-center shadow-md">
          <Flame size={20} className="text-orange-400 mx-auto mb-1" />
          <p className="text-2xl sm:text-3xl font-bold text-sage-800">{streak}</p>
          <p className="text-[11px] sm:text-xs text-sage-500 mt-0.5">Day Streak</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center shadow-md">
          <Trophy size={20} className="text-amber-500 mx-auto mb-1" />
          <p className="text-2xl sm:text-3xl font-bold text-sage-800">{todayCount}</p>
          <p className="text-[11px] sm:text-xs text-sage-500 mt-0.5">Today</p>
        </div>
        <div className="glass rounded-2xl p-4 text-center shadow-md">
          <TrendingUp size={20} className="text-sage-400 mx-auto mb-1" />
          <p className="text-2xl sm:text-3xl font-bold text-sage-800">
            {weeklyLeaderboard[0]?.count || 0}
          </p>
          <p className="text-[11px] sm:text-xs text-sage-500 mt-0.5">This Week</p>
        </div>
      </div>

      {/* Weekly bars */}
      <div className="glass rounded-3xl p-5 sm:p-6 shadow-lg">
        <h3 className="text-sm sm:text-base font-semibold text-sage-700 mb-4">
          Weekly Progress
        </h3>
        <div className="space-y-3">
          {weeklyLeaderboard.map((week, i) => (
            <div key={week.week} className="flex items-center gap-3">
              <span className="text-xs text-sage-500 w-24 shrink-0 text-right">
                {week.label}
              </span>
              <div className="flex-1 h-7 bg-sage-100/70 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${best > 0 ? (week.count / best) * 100 : 0}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background:
                      i === 0
                        ? 'linear-gradient(90deg, var(--color-sage-300), var(--color-sage-400))'
                        : 'linear-gradient(90deg, var(--color-sage-200), var(--color-sage-300))',
                    minWidth: week.count > 0 ? '20px' : '0px',
                  }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-sage-600">
                  {week.count}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Motivation text */}
        <div className="mt-5 pt-4 border-t border-sage-100">
          <p className="text-xs sm:text-sm text-sage-500 text-center italic">
            {streak >= 7
              ? "🔥 Incredible! You've been consistent for a full week!"
              : streak >= 3
              ? '✨ Great momentum! Keep the streak alive.'
              : todayCount > 0
              ? '🌱 Beautiful start. Every calm moment counts.'
              : '💫 Your first calm moment today is waiting for you.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
