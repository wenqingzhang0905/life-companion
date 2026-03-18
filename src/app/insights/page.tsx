"use client";

import { useState, useEffect } from "react";
import { Lightbulb } from "lucide-react";
import { JournalEntry, Insight } from "@/lib/types";
import { getEntries } from "@/lib/firestore";
import { generateInsights } from "@/lib/insights";

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const entries = await getEntries(60);
      const generated = generateInsights(entries, []);
      setInsights(generated);
    } catch {
      setInsights([]);
    }
    setLoading(false);
  };

  const typeColors = {
    pattern: "border-l-primary bg-primary/5",
    recommendation: "border-l-success bg-success/5",
    nudge: "border-l-warning bg-warning/5",
  };

  const typeLabels = {
    pattern: "Pattern",
    recommendation: "Recommendation",
    nudge: "Nudge",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted">Analyzing your patterns...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Lightbulb className="text-warning" size={24} />
          Smart Insights
        </h2>
        <p className="text-muted text-sm mt-1">
          AI-powered patterns and recommendations based on your data
        </p>
      </div>

      {insights.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border p-12 text-center">
          <p className="text-4xl mb-4">🧠</p>
          <h3 className="text-lg font-semibold text-foreground mb-2">Not Enough Data Yet</h3>
          <p className="text-muted text-sm">
            Keep logging your daily check-ins. Insights will appear once you have enough entries.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`rounded-2xl border border-border border-l-4 p-6 ${typeColors[insight.type]}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{insight.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted uppercase tracking-wide">
                      {typeLabels[insight.type]}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Weekly Summary Placeholder */}
      <div className="mt-8 bg-surface rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Weekly Summary</h3>
        <div className="bg-background rounded-xl p-4">
          <p className="text-sm text-muted italic">
            Weekly summaries will auto-generate every Sunday based on your check-in data,
            Oura metrics, and completed streaks. Keep logging to unlock this feature.
          </p>
        </div>
      </div>
    </div>
  );
}
