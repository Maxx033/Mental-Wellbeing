import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'mindfulness_calm_data';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getWeekKey() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - startOfYear) / 86400000);
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { daily: {}, weekly: {}, history: [] };
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Enhanced calm count hook with:
 * - Daily counter with per-day tracking
 * - Weekly aggregation for leaderboard
 * - Full history for streaks & charts
 */
export function useCalmCount() {
  const [data, setData] = useState(() => loadData());

  const todayKey = getTodayKey();
  const weekKey = getWeekKey();
  const todayCount = data.daily[todayKey] || 0;
  const weeklyCount = data.weekly[weekKey] || 0;

  // Compute weekly leaderboard (last 4 weeks)
  const weeklyLeaderboard = (() => {
    const weeks = [];
    const now = new Date();
    for (let i = 0; i < 4; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const days = Math.floor((d - startOfYear) / 86400000);
      const w = Math.ceil((days + startOfYear.getDay() + 1) / 7);
      const key = `${d.getFullYear()}-W${w}`;
      weeks.push({
        week: key,
        label: i === 0 ? 'This Week' : i === 1 ? 'Last Week' : `${i} Weeks Ago`,
        count: data.weekly[key] || 0,
      });
    }
    return weeks;
  })();

  // Compute streak (consecutive days with at least 1 calm)
  const streak = (() => {
    let count = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (data.daily[key] && data.daily[key] > 0) {
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  })();

  useEffect(() => {
    saveData(data);
  }, [data]);

  const increment = useCallback(() => {
    setData((prev) => {
      const next = { ...prev };
      next.daily = { ...next.daily };
      next.weekly = { ...next.weekly };
      next.daily[todayKey] = (next.daily[todayKey] || 0) + 1;
      next.weekly[weekKey] = (next.weekly[weekKey] || 0) + 1;

      // Push to history
      next.history = [...(next.history || [])];
      next.history.push({ date: new Date().toISOString(), type: 'calm' });

      return next;
    });
  }, [todayKey, weekKey]);

  return {
    todayCount,
    weeklyCount,
    weeklyLeaderboard,
    streak,
    increment,
  };
}
