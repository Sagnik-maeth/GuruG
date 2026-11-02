/**
 * GuruG Step-by-Step Problem Solver Component
 */

let activeProblemSolution = null;

async function renderSolver() {
  const user = api.user || {};
  let history = [];
  try {
    history = await api.getSolverHistory();
  } catch (err) {
    console.warn("Could not load solver history:", err);
  }

  // Handle auto-populated problem from topics
  const targetProblem = sessionStorage.getItem('gurug_target_problem');
  if (targetProblem) {
    sessionStorage.removeItem('gurug_target_problem');
    setTimeout(() => {
      const input = document.getElementById('solver-problem-input');
      if (input) {
        input.value = targetProblem;
        const form = input.closest('form');
        if (form) form.requestSubmit();
      }
    }, 400);
  }

  return `
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 fade-in">
    
    <!-- Header -->
    <div class="text-center max-w-2xl mx-auto">
      <div class="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-lg shadow-emerald-500/20">
        <i data-lucide="calculator" class="w-6 h-6"></i>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-white">Step-by-Step Problem Solver</h1>
      <p class="text-sm text-gray-300 mt-2">
        We don't just give you the final answer. GuruG teaches you the reasoning, formulas, and approach so you can solve it yourself in exams!
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- LEFT 2 COLS: PROBLEM INPUT & SOLUTION BREAKDOWN -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- Problem Input Card -->
        <div class="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/15">
          <form onsubmit="handleSolveProblem(event)" class="space-y-4">
            
            <div class="flex flex-wrap items-center justify-between gap-3">
              <label class="text-xs font-bold uppercase tracking-wider text-gray-300">Enter Academic Problem</label>
              
              <div class="flex items-center gap-2">
                <!-- Microphone Voice Dictation Button -->
                <button type="button" onclick="toggleSolverVoiceRecognition()" id="solver-mic-btn" class="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer" title="Speak problem into microphone">
                  <i data-lucide="mic" class="w-3.5 h-3.5"></i>
                  <span id="solver-mic-text">Speak Problem 🎙️</span>
                </button>

                <!-- Subject Dropdown -->
                <select id="solver-subject" class="bg-[#121824] border border-white/15 text-xs text-emerald-300 rounded-xl px-3 py-1.5 focus:outline-none">
                  <option value="Mathematics" selected>Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>
            </div>

            <textarea 
              id="solver-problem-input" 
              required
              rows="3" 
              placeholder="e.g. Solve the quadratic equation x^2 - 5x + 6 = 0, or calculate the force on a 4kg mass accelerating at 5 m/s^2..."
              class="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed"
            >Solve x^2 - 5x + 6 = 0 step-by-step</textarea>

            <!-- Sample Problem Chips -->
            <div class="flex flex-wrap items-center gap-1.5 text-xs">
              <span class="text-[10px] text-gray-400">Try Sample:</span>
              <button type="button" onclick="setSolverSample('Solve x^2 - 5x + 6 = 0', 'Mathematics')" class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white text-[11px]">
                x² - 5x + 6 = 0
              </button>
              <button type="button" onclick="setSolverSample('A right-angled triangle has legs a=3m and b=4m. What is the hypotenuse c?', 'Mathematics')" class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white text-[11px]">
                Pythagoras (3, 4, c)
              </button>
              <button type="button" onclick="setSolverSample('A force acts on a mass of 4 kg causing an acceleration of 5 m/s^2. Calculate the force.', 'Physics')" class="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white text-[11px]">
                Newton F = ma
              </button>
            </div>

            <button type="submit" id="solver-submit-btn" class="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white text-sm shadow-xl shadow-emerald-600/25 transition-all cursor-pointer">
              Break Down & Solve Step-by-Step 📐
            </button>
          </form>
        </div>

        <!-- Solution Display Container -->
        <div id="solver-solution-container">
          ${activeProblemSolution ? renderSolutionOutput(activeProblemSolution) : renderSolverEmptyGuide()}
        </div>

      </div>

      <!-- RIGHT COL: PAST SOLVED PROBLEMS & PEDAGOGY GUIDE -->
      <div class="space-y-6">
        
        <!-- Solver History -->
        <div class="glass-panel p-5 rounded-2xl border border-white/10">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <i data-lucide="history" class="w-3.5 h-3.5 text-purple-400"></i>
              <span>Recently Solved</span>
            </span>
          </div>

          <div class="space-y-2 text-xs">
            ${history.length > 0 ? history.map(h => `
              <div onclick="setSolverSample('${escapeHtml(h.problem_text)}', '${h.subject}')" class="p-3 rounded-xl bg-black/30 border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all">
                <div class="font-semibold text-white truncate">${h.concept_identified || h.subject}</div>
                <div class="text-[11px] text-gray-400 truncate mt-0.5">${h.problem_text}</div>
                <div class="text-[10px] text-emerald-400 mt-1 font-mono">${h.final_answer}</div>
              </div>
            `).join('') : `
              <div class="p-4 text-center text-gray-500 text-xs">
                No previously solved problems. Input a question to solve!
              </div>
            `}
          </div>
        </div>

        <!-- Pedagogical Pillar Card -->
        <div class="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/20 to-transparent text-xs text-gray-300 space-y-2.5">
          <div class="font-bold text-emerald-300 flex items-center gap-1.5">
            <i data-lucide="shield-check" class="w-4 h-4"></i>
            <span>The GuruG 5-Step Formula</span>
          </div>
          <ol class="list-decimal ml-4 space-y-1.5 text-gray-300 leading-relaxed">
            <li><strong>Concept Identification:</strong> Know the underlying laws.</li>
            <li><strong>Strategic Roadmap:</strong> Plan before computing.</li>
            <li><strong>Step-by-Step Proof:</strong> Never skip algebraic logic.</li>
            <li><strong>Explicit Final Answer:</strong> Clear units and values.</li>
            <li><strong>Practice Follow-Up:</strong> Test retention immediately.</li>
          </ol>
        </div>

      </div>

    </div>

  </div>
  `;
}

function setSolverSample(text, subject) {
  const input = document.getElementById('solver-problem-input');
  const subj = document.getElementById('solver-subject');
  if (input) input.value = text;
  if (subj) subj.value = subject;
}

function renderSolverEmptyGuide() {
  return `
  <div class="glass-panel rounded-3xl p-8 border border-white/10 text-center space-y-3">
    <div class="text-3xl">📐</div>
    <h3 class="text-base font-bold text-white">Ready to Solve Any Problem</h3>
    <p class="text-xs text-gray-400 max-w-md mx-auto">
      Type any math, physics, or science question above. We will structure the solution into 5 pedagogical cards with clear reasoning and KaTeX formulas.
    </p>
  </div>
  `;
}

function renderSolutionOutput(sol) {
  return `
  <div class="space-y-4 fade-in">
    
    <!-- 1. Concept Identification Card -->
    <div class="glass-panel rounded-2xl p-5 border border-purple-500/30 bg-purple-950/15">
      <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300 mb-1">
        <span>🎯 Step 1: Concept & Laws Identified</span>
      </div>
      <h3 class="text-base font-extrabold text-white">${sol.concept_identified}</h3>
    </div>

    <!-- 2. Strategic Approach Card -->
    <div class="glass-panel rounded-2xl p-5 border border-cyan-500/30 bg-cyan-950/15">
      <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1">
        <span>🧭 Step 2: Strategic Approach</span>
      </div>
      <p class="text-xs sm:text-sm text-gray-200 leading-relaxed">
        ${sol.approach_explanation}
      </p>
    </div>

    <!-- Visual Learning Concept Diagram -->
    ${sol.visual_aid ? `
      <div class="concept-visual-card p-4 rounded-2xl glass-panel-elevated border border-purple-500/35 shadow-xl space-y-3">
        <div class="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span class="font-bold text-white text-xs sm:text-sm">${sol.visual_aid.title}</span>
          </div>
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">${sol.visual_aid.badge || 'Visual Diagram'}</span>
        </div>
        <div class="relative rounded-xl overflow-hidden bg-black/40 border border-white/10 text-center cursor-pointer group" onclick="openImageLightbox('${sol.visual_aid.image_url}', '${escapeHtml(sol.visual_aid.title)}', '${escapeHtml(sol.visual_aid.caption)}')">
          <img src="${sol.visual_aid.image_url}" alt="${escapeHtml(sol.visual_aid.title)}" class="w-full max-h-72 object-contain mx-auto py-2 transition-transform duration-300 group-hover:scale-[1.02]" loading="lazy" />
          <div class="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            <span>🔍 Click to Zoom</span>
          </div>
        </div>
        <div class="text-xs text-gray-300 leading-relaxed bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
          <p class="font-medium text-purple-200">💡 <strong>Visual Concept Insight:</strong> ${sol.visual_aid.caption}</p>
        </div>
      </div>
    ` : ''}

    <!-- 3. Step-by-Step Breakdown -->
    <div class="glass-panel-elevated rounded-2xl p-6 border border-white/15 space-y-4">
      <div class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
        <span>📝 Step 3: Step-by-Step Execution</span>
      </div>

      <div class="space-y-4">
        ${sol.steps.map(step => `
          <div class="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-white">Step ${step.step_number}: ${step.step_title}</span>
              <span class="text-[10px] text-gray-400">Mathematical Execution</span>
            </div>
            
            <div class="text-sm text-gray-200 font-mono py-1">
              ${formatMarkdown(step.step_content)}
            </div>

            <div class="text-xs text-purple-300/90 pt-1 border-t border-white/5">
              <strong>Why this step:</strong> ${step.reasoning}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 4. Final Answer Card -->
    <div class="glass-panel rounded-2xl p-5 border border-emerald-500/40 bg-emerald-950/20 glow-cyan">
      <div class="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
        <span>✅ Step 4: Final Verified Answer</span>
      </div>
      <div class="text-xl sm:text-2xl font-black text-white font-mono">
        ${sol.final_answer}
      </div>
    </div>

    <!-- 5. Practice Problem Card -->
    <div class="glass-panel rounded-2xl p-5 border border-amber-500/30 bg-amber-950/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
          <span>🔄 Step 5: Similar Practice Question</span>
        </div>
        <p class="text-xs text-gray-200">${sol.practice_problem}</p>
      </div>
      <button onclick="solvePracticeQuestion('${escapeHtml(sol.practice_problem)}')" class="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold shrink-0 transition-colors">
        Try This Problem →
      </button>
    </div>

  </div>
  `;
}

let isSolverListening = false;
function toggleSolverVoiceRecognition() {
  const input = document.getElementById('solver-problem-input');
  const btn = document.getElementById('solver-mic-btn');
  const text = document.getElementById('solver-mic-text');

  if (isSolverListening) {
    VoiceInput.stop();
    isSolverListening = false;
    if (btn) btn.className = "px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer";
    if (text) text.innerText = "Speak Problem 🎙️";
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const baseText = input ? input.value : '';
  VoiceInput.init(
    (fullTranscript) => {
      if (input) input.value = fullTranscript;
    },
    (isListening, errorMsg) => {
      isSolverListening = isListening;
      if (isListening) {
        if (btn) btn.className = "px-2.5 py-1 rounded-lg bg-rose-600 text-white border border-rose-400 mic-recording-pulse text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-rose-600/30";
        if (text) text.innerText = "Listening... ⏹";
      } else {
        if (btn) btn.className = "px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer";
        if (text) text.innerText = "Speak Problem 🎙️";
        if (errorMsg) alert(errorMsg);
      }
      if (window.lucide) window.lucide.createIcons();
    },
    api.user?.preferred_language === 'Hindi' ? 'hi-IN' : 'en-IN'
  );

  const started = VoiceInput.start(baseText);
  if (!started && !VoiceInput.isSupported()) {
    alert("Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.");
  }
}

async function handleSolveProblem(e) {
  e.preventDefault();
  if (isSolverListening) {
    toggleSolverVoiceRecognition();
  }
  const input = document.getElementById('solver-problem-input');
  const subj = document.getElementById('solver-subject').value;
  const btn = document.getElementById('solver-submit-btn');
  const container = document.getElementById('solver-solution-container');

  if (!input || !input.value.trim()) return;

  btn.disabled = true;
  btn.innerText = "GuruG AI is analyzing and solving...";
  container.innerHTML = `
    <div class="glass-panel rounded-3xl p-8 border border-white/10 text-center space-y-3 fade-in">
      <div class="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mx-auto"></div>
      <p class="text-xs text-gray-300">Formulating concept roadmap & calculating step-by-step...</p>
    </div>
  `;

  try {
    const solution = await api.solveProblem(
      input.value.trim(),
      subj,
      api.user?.preferred_language || 'English',
      api.user?.grade_level || 'Class 9–10'
    );
    activeProblemSolution = solution;
    container.innerHTML = renderSolutionOutput(solution);
    renderMathInContainer(container);
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    container.innerHTML = `
      <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
        Solver error: ${err.message}
      </div>
    `;
  } finally {
    btn.disabled = false;
    btn.innerText = "Break Down & Solve Step-by-Step 📐";
  }
}

function solvePracticeQuestion(practiceText) {
  const input = document.getElementById('solver-problem-input');
  if (input) {
    input.value = practiceText;
    window.scrollTo({ top: 100, behavior: 'smooth' });
  }
}
