/**
 * GuruG - Interactive Two-Way AI Debate Arena with Human Voice
 * Upgraded Elite Interface: Oxford-Style Podium, Strategy Starter Chips,
 * Live Soundwave Visualizers, Strategic Briefing Cards, and 4-Pillar Adjudication.
 */

let activeDebateSession = null;
let currentDebateRound = 1;
let debateTurnsHistory = [];
let isVoiceModeEnabled = true;
let isHandsFreeAutoListen = true;
let isGuruGSpeaking = false;
let isStudentListening = false;
let debateScorecardData = null;
let currentDebateCategoryFilter = "All";
let cachedDebateTopicsList = [];

async function renderDebate() {
  const user = api.user || {};

  // If scorecard is active, show the scorecard
  if (debateScorecardData) {
    return renderDebateScorecardView();
  }

  // If in an active debate session, show the arena
  if (activeDebateSession) {
    return renderDebateArenaView();
  }

  // Otherwise, render setup & topic picker
  return renderDebateSetupView();
}

async function renderDebateSetupView() {
  let topics = [];
  try {
    topics = await api.getDebateTopics();
    cachedDebateTopicsList = topics;
  } catch (err) {
    console.warn("Could not load debate topics:", err);
    topics = cachedDebateTopicsList || [];
  }

  const defaultTopic = topics[0] || {
    id: "ai-exams",
    title: "Should AI replace traditional school examinations?",
    category: "Technology & Education",
    description: "Standardized written exams vs. continuous personalized AI assessment.",
    for_points: "Continuous assessment eliminates test anxiety; personalized questions prevent cheating.",
    against_points: "Over-reliance on algorithms; standardized tests ensure equal objective benchmarks."
  };

  const categories = ["All", "Technology & Education", "Science & Environment", "Ethics & Resource Allocation", "Psychology & Society"];

  return `
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8 fade-in">
    
    <!-- Top Header -->
    <div class="text-center max-w-2xl mx-auto space-y-3">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] mx-auto shadow-2xl shadow-purple-500/25">
        <div class="w-full h-full bg-[#0B0F17] rounded-[15px] flex items-center justify-center text-cyan-400">
          <i data-lucide="swords" class="w-8 h-8"></i>
        </div>
      </div>
      
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
        <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>Two-Way Conversational Voice Arena • 3 Rounds Clash</span>
      </div>

      <h1 class="text-3xl sm:text-5xl font-black text-white tracking-tight">
        Debate with <span class="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">GuruG AI</span>
      </h1>
      
      <p class="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl mx-auto">
        Challenge your critical thinking in an intellectual Oxford-style debate. Speak naturally with your microphone, hear GuruG's human-voice counterarguments, and get evaluated on 4 objective debate pillars!
      </p>

      <!-- Key Features Quick Highlights -->
      <div class="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] text-gray-400">
        <span class="flex items-center gap-1 text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
          <i data-lucide="mic" class="w-3.5 h-3.5"></i> Push-to-Talk Speech
        </span>
        <span class="flex items-center gap-1 text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
          <i data-lucide="volume-2" class="w-3.5 h-3.5"></i> Spoken Counter-Rebuttals
        </span>
        <span class="flex items-center gap-1 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
          <i data-lucide="award" class="w-3.5 h-3.5"></i> AI Adjudicator Scorecard
        </span>
      </div>
    </div>

    <!-- Debate Setup Card -->
    <div class="glass-panel-elevated rounded-3xl p-6 sm:p-9 border border-white/15 max-w-2xl mx-auto space-y-7 glow-purple shadow-2xl bg-[#0F1422]">
      
      <form onsubmit="handleStartDebate(event)" class="space-y-6">
        
        <!-- Select Topic Motion -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <i data-lucide="compass" class="w-3.5 h-3.5 text-cyan-400"></i>
              <span>Select Debate Motion</span>
            </label>
            <span class="text-[11px] text-purple-400 font-medium">3 Rounds Debate</span>
          </div>

          <!-- Category Filter Pills -->
          <div class="flex flex-wrap gap-1.5 pb-1">
            ${categories.map(cat => `
              <button 
                type="button" 
                onclick="filterDebateTopics('${cat}')" 
                id="cat-pill-${cat.replace(/[^a-zA-Z0-9]/g, '')}"
                class="px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${cat === 'All' ? 'bg-purple-600/30 border-purple-500 text-purple-200' : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'}"
              >
                ${cat}
              </button>
            `).join('')}
          </div>

          <!-- Topics List -->
          <div class="space-y-2.5 max-h-64 overflow-y-auto pr-1" id="debate-topics-scrollbox">
            ${topics.map((t, idx) => `
              <div 
                onclick="selectDebateTopic('${escapeHtml(t.title)}', '${t.category}', 'topic-card-${idx}', '${escapeHtml(t.for_points || '')}', '${escapeHtml(t.against_points || '')}')" 
                id="topic-card-${idx}" 
                data-category="${t.category}"
                class="p-4 rounded-2xl border cursor-pointer transition-all ${idx === 0 ? 'bg-purple-600/25 border-purple-500/80 text-white shadow-lg shadow-purple-600/20' : 'bg-black/30 border-white/10 text-gray-300 hover:border-white/25 hover:bg-white/[0.03]'}"
              >
                <div class="flex items-center justify-between gap-2 mb-1">
                  <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">${t.category}</span>
                  <span class="text-[10px] text-gray-400 font-medium">Standard Motion</span>
                </div>
                <div class="font-bold text-sm text-white mt-1 leading-snug">${t.title}</div>
                <p class="text-xs text-gray-400 mt-1 leading-relaxed">${t.description || ''}</p>
              </div>
            `).join('')}
          </div>

          <input type="hidden" id="selected-debate-topic" value="${escapeHtml(defaultTopic.title)}" />
          <input type="hidden" id="selected-debate-category" value="${defaultTopic.category}" />
          <input type="hidden" id="selected-debate-for-points" value="${escapeHtml(defaultTopic.for_points || '')}" />
          <input type="hidden" id="selected-debate-against-points" value="${escapeHtml(defaultTopic.against_points || '')}" />
        </div>

        <!-- Custom Topic Option -->
        <div class="pt-1">
          <label class="block text-xs font-semibold text-gray-400 mb-1.5 flex items-center justify-between">
            <span>Or Enter Your Own Custom Debate Motion:</span>
            <span class="text-[10px] text-gray-400">Open Any Topic</span>
          </label>
          <div class="relative">
            <input 
              type="text" 
              id="custom-debate-topic" 
              placeholder="e.g. Is remote work more productive than office work?" 
              class="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors" 
              oninput="handleCustomTopicInput(this.value)" 
            />
          </div>
        </div>

        <!-- Choose Your Stance (Affirmative vs Negative Clash) -->
        <div class="space-y-2.5">
          <label class="block text-xs font-bold uppercase tracking-wider text-gray-300">Choose Your Stance</label>
          <div class="grid grid-cols-2 gap-3 sm:gap-4">
            
            <!-- FOR Card -->
            <div 
              onclick="selectDebateStance('For')" 
              id="stance-for-btn" 
              class="p-4 rounded-2xl border-2 border-emerald-500/70 bg-gradient-to-b from-emerald-950/40 to-black/40 text-white text-center cursor-pointer transition-all hover:scale-[1.02] shadow-xl shadow-emerald-500/20 space-y-1.5"
            >
              <div class="text-3xl">🛡️</div>
              <div class="font-extrabold text-sm text-emerald-300">PROPOSITION (FOR)</div>
              <div class="text-[11px] text-gray-300 leading-tight">I agree with and defend the motion</div>
            </div>

            <!-- AGAINST Card -->
            <div 
              onclick="selectDebateStance('Against')" 
              id="stance-against-btn" 
              class="p-4 rounded-2xl border-2 border-white/10 bg-black/40 text-gray-300 text-center cursor-pointer transition-all hover:scale-[1.02] space-y-1.5"
            >
              <div class="text-3xl">⚔️</div>
              <div class="font-extrabold text-sm text-rose-300">OPPOSITION (AGAINST)</div>
              <div class="text-[11px] text-gray-400 leading-tight">I challenge and oppose the motion</div>
            </div>

          </div>
          <input type="hidden" id="selected-debate-stance" value="For" />

          <!-- Dynamic Strategic Briefing Box based on Selected Stance -->
          <div id="stance-briefing-box" class="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/30 text-xs text-gray-300 space-y-1 transition-all">
            <div class="font-bold text-emerald-300 flex items-center gap-1.5">
              <i data-lucide="lightbulb" class="w-3.5 h-3.5 text-emerald-400"></i>
              <span>Affirmative Tactical Advice:</span>
            </div>
            <p id="stance-briefing-text" class="text-[11px] text-gray-300 leading-relaxed">
              ${escapeHtml(defaultTopic.for_points || 'Focus on structural benefits, evidence, and moral imperative.')}
            </p>
          </div>
        </div>

        <!-- Language & Audio Preference -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">Debate Language</label>
            <select id="debate-language" class="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-400">
              <option value="Hinglish" selected>Hinglish (Natural Mix)</option>
              <option value="English">English</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
              <option value="Bengali">বাংলা (Bengali)</option>
              <option value="Telugu">తెలుగు (Telugu)</option>
            </select>
          </div>

          <div class="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/10">
            <div>
              <div class="text-xs font-bold text-white flex items-center gap-1.5">
                <i data-lucide="volume-2" class="w-4 h-4 text-cyan-400"></i>
                <span>Human Voice Audio</span>
              </div>
              <div class="text-[10px] text-gray-400 mt-0.5">GuruG speaks counter-arguments</div>
            </div>
            <input type="checkbox" id="debate-voice-toggle" checked class="w-4 h-4 accent-purple-600 rounded cursor-pointer" />
          </div>
        </div>

        <!-- Submit Launch Button -->
        <button 
          type="submit" 
          id="start-debate-btn" 
          class="w-full py-4 rounded-2xl font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-sm shadow-xl shadow-purple-600/35 transition-all cursor-pointer flex items-center justify-center gap-2 group active:scale-[0.98]"
        >
          <span>Enter Two-Way Debate Arena</span>
          <i data-lucide="arrow-right" class="w-4 h-4 transition-transform group-hover:translate-x-1"></i>
        </button>

        <!-- Microphone Hardware Diagnostic Link -->
        <div class="text-center pt-1">
          <button type="button" onclick="openMicDiagnosticModal()" class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-cyan-300 hover:text-cyan-200 transition-all cursor-pointer">
            <i data-lucide="mic-vocal" class="w-3.5 h-3.5"></i>
            <span>Test Microphone & Audio Levels Before Starting</span>
          </button>
        </div>

      </form>

    </div>

  </div>
  `;
}

function filterDebateTopics(category) {
  currentDebateCategoryFilter = category;
  const cards = document.querySelectorAll('#debate-topics-scrollbox > div');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    if (category === 'All' || cardCat === category) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });

  const allPills = document.querySelectorAll('[id^="cat-pill-"]');
  allPills.forEach(p => {
    p.className = 'px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all bg-black/30 border-white/10 text-gray-400 hover:text-white';
  });
  const activePill = document.getElementById(`cat-pill-${category.replace(/[^a-zA-Z0-9]/g, '')}`);
  if (activePill) {
    activePill.className = 'px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all bg-purple-600/30 border-purple-500 text-purple-200';
  }
}

function selectDebateTopic(title, category, cardId, forPoints = '', againstPoints = '') {
  const hiddenTopic = document.getElementById('selected-debate-topic');
  const hiddenCat = document.getElementById('selected-debate-category');
  const hiddenFor = document.getElementById('selected-debate-for-points');
  const hiddenAgainst = document.getElementById('selected-debate-against-points');
  const customInput = document.getElementById('custom-debate-topic');

  if (hiddenTopic) hiddenTopic.value = title;
  if (hiddenCat) hiddenCat.value = category;
  if (hiddenFor) hiddenFor.value = forPoints;
  if (hiddenAgainst) hiddenAgainst.value = againstPoints;
  if (customInput) customInput.value = '';

  const allCards = document.querySelectorAll('#debate-topics-scrollbox > div');
  allCards.forEach(c => {
    c.className = 'p-4 rounded-2xl border cursor-pointer transition-all bg-black/30 border-white/10 text-gray-300 hover:border-white/25 hover:bg-white/[0.03]';
  });

  const activeCard = document.getElementById(cardId);
  if (activeCard) {
    activeCard.className = 'p-4 rounded-2xl border cursor-pointer transition-all bg-purple-600/25 border-purple-500/80 text-white shadow-lg shadow-purple-600/20';
  }

  updateStanceBriefingBox();
}

function handleCustomTopicInput(val) {
  if (val.trim()) {
    const hiddenTopic = document.getElementById('selected-debate-topic');
    const hiddenCat = document.getElementById('selected-debate-category');
    if (hiddenTopic) hiddenTopic.value = val.trim();
    if (hiddenCat) hiddenCat.value = "Custom Debate";

    // De-select cards
    const allCards = document.querySelectorAll('#debate-topics-scrollbox > div');
    allCards.forEach(c => {
      c.className = 'p-4 rounded-2xl border cursor-pointer transition-all bg-black/30 border-white/10 text-gray-300 hover:border-white/25 hover:bg-white/[0.03]';
    });

    const hiddenFor = document.getElementById('selected-debate-for-points');
    const hiddenAgainst = document.getElementById('selected-debate-against-points');
    if (hiddenFor) hiddenFor.value = "Present clear reasons, historical examples, and concrete impact arguments.";
    if (hiddenAgainst) hiddenAgainst.value = "Highlight practical bottlenecks, unintended consequences, and alternative solutions.";
    updateStanceBriefingBox();
  }
}

function selectDebateStance(stance) {
  const hidden = document.getElementById('selected-debate-stance');
  if (hidden) hidden.value = stance;

  const forBtn = document.getElementById('stance-for-btn');
  const againstBtn = document.getElementById('stance-against-btn');

  if (stance === 'For') {
    forBtn.className = 'p-4 rounded-2xl border-2 border-emerald-500/70 bg-gradient-to-b from-emerald-950/40 to-black/40 text-white text-center cursor-pointer transition-all hover:scale-[1.02] shadow-xl shadow-emerald-500/20 space-y-1.5';
    againstBtn.className = 'p-4 rounded-2xl border-2 border-white/10 bg-black/40 text-gray-300 text-center cursor-pointer transition-all hover:scale-[1.02] space-y-1.5';
  } else {
    againstBtn.className = 'p-4 rounded-2xl border-2 border-rose-500/70 bg-gradient-to-b from-rose-950/40 to-black/40 text-white text-center cursor-pointer transition-all hover:scale-[1.02] shadow-xl shadow-rose-500/20 space-y-1.5';
    forBtn.className = 'p-4 rounded-2xl border-2 border-white/10 bg-black/40 text-gray-300 text-center cursor-pointer transition-all hover:scale-[1.02] space-y-1.5';
  }

  updateStanceBriefingBox();
}

function updateStanceBriefingBox() {
  const stance = document.getElementById('selected-debate-stance')?.value || 'For';
  const box = document.getElementById('stance-briefing-box');
  const text = document.getElementById('stance-briefing-text');
  const forPoints = document.getElementById('selected-debate-for-points')?.value;
  const againstPoints = document.getElementById('selected-debate-against-points')?.value;

  if (!box || !text) return;

  if (stance === 'For') {
    box.className = 'p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/30 text-xs text-gray-300 space-y-1 transition-all';
    box.querySelector('span').innerText = 'Affirmative Tactical Advice:';
    box.querySelector('span').className = 'text-emerald-300 font-bold';
    text.innerText = forPoints || 'Focus on structural benefits, evidence, and moral imperative.';
  } else {
    box.className = 'p-3.5 rounded-xl bg-rose-950/25 border border-rose-500/30 text-xs text-gray-300 space-y-1 transition-all';
    box.querySelector('span').innerText = 'Opposition Tactical Advice:';
    box.querySelector('span').className = 'text-rose-300 font-bold';
    text.innerText = againstPoints || 'Highlight practical bottlenecks, unintended consequences, and counter-solutions.';
  }
}

async function handleStartDebate(e) {
  e.preventDefault();
  const topic = document.getElementById('selected-debate-topic').value;
  const category = document.getElementById('selected-debate-category').value;
  const stance = document.getElementById('selected-debate-stance').value;
  const language = document.getElementById('debate-language').value;
  const voiceToggle = document.getElementById('debate-voice-toggle').checked;
  const btn = document.getElementById('start-debate-btn');

  btn.disabled = true;
  btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin inline mr-1"></i> Entering Arena...`;
  if (window.lucide) window.lucide.createIcons();

  isVoiceModeEnabled = voiceToggle;

  try {
    const res = await api.startDebate(topic, category, stance, language, 3);
    activeDebateSession = res.session;
    currentDebateRound = 1;
    debateTurnsHistory = [];
    debateScorecardData = null;

    // Add opening statement turn
    debateTurnsHistory.push({
      isOpening: true,
      sender: 'ai',
      ai_rebuttal: res.opening_statement,
      round_number: 0
    });

    const appEl = document.getElementById('app-view');
    if (appEl) {
      appEl.innerHTML = renderDebateArenaView();
      initDebateArena();
      if (typeof window.attachDebateKeyboardListeners === 'function') {
        window.attachDebateKeyboardListeners();
      }
      renderMathInContainer(appEl);
      if (window.lucide) window.lucide.createIcons();
    }

    // Speak opening if voice is enabled
    if (isVoiceModeEnabled) {
      playAIVoice(res.opening_statement, language);
    }
  } catch (err) {
    alert("Could not start debate: " + err.message);
    btn.disabled = false;
    btn.innerHTML = `<span>Enter Two-Way Debate Arena</span> <i data-lucide="arrow-right" class="w-4 h-4"></i>`;
    if (window.lucide) window.lucide.createIcons();
  }
}

function renderDebateArenaView() {
  const s = activeDebateSession;
  const roundsTotal = s.max_rounds || 3;

  return `
  <div class="h-full min-h-screen md:min-h-0 flex flex-col bg-[var(--bg-primary)] overflow-hidden">
    
    <!-- ================================================================= -->
    <!-- 1. TOP ARENA PODIUM BANNER                                        -->
    <!-- ================================================================= -->
    <div class="p-3 sm:px-6 glass-panel border-b border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg bg-[#0B0F17]/95">
      
      <!-- Motion & Matchup Info -->
      <div class="flex items-center gap-3">
        <a href="#/debate" onclick="abandonDebate()" class="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Exit Debate">
          <i data-lucide="chevron-left" class="w-5 h-5"></i>
        </a>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">${s.category || 'Debate'}</span>
            <span class="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-md">${s.topic}</span>
          </div>
          
          <!-- Stance Matchup Badge -->
          <div class="flex items-center gap-2 mt-1 text-[11px]">
            <span class="px-2 py-0.5 rounded-md ${s.student_stance === 'For' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'} font-bold flex items-center gap-1">
              <span>${s.student_stance === 'For' ? '🛡️' : '⚔️'} You: ${s.student_stance}</span>
            </span>
            <span class="text-gray-500 font-bold">VS</span>
            <span class="px-2 py-0.5 rounded-md ${s.ai_stance === 'Against' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'} font-bold flex items-center gap-1">
              <span>${s.ai_stance === 'Against' ? '⚔️' : '🛡️'} GuruG: ${s.ai_stance}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Round Stepper & Control Action Pills -->
      <div class="flex items-center gap-2 sm:gap-3 text-xs">
        
        <!-- Interactive Round Progress Tracker -->
        <div class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs">
          <span class="text-[10px] uppercase font-bold text-gray-400 mr-1">Rounds:</span>
          <span class="px-2 py-0.5 rounded-md ${currentDebateRound >= 1 ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 font-bold' : 'text-gray-500'}">R1</span>
          <span class="text-gray-600">•</span>
          <span class="px-2 py-0.5 rounded-md ${currentDebateRound >= 2 ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 font-bold' : 'text-gray-500'}">R2</span>
          <span class="text-gray-600">•</span>
          <span class="px-2 py-0.5 rounded-md ${currentDebateRound >= 3 ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 font-bold' : 'text-gray-500'}">R3</span>
        </div>

        <!-- Voice Toggle Pill -->
        <button 
          onclick="toggleVoiceMode()" 
          id="voice-mode-pill" 
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${isVoiceModeEnabled ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/25' : 'bg-black/40 border-white/10 text-gray-400'}"
        >
          <i data-lucide="${isVoiceModeEnabled ? 'volume-2' : 'volume-x'}" class="w-3.5 h-3.5"></i>
          <span class="font-bold">Voice: ${isVoiceModeEnabled ? 'ON' : 'OFF'}</span>
        </button>

        <!-- Test Mic Diagnostic -->
        <button 
          onclick="openMicDiagnosticModal()" 
          class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 font-semibold transition-all cursor-pointer" 
          title="Hardware microphone test"
        >
          <i data-lucide="mic-vocal" class="w-3.5 h-3.5"></i>
          <span>Mic Test</span>
        </button>

        <!-- Conclude & Judge Debate Button -->
        <button 
          onclick="concludeActiveDebate()" 
          class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-md shadow-purple-600/25 cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <i data-lucide="award" class="w-3.5 h-3.5"></i>
          <span>Judge Debate</span>
        </button>

      </div>

    </div>

    <!-- ================================================================= -->
    <!-- 2. AUDIO LIVE STATUS BANNER (ACTIVE SPEAKING / RECORDING WAVE)     -->
    <!-- ================================================================= -->
    <div id="audio-live-banner" class="hidden px-4 py-2 bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-cyan-950/80 border-b border-cyan-500/30 flex items-center justify-between text-xs transition-all shadow-md">
      <div class="flex items-center gap-2.5 text-cyan-200" id="audio-live-status-text">
        <div class="debate-soundwave-container">
          <span class="wave-bar"></span>
          <span class="wave-bar"></span>
          <span class="wave-bar"></span>
          <span class="wave-bar"></span>
          <span class="wave-bar"></span>
        </div>
        <span class="font-medium">GuruG is speaking in human voice...</span>
      </div>
      <button onclick="stopAIVoice()" class="text-[11px] text-gray-200 hover:text-white px-2.5 py-1 rounded-lg bg-black/50 border border-white/15 cursor-pointer flex items-center gap-1 font-semibold hover:bg-black/70">
        <span>Stop Audio ⏹️</span>
      </button>
    </div>

    <!-- MIC ERROR OR PERMISSION ALERT BANNER -->
    <div id="debate-mic-error-banner" class="hidden mx-4 mt-2 p-3 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between gap-3 shadow-lg fade-in">
      <div class="flex items-center gap-2">
        <i data-lucide="alert-circle" class="w-4 h-4 text-rose-400 shrink-0"></i>
        <span id="debate-mic-error-text">Microphone error</span>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button type="button" onclick="openMicDiagnosticModal()" class="px-3 py-1 rounded-lg bg-rose-600/40 hover:bg-rose-600 text-[10px] font-bold text-white transition-all cursor-pointer">
          Diagnose Mic
        </button>
        <button type="button" onclick="hideMicErrorBanner()" class="text-rose-400 hover:text-white p-1 cursor-pointer">
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- 3. DEBATE EXCHANGE MESSAGES FEED                                  -->
    <!-- ================================================================= -->
    <div id="debate-feed-container" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      ${debateTurnsHistory.map(turn => renderDebateTurnBubble(turn)).join('')}
    </div>

    <!-- ================================================================= -->
    <!-- 4. TWO-WAY VOICE & ARGUMENT INPUT BAR (THE DEBATE PODIUM)         -->
    <!-- ================================================================= -->
    <div class="p-3 sm:p-4 border-t border-white/10 glass-panel shrink-0 bg-[#0A0D14]/95 shadow-2xl debate-podium-active">
      <div class="max-w-4xl mx-auto space-y-3">
        
        <!-- Strategy Starter Chips (Assists students with formal rhetorical phrases) -->
        <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span class="text-[10px] uppercase font-bold text-purple-400 shrink-0 flex items-center gap-1">
            <i data-lucide="sparkles" class="w-3 h-3"></i> Starters:
          </span>
          <button type="button" onclick="insertDebateStarter('Furthermore, strong empirical evidence demonstrates that ')" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors text-[11px] shrink-0">
            📊 "Furthermore, evidence demonstrates..."
          </button>
          <button type="button" onclick="insertDebateStarter('While that point has merit, in reality ')" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors text-[11px] shrink-0">
            🛡️ "While that has merit, in reality..."
          </button>
          <button type="button" onclick="insertDebateStarter('On the contrary, this argument overlooks the critical factor that ')" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors text-[11px] shrink-0">
            ⚡ "On the contrary, this overlooks..."
          </button>
          <button type="button" onclick="insertDebateStarter('To counter that premise directly, ')" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-colors text-[11px] shrink-0">
            🎯 "To counter that directly..."
          </button>
        </div>

        <!-- Input Box with Pulsing Mic Button & Space Push-to-Talk -->
        <form onsubmit="handleSendDebateArgument(event)" class="space-y-2">
          <div class="relative flex items-end gap-2 bg-[#121824] border border-white/15 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 rounded-2xl p-2 shadow-2xl transition-all">
            
            <!-- Pulsing Microphone Button for Speech Input -->
            <button 
              type="button" 
              onclick="toggleSpeechRecognition()" 
              id="debate-mic-btn" 
              class="p-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 transition-all shrink-0 flex items-center justify-center cursor-pointer active:scale-95 shadow-md" 
              title="Speak Argument (Speech-to-Text)"
            >
              <i data-lucide="mic" class="w-5 h-5" id="debate-mic-icon"></i>
            </button>

            <!-- Clickable Space Push-to-Talk Button -->
            <button 
              type="button" 
              onclick="toggleSpeechRecognition()" 
              id="debate-space-btn" 
              class="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-black/40 hover:bg-white/10 text-purple-200 border border-white/10 text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95" 
              title="Click or press Spacebar to toggle microphone"
            >
              <span class="px-1.5 py-0.5 rounded bg-purple-900/70 border border-purple-500/40 text-[10px] font-mono text-cyan-300 font-bold">SPACE</span>
              <span id="debate-space-btn-text">Click / Space to Speak</span>
            </button>

            <!-- Textarea (Transcribes voice live or manual typing) -->
            <textarea 
              id="debate-argument-input"
              rows="2"
              placeholder="Deliver your counterargument (press Space to speak, or type here)..."
              class="w-full bg-transparent text-sm text-white placeholder-gray-400 px-2.5 py-1.5 focus:outline-none resize-none max-h-36 leading-relaxed"
              onkeydown="handleDebateInputKeydown(event)"
            ></textarea>

            <!-- Send Button -->
            <button 
              type="submit" 
              id="debate-send-btn" 
              class="p-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg shadow-purple-600/30 transition-all shrink-0 cursor-pointer font-bold active:scale-95" 
              title="Deliver Argument (or press Enter)"
            >
              <i data-lucide="send" class="w-5 h-5"></i>
            </button>
          </div>

          <!-- Helpful keyboard shortcut hint & Hands-free switch -->
          <div class="flex items-center justify-between px-2 text-[11px] text-gray-400">
            <span class="flex items-center gap-1.5">
              <kbd class="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[10px] text-purple-300">Space</kbd>
              <span>Toggle Mic</span>
              <span class="text-gray-600">•</span>
              <kbd class="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[10px] text-purple-300">Enter</kbd>
              <span>Deliver Argument</span>
            </span>

            <label class="flex items-center gap-1.5 cursor-pointer text-gray-400 hover:text-gray-200">
              <input type="checkbox" id="hands-free-toggle" ${isHandsFreeAutoListen ? 'checked' : ''} onchange="isHandsFreeAutoListen = this.checked;" class="w-3.5 h-3.5 accent-cyan-400 rounded cursor-pointer" />
              <span class="text-[11px]">Hands-Free Auto-Listen</span>
            </label>
          </div>
        </form>

      </div>
    </div>

  </div>
  `;
}

function renderDebateTurnBubble(turn) {
  if (turn.isOpening) {
    return `
      <div class="flex items-start gap-3 fade-in max-w-3xl">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg shadow-purple-500/20">
          G
        </div>
        <div class="bg-[#121824] border border-cyan-500/30 rounded-2xl rounded-tl-sm p-4 sm:p-5 text-sm text-gray-200 space-y-3 flex-1 shadow-xl">
          <div class="flex items-center justify-between pb-2.5 border-b border-white/10 text-xs">
            <span class="font-bold text-cyan-300 flex items-center gap-2">
              <i data-lucide="radio" class="w-4 h-4 text-purple-400 animate-pulse"></i>
              <span>Opening Statement by GuruG</span>
            </span>
            <button onclick="playAIVoice('${escapeHtml(turn.ai_rebuttal)}', '${activeDebateSession?.language || 'English'}')" class="p-1 rounded text-gray-400 hover:text-cyan-300 transition-colors" title="Replay Opening Statement Voice">
              <i data-lucide="volume-2" class="w-4 h-4"></i>
            </button>
          </div>
          <div class="leading-relaxed text-xs sm:text-sm text-gray-200">
            ${formatMarkdown(turn.ai_rebuttal)}
          </div>
        </div>
      </div>
    `;
  }

  const wordCount = (turn.student_argument || '').trim().split(/\s+/).filter(Boolean).length;

  return `
    <div class="space-y-4 fade-in">
      
      <!-- Student's Argument Bubble -->
      <div class="flex items-start gap-3 justify-end">
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 sm:px-5 py-3 text-sm max-w-2xl shadow-xl">
          <div class="flex items-center justify-between text-[11px] text-purple-200 mb-1.5 font-semibold pb-1 border-b border-white/10">
            <span>Your Argument (Round ${turn.round_number})</span>
            <div class="flex items-center gap-2">
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-purple-200 font-mono">${wordCount} words</span>
              <span>🛡️ ${activeDebateSession?.student_stance || 'Affirmative'}</span>
            </div>
          </div>
          <p class="leading-relaxed whitespace-pre-wrap text-xs sm:text-sm text-white">${escapeHtml(turn.student_argument)}</p>
        </div>
        <div class="w-9 h-9 rounded-xl bg-purple-700 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md">
          ${(api.user?.display_name || 'U')[0]}
        </div>
      </div>

      <!-- GuruG's Counter Rebuttal Bubble -->
      <div class="flex items-start gap-3 max-w-3xl">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg shadow-purple-500/25">
          G
        </div>
        <div class="bg-[#121824] border border-white/10 rounded-2xl rounded-tl-sm p-4 sm:p-5 text-sm text-gray-200 space-y-3.5 flex-1 shadow-xl">
          
          <!-- Top Bar -->
          <div class="flex items-center justify-between pb-2.5 border-b border-white/5 text-xs">
            <div class="flex items-center gap-2">
              <span class="font-bold text-cyan-300">GuruG Counter-Rebuttal</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">Round ${turn.round_number} Clash</span>
            </div>
            <button onclick="playAIVoice('${escapeHtml(turn.ai_rebuttal + ' ' + (turn.counter_question || ''))}', '${activeDebateSession?.language || 'English'}')" class="p-1 rounded text-gray-400 hover:text-cyan-300 transition-colors" title="Replay Voice">
              <i data-lucide="volume-2" class="w-4 h-4"></i>
            </button>
          </div>

          <!-- Points Conceded Banner (Highlights intellectual honesty in debate) -->
          ${turn.points_conceded ? `
            <div class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 flex items-start gap-2 shadow-sm">
              <span class="font-bold text-emerald-400">✓ Point Conceded by GuruG:</span>
              <span class="leading-relaxed">${turn.points_conceded}</span>
            </div>
          ` : ''}

          <!-- Main Rebuttal Content -->
          <div class="leading-relaxed text-xs sm:text-sm text-gray-200 space-y-2">
            ${formatMarkdown(turn.ai_rebuttal)}
          </div>

          <!-- Counter-Challenge Question -->
          ${turn.counter_question ? `
            <div class="p-3.5 rounded-xl bg-purple-950/35 border border-purple-500/35 text-xs text-purple-200 space-y-2 shadow-inner">
              <div class="font-bold text-purple-300 flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                  <i data-lucide="help-circle" class="w-3.5 h-3.5 text-cyan-400"></i>
                  <span>Opposing Challenge Question:</span>
                </span>
                <button 
                  type="button" 
                  onclick="replyToCounterQuestion('${escapeHtml(turn.counter_question)}')" 
                  class="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-all cursor-pointer"
                >
                  💬 Answer Challenge
                </button>
              </div>
              <p class="leading-relaxed text-purple-100">${turn.counter_question}</p>
            </div>
          ` : ''}

        </div>
      </div>

    </div>
  `;
}

function insertDebateStarter(phrase) {
  const input = document.getElementById('debate-argument-input');
  if (input) {
    input.value = (input.value.trim() ? input.value.trim() + " " : "") + phrase;
    input.focus();
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 140) + 'px';
  }
}

function replyToCounterQuestion(questionText) {
  const input = document.getElementById('debate-argument-input');
  if (input) {
    input.value = `In response to your challenge question, `;
    input.focus();
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 140) + 'px';
  }
}

function initDebateArena() {
  const langMap = {
    'English': 'en-IN',
    'Hinglish': 'hi-IN',
    'Hindi': 'hi-IN',
    'Tamil': 'ta-IN',
    'Bengali': 'bn-IN',
    'Telugu': 'te-IN'
  };
  const code = langMap[activeDebateSession?.language || 'English'] || 'en-IN';

  VoiceInput.init(
    (transcript, interim, finalPart) => {
      const input = document.getElementById('debate-argument-input');
      if (input) {
        input.value = transcript;
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 140) + 'px';
      }
    },
    (listening, err) => {
      isStudentListening = listening;
      updateMicButtonUI(listening, err);
      if (err) {
        console.warn("Speech error:", err);
        showMicErrorBanner(err);
      } else {
        hideMicErrorBanner();
      }
    },
    code
  );
}

function toggleSpeechRecognition() {
  if (isStudentListening) {
    VoiceInput.stop();
    updateMicButtonUI(false);
  } else {
    stopAIVoice();
    hideMicErrorBanner();
    const input = document.getElementById('debate-argument-input');
    const baseText = input ? input.value : '';
    const started = VoiceInput.start(baseText);
    if (!started && !VoiceInput.isSupported()) {
      showMicErrorBanner("Speech Recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.");
    }
  }
}

function updateMicButtonUI(isListening, err) {
  const btn = document.getElementById('debate-mic-btn');
  const spaceBtn = document.getElementById('debate-space-btn');
  const spaceText = document.getElementById('debate-space-btn-text');

  if (isListening) {
    if (btn) {
      btn.className = 'p-3 rounded-xl bg-rose-600 text-white debate-mic-glow-recording shadow-lg shadow-rose-600/50 transition-all shrink-0 flex items-center justify-center cursor-pointer';
      btn.title = "Listening... Click or press Space to stop speaking";
    }
    if (spaceBtn) {
      spaceBtn.className = 'hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-600 text-white border border-rose-400 debate-mic-glow-recording text-xs font-bold transition-all shrink-0 cursor-pointer shadow-lg shadow-rose-600/30';
    }
    if (spaceText) {
      spaceText.innerText = 'Stop Speaking (Space)';
    }
    showAudioBanner("🎙️ Listening to your voice... Speak your argument! (Press [Space] when done)", true);
  } else {
    if (btn) {
      btn.className = 'p-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 transition-all shrink-0 flex items-center justify-center cursor-pointer';
      btn.title = "Speak Argument (Speech-to-Text)";
    }
    if (spaceBtn) {
      spaceBtn.className = 'hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-black/40 hover:bg-white/10 text-purple-200 border border-white/10 text-xs font-bold transition-all shrink-0 cursor-pointer';
    }
    if (spaceText) {
      spaceText.innerText = 'Click / Space to Speak';
    }
    hideAudioBanner();
  }
}

function showMicErrorBanner(msg) {
  const banner = document.getElementById('debate-mic-error-banner');
  const text = document.getElementById('debate-mic-error-text');
  if (banner && text) {
    text.innerText = msg;
    banner.classList.remove('hidden');
  }
}

function hideMicErrorBanner() {
  const banner = document.getElementById('debate-mic-error-banner');
  if (banner) banner.classList.add('hidden');
}

function handleDebateInputKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSendDebateArgument(event);
    return;
  }

  if (event.code === 'Space' && event.target.value.trim() === '') {
    event.preventDefault();
    toggleSpeechRecognition();
    return;
  }

  if (event.code === 'Space' && (event.ctrlKey || event.altKey)) {
    event.preventDefault();
    toggleSpeechRecognition();
    return;
  }
}

function handleGlobalDebateKeydown(e) {
  if (window.location.hash !== '#/debate' || !activeDebateSession) return;

  if (e.code === 'Space') {
    const target = e.target;
    const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

    if (!isInput) {
      e.preventDefault();
      toggleSpeechRecognition();
      return;
    }
  }

  if (e.code === 'Escape') {
    if (isStudentListening) {
      VoiceInput.stop();
    }
    if (isGuruGSpeaking) {
      stopAIVoice();
    }
    closeMicDiagnosticModal();
  }
}

window.attachDebateKeyboardListeners = function() {
  window.removeEventListener('keydown', handleGlobalDebateKeydown);
  window.addEventListener('keydown', handleGlobalDebateKeydown);
  if (activeDebateSession) {
    initDebateArena();
  }
};

window.detachDebateKeyboardListeners = function() {
  window.removeEventListener('keydown', handleGlobalDebateKeydown);
  if (isStudentListening) {
    VoiceInput.stop();
  }
  if (isGuruGSpeaking) {
    stopAIVoice();
  }
  closeMicDiagnosticModal();
};

function playAIVoice(text, lang) {
  if (!isVoiceModeEnabled) return;

  showAudioBanner("🔊 GuruG AI is speaking counterargument in human voice...", false);
  isGuruGSpeaking = true;

  TTS.speak(
    text,
    lang,
    () => {
      isGuruGSpeaking = true;
    },
    () => {
      isGuruGSpeaking = false;
      hideAudioBanner();

      if (isHandsFreeAutoListen && activeDebateSession) {
        setTimeout(() => {
          showAudioBanner("👉 Your turn to counter! Mic activated (hands-free)...", true);
          VoiceInput.start();
        }, 500);
      }
    }
  );
}

function stopAIVoice() {
  TTS.stop();
  isGuruGSpeaking = false;
  hideAudioBanner();
}

function showAudioBanner(msg, isUser) {
  const banner = document.getElementById('audio-live-banner');
  const text = document.getElementById('audio-live-status-text');
  if (banner && text) {
    text.innerHTML = `
      <div class="debate-soundwave-container">
        <span class="wave-bar"></span>
        <span class="wave-bar"></span>
        <span class="wave-bar"></span>
        <span class="wave-bar"></span>
        <span class="wave-bar"></span>
      </div>
      <span class="font-medium">${msg}</span>
    `;
    banner.classList.remove('hidden');
  }
}

function hideAudioBanner() {
  const banner = document.getElementById('audio-live-banner');
  if (banner) banner.classList.add('hidden');
}

function toggleVoiceMode() {
  isVoiceModeEnabled = !isVoiceModeEnabled;
  if (!isVoiceModeEnabled) {
    stopAIVoice();
  }
  const pill = document.getElementById('voice-mode-pill');
  if (pill) {
    pill.className = `flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${isVoiceModeEnabled ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/25' : 'bg-black/40 border-white/10 text-gray-400'}`;
    pill.innerHTML = `
      <i data-lucide="${isVoiceModeEnabled ? 'volume-2' : 'volume-x'}" class="w-3.5 h-3.5"></i>
      <span class="font-bold">Voice: ${isVoiceModeEnabled ? 'ON' : 'OFF'}</span>
    `;
    if (window.lucide) window.lucide.createIcons();
  }
}

async function handleSendDebateArgument(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('debate-argument-input');
  const argument = input.value.trim();
  if (!argument) return;

  VoiceInput.stop();
  input.value = '';
  input.style.height = 'auto';

  const btn = document.getElementById('debate-send-btn');
  btn.disabled = true;

  const container = document.getElementById('debate-feed-container');

  const studentTurnData = {
    round_number: currentDebateRound,
    student_argument: argument,
    ai_rebuttal: "GuruG is analyzing your argument and preparing a factual counter-rebuttal...",
    points_conceded: "",
    counter_question: ""
  };
  debateTurnsHistory.push(studentTurnData);

  if (container) {
    container.insertAdjacentHTML('beforeend', renderDebateTurnBubble(studentTurnData));
    container.scrollTop = container.scrollHeight;
    if (window.lucide) window.lucide.createIcons();
  }

  try {
    const res = await api.sendDebateTurn(
      activeDebateSession.id,
      argument,
      currentDebateRound,
      activeDebateSession.language || 'English'
    );

    debateTurnsHistory[debateTurnsHistory.length - 1] = res;

    if (container) {
      container.innerHTML = debateTurnsHistory.map(t => renderDebateTurnBubble(t)).join('');
      container.scrollTop = container.scrollHeight;
      renderMathInContainer(container);
      if (window.lucide) window.lucide.createIcons();
    }

    if (currentDebateRound < (activeDebateSession.max_rounds || 3)) {
      currentDebateRound++;
    }

    if (isVoiceModeEnabled) {
      playAIVoice(res.ai_rebuttal + (res.counter_question ? " " + res.counter_question : ""), activeDebateSession.language || 'English');
    }

  } catch (err) {
    alert("Error processing debate turn: " + err.message);
  } finally {
    btn.disabled = false;
  }
}

async function concludeActiveDebate() {
  if (!confirm("Are you ready to submit your debate to the AI Adjudicator for evaluation and scoring?")) return;
  stopAIVoice();
  VoiceInput.stop();

  try {
    const scorecard = await api.concludeDebate(activeDebateSession.id);
    debateScorecardData = scorecard;
    const appEl = document.getElementById('app-view');
    if (appEl) {
      appEl.innerHTML = renderDebateScorecardView();
      renderMathInContainer(appEl);
      if (window.lucide) window.lucide.createIcons();
    }
  } catch (err) {
    alert("Could not adjudicate debate: " + err.message);
  }
}

function renderDebateScorecardView() {
  const sc = debateScorecardData;
  const isWinner = sc.overall_score >= 80;

  return `
  <div class="max-w-3xl mx-auto px-4 py-8 space-y-8 fade-in">
    
    <!-- Hero Scorecard Card -->
    <div class="glass-panel-elevated rounded-3xl p-8 sm:p-10 border ${isWinner ? 'border-cyan-500/40' : 'border-purple-500/40'} text-center space-y-6 glow-cyan shadow-2xl bg-[#0F1422]">
      
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${isWinner ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/35' : 'bg-purple-500/20 text-purple-300 border border-purple-500/35'} text-xs font-black uppercase tracking-wider">
        <span>🏆 ${sc.verdict}</span>
      </div>

      <div>
        <div class="text-6xl sm:text-7xl font-black text-white tracking-tight">
          ${sc.overall_score}<span class="text-3xl text-gray-400 font-medium">/100</span>
        </div>
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1.5">
          Adjudicated Score Across ${sc.rounds_completed} Clash Rounds
        </p>
      </div>

      <div class="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed italic">
        "${sc.judge_commentary}"
      </div>

      <!-- 4 Pillars Breakdown with Visual Progress Gauges -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2 text-xs">
        
        <div class="p-3.5 rounded-2xl bg-black/50 border border-cyan-500/25 space-y-2">
          <div class="flex items-center justify-between text-gray-400 text-[10px] font-bold">
            <span>Logic & Reasoning</span>
            <span class="text-cyan-400 font-extrabold text-sm">${sc.logic_score}/10</span>
          </div>
          <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style="width: ${sc.logic_score * 10}%;"></div>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-black/50 border border-purple-500/25 space-y-2">
          <div class="flex items-center justify-between text-gray-400 text-[10px] font-bold">
            <span>Factual Evidence</span>
            <span class="text-purple-400 font-extrabold text-sm">${sc.evidence_score}/10</span>
          </div>
          <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" style="width: ${sc.evidence_score * 10}%;"></div>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-black/50 border border-emerald-500/25 space-y-2">
          <div class="flex items-center justify-between text-gray-400 text-[10px] font-bold">
            <span>Rebuttal Quality</span>
            <span class="text-emerald-400 font-extrabold text-sm">${sc.rebuttal_score}/10</span>
          </div>
          <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style="width: ${sc.rebuttal_score * 10}%;"></div>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-black/50 border border-amber-500/25 space-y-2">
          <div class="flex items-center justify-between text-gray-400 text-[10px] font-bold">
            <span>Civility & Delivery</span>
            <span class="text-amber-400 font-extrabold text-sm">${sc.civility_score}/10</span>
          </div>
          <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400" style="width: ${sc.civility_score * 10}%;"></div>
          </div>
        </div>

      </div>

      <!-- Action buttons -->
      <div class="flex flex-wrap items-center justify-center gap-3 pt-4">
        <button onclick="resetDebateState()" class="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-xs shadow-xl shadow-purple-600/30 transition-all cursor-pointer active:scale-95 flex items-center gap-2">
          <i data-lucide="swords" class="w-4 h-4"></i>
          <span>Debate Another Topic</span>
        </button>
        <a href="#/dashboard" class="px-5 py-3 rounded-xl font-semibold glass-panel text-gray-300 hover:text-white text-xs transition-colors flex items-center gap-2">
          <i data-lucide="home" class="w-4 h-4"></i>
          <span>Return to Dashboard</span>
        </a>
      </div>

    </div>

    <!-- Strengths & Areas to Polish -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      
      <div class="glass-panel p-5 rounded-2xl border border-emerald-500/25 bg-emerald-950/15 space-y-2.5">
        <div class="text-xs font-bold text-emerald-400 flex items-center gap-2">
          <i data-lucide="check-circle" class="w-4 h-4"></i>
          <span>Key Strengths Observed</span>
        </div>
        <ul class="text-xs text-gray-300 space-y-2 list-disc ml-4 leading-relaxed">
          ${sc.strengths.map(st => `<li>${st}</li>`).join('')}
        </ul>
      </div>

      <div class="glass-panel p-5 rounded-2xl border border-amber-500/25 bg-amber-950/15 space-y-2.5">
        <div class="text-xs font-bold text-amber-400 flex items-center gap-2">
          <i data-lucide="trending-up" class="w-4 h-4"></i>
          <span>Areas to Polish Next Time</span>
        </div>
        <ul class="text-xs text-gray-300 space-y-2 list-disc ml-4 leading-relaxed">
          ${sc.areas_for_improvement.map(ar => `<li>${ar}</li>`).join('')}
        </ul>
      </div>

    </div>

  </div>
  `;
}

function abandonDebate() {
  stopAIVoice();
  VoiceInput.stop();
  activeDebateSession = null;
  debateTurnsHistory = [];
  debateScorecardData = null;
}

function resetDebateState() {
  abandonDebate();
  window.location.hash = '#/debate';
}

// ---------------------------------------------------------------------
// Microphone Diagnostic & Hardware Tester
// ---------------------------------------------------------------------

let currentMicTestHandle = null;
let testRecognitionInstance = null;

async function openMicDiagnosticModal() {
  let modal = document.getElementById('mic-diagnostic-modal');
  if (!modal) {
    const modalHTML = `
      <div id="mic-diagnostic-modal" class="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4 fade-in">
        <div class="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/20 max-w-lg w-full space-y-6 glow-cyan bg-[#0F1420]">
          
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <i data-lucide="mic-vocal" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="text-base font-bold text-white">Microphone Hardware & Diagnostic Check</h3>
                <p class="text-xs text-gray-400">Verify audio input, volume levels, and browser speech recognition</p>
              </div>
            </div>
            <button onclick="closeMicDiagnosticModal()" class="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>

          <!-- Diagnostic Checkpoints -->
          <div class="space-y-3.5 text-xs">
            
            <!-- Check 1: Browser Web Speech API -->
            <div class="flex items-center justify-between p-3.5 rounded-xl bg-black/50 border border-white/10">
              <span class="text-gray-300 font-semibold">1. Browser Speech Recognition (STT)</span>
              <span id="diag-speech-status" class="px-2.5 py-0.5 rounded text-[11px] font-bold bg-white/10 text-gray-300">Checking...</span>
            </div>

            <!-- Check 2: Microphone Device & Permission -->
            <div class="flex items-center justify-between p-3.5 rounded-xl bg-black/50 border border-white/10">
              <span class="text-gray-300 font-semibold">2. Hardware Device & Permission</span>
              <span id="diag-mic-status" class="px-2.5 py-0.5 rounded text-[11px] font-bold bg-white/10 text-gray-300">Requesting access...</span>
            </div>

            <!-- Check 3: Live Audio Level VU Meter -->
            <div class="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2">
              <div class="flex items-center justify-between font-semibold">
                <span class="text-gray-300">3. Live Microphone Volume Level (VU Meter)</span>
                <span id="diag-volume-text" class="text-cyan-400 font-mono font-bold">0%</span>
              </div>
              
              <!-- Real-time Meter Bar -->
              <div class="w-full h-3.5 rounded-full bg-white/10 overflow-hidden relative border border-white/5">
                <div id="diag-volume-bar" class="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-rose-500 vu-meter-bar" style="width: 0%;"></div>
              </div>
              <p class="text-[10px] text-gray-400">Speak into your microphone now. If the colored bar moves, your microphone is working perfectly.</p>
            </div>

            <!-- Check 4: Real-time Speech-to-Text Test Box -->
            <div class="p-3.5 rounded-xl bg-purple-950/25 border border-purple-500/25 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-purple-300">4. Live Speech Transcription Test:</span>
                <button type="button" id="diag-stt-btn" onclick="testLiveSTTInModal()" class="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-[10px] font-bold text-white shadow-md transition-all cursor-pointer">
                  🎙️ Test Live Dictation
                </button>
              </div>
              <div id="diag-transcript-preview" class="p-2.5 rounded-lg bg-black/60 border border-white/5 text-gray-300 font-mono text-[11px] min-h-[44px] leading-relaxed">
                (Click "Test Live Dictation" and say "Hello GuruG" to verify transcription...)
              </div>
            </div>

            <!-- Error Troubleshooting Box (hidden by default) -->
            <div id="diag-error-box" class="hidden p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 space-y-2">
              <div class="font-bold flex items-center gap-1.5 text-rose-300">
                <i data-lucide="alert-triangle" class="w-4 h-4 text-rose-400"></i>
                <span>Microphone Access Blocked or Not Detected</span>
              </div>
              <p id="diag-error-msg" class="text-[11px] leading-relaxed"></p>
              <div class="pt-1 text-[10px] text-rose-300/80 space-y-0.5 border-t border-rose-500/20">
                <div>• In Chrome/Edge: Click the padlock or camera icon on the left of your URL address bar.</div>
                <div>• Set "Microphone" to <strong>Allow</strong>, then refresh the page.</div>
                <div>• On Windows: Ensure <em>Settings > Privacy & Security > Microphone</em> is enabled.</div>
              </div>
            </div>

          </div>

          <div class="flex justify-end pt-2">
            <button onclick="closeMicDiagnosticModal()" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 cursor-pointer">
              Done & Return to Arena
            </button>
          </div>

        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    modal = document.getElementById('mic-diagnostic-modal');
  } else {
    modal.classList.remove('hidden');
  }
  if (window.lucide) window.lucide.createIcons();

  runMicDiagnostic();
}

async function runMicDiagnostic() {
  const speechBadge = document.getElementById('diag-speech-status');
  const micBadge = document.getElementById('diag-mic-status');
  const volumeBar = document.getElementById('diag-volume-bar');
  const volumeText = document.getElementById('diag-volume-text');
  const errBox = document.getElementById('diag-error-box');
  const errMsg = document.getElementById('diag-error-msg');

  // Check 1: Web Speech API
  const hasSTT = VoiceInput.isSupported();
  if (speechBadge) {
    if (hasSTT) {
      speechBadge.className = 'px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      speechBadge.innerText = 'Supported ✓';
    } else {
      speechBadge.className = 'px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30';
      speechBadge.innerText = 'Not Supported (Use Chrome/Edge)';
    }
  }

  // Check 2 & 3: Hardware access & VU meter
  if (currentMicTestHandle) {
    currentMicTestHandle.stopTest();
    currentMicTestHandle = null;
  }

  const res = await VoiceInput.testMicrophone((percent) => {
    if (volumeBar) volumeBar.style.width = percent + '%';
    if (volumeText) volumeText.innerText = percent + '%';
  });

  if (res.ok) {
    currentMicTestHandle = res;
    if (micBadge) {
      micBadge.className = 'px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      micBadge.innerText = 'Connected & Active ✓';
    }
    if (errBox) errBox.classList.add('hidden');
  } else {
    if (micBadge) {
      micBadge.className = 'px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30';
      micBadge.innerText = 'Access Failed ✗';
    }
    if (errBox && errMsg) {
      errMsg.innerText = res.error || 'Microphone device could not be opened.';
      errBox.classList.remove('hidden');
    }
  }
}

function testLiveSTTInModal() {
  const btn = document.getElementById('diag-stt-btn');
  const preview = document.getElementById('diag-transcript-preview');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (preview) preview.innerText = 'Speech Recognition is not available in this browser. Please open in Google Chrome or Microsoft Edge.';
    return;
  }

  if (testRecognitionInstance) {
    try {
      testRecognitionInstance.stop();
    } catch (e) {}
    testRecognitionInstance = null;
    if (btn) {
      btn.innerText = '🎙️ Test Live Dictation';
      btn.className = 'px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-[10px] font-bold text-white shadow-md transition-all cursor-pointer';
    }
    return;
  }

  try {
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = activeDebateSession?.language === 'Hindi' ? 'hi-IN' : 'en-IN';

    rec.onstart = () => {
      if (btn) {
        btn.innerText = '⏹️ Stop Testing';
        btn.className = 'px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-[10px] font-bold text-white shadow-md transition-all cursor-pointer animate-pulse';
      }
      if (preview) {
        preview.innerText = '🎙️ Listening... Say "Hello GuruG" or speak any sentence!';
      }
    };

    rec.onresult = (e) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      if (preview) {
        preview.innerHTML = `<strong>Heard:</strong> "${text}"`;
      }
    };

    rec.onerror = (e) => {
      if (preview) {
        preview.innerHTML = `<span class="text-rose-400">Error: ${e.error}</span>`;
      }
    };

    rec.onend = () => {
      testRecognitionInstance = null;
      if (btn) {
        btn.innerText = '🎙️ Test Live Dictation';
        btn.className = 'px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-[10px] font-bold text-white shadow-md transition-all cursor-pointer';
      }
    };

    testRecognitionInstance = rec;
    rec.start();
  } catch (err) {
    if (preview) {
      preview.innerText = `Could not start test: ${err.message}`;
    }
  }
}

function closeMicDiagnosticModal() {
  if (currentMicTestHandle) {
    currentMicTestHandle.stopTest();
    currentMicTestHandle = null;
  }
  if (testRecognitionInstance) {
    try {
      testRecognitionInstance.stop();
    } catch (e) {}
    testRecognitionInstance = null;
  }
  const modal = document.getElementById('mic-diagnostic-modal');
  if (modal) modal.classList.add('hidden');
}
