"use client";

import { MOOD_LABELS, MOOD_EMOJIS, ENERGY_LABELS, ENERGY_EMOJIS } from "@/lib/types";

interface MoodSelectorProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  type: "mood" | "energy";
}

export default function MoodSelector({ label, value, onChange, type }: MoodSelectorProps) {
  const labels = type === "mood" ? MOOD_LABELS : ENERGY_LABELS;
  const emojis = type === "mood" ? MOOD_EMOJIS : ENERGY_EMOJIS;
  const colors = type === "mood"
    ? ["", "bg-red-100 border-red-300", "bg-orange-100 border-orange-300", "bg-yellow-100 border-yellow-300", "bg-green-100 border-green-300", "bg-emerald-100 border-emerald-300"]
    : ["", "bg-gray-100 border-gray-300", "bg-blue-100 border-blue-300", "bg-cyan-100 border-cyan-300", "bg-amber-100 border-amber-300", "bg-purple-100 border-purple-300"];

  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-3">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all ${
              value === level
                ? `${colors[level]} scale-105 shadow-md`
                : "bg-surface border-border hover:border-primary-light"
            }`}
          >
            <span className="text-2xl">{emojis[level]}</span>
            <span className="text-xs font-medium">{labels[level]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
