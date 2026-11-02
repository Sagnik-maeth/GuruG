/**
 * GuruG Left Sidebar / Taskbar Navigation Component
 * Modern vertical left sidebar taskbar with Light/Dark theme and dynamic font management
 */

// Available font configurations
window.FONT_OPTIONS = [
  { id: 'jakarta', name: 'Plus Jakarta Sans', category: 'Modern & Geometric', sample: 'Ideal balance of geometry & legibility', family: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" },
  { id: 'inter', name: 'Inter', category: 'Crisp & Academic', sample: 'Ultra-clean text for deep study sessions', family: "'Inter', sans-serif" },
  { id: 'poppins', name: 'Poppins', category: 'Friendly & Rounded', sample: 'Approachable curves designed for school students', family: "'Poppins', sans-serif" },
  { id: 'outfit', name: 'Outfit', category: 'Futuristic & Sharp', sample: 'High-tech aesthetic with sharp clean glyphs', family: "'Outfit', sans-serif" },
  { id: 'lexend', name: 'Lexend', category: 'Reading Speed & Comprehension', sample: 'Scientifically engineered to reduce visual stress', family: "'Lexend', sans-serif" },
  { id: 'comic', name: 'Comic Neue', category: 'Dyslexia-Friendly & Casual', sample: 'Warm, relaxed, and dyslexia accessible', family: "'Comic Neue', cursive, sans-serif" },
  { id: 'roboto', name: 'Roboto', category: 'Classic & Balanced', sample: 'Trusted global standard with neutral rhythm', family: "'Roboto', sans-serif" }
];

function getActiveTheme() {
  try {
    return localStorage.getItem('gurug_theme') || 'dark';
  } catch (e) {
    return 'dark';
  }
}

function setActiveTheme(theme) {
  const isLight = theme === 'light';
  if (isLight) {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    try { localStorage.setItem('gurug_theme', 'light'); } catch (e) {}
  } else {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
    try { localStorage.setItem('gurug_theme', 'dark'); } catch (e) {}
  }

  // Update Left Sidebar UI to reflect new theme
  const navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    navbarContainer.innerHTML = renderNavbar();
    initNavbarEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  // If currently viewing settings page, update theme cards
  const darkCard = document.getElementById('theme-card-dark');
  const lightCard = document.getElementById('theme-card-light');
  if (darkCard && lightCard) {
    if (isLight) {
      lightCard.classList.add('ring-2', 'ring-purple-500', 'border-purple-500');
      darkCard.classList.remove('ring-2', 'ring-purple-500', 'border-purple-500');
    } else {
      darkCard.classList.add('ring-2', 'ring-purple-500', 'border-purple-500');
      lightCard.classList.remove('ring-2', 'ring-purple-500', 'border-purple-500');
    }
  }
}

function toggleTheme() {
  const current = getActiveTheme();
  setActiveTheme(current === 'dark' ? 'light' : 'dark');
}

function getActiveFont() {
  try {
    return localStorage.getItem('gurug_font') || 'jakarta';
  } catch (e) {
    return 'jakarta';
  }
}

function setActiveFont(fontId) {
  const fontObj = window.FONT_OPTIONS.find(f => f.id === fontId) || window.FONT_OPTIONS[0];
  document.documentElement.setAttribute('data-font', fontObj.id);
  document.documentElement.style.setProperty('--app-font', fontObj.family);
  document.body.style.fontFamily = fontObj.family;
  try { localStorage.setItem('gurug_font', fontObj.id); } catch (e) {}

  // Update Settings page live font preview if visible
  const livePreview = document.getElementById('font-live-preview');
  if (livePreview) {
    livePreview.style.fontFamily = fontObj.family;
  }
  const previewBadge = document.getElementById('font-preview-name');
  if (previewBadge) {
    previewBadge.innerText = fontObj.name;
  }
  const statusEl = document.getElementById('font-applied-status');
  if (statusEl) {
    statusEl.classList.remove('hidden');
    setTimeout(() => {
      if (statusEl) statusEl.classList.add('hidden');
    }, 2500);
  }
}

function renderNavbar() {
  const isAuth = api.isAuthenticated();
  const user = api.user || {};
  const currentHash = window.location.hash || '#/';
  const activeTheme = getActiveTheme();

  const navLinksAuth = [
    { label: 'Dashboard', href: '#/dashboard', icon: 'layout-dashboard' },
    { label: 'AI Tutor', href: '#/tutor', icon: 'sparkles', badge: '120B AI', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    { label: 'Debate Arena', href: '#/debate', icon: 'swords', badge: 'Voice', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    { label: 'Subjects', href: '#/subjects', icon: 'book-open' },
    { label: 'Practice & Quiz', href: '#/quiz', icon: 'check-circle' },
    { label: 'Problem Solver', href: '#/solver', icon: 'calculator' },
    { label: 'Progress & Stats', href: '#/progress', icon: 'trending-up' },
    { label: 'Settings & Theme', href: '#/settings', icon: 'settings' }
  ];

  const navLinksPublic = [
    { label: 'Home', href: '#/', icon: 'home' },
    { label: 'Features', href: '#features', icon: 'sparkles' },
    { label: 'How It Works', href: '#how-it-works', icon: 'help-circle' },
    { label: 'Subjects', href: '#subjects-preview', icon: 'book-open' },
    { label: 'Innovation', href: '#tech', icon: 'cpu' },
    { label: 'Sign In', href: '#/login', icon: 'log-in' },
    { label: 'Get Started', href: '#/signup', icon: 'user-plus' }
  ];

  const links = isAuth ? navLinksAuth : navLinksPublic;

  return `
  <!-- ========================================================
       DESKTOP LEFT SIDEBAR TASKBAR (Pinned to left side of screen)
       ======================================================== -->
  <aside id="desktop-sidebar" class="hidden md:flex flex-col w-64 h-screen sticky top-0 glass-panel border-r border-white/10 z-40 select-none overflow-hidden shrink-0">
    
    <!-- Top Brand Header -->
    <div class="p-5 border-b border-white/10 flex items-center justify-between">
      <a href="${isAuth ? '#/dashboard' : '#/'}" class="flex items-center gap-3 group cursor-pointer">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-all shrink-0">
          <div class="w-full h-full bg-[#0B0F17] rounded-[11px] flex items-center justify-center">
            <span class="text-xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">G</span>
          </div>
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <span class="text-xl font-extrabold tracking-tight text-white group-hover:text-purple-300 transition-colors">Guru<span class="text-cyan-400">G</span></span>
            <span class="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">AI Tutor</span>
          </div>
          <span class="text-[10px] text-gray-400 tracking-tight">Your Language. Your Pace.</span>
        </div>
      </a>
    </div>

    <!-- Quick Control Strip: Theme Switcher & Language -->
    <div class="px-4 py-2.5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between gap-2 text-xs">
      <!-- 1-Click Theme Toggle -->
      <button onclick="toggleTheme()" class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer" title="Switch Theme (Light / Dark)">
        ${activeTheme === 'dark' ? 
          `<i data-lucide="moon" class="w-4 h-4 text-purple-400"></i><span class="text-[11px] font-medium">Dark Mode</span>` : 
          `<i data-lucide="sun" class="w-4 h-4 text-amber-500"></i><span class="text-[11px] font-medium text-slate-700">Light Mode</span>`
        }
      </button>

      <!-- Active Language Badge -->
      ${isAuth ? `
        <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] font-semibold text-purple-300">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>${user.preferred_language || 'English'}</span>
        </div>
      ` : `
        <button onclick="handleDemoLogin()" class="text-[11px] font-bold text-cyan-400 hover:underline cursor-pointer">
          ⚡ Demo
        </button>
      `}
    </div>

    <!-- Navigation Menu Items -->
    <nav class="flex-1 overflow-y-auto py-3 px-3 space-y-1">
      <div class="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1">
        ${isAuth ? 'Academic Navigation' : 'Explore Platform'}
      </div>

      ${links.map(link => {
        const isActive = currentHash === link.href;
        return `
          <a href="${link.href}" class="sidebar-nav-item flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-transparent transition-all ${
            isActive 
              ? 'active text-purple-300' 
              : 'text-gray-300 hover:text-white hover:bg-white/5'
          }">
            <div class="flex items-center gap-3">
              <i data-lucide="${link.icon || 'circle'}" class="w-4 h-4 ${isActive ? 'text-purple-400' : 'text-gray-400'}"></i>
              <span>${link.label}</span>
            </div>
            ${link.badge ? `
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${link.badgeColor || 'bg-white/10 text-gray-300 border-white/20'}">
                ${link.badge}
              </span>
            ` : ''}
          </a>
        `;
      }).join('')}

      ${!isAuth ? `
        <div class="pt-3 border-t border-white/10 mt-3">
          <button onclick="handleDemoLogin()" class="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800/80 hover:to-indigo-800/80 text-purple-200 border border-purple-500/40 text-xs font-semibold shadow-sm transition-all cursor-pointer">
            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span>⚡ 1-Click Demo Login</span>
          </button>
        </div>
      ` : ''}
    </nav>

    <!-- Bottom User Profile Card -->
    <div class="p-3 border-t border-white/10 bg-white/[0.02]">
      ${isAuth ? `
        <div class="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
              ${(user.display_name || 'S')[0]}
            </div>
            <div class="min-w-0">
              <div class="text-xs font-semibold text-white truncate">${user.display_name || 'Student'}</div>
              <div class="text-[10px] text-gray-400 truncate">${user.grade_level || 'Grade 9–10'}</div>
            </div>
          </div>
          <button onclick="handleLogout()" class="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors" title="Sign Out">
            <i data-lucide="log-out" class="w-4 h-4"></i>
          </button>
        </div>
      ` : `
        <div class="text-center text-[11px] text-gray-400">
          <span>AI-Powered Personal Education</span>
        </div>
      `}
    </div>

  </aside>

  <!-- ========================================================
       MOBILE TOP BAR (Visible only on mobile screens < 768px)
       ======================================================== -->
  <header id="mobile-topbar" class="md:hidden sticky top-0 z-30 glass-panel border-b border-white/10 px-4 py-3 flex items-center justify-between shrink-0">
    <!-- Left: Hamburger toggle -->
    <button id="mobile-menu-toggle" class="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer">
      <i data-lucide="menu" class="w-5 h-5"></i>
    </button>

    <!-- Center: Brand Logo -->
    <a href="${isAuth ? '#/dashboard' : '#/'}" class="flex items-center gap-2">
      <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center font-bold text-xs text-white">G</div>
      <span class="text-base font-extrabold text-white">Guru<span class="text-cyan-400">G</span></span>
    </a>

    <!-- Right: Theme Switcher -->
    <button onclick="toggleTheme()" class="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer" title="Toggle Theme">
      ${activeTheme === 'dark' ? 
        `<i data-lucide="moon" class="w-5 h-5 text-purple-400"></i>` : 
        `<i data-lucide="sun" class="w-5 h-5 text-amber-500"></i>`
      }
    </button>
  </header>

  <!-- ========================================================
       MOBILE SLIDE-IN DRAWER (Slides from left on mobile)
       ======================================================== -->
  <div id="mobile-drawer-backdrop" class="hidden md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity">
    <aside id="mobile-sidebar" class="w-72 max-w-[85vw] h-full bg-[var(--bg-secondary)] border-r border-white/10 flex flex-col p-4 shadow-2xl overflow-y-auto">
      
      <!-- Drawer Header -->
      <div class="flex items-center justify-between pb-4 border-b border-white/10">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center font-bold text-xs text-white">G</div>
          <div>
            <div class="text-sm font-extrabold text-white">Guru<span class="text-cyan-400">G</span></div>
            <div class="text-[10px] text-gray-400">Personal AI Tutor</div>
          </div>
        </div>
        <button id="mobile-menu-close" class="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Theme Switch in Drawer -->
      <div class="py-3 border-b border-white/10 flex items-center justify-between">
        <span class="text-xs font-semibold text-gray-300">Theme Preference</span>
        <button onclick="toggleTheme()" class="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 text-xs text-purple-300 border border-white/10">
          ${activeTheme === 'dark' ? `<span>🌙 Dark</span>` : `<span>☀️ Light</span>`}
        </button>
      </div>

      <!-- Links in Drawer -->
      <div class="flex-1 py-3 space-y-1">
        ${links.map(link => `
          <a href="${link.href}" class="mobile-drawer-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
            currentHash === link.href ? 'bg-purple-600/20 text-purple-300 font-bold' : 'text-gray-300 hover:bg-white/5'
          }">
            <i data-lucide="${link.icon || 'circle'}" class="w-4 h-4"></i>
            <span>${link.label}</span>
          </a>
        `).join('')}
      </div>

      <!-- Drawer Footer -->
      <div class="pt-3 border-t border-white/10">
        ${isAuth ? `
          <button onclick="handleLogout()" class="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-rose-400 bg-rose-500/10 border border-rose-500/20 text-xs font-bold">
            <i data-lucide="log-out" class="w-4 h-4"></i>
            <span>Sign Out</span>
          </button>
        ` : `
          <button onclick="handleDemoLogin()" class="w-full py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md">
            ⚡ 1-Click Demo Login
          </button>
        `}
      </div>

    </aside>
  </div>
  `;
}

function initNavbarEvents() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const closeBtn = document.getElementById('mobile-menu-close');
  const drawerBackdrop = document.getElementById('mobile-drawer-backdrop');

  const closeDrawer = () => {
    if (drawerBackdrop) drawerBackdrop.classList.add('hidden');
  };

  if (toggleBtn && drawerBackdrop) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      drawerBackdrop.classList.toggle('hidden');
      if (window.lucide) window.lucide.createIcons();
    });
  }

  if (closeBtn && drawerBackdrop) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', (e) => {
      if (e.target === drawerBackdrop) {
        closeDrawer();
      }
    });

    // Close drawer when any mobile drawer link is clicked
    const drawerLinks = drawerBackdrop.querySelectorAll('.mobile-drawer-link');
    drawerLinks.forEach(link => {
      link.addEventListener('click', closeDrawer);
    });
  }
}

async function handleDemoLogin() {
  try {
    const res = await api.demoLogin();
    window.location.hash = '#/dashboard';
  } catch (err) {
    alert("Demo login error: " + err.message);
  }
}

function handleLogout() {
  api.clearSession();
  window.location.hash = '#/';
}
