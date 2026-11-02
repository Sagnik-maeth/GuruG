/**
 * GuruG - Main Application Router & Controller
 */

async function navigate() {
  const hash = window.location.hash || '#/';
  const route = hash.split('?')[0];
  const appContainer = document.getElementById('app-view');
  const navbarContainer = document.getElementById('navbar-container');

  // Always update navbar
  if (navbarContainer) {
    navbarContainer.innerHTML = renderNavbar();
    initNavbarEvents();
    if (window.lucide) window.lucide.createIcons();
  }

  // Authentication check for protected routes
  const protectedRoutes = ['#/dashboard', '#/tutor', '#/debate', '#/quiz', '#/solver', '#/subjects', '#/progress', '#/settings', '#/onboarding'];
  if (protectedRoutes.includes(route) && !api.isAuthenticated()) {
    window.location.hash = '#/login';
    return;
  }

  // Redirect to dashboard if logged-in user visits /login or /signup
  if ((route === '#/login' || route === '#/signup') && api.isAuthenticated()) {
    window.location.hash = '#/dashboard';
    return;
  }

  if (!appContainer) return;

  // Cleanup debate listeners if moving away from debate
  if (typeof window.detachDebateKeyboardListeners === 'function') {
    window.detachDebateKeyboardListeners();
  }

  // Cleanup tutor voice recognition if moving away from tutor
  if (route !== '#/tutor' && typeof window.stopTutorVoiceRecognition === 'function') {
    window.stopTutorVoiceRecognition();
  }

  // Cleanup solver voice recognition if moving away from solver
  if (route !== '#/solver' && typeof window.isSolverListening !== 'undefined' && window.isSolverListening) {
    if (typeof window.toggleSolverVoiceRecognition === 'function') window.toggleSolverVoiceRecognition();
  }

  // Cleanup any active speech narration when switching routes
  if (typeof window.stopTutorSpeechAudio === 'function') {
    window.stopTutorSpeechAudio();
  } else if (window.TTS) {
    window.TTS.stop();
  }

  // Render view
  try {
    switch (route) {
      case '#/':
        appContainer.innerHTML = renderLanding();
        updateHeroPreview('Hinglish');
        break;
      case '#/login':
        appContainer.innerHTML = renderLogin();
        break;
      case '#/signup':
        appContainer.innerHTML = renderSignup();
        break;
      case '#/onboarding':
        appContainer.innerHTML = renderOnboarding();
        break;
      case '#/dashboard':
        appContainer.innerHTML = await renderDashboard();
        break;
      case '#/tutor':
        appContainer.innerHTML = await renderTutor();
        break;
      case '#/debate':
        appContainer.innerHTML = await renderDebate();
        if (typeof window.attachDebateKeyboardListeners === 'function') {
          window.attachDebateKeyboardListeners();
        }
        break;
      case '#/quiz':
        appContainer.innerHTML = await renderQuiz();
        break;
      case '#/subjects':
        appContainer.innerHTML = await renderSubjects();
        break;
      case '#/solver':
        appContainer.innerHTML = await renderSolver();
        break;
      case '#/progress':
        appContainer.innerHTML = await renderProgress();
        break;
      case '#/settings':
        appContainer.innerHTML = await renderSettings();
        break;
      default:
        // Default to landing page or dashboard
        if (api.isAuthenticated()) {
          window.location.hash = '#/dashboard';
        } else {
          window.location.hash = '#/';
        }
        return;
    }

    // Render KaTeX formulas and Lucide icons across the view
    renderMathInContainer(appContainer);
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Scroll container to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (appContainer) {
      appContainer.scrollTop = 0;
    }

  } catch (err) {
    console.error("Navigation error:", err);
    appContainer.innerHTML = `
      <div class="max-w-md mx-auto my-20 p-8 glass-panel rounded-3xl border border-rose-500/30 text-center">
        <div class="text-rose-400 text-3xl mb-3">⚠️</div>
        <h3 class="text-lg font-bold text-white mb-2">Error Loading Page</h3>
        <p class="text-xs text-gray-400 mb-4">${err.message}</p>
        <button onclick="window.location.hash='#/'" class="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold">
          Return Home
        </button>
      </div>
    `;
  }
}

// Global keyboard shortcuts (e.g. Esc to instantly stop text-to-speech audio narration)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // If image lightbox is open, close it
    const lightbox = document.getElementById('image-lightbox');
    if (lightbox && !lightbox.classList.contains('hidden')) {
      if (typeof window.closeImageLightbox === 'function') {
        window.closeImageLightbox();
      }
      return;
    }

    // Stop active audio narration immediately across all views
    if (window.TTS && (window.TTS.isSpeaking || (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.speaking))) {
      if (typeof window.stopTutorSpeechAudio === 'function') {
        window.stopTutorSpeechAudio();
      } else {
        window.TTS.stop();
      }
    }
  }
});

// Global initialization
window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', () => {
  // Apply persisted theme and typography
  if (typeof getActiveTheme === 'function') {
    const savedTheme = getActiveTheme();
    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }
  if (typeof getActiveFont === 'function' && typeof setActiveFont === 'function') {
    setActiveFont(getActiveFont());
  }

  navigate();
});
