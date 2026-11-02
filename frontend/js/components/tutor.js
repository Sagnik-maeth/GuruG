/**
 * GuruG Core Multilingual AI Tutor Component
 */

let currentTutorSessionId = null;
let currentTutorMessages = [];
let currentTutorLanguage = 'Hinglish';
let currentTutorMode = 'Simple Explanation';
let currentTutorSubject = 'General';

async function renderTutor() {
  const user = api.user || {};
  currentTutorLanguage = user.preferred_language || 'Hinglish';

  // Check if routed with a pre-filled subject or question
  const pendingSubject = sessionStorage.getItem('gurug_target_subject');
  if (pendingSubject) {
    currentTutorSubject = pendingSubject;
    sessionStorage.removeItem('gurug_target_subject');
  }

  const pendingQuestion = sessionStorage.getItem('gurug_pending_question');
  if (pendingQuestion) {
    sessionStorage.removeItem('gurug_pending_question');
    setTimeout(() => {
      sendTutorPrompt(pendingQuestion);
    }, 400);
  }

  let sessions = [];
  try {
    sessions = await api.getChatSessions();
    if (sessions && sessions.length > 0 && !currentTutorSessionId) {
      currentTutorSessionId = sessions[0].id;
      currentTutorMessages = await api.getSessionMessages(currentTutorSessionId);
    }
  } catch (err) {
    console.warn("Could not load past tutor sessions:", err);
  }

  const languages = [
    { code: "Hinglish", name: "Hinglish (Mix)" },
    { code: "Hindi", name: "हिन्दी (Hindi)" },
    { code: "English", name: "English" },
    { code: "Bengali", name: "বাংলা (Bengali)" },
    { code: "Tamil", name: "தமிழ் (Tamil)" },
    { code: "Telugu", name: "తెలుగు (Telugu)" },
    { code: "Kannada", name: "ಕನ್ನಡ (Kannada)" },
    { code: "Marathi", name: "मराठी (Marathi)" },
    { code: "Gujarati", name: "ગુજરાતી (Gujarati)" },
    { code: "Malayalam", name: "മലയാളം (Malayalam)" },
    { code: "Urdu", name: "اردو (Urdu)" }
  ];

  const modes = [
    { id: "Simple Explanation", label: "💡 Simple" },
    { id: "Detailed Explanation", label: "📖 Detailed" },
    { id: "Step-by-Step", label: "🔢 Step-by-Step" },
    { id: "Explain Like I'm 10", label: "🐣 ELI10" },
    { id: "Real-Life Examples", label: "🌍 Real-Life" },
    { id: "Exam Preparation", label: "🎯 Exam Prep" }
  ];

  return `
  <div class="h-full min-h-screen md:min-h-0 flex flex-col md:flex-row overflow-hidden bg-[var(--bg-primary)]">
    
    <!-- LEFT SIDEBAR: CONVERSATION HISTORY -->
    <aside id="tutor-sidebar" class="hidden md:flex flex-col w-72 glass-panel border-r border-white/10 p-3 h-full shrink-0">
      
      <!-- New Chat Button -->
      <button onclick="startNewTutorChat()" class="w-full py-2.5 px-4 rounded-xl font-bold bg-white/10 hover:bg-white/15 text-white text-xs border border-white/10 flex items-center justify-center gap-2 shadow-sm transition-all mb-4 cursor-pointer">
        <i data-lucide="plus" class="w-4 h-4 text-purple-400"></i>
        <span>New Conversation</span>
      </button>

      <!-- Sessions List -->
      <div class="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-2 flex items-center justify-between">
        <span>Recent Chats</span>
        <span class="text-[10px] text-purple-300" id="sessions-count">${sessions.length}</span>
      </div>

      <div class="flex-1 overflow-y-auto space-y-1 pr-1" id="tutor-sessions-list">
        ${renderSessionsListHtml(sessions)}
      </div>

      <!-- Clear Chat Footer -->
      <div class="pt-3 border-t border-white/10">
        <button onclick="clearCurrentChat()" class="w-full py-2 px-3 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs flex items-center justify-center gap-1.5 transition-colors">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          <span>Clear Current Chat</span>
        </button>
      </div>

    </aside>

    <!-- MAIN CHAT CANVAS -->
    <main class="flex-1 flex flex-col h-full overflow-hidden relative">
      
      <!-- CHAT TOOLBAR & CONTROLS -->
      <div class="p-3 sm:px-6 border-b border-white/10 glass-panel flex flex-wrap items-center justify-between gap-3 shrink-0">
        
        <!-- Left: Language Selector -->
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-gray-300 flex items-center gap-1">
            <i data-lucide="languages" class="w-4 h-4 text-cyan-400"></i>
            <span class="hidden sm:inline">Language:</span>
          </span>
          <select id="tutor-language-select" onchange="changeTutorLanguage(this.value)" class="bg-[#121824] border border-white/20 text-xs font-semibold text-cyan-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-400">
            ${languages.map(l => `
              <option value="${l.code}" ${l.code === currentTutorLanguage ? 'selected' : ''}>${l.name}</option>
            `).join('')}
          </select>
        </div>

        <!-- Middle: Explanation Mode Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          ${modes.map(m => `
            <button onclick="changeTutorMode('${m.id}')" id="mode-btn-${m.id.replace(/\s+/g, '-')}" class="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${m.id === currentTutorMode ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-black/30 border border-white/10 text-gray-300 hover:text-white hover:border-white/20'}">
              ${m.label}
            </button>
          `).join('')}
        </div>

        <!-- Right: Mobile Drawer Toggle & Voice Toggle -->
        <div class="flex items-center gap-2">
          <button onclick="toggleAudioSpeech()" id="audio-toggle-btn" class="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors" title="Audio Read-Aloud (Text-to-Speech)">
            <i data-lucide="volume-2" class="w-4 h-4"></i>
          </button>
          <button onclick="toggleTutorSidebar()" class="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
            <i data-lucide="panel-left" class="w-4 h-4"></i>
          </button>
        </div>

      </div>

      <!-- MESSAGES DISPLAY CONTAINER -->
      <div id="tutor-messages-container" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        ${currentTutorMessages.length === 0 ? renderTutorEmptyState() : renderMessagesList(currentTutorMessages)}
      </div>

      <!-- INPUT BOX & PROMPT BAR -->
      <div class="p-3 sm:p-4 border-t border-white/10 glass-panel shrink-0 bg-[#0A0D14]">
        <div class="max-w-4xl mx-auto">
          
          <form onsubmit="handleTutorSend(event)" class="relative flex items-end gap-2 bg-[#121824] border border-white/15 focus-within:border-purple-500 rounded-2xl p-2 shadow-2xl transition-all">
            
            <textarea 
              id="tutor-input" 
              rows="1" 
              onkeydown="handleTutorInputKeydown(event)"
              oninput="autoResizeTextarea(this)"
              placeholder="Ask GuruG any academic question, paste a problem, or speak with your mic..."
              class="w-full bg-transparent text-sm text-white placeholder-gray-400 px-3 py-1.5 focus:outline-none resize-none max-h-32 leading-relaxed"
            ></textarea>

            <!-- Microphone Button: Talk & Ask Question -->
            <button 
              type="button" 
              onclick="toggleTutorVoiceRecognition()" 
              id="tutor-mic-btn" 
              class="p-2.5 rounded-xl bg-white/5 hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 border border-white/10 transition-all shrink-0 cursor-pointer flex items-center justify-center relative group" 
              title="Talk & Ask Question (Voice to Text)"
            >
              <i data-lucide="mic" id="tutor-mic-icon" class="w-4 h-4"></i>
              <span id="tutor-mic-ping" class="hidden absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            </button>

            <!-- Send Button -->
            <button type="submit" id="tutor-send-btn" class="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 transition-all shrink-0 cursor-pointer" title="Send message">
              <i data-lucide="send" class="w-4 h-4"></i>
            </button>
          </form>

          <!-- Voice Recording Indicator Banner (Visible when mic is active) -->
          <div id="tutor-mic-banner" class="hidden mt-2 p-2.5 rounded-xl bg-gradient-to-r from-purple-950/40 via-rose-950/30 to-indigo-950/40 border border-purple-500/30 flex items-center justify-between gap-3 text-xs fade-in">
            <div class="flex items-center gap-2 text-purple-200">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span id="tutor-mic-status-text" class="font-medium">🎙️ Listening... Speak your question now!</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-gray-400 hidden sm:inline">Click Stop or press Enter when done</span>
              <button type="button" onclick="stopTutorVoiceRecognition()" class="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold transition-all cursor-pointer">
                Stop ⏹
              </button>
            </div>
          </div>

          <!-- Audio Read Aloud Indicator Banner (Visible when GuruG is narrating - Press Esc to Stop) -->
          <div id="tutor-audio-banner" class="hidden mt-2 p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-indigo-950/40 border border-cyan-500/30 flex items-center justify-between gap-3 text-xs fade-in">
            <div class="flex items-center gap-2 text-cyan-200">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span id="tutor-audio-status-text" class="font-medium">🔊 GuruG is reading aloud...</span>
              <span class="text-[10px] text-cyan-300/80 bg-cyan-500/15 px-2 py-0.5 rounded border border-cyan-500/30 font-mono hidden sm:inline">Press Esc to stop</span>
            </div>
            <button type="button" onclick="stopTutorSpeechAudio()" class="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm" title="Stop speech (Esc)">
              <span>Stop ⏹</span>
              <kbd class="text-[9px] bg-black/50 px-1 py-0.5 rounded text-rose-200 border border-rose-500/30 font-mono">Esc</kbd>
            </button>
          </div>

          <div class="flex items-center justify-between text-[11px] text-gray-400 px-2 mt-2">
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>GuruG AI is active in <strong class="text-white">${currentTutorLanguage}</strong></span>
            </div>
            <span class="hidden sm:inline">Press Enter to send, Shift+Enter for newline</span>
          </div>

        </div>
      </div>

    </main>

  </div>
  `;
}

function renderSessionsListHtml(sessions) {
  if (!sessions || sessions.length === 0) {
    return `<div class="p-4 text-center text-xs text-gray-500">No previous chats. Ask a question to begin!</div>`;
  }

  return sessions.map(s => `
    <div onclick="selectTutorSession('${s.id}')" class="p-2.5 rounded-xl text-xs cursor-pointer transition-all flex items-center justify-between group ${s.id === currentTutorSessionId ? 'bg-purple-600/25 border border-purple-500/40 text-white font-semibold' : 'text-gray-300 hover:bg-white/5'}">
      <div class="truncate flex items-center gap-2">
        <i data-lucide="message-square" class="w-3.5 h-3.5 text-purple-400 shrink-0"></i>
        <span class="truncate">${s.title || 'Tutoring Session'}</span>
      </div>
      <span class="text-[9px] text-gray-500 group-hover:text-gray-400 shrink-0">${s.language || ''}</span>
    </div>
  `).join('');
}

function renderTutorEmptyState() {
  return `
  <div class="max-w-2xl mx-auto py-10 text-center space-y-6 fade-in">
    <div class="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] mx-auto shadow-xl shadow-purple-500/25">
      <div class="w-full h-full bg-[#0B0F17] rounded-[23px] flex items-center justify-center">
        <span class="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">G</span>
      </div>
    </div>

    <div>
      <h2 class="text-2xl font-extrabold text-white">How can GuruG help you learn today?</h2>
      <p class="text-xs text-gray-300 mt-1 max-w-md mx-auto">
        Your patient, multilingual tutor. Choose any topic or try one of the starter questions below:
      </p>
    </div>

    <!-- Suggested Question Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
      
      <div onclick="sendTutorPrompt('Explain the Pythagorean theorem with a real-life example in Hinglish')" class="p-3.5 rounded-2xl glass-panel hover:border-purple-500/50 hover:bg-white/5 cursor-pointer transition-all group">
        <div class="text-xs font-bold text-white group-hover:text-purple-300 flex items-center gap-1.5">
          <span>📐 Pythagorean Theorem</span>
        </div>
        <p class="text-[11px] text-gray-400 mt-1">"Explain $a^2 + b^2 = c^2$ with a real-life ladder example in Hinglish."</p>
      </div>

      <div onclick="sendTutorPrompt('Explain Newton\\'s second law (F=ma) using a cricket ball catch example in simple terms')" class="p-3.5 rounded-2xl glass-panel hover:border-cyan-500/50 hover:bg-white/5 cursor-pointer transition-all group">
        <div class="text-xs font-bold text-white group-hover:text-cyan-300 flex items-center gap-1.5">
          <span>⚡ Newton\'s 2nd Law ($F=ma$)</span>
        </div>
        <p class="text-[11px] text-gray-400 mt-1">"Why do cricket fielders pull their hands back when taking a catch?"</p>
      </div>

      <div onclick="sendTutorPrompt('Explain Photosynthesis step-by-step with chemical reaction equation')" class="p-3.5 rounded-2xl glass-panel hover:border-emerald-500/50 hover:bg-white/5 cursor-pointer transition-all group">
        <div class="text-xs font-bold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
          <span>🌱 Photosynthesis Process</span>
        </div>
        <p class="text-[11px] text-gray-400 mt-1">"How do plants make glucose and oxygen from sunlight?"</p>
      </div>

      <div onclick="sendTutorPrompt('Solve quadratic equation x^2 - 5x + 6 = 0 step-by-step and show the discriminant')" class="p-3.5 rounded-2xl glass-panel hover:border-amber-500/50 hover:bg-white/5 cursor-pointer transition-all group">
        <div class="text-xs font-bold text-white group-hover:text-amber-300 flex items-center gap-1.5">
          <span>🧮 Quadratic Equation Solver</span>
        </div>
        <p class="text-[11px] text-gray-400 mt-1">"Solve $x^2 - 5x + 6 = 0$ using the quadratic formula."</p>
      </div>

    </div>

  </div>
  `;
}

function renderMessagesList(messages) {
  return messages.map(msg => {
    const isUser = msg.sender === 'user';
    return isUser ? renderUserBubble(msg) : renderTutorBubble(msg);
  }).join('');
}

function renderUserBubble(msg) {
  return `
  <div class="flex items-start gap-3 justify-end fade-in">
    <div class="bg-gradient-to-r from-purple-600/90 to-indigo-600/90 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-xl shadow-md">
      <p class="leading-relaxed whitespace-pre-wrap">${escapeHtml(msg.content)}</p>
    </div>
    <div class="w-8 h-8 rounded-xl bg-purple-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
      ${(api.user?.display_name || 'U')[0]}
    </div>
  </div>
  `;
}

function renderVisualAidCard(visual) {
  if (!visual || !visual.image_url) return '';
  const title = escapeHtml(visual.title || 'Educational Diagram');
  const badge = escapeHtml(visual.badge || 'Visual Aid');
  const caption = escapeHtml(visual.caption || '');
  const rawCaption = (visual.caption || '').replace(/"/g, '&quot;');
  const rawTitle = (visual.title || '').replace(/"/g, '&quot;');
  const rawSrc = (visual.image_url || '').replace(/"/g, '&quot;');

  return `
  <div class="concept-visual-card my-4 p-4 rounded-2xl glass-panel-elevated border border-purple-500/30 shadow-xl space-y-3">
    <div class="flex items-center justify-between border-b border-white/10 pb-2.5 text-xs">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
        <span class="font-bold text-white text-xs sm:text-sm">${title}</span>
      </div>
      <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">${badge}</span>
    </div>
    <div class="visual-lightbox-trigger relative rounded-xl overflow-hidden bg-black/40 border border-white/10 text-center cursor-pointer group"
         data-src="${rawSrc}"
         data-title="${rawTitle}"
         data-caption="${rawCaption}">
      <img src="${visual.image_url}" alt="${title}" class="w-full max-h-80 object-contain mx-auto py-2 transition-transform duration-300 group-hover:scale-[1.02]" loading="lazy" />
      <div class="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
        <span>🔍 Click to Zoom</span>
      </div>
    </div>
    ${caption ? `
    <div class="text-xs text-gray-300 leading-relaxed bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
      <p class="font-medium text-purple-200">💡 <strong>Visual Concept Insight:</strong> ${caption}</p>
    </div>` : ''}
  </div>`;
}

function renderTutorBubble(msg) {
  const htmlContent = formatMarkdown(msg.content);
  const visualAidHtml = msg.visual_aid ? renderVisualAidCard(msg.visual_aid) : '';
  const msgId = msg.id || ('msg_' + Math.random().toString(36).substr(2, 9));

  return `
  <div class="flex items-start gap-3 fade-in" id="${msgId}">
    <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg shadow-purple-500/25">
      G
    </div>
    <div class="bg-[#121824] border border-white/10 rounded-2xl rounded-tl-sm p-4 sm:p-5 text-sm text-gray-200 max-w-2xl sm:max-w-3xl shadow-xl flex-1">
      
      <!-- Tutor Top Bar -->
      <div class="flex items-center justify-between pb-2 mb-3 border-b border-white/5 text-xs">
        <div class="flex items-center gap-2">
          <span class="font-bold text-purple-300">GuruG AI Tutor</span>
          ${msg.language ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">${msg.language}</span>` : ''}
          ${msg.mode ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 hidden sm:inline">${msg.mode}</span>` : ''}
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-1.5 text-gray-400">
          <button onclick="readAloudMessage('${msgId}')" id="tts-btn-${msgId}" class="p-1 rounded hover:text-cyan-400 hover:bg-white/5 transition-colors" title="Read Aloud (TTS) - Press Esc to stop">
            <i data-lucide="volume-2" class="w-4 h-4"></i>
          </button>
          <button onclick="copyMessageText('${msgId}')" class="p-1 rounded hover:text-purple-400 hover:bg-white/5 transition-colors" title="Copy Content">
            <i data-lucide="copy" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <!-- Formatted Educational Content -->
      <div class="tutor-rendered-content leading-relaxed space-y-2">
        ${htmlContent}
      </div>

      <!-- Structured Educational Visual Aid -->
      ${visualAidHtml}

      <!-- Pedagogical Follow-Up Quick Pills -->
      <div class="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2 text-[11px]">
        <span class="text-gray-400 text-[10px]">Follow up:</span>
        <button onclick="sendTutorPrompt('Can you explain this with a simpler analogy?')" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors">
          💡 Explain Simpler
        </button>
        <button onclick="sendTutorPrompt('Give me another real-world practical example.')" class="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors">
          🌍 Another Example
        </button>
        <button onclick="triggerQuizFromTopic('${msg.subject || 'this concept'}')" class="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-colors">
          📝 Quiz Me on This
        </button>
      </div>

    </div>
  </div>
  `;
}

function renderTypingIndicator() {
  return `
  <div id="tutor-typing-indicator" class="flex items-start gap-3 fade-in">
    <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
      G
    </div>
    <div class="bg-[#121824] border border-white/10 rounded-2xl rounded-tl-sm px-5 py-3 text-sm text-gray-400 flex items-center gap-1.5 shadow-md">
      <span class="text-xs text-purple-300 mr-1">GuruG is thinking</span>
      <div class="w-1.5 h-1.5 rounded-full bg-purple-400 typing-dot"></div>
      <div class="w-1.5 h-1.5 rounded-full bg-cyan-400 typing-dot"></div>
      <div class="w-1.5 h-1.5 rounded-full bg-indigo-400 typing-dot"></div>
    </div>
  </div>
  `;
}

function handleTutorInputKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleTutorSend(e);
  }
}

function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px';
}

/* ==========================================================
   TUTOR VOICE MICROPHONE & SPEECH-TO-TEXT DICTATION
   ========================================================== */
let isTutorListening = false;

function getTutorSpeechLangCode(languageName) {
  const map = {
    'English': 'en-IN',
    'Hindi': 'hi-IN',
    'Hinglish': 'hi-IN',
    'Bengali': 'bn-IN',
    'Tamil': 'ta-IN',
    'Telugu': 'te-IN',
    'Kannada': 'kn-IN',
    'Marathi': 'mr-IN',
    'Gujarati': 'gu-IN',
    'Malayalam': 'ml-IN',
    'Urdu': 'ur-IN'
  };
  return map[languageName] || 'en-IN';
}

function toggleTutorVoiceRecognition() {
  if (isTutorListening) {
    stopTutorVoiceRecognition();
  } else {
    startTutorVoiceRecognition();
  }
}

function startTutorVoiceRecognition() {
  const input = document.getElementById('tutor-input');
  const micBtn = document.getElementById('tutor-mic-btn');
  const micPing = document.getElementById('tutor-mic-ping');
  const banner = document.getElementById('tutor-mic-banner');
  const statusText = document.getElementById('tutor-mic-status-text');

  // Stop any active TTS audio before listening so AI speech is not recorded
  if (window.TTS) window.TTS.stop();

  const langCode = getTutorSpeechLangCode(currentTutorLanguage);
  const baseText = input ? input.value : '';

  VoiceInput.init(
    // onResult
    (fullTranscript, interim) => {
      if (input) {
        input.value = fullTranscript;
        autoResizeTextarea(input);
      }
      if (statusText) {
        statusText.innerText = interim ? `🎙️ "${interim}"` : `🎙️ Listening in ${currentTutorLanguage}...`;
      }
    },
    // onStatusChange
    (isListening, errorMsg) => {
      isTutorListening = isListening;
      if (isListening) {
        if (micBtn) {
          micBtn.className = "p-2.5 rounded-xl bg-rose-600 text-white mic-recording-pulse shadow-lg shadow-rose-600/50 border border-rose-400 transition-all shrink-0 cursor-pointer flex items-center justify-center relative";
          micBtn.title = "Listening... Click to stop speaking";
        }
        if (micPing) micPing.classList.remove('hidden');
        if (banner) banner.classList.remove('hidden');
        if (statusText) statusText.innerText = `🎙️ Listening in ${currentTutorLanguage}... Speak your question!`;
      } else {
        if (micBtn) {
          micBtn.className = "p-2.5 rounded-xl bg-white/5 hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 border border-white/10 transition-all shrink-0 cursor-pointer flex items-center justify-center relative group";
          micBtn.title = "Talk & Ask Question (Voice to Text)";
        }
        if (micPing) micPing.classList.add('hidden');
        if (banner) banner.classList.add('hidden');

        if (errorMsg) {
          alert(errorMsg);
        }
      }
      if (window.lucide) window.lucide.createIcons();
    },
    langCode
  );

  const started = VoiceInput.start(baseText);
  if (!started && !VoiceInput.isSupported()) {
    alert("Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.");
  }
}

function stopTutorVoiceRecognition() {
  VoiceInput.stop();
  isTutorListening = false;
  const micBtn = document.getElementById('tutor-mic-btn');
  const micPing = document.getElementById('tutor-mic-ping');
  const banner = document.getElementById('tutor-mic-banner');

  if (micBtn) {
    micBtn.className = "p-2.5 rounded-xl bg-white/5 hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 border border-white/10 transition-all shrink-0 cursor-pointer flex items-center justify-center relative group";
    micBtn.title = "Talk & Ask Question (Voice to Text)";
  }
  if (micPing) micPing.classList.add('hidden');
  if (banner) banner.classList.add('hidden');
  if (window.lucide) window.lucide.createIcons();
}

async function handleTutorSend(e) {
  if (e) e.preventDefault();
  if (isTutorListening) {
    stopTutorVoiceRecognition();
  }
  const input = document.getElementById('tutor-input');
  const message = input.value.trim();
  if (!message) return;

  input.value = '';
  input.style.height = 'auto';
  await sendTutorPrompt(message);
}

async function sendTutorPrompt(promptText) {
  const container = document.getElementById('tutor-messages-container');
  if (!container) return;

  // Append user message immediately
  const userMsgObj = {
    id: 'user_' + Date.now(),
    sender: 'user',
    content: promptText
  };
  currentTutorMessages.push(userMsgObj);

  // If was empty state, clear container
  if (currentTutorMessages.length === 1) {
    container.innerHTML = '';
  }

  container.insertAdjacentHTML('beforeend', renderUserBubble(userMsgObj));
  container.insertAdjacentHTML('beforeend', renderTypingIndicator());
  container.scrollTop = container.scrollHeight;
  if (window.lucide) window.lucide.createIcons();

  try {
    const res = await api.sendTutorMessage(
      promptText,
      currentTutorSessionId,
      currentTutorSubject,
      currentTutorLanguage,
      currentTutorMode
    );

    // Remove typing indicator
    const typing = document.getElementById('tutor-typing-indicator');
    if (typing) typing.remove();

    currentTutorSessionId = res.session_id;
    currentTutorMessages.push(res.tutor_message);

    container.insertAdjacentHTML('beforeend', renderTutorBubble(res.tutor_message));
    container.scrollTop = container.scrollHeight;

    // Render KaTeX formulas
    renderMathInContainer(container);
    if (window.lucide) window.lucide.createIcons();

    // Auto read aloud if enabled in settings
    const settings = JSON.parse(localStorage.getItem('gurug_settings') || '{}');
    if (settings.sound_enabled && res.tutor_message?.id) {
      readAloudMessage(res.tutor_message.id);
    }
  } catch (err) {
    const typing = document.getElementById('tutor-typing-indicator');
    if (typing) typing.remove();
    container.insertAdjacentHTML('beforeend', `
      <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
        Could not connect to tutor: ${err.message}
      </div>
    `);
  }
}

function changeTutorLanguage(lang) {
  currentTutorLanguage = lang;
  // Persist preference
  api.updateSettings({ preferred_language: lang });
}

function changeTutorMode(mode) {
  currentTutorMode = mode;
  // Update button highlights
  const allBtns = document.querySelectorAll('[id^="mode-btn-"]');
  allBtns.forEach(btn => {
    btn.className = 'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 bg-black/30 border border-white/10 text-gray-300 hover:text-white hover:border-white/20';
  });
  const active = document.getElementById(`mode-btn-${mode.replace(/\s+/g, '-')}`);
  if (active) {
    active.className = 'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 bg-purple-600 text-white shadow-md shadow-purple-600/30';
  }
}

async function selectTutorSession(sessionId) {
  currentTutorSessionId = sessionId;
  const container = document.getElementById('tutor-messages-container');
  if (!container) return;

  container.innerHTML = `<div class="p-8 text-center text-xs text-gray-400">Loading conversation...</div>`;
  try {
    currentTutorMessages = await api.getSessionMessages(sessionId);
    container.innerHTML = currentTutorMessages.length === 0 ? renderTutorEmptyState() : renderMessagesList(currentTutorMessages);
    renderMathInContainer(container);
    if (window.lucide) window.lucide.createIcons();
    container.scrollTop = container.scrollHeight;
  } catch (err) {
    container.innerHTML = `<div class="p-4 text-xs text-rose-400">Could not load session messages</div>`;
  }
}

function startNewTutorChat() {
  currentTutorSessionId = null;
  currentTutorMessages = [];
  const container = document.getElementById('tutor-messages-container');
  if (container) {
    container.innerHTML = renderTutorEmptyState();
    if (window.lucide) window.lucide.createIcons();
  }
}

async function clearCurrentChat() {
  if (!currentTutorSessionId) {
    startNewTutorChat();
    return;
  }
  if (!confirm("Are you sure you want to clear this conversation?")) return;
  try {
    await api.clearSessionChat(currentTutorSessionId);
    startNewTutorChat();
  } catch (err) {
    alert("Could not clear chat: " + err.message);
  }
}

let currentlyReadingMsgId = null;

function readAloudMessage(msgId) {
  const el = document.getElementById(msgId);
  if (!el) return;

  // Toggle stop if already playing this message
  if (TTS.isSpeaking && currentlyReadingMsgId === msgId) {
    stopTutorSpeechAudio();
    return;
  }

  // Stop any ongoing audio first
  stopTutorSpeechAudio();

  const text = el.querySelector('.tutor-rendered-content')?.innerText || '';
  if (!text.trim()) return;

  currentlyReadingMsgId = msgId;

  // Update speaker button visual active state
  const btn = document.getElementById(`tts-btn-${msgId}`);
  if (btn) {
    btn.className = "p-1 rounded bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40 animate-pulse transition-all";
    btn.title = "Stop Reading (or press Esc)";
    btn.innerHTML = `<i data-lucide="volume-x" class="w-4 h-4"></i>`;
    if (window.lucide) window.lucide.createIcons();
  }

  // Show reading status banner with Esc button
  const banner = document.getElementById('tutor-audio-banner');
  if (banner) banner.classList.remove('hidden');

  TTS.speak(
    text,
    currentTutorLanguage,
    // onStart
    () => {
      const b = document.getElementById('tutor-audio-banner');
      if (b) b.classList.remove('hidden');
    },
    // onEnd
    () => {
      resetTutorAudioState();
    }
  );
}

function stopTutorSpeechAudio() {
  TTS.stop();
  resetTutorAudioState();
}

function resetTutorAudioState() {
  if (currentlyReadingMsgId) {
    const btn = document.getElementById(`tts-btn-${currentlyReadingMsgId}`);
    if (btn) {
      btn.className = "p-1 rounded hover:text-cyan-400 hover:bg-white/5 text-gray-400 transition-colors";
      btn.title = "Read Aloud (TTS) - Press Esc to stop";
      btn.innerHTML = `<i data-lucide="volume-2" class="w-4 h-4"></i>`;
      if (window.lucide) window.lucide.createIcons();
    }
  }
  currentlyReadingMsgId = null;

  const banner = document.getElementById('tutor-audio-banner');
  if (banner) banner.classList.add('hidden');
}

// Expose globally so global Escape key listener and app router can stop audio
window.stopTutorSpeechAudio = stopTutorSpeechAudio;
window.readAloudMessage = readAloudMessage;

function copyMessageText(msgId) {
  const el = document.getElementById(msgId);
  if (!el) return;
  const text = el.querySelector('.tutor-rendered-content')?.innerText || '';
  navigator.clipboard.writeText(text);
  alert("Explanation copied to clipboard!");
}

function triggerQuizFromTopic(topic) {
  sessionStorage.setItem('gurug_target_topic', topic);
  window.location.hash = '#/quiz';
}

function toggleAudioSpeech() {
  TTS.stop();
  const btn = document.getElementById('audio-toggle-btn');
  if (btn) {
    btn.classList.toggle('text-cyan-400');
  }
}

function toggleTutorSidebar() {
  const sidebar = document.getElementById('tutor-sidebar');
  if (sidebar) sidebar.classList.toggle('hidden');
}

function escapeHtml(string) {
  const entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(string).replace(/[&<>"']/g, s => entityMap[s]);
}
