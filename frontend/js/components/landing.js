/**
 * GuruG Marketing Landing Page Component
 */

function renderLanding() {
  return `
  <div class="relative overflow-hidden">

    <!-- Atmospheric Glowing Gradients -->
    <div class="bg-glow-orb w-[600px] h-[600px] bg-purple-600 top-[-100px] left-[-200px]"></div>
    <div class="bg-glow-orb w-[500px] h-[500px] bg-cyan-600 top-[300px] right-[-150px]"></div>
    <div class="bg-glow-orb w-[700px] h-[700px] bg-indigo-600 bottom-[400px] left-[10%]"></div>

    <!-- HERO SECTION -->
    <section class="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="text-center max-w-3xl mx-auto">
        
        <!-- Startup Tagline Pill -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-purple-500/30 text-xs sm:text-sm font-medium text-purple-200 mb-8 fade-in">
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          Next-Gen Multilingual AI EdTech Platform
        </div>

        <!-- Main Headline -->
        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] fade-in">
          Learning Has <br class="hidden sm:block"/>
          <span class="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            No Language Barrier.
          </span>
        </h1>

        <!-- Supporting Text -->
        <p class="text-lg sm:text-xl text-gray-300 mb-10 leading-relaxed font-normal fade-in">
          Meet <strong class="text-white font-semibold">GuruG</strong>, your personal AI tutor that explains difficult concepts in the language you understand best. Learn smarter, ask questions freely without hesitation, and progress at your own pace.
        </p>

        <!-- CTAs -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 fade-in">
          <a href="#/signup" class="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] transition-all text-center">
            Start Learning for Free
          </a>
          <button onclick="handleDemoLogin()" class="w-full sm:w-auto px-7 py-4 rounded-xl text-base font-semibold glass-panel hover:bg-white/10 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/60 shadow-lg shadow-cyan-950/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
            <span>⚡ Instant Demo Access</span>
            <span class="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200">Judges</span>
          </button>
        </div>

        <!-- Trust & Target Audience Badges -->
        <div class="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 border-t border-white/10 pt-8">
          <div class="flex items-center gap-1.5"><i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i> Class 6 to 12 & College</div>
          <div class="flex items-center gap-1.5"><i data-lucide="languages" class="w-4 h-4 text-cyan-400"></i> 10 Indian Languages + Hinglish</div>
          <div class="flex items-center gap-1.5"><i data-lucide="shield-check" class="w-4 h-4 text-purple-400"></i> Teenager Safe & Zero Jargon</div>
          <div class="flex items-center gap-1.5"><i data-lucide="sparkles" class="w-4 h-4 text-amber-400"></i> Step-by-Step Reasoning</div>
        </div>

      </div>

      <!-- INTERACTIVE LIVE TUTOR PREVIEW WIDGET -->
      <div class="mt-16 max-w-4xl mx-auto glass-panel-elevated rounded-2xl overflow-hidden border border-white/15 glow-purple">
        <!-- Mock App Header -->
        <div class="bg-black/40 px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div class="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div class="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span class="ml-2 text-xs text-gray-400 font-mono">gurug.app/tutor — Live Interactive Preview</span>
          </div>

          <!-- Live Language Picker on Hero Widget -->
          <div class="flex items-center gap-2">
            <span class="text-[11px] text-gray-400 hidden sm:inline">Try Language:</span>
            <select id="hero-lang-selector" onchange="updateHeroPreview(this.value)" class="bg-[#121824] border border-white/20 text-xs text-cyan-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-purple-400">
              <option value="Hinglish" selected>Hinglish (Everyday Mix)</option>
              <option value="Hindi">हिन्दी (Devanagari)</option>
              <option value="English">English</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
              <option value="Bengali">বাংলা (Bengali)</option>
              <option value="Telugu">తెలుగు (Telugu)</option>
            </select>
          </div>
        </div>

        <!-- Chat Conversation Area -->
        <div class="p-6 space-y-4 bg-[#0A0D14]/90" id="hero-preview-container">
          <!-- Student Question -->
          <div class="flex items-start gap-3 justify-end">
            <div class="bg-purple-600/25 border border-purple-500/30 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-purple-100 max-w-md shadow-sm">
              <p class="font-medium" id="hero-student-question">"Can you explain Newton's 2nd Law ($F=ma$) with a cricket example?"</p>
            </div>
            <div class="w-8 h-8 rounded-lg bg-purple-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              S
            </div>
          </div>

          <!-- GuruG Tutor Answer -->
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-lg shadow-purple-500/20">
              G
            </div>
            <div class="bg-[#141A29] border border-white/10 rounded-2xl rounded-tl-sm p-4 text-sm text-gray-200 max-w-2xl shadow-md">
              <div class="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                <span class="text-xs font-semibold text-purple-300">GuruG AI Tutor</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" id="hero-preview-badge">Mode: Real-Life Examples</span>
              </div>
              <div id="hero-preview-body" class="leading-relaxed">
                <!-- Dynamically updated by JS based on language selection -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- THE PROBLEM VS THE GURUG SOLUTION -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">The EdTech Challenge</h2>
        <p class="text-3xl sm:text-4xl font-extrabold text-white">Why Conventional Learning Fails Many Students</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <!-- Problem Card -->
        <div class="glass-panel rounded-2xl p-8 border border-rose-500/20 bg-gradient-to-b from-rose-950/20 to-transparent">
          <div class="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6">
            <i data-lucide="alert-triangle" class="w-6 h-6"></i>
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">The Student Reality</h3>
          <ul class="space-y-4 text-sm text-gray-300">
            <li class="flex items-start gap-3">
              <span class="text-rose-400 font-bold">✕</span>
              <span><strong>Language & Medium Barriers:</strong> Textbooks and tutorials in English often obscure scientific and mathematical ideas from non-native speakers.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-rose-400 font-bold">✕</span>
              <span><strong>Hesitation & Judgment:</strong> Over 68% of teenagers hesitate to raise basic doubts in crowded classrooms for fear of looking foolish.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-rose-400 font-bold">✕</span>
              <span><strong>Answer-First Syndrome:</strong> Generic chatbots dump final answers without teaching the logical reasoning required to solve exam problems.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-rose-400 font-bold">✕</span>
              <span><strong>One-Speed-Fits-All:</strong> Every student has a unique pace, but traditional curricula move ahead regardless of gaps in fundamentals.</span>
            </li>
          </ul>
        </div>

        <!-- Solution Card -->
        <div class="glass-panel rounded-2xl p-8 border border-emerald-500/20 bg-gradient-to-b from-emerald-950/20 to-transparent">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
            <i data-lucide="check-circle" class="w-6 h-6"></i>
          </div>
          <h3 class="text-2xl font-bold text-white mb-4">The GuruG Transformation</h3>
          <ul class="space-y-4 text-sm text-gray-300">
            <li class="flex items-start gap-3">
              <span class="text-emerald-400 font-bold">✓</span>
              <span><strong>Fluent Multilingual Tutoring:</strong> Understand difficult physics and math concepts in Hindi, Hinglish, Tamil, Bengali, Telugu, and 5 more languages.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-emerald-400 font-bold">✓</span>
              <span><strong>Patient, Safe & Judgment-Free:</strong> Ask unlimited follow-up questions at 11 PM or 6 AM. GuruG never tires or makes you feel embarrassed.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-emerald-400 font-bold">✓</span>
              <span><strong>Pedagogical Step-by-Step Solver:</strong> Breaks problems into Concept -> Strategy -> Execution -> Practice Problem to build true mastery.</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-emerald-400 font-bold">✓</span>
              <span><strong>Adaptive Depth (6 Modes):</strong> Switch effortlessly between "Explain Like I'm 10", "Real-Life Examples", and "Exam Preparation".</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 6 CORE FEATURES SHOWCASE -->
    <section id="features" class="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Engineered for Academic Excellence</h2>
        <p class="text-3xl sm:text-4xl font-extrabold text-white">Everything a Student Needs to Excel</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- Feature 1 -->
        <div class="glass-panel p-6 rounded-2xl hover:border-purple-500/40 transition-all hover:translate-y-[-2px] group">
          <div class="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
            <i data-lucide="languages" class="w-6 h-6"></i>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Multilingual AI Tutor</h3>
          <p class="text-sm text-gray-300 leading-relaxed">
            Native support for 10 regional Indian languages + everyday Hinglish. The language choice changes actual AI reasoning, not just UI labels.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="glass-panel p-6 rounded-2xl hover:border-indigo-500/40 transition-all hover:translate-y-[-2px] group">
          <div class="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
            <i data-lucide="sliders" class="w-6 h-6"></i>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">6 Adaptive Explanation Modes</h3>
          <p class="text-sm text-gray-300 leading-relaxed">
            From "Explain Like I'm 10" with fun metaphors to "Exam Preparation" with high-yield formulas and definitions.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="glass-panel p-6 rounded-2xl hover:border-cyan-500/40 transition-all hover:translate-y-[-2px] group">
          <div class="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
            <i data-lucide="check-square" class="w-6 h-6"></i>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Smart Quiz Generator</h3>
          <p class="text-sm text-gray-300 leading-relaxed">
            Generate customized test quizzes by topic, difficulty, and question type. Receive instant scoring and detailed pedagogical explanations for every answer.
          </p>
        </div>

        <!-- Feature 4 -->
        <div class="glass-panel p-6 rounded-2xl hover:border-blue-500/40 transition-all hover:translate-y-[-2px] group">
          <div class="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
            <i data-lucide="compass" class="w-6 h-6"></i>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Subject-Wise Learning</h3>
          <p class="text-sm text-gray-300 leading-relaxed">
            Curated taxonomy across Mathematics, Physics, Chemistry, Biology, CS, English, History, and Geography with chapter guides and formula cheat-sheets.
          </p>
        </div>

        <!-- Feature 5 -->
        <div class="glass-panel p-6 rounded-2xl hover:border-emerald-500/40 transition-all hover:translate-y-[-2px] group">
          <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
            <i data-lucide="calculator" class="w-6 h-6"></i>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Step-by-Step Problem Solver</h3>
          <p class="text-sm text-gray-300 leading-relaxed">
            Input any numerical or theorem. GuruG explains the concept, strategic approach, calculation steps, and presents a similar practice problem.
          </p>
        </div>

        <!-- Feature 6 -->
        <div class="glass-panel p-6 rounded-2xl hover:border-amber-500/40 transition-all hover:translate-y-[-2px] group">
          <div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
            <i data-lucide="trending-up" class="w-6 h-6"></i>
          </div>
          <h3 class="text-lg font-bold text-white mb-2">Learning Progress & Streaks</h3>
          <p class="text-sm text-gray-300 leading-relaxed">
            Track questions asked, average quiz score, concepts mastered, and active learning streaks with visual diagnostics of weak topics.
          </p>
        </div>

      </div>
    </section>

    <!-- HOW IT WORKS (3 SIMPLE STEPS) -->
    <section id="how-it-works" class="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">Simple 3-Step Journey</h2>
        <p class="text-3xl sm:text-4xl font-extrabold text-white">How Students Learn with GuruG</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Step 1 -->
        <div class="glass-panel p-8 rounded-2xl relative border-purple-500/20">
          <div class="w-10 h-10 rounded-full bg-purple-600 text-white font-extrabold flex items-center justify-center mb-6 text-lg shadow-lg shadow-purple-600/30">
            1
          </div>
          <h3 class="text-xl font-bold text-white mb-3">Pick Subject & Language</h3>
          <p class="text-sm text-gray-300 leading-relaxed">
            Choose your academic subject and select your preferred native language or conversational Hinglish. GuruG adapts its entire teaching tone to your grade level.
          </p>
        </div>

        <!-- Step 2 -->
        <div class="glass-panel p-8 rounded-2xl relative border-indigo-500/20">
          <div class="w-10 h-10 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center mb-6 text-lg shadow-lg shadow-indigo-600/30">
            2
          </div>
          <h3 class="text-xl font-bold text-white mb-3">Ask Any Academic Question</h3>
          <p class="text-sm text-gray-300 leading-relaxed">
            Type or paste equations, homework doubts, or conceptual questions. Select how you want it explained — from ELI10 analogies to rigorous exam preparations.
          </p>
        </div>

        <!-- Step 3 -->
        <div class="glass-panel p-8 rounded-2xl relative border-cyan-500/20">
          <div class="w-10 h-10 rounded-full bg-cyan-600 text-white font-extrabold flex items-center justify-center mb-6 text-lg shadow-lg shadow-cyan-600/30">
            3
          </div>
          <h3 class="text-xl font-bold text-white mb-3">Understand, Practice & Master</h3>
          <p class="text-sm text-gray-300 leading-relaxed">
            Reinforce what you learned with instant AI quizzes, listen to audio explanations, solve related practice problems, and watch your confidence grow.
          </p>
        </div>
      </div>
    </section>

    <!-- HACKATHON INNOVATION & RESPONSIBLE AI SECTION -->
    <section id="tech" class="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/10">
      <div class="glass-panel-elevated rounded-3xl p-8 sm:p-12 border border-white/15 bg-gradient-to-tr from-purple-950/30 via-black/40 to-cyan-950/30">
        <div class="max-w-3xl">
          <span class="text-xs font-bold uppercase tracking-wider text-cyan-400">Innovation & Pedagogy</span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-white mt-2 mb-6">Designed as a True Learning Companion, Not a Shortcut</h2>
          <p class="text-base text-gray-300 leading-relaxed mb-8">
            GuruG is built on foundational pedagogical principles: <strong>reasoning over rote memorization</strong>. Unlike generic search engines or conversational chatbots that provide raw answers to be copied, GuruG encourages critical thinking, validates assumptions, and provides step-by-step logic.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-purple-500/20 text-purple-300 shrink-0">
                <i data-lucide="shield-alert" class="w-5 h-5"></i>
              </div>
              <div>
                <h4 class="font-bold text-white">Teenager & Privacy First</h4>
                <p class="text-gray-400 text-xs mt-1">Zero unnecessary personal data collection. Student conversations remain strictly private and safe.</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 shrink-0">
                <i data-lucide="cpu" class="w-5 h-5"></i>
              </div>
              <div>
                <h4 class="font-bold text-white">Dual-Mode AI Architecture</h4>
                <p class="text-gray-400 text-xs mt-1">Seamlessly connects to Google Gemini Cloud API with automatic local educational engine fallback.</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
                <i data-lucide="heart-handshake" class="w-5 h-5"></i>
              </div>
              <div>
                <h4 class="font-bold text-white">Teacher Companion Model</h4>
                <p class="text-gray-400 text-xs mt-1">Designed to support and reinforce classroom teachers, giving students 1-on-1 after-school clarity.</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <div class="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0">
                <i data-lucide="volume-2" class="w-5 h-5"></i>
              </div>
              <div>
                <h4 class="font-bold text-white">Auditory Accessibility</h4>
                <p class="text-gray-400 text-xs mt-1">Integrated Web Speech synthesis allows students to listen aloud to explanations in their language.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FINAL CALL TO ACTION -->
    <section class="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
      <div class="p-10 sm:p-16 rounded-3xl glass-panel-elevated border border-purple-500/30 relative overflow-hidden glow-purple">
        <h2 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Your Next Learning Breakthrough <br/>Starts Here.
        </h2>
        <p class="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto mb-8">
          Join thousands of students mastering difficult concepts in the language they think in. No pressure, no judgment, 100% personalized.
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#/signup" class="px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/30 hover:scale-105 transition-all">
            Start Learning with GuruG Free
          </a>
          <button onclick="handleDemoLogin()" class="px-6 py-4 rounded-xl text-base font-medium glass-panel text-gray-200 hover:text-white hover:bg-white/10 transition-all">
            ⚡ Explore Live Demo
          </button>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="border-t border-white/10 bg-[#06080D] py-12 px-4 sm:px-6 lg:px-8 text-xs text-gray-400">
      <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-md bg-purple-600 flex items-center justify-center text-xs font-bold text-white">G</div>
          <span class="text-sm font-bold text-white">GuruG</span>
          <span>— Your Personal AI Tutor. Your Language. Your Pace.</span>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-6">
          <a href="#features" class="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" class="hover:text-white transition-colors">How It Works</a>
          <a href="#tech" class="hover:text-white transition-colors">Safety & Ethics</a>
          <a href="https://github.com" target="_blank" class="hover:text-white transition-colors">GitHub</a>
          <span class="text-gray-500">Built with ❤️ for Indian Students</span>
        </div>
      </div>
    </footer>

  </div>
  `;
}

// Sample explanations across languages for the live hero widget
const HERO_PREVIEWS = {
  Hinglish: {
    question: '"Newton ka Second Law ($F=ma$) cricket example se samjhaiye."',
    badge: 'Mode: Real-Life Examples (Hinglish)',
    content: `
      <p class="font-semibold text-white mb-2">Cricket Example se Samajhte Hain:</p>
      <p class="mb-2">Formula hai: <strong>$F = m \\cdot a$</strong> (Force = Mass $\\times$ Acceleration).</p>
      <p class="mb-2">Jab Rohit Sharma ya Virat Kohli fast bowler ki ball ko catch karte hain, to wo apne haath peeche ki taraf kheechte hain! Kyun?</p>
      <ul class="list-disc ml-5 space-y-1 mb-2 text-gray-300">
        <li>Haath peeche karne se ball ko stop hone ke liye <strong>zyada time</strong> milta hai.</li>
        <li>Time badhne se ball ka deceleration ($a$) kam ho jata hai.</li>
        <li>Aur jab $a$ kam hota hai, to fielder ke haath par lagne wala <strong>Force ($F$) bhi bohot kam</strong> ho jata hai!</li>
      </ul>
      <p class="text-xs text-purple-300 font-medium">💡 Conclusion: Haath peeche na karein to chot lag sakti hai — yeh Newton ka 2nd Law practical life mein hai!</p>
    `
  },
  Hindi: {
    question: '"न्यूटन के दूसरे नियम ($F=ma$) को क्रिकेट के उदाहरण से समझाइए।"',
    badge: 'मोड: वास्तविक जीवन के उदाहरण (हिन्दी)',
    content: `
      <p class="font-semibold text-white mb-2">क्रिकेट के उदाहरण से समझें:</p>
      <p class="mb-2">न्यूटन का दूसरा नियम: <strong>$$F = m \\cdot a$$</strong></p>
      <p class="mb-2">जब कोई खिलाड़ी तेजी से आती गेंद को कैच करता है, तो वह अपने हाथों को पीछे की ओर खींचता है:</p>
      <ul class="list-disc ml-5 space-y-1 mb-2 text-gray-300">
        <li>हाथ पीछे करने से संवेग परिवर्तन (change in momentum) का समय अंतराल बढ़ जाता है।</li>
        <li>समय बढ़ने से त्वरण ($a$) का मान घट जाता है।</li>
        <li>परिणामस्वरूप हाथों पर लगने वाला बल ($F$) बहुत कम हो जाता है और चोट नहीं लगती।</li>
      </ul>
      <p class="text-xs text-purple-300 font-medium">💡 यह न्यूटन के गति के द्वितीय नियम का स्पष्ट व्यावहारिक प्रमाण है।</p>
    `
  },
  English: {
    question: '"Explain Newton\'s 2nd Law ($F=ma$) using a cricket ball catch example."',
    badge: 'Mode: Real-Life Examples (English)',
    content: `
      <p class="font-semibold text-white mb-2">Cricket Fielder Analogy:</p>
      <p class="mb-2">Newton\'s Second Law is formulated as: <strong>$$F = m \\cdot a$$</strong></p>
      <p class="mb-2">Why does a cricket fielder pull their hands backward while taking a catch?</p>
      <ul class="list-disc ml-5 space-y-1 mb-2 text-gray-300">
        <li>By pulling hands back, the fielder increases the <strong>time duration ($\\Delta t$)</strong> over which the ball\'s velocity reduces to zero.</li>
        <li>Since acceleration $a = \\frac{\\Delta v}{\\Delta t}$, increasing time decreases acceleration.</li>
        <li>Consequently, the impact force $F = m \\cdot a$ exerted on the palms is drastically reduced, preventing injury!</li>
      </ul>
      <p class="text-xs text-purple-300 font-medium">💡 Conceptual Mastery: Soft hands reduce impact force through deliberate time prolongation.</p>
    `
  },
  Tamil: {
    question: '"நியூட்டனின் இரண்டாம் விதியை ($F=ma$) கிரிக்கெட் உதாரணத்துடன் விளக்குக."',
    badge: 'முறை: நிஜ வாழ்க்கை உதாரணம் (தமிழ்)',
    content: `
      <p class="font-semibold text-white mb-2">கிரிக்கெட் உதாரணம்:</p>
      <p class="mb-2">சூத்திரம்: <strong>$$F = m \\cdot a$$</strong> (விசை = நிறை $\\times$ முடுக்கம்)</p>
      <p class="mb-2">ஒரு பீல்டர் பந்தைப் பிடிக்கும்போது தனது கைகளைப் பின்னோக்கி இழுக்கிறார். காரணம்:</p>
      <ul class="list-disc ml-5 space-y-1 mb-2 text-gray-300">
        <li>கைகளைப் பின்னோக்கி இழுப்பதால் பந்து நிற்கும் <strong>நேரம் அதிகரிக்கிறது</strong>.</li>
        <li>நேரம் அதிகரிப்பதால் பந்தின் முடுக்கம் ($a$) குறைகிறது.</li>
        <li>எனவே கைகளில் படும் விசை ($F$) குறைந்து, காயம் ஏற்படாமல் பாதுகாக்கிறது!</li>
      </ul>
    `
  },
  Bengali: {
    question: '"নিউটনের দ্বিতীয় সূত্র ($F=ma$) ক্রিকেটের উদাহরণ দিয়ে বুঝিয়ে দাও।"',
    badge: 'মোড: বাস্তব জীবনের উদাহরণ (বাংলা)',
    content: `
      <p class="font-semibold text-white mb-2">ক্রিকেটের ক্যাচ ধরার সহজ উদাহরণ:</p>
      <p class="mb-2">সূত্র: <strong>$$F = m \\cdot a$$</strong> (বল = ভর $\\times$ ত্বরণ)</p>
      <p class="mb-2">ক্রিকেটে ফিল্ডার যখন ক্যাচ ধরে, তখন সে হাত পেছনের দিকে টানে। কারণ:</p>
      <ul class="list-disc ml-5 space-y-1 mb-2 text-gray-300">
        <li>হাত পেছনে টানলে বল থামার <strong>সময় বাড়ে</strong>।</li>
        <li>সময় বাড়লে মন্থন বা ত্বরণ ($a$) কমে যায়।</li>
        <li>ফলে হাতের তালুতে প্রযুক্ত বল ($F$) অনেকটাই কমে যায় এবং আঘাত লাগে না।</li>
      </ul>
    `
  },
  Telugu: {
    question: '"న్యూటన్ రెండవ నియమాన్ని ($F=ma$) క్రికెట్ ఉదాహరణతో వివరించండి."',
    badge: 'మోడ్: వాస్తవ జీవిత ఉదాహరణ (తెలుగు)',
    content: `
      <p class="font-semibold text-white mb-2">క్రికెట్ ఉదాహరణతో అర్థం చేసుకుందాం:</p>
      <p class="mb-2">సూత్రం: <strong>$$F = m \\cdot a$$</strong> (బలము = ద్రవ్యరాశి $\\times$ త్వరణము)</p>
      <p class="mb-2">ఫీల్డర్ క్యాచ్ పట్టుకునేటప్పుడు చేతులను వెనక్కి లాగుతాడు. ఎందుకంటే:</p>
      <ul class="list-disc ml-5 space-y-1 mb-2 text-gray-300">
        <li>చేతులను వెనక్కి లాగడం వల్ల బంతి వేగం తగ్గడానికి <strong>ఎక్కువ సమయం</strong> లభిస్తుంది.</li>
        <li>సమయం పెరగడం వల్ల త్వరణం ($a$) తగ్గుతుంది.</li>
        <li>దీనివల్ల చేతులపై పడే బలం ($F$) తగ్గి, గాయం కాకుండా ఉంటుంది!</li>
      </ul>
    `
  }
};

function updateHeroPreview(lang) {
  const item = HERO_PREVIEWS[lang] || HERO_PREVIEWS['Hinglish'];
  const qEl = document.getElementById('hero-student-question');
  const badgeEl = document.getElementById('hero-preview-badge');
  const bodyEl = document.getElementById('hero-preview-body');

  if (qEl) qEl.innerHTML = item.question;
  if (badgeEl) badgeEl.innerText = item.badge;
  if (bodyEl) {
    bodyEl.innerHTML = item.content;
    renderMathInContainer(bodyEl);
  }
}
