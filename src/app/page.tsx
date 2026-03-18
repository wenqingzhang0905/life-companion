"use client";

import { useEffect, useState } from "react";
import { format, subDays } from "date-fns";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { PenSquare, TrendingUp, Flame, Brain } from "lucide-react";
import Link from "next/link";
import { JournalEntry, MOOD_LABELS, MOOD_EMOJIS } from "@/lib/types";
import { getEntries } from "@/lib/firestore";

export default function Dashboard() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await getEntries(30);
      setEntries(data.reverse());
    } catch {
      setEntries([]);
    }
    setLoading(false);
  };

  const today = format(new Date(), "yyyy-MM-dd");
  const todayEntry = entries.find((e) => e.date === today);

  const chartData = entries.slice(-14).map((e) => ({
    date: format(new Date(e.date + "T12:00:00"), "MMM d"),
    mood: e.mood,
    energy: e.energy,
  }));

  const avgMood = entries.length > 0
    ? (entries.reduce((s, e) => s + e.mood, 0) / entries.length).toFixed(1)
    : "—";
  const avgEnergy = entries.length > 0
    ? (entries.reduce((s, e) => s + e.energy, 0) / entries.length).toFixed(1)
    : "—";
  const totalEntries = entries.length;

  let streak = 0;
  const sortedDates = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  for (let i = 0; i < sortedDates.length; i++) {
    const expected = format(subDays(new Date(), i), "yyyy-MM-dd");
    if (sortedDates[i]?.date === expected) {
      streak++;
    } else {
      break;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted">Loading your journey...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {todayEntry
              ? `${MOOD_EMOJIS[todayEntry.mood]} Feeling ${MOOD_LABELS[todayEntry.mood]}`
              : "Welcome Back"}
          </h2>
          <p className="text-muted text-sm mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        {!todayEntry && (
          <Link
            href="/checkin"
            className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-medium hover:bg-primary-light transition-all shadow-lg"
          >
            <PenSquare size={16} />
            Check In Today
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 text-muted text-xs font-medium mb-2">
            <TrendingUp size={14} />
            Avg Mood
          </div>
          <div className="text-2xl font-bold text-foreground">{avgMood}<span className="text-sm text-muted">/5</span></div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 text-muted text-xs font-medium mb-2">
            <Brain size={14} />
            Avg Energy
          </div>
          <div className="text-2xl font-bold text-foreground">{avgEnergy}<span className="text-sm text-muted">/5</span></div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 text-muted text-xs font-medium mb-2">
            <Flame size={14} />
            Streak
          </div>
          <div className="text-2xl font-bold text-foreground">{streak} <span className="text-sm text-muted">days</span></div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-5">
          <div className="flex items-center gap-2 text-muted text-xs font-medium mb-2">
            <PenSquare size={14} />
            Total Entries
          </div>
          <div className="text-2xl font-bold text-foreground">{totalEntries}</div>
        </div>
      </div>

      {/* Mood & Energy Chart */}
      {chartData.length > 1 ? (
        <div className="bg-surface rounded-2xl border border-border p-6 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Mood & Energy Trends</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fd79a8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#fd79a8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted)" />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} stroke="var(--muted)" />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  fontSize: "13px",
                }}
              />
              <Area type="monotone" dataKey="mood" stroke="#6c63ff" fill="url(#moodGradient)" strokeWidth={2} name="Mood" />
              <Area type="monotone" dataKey="energy" stroke="#fd79a8" fill="url(#energyGradient)" strokeWidth={2} name="Energy" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border p-12 text-center mb-8">
          <p className="text-4xl mb-4">📊</p>
          <h3 className="text-lg font-semibold text-foreground mb-2">Start Your Journey</h3>
          <p className="text-muted text-sm mb-4">
            Log at least 2 days to see your mood and energy trends here.
          </p>
          <Link
            href="/checkin"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-medium hover:bg-primary-light transition-all"
          >
            <PenSquare size={16} />
            First Check-In
          </Link>
        </div>
      )}

      {/* Recent Entries */}
      {entries.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Entries</h3>
          <div className="space-y-3">
            {entries.slice(-5).reverse().map((entry) => (
              <div
                key={entry.date}
                className="flex items-center justify-between p-4 rounded-xl bg-background border border-border"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{MOOD_EMOJIS[entry.mood]}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(entry.date + "T12:00:00"), "EEEE, MMM d")}
                    </p>
                    <p className="text-xs text-muted">
                      {entry.activities.slice(0, 3).join(", ")}
                      {entry.activities.length > 3 && ` +${entry.activities.length - 3}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-muted">
                  <span>Mood: {MOOD_LABELS[entry.mood]}</span>
                  <span>Energy: {entry.energy}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
