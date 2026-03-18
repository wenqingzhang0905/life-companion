export interface JournalEntry {
  id?: string;
  date: string; // YYYY-MM-DD
  mood: number; // 1-5
  energy: number; // 1-5
  activities: string[];
  tags: string[];
  goals: string;
  reflections: string;
  gratitude: string;
  sleepQuality?: number; // 1-5
  createdAt: number;
}

export interface OuraSnapshot {
  date: string;
  sleepScore?: number;
  sleepDuration?: number;
  readinessScore?: number;
  steps?: number;
  activeCalories?: number;
  avgHR?: number;
  hrvBalance?: number;
  tempDeviation?: number;
}

export interface Streak {
  id?: string;
  name: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string;
  createdAt: number;
}

export interface Insight {
  type: "pattern" | "recommendation" | "nudge";
  title: string;
  description: string;
  icon: string;
}

export interface MusicRecommendation {
  title: string;
  artist: string;
  genre: string;
  reason: string;
  searchQuery: string;
}

export interface VideoRecommendation {
  title: string;
  category: string;
  reason: string;
  searchQuery: string;
}

export const ACTIVITY_OPTIONS = [
  "Exercise", "Meditation", "Reading", "Work", "Social",
  "Creative", "Learning", "Nature", "Cooking", "Gaming",
  "Journaling", "Yoga", "Walking", "Music", "Rest",
];

export const TAG_OPTIONS = [
  "fitness", "work", "social", "creative", "self-care",
  "productivity", "relaxation", "adventure", "family", "health",
];

export const MOOD_LABELS = ["", "Awful", "Bad", "Okay", "Good", "Great"];
export const ENERGY_LABELS = ["", "Exhausted", "Low", "Moderate", "High", "Energized"];
export const MOOD_EMOJIS = ["", "😞", "😔", "😐", "😊", "😄"];
export const ENERGY_EMOJIS = ["", "🪫", "😴", "⚡", "🔥", "✨"];
