/**
 * GuruG Settings & Preferences Component
 * Features: Academic profile, Appearance (Light/Dark themes & Font selection),
 * AI Tutor defaults, Live AI Engine credentials, and Session sign out.
 */

async function renderSettings() {
  const user = api.user || {};
  let settingsData = {
    profile: user,
    settings: {
      default_mode: "Simple Explanation",
      sound_enabled: true,
      custom_gemini_key_configured: false,
      custom_gemini_key_masked: "None"
    },
    supported_languages: [],
    explanation_modes: [],
    education_levels: []
  };

  try {
    settingsData = await api.getSettings();
  } catch (err) {
    console.warn("Could not load backend settings:", err);
  }

  const p = settingsData.profile || user;
  const s = settingsData.settings || {};
  const currentTheme = getActiveTheme();
  const currentFont = getActiveFont();
  const currentFontObj = window.FONT_OPTIONS.find(f => f.id === currentFont) || window.FONT_OPTIONS[0];
  const voiceSettings = JSON.parse(localStorage.getItem('gurug_voice_settings') || '{"persona":"natural_mentor","rate":0.98,"pitch":1.0}');
  
  // Schedule voice badge update
  setTimeout(() => {
    if (typeof updateDetectedVoiceDisplay === 'function') updateDetectedVoiceDisplay();
  }, 200);

  return `
  <div class="max-w-4xl mx-auto px-4 py-8 space-y-8 fade-in">
    
    <!-- Header -->
    <div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-white">Student Settings & Preferences</h1>
      <p class="text-sm text-gray-300 mt-1">Personalize your workspace themes, typography, native language, and live AI tutor engine.</p>
    </div>

    <!-- Alert Message Container -->
    <div id="settings-alert" class="hidden p-4 rounded-2xl text-xs font-semibold"></div>

    <!-- 1. APPEARANCE & PERSONALIZATION (THEMES & FONTS) -->
    <div class="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/15 space-y-6">
      <div class="flex items-center justify-between border-b border-white/10 pb-4">
        <div class="flex items-center gap-2 text-base font-bold text-white">
          <i data-lucide="palette" class="w-5 h-5 text-purple-400"></i>
          <span>Appearance & Personalization</span>
        </div>
        <div id="font-applied-status" class="hidden text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 fade-in">
          <i data-lucide="check" class="w-3.5 h-3.5"></i>
          <span>Theme & Font Active ✓</span>
        </div>
      </div>

      <!-- Theme Selection: Light vs Dark -->
      <div class="space-y-3">
        <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider">
          Interface Theme (2 Options)
        </label>
        <p class="text-xs text-gray-400">Select your preferred lighting scheme. GuruG immediately adapts all views, KaTeX formulas, and chat environments.</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <!-- Dark Theme Card -->
          <div id="theme-card-dark" onclick="handleSelectTheme('dark')" class="group relative p-4 rounded-2xl border cursor-pointer transition-all ${
            currentTheme === 'dark' 
              ? 'border-purple-500 ring-2 ring-purple-500/40 bg-purple-950/20' 
              : 'border-white/10 hover:border-white/20 bg-black/30'
          }">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <i data-lucide="moon" class="w-5 h-5"></i>
                </div>
                <div>
                  <div class="text-sm font-bold text-white flex items-center gap-2">
                    <span>Dark Theme</span>
                    ${currentTheme === 'dark' ? '<span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-500/40">Active</span>' : ''}
                  </div>
                  <div class="text-[11px] text-gray-400 mt-0.5">Obsidian neon dark mode with purple/cyan glows. Easy on eyes for night study.</div>
                </div>
              </div>
            </div>
            <!-- Mini Swatch -->
            <div class="mt-3.5 pt-3 border-t border-white/10 flex items-center gap-2 text-[10px] text-gray-400">
              <span class="w-3.5 h-3.5 rounded-full bg-[#07090E] border border-white/20"></span>
              <span class="w-3.5 h-3.5 rounded-full bg-[#121824] border border-white/20"></span>
              <span class="w-3.5 h-3.5 rounded-full bg-purple-600"></span>
              <span class="ml-auto text-[10px] font-medium text-purple-300">Default Night Mode</span>
            </div>
          </div>

          <!-- Light Theme Card -->
          <div id="theme-card-light" onclick="handleSelectTheme('light')" class="group relative p-4 rounded-2xl border cursor-pointer transition-all ${
            currentTheme === 'light' 
              ? 'border-purple-500 ring-2 ring-purple-500/40 bg-purple-950/20' 
              : 'border-white/10 hover:border-white/20 bg-black/30'
          }">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <i data-lucide="sun" class="w-5 h-5"></i>
                </div>
                <div>
                  <div class="text-sm font-bold text-white flex items-center gap-2">
                    <span>Light Theme</span>
                    ${currentTheme === 'light' ? '<span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-500/40">Active</span>' : ''}
                  </div>
                  <div class="text-[11px] text-gray-400 mt-0.5">Clean white & soft slate daylight mode. High contrast for reading and bright classrooms.</div>
                </div>
              </div>
            </div>
            <!-- Mini Swatch -->
            <div class="mt-3.5 pt-3 border-t border-white/10 flex items-center gap-2 text-[10px] text-gray-400">
              <span class="w-3.5 h-3.5 rounded-full bg-[#F8FAFC] border border-slate-300"></span>
              <span class="w-3.5 h-3.5 rounded-full bg-[#FFFFFF] border border-slate-300"></span>
              <span class="w-3.5 h-3.5 rounded-full bg-purple-600"></span>
              <span class="ml-auto text-[10px] font-medium text-amber-400">Daylight Clean Mode</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Text Font Selection -->
      <div class="space-y-4 pt-4 border-t border-white/10">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label class="block text-xs font-bold text-gray-300 uppercase tracking-wider">
              Text Font Typography
            </label>
            <p class="text-xs text-gray-400 mt-0.5">Choose your preferred reading font. Changing this updates all explanations, formulas, and menus across the website.</p>
          </div>
          <div class="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-300">
            Current: <span id="font-preview-name">${currentFontObj.name}</span>
          </div>
        </div>

        <!-- Font Option Chips -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          ${window.FONT_OPTIONS.map(font => {
            const isSelected = font.id === currentFont;
            return `
              <button type="button" onclick="handleSelectFont('${font.id}')" style="font-family: ${font.family};" class="font-chip p-3 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected 
                  ? 'border-purple-500 bg-purple-600/20 text-white ring-2 ring-purple-500/30' 
                  : 'border-white/10 bg-black/30 text-gray-300 hover:border-white/20 hover:text-white'
              }">
                <div class="text-xs font-bold truncate flex items-center justify-between">
                  <span>${font.name}</span>
                  ${isSelected ? '<i data-lucide="check" class="w-3.5 h-3.5 text-purple-400"></i>' : ''}
                </div>
                <div class="text-[10px] text-gray-400 truncate mt-1">${font.category}</div>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Live Font & KaTeX Math Formula Preview Box -->
        <div class="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2">
          <div class="flex items-center justify-between text-[11px] font-semibold text-gray-400 border-b border-white/10 pb-2">
            <span>Live Typography & Math Rendering Preview</span>
            <span class="text-purple-300 font-mono text-[10px]">Instant Real-Time Render</span>
          </div>
          
          <div id="font-live-preview" style="font-family: ${currentFontObj.family};" class="space-y-2 pt-1 transition-all">
            <h3 class="text-base sm:text-lg font-bold text-white">
              The Quadratic Formula & Polynomial Solutions
            </h3>
            <p class="text-xs sm:text-sm text-gray-300 leading-relaxed">
              GuruG explains difficult concepts step-by-step in your mother tongue. When solving any second-degree equation of the form $ax^2 + bx + c = 0$, the roots are given by:
            </p>
            <div class="katex-display-container my-2 text-center text-xs sm:text-sm">
              $$ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $$
            </div>
            <p class="text-[11px] text-gray-400">
              "Tell me and I forget, teach me and I may remember, involve me and I learn." — Benjamin Franklin
            </p>
          </div>
        </div>

      </div>

    </div>

    <!-- 2. ACADEMIC PROFILE -->
    <div class="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/15 space-y-6">
      <div class="flex items-center gap-2 text-base font-bold text-white border-b border-white/10 pb-4">
        <i data-lucide="user" class="w-5 h-5 text-purple-400"></i>
        <span>Academic Profile</span>
      </div>

      <form onsubmit="handleSaveProfile(event)" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-300 mb-1.5">Student Display Name</label>
            <input type="text" id="setting-name" value="${escapeHtml(p.display_name || 'Aarav Sharma')}" required class="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500" />
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-300 mb-1.5">Email Address</label>
            <input type="email" value="${escapeHtml(p.email || 'demo@gurug.edu')}" disabled class="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/5 text-sm text-gray-500 cursor-not-allowed" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-300 mb-1.5">Class / Education Level</label>
            <select id="setting-grade" class="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500">
              ${['Class 6–8', 'Class 9–10', 'Class 11–12', 'College', 'Other'].map(g => `
                <option value="${g}" ${p.grade_level === g ? 'selected' : ''}>${g}</option>
              `).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-300 mb-1.5">Preferred Learning Language</label>
            <select id="setting-language" class="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-cyan-300 font-semibold focus:outline-none focus:border-purple-500">
              ${[
                { code: "Hinglish", name: "Hinglish (Mix)" },
                { code: "English", name: "English" },
                { code: "Hindi", name: "हिन्दी (Hindi)" },
                { code: "Bengali", name: "বাংলা (Bengali)" },
                { code: "Tamil", name: "தமிழ் (Tamil)" },
                { code: "Telugu", name: "తెలుగు (Telugu)" },
                { code: "Kannada", name: "ಕನ್ನಡ (Kannada)" },
                { code: "Marathi", name: "मराठी (Marathi)" },
                { code: "Gujarati", name: "ગુજરાતી (Gujarati)" },
                { code: "Malayalam", name: "മലയാളം (Malayalam)" },
                { code: "Urdu", name: "اردو (Urdu)" }
              ].map(l => `
                <option value="${l.code}" ${p.preferred_language === l.code ? 'selected' : ''}>${l.name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <button type="submit" id="save-profile-btn" class="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer">
          Save Profile Preferences ✓
        </button>
      </form>
    </div>

    <!-- 3. AI TUTOR BEHAVIOR & NATURAL HUMAN VOICE -->
    <div class="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white/15 space-y-6">
      <div class="flex items-center justify-between border-b border-white/10 pb-4">
        <div class="flex items-center gap-2 text-base font-bold text-white">
          <i data-lucide="mic" class="w-5 h-5 text-purple-400"></i>
          <span>AI Tutor Behavior & Natural Human Voice</span>
        </div>
        <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
          <span>Natural Neural Voice Engine</span>
        </span>
      </div>

      <div class="space-y-5">
        <div>
          <label class="block text-xs font-bold text-gray-300 mb-1.5">Default Explanation Mode</label>
          <select id="setting-mode" class="w-full sm:w-1/2 px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none">
            <option value="Simple Explanation" ${s.default_mode === 'Simple Explanation' ? 'selected' : ''}>Simple Explanation</option>
            <option value="Detailed Explanation" ${s.default_mode === 'Detailed Explanation' ? 'selected' : ''}>Detailed Explanation</option>
            <option value="Step-by-Step" ${s.default_mode === 'Step-by-Step' ? 'selected' : ''}>Step-by-Step</option>
            <option value="Explain Like I'm 10" ${s.default_mode === "Explain Like I'm 10" ? 'selected' : ''}>Explain Like I'm 10</option>
            <option value="Real-Life Examples" ${s.default_mode === 'Real-Life Examples' ? 'selected' : ''}>Real-Life Examples</option>
            <option value="Exam Preparation" ${s.default_mode === 'Exam Preparation' ? 'selected' : ''}>Exam Preparation</option>
          </select>
        </div>

        <!-- Human Voice Persona Options -->
        <div class="space-y-3 pt-2 border-t border-white/5">
          <div class="flex items-center justify-between">
            <div>
              <label class="block text-xs font-bold text-gray-300">Human Voice Persona & Speaking Cadence</label>
              <p class="text-[11px] text-gray-400 mt-0.5">Select how you want GuruG to speak. All styles feature micro-pauses between sentences for natural breathing rhythm.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div onclick="handleSelectVoicePersona('natural_mentor', 0.98)" id="persona-natural_mentor" class="p-3.5 rounded-xl border cursor-pointer transition-all ${voiceSettings.persona === 'natural_mentor' ? 'border-purple-500 bg-purple-950/30 ring-1 ring-purple-500/50' : 'border-white/10 bg-black/30 hover:border-white/20'}">
              <div class="text-xs font-bold text-white flex items-center justify-between">
                <span>Warm Mentor (Recommended)</span>
                <span class="text-[10px] text-purple-300 font-mono">0.98x</span>
              </div>
              <div class="text-[11px] text-gray-400 mt-1">Empathetic, crisp pacing with decreased comma pauses. Perfect for studying & understanding concepts.</div>
            </div>

            <div onclick="handleSelectVoicePersona('energetic_guide', 1.02)" id="persona-energetic_guide" class="p-3.5 rounded-xl border cursor-pointer transition-all ${voiceSettings.persona === 'energetic_guide' ? 'border-purple-500 bg-purple-950/30 ring-1 ring-purple-500/50' : 'border-white/10 bg-black/30 hover:border-white/20'}">
              <div class="text-xs font-bold text-white flex items-center justify-between">
                <span>Dynamic Guide</span>
                <span class="text-[10px] text-cyan-300 font-mono">1.02x</span>
              </div>
              <div class="text-[11px] text-gray-400 mt-1">Crisp, spirited, high-energy tone. Ideal for rapid revision sessions and debate rebuttals.</div>
            </div>

            <div onclick="handleSelectVoicePersona('calm_tutor', 0.88)" id="persona-calm_tutor" class="p-3.5 rounded-xl border cursor-pointer transition-all ${voiceSettings.persona === 'calm_tutor' ? 'border-purple-500 bg-purple-950/30 ring-1 ring-purple-500/50' : 'border-white/10 bg-black/30 hover:border-white/20'}">
              <div class="text-xs font-bold text-white flex items-center justify-between">
                <span>Calm Companion</span>
                <span class="text-[10px] text-emerald-300 font-mono">0.88x</span>
              </div>
              <div class="text-[11px] text-gray-400 mt-1">Gentle, deliberate, unhurried cadence for complex mathematical proofs & late night study.</div>
            </div>
          </div>
        </div>

        <!-- Voice Test & Auto-Speak Switch -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-black/30 border border-white/5 gap-3">
          <div>
            <div class="text-xs font-bold text-white flex items-center gap-2">
              <span>Human Voice Preview</span>
              <span id="detected-voice-tag" class="text-[10px] text-cyan-300 font-mono bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">Detecting neural voice...</span>
            </div>
            <div class="text-[11px] text-gray-400 mt-0.5">Click below to hear how GuruG speaks with authentic human inflection & math phonetics</div>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <button type="button" id="test-human-voice-btn" onclick="handleTestHumanVoice()" class="px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-600/20">
              <i data-lucide="volume-2" class="w-4 h-4"></i>
              <span id="test-voice-btn-text">Test Human Voice 🔊</span>
            </button>
            <div class="h-6 w-px bg-white/10 hidden sm:block"></div>
            <label class="flex items-center gap-2 cursor-pointer text-xs text-gray-300 select-none">
              <input type="checkbox" id="setting-sound" ${s.sound_enabled ? 'checked' : ''} class="w-4 h-4 accent-purple-600 rounded cursor-pointer" />
              <span>Auto-Read Answers</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. LIVE CLOUD AI API CONFIGURATION -->
    <div class="glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-black/40 to-purple-950/20 space-y-6 glow-cyan">
      <div class="flex items-center justify-between border-b border-white/10 pb-4">
        <div class="flex items-center gap-2 text-base font-bold text-white">
          <i data-lucide="sparkles" class="w-5 h-5 text-cyan-400"></i>
          <span>Live AI Engine (Groq LPU / GPT-OSS 120B & Gemini)</span>
        </div>
        <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Live AI Engine Active (120B Parameters)</span>
        </span>
      </div>

      <div class="text-xs text-gray-300 leading-relaxed">
        GuruG is now <strong>fully controlled by Live AI</strong> running on ultra-fast Groq LPU hardware with the <strong>GPT-OSS 120B</strong> model. All features—including conversational explanations, multilingual tutoring in 10 languages, dynamic quiz generation, 5-step problem solving, and two-way voice debate counterarguments—are generated live in real time!
      </div>

      <div class="space-y-3">
        <label class="block text-xs font-bold text-gray-300">Custom API Key (Groq, Hugging Face, OpenAI, or Gemini)</label>
        <div class="flex flex-col sm:flex-row gap-2">
          <input type="password" id="custom-gemini-key" placeholder="gsk_... or hf_... or sk-... or AIza..." class="flex-1 px-4 py-2.5 rounded-xl bg-black/50 border border-white/15 text-sm text-white font-mono focus:outline-none focus:border-cyan-400" />
          <button type="button" onclick="handleTestApiKey()" id="test-key-btn" class="px-5 py-2.5 rounded-xl font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs transition-colors shrink-0 cursor-pointer">
            Verify & Connect Key ⚡
          </button>
        </div>
        <p class="text-[10px] text-gray-400">Supports Groq LPU (<code>gsk_...</code>), Hugging Face (<code>hf_...</code>), OpenAI (<code>sk-...</code>), or Google Gemini (<code>AIza...</code>).</p>
      </div>
    </div>

    <!-- 5. ACCOUNT SIGNOUT -->
    <div class="flex items-center justify-between p-6 rounded-3xl glass-panel border border-white/10">
      <div>
        <div class="text-xs font-bold text-white">Sign Out of Session</div>
        <div class="text-[11px] text-gray-400">Clear active student session from this device</div>
      </div>
      <button onclick="handleLogout()" class="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer">
        Sign Out
      </button>
    </div>

  </div>
  `;
}

function handleSelectTheme(theme) {
  setActiveTheme(theme);
  // Re-render settings page so cards and active badges update seamlessly
  if (typeof renderSettings === 'function' && window.location.hash.includes('#/settings')) {
    const appContainer = document.getElementById('app-view');
    if (appContainer) {
      renderSettings().then(html => {
        appContainer.innerHTML = html;
        renderMathInContainer(appContainer);
        if (window.lucide) window.lucide.createIcons();
      });
    }
  }
}

function handleSelectFont(fontId) {
  setActiveFont(fontId);
  // Re-render settings page so chips and live preview update seamlessly
  if (typeof renderSettings === 'function' && window.location.hash.includes('#/settings')) {
    const appContainer = document.getElementById('app-view');
    if (appContainer) {
      renderSettings().then(html => {
        appContainer.innerHTML = html;
        renderMathInContainer(appContainer);
        if (window.lucide) window.lucide.createIcons();
        const statusEl = document.getElementById('font-applied-status');
        if (statusEl) {
          statusEl.classList.remove('hidden');
          setTimeout(() => { if (statusEl) statusEl.classList.add('hidden'); }, 2500);
        }
      });
    }
  }
}

async function handleSaveProfile(e) {
  e.preventDefault();
  const name = document.getElementById('setting-name').value.trim();
  const grade = document.getElementById('setting-grade').value;
  const lang = document.getElementById('setting-language').value;
  const mode = document.getElementById('setting-mode').value;
  const sound = document.getElementById('setting-sound').checked;
  const btn = document.getElementById('save-profile-btn');
  const alertEl = document.getElementById('settings-alert');

  btn.disabled = true;
  btn.innerText = "Saving...";

  try {
    await api.updateSettings({
      display_name: name,
      grade_level: grade,
      preferred_language: lang,
      default_mode: mode,
      sound_enabled: sound
    });

    alertEl.className = "p-4 rounded-2xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 fade-in block";
    alertEl.innerText = "Preferences saved successfully! Your chosen language and grade will persist across all sessions.";
  } catch (err) {
    alertEl.className = "p-4 rounded-2xl text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300 fade-in block";
    alertEl.innerText = "Error saving settings: " + err.message;
  } finally {
    btn.disabled = false;
    btn.innerText = "Save Profile Preferences ✓";
  }
}

async function handleTestApiKey() {
  const input = document.getElementById('custom-gemini-key');
  const btn = document.getElementById('test-key-btn');
  const alertEl = document.getElementById('settings-alert');

  if (!input || !input.value.trim()) {
    alert("Please enter a valid Groq, Hugging Face, OpenAI, or Gemini API Key first.");
    return;
  }

  btn.disabled = true;
  btn.innerText = "Verifying Key with Provider...";

  try {
    const res = await api.testGeminiKey(input.value.trim());
    if (res.status === 'valid') {
      const trimmedKey = input.value.trim();
      localStorage.setItem('gurug_custom_key', trimmedKey);
      if (api.token) {
        try {
          await api.updateSettings({ custom_gemini_key: trimmedKey });
        } catch (_) {}
      }
      alertEl.className = "p-4 rounded-2xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 fade-in block";
      alertEl.innerText = `Success! ${res.provider || 'API Key'} verified and connected. GuruG is now live!`;
    } else {
      alertEl.className = "p-4 rounded-2xl text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300 fade-in block";
      alertEl.innerText = res.message || "Key could not be verified. Operating in Local Educational Engine Mode.";
    }
  } catch (err) {
    alertEl.className = "p-4 rounded-2xl text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300 fade-in block";
    alertEl.innerText = "Error testing key: " + err.message;
  } finally {
    btn.disabled = false;
    btn.innerText = "Verify & Connect Key ⚡";
  }
}

function handleSelectVoicePersona(persona, rate) {
  const current = JSON.parse(localStorage.getItem('gurug_voice_settings') || '{}');
  current.persona = persona;
  current.rate = rate;
  localStorage.setItem('gurug_voice_settings', JSON.stringify(current));

  // Update card visuals
  ['natural_mentor', 'energetic_guide', 'calm_tutor'].forEach(p => {
    const card = document.getElementById(`persona-${p}`);
    if (card) {
      if (p === persona) {
        card.className = "p-3.5 rounded-xl border cursor-pointer transition-all border-purple-500 bg-purple-950/30 ring-1 ring-purple-500/50";
      } else {
        card.className = "p-3.5 rounded-xl border cursor-pointer transition-all border-white/10 bg-black/30 hover:border-white/20";
      }
    }
  });

  // Brief voice test feedback
  handleTestHumanVoice();
}

let isTestingVoice = false;
function handleTestHumanVoice() {
  const btn = document.getElementById('test-human-voice-btn');
  const btnText = document.getElementById('test-voice-btn-text');
  const lang = document.getElementById('setting-language')?.value || 'en';

  if (isTestingVoice) {
    TTS.stop();
    isTestingVoice = false;
    if (btnText) btnText.innerText = "Test Human Voice 🔊";
    if (btn) btn.classList.remove('ring-2', 'ring-purple-400', 'bg-purple-600/60');
    return;
  }

  isTestingVoice = true;
  if (btnText) btnText.innerText = "Speaking Natural Voice... ⏹";
  if (btn) btn.classList.add('ring-2', 'ring-purple-400', 'bg-purple-600/60');

  TTS.testVoice(
    lang,
    () => {
      isTestingVoice = true;
      if (btnText) btnText.innerText = "Speaking Natural Voice... ⏹";
      if (btn) btn.classList.add('ring-2', 'ring-purple-400', 'bg-purple-600/60');
    },
    () => {
      isTestingVoice = false;
      if (btnText) btnText.innerText = "Test Human Voice 🔊";
      if (btn) btn.classList.remove('ring-2', 'ring-purple-400', 'bg-purple-600/60');
    }
  );
}

function updateDetectedVoiceDisplay() {
  setTimeout(() => {
    const el = document.getElementById('detected-voice-tag');
    if (!el) return;
    const lang = document.getElementById('setting-language')?.value || 'en';
    const voice = TTS.getBestHumanVoice(lang);
    if (voice && voice.name) {
      const isNatural = voice.name.toLowerCase().includes('natural') || 
                        voice.name.toLowerCase().includes('online') || 
                        voice.name.toLowerCase().includes('google') ||
                        voice.name.toLowerCase().includes('neural');
      const cleanName = voice.name.replace(/Microsoft |Google |Apple /g, '').split('-')[0].trim();
      el.innerText = `${cleanName} (${isNatural ? 'Neural Natural' : 'System Voice'})`;
      el.className = isNatural 
        ? "text-[10px] text-emerald-300 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30"
        : "text-[10px] text-cyan-300 font-mono bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20";
    } else {
      el.innerText = "Natural Human Voice Active";
    }
  }, 400);
}
