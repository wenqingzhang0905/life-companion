"use client";

import { useState, useEffect } from "react";
import { Flame, Plus, Trash2, Check } from "lucide-react";
import { Streak } from "@/lib/types";
import { addStreak, getStreaks, updateStreak, deleteStreak } from "@/lib/firestore";
import { format } from "date-fns";

export default function StreaksPage() {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreaks();
  }, []);

  const loadStreaks = async () => {
    try {
      const data = await getStreaks();
      setStreaks(data);
    } catch {
      setStreaks([]);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const streak: Streak = {
      name: newName.trim(),
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: "",
      createdAt: Date.now(),
    };
    const id = await addStreak(streak);
    setStreaks([{ ...streak, id }, ...streaks]);
    setNewName("");
  };

  const handleComplete = async (streak: Streak) => {
    const today = format(new Date(), "yyyy-MM-dd");
    if (streak.lastCompletedDate === today) return;

    const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd");
    const isConsecutive = streak.lastCompletedDate === yesterday;
    const newCurrent = isConsecutive ? streak.currentStreak + 1 : 1;
    const newLongest = Math.max(streak.longestStreak, newCurrent);

    const updates = {
      currentStreak: newCurrent,
      longestStreak: newLongest,
      lastCompletedDate: today,
    };

    await updateStreak(streak.id!, updates);
    setStreaks(streaks.map((s) => (s.id === streak.id ? { ...s, ...updates } : s)));
  };

  const handleDelete = async (id: string) => {
    await deleteStreak(id);
    setStreaks(streaks.filter((s) => s.id !== id));
  };

  const today = format(new Date(), "yyyy-MM-dd");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted">Loading streaks...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Flame className="text-accent" size={24} />
          Habit Streaks
        </h2>
        <p className="text-muted text-sm mt-1">Track your daily habits and build consistency</p>
      </div>

      {/* Add New Streak */}
      <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add a new habit to track..."
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="bg-primary text-white px-5 py-3 rounded-xl font-medium hover:bg-primary-light transition-all disabled:opacity-40 flex items-center gap-2"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      {/* Streaks List */}
      {streaks.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-12 text-center">
          <p className="text-4xl mb-4">🔥</p>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Habits Yet</h3>
          <p className="text-muted text-sm">
            Add your first habit above to start tracking streaks.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {streaks.map((streak) => {
            const completedToday = streak.lastCompletedDate === today;
            return (
              <div
                key={streak.id}
                className={`bg-surface rounded-2xl border p-5 flex items-center justify-between transition-all ${
                  completedToday ? "border-success" : "border-border"
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleComplete(streak)}
                    disabled={completedToday}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      completedToday
                        ? "bg-success text-white"
                        : "bg-background border-2 border-border hover:border-success"
                    }`}
                  >
                    {completedToday && <Check size={18} />}
                  </button>
                  <div>
                    <p className="font-medium text-foreground">{streak.name}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {completedToday ? "Done today!" : "Tap to complete"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{streak.currentStreak}</p>
                    <p className="text-xs text-muted">Current</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{streak.longestStreak}</p>
                    <p className="text-xs text-muted">Best</p>
                  </div>
                  <button
                    onClick={() => handleDelete(streak.id!)}
                    className="p-2 text-muted hover:text-accent rounded-lg hover:bg-surface-hover transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
