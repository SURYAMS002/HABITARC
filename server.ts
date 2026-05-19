import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini Client successfully initialized on backend server.");
  } else {
    console.warn("GEMINI_API_KEY environment variable is not defined. AI coach features will run in mock mode.");
  }
} catch (err: any) {
  console.error("Error initializing Gemini client:", err.message);
}

// API Routes FIRST
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiEnabled: !!ai });
});

// AI Coach feedback endpoint
app.post("/api/coach", async (req: express.Request, res: express.Response) => {
  try {
    const { habits, streakData } = req.body;

    if (!habits || !Array.isArray(habits)) {
       res.status(400).json({ error: "Invalid habits list provided." });
       return;
    }

    // Convert streaks & habits to simple structured details for the prompt
    const habitsSummary = habits.map((h: any) => {
      const completionsCount = h.history ? Object.values(h.history).filter(Boolean).length : 0;
      return `- Habit: "${h.name}" (${h.category || "General"})
  Type: ${h.habitType === "daily_task" ? "Part 1: Life Daily Task (e.g. college class, social/chores)" : "Part 2: Non-Negotiable Wellness Core (e.g. gym, sleep, meditation)"}
  Frequency: ${h.frequency || "daily"}
  Current Streak: ${h.currentStreak || 0} days
  Longest Streak: ${h.longestStreak || 0} days
  Total Completions: ${completionsCount}
  Description: ${h.description || "none"}`;
    }).join("\n");

    const prompt = `Here are my current active habits and my raw progress stats:
${habitsSummary}

Please analyze my progress, streaks, and frequency, and write a personalized summary.
In your feedback:
1. Provide a direct, highly encouraging, and empathetic tone.
2. Formulate 1-2 powerful insights based on my strengths and focus areas.
3. Propose a fun custom "Weekly Challenge" or "Quest" to raise the stakes. Keep it aligned with my existing habits.
4. Generate a catchy custom "Consistency Title" or "Aura Color" describing my current phase (e.g. "Vibrant Green Aura: Creative Fireball" or "Steel Monarch: Unshakable Focus").

Respond in clean, beautiful Markdown format. Use emojis to make it lively!`;

    if (!ai) {
      // Return beautiful default coach message if API key is not yet available
      res.json({
        coachFeedback: `### Welcome to your HabitArc AI Coach! 🌟

It looks like the **GEMINI_API_KEY** is not configured yet. No worries! Here is some general wisdom to keep you motivated:

1. **Building a Habit is a Journey**: Progress isn't linear. It's better to show up for 2 minutes every day than to pull an all-nighter once a week.
2. **Never Miss Twice**: If you miss a check-in, treat it as a temporary blip. The absolute key to streaks is refusing to miss two days in a row.
3. **Weekly Challenge**: "The Micro-Step Quest" — Choose one of your habits and perform just the visual 1-minute version of it today! (e.g., sit down to stretch for 1 minute or code 1 line of code).

*Tip: Add your Gemini API Key in the **Settings > Secrets** panel in AI Studio to get fully custom AI Coaching based on your actual streaks!*`
      });
      return;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are the HabitArc Coach, an empathetic, highly energetic, and brilliant behavioral psychologist and success guide. Your goal is to inspect habit metadata, praise long streaks, encourage those recovering from broken streaks, and suggest immediate, actionable small steps to keep users consistent.",
        temperature: 0.8,
      }
    });

    const feedbackText = response.text || "No response received from AI Coach.";
    res.json({ coachFeedback: feedbackText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: "Error communicating with AI Coach.",
      details: error.message,
      coachFeedback: "### AI Coach is slightly resting... ☕\n\nThere was an issue loading your customized AI insights. Keep showing up and checking off those boxes! Consistently checking off daily tasks is the true win."
    });
  }
});

// Configure Vite middleware for development
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express dev server running on http://localhost:${PORT}`);
  });
}

start();
