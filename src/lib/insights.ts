import { JournalEntry, OuraSnapshot, Insight, MusicRecommendation, VideoRecommendation } from "./types";

export function generateInsights(entries: JournalEntry[], ouraData: OuraSnapshot[]): Insight[] {
  const insights: Insight[] = [];
  if (entries.length < 3) {
    insights.push({
      type: "nudge",
      title: "Keep Logging!",
      description: "Log at least 3 days to start seeing personalized insights about your patterns.",
      icon: "📝",
    });
    return insights;
  }

  const recent = entries.slice(-7);
  const avgMood = recent.reduce((s, e) => s + e.mood, 0) / recent.length;
  const avgEnergy = recent.reduce((s, e) => s + e.energy, 0) / recent.length;

  // Mood trend
  if (recent.length >= 3) {
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    const firstAvg = firstHalf.reduce((s, e) => s + e.mood, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, e) => s + e.mood, 0) / secondHalf.length;
    if (secondAvg > firstAvg + 0.5) {
      insights.push({
        type: "pattern",
        title: "Mood Trending Up",
        description: "Your mood has been improving recently. Keep doing what you're doing!",
        icon: "📈",
      });
    } else if (secondAvg < firstAvg - 0.5) {
      insights.push({
        type: "pattern",
        title: "Mood Dipping",
        description: "Your mood has dipped recently. Consider activities that usually boost your spirits.",
        icon: "📉",
      });
    }
  }

  // Activity-mood correlation
  const activityMoodMap: Record<string, { total: number; count: number }> = {};
  entries.forEach((e) => {
    e.activities.forEach((a) => {
      if (!activityMoodMap[a]) activityMoodMap[a] = { total: 0, count: 0 };
      activityMoodMap[a].total += e.mood;
      activityMoodMap[a].count += 1;
    });
  });

  let bestActivity = "";
  let bestAvg = 0;
  Object.entries(activityMoodMap).forEach(([activity, data]) => {
    if (data.count >= 2) {
      const avg = data.total / data.count;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestActivity = activity;
      }
    }
  });

  if (bestActivity && bestAvg > avgMood) {
    insights.push({
      type: "recommendation",
      title: `${bestActivity} Boosts Your Mood`,
      description: `Days with ${bestActivity.toLowerCase()} average a ${bestAvg.toFixed(1)}/5 mood vs your overall ${avgMood.toFixed(1)}/5. Try to do more of it!`,
      icon: "💡",
    });
  }

  // Oura-based insights
  if (ouraData.length > 0) {
    const recentOura = ouraData.slice(-7);
    const avgSleep = recentOura.filter((d) => d.sleepDuration).reduce((s, d) => s + (d.sleepDuration || 0), 0) / recentOura.filter((d) => d.sleepDuration).length;

    if (avgSleep && avgSleep < 7 * 3600) {
      insights.push({
        type: "nudge",
        title: "Sleep More",
        description: `You're averaging ${(avgSleep / 3600).toFixed(1)} hours of sleep. Aim for 7-8 hours for better mood and energy.`,
        icon: "😴",
      });
    }

    const avgReadiness = recentOura.filter((d) => d.readinessScore).reduce((s, d) => s + (d.readinessScore || 0), 0) / recentOura.filter((d) => d.readinessScore).length;
    if (avgReadiness && avgReadiness > 80) {
      insights.push({
        type: "pattern",
        title: "High Readiness",
        description: `Your Oura readiness score is averaging ${avgReadiness.toFixed(0)}. Great recovery — push yourself today!`,
        icon: "🏆",
      });
    }
  }

  // Energy insight
  if (avgEnergy < 2.5) {
    insights.push({
      type: "nudge",
      title: "Low Energy Pattern",
      description: "Your energy has been low. Consider checking your sleep, hydration, and activity levels.",
      icon: "🔋",
    });
  }

  return insights;
}

export function getMusicRecommendations(mood: number, energy: number): MusicRecommendation[] {
  if (mood <= 2 && energy <= 2) {
    return [
      { title: "Weightless", artist: "Marconi Union", genre: "Ambient", reason: "Scientifically proven to reduce anxiety", searchQuery: "Marconi Union Weightless" },
      { title: "Clair de Lune", artist: "Debussy", genre: "Classical", reason: "Gentle piano to lift your spirits", searchQuery: "Debussy Clair de Lune" },
      { title: "Sunset Lover", artist: "Petit Biscuit", genre: "Chill Electronic", reason: "Warm, uplifting vibes", searchQuery: "Petit Biscuit Sunset Lover" },
    ];
  } else if (mood <= 2 && energy > 2) {
    return [
      { title: "Here Comes the Sun", artist: "The Beatles", genre: "Classic Rock", reason: "A reminder that brighter days come", searchQuery: "Beatles Here Comes the Sun" },
      { title: "Three Little Birds", artist: "Bob Marley", genre: "Reggae", reason: "Don't worry about a thing", searchQuery: "Bob Marley Three Little Birds" },
      { title: "Best Part", artist: "Daniel Caesar", genre: "R&B", reason: "Soulful comfort music", searchQuery: "Daniel Caesar Best Part" },
    ];
  } else if (mood > 3 && energy > 3) {
    return [
      { title: "On Top of the World", artist: "Imagine Dragons", genre: "Pop Rock", reason: "Match your high energy and great mood", searchQuery: "Imagine Dragons On Top of the World" },
      { title: "Blinding Lights", artist: "The Weeknd", genre: "Synthpop", reason: "Keep the momentum going", searchQuery: "The Weeknd Blinding Lights" },
      { title: "Levitating", artist: "Dua Lipa", genre: "Pop", reason: "Upbeat energy for a great day", searchQuery: "Dua Lipa Levitating" },
    ];
  } else if (energy <= 2) {
    return [
      { title: "Lo-fi Study Beats", artist: "Various", genre: "Lo-fi", reason: "Gentle background music for low energy days", searchQuery: "lofi study beats playlist" },
      { title: "Gymnopédie No.1", artist: "Erik Satie", genre: "Classical", reason: "Peaceful and restorative", searchQuery: "Erik Satie Gymnopedie" },
      { title: "Intro", artist: "The xx", genre: "Indie", reason: "Calm and atmospheric", searchQuery: "The xx Intro" },
    ];
  } else {
    return [
      { title: "Electric Feel", artist: "MGMT", genre: "Indie Pop", reason: "Steady vibes for a balanced day", searchQuery: "MGMT Electric Feel" },
      { title: "Tongue Tied", artist: "Grouplove", genre: "Indie Rock", reason: "Feel-good energy", searchQuery: "Grouplove Tongue Tied" },
      { title: "Banana Pancakes", artist: "Jack Johnson", genre: "Acoustic", reason: "Easy-going good vibes", searchQuery: "Jack Johnson Banana Pancakes" },
    ];
  }
}

export function getVideoRecommendations(mood: number, energy: number): VideoRecommendation[] {
  if (mood <= 2 && energy <= 2) {
    return [
      { title: "10-Min Guided Meditation for Stress", category: "Wellness", reason: "Calm your mind when feeling low", searchQuery: "10 minute guided meditation stress relief" },
      { title: "Gentle Yoga for Rest Days", category: "Fitness", reason: "Light movement to restore energy", searchQuery: "gentle yoga for tired days 15 min" },
      { title: "Beautiful Nature 4K Relaxation", category: "Relaxation", reason: "Visual calm for your mind", searchQuery: "4K nature relaxation beautiful scenery" },
    ];
  } else if (mood <= 2 && energy > 2) {
    return [
      { title: "How to Reframe Negative Thoughts", category: "Self-Help", reason: "Turn your energy into positive momentum", searchQuery: "cognitive reframing negative thoughts" },
      { title: "Uplifting Stand-Up Comedy", category: "Entertainment", reason: "Laughter is the best medicine", searchQuery: "best feel good stand up comedy" },
      { title: "Quick HIIT Workout", category: "Fitness", reason: "Channel that energy into movement", searchQuery: "15 minute HIIT workout at home" },
    ];
  } else if (mood > 3 && energy > 3) {
    return [
      { title: "TED Talk: The Power of Vulnerability", category: "Learning", reason: "Feed your curious, positive mindset", searchQuery: "Brene Brown TED talk vulnerability" },
      { title: "Advanced Workout Challenge", category: "Fitness", reason: "Push yourself while you're feeling great", searchQuery: "30 minute advanced full body workout" },
      { title: "Creative Productivity Tips", category: "Productivity", reason: "Maximize this high-energy day", searchQuery: "productivity tips creative people" },
    ];
  } else {
    return [
      { title: "Daily Stretching Routine", category: "Fitness", reason: "Maintain balance with gentle movement", searchQuery: "daily stretching routine 10 minutes" },
      { title: "Interesting Science Documentary", category: "Learning", reason: "Engage your mind with something fascinating", searchQuery: "best short science documentary 2024" },
      { title: "Cooking a Quick Healthy Meal", category: "Lifestyle", reason: "Nourish yourself with something delicious", searchQuery: "quick healthy meal recipe 15 minutes" },
    ];
  }
}
