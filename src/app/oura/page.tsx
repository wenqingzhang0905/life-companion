"use client";

import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Watch, Moon, Footprints, Heart, AlertCircle } from "lucide-react";
import { fetchSleepData, fetchActivityData, fetchReadinessData } from "@/lib/oura";
import { OuraSnapshot } from "@/lib/types";

export default function OuraPage() {
  const [data, setData] = useState<OuraSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOuraData();
  }, []);

  const loadOuraData = async () => {
    const token = process.env.NEXT_PUBLIC_OURA_ACCESS_TOKEN;
    if (!token) {
      setError("Oura API token not configured. Add NEXT_PUBLIC_OURA_ACCESS_TOKEN to your .env.local file.");
      setLoading(false);
      return;
    }

    const end = format(new Date(), "yyyy-MM-dd");
    const start = format(subDays(new Date(), 13), "yyyy-MM-dd");

    try {
      const [sleep, activity, readiness] = await Promise.all([
        fetchSleepData(start, end),
        fetchActivityData(start, end),
        fetchReadinessData(start, end),
      ]);

      const dateMap: Record<string, OuraSnapshot> = {};

      sleep.forEach((s) => {
        if (!dateMap[s.day]) dateMap[s.day] = { date: s.day };
        dateMap[s.day].sleepDuration = s.total_sleep_duration;
        dateMap[s.day].avgHR = s.average_heart_rate;
      });

      activity.forEach((a) => {
        if (!dateMap[a.day]) dateMap[a.day] = { date: a.day };
        dateMap[a.day].steps = a.steps;
        dateMap[a.day].activeCalories = a.active_calories;
      });

      readiness.forEach((r) => {
        if (!dateMap[r.day]) dateMap[r.day] = { date: r.day };
        dateMap[r.day].readinessScore = r.score;
        dateMap[r.day].hrvBalance = r.contributors?.hrv_balance;
        dateMap[r.day].tempDeviation = r.temperature_deviation;
      });

      const sorted = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
      setData(sorted);
    } catch (err) {
      setError("Failed to load Oura data. Check your API token.");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-muted">Syncing Oura data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Watch className="text-primary" size={24} />
            Oura Ring Data
          </h2>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-8 text-center">
          <AlertCircle className="mx-auto text-warning mb-4" size={40} />
          <h3 className="text-lg font-semibold text-foreground mb-2">Connect Your Oura Ring</h3>
          <p className="text-muted text-sm mb-4">{error}</p>
          <div className="bg-background rounded-xl p-4 text-left text-sm">
            <p className="font-medium text-foreground mb-2">Setup steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted">
              <li>Go to cloud.ouraring.com and sign in</li>
              <li>Navigate to Personal Access Tokens</li>
              <li>Create a new token</li>
              <li>Copy <code className="text-primary">.env.local.example</code> to <code className="text-primary">.env.local</code></li>
              <li>Paste your token as NEXT_PUBLIC_OURA_ACCESS_TOKEN</li>
              <li>Restart the dev server</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  const latest = data[data.length - 1];
  const sleepChartData = data.map((d) => ({
    date: format(new Date(d.date + "T12:00:00"), "MMM d"),
    hours: d.sleepDuration ? +(d.sleepDuration / 3600).toFixed(1) : 0,
  }));
  const stepsChartData = data.map((d) => ({
    date: format(new Date(d.date + "T12:00:00"), "MMM d"),
    steps: d.steps || 0,
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Watch className="text-primary" size={24} />
          Oura Ring Data
        </h2>
        <p className="text-muted text-sm mt-1">Last 14 days from your Oura Ring</p>
      </div>

      {/* Today's Stats */}
      {latest && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 text-muted text-xs font-medium mb-2">
              <Moon size={14} />
              Sleep
            </div>
            <div className="text-2xl font-bold text-foreground">
              {latest.sleepDuration ? (latest.sleepDuration / 3600).toFixed(1) : "—"}
              <span className="text-sm text-muted"> hrs</span>
            </div>
          </div>
          <div className="bg-surface rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 text-muted text-xs font-medium mb-2">
              <Footprints size={14} />
              Steps
            </div>
            <div className="text-2xl font-bold text-foreground">
              {latest.steps?.toLocaleString() || "—"}
            </div>
          </div>
          <div className="bg-surface rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 text-muted text-xs font-medium mb-2">
              <Heart size={14} />
              Readiness
            </div>
            <div className="text-2xl font-bold text-foreground">
              {latest.readinessScore || "—"}
              <span className="text-sm text-muted">/100</span>
            </div>
          </div>
          <div className="bg-surface rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 text-muted text-xs font-medium mb-2">
              <Heart size={14} />
              Avg HR
            </div>
            <div className="text-2xl font-bold text-foreground">
              {latest.avgHR || "—"}
              <span className="text-sm text-muted"> bpm</span>
            </div>
          </div>
        </div>
      )}

      {/* Sleep Chart */}
      <div className="bg-surface rounded-2xl border border-border p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Sleep Duration</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={sleepChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted)" />
            <YAxis tick={{ fontSize: 12 }} stroke="var(--muted)" />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                fontSize: "13px",
              }}
            />
            <Bar dataKey="hours" fill="#6c63ff" radius={[6, 6, 0, 0]} name="Hours" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Steps Chart */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Daily Steps</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={stepsChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--muted)" />
            <YAxis tick={{ fontSize: 12 }} stroke="var(--muted)" />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                fontSize: "13px",
              }}
            />
            <Bar dataKey="steps" fill="#fd79a8" radius={[6, 6, 0, 0]} name="Steps" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
