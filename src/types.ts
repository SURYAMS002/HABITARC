export interface Habit {
  id: string;
  name: string;
  description: string;
  category: "mindfulness" | "fitness" | "work" | "creativity" | "wellness" | "custom";
  habitType: "daily_task" | "non_negotiable"; // Divide between Daily Tasks and Non-Negotiable Core habits
  icon: string; // Lucide icon name
  frequency: "daily" | "weekly_3x" | "weekly_4x" | "weekly_5x";
  currentStreak: number;
  longestStreak: number;
  history: Record<string, boolean>; // Date key "YYYY-MM-DD" -> true if completed
  createdAt: string;
}

export interface PresetTemplate {
  id: string;
  title: string;
  description: string;
  tagline: string;
  conceptText: string; // The "My app takes {{...}} and does {{...}} to create {{...}} that helps me {{...}}" concept string
  icon: string;
  colorTheme: {
    primary: string;
    bg: string;
    text: string;
    badge: string;
    outline: string;
    glow: string;
  };
  defaultHabits: Omit<Habit, "id" | "createdAt" | "currentStreak" | "longestStreak" | "history">[];
}

export interface DailyMotivation {
  quote: string;
  author: string;
}
