/**
 * GuruG Smart Quiz Generator Component
 */

let activeQuizData = null;
let currentQuestionIndex = 0;
let userQuizAnswers = {}; // map of { question_id: selected_option }
let quizEvaluationResult = null;

async function renderQuiz() {
  const user = api.user || {};
  
  // Check for prefilled subject or topic from other views
  const prefilledSubject = sessionStorage.getItem('gurug_target_subject') || 'Mathematics';
  const prefilledTopic = sessionStorage.getItem('gurug_target_topic') || 'Pythagorean Theorem';
  sessionStorage.removeItem('gurug_target_subject');
  sessionStorage.removeItem('gurug_target_topic');

  // If currently taking a quiz, render the quiz runner
  if (activeQuizData && !quizEvaluationResult) {
    return renderActiveQuizView();
  }

  // If reviewing results, render the results view
  if (quizEvaluationResult) {
    return renderQuizResultsView();
  }

  // Otherwise, render quiz configuration screen
  return renderQuizConfigView(prefilledSubject, prefilledTopic);
}

function renderQuizConfigView(prefilledSubject, prefilledTopic) {
  const subjects = [
    "Mathematics", "Physics", "Chemistry", "Biology",
    "Computer Science", "English", "History", "Geography"
  ];

  return `
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8 fade-in">
    
    <!-- Header -->
    <div class="text-center max-w-2xl mx-auto">
      <div class="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-3 shadow-lg shadow-cyan-500/20">
        <i data-lucide="check-square" class="w-6 h-6"></i>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-white">Smart Quiz Generator</h1>
      <p class="text-sm text-gray-300 mt-2">
        Test your conceptual understanding. GuruG generates questions dynamically and explains any mistakes with clear reasoning.
      </p>
    </div>

    <!-- Quiz Config Card -->
    <div class="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/15 max-w-2xl mx-auto">
      
      <form onsubmit="handleStartQuiz(event)" class="space-y-6">
        
        <!-- Subject Selection -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">Academic Subject</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            ${subjects.map(s => `
              <button type="button" onclick="selectQuizSubject('${s}')" id="subj-btn-${s.replace(/\s+/g, '-')}" class="p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${s === prefilledSubject ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' : 'bg-black/30 border-white/10 text-gray-400 hover:text-white hover:border-white/20'}">
                ${s}
              </button>
            `).join('')}
          </div>
          <input type="hidden" id="quiz-subject" value="${prefilledSubject}" />
        </div>

        <!-- Topic Input -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">Topic or Chapter</label>
          <input type="text" id="quiz-topic" required value="${prefilledTopic}" placeholder="e.g. Newton's Laws of Motion, Quadratic Equations, Photosynthesis" class="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors" />
          
          <!-- Quick topic recommendation pills -->
          <div class="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span class="text-[10px] text-gray-400">Popular:</span>
            <button type="button" onclick="setQuizTopic('Pythagorean Theorem')" class="px-2 py-0.5 rounded bg-white/5 text-[11px] text-gray-300 hover:text-white border border-white/10">📐 Pythagoras</button>
            <button type="button" onclick="setQuizTopic('Newton\\'s 2nd Law (F=ma)')" class="px-2 py-0.5 rounded bg-white/5 text-[11px] text-gray-300 hover:text-white border border-white/10">⚡ Newton 2nd Law</button>
            <button type="button" onclick="setQuizTopic('Balancing Chemical Equations')" class="px-2 py-0.5 rounded bg-white/5 text-[11px] text-gray-300 hover:text-white border border-white/10">🧪 Chemical Reactions</button>
            <button type="button" onclick="setQuizTopic('Photosynthesis & Calvin Cycle')" class="px-2 py-0.5 rounded bg-white/5 text-[11px] text-gray-300 hover:text-white border border-white/10">🌱 Photosynthesis</button>
          </div>
        </div>

        <!-- Difficulty, Count, Type Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">Difficulty</label>
            <select id="quiz-difficulty" class="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400">
              <option value="Easy">Easy (Fundamentals)</option>
              <option value="Medium" selected>Medium (Standard)</option>
              <option value="Hard">Hard (Advanced / Exam)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">Questions</label>
            <select id="quiz-count" class="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400">
              <option value="3">3 Questions (Quick)</option>
              <option value="5" selected>5 Questions (Standard)</option>
              <option value="10">10 Questions (Full Test)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">Type</label>
            <select id="quiz-type" class="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400">
              <option value="MCQ" selected>Multiple Choice (MCQ)</option>
              <option value="True/False">True or False</option>
            </select>
          </div>

        </div>

        <!-- Submit Button -->
        <button type="submit" id="quiz-start-btn" class="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-sm shadow-xl shadow-cyan-600/25 transition-all cursor-pointer">
          Generate Smart Quiz Now 🚀
        </button>

      </form>

    </div>

  </div>
  `;
}

function selectQuizSubject(subj) {
  const hidden = document.getElementById('quiz-subject');
  if (hidden) hidden.value = subj;

  const allBtns = document.querySelectorAll('[id^="subj-btn-"]');
  allBtns.forEach(b => {
    b.className = 'p-2.5 rounded-xl text-xs font-semibold border transition-all text-center bg-black/30 border-white/10 text-gray-400 hover:text-white hover:border-white/20';
  });

  const active = document.getElementById(`subj-btn-${subj.replace(/\s+/g, '-')}`);
  if (active) {
    active.className = 'p-2.5 rounded-xl text-xs font-semibold border transition-all text-center bg-cyan-500/20 border-cyan-400 text-cyan-200';
  }
}

function setQuizTopic(topic) {
  const topicInput = document.getElementById('quiz-topic');
  if (topicInput) topicInput.value = topic;
}

async function handleStartQuiz(e) {
  e.preventDefault();
  const subject = document.getElementById('quiz-subject').value;
  const topic = document.getElementById('quiz-topic').value.trim();
  const difficulty = document.getElementById('quiz-difficulty').value;
  const count = document.getElementById('quiz-count').value;
  const type = document.getElementById('quiz-type').value;
  const btn = document.getElementById('quiz-start-btn');

  btn.disabled = true;
  btn.innerText = "GuruG AI is generating your questions...";

  try {
    const data = await api.generateQuiz(subject, topic, difficulty, count, type, api.user?.preferred_language || 'English');
    activeQuizData = data;
    currentQuestionIndex = 0;
    userQuizAnswers = {};
    quizEvaluationResult = null;
    
    // Re-render app into active quiz mode
    const appEl = document.getElementById('app-view');
    if (appEl) {
      appEl.innerHTML = renderActiveQuizView();
      renderMathInContainer(appEl);
      if (window.lucide) window.lucide.createIcons();
    }
  } catch (err) {
    alert("Could not generate quiz: " + err.message);
    btn.disabled = false;
    btn.innerText = "Generate Smart Quiz Now 🚀";
  }
}

function renderActiveQuizView() {
  const q = activeQuizData.questions[currentQuestionIndex];
  const total = activeQuizData.total_questions;
  const progressPct = ((currentQuestionIndex + 1) / total) * 100;
  const selectedAnswer = userQuizAnswers[q.id] || null;

  return `
  <div class="max-w-3xl mx-auto px-4 py-8 space-y-6 fade-in">
    
    <!-- Top Quiz Header -->
    <div class="flex items-center justify-between">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-purple-400 uppercase tracking-wider">${activeQuizData.subject}</span>
          <span class="text-gray-500">•</span>
          <span class="text-xs text-gray-300 font-medium">${activeQuizData.topic}</span>
        </div>
        <h2 class="text-lg font-bold text-white mt-0.5">Question ${currentQuestionIndex + 1} of ${total}</h2>
      </div>

      <button onclick="abandonQuiz()" class="text-xs text-gray-400 hover:text-rose-400 transition-colors">
        Quit Quiz
      </button>
    </div>

    <!-- Progress Bar -->
    <div class="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
      <div class="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-300" style="width: ${progressPct}%"></div>
    </div>

    <!-- Question Card -->
    <div class="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/15 space-y-6">
      
      <!-- Question Statement with KaTeX -->
      <div class="text-lg sm:text-xl font-bold text-white leading-relaxed">
        ${formatMarkdown(q.question_text)}
      </div>

      <!-- Options List -->
      <div class="space-y-3 pt-2">
        ${q.options.map((opt, idx) => {
          const isSelected = selectedAnswer === opt;
          const letter = String.fromCharCode(65 + idx);
          return `
            <div onclick="selectQuizAnswer('${q.id}', '${escapeHtml(opt)}')" class="p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 group ${isSelected ? 'bg-purple-600/25 border-purple-500 shadow-md shadow-purple-600/20 text-white' : 'bg-black/30 border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/5'}">
              <span class="w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 ${isSelected ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400 group-hover:text-white'}">
                ${letter}
              </span>
              <span class="text-sm font-medium leading-relaxed">${escapeHtml(opt)}</span>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Action Buttons (Prev / Next / Submit) -->
      <div class="flex items-center justify-between pt-4 border-t border-white/10">
        <button onclick="navigateQuiz(-1)" class="px-5 py-2.5 rounded-xl glass-panel text-xs font-semibold text-gray-300 hover:text-white transition-all ${currentQuestionIndex === 0 ? 'opacity-40 pointer-events-none' : ''}">
          ← Previous
        </button>

        ${currentQuestionIndex === total - 1 ? `
          <button onclick="submitActiveQuiz()" id="quiz-submit-btn" class="px-7 py-2.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs shadow-lg shadow-emerald-500/25 transition-all cursor-pointer">
            Submit Quiz & View Results ✓
          </button>
        ` : `
          <button onclick="navigateQuiz(1)" class="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs shadow-lg shadow-purple-600/25 transition-all">
            Next Question →
          </button>
        `}
      </div>

    </div>

  </div>
  `;
}

function selectQuizAnswer(qId, answer) {
  userQuizAnswers[qId] = answer;
  // Re-render to show selection highlight
  const appEl = document.getElementById('app-view');
  if (appEl) {
    appEl.innerHTML = renderActiveQuizView();
    renderMathInContainer(appEl);
  }
}

function navigateQuiz(delta) {
  const newIdx = currentQuestionIndex + delta;
  if (newIdx >= 0 && newIdx < activeQuizData.total_questions) {
    currentQuestionIndex = newIdx;
    const appEl = document.getElementById('app-view');
    if (appEl) {
      appEl.innerHTML = renderActiveQuizView();
      renderMathInContainer(appEl);
    }
  }
}

function abandonQuiz() {
  if (confirm("Are you sure you want to exit? Your progress in this quiz will not be saved.")) {
    activeQuizData = null;
    userQuizAnswers = {};
    window.location.hash = '#/dashboard';
  }
}

async function submitActiveQuiz() {
  const btn = document.getElementById('quiz-submit-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerText = "Evaluating your answers...";
  }

  const answersList = Object.keys(userQuizAnswers).map(qId => ({
    question_id: qId,
    selected_answer: userQuizAnswers[qId]
  }));

  try {
    const result = await api.evaluateQuiz(activeQuizData.quiz_id, answersList);
    quizEvaluationResult = result;
    const appEl = document.getElementById('app-view');
    if (appEl) {
      appEl.innerHTML = renderQuizResultsView();
      renderMathInContainer(appEl);
      if (window.lucide) window.lucide.createIcons();
    }
  } catch (err) {
    alert("Could not evaluate quiz: " + err.message);
    if (btn) {
      btn.disabled = false;
      btn.innerText = "Submit Quiz & View Results ✓";
    }
  }
}

function renderQuizResultsView() {
  const res = quizEvaluationResult;
  const isHigh = res.percentage >= 70;

  return `
  <div class="max-w-3xl mx-auto px-4 py-8 space-y-8 fade-in">
    
    <!-- Score Summary Hero Card -->
    <div class="glass-panel-elevated rounded-3xl p-8 border ${isHigh ? 'border-emerald-500/30' : 'border-amber-500/30'} text-center space-y-4 glow-purple">
      
      <!-- Badge -->
      <div class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full ${isHigh ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'} text-xs font-bold">
        <span>${res.badge}</span>
      </div>

      <!-- Percentage Big Display -->
      <div>
        <div class="text-5xl sm:text-6xl font-black text-white tracking-tight">
          ${res.percentage}%
        </div>
        <p class="text-sm font-semibold text-gray-300 mt-1">
          Scored ${res.score} out of ${res.total_questions} questions correct
        </p>
      </div>

      <!-- Feedback -->
      <p class="text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
        ${res.feedback}
      </p>

      <!-- Action buttons -->
      <div class="flex flex-wrap items-center justify-center gap-3 pt-3">
        <button onclick="resetQuizState()" class="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs shadow-lg shadow-purple-600/30">
          Take Another Quiz 🔄
        </button>
        <button onclick="askGuruGAboutWeaknesses()" class="px-5 py-2.5 rounded-xl font-semibold glass-panel text-cyan-300 hover:text-white text-xs border border-cyan-500/30">
          Ask GuruG to Explain Missed Concepts 💡
        </button>
        <a href="#/dashboard" class="px-4 py-2.5 rounded-xl font-semibold text-gray-400 hover:text-white text-xs">
          Back to Dashboard
        </a>
      </div>

    </div>

    <!-- DETAILED QUESTION-BY-QUESTION BREAKDOWN -->
    <div class="space-y-4">
      <h3 class="text-base font-bold text-white flex items-center gap-2">
        <i data-lucide="list-checks" class="w-5 h-5 text-purple-400"></i>
        <span>Detailed Question Explanations</span>
      </h3>

      ${res.questions.map((q, idx) => `
        <div class="glass-panel rounded-2xl p-5 border ${q.is_correct ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-rose-500/20 bg-rose-950/10'} space-y-3">
          
          <div class="flex items-start justify-between gap-3">
            <span class="text-xs font-bold text-gray-400">Q${idx + 1}</span>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${q.is_correct ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}">
              ${q.is_correct ? '✓ Correct' : '✕ Incorrect'}
            </span>
          </div>

          <div class="text-sm font-semibold text-white">
            ${formatMarkdown(q.question_text)}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span class="text-gray-400 block text-[10px]">Your Answer:</span>
              <span class="${q.is_correct ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}">${escapeHtml(q.student_answer || 'No answer selected')}</span>
            </div>
            <div class="p-2.5 rounded-xl bg-black/40 border border-white/5">
              <span class="text-gray-400 block text-[10px]">Correct Answer:</span>
              <span class="text-emerald-400 font-semibold">${escapeHtml(q.correct_answer)}</span>
            </div>
          </div>

          <!-- Explanation -->
          <div class="p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-gray-300 leading-relaxed">
            <strong class="text-purple-300">Pedagogical Explanation:</strong> ${formatMarkdown(q.explanation)}
          </div>

        </div>
      `).join('')}
    </div>

  </div>
  `;
}

function resetQuizState() {
  activeQuizData = null;
  quizEvaluationResult = null;
  userQuizAnswers = {};
  currentQuestionIndex = 0;
  window.location.hash = '#/quiz';
}

function askGuruGAboutWeaknesses() {
  if (quizEvaluationResult) {
    sessionStorage.setItem('gurug_pending_question', `Explain the key concepts of ${quizEvaluationResult.topic} in ${quizEvaluationResult.subject} so I can get a 100% on the quiz next time.`);
  }
  resetQuizState();
  window.location.hash = '#/tutor';
}
