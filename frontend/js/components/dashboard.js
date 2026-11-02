/**
 * GuruG Student Dashboard Component
 * Elite EdTech Interface: Conversational AI Omnibar, Color-Coded Quick Actions,
 * Dynamic Glanceable Metrics, Circular Radial Subject Meters, and High-Yield Curations.
 */

async function renderDashboard() {
  const user = api.user || {};
  let progressData = {
    stats: {
      questions_asked: 14,
      quizzes_completed: 6,
      average_quiz_score: 85.0,
      concepts_mastered: 12,
      active_streak_days: 4
    },
    subjects_progress: [
      { subject: "Mathematics", concepts_mastered: 4, quizzes_taken: 3, average_score: 85.0 },
      { subject: "Physics", concepts_mastered: 3, quizzes_taken: 2, average_score: 90.0 },
      { subject: "Chemistry", concepts_mastered: 2, quizzes_taken: 2, average_score: 75.0 },
      { subject: "Computer Science", concepts_mastered: 5, quizzes_taken: 4, average_score: 95.0 }
    ],
    recent_activities: []
  };

  try {
    const fetched = await api.getProgress();
    if (fetched && fetched.stats) {
      progressData = fetched;
    }
  } catch (err) {
    console.warn("Using cached progress data for dashboard:", err);
  }

  const stats = progressData.stats;
  const gradeLevel = user.grade_level || 'Class 9–10';
  const language = user.preferred_language || 'Hinglish';
  const streak = stats.active_streak_days || 4;

  return `
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9 fade-in">
    
    <!-- ===================================================================== -->
    <!-- 1. HERO / CONVERSATIONAL AI WELCOME BANNER                           -->
    <!-- ===================================================================== -->
    <div class="relative glass-panel-elevated rounded-3xl p-6 sm:p-9 border border-white/15 overflow-hidden glow-purple shadow-2xl bg-gradient-to-br from-[#0F1422] via-[#0B0F17] to-[#07090E]">
      <!-- Background Ambient Glow Blobs -->
      <div class="absolute -top-24 -left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-20 -right-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 space-y-6">
        
        <!-- Top Row: Student Context & Streak Badges -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-semibold text-purple-300">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ${gradeLevel}
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
              <i data-lucide="languages" class="w-3.5 h-3.5"></i>
              ${language}
            </span>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-gray-400 hidden md:inline-flex">
              <i data-lucide="cpu" class="w-3 h-3 text-purple-400"></i>
              Groq LPU Active
            </span>
          </div>

          <!-- Streak & Level Badge -->
          <div class="flex items-center gap-2.5 self-end sm:self-auto">
            <div class="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 shadow-inner">
              <span class="text-xl">🔥</span>
              <div>
                <div class="text-xs font-extrabold text-white">${streak} Day Streak</div>
                <div class="text-[10px] text-amber-400 font-medium">Top 5% Learner</div>
              </div>
            </div>

            <div class="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-purple-500/15 border border-purple-500/30">
              <span class="text-base">🎓</span>
              <div>
                <div class="text-xs font-bold text-purple-200">Level 4</div>
                <div class="text-[10px] text-purple-400 font-medium">Concept Scholar</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Headline & Conversational Hook -->
        <div class="max-w-3xl">
          <h1 class="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Hey, <span class="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">${user.display_name || 'Aarav'}!</span> 👋
          </h1>
          <p class="text-sm sm:text-base text-gray-300 mt-2 leading-relaxed">
            What concept or problem would you like to master today? Ask anything in your native language or choose a challenge below.
          </p>
        </div>

        <!-- Integrated AI Doubt Omnibar -->
        <div class="pt-2">
          <div class="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-black/60 border border-white/15 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/25 transition-all gap-2">
            <div class="flex items-center flex-1 px-3 py-1 gap-2.5">
              <i data-lucide="sparkles" class="w-5 h-5 text-purple-400 shrink-0 animate-pulse"></i>
              <input 
                type="text" 
                id="dashboard-doubt-input" 
                class="w-full bg-transparent text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none" 
                placeholder="Ask GuruG anything... (e.g., Explain Newton's 2nd Law, solve x²-5x+6=0, or test me in Chemistry)" 
                onkeydown="if(event.key === 'Enter') submitDashboardDoubt();"
              />
            </div>
            
            <button 
              onclick="submitDashboardDoubt();" 
              class="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 shrink-0 group active:scale-95"
            >
              <span>Ask GuruG</span>
              <i data-lucide="arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1"></i>
            </button>
          </div>

          <!-- Quick Suggestion Topic Pills -->
          <div class="flex flex-wrap items-center gap-2 mt-3 pt-1 text-xs">
            <span class="text-[11px] font-medium text-gray-400 flex items-center gap-1">
              <i data-lucide="zap" class="w-3 h-3 text-amber-400"></i>
              Try asking:
            </span>
            <button onclick="submitDashboardDoubt('How does Photosynthesis convert sunlight into energy?')" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors text-[11px]">
              🌿 Photosynthesis
            </button>
            <button onclick="submitDashboardDoubt('Can you explain Quadratic Equation roots and parabola?')" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors text-[11px]">
              📐 Quadratic Parabola
            </button>
            <button onclick="submitDashboardDoubt('Newton second law of motion with cricket ball example')" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors text-[11px]">
              ⚡ Newton's F=ma
            </button>
            <button onclick="submitDashboardDoubt('Explain DNA Double Helix Structure and Base Pairs')" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors text-[11px]">
              🧬 DNA Double Helix
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ===================================================================== -->
    <!-- 2. QUICK ACTIONS GRID (DISTINCT COLOR-CODED AMBIENT TILES)           -->
    <!-- ===================================================================== -->
    <div class="space-y-3.5">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <i data-lucide="layout-grid" class="w-3.5 h-3.5 text-purple-400"></i>
          <span>Learning Launchpad</span>
        </h2>
        <span class="text-[11px] text-gray-400">6 Specialized AI Modules</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        <!-- Tile 1: Ask GuruG (Purple/Violet) -->
        <a href="#/tutor" class="relative group glass-panel p-4 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-950/20 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10">
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/30 transition-all shadow-md shadow-purple-500/20">
                <i data-lucide="sparkles" class="w-5 h-5"></i>
              </div>
              <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">Tutor</span>
            </div>
            <div class="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition-colors">Ask GuruG</div>
            <div class="text-[11px] text-gray-400 mt-1 leading-tight">Live multilingual AI tutor chat</div>
          </div>
          <div class="mt-3 flex items-center text-[10px] font-semibold text-purple-400 group-hover:text-purple-300">
            <span>Start chat</span>
            <i data-lucide="chevron-right" class="w-3 h-3 ml-0.5 transition-transform group-hover:translate-x-1"></i>
          </div>
        </a>

        <!-- Tile 2: Debate Arena (Cyan/Sky) -->
        <a href="#/debate" class="relative group glass-panel p-4 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10">
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-500/30 transition-all shadow-md shadow-cyan-500/20">
                <i data-lucide="swords" class="w-5 h-5"></i>
              </div>
              <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">Voice AI</span>
            </div>
            <div class="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">Debate Arena</div>
            <div class="text-[11px] text-gray-400 mt-1 leading-tight">Spoken rebuttal & logic scoring</div>
          </div>
          <div class="mt-3 flex items-center text-[10px] font-semibold text-cyan-400 group-hover:text-cyan-300">
            <span>Enter arena</span>
            <i data-lucide="chevron-right" class="w-3 h-3 ml-0.5 transition-transform group-hover:translate-x-1"></i>
          </div>
        </a>

        <!-- Tile 3: Explain Concept (Warm Amber) -->
        <button onclick="openQuickExplainModal()" class="relative group glass-panel p-4 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-950/20 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 text-left">
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/30 transition-all shadow-md shadow-amber-500/20">
                <i data-lucide="lightbulb" class="w-5 h-5"></i>
              </div>
              <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">Instant</span>
            </div>
            <div class="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">Explain Concept</div>
            <div class="text-[11px] text-gray-400 mt-1 leading-tight">Rapid clarity with analogies</div>
          </div>
          <div class="mt-3 flex items-center text-[10px] font-semibold text-amber-400 group-hover:text-amber-300">
            <span>Quick explain</span>
            <i data-lucide="chevron-right" class="w-3 h-3 ml-0.5 transition-transform group-hover:translate-x-1"></i>
          </div>
        </button>

        <!-- Tile 4: Solve Problem (Emerald/Teal) -->
        <a href="#/solver" class="relative group glass-panel p-4 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/10">
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/30 transition-all shadow-md shadow-emerald-500/20">
                <i data-lucide="calculator" class="w-5 h-5"></i>
              </div>
              <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">5-Step</span>
            </div>
            <div class="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">Solve Problem</div>
            <div class="text-[11px] text-gray-400 mt-1 leading-tight">Concept roadmap & derivations</div>
          </div>
          <div class="mt-3 flex items-center text-[10px] font-semibold text-emerald-400 group-hover:text-emerald-300">
            <span>Start solver</span>
            <i data-lucide="chevron-right" class="w-3 h-3 ml-0.5 transition-transform group-hover:translate-x-1"></i>
          </div>
        </a>

        <!-- Tile 5: Generate Quiz (Rose/Pink) -->
        <a href="#/quiz" class="relative group glass-panel p-4 rounded-2xl border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-950/20 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-500/10">
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-rose-500/30 transition-all shadow-md shadow-rose-500/20">
                <i data-lucide="check-square" class="w-5 h-5"></i>
              </div>
              <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">Adaptive</span>
            </div>
            <div class="text-xs sm:text-sm font-bold text-white group-hover:text-rose-300 transition-colors">Generate Quiz</div>
            <div class="text-[11px] text-gray-400 mt-1 leading-tight">Instant MCQ test with rationales</div>
          </div>
          <div class="mt-3 flex items-center text-[10px] font-semibold text-rose-400 group-hover:text-rose-300">
            <span>Take test</span>
            <i data-lucide="chevron-right" class="w-3 h-3 ml-0.5 transition-transform group-hover:translate-x-1"></i>
          </div>
        </a>

        <!-- Tile 6: All Subjects (Indigo/Blue) -->
        <a href="#/subjects" class="relative group glass-panel p-4 rounded-2xl border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-950/20 transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10">
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/30 transition-all shadow-md shadow-blue-500/20">
                <i data-lucide="book-open" class="w-5 h-5"></i>
              </div>
              <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">8 Subjects</span>
            </div>
            <div class="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition-colors">All Subjects</div>
            <div class="text-[11px] text-gray-400 mt-1 leading-tight">Full curricula, formulas & trees</div>
          </div>
          <div class="mt-3 flex items-center text-[10px] font-semibold text-blue-400 group-hover:text-blue-300">
            <span>View syllabi</span>
            <i data-lucide="chevron-right" class="w-3 h-3 ml-0.5 transition-transform group-hover:translate-x-1"></i>
          </div>
        </a>

      </div>
    </div>

    <!-- ===================================================================== -->
    <!-- 3. GLANCEABLE METRICS & PERFORMANCE GRID                              -->
    <!-- ===================================================================== -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Metric 1: Questions Asked -->
      <div class="relative glass-panel p-5 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all group overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-gray-300">Questions Asked</span>
          <div class="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
            <i data-lucide="message-circle-question" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-black text-white tracking-tight">${stats.questions_asked}</span>
          <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            ↑ +3 today
          </span>
        </div>
        <!-- Progress track to daily goal of 20 -->
        <div class="mt-3">
          <div class="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Daily Goal (14/20)</span>
            <span class="font-bold text-purple-300">70%</span>
          </div>
          <div class="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" style="width: 70%"></div>
          </div>
        </div>
      </div>

      <!-- Metric 2: Quizzes Completed -->
      <div class="relative glass-panel p-5 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-all group overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-gray-300">Quizzes Completed</span>
          <div class="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
            <i data-lucide="award" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-black text-white tracking-tight">${stats.quizzes_completed}</span>
          <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            Avg ${stats.average_quiz_score}%
          </span>
        </div>
        <!-- Progress track for quiz accuracy -->
        <div class="mt-3">
          <div class="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Accuracy Benchmark</span>
            <span class="font-bold text-cyan-300">${stats.average_quiz_score}%</span>
          </div>
          <div class="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style="width: ${stats.average_quiz_score}%"></div>
          </div>
        </div>
      </div>

      <!-- Metric 3: Concepts Mastered -->
      <div class="relative glass-panel p-5 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all group overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-gray-300">Concepts Mastered</span>
          <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
            <i data-lucide="check-circle-2" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-black text-white tracking-tight">${stats.concepts_mastered}</span>
          <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
            4 Subjects
          </span>
        </div>
        <!-- Level Progress -->
        <div class="mt-3">
          <div class="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Level 5 Target (12/15)</span>
            <span class="font-bold text-emerald-300">80%</span>
          </div>
          <div class="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style="width: 80%"></div>
          </div>
        </div>
      </div>

      <!-- Metric 4: Learning Language & Mode -->
      <div class="relative glass-panel p-5 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all group overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold text-gray-300">Tutor Language</span>
          <div class="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
            <i data-lucide="languages" class="w-4 h-4"></i>
          </div>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black text-white tracking-tight truncate">${language}</span>
        </div>
        <div class="mt-3.5 flex items-center justify-between text-[11px]">
          <span class="text-gray-400 font-medium">Simple Explanation</span>
          <a href="#/settings" class="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
            <span>Change</span>
            <i data-lucide="external-link" class="w-3 h-3"></i>
          </a>
        </div>
      </div>

    </div>

    <!-- ===================================================================== -->
    <!-- 4. ACTIVE SUBJECTS & CURATED RECOMMENDATIONS SECTION                  -->
    <!-- ===================================================================== -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Left Column: Active Subjects with Circular Radial Progress Meters (2 cols) -->
      <div class="lg:col-span-2 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <i data-lucide="layers" class="w-4 h-4"></i>
            </div>
            <h2 class="text-base sm:text-lg font-bold text-white tracking-tight">My Enrolled Subjects</h2>
          </div>
          <a href="#/subjects" class="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 group">
            <span>Explore All 8 Syllabi</span>
            <i data-lucide="arrow-right" class="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"></i>
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${progressData.subjects_progress.map(sp => {
            const pct = Math.round(sp.average_score || ((sp.concepts_mastered / 6) * 100));
            const isMastered = pct >= 85;
            const isProficient = pct >= 70;
            const badgeClass = isMastered 
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
              : (isProficient ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'bg-purple-500/15 text-purple-300 border-purple-500/30');
            const badgeLabel = isMastered ? 'Mastered 🏆' : (isProficient ? 'Proficient ⭐' : 'In Progress 🚀');

            return `
              <div class="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 hover:border-purple-500/40 hover:bg-white/[0.04] transition-all duration-300 flex items-center gap-4 group">
                <!-- Circular Radial Progress Ring Badge (matching reference) -->
                <div class="shrink-0 transition-transform group-hover:scale-105 duration-300">
                  ${renderSubjectProgressCircle(pct, 70, `dash_${sp.subject.replace(/[^a-zA-Z0-9]/g, '')}`)}
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1 mb-1.5">
                    <span class="font-bold text-sm sm:text-base text-white group-hover:text-purple-300 transition-colors truncate">
                      ${sp.subject}
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full border ${badgeClass} font-semibold shrink-0">
                      ${badgeLabel}
                    </span>
                  </div>
                  
                  <div class="text-[11px] text-gray-400 flex items-center gap-2 mb-3">
                    <span class="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 font-medium">${sp.concepts_mastered} Concepts</span>
                    <span class="text-gray-600">•</span>
                    <span>${sp.quizzes_taken} Quizzes</span>
                  </div>

                  <!-- Crisp Action Pill Buttons -->
                  <div class="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button 
                      onclick="quickStartSubjectTutor('${sp.subject}')" 
                      class="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                    >
                      <i data-lucide="message-circle" class="w-3.5 h-3.5 text-purple-400"></i>
                      <span>Ask Doubt</span>
                    </button>
                    <button 
                      onclick="quickStartSubjectQuiz('${sp.subject}')" 
                      class="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                    >
                      <i data-lucide="zap" class="w-3.5 h-3.5 text-cyan-400"></i>
                      <span>Quiz Me</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Right Column: High-Yield Recommendations & Pedagogical Tip (1 col) -->
      <div class="space-y-6">
        
        <!-- Recommended Topics Card -->
        <div class="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm font-bold text-white">
              <i data-lucide="compass" class="w-4 h-4 text-cyan-400"></i>
              <span>Recommended Topics</span>
            </div>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">Curated</span>
          </div>

          <div class="space-y-3 text-xs">
            
            <!-- Topic 1 -->
            <div 
              onclick="askRecommendedTopic('Pythagorean Theorem and Real-Life Applications')" 
              class="group p-3.5 rounded-xl bg-black/40 border border-white/10 hover:border-purple-500/50 hover:bg-purple-950/20 cursor-pointer transition-all duration-200 flex items-center justify-between"
            >
              <div>
                <div class="font-bold text-purple-200 group-hover:text-purple-100 flex items-center gap-1.5">
                  <span>📐 Pythagorean Theorem</span>
                </div>
                <div class="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                  <span class="text-purple-400 font-medium">Math</span>
                  <span>•</span>
                  <span>⏱️ 5 min</span>
                  <span>•</span>
                  <span class="text-amber-400 font-medium">High Yield</span>
                </div>
              </div>
              <div class="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-purple-500/30 text-gray-400 group-hover:text-purple-200 flex items-center justify-center transition-all shrink-0 ml-2">
                <i data-lucide="arrow-right" class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"></i>
              </div>
            </div>

            <!-- Topic 2 -->
            <div 
              onclick="askRecommendedTopic('Newton 2nd Law of Motion and Momentum in Cricket')" 
              class="group p-3.5 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-950/20 cursor-pointer transition-all duration-200 flex items-center justify-between"
            >
              <div>
                <div class="font-bold text-cyan-200 group-hover:text-cyan-100 flex items-center gap-1.5">
                  <span>⚡ Newton's 2nd Law (F=ma)</span>
                </div>
                <div class="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                  <span class="text-cyan-400 font-medium">Physics</span>
                  <span>•</span>
                  <span>⏱️ 7 min</span>
                  <span>•</span>
                  <span class="text-emerald-400 font-medium">Exam Prep</span>
                </div>
              </div>
              <div class="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-cyan-500/30 text-gray-400 group-hover:text-cyan-200 flex items-center justify-center transition-all shrink-0 ml-2">
                <i data-lucide="arrow-right" class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"></i>
              </div>
            </div>

            <!-- Topic 3 -->
            <div 
              onclick="askRecommendedTopic('How to Balance Chemical Equations Step by Step')" 
              class="group p-3.5 rounded-xl bg-black/40 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-950/20 cursor-pointer transition-all duration-200 flex items-center justify-between"
            >
              <div>
                <div class="font-bold text-emerald-200 group-hover:text-emerald-100 flex items-center gap-1.5">
                  <span>🧪 Balancing Chemical Reactions</span>
                </div>
                <div class="text-[11px] text-gray-400 mt-1 flex items-center gap-2">
                  <span class="text-emerald-400 font-medium">Chemistry</span>
                  <span>•</span>
                  <span>⏱️ 6 min</span>
                  <span>•</span>
                  <span class="text-purple-400 font-medium">5-Step Method</span>
                </div>
              </div>
              <div class="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-emerald-500/30 text-gray-400 group-hover:text-emerald-200 flex items-center justify-center transition-all shrink-0 ml-2">
                <i data-lucide="arrow-right" class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"></i>
              </div>
            </div>

          </div>
        </div>

        <!-- GuruG Pedagogical Study Tip Card -->
        <div class="glass-panel p-5 rounded-2xl border border-purple-500/25 bg-gradient-to-br from-purple-950/30 via-indigo-950/20 to-transparent relative overflow-hidden shadow-lg">
          <div class="flex items-center gap-2.5 text-xs font-bold text-purple-300 mb-2">
            <div class="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            </div>
            <span>Tutor's Pedagogical Tip</span>
          </div>
          <p class="text-xs text-gray-300 leading-relaxed pl-1">
            "When a formula feels intimidating, switch GuruG's mode to <strong>Explain Like I'm 10</strong> or <strong>Real-Life Examples</strong>. Once the visual intuition connects, mathematical derivations become effortless!"
          </p>
        </div>

      </div>

    </div>

  </div>

  <!-- ===================================================================== -->
  <!-- 5. INSTANT CONCEPT EXPLAINER MODAL                                    -->
  <!-- ===================================================================== -->
  <div id="quick-explain-modal" class="hidden fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4">
    <div class="max-w-lg w-full glass-panel-elevated p-6 sm:p-7 rounded-3xl border border-white/20 glow-purple fade-in shadow-2xl bg-[#0F1420]">
      
      <div class="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
        <h3 class="text-lg font-bold text-white flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
            <i data-lucide="lightbulb" class="w-4 h-4"></i>
          </div>
          <span>Instant Concept Explainer</span>
        </h3>
        <button onclick="closeQuickExplainModal()" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors">
          ✕
        </button>
      </div>

      <div class="space-y-4 mb-4">
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1.5">What concept do you want explained?</label>
          <input 
            type="text" 
            id="modal-concept-input" 
            class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
            placeholder="e.g. Quadratic Formula, Photosynthesis, Ohm's Law, Osmosis" 
            onkeydown="if(event.key === 'Enter') executeModalExplain();"
          />
        </div>

        <div class="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label class="block text-gray-400 mb-1.5 font-medium">Language</label>
            <select id="modal-lang-select" class="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-purple-500">
              <option value="Hinglish" selected>Hinglish</option>
              <option value="Hindi">हिन्दी</option>
              <option value="English">English</option>
              <option value="Tamil">தமிழ்</option>
              <option value="Bengali">বাংলা</option>
              <option value="Telugu">తెలుగు</option>
              <option value="Marathi">मराठी</option>
              <option value="Gujarati">ગુજરાતી</option>
              <option value="Kannada">ಕನ್ನಡ</option>
              <option value="Malayalam">മലയാളം</option>
              <option value="Urdu">اردو</option>
            </select>
          </div>
          <div>
            <label class="block text-gray-400 mb-1.5 font-medium">Explanation Depth</label>
            <select id="modal-mode-select" class="w-full px-3 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white focus:outline-none focus:border-purple-500">
              <option value="Simple Explanation" selected>Simple Explanation</option>
              <option value="Explain Like I'm 10">Explain Like I'm 10</option>
              <option value="Real-Life Examples">Real-Life Examples</option>
              <option value="Step-by-Step">Step-by-Step</option>
              <option value="Exam Preparation">Exam Preparation</option>
            </select>
          </div>
        </div>
      </div>

      <button 
        onclick="executeModalExplain()" 
        id="modal-explain-btn" 
        class="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        <i data-lucide="sparkles" class="w-4 h-4"></i>
        <span>Explain Concept Now</span>
      </button>

      <!-- Result Container -->
      <div id="modal-result" class="hidden mt-4 p-4 rounded-xl bg-black/50 border border-white/10 text-xs text-gray-200 max-h-64 overflow-y-auto leading-relaxed space-y-2"></div>
    </div>
  </div>
  `;
}

function openQuickExplainModal() {
  const modal = document.getElementById('quick-explain-modal');
  if (modal) {
    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
    const input = document.getElementById('modal-concept-input');
    if (input) setTimeout(() => input.focus(), 100);
  }
}

function closeQuickExplainModal() {
  const modal = document.getElementById('quick-explain-modal');
  if (modal) modal.classList.add('hidden');
}

async function executeModalExplain() {
  const input = document.getElementById('modal-concept-input');
  const lang = document.getElementById('modal-lang-select').value;
  const mode = document.getElementById('modal-mode-select').value;
  const btn = document.getElementById('modal-explain-btn');
  const result = document.getElementById('modal-result');

  if (!input || !input.value.trim()) return;

  btn.disabled = true;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin inline mr-1"></i> GuruG is thinking...`;
  if (window.lucide) window.lucide.createIcons();
  result.classList.add('hidden');

  try {
    const res = await api.quickExplain(input.value.trim(), "General", lang, mode, api.user?.grade_level || "Class 9–10");
    result.innerHTML = formatMarkdown(res.text);
    result.classList.remove('hidden');
    renderMathInContainer(result);
  } catch (err) {
    result.innerHTML = `<span class="text-rose-400">Error: ${err.message}</span>`;
    result.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4 inline mr-1"></i> Explain Concept Now`;
    if (window.lucide) window.lucide.createIcons();
  }
}

function submitDashboardDoubt(query) {
  const text = (typeof query === 'string' ? query : document.getElementById('dashboard-doubt-input')?.value || '').trim();
  if (!text) return;
  sessionStorage.setItem('gurug_pending_question', text);
  window.location.hash = '#/tutor';
}

function quickStartSubjectTutor(subj) {
  sessionStorage.setItem('gurug_target_subject', subj);
  window.location.hash = '#/tutor';
}

function quickStartSubjectQuiz(subj) {
  sessionStorage.setItem('gurug_target_subject', subj);
  window.location.hash = '#/quiz';
}

function askRecommendedTopic(topic) {
  sessionStorage.setItem('gurug_pending_question', topic);
  window.location.hash = '#/tutor';
}
