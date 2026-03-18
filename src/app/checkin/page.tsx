"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Save, ChevronLeft, ChevronRight } from "lucide-react";
import MoodSelector from "@/components/MoodSelector";
import ActivityPicker from "@/components/ActivityPicker";
import { TAG_OPTIONS, JournalEntry } from "@/lib/types";
import { addEntry, getEntryByDate, updateEntry } from "@/lib/firestore";

export default function CheckInPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [mood, setMood] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [activities, setActivities] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [goals, setGoals] = useState("");
  const [reflections, setReflections] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [sleepQuality, setSleepQuality] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [existingId, setExistingId] = useState<string | null>(null);

  const changeDate = (days: number) => {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + days);
    const newDate = format(d, "yyyy-MM-dd");
    setDate(newDate);
    setSaved(false);
    loadEntry(newDate);
  };

  const loadEntry = async (d: string) => {
    try {
      const entry = await getEntryByDate(d);
      if (entry) {
        setMood(entry.mood);
        setEnergy(entry.energy);
        setActivities(entry.activities);
        setTags(entry.tags);
        setGoals(entry.goals);
        setReflections(entry.reflections);
        setGratitude(entry.gratitude);
        setSleepQuality(entry.sleepQuality || 0);
        setExistingId(entry.id || null);
      } else {
        resetForm();
      }
    } catch {
      resetForm();
    }
  };

  const resetForm = () => {
    setMood(0);
    setEnergy(0);
    setActivities([]);
    setTags([]);
    setGoals("");
    setReflections("");
    setGratitude("");
    setSleepQuality(0);
    setExistingId(null);
  };

  const handleSave = async () => {
    if (mood === 0 || energy === 0) return;
    setSaving(true);
    setSaveError("");
    try {
      const entry: JournalEntry = {
        date,
        mood,
        energy,
        activities,
        tags,
        goals,
        reflections,
        gratitude,
        sleepQuality,
        createdAt: Date.now(),
      };

      const savePromise = existingId
        ? updateEntry(existingId, entry).then(() => existingId)
        : addEntry(entry);

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Save timed out")), 10000)
      );

      const id = await Promise.race([savePromise, timeoutPromise]);
      if (!existingId) setExistingId(id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save entry:", error);
      setSaveError("Could not save. Check your internet connection and Firebase setup.");
      setTimeout(() => setSaveError(""), 5000);
    }
    setSaving(false);
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const isToday = date === format(new Date(), "yyyy-MM-dd");

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Daily Check-In</h2>
          <p className="text-muted text-sm mt-1">How are you doing today?</p>
        </div>
        <div className="flex items-center gap-2 bg-surface rounded-xl border border-border px-2 py-1">
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-surface-hover rounded-lg">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium px-2 min-w-[120px] text-center">
            {isToday ? "Today" : format(new Date(date + "T12:00:00"), "MMM d, yyyy")}
          </span>
          <button
            onClick={() => changeDate(1)}
            disabled={isToday}
            className="p-2 hover:bg-surface-hover rounded-lg disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Mood */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <MoodSelector label="How's your mood?" value={mood} onChange={setMood} type="mood" />
        </div>

        {/* Energy */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <MoodSelector label="Energy level?" value={energy} onChange={setEnergy} type="energy" />
        </div>

        {/* Sleep Quality */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <MoodSelector label="Sleep quality last night?" value={sleepQuality} onChange={setSleepQuality} type="energy" />
        </div>

        {/* Activities */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <ActivityPicker selected={activities} onChange={setActivities} />
        </div>

        {/* Tags */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <label className="block text-sm font-semibold text-foreground mb-3">Tags</label>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  tags.includes(tag)
                    ? "bg-accent text-white border-accent"
                    : "bg-surface border-border text-muted hover:border-accent"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <label className="block text-sm font-semibold text-foreground mb-3">
            Goals for {isToday ? "today" : "this day"}
          </label>
          <textarea
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="What do you want to accomplish?"
            className="w-full bg-background border border-border rounded-xl p-4 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
        </div>

        {/* Reflections */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <label className="block text-sm font-semibold text-foreground mb-3">
            Reflections
          </label>
          <textarea
            value={reflections}
            onChange={(e) => setReflections(e.target.value)}
            placeholder="What's on your mind? How did the day go?"
            className="w-full bg-background border border-border rounded-xl p-4 text-sm resize-none h-32 focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
        </div>

        {/* Gratitude */}
        <div className="bg-surface rounded-2xl border border-border p-6">
          <label className="block text-sm font-semibold text-foreground mb-3">
            Gratitude
          </label>
          <textarea
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="What are you grateful for today?"
            className="w-full bg-background border border-border rounded-xl p-4 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={mood === 0 || energy === 0 || saving}
          className={`w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
            saved
              ? "bg-success"
              : mood === 0 || energy === 0
              ? "bg-muted cursor-not-allowed"
              : "bg-primary hover:bg-primary-light shadow-lg hover:shadow-xl"
          }`}
        >
          <Save size={18} />
          {saving ? "Saving..." : saved ? "Saved!" : existingId ? "Update Entry" : "Save Entry"}
        </button>

        {/* Save feedback */}
        {saved && (
          <div className="text-center text-success text-sm font-medium py-2 bg-success/10 rounded-xl">
            Entry saved to Firebase successfully!
          </div>
        )}
        {saveError && (
          <div className="text-center text-accent text-sm font-medium py-2 bg-accent/10 rounded-xl">
            {saveError}
          </div>
        )}
      </div>
    </div>
  );
}
