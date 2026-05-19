import { PresetTemplate, DailyMotivation } from "./types";

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: "mindful-morning",
    title: "Mindful Morning Companion",
    description: "Align your headspace before the chaos begins.",
    tagline: "Start with purpose. End with awareness.",
    conceptText: "My app takes morning mindfulness, 10 min stretching, and writing a daily intention and does interactive morning check-ins and streak calculation to create an animated morning ritual calendar with glowing progress rings that helps me start my day centered, consistent, and mentally prepared.",
    icon: "Sun",
    colorTheme: {
      primary: "#D4AF37", // Gold
      bg: "from-amber-50 to-orange-100",
      text: "text-amber-800",
      badge: "bg-amber-100 text-amber-900 border-amber-200",
      outline: "border-amber-300",
      glow: "shadow-amber-200/50"
    },
    defaultHabits: [
      {
        name: "Morning Mindfulness",
        description: "10 minutes of quiet, unhurried breathwork or meditation.",
        category: "mindfulness",
        habitType: "non_negotiable",
        icon: "Heart",
        frequency: "daily"
      },
      {
        name: "Stretch & Align",
        description: "10 minutes of intentional yoga poses or dynamic stretches.",
        category: "mindfulness",
        habitType: "non_negotiable",
        icon: "Activity",
        frequency: "daily"
      },
      {
        name: "Daily Intention Writing",
        description: "Note one primary focus, value, or feeling for the day.",
        category: "mindfulness",
        habitType: "daily_task",
        icon: "BookOpen",
        frequency: "daily"
      }
    ]
  },
  {
    id: "deep-work",
    title: "Deep Work Builder",
    description: "Conquer procrastination and log high-impact visual segments.",
    tagline: "Shield your focus. Build your architectural mind.",
    conceptText: "My app takes 90 minutes of focused coding, zero social media before noon, and logging daily key accomplishments and does time-locked check-ins, focus session countdowns, and distraction trackers to create a digital block-building grid where each completed day adds a virtual building block to my weekly workspace that helps me conquer procrastination, build deep focus-ability, and track high-value output.",
    icon: "Cpu",
    colorTheme: {
      primary: "#2563EB", // Tech Blue
      bg: "from-blue-50 to-indigo-100",
      text: "text-blue-800",
      badge: "bg-blue-100 text-blue-900 border-blue-200",
      outline: "border-blue-300",
      glow: "shadow-blue-200/50"
    },
    defaultHabits: [
      {
        name: "90m Focus Sprint",
        description: "One uninterrupted deep block of technical execution.",
        category: "work",
        habitType: "non_negotiable",
        icon: "Terminal",
        frequency: "daily"
      },
      {
        name: "Zero Social Media Before Noon",
        description: "Postpone the superficial feedback loops until lunch.",
        category: "work",
        habitType: "non_negotiable",
        icon: "EyeOff",
        frequency: "daily"
      },
      {
        name: "Attend College & Lectures",
        description: "Show up to classes of the day, take smart notes.",
        category: "work",
        habitType: "daily_task",
        icon: "BookOpen",
        frequency: "daily"
      }
    ]
  },
  {
    id: "creative-spark",
    title: "Daily Creative Flow Spark",
    description: "Maintain an active sandbox of random playful imagination.",
    conceptText: "My app takes sketching a 5-minute doodle, writing 100 random words, and reading 5 pages of a creative book and does daily prompts, interactive sketchpads, and expression logging to create a vibrant color-evolving abstract artwork canvas representing completed streaks that helps me maintain an active creative imagination, step out of comfort zones, and make art a daily constant.",
    tagline: "Infinite ideas. No self-criticism.",
    icon: "Palette",
    colorTheme: {
      primary: "#DB2777", // Vibrant pink
      bg: "from-pink-50 to-purple-100",
      text: "text-pink-800",
      badge: "bg-pink-100 text-pink-900 border-pink-200",
      outline: "border-pink-300",
      glow: "shadow-pink-200/50"
    },
    defaultHabits: [
      {
        name: "5-Minute Doodle",
        description: "Unfiltered pencil sketch, digital scribble, or abstract lineart.",
        category: "creativity",
        habitType: "daily_task",
        icon: "Brush",
        frequency: "daily"
      },
      {
        name: "100 Random Words",
        description: "Stream of consciousness journaling or creative snippet writing.",
        category: "creativity",
        habitType: "daily_task",
        icon: "PenTool",
        frequency: "daily"
      },
      {
        name: "Creative Reading & Study",
        description: "Absorb at least 5 pages of a book outside your immediate field.",
        category: "creativity",
        habitType: "non_negotiable",
        icon: "Compass",
        frequency: "daily"
      }
    ]
  },
  {
    id: "hydration-wellness",
    title: "Hydration & Wellness Ritual",
    description: "Prioritise daily physical baselines to power your day.",
    conceptText: "My app takes drinking 3 Liters of water, walking 8,000 steps, and sleeping 7+ hours and does quick water cup tap trackers, step goal counters, and daily reviews to create a flourishing virtual terrarium garden that grows more vibrant with consistent completions but stays dormant on missed days that helps me stay physically energized, prioritise daily baseline health, and see physical consistency in real-time.",
    tagline: "Water your body. Grow your inner conservatory.",
    icon: "Sprout",
    colorTheme: {
      primary: "#10B981", // Emerald Green
      bg: "from-emerald-50 to-teal-100",
      text: "text-emerald-800",
      badge: "bg-emerald-100 text-[#10B981] border-emerald-200",
      outline: "border-emerald-300",
      glow: "shadow-emerald-200/50"
    },
    defaultHabits: [
      {
        name: "3 Liters of Water",
        description: "Stay hydrated seamlessly throughout your focus hours.",
        category: "wellness",
        habitType: "non_negotiable",
        icon: "GlassWater",
        frequency: "daily"
      },
      {
        name: "Meet Friends or Socialise",
        description: "Check in with team or meet campus colleagues for high-quality break.",
        category: "wellness",
        habitType: "daily_task",
        icon: "Compass",
        frequency: "daily"
      },
      {
        name: "Intense Gym Session",
        description: "Unleash sweat, strength, or active cardio at the fitness club.",
        category: "fitness",
        habitType: "non_negotiable",
        icon: "Activity",
        frequency: "daily"
      }
    ]
  }
];

export const MOTIVATIONS: DailyMotivation[] = [
  {
    quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle"
  },
  {
    quote: "It is easier to prevent bad habits than to break them.",
    author: "Benjamin Franklin"
  },
  {
    quote: "The secret of your future is hidden in your daily routine.",
    author: "Mike Murdock"
  },
  {
    quote: "Consistency is not about perfection. It’s about being present, over and over.",
    author: "Alex Morgan"
  },
  {
    quote: "Great things are done by a series of small things brought together.",
    author: "Vincent Van Gogh"
  }
];
