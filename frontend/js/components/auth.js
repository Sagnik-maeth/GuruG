/**
 * GuruG Authentication & Onboarding Component
 */

function renderLogin() {
  return `
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full glass-panel-elevated p-8 rounded-3xl border border-white/15 glow-purple fade-in">
      
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-[1px] mx-auto mb-3 shadow-lg shadow-purple-500/30">
          <div class="w-full h-full bg-[#0B0F17] rounded-[15px] flex items-center justify-center">
            <span class="text-2xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">G</span>
          </div>
        </div>
        <h2 class="text-2xl font-extrabold text-white">Welcome Back!</h2>
        <p class="text-xs text-gray-400 mt-1">Sign in to your GuruG personal AI tutoring portal</p>
      </div>

      <!-- 1-Click Demo Guest Login Banner for Judges -->
      <div class="mb-6 p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between">
        <div>
          <div class="text-xs font-bold text-purple-200">Hackathon Judge / Instant Demo?</div>
          <div class="text-[11px] text-gray-400">One-click evaluation access</div>
        </div>
        <button onclick="handleDemoLogin()" class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all cursor-pointer">
          ⚡ 1-Click Login
        </button>
      </div>

      <!-- Error Alert -->
      <div id="auth-error" class="hidden mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300"></div>

      <!-- Form -->
      <form id="login-form" onsubmit="submitLogin(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1.5">Email or Username</label>
          <input type="text" id="login-identifier" required class="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="demo@gurug.edu or demostudent" value="demo@gurug.edu" />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-semibold text-gray-300">Password</label>
            <span class="text-[11px] text-purple-400 cursor-pointer hover:underline" onclick="alert('For demo evaluation: Use password123 or click the 1-Click Demo Login button above!')">Forgot password?</span>
          </div>
          <div class="relative">
            <input type="password" id="login-password" required class="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="••••••••" value="password123" />
            <button type="button" onclick="togglePasswordVisibility('login-password', this)" class="absolute right-3 top-2.5 text-gray-400 hover:text-white">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <button type="submit" id="login-submit-btn" class="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm shadow-lg shadow-purple-600/30 transition-all cursor-pointer">
          Sign In to GuruG
        </button>
      </form>

      <!-- Footer switch -->
      <div class="text-center mt-6 text-xs text-gray-400">
        Don't have an account yet? 
        <a href="#/signup" class="text-purple-400 font-semibold hover:underline">Create one free</a>
      </div>

    </div>
  </div>
  `;
}

function renderSignup() {
  return `
  <div class="min-h-[85vh] flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full glass-panel-elevated p-8 rounded-3xl border border-white/15 glow-purple fade-in">
      
      <!-- Header -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-extrabold text-white">Join GuruG</h2>
        <p class="text-xs text-gray-400 mt-1">Start learning in the language you understand best</p>
      </div>

      <!-- Error Alert -->
      <div id="auth-error" class="hidden mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300"></div>

      <!-- Form -->
      <form id="signup-form" onsubmit="submitSignup(event)" class="space-y-3.5">
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">Your Full Name</label>
          <input type="text" id="signup-name" required class="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="e.g. Priya Sharma" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">Username</label>
          <input type="text" id="signup-username" required class="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="e.g. priya_learns" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
          <input type="email" id="signup-email" required class="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="student@example.com" />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">Choose Password</label>
          <div class="relative">
            <input type="password" id="signup-password" required minlength="6" class="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="At least 6 characters" />
            <button type="button" onclick="togglePasswordVisibility('signup-password', this)" class="absolute right-3 top-2.5 text-gray-400 hover:text-white">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Grade Level</label>
            <select id="signup-grade" class="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500">
              <option value="Class 6–8">Class 6–8</option>
              <option value="Class 9–10" selected>Class 9–10</option>
              <option value="Class 11–12">Class 11–12</option>
              <option value="College">College</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-300 mb-1">Learning Language</label>
            <select id="signup-language" class="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500">
              <option value="English">English</option>
              <option value="Hinglish" selected>Hinglish</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
              <option value="Bengali">বাংলা (Bengali)</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
              <option value="Telugu">తెలుగు (Telugu)</option>
              <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
              <option value="Marathi">मराठी (Marathi)</option>
              <option value="Gujarati">ગુજરાતી (Gujarati)</option>
              <option value="Malayalam">മലയാളം (Malayalam)</option>
              <option value="Urdu">اردو (Urdu)</option>
            </select>
          </div>
        </div>

        <button type="submit" id="signup-submit-btn" class="w-full py-3 mt-2 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm shadow-lg shadow-purple-600/30 transition-all cursor-pointer">
          Create Account & Personalize
        </button>
      </form>

      <div class="text-center mt-5 text-xs text-gray-400">
        Already have an account? 
        <a href="#/login" class="text-purple-400 font-semibold hover:underline">Sign in</a>
      </div>

    </div>
  </div>
  `;
}

// 3-STEP STUDENT ONBOARDING WIZARD
let currentOnboardingStep = 1;
const onboardingState = {
  grade_level: 'Class 9–10',
  preferred_language: 'Hinglish',
  target_subjects: ['Mathematics', 'Physics', 'Chemistry'],
  learning_goal: 'Concept Clarity'
};

function renderOnboarding() {
  const user = api.user || {};
  return `
  <div class="min-h-[85vh] flex items-center justify-center px-4 py-12">
    <div class="max-w-xl w-full glass-panel-elevated p-8 sm:p-10 rounded-3xl border border-white/15 glow-purple fade-in" id="onboarding-card">
      
      <!-- Top Progress Indicator -->
      <div class="mb-8">
        <div class="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Student Onboarding</span>
          <span class="font-bold text-purple-300" id="onboarding-step-label">Step ${currentOnboardingStep} of 3</span>
        </div>
        <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div id="onboarding-progress-bar" class="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-300" style="width: ${(currentOnboardingStep / 3) * 100}%"></div>
        </div>
      </div>

      <!-- Step Content Container -->
      <div id="onboarding-step-container">
        ${renderOnboardingStepContent(currentOnboardingStep)}
      </div>

    </div>
  </div>
  `;
}

function renderOnboardingStepContent(step) {
  if (step === 1) {
    return `
      <div>
        <h3 class="text-2xl font-extrabold text-white mb-2">What class are you in?</h3>
        <p class="text-sm text-gray-300 mb-6">GuruG will adapt its explanations and difficulty to your academic level.</p>

        <div class="space-y-3 mb-8">
          ${['Class 6–8', 'Class 9–10', 'Class 11–12', 'College', 'Other'].map(level => `
            <div onclick="selectOnboardingGrade('${level}')" class="p-4 rounded-xl border ${onboardingState.grade_level === level ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-black/30 border-white/10 text-gray-300 hover:border-white/20'} flex items-center justify-between cursor-pointer transition-all">
              <span class="font-semibold text-sm">${level}</span>
              ${onboardingState.grade_level === level ? '<i data-lucide="check" class="w-4 h-4 text-purple-400"></i>' : ''}
            </div>
          `).join('')}
        </div>

        <button onclick="nextOnboardingStep()" class="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm shadow-lg shadow-purple-600/30">
          Continue to Language Selection →
        </button>
      </div>
    `;
  } else if (step === 2) {
    const languages = [
      { name: "Hinglish", native: "Everyday Mix" },
      { name: "English", native: "English" },
      { name: "Hindi", native: "हिन्दी" },
      { name: "Bengali", native: "বাংলা" },
      { name: "Tamil", native: "தமிழ்" },
      { name: "Telugu", native: "తెలుగు" },
      { name: "Kannada", native: "ಕನ್ನಡ" },
      { name: "Marathi", native: "मराठी" },
      { name: "Gujarati", native: "ગુજરાતી" },
      { name: "Malayalam", native: "മലയാളം" },
      { name: "Urdu", native: "اردو" }
    ];

    return `
      <div>
        <h3 class="text-2xl font-extrabold text-white mb-2">Choose your preferred language</h3>
        <p class="text-sm text-gray-300 mb-6">In which language do you think and understand concepts best?</p>

        <div class="grid grid-cols-2 gap-3 mb-8 max-h-[300px] overflow-y-auto pr-1">
          ${languages.map(l => `
            <div onclick="selectOnboardingLanguage('${l.name}')" class="p-3.5 rounded-xl border ${onboardingState.preferred_language === l.name ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-black/30 border-white/10 text-gray-300 hover:border-white/20'} cursor-pointer transition-all">
              <div class="font-bold text-sm">${l.name}</div>
              <div class="text-xs text-gray-400">${l.native}</div>
            </div>
          `).join('')}
        </div>

        <div class="flex items-center gap-3">
          <button onclick="prevOnboardingStep()" class="px-5 py-3 rounded-xl font-semibold glass-panel text-gray-300 text-sm">
            ← Back
          </button>
          <button onclick="nextOnboardingStep()" class="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm shadow-lg shadow-purple-600/30">
            Continue to Subjects & Goals →
          </button>
        </div>
      </div>
    `;
  } else if (step === 3) {
    const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "English", "History", "Geography"];
    const goals = [
      { id: "Concept Clarity", desc: "Understand difficult topics from scratch" },
      { id: "Board Exam Prep", desc: "High-yield revision, formulas & past questions" },
      { id: "Homework & Numerical Help", desc: "Step-by-step problem solver" },
      { id: "Competitive Exams", desc: "JEE / NEET / Olympiad reasoning" }
    ];

    return `
      <div>
        <h3 class="text-2xl font-extrabold text-white mb-2">Select subjects & learning goal</h3>
        <p class="text-sm text-gray-300 mb-4">Pick the subjects you'd like to focus on:</p>

        <div class="flex flex-wrap gap-2 mb-6">
          ${subjects.map(s => {
            const isSelected = onboardingState.target_subjects.includes(s);
            return `
              <button type="button" onclick="toggleOnboardingSubject('${s}')" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isSelected ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' : 'bg-black/30 border-white/10 text-gray-400'}">
                ${isSelected ? '✓ ' : '+ '} ${s}
              </button>
            `;
          }).join('')}
        </div>

        <p class="text-xs font-semibold text-gray-300 mb-2">Primary Goal:</p>
        <div class="space-y-2 mb-8">
          ${goals.map(g => `
            <div onclick="selectOnboardingGoal('${g.id}')" class="p-3 rounded-xl border ${onboardingState.learning_goal === g.id ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-black/30 border-white/10 text-gray-300'} flex items-center justify-between cursor-pointer text-xs">
              <div>
                <span class="font-bold">${g.id}</span>
                <span class="text-gray-400 block sm:inline sm:ml-2">${g.desc}</span>
              </div>
              ${onboardingState.learning_goal === g.id ? '<i data-lucide="check" class="w-4 h-4 text-purple-400"></i>' : ''}
            </div>
          `).join('')}
        </div>

        <div class="flex items-center gap-3">
          <button onclick="prevOnboardingStep()" class="px-5 py-3 rounded-xl font-semibold glass-panel text-gray-300 text-sm">
            ← Back
          </button>
          <button onclick="finishOnboarding()" class="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white text-sm shadow-xl shadow-purple-600/30">
            Launch My Personal Tutor 🚀
          </button>
        </div>
      </div>
    `;
  }
}

function selectOnboardingGrade(grade) {
  onboardingState.grade_level = grade;
  updateOnboardingStep();
}

function selectOnboardingLanguage(lang) {
  onboardingState.preferred_language = lang;
  updateOnboardingStep();
}

function toggleOnboardingSubject(subj) {
  const idx = onboardingState.target_subjects.indexOf(subj);
  if (idx > -1) {
    if (onboardingState.target_subjects.length > 1) {
      onboardingState.target_subjects.splice(idx, 1);
    }
  } else {
    onboardingState.target_subjects.push(subj);
  }
  updateOnboardingStep();
}

function selectOnboardingGoal(goal) {
  onboardingState.learning_goal = goal;
  updateOnboardingStep();
}

function nextOnboardingStep() {
  if (currentOnboardingStep < 3) {
    currentOnboardingStep++;
    updateOnboardingStep();
  }
}

function prevOnboardingStep() {
  if (currentOnboardingStep > 1) {
    currentOnboardingStep--;
    updateOnboardingStep();
  }
}

function updateOnboardingStep() {
  const container = document.getElementById('onboarding-step-container');
  const label = document.getElementById('onboarding-step-label');
  const bar = document.getElementById('onboarding-progress-bar');
  if (container) container.innerHTML = renderOnboardingStepContent(currentOnboardingStep);
  if (label) label.innerText = `Step ${currentOnboardingStep} of 3`;
  if (bar) bar.style.width = `${(currentOnboardingStep / 3) * 100}%`;
  if (window.lucide) window.lucide.createIcons();
}

async function finishOnboarding() {
  try {
    await api.completeOnboarding(onboardingState);
    window.location.hash = '#/dashboard';
  } catch (err) {
    alert("Could not save preferences: " + err.message);
  }
}

function togglePasswordVisibility(fieldId, btn) {
  const field = document.getElementById(fieldId);
  if (field) {
    const isPass = field.type === 'password';
    field.type = isPass ? 'text' : 'password';
  }
}

async function submitLogin(e) {
  e.preventDefault();
  const idEl = document.getElementById('login-identifier');
  const pwdEl = document.getElementById('login-password');
  const errEl = document.getElementById('auth-error');
  const btn = document.getElementById('login-submit-btn');

  errEl.classList.add('hidden');
  btn.disabled = true;
  btn.innerText = "Signing In...";

  try {
    await api.login(idEl.value.trim(), pwdEl.value);
    window.location.hash = '#/dashboard';
  } catch (err) {
    errEl.innerText = err.message || "Invalid credentials";
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.innerText = "Sign In to GuruG";
  }
}

async function submitSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const username = document.getElementById('signup-username').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const grade = document.getElementById('signup-grade').value;
  const lang = document.getElementById('signup-language').value;
  const errEl = document.getElementById('auth-error');
  const btn = document.getElementById('signup-submit-btn');

  errEl.classList.add('hidden');
  btn.disabled = true;
  btn.innerText = "Creating Account...";

  try {
    await api.register(username, email, password, name, grade, lang);
    onboardingState.grade_level = grade;
    onboardingState.preferred_language = lang;
    currentOnboardingStep = 3; // jump straight to subjects & goals
    window.location.hash = '#/onboarding';
  } catch (err) {
    errEl.innerText = err.message || "Registration failed";
    errEl.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.innerText = "Create Account & Personalize";
  }
}
