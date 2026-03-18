"use client";

import { ACTIVITY_OPTIONS } from "@/lib/types";

interface ActivityPickerProps {
  selected: string[];
  onChange: (activities: string[]) => void;
}

const ACTIVITY_ICONS: Record<string, string> = {
  Exercise: "🏋️", Meditation: "🧘", Reading: "📚", Work: "💼", Social: "👥",
  Creative: "🎨", Learning: "🎓", Nature: "🌿", Cooking: "🍳", Gaming: "🎮",
  Journaling: "✍️", Yoga: "🧘‍♀️", Walking: "🚶", Music: "🎵", Rest: "😌",
};

export default function ActivityPicker({ selected, onChange }: ActivityPickerProps) {
  const toggle = (activity: string) => {
    if (selected.includes(activity)) {
      onChange(selected.filter((a) => a !== activity));
    } else {
      onChange([...selected, activity]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-3">
        What did you do today?
      </label>
      <div className="flex flex-wrap gap-2">
        {ACTIVITY_OPTIONS.map((activity) => (
          <button
            key={activity}
            type="button"
            onClick={() => toggle(activity)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-all ${
              selected.includes(activity)
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-surface border-border text-foreground hover:border-primary-light"
            }`}
          >
            <span>{ACTIVITY_ICONS[activity] || "•"}</span>
            {activity}
          </button>
        ))}
      </div>
    </div>
  );
}
