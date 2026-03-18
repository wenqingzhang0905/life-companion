"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Music, Video, ExternalLink } from "lucide-react";
import { JournalEntry, MusicRecommendation, VideoRecommendation, MOOD_LABELS, MOOD_EMOJIS, ENERGY_LABELS } from "@/lib/types";
import { getEntryByDate } from "@/lib/firestore";
import { getMusicRecommendations, getVideoRecommendations } from "@/lib/insights";

export default function RecommendationsPage() {
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [music, setMusic] = useState<MusicRecommendation[]>([]);
  const [videos, setVideos] = useState<VideoRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [manualMood, setManualMood] = useState(3);
  const [manualEnergy, setManualEnergy] = useState(3);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const entry = await getEntryByDate(today);
      if (entry) {
        setTodayEntry(entry);
        setMusic(getMusicRecommendations(entry.mood, entry.energy));
        setVideos(getVideoRecommendations(entry.mood, entry.energy));
      } else {
        setMusic(getMusicRecommendations(3, 3));
        setVideos(getVideoRecommendations(3, 3));
      }
    } catch {
      setMusic(getMusicRecommendations(3, 3));
      setVideos(getVideoRecommendations(3, 3));
    }
    setLoading(false);
  };

  const updateManual = (mood: number, energy: number) => {
    setManualMood(mood);
    setManualEnergy(energy);
    setMusic(getMusicRecommendations(mood, energy));
    setVideos(getVideoRecommendations(mood, energy));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted">Curating your recommendations...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Music className="text-primary" size={24} />
          For You
        </h2>
        <p className="text-muted text-sm mt-1">
          Tailored music and video recommendations based on how you feel
        </p>
      </div>

      {/* Current State */}
      <div className="bg-surface rounded-2xl border border-border p-6 mb-8">
        {todayEntry ? (
          <div className="flex items-center gap-4">
            <span className="text-4xl">{MOOD_EMOJIS[todayEntry.mood]}</span>
            <div>
              <p className="font-semibold text-foreground">
                Based on today&apos;s check-in
              </p>
              <p className="text-sm text-muted">
                Mood: {MOOD_LABELS[todayEntry.mood]} | Energy: {ENERGY_LABELS[todayEntry.energy]}
              </p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-foreground mb-3">
              No check-in today — adjust manually:
            </p>
            <div className="flex gap-6">
              <div>
                <label className="text-xs text-muted">Mood</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={manualMood}
                  onChange={(e) => updateManual(+e.target.value, manualEnergy)}
                  className="w-full accent-primary"
                />
                <span className="text-xs text-muted">{MOOD_LABELS[manualMood]}</span>
              </div>
              <div>
                <label className="text-xs text-muted">Energy</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={manualEnergy}
                  onChange={(e) => updateManual(manualMood, +e.target.value)}
                  className="w-full accent-accent"
                />
                <span className="text-xs text-muted">{ENERGY_LABELS[manualEnergy]}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Music Recommendations */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Music size={18} className="text-primary" />
          Music for You
        </h3>
        <div className="space-y-3">
          {music.map((track, i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl border border-border p-5 flex items-center justify-between hover:border-primary-light transition-all"
            >
              <div>
                <p className="font-medium text-foreground">{track.title}</p>
                <p className="text-sm text-muted">
                  {track.artist} · {track.genre}
                </p>
                <p className="text-xs text-primary mt-1">{track.reason}</p>
              </div>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(track.searchQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted hover:text-primary px-3 py-2 rounded-lg hover:bg-surface-hover transition-all"
              >
                <ExternalLink size={14} />
                Listen
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Video Recommendations */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Video size={18} className="text-accent" />
          Videos for You
        </h3>
        <div className="space-y-3">
          {videos.map((vid, i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl border border-border p-5 flex items-center justify-between hover:border-accent transition-all"
            >
              <div>
                <p className="font-medium text-foreground">{vid.title}</p>
                <p className="text-sm text-muted">{vid.category}</p>
                <p className="text-xs text-accent mt-1">{vid.reason}</p>
              </div>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(vid.searchQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted hover:text-accent px-3 py-2 rounded-lg hover:bg-surface-hover transition-all"
              >
                <ExternalLink size={14} />
                Watch
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
