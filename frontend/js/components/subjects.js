/**
 * GuruG Subject-Wise Learning Component
 */

let allSubjectsData = [];
let activeSubjectId = 'mathematics';

async function renderSubjects() {
  try {
    allSubjectsData = await api.getSubjects();
  } catch (err) {
    console.warn("Could not load subjects from API, using fallback:", err);
  }

  const subjectProgressMap = {
    'mathematics': 85,
    'physics': 90,
    'chemistry': 72,
    'biology': 88,
    'computer-science': 95,
    'english': 82,
    'social-science': 76,
    'environmental-science': 80
  };

  const activeSubject = allSubjectsData.find(s => s.id === activeSubjectId) || allSubjectsData[0] || {
    name: "Mathematics",
    description: "Algebra, Geometry, Trigonometry, Calculus",
    topics: []
  };

  const activePct = subjectProgressMap[activeSubject.id] || 75;

  return `
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 fade-in">
    
    <!-- Header -->
    <div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-white">Subject-Wise Learning Hub</h1>
      <p class="text-sm text-gray-300 mt-1 max-w-2xl">
        Explore structured topics across 8 academic subjects. Track your mastery rings and launch instant tutor sessions or practice tests.
      </p>
    </div>

    <!-- 8 Subject Selector Pills Grid with Circular Progress Rings -->
    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
      ${allSubjectsData.map(s => {
        const isActive = s.id === activeSubjectId;
        const sPct = subjectProgressMap[s.id] || 75;
        return `
          <button onclick="switchSubjectTab('${s.id}')" class="p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${isActive ? 'bg-gradient-to-b from-purple-600/30 to-indigo-600/30 border-purple-500 shadow-lg shadow-purple-500/20 text-white' : 'glass-panel text-gray-400 hover:text-white hover:border-white/20'}">
            ${renderSubjectProgressCircle(sPct, 48, 'subj_pill_' + s.id)}
            <span class="font-bold text-xs truncate w-full">${s.name}</span>
          </button>
        `;
      }).join('')}
    </div>

    <!-- Active Subject Banner with Prominent Circular Progress Ring -->
    <div class="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/15 glow-purple">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div class="flex items-center gap-5">
          ${renderSubjectProgressCircle(activePct, 74, 'active_subj_' + activeSubject.id)}
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-purple-400">Selected Subject</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full ${activePct >= 85 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : (activePct >= 70 ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'bg-purple-500/15 text-purple-300 border border-purple-500/30')} font-semibold">
                ${activePct >= 85 ? 'Mastered 🏆' : (activePct >= 70 ? 'Proficient ⭐' : 'In Progress 🚀')}
              </span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">${activeSubject.name}</h2>
            <p class="text-sm text-gray-300 mt-1 max-w-xl">${activeSubject.description}</p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button onclick="startSubjectTutorSession('${activeSubject.name}')" class="px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5">
            <i data-lucide="message-square" class="w-4 h-4"></i>
            <span>Ask Tutor About ${activeSubject.name}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Subject Topics Cards Grid -->
    <div>
      <h3 class="text-base font-bold text-white mb-4 flex items-center gap-2">
        <i data-lucide="book-marked" class="w-4 h-4 text-cyan-400"></i>
        <span>Core Concepts & Exam Topics</span>
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6" id="subject-topics-container">
        ${(activeSubject.topics || []).map(t => `
          <div class="glass-panel rounded-2xl p-6 border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-4">
            
            <div>
              <div class="flex items-start justify-between gap-2 mb-2">
                <h4 class="text-base font-bold text-white">${t.name}</h4>
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-purple-300 shrink-0">
                  ${t.grade}
                </span>
              </div>
              
              <p class="text-xs text-gray-300 leading-relaxed mb-3">
                ${t.summary}
              </p>

              <!-- Formula Box -->
              ${t.formula ? `
                <div class="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-cyan-300 font-mono overflow-x-auto">
                  <div class="text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-sans">Key Equation / Formula</div>
                  $$ ${(t.formula || '').replace(/^\$+|\$+$/g, '').trim()} $$
                </div>
              ` : ''}
            </div>

            <!-- Action CTAs -->
            <div class="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <button onclick="learnTopicWithTutor('${t.name}', '${activeSubject.name}')" class="font-semibold text-purple-300 hover:text-purple-200 flex items-center gap-1">
                <span>Explain Topic</span>
                <span>→</span>
              </button>
              
              <div class="flex items-center gap-2">
                <button onclick="quizTopic('${t.name}', '${activeSubject.name}')" class="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 font-semibold text-[11px] transition-colors">
                  Take Quiz
                </button>
              </div>
            </div>

          </div>
        `).join('')}
      </div>
    </div>

  </div>
  `;
}

function switchSubjectTab(subjId) {
  activeSubjectId = subjId;
  const appEl = document.getElementById('app-view');
  if (appEl) {
    renderSubjects().then(html => {
      appEl.innerHTML = html;
      renderMathInContainer(appEl);
      if (window.lucide) window.lucide.createIcons();
    });
  }
}

function startSubjectTutorSession(subjName) {
  sessionStorage.setItem('gurug_target_subject', subjName);
  window.location.hash = '#/tutor';
}

function learnTopicWithTutor(topicName, subjName) {
  sessionStorage.setItem('gurug_target_subject', subjName);
  sessionStorage.setItem('gurug_pending_question', `Explain the core concept of ${topicName} in ${subjName} with step-by-step reasoning and a real-world example.`);
  window.location.hash = '#/tutor';
}

function quizTopic(topicName, subjName) {
  sessionStorage.setItem('gurug_target_subject', subjName);
  sessionStorage.setItem('gurug_target_topic', topicName);
  window.location.hash = '#/quiz';
}
