import React, { useState, useEffect } from "react";
import { 
  Sun, 
  Moon, 
  Terminal, 
  EyeOff, 
  TrendingUp, 
  Brush, 
  PenTool, 
  Compass, 
  Heart, 
  Activity, 
  Footprints, 
  Sprout, 
  Award, 
  Flame, 
  Calendar, 
  Sparkles, 
  Trash2, 
  Plus, 
  MessageSquare, 
  Clock, 
  Wand2, 
  Check, 
  RotateCcw, 
  BookOpen, 
  GlassWater, 
  Cpu, 
  HelpCircle,
  PlusCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  Coffee,
  Book,
  Scissors
} from "lucide-react";
import { PRESET_TEMPLATES, MOTIVATIONS } from "./constants";
import { Habit, PresetTemplate, DailyMotivation } from "./types";

// Dynamic Icon Component Mapper
function HabitIcon({ name, className = "w-5 h-5" }: { name: string; className?: string }) {
  const icons: Record<string, any> = {
    Sun,
    Moon,
    Terminal,
    EyeOff,
    TrendingUp,
    Brush,
    PenTool,
    Compass,
    Heart,
    Activity,
    Footprints,
    Sprout,
    Award,
    Flame,
    BookOpen,
    GlassWater,
    Cpu,
    Coffee,
    Book,
    Scissors
  };
  const IconComponent = icons[name] || HelpCircle;
  return <IconComponent className={className} />;
}

// Format date helper: YYYY-MM-DD
function getFormattedDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Generate recent dates list 
function getRecentDates(count: number = 14): Date[] {
  const dates: Date[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d);
  }
  return dates;
}

// Calculate streak details for a habit
function calculateStreaks(history: Record<string, boolean>): { current: number; longest: number } {
  let current = 0;
  let longest = 0;

  const today = new Date();
  let checkDate = new Date(today);
  const todayStr = getFormattedDate(checkDate);
  
  let yesterdayCheck = new Date(today);
  yesterdayCheck.setDate(yesterdayCheck.getDate() - 1);
  const yesterdayStr = getFormattedDate(yesterdayCheck);

  const hasToday = !!history[todayStr];
  const hasYesterday = !!history[yesterdayStr];

  if (hasToday) {
    let d = new Date(today);
    while (true) {
      const dStr = getFormattedDate(d);
      if (history[dStr]) {
        current++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
  } else if (hasYesterday) {
    let d = new Date(yesterdayCheck);
    while (true) {
      const dStr = getFormattedDate(d);
      if (history[dStr]) {
        current++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // To find longest streak: get sorted chronological list of completed keys
  const datesWithCompletions = Object.keys(history)
    .filter(key => history[key])
    .sort();

  if (datesWithCompletions.length === 0) {
    return { current, longest: current };
  }

  let maxTemp = 0;
  let prevDate: Date | null = null;

  for (const dateStr of datesWithCompletions) {
    const currentDate = new Date(dateStr);
    
    if (prevDate === null) {
      maxTemp = 1;
    } else {
      const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        maxTemp++;
      } else if (diffDays > 1) {
        if (maxTemp > longest) {
          longest = maxTemp;
        }
        maxTemp = 1;
      }
    }
    prevDate = currentDate;
  }
  
  longest = Math.max(longest, maxTemp);
  longest = Math.max(longest, current);

  return { current, longest };
}

export default function App() {
  // Page Navigation State
  // We model a physical vintage notebook with specific layout pages
  // Page 1: 📖 Daily Log Ledger
  // Page 2: 📈 Streaks Ledger
  // Page 3: ✍️ Designer (Add/Erase Habits & Edit Concept variables)
  // Page 4: 📜 AI Coach Sanctuary
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Load configuration or fallbacks
  const [selectedPresetId, setSelectedPresetId] = useState<string>("hydration-wellness");
  const [appName, setAppName] = useState<string>("Baselines Daily Journal");
  const [appDescription, setAppDescription] = useState<string>("Keep your essential physical rituals active alongside your campus appointments.");
  
  // Custom formula variables
  const [conceptDailyTasks, setConceptDailyTasks] = useState<string>("attending campus sessions and meeting colleagues");
  const [conceptProcess, setConceptProcess] = useState<string>("daily health check-ins and non-negotiable streaks review");
  const [conceptCompletions, setConceptCompletions] = useState<string>("an integrated classic ledger of completed life events");
  const [conceptGoal, setConceptGoal] = useState<string>("maintain peak sanity, sleep, and consistent mental nourishment");

  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(getFormattedDate(new Date()));
  
  // Form input states
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitDesc, setNewHabitDesc] = useState("");
  const [newHabitType, setNewHabitType] = useState<"daily_task" | "non_negotiable">("daily_task");
  const [newHabitCategory, setNewHabitCategory] = useState<Habit["category"]>("wellness");
  const [newHabitIcon, setNewHabitIcon] = useState("Activity");
  const [newHabitFrequency, setNewHabitFrequency] = useState<Habit["frequency"]>("daily");

  // Motivation Quote state
  const [quoteIndex, setQuoteIndex] = useState(0);

  // AI Habit Coach values
  const [coachFeedback, setCoachFeedback] = useState<string>(`### Awaiting your Journey Analysis... 📜

Use the button on the **Solitary Coach's Room** page to analyze your habits sequence. Your physical non-negotiables & daily tasks stats will be securely calculated to prompt bespoke guidance.`);
  const [isGeneratingCoach, setIsGeneratingCoach] = useState(false);

  // Custom visual toast alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load default habits or saved list from LocalStorage
  useEffect(() => {
    const savedPresets = localStorage.getItem("habit_preset_id") || "hydration-wellness";
    const savedHabits = localStorage.getItem("habit_list");
    const savedConceptInput = localStorage.getItem("concept_daily_tasks");
    const savedConceptProcess = localStorage.getItem("concept_process");
    const savedConceptCompletions = localStorage.getItem("concept_completions");
    const savedConceptGoal = localStorage.getItem("concept_goal");
    const savedAppName = localStorage.getItem("app_name");
    const savedAppDesc = localStorage.getItem("app_description");

    if (savedHabits) {
      try {
        const parsed = JSON.parse(savedHabits);
        // Fallback checks to ensure all habits have a habitType attribute
        const validated = parsed.map((h: any) => ({
          ...h,
          habitType: h.habitType || (h.category === "work" || h.name.toLowerCase().includes("college") ? "daily_task" : "non_negotiable")
        }));
        setHabits(validated);
        setSelectedPresetId(savedPresets);
        if (savedAppName) setAppName(savedAppName);
        if (savedAppDesc) setAppDescription(savedAppDesc);
        if (savedConceptInput) setConceptDailyTasks(savedConceptInput);
        if (savedConceptProcess) setConceptProcess(savedConceptProcess);
        if (savedConceptCompletions) setConceptCompletions(savedConceptCompletions);
        if (savedConceptGoal) setConceptGoal(savedConceptGoal);
      } catch (err) {
        console.error("Failed loading local storage habits, resetting", err);
        loadPresetTemplate(PRESET_TEMPLATES[3] || PRESET_TEMPLATES[0]);
      }
    } else {
      loadPresetTemplate(PRESET_TEMPLATES[3] || PRESET_TEMPLATES[0]);
    }

    setQuoteIndex(Math.floor(Math.random() * MOTIVATIONS.length));
  }, []);

  // Save to local storage
  const saveHabitsToLocal = (updatedHabits: Habit[]) => {
    localStorage.setItem("habit_list", JSON.stringify(updatedHabits));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Turn page action
  const turnToPage = (pageNum: number) => {
    setCurrentPage(pageNum);
    showToast(`Flipped to Page ${pageNum}! 📖`);
  };

  // Toggle checklist for selected date
  const toggleHabitCompletion = (habitId: string) => {
    const updated = habits.map((h) => {
      if (h.id === habitId) {
        const currentVal = !h.history[selectedDateStr];
        const newHistory = { ...h.history, [selectedDateStr]: currentVal };
        const { current, longest } = calculateStreaks(newHistory);
        
        if (currentVal && selectedDateStr === getFormattedDate(new Date())) {
          showToast(`Checked: ${h.name}! ✨`);
        }

        return {
          ...h,
          history: newHistory,
          currentStreak: current,
          longestStreak: longest,
        };
      }
      return h;
    });

    setHabits(updated);
    saveHabitsToLocal(updated);
  };

  // Erase/Delete habit completely
  const handleEraseHabit = (id: string, name: string) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    saveHabitsToLocal(updated);
    showToast(`Erased and cleared habit "${name}" from journal ledger.`);
  };

  // Spawn freshly custom-defined habits
  const handleAddCustomHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) {
      showToast("Please enter a direct title!");
      return;
    }

    const brandNew: Habit = {
      id: `custom-h-${Date.now()}`,
      name: newHabitName.trim(),
      description: newHabitDesc.trim() || "An essential self-discipline milestone.",
      category: newHabitCategory,
      habitType: newHabitType,
      icon: newHabitIcon,
      frequency: newHabitFrequency,
      currentStreak: 0,
      longestStreak: 0,
      history: {},
      createdAt: new Date().toISOString()
    };

    const updated = [...habits, brandNew];
    setHabits(updated);
    saveHabitsToLocal(updated);

    // Reset fields
    setNewHabitName("");
    setNewHabitDesc("");
    showToast(`Successfully embedded "${brandNew.name}"!`);
  };

  // Load a complete configured template layout
  const loadPresetTemplate = (preset: PresetTemplate) => {
    setSelectedPresetId(preset.id);
    setAppName(preset.title);
    setAppDescription(preset.description);

    const taskMatch = preset.conceptText.match(/takes (.*?) and does/);
    const processMatch = preset.conceptText.match(/does (.*?) to create/);
    const completedMatch = preset.conceptText.match(/to create (.*?) that helps me/);
    const goalMatch = preset.conceptText.match(/helps me (.*)$/);

    setConceptDailyTasks(taskMatch ? taskMatch[1] : "daily life logs");
    setConceptProcess(processMatch ? processMatch[1] : "interactive streaks tracking");
    setConceptCompletions(completedMatch ? completedMatch[1] : "custom calendar charts");
    setConceptGoal(goalMatch ? goalMatch[1] : "lead a structured physical baseline existence");

    const recentDatesList = getRecentDates(6);
    const initialized: Habit[] = preset.defaultHabits.map((h, i) => {
      const hist: Record<string, boolean> = {};
      recentDatesList.forEach((date, dateIdx) => {
        const dStr = getFormattedDate(date);
        // Generate pre-populated active logs for sample data visualization!
        hist[dStr] = (i + dateIdx) % 2 === 0;
      });

      const { current, longest } = calculateStreaks(hist);
      return {
        ...h,
        id: `${preset.id}-h-${i}-${Date.now()}`,
        currentStreak: current,
        longestStreak: longest,
        history: hist,
        createdAt: new Date().toISOString()
      } as Habit;
    });

    setHabits(initialized);
    saveHabitsToLocal(initialized);

    localStorage.setItem("habit_preset_id", preset.id);
    localStorage.setItem("app_name", preset.title);
    localStorage.setItem("app_description", preset.description);
    localStorage.setItem("concept_daily_tasks", taskMatch ? taskMatch[1] : "daily life logs");
    localStorage.setItem("concept_process", processMatch ? processMatch[1] : "interactive streaks tracking");
    localStorage.setItem("concept_completions", completedMatch ? completedMatch[1] : "custom calendar charts");
    localStorage.setItem("concept_goal", goalMatch ? goalMatch[1] : "lead a structured physical baseline existence");
  };

  // Run AI integration on backend proxy securely
  const requestAICoachSummary = async () => {
    setIsGeneratingCoach(true);
    setCoachFeedback("");

    try {
      // Prompt includes clear breakdown stats
      const resp = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habits: habits })
      });
      const data = await resp.json();
      if (data.coachFeedback) {
        setCoachFeedback(data.coachFeedback);
      } else {
        setCoachFeedback("### AI Coach responded abnormally. Let's try again in a bit!");
      }
    } catch (e) {
      console.error(e);
      setCoachFeedback("### AI Restroom Session... ☕\nCould not fetch response. Ensure your environment has server running and keys set!");
    } finally {
      setIsGeneratingCoach(false);
    }
  };

  // Reset progress data
  const handleWipeData = () => {
    if (confirm("Do you really wish to erase all streak completion logs? Your habits definition will be kept, but history will be reset to 0.")) {
      const reset = habits.map(h => ({
        ...h,
        currentStreak: 0,
        longestStreak: 0,
        history: {}
      }));
      setHabits(reset);
      saveHabitsToLocal(reset);
      showToast("Cleared history successfully!");
    }
  };

  // Divide habits into our two highly requested distinct groups:
  // Part 1: Life Daily Tasks (College, work, friends, events)
  const listDailyTasks = habits.filter(h => h.habitType === "daily_task");
  // Part 2: Non-Negotiable Health Baselines (Meditation, Gym, Sleep)
  const listNonNegotiables = habits.filter(h => h.habitType === "non_negotiable");

  // Calculating overall statistics for today
  const todayStr = getFormattedDate(new Date());
  const completedTodayCount = habits.filter(h => h.history[todayStr]).length;
  const totalCount = habits.length;
  const metricsTodayPercent = totalCount > 0 ? Math.round((completedTodayCount / totalCount) * 100) : 0;

  // Last 7 days consistency evaluation score
  const past7Days = getRecentDates(7);
  let checkedTotal = 0;
  let maxPossible = totalCount * 7;
  past7Days.forEach(date => {
    const dStr = getFormattedDate(date);
    habits.forEach(h => {
      if (h.history[dStr]) checkedTotal++;
    });
  });
  const overallAlmanacConsistency = maxPossible > 0 ? Math.round((checkedTotal / maxPossible) * 100) : 0;

  // Available days for selective retroactive viewing
  const availableSelectionDates = getRecentDates(7);

  return (
    <div className="min-h-screen bg-[#F9F6F0] font-sans text-[#3E3B39] flex flex-col items-center justify-start py-8 px-4 md:px-6 select-none leading-relaxed transition-all relative overflow-hidden">
      
      {/* Handcrafted Toast Notice */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#3E3B39] text-[#F9F6F0] text-xs font-semibold px-4 py-3 rounded-xl shadow-lg border border-[#D9A05B]/30 flex items-center gap-2 animate-fade-in-down">
          <Sparkles className="w-4 h-4 text-[#D9A05B]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Exquisite Top Classic Logo Header */}
      <header className="max-w-5xl w-full mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4 text-center md:text-left border-b border-[#D5CBB9] pb-4">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2.5 mb-1">
            <span className="font-serif italic text-sm tracking-wide text-[#8A9A86] font-medium">✨ Elegant Baseline Journal</span>
            <div className="h-1.5 w-1.5 rounded-full bg-[#C28C7E]" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#D9A05B]">Aesthetics Collection</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-[#3E3B39] capitalize">
            {appName}
          </h1>
          <p className="text-xs italic text-gray-500 font-medium max-w-xl mt-1">
            "{appDescription}"
          </p>
        </div>

        {/* Top Header Mini Stats */}
        <div className="flex justify-center md:justify-end gap-3.5 flex-wrap">
          <div className="bg-[#FAF8F5] border border-[#D5CBB9] rounded-xl px-4 py-2 text-center shadow-xs">
            <span className="block text-[9px] font-semibold text-gray-400 uppercase tracking-widest">TODAY'S SCORE</span>
            <span className="font-serif text-lg font-bold text-[#8A9A86]">{metricsTodayPercent}% Done</span>
            <span className="text-[10px] text-gray-400 block font-medium">({completedTodayCount}/{totalCount} checked)</span>
          </div>
          <div className="bg-[#FAF8F5] border border-[#D5CBB9] rounded-xl px-4 py-2 text-center shadow-xs">
            <span className="block text-[9px] font-semibold text-gray-400 uppercase tracking-widest">7D INDEX</span>
            <span className="font-serif text-lg font-bold text-[#C28C7E]">{overallAlmanacConsistency}% Consist</span>
            <span className="text-[10px] text-gray-400 block font-medium">Rank A-level</span>
          </div>
        </div>
      </header>

      {/* Core Book Layout Element: FIXED PAGE BOUNDS */}
      {/* We build a structured binder container representing "pages with a default size" e.g., max-w-5xl, fixed height bounds to resemble open pages */}
      <div className="max-w-5xl w-full bg-[#FAF8F5] border border-[#D5CBB9] rounded-2xl shadow-[0_12px_24px_-10px_rgba(62,59,57,0.15)] flex flex-col md:flex-row min-h-[660px] md:h-[660px] overflow-hidden relative border-double border-4">
        
        {/* Decorative central spinal rings of the binder book */}
        <div className="hidden md:flex absolute left-[35%] top-0 bottom-0 w-8 -ml-4 flex-col justify-around py-6 z-20 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-8 h-4 bg-gradient-to-r from-[#ECE2D0] via-[#D5CBB9] to-[#ECE2D0] rounded-full border border-[#C6BBA6] shadow-inner transform -rotate-6 scale-95" />
          ))}
        </div>

        {/* LEFT PAGE OVERLAY: Navigation and Quick Config Templates */}
        <div className="w-full md:w-[35%] bg-[#FDFCFB] p-6 border-r border-[#D5CBB9] flex flex-col justify-between border-dashed">
          <div>
            <div className="text-center pb-4 border-b border-[#FAF6EE] mb-4">
              <span className="font-serif italic text-xs block text-gray-400">Owner's Portfolio</span>
              <span className="text-[11px] uppercase tracking-widest font-extrabold text-[#3E3B39] opacity-75">TABLE OF CONTENTS</span>
            </div>

            {/* Aesthetic Index Tabs */}
            <nav className="flex flex-col gap-2 mb-6">
              {[
                { num: 1, name: "📖 The Daily Journal", desc: "Life Tasks & Core Wellness" },
                { num: 2, name: "📈 Streak Ledger", desc: "14-Day Calendar & Highlights" },
                { num: 3, name: "✍️ Habit Architect", desc: "Add / Erase Habit entries" },
                { num: 4, name: "📜 Coach's Sanctuary", desc: "Gemini Success Guidance" }
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => turnToPage(p.num)}
                  className={`w-full text-left p-3 rounded-lg text-xs leading-tight transition-all flex items-start gap-2 border ${
                    currentPage === p.num 
                      ? "bg-[#8A9A86]/10 text-[#3E3B39] border-[#8A9A86]/40 font-semibold" 
                      : "bg-transparent text-gray-400 border-transparent hover:bg-gray-50 hover:text-gray-600"
                  }`}
                >
                  <span className="font-serif font-black">{idx + 1}.</span>
                  <div>
                    <h5 className="font-serif font-extrabold">{p.name}</h5>
                    <p className="text-[10px] opacity-75">{p.desc}</p>
                  </div>
                </button>
              ))}
            </nav>

            <div className="border-t border-[#F1E8D9] pt-4">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 block mb-2">Built-in Portfolios:</span>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => loadPresetTemplate(tpl)}
                    className={`p-2 rounded-lg text-[10px] font-serif border text-[#3E3B39] transition-all text-center ${
                      selectedPresetId === tpl.id
                        ? "bg-[#D9A05B]/15 border-[#D9A05B] font-extrabold"
                        : "bg-[#FAF8F5] border-[#D5CBB9]/60 hover:bg-gray-50"
                    }`}
                  >
                    {tpl.title.split(' ')[0]} Theme
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Editorial quote shown in page bottom */}
          <div className="border-t border-[#F1E8D9] pt-4 text-center">
            <p className="text-[10px] italic font-serif text-gray-500 leading-normal mb-1">
              "{MOTIVATIONS[quoteIndex].quote}"
            </p>
            <span className="text-[9px] font-semibold text-[#C28C7E] tracking-wider uppercase">— {MOTIVATIONS[quoteIndex].author}</span>
            <button
               onClick={() => {
                 const step = (quoteIndex + 1) % MOTIVATIONS.length;
                 setQuoteIndex(step);
               }}
               className="block mx-auto mt-2 text-[9px] text-[#8A9A86] underline font-semibold"
            >
              Cycle Thought 🌱
            </button>
          </div>
        </div>

        {/* RIGHT MAIN PAGE CONTENT: SCROLLABLE MAIN REGION OF DEFAULT BUILD SIZE */}
        <div id="journal-dynamic-content-page" className="w-full md:w-[65%] bg-white p-6 flex flex-col h-full overflow-y-auto">
          
          {/* Real App Concept Formula Header Banner Requirement */}
          <div className="bg-[#FAF8F5] border border-[#E9E4DB] rounded-xl p-4 text-xs italic text-gray-600 mb-4 font-serif leading-relaxed relative">
            <span className="absolute right-2 top-1 text-[8px] tracking-wider uppercase font-bold text-[#D9A05B]/80 font-sans">Formula View</span>
            <div className="font-semibold text-[10px] tracking-widest uppercase font-sans text-gray-400 mb-1">APP FORMULA CONCEPT:</div>
            "My app takes <span className="text-[#8A9A86] border-b border-dashed border-[#8A9A86] font-semibold">{conceptDailyTasks}</span> and does <span className="text-[#D9A05B] border-b border-dashed border-[#D9A05B] font-semibold">{conceptProcess}</span> to create <span className="text-[#C28C7E] border-b border-dashed border-[#C28C7E] font-semibold">{conceptCompletions}</span> that helps me <span className="text-gray-700 border-b border-dashed border-gray-700 font-semibold">{conceptGoal}</span>."
          </div>

          {/* PAGE 1: Daily checklist split into requested Categories */}
          {currentPage === 1 && (
            <div className="flex-1 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-[#FAF6EE] pb-2">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#3E3B39]">1. The Daily Journal</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Checks categorized & logged for: {selectedDateStr === todayStr ? "Today (Present)" : selectedDateStr}</p>
                  </div>

                  {/* Retroactive Date Bar */}
                  <div className="flex items-center gap-1 self-start sm:self-auto bg-[#F9F6F0] p-1 rounded-lg border border-[#D5CBB9]/60">
                    {availableSelectionDates.map((date) => {
                      const dStr = getFormattedDate(date);
                      const isSelected = selectedDateStr === dStr;
                      const isToday = getFormattedDate(new Date()) === dStr;

                      return (
                        <button
                          key={dStr}
                          onClick={() => setSelectedDateStr(dStr)}
                          className={`px-2 py-1 rounded text-center min-w-[34px] transition-all flex flex-col items-center ${
                            isSelected 
                              ? "bg-[#D9A05B] text-white font-extrabold" 
                              : "hover:bg-[#E9E4DB]/40 text-gray-500"
                          }`}
                        >
                          <span className="text-[8px] uppercase tracking-normal font-sans opacity-70">
                            {date.toLocaleDateString("en-US", { weekday: "short" })}
                          </span>
                          <span className="text-xs font-bold font-serif">{date.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Split Categories section */}
                <div className="space-y-5">
                  
                  {/* Part 1: Daily Life Tasks */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div className="h-2 w-2 rounded-full bg-[#8A9A86]" />
                      <h4 className="font-serif text-sm font-extrabold text-[#3E3B39] tracking-tight">
                        Part 1: Daily Life Tasks & campus Events
                      </h4>
                      <span className="text-[10px] text-gray-400 font-medium">({listDailyTasks.filter(t => t.history[selectedDateStr]).length}/{listDailyTasks.length} Checked)</span>
                    </div>

                    <div className="space-y-2.5">
                      {listDailyTasks.length === 0 ? (
                        <p className="text-xs italic text-gray-400 pl-4 py-2 border-l border-dashed border-[#D5CBB9]">No daily tasks defined yet. Add some on Page 3! (e.g., Going to College, Lectures, meeting friends)</p>
                      ) : (
                        listDailyTasks.map(habit => (
                          <div 
                            key={habit.id}
                            className="bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] border border-[#EBE5DA] p-3 rounded-xl flex items-center justify-between transition-all duration-150"
                          >
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => toggleHabitCompletion(habit.id)}
                                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                                  habit.history[selectedDateStr]
                                    ? "bg-[#8A9A86] border-[#8A9A86] text-white"
                                    : "bg-white border-[#C6BBA6] hover:border-[#8A9A86]"
                                }`}
                              >
                                {habit.history[selectedDateStr] && <Check className="w-4 h-4 text-white stroke-[3px]" />}
                              </button>
                              <div>
                                <h5 className={`text-xs font-bold font-serif ${habit.history[selectedDateStr] ? "line-through text-gray-400" : "text-[#3E3B39]"}`}>{habit.name}</h5>
                                <p className="text-[9px] text-gray-400 mt-0.5">{habit.description}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-right">
                              <span className="text-[10px] font-bold text-[#D9A05B] bg-[#D9A05B]/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                                {habit.currentStreak}d streak
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Part 2: Non-Negotiables for Mental/Physical Well-being */}
                  <div className="pt-2">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div className="h-2 w-2 rounded-full bg-[#C28C7E]" />
                      <h4 className="font-serif text-sm font-extrabold text-[#3E3B39] tracking-tight">
                        Part 2: Non-Negotiable Core Health Habits
                      </h4>
                      <span className="text-[10px] text-gray-400 font-medium">({listNonNegotiables.filter(t => t.history[selectedDateStr]).length}/{listNonNegotiables.length} Checked)</span>
                    </div>

                    <div className="space-y-2.5">
                      {listNonNegotiables.length === 0 ? (
                        <p className="text-xs italic text-gray-400 pl-4 py-2 border-l border-dashed border-[#D5CBB9]">No non-negotiable mental/physical habits found. Add some on Page 3! (e.g. Meditation, Intense Gym, Reading, Sleep boundaries)</p>
                      ) : (
                        listNonNegotiables.map(habit => (
                          <div 
                            key={habit.id}
                            className="bg-[#FDFCFB]/80 hover:bg-[#FDFCFB] border border-[#EBE5DA] p-3 rounded-xl flex items-center justify-between transition-all duration-150"
                          >
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => toggleHabitCompletion(habit.id)}
                                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                                  habit.history[selectedDateStr]
                                    ? "bg-[#C28C7E] border-[#C28C7E] text-white"
                                    : "bg-white border-[#C6BBA6] hover:border-[#C28C7E]"
                                }`}
                              >
                                {habit.history[selectedDateStr] && <Check className="w-4 h-4 text-white stroke-[3px]" />}
                              </button>
                              <div>
                                <h5 className={`text-xs font-bold font-serif ${habit.history[selectedDateStr] ? "line-through text-gray-400" : "text-[#3E3B39]"}`}>{habit.name}</h5>
                                <p className="text-[9px] text-gray-400 mt-0.5">{habit.description}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-right">
                              <span className="text-[10px] font-bold text-[#C28C7E] bg-[#C28C7E]/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <Flame className="w-3 h-3 text-red-500 fill-red-500" />
                                {habit.currentStreak}d streak
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Page Footer Helper */}
              <div className="border-t border-[#F1E8D9] pt-4 mt-6 flex justify-between items-center">
                <span className="text-[9px] text-gray-400 uppercase font-sans tracking-wide">Journal Page 1 of 4</span>
                <button 
                  onClick={() => turnToPage(2)} 
                  className="text-xs font-semibold text-[#8A9A86] hover:underline flex items-center gap-1"
                >
                  Turn to Streaks Ledger ➜
                </button>
              </div>
            </div>
          )}

          {/* PAGE 2: Streaks & Visual graphs representation */}
          {currentPage === 2 && (
            <div className="flex-1 flex flex-col justify-between h-full">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#3E3B39]">2. Streaks & Visual History</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Track historical matrix sequences & consistency rates.</p>
                </div>

                {/* 14-Day Calendar Heatmap Grid Representation */}
                <div className="bg-[#FDFCFB] border border-[#E9E4DB] rounded-xl p-4">
                  <h5 className="font-serif text-xs font-extrabold text-[#3E3B39] mb-3 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#D9A05B]" />
                    14-Day Streak Ledger Matrix
                  </h5>

                  <div className="grid grid-cols-7 gap-2">
                    {getRecentDates(14).map((date) => {
                      const dStr = getFormattedDate(date);
                      const completedCount = habits.filter(h => h.history[dStr]).length;
                      
                      let cellColor = "bg-[#FAF8F5] text-gray-400 border-[#E5DEC9]";
                      if (totalCount > 0 && completedCount === totalCount) {
                        cellColor = "bg-[#8A9A86] text-white border-[#8A9A86] font-bold";
                      } else if (completedCount > 0) {
                        cellColor = "bg-[#D9A05B]/35 text-[#3E3B39] border-[#D9A05B]/50 font-semibold";
                      }

                      return (
                        <div
                          key={dStr}
                          className={`aspect-square rounded-lg border text-center flex flex-col justify-center items-center p-1 relative text-[10px] ${cellColor}`}
                          title={`${dStr}: ${completedCount}/${totalCount} tasks completed`}
                        >
                          <span className="text-[8px] uppercase tracking-tighter opacity-70 block">
                            {date.toLocaleDateString("en-US", { weekday: "short" }).substring(0, 1)}
                          </span>
                          <span className="text-xs font-serif leading-none font-bold block mt-0.5">{date.getDate()}</span>
                          <span className="text-[7px] absolute bottom-1 block opacity-80">{completedCount}✔️</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-gray-400 font-semibold border-t border-[#F1E8D9] pt-2.5 mt-3">
                    <span className="flex items-center gap-1">🟢 Filled: Perfect All Done</span>
                    <span className="flex items-center gap-1">🟡 Muted: Partial completions</span>
                    <span className="flex items-center gap-1">⚪ Pale: 0 logs recorded</span>
                  </div>
                </div>

                {/* Single Habit Streak Rankings list */}
                <div>
                  <h5 className="font-serif text-xs font-extrabold text-[#3E3B39] mb-3">Individual Goal Accomplishment Records</h5>
                  
                  <div className="space-y-2.5">
                    {habits.map((h, i) => (
                      <div key={h.id} className="border-b border-dashed border-[#EBE5DA] pb-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-300 font-serif italic text-[11px]">#{i+1}</span>
                          <span className="font-serif font-bold text-[#3E3B39]">{h.name}</span>
                          <span className={`text-[8px] px-1.5 py-0.2 rounded ${h.habitType === "daily_task" ? "bg-[#8A9A86]/10 text-[#8A9A86]" : "bg-[#C28C7E]/10 text-[#C28C7E]"}`}>
                            {h.habitType === "daily_task" ? "Daily life task" : "Non-negotiable"}
                          </span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-gray-500 text-[10px]">
                            Current: <strong className="text-[#3E3B39] font-serif">{h.currentStreak}d</strong>
                          </span>
                          <span className="text-gray-500 text-[10px]">
                            Longest: <strong className="text-[#3E3B39] font-serif">{h.longestStreak}d</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Page Footer Helper */}
              <div className="border-t border-[#F1E8D9] pt-4 mt-6 flex justify-between items-center">
                <span className="text-[9px] text-gray-400 uppercase font-sans tracking-wide">Journal Page 2 of 4</span>
                <div className="flex gap-4">
                  <button 
                    onClick={() => turnToPage(1)} 
                    className="text-xs font-semibold text-gray-400 hover:underline"
                  >
                    ◀ Page 1
                  </button>
                  <button 
                    onClick={() => turnToPage(3)} 
                    className="text-xs font-semibold text-[#8A9A86] hover:underline flex items-center gap-1"
                  >
                    Flipped to Builder ➜
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 3: HABIT ARTISAN - Addition and ERASING center */}
          {currentPage === 3 && (
            <div className="flex-1 flex flex-col justify-between h-full">
              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#3E3B39]">3. Habit Architect</h3>
                  <p className="text-[10px] text-gray-400 tracking-wider uppercase font-semibold">Integrate fresh lifestyle tasks or cleanly erase old ones.</p>
                </div>

                {/* Sub-form for Adding Habit entries */}
                <form onSubmit={handleAddCustomHabit} className="bg-[#FAF8F5]/85 border border-[#E9E4DB] rounded-xl p-4 space-y-4">
                  <div className="text-[11px] font-extrabold uppercase text-[#D9A05B] tracking-wider border-b border-[#F1E8D9] pb-1 flex items-center gap-1">
                    <PlusCircle className="w-4 h-4" /> Customise your life's paths & habits
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#3E3B39] uppercase tracking-widest mb-1">1. TITLE OF THIS LIFEPATH INCIDENT</label>
                    <input
                      type="text"
                      placeholder="e.g. Attending morning lectures, 30m weightlifting, quiet journaling"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      className="w-full bg-white border border-[#C6BBA6] px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none placeholder-gray-350 shadow-xs focus:border-[#8A9A86]"
                    />
                  </div>

                  {/* Tactile Two Columns Path Choice */}
                  <div>
                    <span className="block text-[10px] font-bold text-[#3E3B39] uppercase tracking-widest mb-2">2. CHOOSE CORRESPONDING DAILY DAILY PART CLASSIFICATION</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNewHabitType("daily_task")}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          newHabitType === "daily_task"
                            ? "bg-[#8A9A86]/10 border-[#8A9A86] text-[#3E3B39] ring-2 ring-[#8A9A86]/20"
                            : "bg-white border-[#E9E4DB] text-gray-500 hover:border-[#D5CBB9]"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className={`w-4 h-4 ${newHabitType === "daily_task" ? "text-[#8A9A86]" : "text-gray-300"}`} />
                          <span className="text-xs font-serif font-black tracking-tight text-[#3E3B39]">Part 1: Daily Life Tasks</span>
                        </div>
                        <p className="text-[10px] opacity-90 leading-relaxed font-sans text-gray-500">
                          For scheduled sessions, classes, lectures, meeting college friends, group execution, and campus events.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewHabitType("non_negotiable")}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          newHabitType === "non_negotiable"
                            ? "bg-[#C28C7E]/10 border-[#C28C7E] text-[#3E3B39] ring-2 ring-[#C28C7E]/20"
                            : "bg-white border-[#E9E4DB] text-gray-500 hover:border-[#D5CBB9]"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Heart className={`w-4 h-4 ${newHabitType === "non_negotiable" ? "text-[#C28C7E]" : "text-gray-300"}`} />
                          <span className="text-xs font-serif font-black tracking-tight text-[#3E3B39]">Part 2: Non-Negotiable</span>
                        </div>
                        <p className="text-[10px] opacity-90 leading-relaxed font-sans text-gray-500">
                          Core mental/physical baseline health rituals: gym workouts, mindfulness breathing, or sleep bounds.
                        </p>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">THEME CATEGORY</label>
                      <select
                        value={newHabitCategory}
                        onChange={(e) => setNewHabitCategory(e.target.value as any)}
                        className="w-full bg-white border border-[#C6BBA6] px-2 py-1.5 rounded-lg text-xs font-semibold focus:outline-none"
                      >
                        <option value="fitness">🏃 Fitness & Cardio</option>
                        <option value="mindfulness">🧘 Mindfulness & Breath</option>
                        <option value="work">💻 Deep execution</option>
                        <option value="creativity">🎨 Creative playground</option>
                        <option value="wellness">🥗 General baseline health</option>
                        <option value="custom">⚙️ Tailored custom task</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">SYMBOL ICON</label>
                      <select
                        value={newHabitIcon}
                        onChange={(e) => setNewHabitIcon(e.target.value)}
                        className="w-full bg-white border border-[#C6BBA6] px-2 py-1.5 rounded-lg text-xs font-semibold focus:outline-none"
                      >
                        <option value="Activity">⚡ Pulse Activity</option>
                        <option value="Heart">❤️ Mindful Heart</option>
                        <option value="Sun">☀️ Light/Morning</option>
                        <option value="Moon">🌙 Sleep Bedtime</option>
                        <option value="GlassWater">💧 Fluid glass</option>
                        <option value="BookOpen">📖 Classical Reader</option>
                        <option value="Terminal">💻 Terminal technical</option>
                        <option value="Brush">🎨 Artsy brush</option>
                        <option value="PenTool">✒️ Inked pen</option>
                        <option value="Compass">🧭 Navigation compass</option>
                        <option value="Sprout">🌱 Seedling sprout</option>
                        <option value="Footprints">👣 Steps tracker</option>
                        <option value="Coffee">☕ Caffeine/Break</option>
                        <option value="Book">📚 Study/Lectures</option>
                        <option value="Scissors">✂️ Creative tool</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#3E3B39] uppercase tracking-widest mb-1">3. BRIEF MOTIVATIONAL SLOGAN</label>
                    <input
                      type="text"
                      placeholder="e.g. Clears the analytical gears, keeps mind structured."
                      value={newHabitDesc}
                      onChange={(e) => setNewHabitDesc(e.target.value)}
                      className="w-full bg-white border border-[#C6BBA6] px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none placeholder-gray-350 shadow-xs focus:border-[#8A9A86]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#8A9A86] hover:bg-[#8A9A86]/90 text-white font-serif tracking-wide py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer mt-1"
                  >
                    <Plus className="w-4 h-4" /> Embed Customized Lifestyle Goal
                  </button>
                </form>

                {/* Habit Inventory List with ERASING capabilities explicitly needed */}
                <div className="bg-[#FAF8F5]/50 border border-[#E9E4DB] rounded-xl p-4">
                  <div className="text-[11px] font-extrabold uppercase text-[#C28C7E] tracking-wider mb-2.5 border-b border-[#F1E8D9] pb-1 flex items-center justify-between">
                    <span>📋 Inventory Ledger (Erase any existing habit)</span>
                    <button 
                      type="button" 
                      onClick={handleWipeData}
                      className="text-[9px] text-[#C28C7E] underline"
                    >
                      Clear Progress Logs ↺
                    </button>
                  </div>

                  <div className="max-h-[170px] overflow-y-auto space-y-2">
                    {habits.length === 0 ? (
                      <p className="text-xs text-gray-400 italic text-center py-4">Inventory Empty.</p>
                    ) : (
                      habits.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-[#D5CBB9]/40 text-xs">
                          <div className="flex items-center gap-2">
                            <HabitIcon name={item.icon} className="w-4 h-4 text-gray-400" />
                            <div>
                              <strong className="font-serif block leading-none">{item.name}</strong>
                              <span className="text-[8px] text-gray-400 uppercase tracking-tight">{item.habitType === "daily_task" ? "Part 1 Daily Task" : "Part 2 non-negotiable"}</span>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleEraseHabit(item.id, item.name)}
                            className="text-red-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-all flex items-center gap-0.5"
                            title="Erase habit completely"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Dynamic Formula Conceptual Editor */}
                <div>
                  <h4 className="font-serif text-xs font-bold text-[#3E3B39] mb-2">Edit Slogan Concept Variables</h4>
                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">App takes {"{{inputs}}"}</span>
                      <input 
                        type="text" 
                        value={conceptDailyTasks} 
                        onChange={(e) => {
                          setConceptDailyTasks(e.target.value);
                          localStorage.setItem("concept_daily_tasks", e.target.value);
                        }} 
                        className="w-full bg-white border border-[#D5CBB9] p-1.5 rounded-lg font-medium text-xs leading-none"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-gray-400 block mb-0.5">does {"{{metrics}}"}</span>
                      <input 
                        type="text" 
                        value={conceptProcess} 
                        onChange={(e) => {
                          setConceptProcess(e.target.value);
                          localStorage.setItem("concept_process", e.target.value);
                        }} 
                        className="w-full bg-white border border-[#D5CBB9] p-1.5 rounded-lg font-medium text-xs leading-none"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Page Footer Helper */}
              <div className="border-t border-[#F1E8D9] pt-4 mt-6 flex justify-between items-center">
                <span className="text-[9px] text-gray-400 uppercase font-sans tracking-wide">Journal Page 3 of 4</span>
                <div className="flex gap-4">
                  <button 
                    onClick={() => turnToPage(2)} 
                    className="text-xs font-semibold text-gray-400 hover:underline"
                  >
                    ◀ Page 2
                  </button>
                  <button 
                    onClick={() => turnToPage(4)} 
                    className="text-xs font-semibold text-[#8A9A86] hover:underline flex items-center gap-1"
                  >
                    Flipped to Coach ➜
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 4: SCIENTIFIC AI GUIDANCE (Gemini powered feedback) */}
          {currentPage === 4 && (
            <div className="flex-1 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#3E3B39]">4. Solitary Coach Sanctuary</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Bespeak Success guidance tailored by Gemini intelligence.</p>
                  </div>
                  
                  <button
                    onClick={requestAICoachSummary}
                    disabled={isGeneratingCoach}
                    className="bg-[#3E3B39] hover:bg-[#3E3B39]/90 text-white font-serif px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-[#D9A05B]" />
                    {isGeneratingCoach ? "Summoning..." : "Summon Insights"}
                  </button>
                </div>

                <div className="bg-[#FAF8F5] border border-[#E9E4DB] rounded-xl p-5 min-h-[300px] max-h-[330px] overflow-y-auto leading-relaxed text-xs">
                  {isGeneratingCoach ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="w-6 h-6 border-2 border-[#D9A05B] border-t-transparent rounded-full animate-spin" />
                      <p className="font-serif italic text-gray-400 text-center animate-pulse">The coach is examining your ledger files...</p>
                    </div>
                  ) : (
                    <div className="space-y-4 font-sans text-gray-700 leading-relaxed font-normal">
                      {/* Render customized formatted texts */}
                      <div 
                        className="prose prose-sm font-sans"
                        dangerouslySetInnerHTML={{
                          __html: coachFeedback
                            .replace(/\#\#\# (.*?)\n/g, '<h4 class="font-serif font-bold text-sm text-[#3E3B39] border-b border-[#FAF6EE] pb-1 mt-3 mb-1 uppercase tracking-wide">$1</h4>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#D9A05B]">$1</strong>')
                            .replace(/\n\n/g, '<br/><br/>')
                            .replace(/\*/g, '')
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="bg-[#8A9A86]/5 rounded-xl p-3 border border-[#8A9A86]/10 text-[10px] italic text-[#3E3B39]/80 flex gap-2">
                  <div className="text-[#8A9A86] font-bold">💡 Tip:</div>
                  <p>Our AI Coach is fully linked with standard checklist streaks, prioritizing your "Non-Negotiables" dynamically over casual daily events.</p>
                </div>
              </div>

              {/* Page Footer Helper */}
              <div className="border-t border-[#F1E8D9] pt-4 mt-6 flex justify-between items-center">
                <span className="text-[9px] text-gray-400 uppercase font-sans tracking-wide">Journal Page 4 of 4</span>
                <button 
                  onClick={() => turnToPage(1)} 
                  className="text-xs font-semibold text-[#8A9A86] hover:underline"
                >
                  ◀ Back to Page 1
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Styled Book Spine Binding footer with Page turns controllers */}
      <footer className="max-w-5xl w-full mt-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-[#D5CBB9] pt-4 text-xs font-semibold text-gray-400">
        <div className="flex gap-4 font-serif">
          <span>📍 Volume Index: <strong>No. 2026-B</strong></span>
          <span>📁 Memory: Local Storage (Active)</span>
        </div>

        <div className="flex items-center gap-3 bg-[#FAF8F5] border border-[#D5CBB9]/80 px-4 py-1.5 rounded-full shadow-xs">
          <button
            onClick={() => {
              if (currentPage > 1) turnToPage(currentPage - 1);
            }}
            disabled={currentPage === 1}
            className="text-gray-500 hover:text-[#3E3B39] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center"
          >
            <ChevronLeft className="w-4 h-4" /> Prev Page
          </button>
          
          <span className="text-xs font-serif italic text-gray-500">
            Page {currentPage} / 4
          </span>

          <button
            onClick={() => {
              if (currentPage < 4) turnToPage(currentPage + 1);
            }}
            disabled={currentPage === 4}
            className="text-gray-500 hover:text-[#3E3B39] disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center"
          >
            Next Page <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs font-serif text-[#C28C7E] italic">
          "The baseline is the compass."
        </div>
      </footer>
    </div>
  );
}
