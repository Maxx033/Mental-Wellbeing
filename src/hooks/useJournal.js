import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'mindfulness_journal';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

/**
 * Hook for managing a daily mindfulness journal.
 * - notes: { [dateKey]: { text, mood, timestamp } }
 * - todayNote: today's entry (or null)
 * - saveNote(text, mood): save today's reflection
 * - recentNotes: last 7 days of entries
 */
export function useJournal() {
  const [notes, setNotes] = useState(() => loadNotes());
  const todayKey = getTodayKey();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const todayNote = notes[todayKey] || null;

  const saveNote = useCallback(
    (text, mood = '') => {
      setNotes((prev) => ({
        ...prev,
        [todayKey]: {
          text,
          mood,
          timestamp: new Date().toISOString(),
        },
      }));
    },
    [todayKey]
  );

  // Get last 7 days of notes
  const recentNotes = (() => {
    const entries = [];
    const d = new Date();
    for (let i = 0; i < 7; i++) {
      const key = d.toISOString().slice(0, 10);
      if (notes[key]) {
        entries.push({ date: key, ...notes[key] });
      }
      d.setDate(d.getDate() - 1);
    }
    return entries;
  })();

  return { todayNote, recentNotes, saveNote };
}
