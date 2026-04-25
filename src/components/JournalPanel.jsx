import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Smile, Meh, Frown, Heart, Send } from 'lucide-react';

const MOOD_OPTIONS = [
  { id: 'peaceful', label: 'Peaceful', icon: '😌', color: 'bg-sage-300' },
  { id: 'happy', label: 'Happy', icon: '😊', color: 'bg-amber-300' },
  { id: 'neutral', label: 'Neutral', icon: '😐', color: 'bg-slate-blue-200' },
  { id: 'tired', label: 'Tired', icon: '😴', color: 'bg-cream-300' },
  { id: 'still-anxious', label: 'Still Anxious', icon: '😰', color: 'bg-slate-blue-300' },
];

/**
 * Journal panel – user writes how they feel after a session.
 * Includes mood picker and past entries.
 */
export default function JournalPanel({ todayNote, recentNotes, onSave }) {
  const [text, setText] = useState(todayNote?.text || '');
  const [selectedMood, setSelectedMood] = useState(todayNote?.mood || '');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (!text.trim()) return;
    onSave(text.trim(), selectedMood);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full max-w-xl"
    >
      <div className="glass rounded-3xl p-5 sm:p-7 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={20} className="text-sage-500" />
          <h3 className="text-base sm:text-lg font-semibold text-sage-700">
            Today's Reflection
          </h3>
        </div>

        {/* Mood selector */}
        <p className="text-xs text-sage-500 mb-2">How do you feel right now?</p>
        <div className="flex gap-2 mb-4 flex-wrap">
          {MOOD_OPTIONS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMood(m.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs sm:text-sm font-medium transition-all cursor-pointer min-h-[40px] ${
                selectedMood === m.id
                  ? `${m.color} text-sage-800 shadow-md scale-105`
                  : 'bg-sage-50 text-sage-600 hover:bg-sage-100'
              }`}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Text area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a few words about how you're feeling after this session..."
          rows={3}
          className="w-full bg-cream-50/80 border border-sage-100 rounded-2xl p-4 text-sm sm:text-base text-sage-700 placeholder-sage-400/60 resize-none focus:outline-none focus:ring-2 focus:ring-sage-300 transition-shadow"
        />

        {/* Save button */}
        <div className="flex items-center justify-between mt-3">
          <AnimatePresence>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-sage-500 text-xs flex items-center gap-1"
              >
                <Heart size={12} /> Saved
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="ml-auto flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-2xl bg-sage-400 hover:bg-sage-500 disabled:opacity-40 disabled:cursor-not-allowed text-cream-50 text-sm font-medium shadow-md transition-colors cursor-pointer"
          >
            <Send size={14} /> Save Note
          </button>
        </div>
      </div>

      {/* Recent entries */}
      {recentNotes.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-sage-500 font-medium px-1">Recent Notes</p>
          {recentNotes.slice(0, 5).map((note) => {
            const moojObj = MOOD_OPTIONS.find((m) => m.id === note.mood);
            const dateStr = new Date(note.date + 'T00:00:00').toLocaleDateString(
              'en-US',
              { weekday: 'short', month: 'short', day: 'numeric' }
            );
            return (
              <motion.div
                key={note.date}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-3 sm:p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs text-sage-500">{dateStr}</span>
                  {moojObj && (
                    <span className="text-sm" title={moojObj.label}>
                      {moojObj.icon}
                    </span>
                  )}
                </div>
                <p className="text-sm text-sage-700 leading-relaxed">{note.text}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
