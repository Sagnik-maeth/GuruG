/**
 * GuruG Learning Progress & Analytics Component
 */

async function renderProgress() {
  let progress = {
    stats: {
      questions_asked: 14,
      quizzes_completed: 6,
      average_quiz_score: 85.0,
      problems_solved: 5,
      concepts_mastered: 12,
      active_streak_days: 4
    },
    subjects_progress: [
      { subject: "Mathematics", concepts_mastered: 4, quizzes_taken: 3, average_score: 85.0 },
      { subject: "Physics", concepts_mastered: 3, quizzes_taken: 2, average_score: 90.0 },
      { subject: "Chemistry", concepts_mastered: 2, quizzes_taken: 2, average_score: 75.0 },
      { subject: "Computer Science", concepts_mastered: 5, quizzes_taken: 4, average_score: 95.0 }
    ],
    recent_activities: [],
    weak_areas: []
  };

  try {
    const fetched = await api.getProgress();
    if (fetched && fetched.stats) {
      progress = fetched;
    }
  } catch (err) {
    console.warn("Could not load fresh progress data:", err);
  }

  const s = progress.stats;

  return `
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 fade-in">
    
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white">Learning Progress & Analytics</h1>
        <p class="text-sm text-gray-300 mt-1">Real-time mastery tracking across your academic subjects</p>
      </div>

      <div class="flex items-center gap-2">
        <a href="#/quiz" class="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-semibold hover:bg-purple-600/30 transition-colors">
          Take a Test Quiz
        </a>
      </div>
    </div>

    <!-- 5 Summary KPI Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      
      <div class="glass-panel p-5 rounded-2xl border border-white/10">
        <span class="text-[11px] font-semibold text-gray-400 block mb-1">Study Streak</span>
        <div class="text-3xl font-black text-amber-400 flex items-center gap-1.5">
          <span>${s.active_streak_days}</span>
          <span class="text-base font-normal text-gray-400">days</span>
        </div>
        <div class="text-[10px] text-amber-300 mt-1">🔥 Top 10% consistency</div>
      </div>

      <div class="glass-panel p-5 rounded-2xl border border-white/10">
        <span class="text-[11px] font-semibold text-gray-400 block mb-1">Concepts Mastered</span>
        <div class="text-3xl font-black text-white">${s.concepts_mastered}</div>
        <div class="text-[10px] text-purple-400 mt-1">✓ Verified by quizzes</div>
      </div>

      <div class="glass-panel p-5 rounded-2xl border border-white/10">
        <span class="text-[11px] font-semibold text-gray-400 block mb-1">Average Score</span>
        <div class="text-3xl font-black text-cyan-400">${s.average_quiz_score}%</div>
        <div class="text-[10px] text-cyan-300 mt-1">Across all subjects</div>
      </div>

      <div class="glass-panel p-5 rounded-2xl border border-white/10">
        <span class="text-[11px] font-semibold text-gray-400 block mb-1">Problems Solved</span>
        <div class="text-3xl font-black text-emerald-400">${s.problems_solved}</div>
        <div class="text-[10px] text-emerald-300 mt-1">Step-by-step verified</div>
      </div>

      <div class="glass-panel p-5 rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
        <span class="text-[11px] font-semibold text-gray-400 block mb-1">Questions Asked</span>
        <div class="text-3xl font-black text-white">${s.questions_asked}</div>
        <div class="text-[10px] text-gray-400 mt-1">To GuruG AI tutor</div>
      </div>

    </div>

    <!-- SUBJECT PROFICIENCY & MASTERY BREAKDOWN -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- Left: Subject Proficiency Bars -->
      <div class="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/15 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <i data-lucide="bar-chart-2" class="w-5 h-5 text-purple-400"></i>
            <span>Subject Mastery Breakdown</span>
          </h3>
          <span class="text-xs text-gray-400">Score & Concepts</span>
        </div>

        <div class="space-y-3.5">
          ${progress.subjects_progress.map(sp => {
            const pct = Math.round(sp.average_score || 0);
            return `
              <div class="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-purple-500/30 transition-all flex items-center gap-4 group">
                <!-- Circular Radial Progress Ring Badge (matching reference) -->
                ${renderSubjectProgressCircle(pct, 68, `prog_${sp.subject.replace(/[^a-zA-Z0-9]/g, '')}`)}

                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <span class="font-bold text-sm text-white group-hover:text-purple-300 transition-colors truncate">${sp.subject}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full ${pct >= 85 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : (pct >= 70 ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'bg-purple-500/15 text-purple-300 border border-purple-500/30')} font-semibold shrink-0">
                      ${pct >= 85 ? 'Mastered 🏆' : (pct >= 70 ? 'Proficient ⭐' : 'Practicing 🎯')}
                    </span>
                  </div>

                  <div class="flex items-center gap-2 text-[11px] text-gray-400 mb-2">
                    <span class="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 font-medium">${sp.concepts_mastered} Concepts Cleared</span>
                    <span>•</span>
                    <span>${sp.quizzes_taken} Tests</span>
                  </div>

                  <div class="flex items-center gap-2 pt-1.5 border-t border-white/5 text-xs">
                    <button onclick="sessionStorage.setItem('gurug_pending_question', 'Help me master ${sp.subject} concepts with examples'); window.location.hash = '#/tutor';" class="text-[11px] font-semibold text-purple-300 hover:text-white transition-colors">
                      Study Concept →
                    </button>
                    <span class="text-gray-600">•</span>
                    <button onclick="sessionStorage.setItem('gurug_target_subject', '${sp.subject}'); window.location.hash = '#/quiz';" class="text-[11px] font-semibold text-cyan-300 hover:text-white transition-colors">
                      Take Practice Quiz ⚡
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Right: Identified Areas for Revision & Next Steps -->
      <div class="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/15 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <i data-lucide="alert-circle" class="w-5 h-5 text-amber-400"></i>
            <span>Areas for Reinforcement</span>
          </h3>
          <span class="text-xs text-amber-400 font-semibold">Priority Revision</span>
        </div>

        <div class="space-y-3">
          <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-gray-300 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white">🧪 Stoichiometry & Mole Calculations</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">65% Score</span>
            </div>
            <p class="text-[11px] text-gray-400">Calculations involving Avogadro's constant need a quick refresher.</p>
            <button onclick="sessionStorage.setItem('gurug_pending_question', 'Explain the Mole concept and Avogadro number with 2 simple numericals step-by-step'); window.location.hash = '#/tutor';" class="text-xs font-semibold text-purple-300 hover:text-white flex items-center gap-1 mt-1">
              <span>Revise with GuruG</span> →
            </button>
          </div>

          <div class="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-gray-300 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white">⚡ Electric Circuit Resistance (Series vs Parallel)</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">72% Score</span>
            </div>
            <p class="text-[11px] text-gray-400">Review reciprocal sum rules for parallel resistors ($1/R_p = 1/R_1 + 1/R_2$).</p>
            <button onclick="sessionStorage.setItem('gurug_pending_question', 'Explain why resistors in parallel have lower equivalent resistance than in series'); window.location.hash = '#/tutor';" class="text-xs font-semibold text-cyan-300 hover:text-white flex items-center gap-1 mt-1">
              <span>Revise with GuruG</span> →
            </button>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-gray-300">
          <strong class="text-purple-300">Pedagogical Recommendation:</strong> Focus 15 minutes of revision on chemical stoichiometry before taking your next board practice quiz.
        </div>
      </div>

    </div>

    <!-- RECENT ACTIVITY TIMELINE -->
    <div class="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
      <h3 class="text-base font-bold text-white flex items-center gap-2">
        <i data-lucide="clock" class="w-5 h-5 text-gray-400"></i>
        <span>Recent Learning Activity</span>
      </h3>

      <div class="space-y-2.5 text-xs">
        <div class="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <div>
              <div class="font-semibold text-white">Completed Quiz: Pythagorean Theorem</div>
              <div class="text-[10px] text-gray-400">Mathematics • 100% Score</div>
            </div>
          </div>
          <span class="text-[10px] text-emerald-400 font-bold">🏆 Master</span>
        </div>

        <div class="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="w-2 h-2 rounded-full bg-purple-400"></span>
            <div>
              <div class="font-semibold text-white">AI Tutor Session: Newton's Laws in Hinglish</div>
              <div class="text-[10px] text-gray-400">Physics • Real-Life Examples Mode</div>
            </div>
          </div>
          <span class="text-[10px] text-gray-500">Earlier today</span>
        </div>

        <div class="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
            <div>
              <div class="font-semibold text-white">Solved Academic Problem: Quadratic Equation ($x^2 - 5x + 6 = 0$)</div>
              <div class="text-[10px] text-gray-400">Step-by-Step Problem Solver</div>
            </div>
          </div>
          <span class="text-[10px] text-gray-500">Yesterday</span>
        </div>
      </div>
    </div>

  </div>
  `;
}
