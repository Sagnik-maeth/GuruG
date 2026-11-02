/**
 * GuruG API Client & Utilities
 */

const API_BASE = window.location.origin;

class GuruGAPI {
  constructor() {
    this.token = localStorage.getItem('gurug_token') || null;
    this.user = this._loadUser();
  }

  _loadUser() {
    try {
      const stored = localStorage.getItem('gurug_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  setSession(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('gurug_token', token);
    localStorage.setItem('gurug_user', JSON.stringify(user));
  }

  clearSession() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('gurug_token');
    localStorage.removeItem('gurug_user');
  }

  isAuthenticated() {
    return Boolean(this.token && this.user);
  }

  async _request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (response.status === 401) {
        // If expired, clear session unless it's login attempt
        if (!endpoint.includes('/api/auth/')) {
          this.clearSession();
          window.location.hash = '#/login';
        }
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || `Request failed with status ${response.status}`);
      }
      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  // --- Auth APIs ---
  async login(usernameOrEmail, password) {
    const data = await this._request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username_or_email: usernameOrEmail, password })
    });
    this.setSession(data.access_token, data.user);
    return data;
  }

  async register(username, email, password, displayName, gradeLevel, preferredLanguage) {
    const data = await this._request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password,
        display_name: displayName,
        grade_level: gradeLevel,
        preferred_language: preferredLanguage
      })
    });
    this.setSession(data.access_token, data.user);
    return data;
  }

  async demoLogin() {
    const data = await this._request('/api/auth/demo', { method: 'POST' });
    this.setSession(data.access_token, data.user);
    return data;
  }

  async completeOnboarding(profileData) {
    const res = await this._request('/api/auth/onboarding', {
      method: 'POST',
      body: JSON.stringify(profileData)
    });
    if (res.user) {
      this.user = res.user;
      localStorage.setItem('gurug_user', JSON.stringify(res.user));
    }
    return res;
  }

  // --- Tutor APIs ---
  async sendTutorMessage(message, sessionId, subject, language, mode, customKey) {
    return this._request('/api/tutor/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        session_id: sessionId,
        subject,
        language,
        mode,
        custom_gemini_key: customKey
      })
    });
  }

  async getChatSessions() {
    return this._request('/api/tutor/sessions');
  }

  async getSessionMessages(sessionId) {
    return this._request(`/api/tutor/sessions/${sessionId}/messages`);
  }

  async clearSessionChat(sessionId) {
    return this._request(`/api/tutor/sessions/${sessionId}`, { method: 'DELETE' });
  }

  async quickExplain(concept, subject, language, mode, gradeLevel) {
    return this._request('/api/tutor/quick-explain', {
      method: 'POST',
      body: JSON.stringify({ concept, subject, language, mode, grade_level: gradeLevel })
    });
  }

  // --- Quiz APIs ---
  async generateQuiz(subject, topic, difficulty, numQuestions, questionType, language) {
    return this._request('/api/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({
        subject,
        topic,
        difficulty,
        num_questions: parseInt(numQuestions),
        question_type: questionType,
        language
      })
    });
  }

  async evaluateQuiz(quizId, answersList) {
    return this._request('/api/quiz/evaluate', {
      method: 'POST',
      body: JSON.stringify({
        quiz_id: quizId,
        answers: answersList
      })
    });
  }

  async getQuizHistory() {
    return this._request('/api/quiz/history');
  }

  // --- Solver APIs ---
  async solveProblem(problemText, subject, language, gradeLevel) {
    return this._request('/api/solver/solve', {
      method: 'POST',
      body: JSON.stringify({
        problem_text: problemText,
        subject,
        language,
        grade_level: gradeLevel
      })
    });
  }

  async getSolverHistory() {
    return this._request('/api/solver/history');
  }

  // --- Subjects APIs ---
  async getSubjects() {
    return this._request('/api/subjects');
  }

  async getSubject(subjectId) {
    return this._request(`/api/subjects/${subjectId}`);
  }

  // --- Progress APIs ---
  async getProgress() {
    return this._request('/api/progress');
  }

  // --- Settings APIs ---
  async getSettings() {
    return this._request('/api/settings');
  }

  // --- Debate APIs ---
  async getDebateTopics() {
    return this._request('/api/debate/topics');
  }

  async startDebate(topic, category, studentStance, language, maxRounds = 3) {
    return this._request('/api/debate/start', {
      method: 'POST',
      body: JSON.stringify({
        topic,
        category,
        student_stance: studentStance,
        language,
        max_rounds: maxRounds
      })
    });
  }

  async sendDebateTurn(sessionId, studentArgument, roundNumber, language) {
    return this._request('/api/debate/turn', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        student_argument: studentArgument,
        round_number: roundNumber,
        language
      })
    });
  }

  async concludeDebate(sessionId) {
    return this._request('/api/debate/conclude', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId })
    });
  }

  async getDebateHistory() {
    return this._request('/api/debate/history');
  }

  async updateSettings(updateData) {
    const res = await this._request('/api/settings/update', {
      method: 'POST',
      body: JSON.stringify(updateData)
    });
    // Refresh user cached language / grade
    if (updateData.preferred_language && this.user) {
      this.user.preferred_language = updateData.preferred_language;
    }
    if (updateData.grade_level && this.user) {
      this.user.grade_level = updateData.grade_level;
    }
    if (updateData.display_name && this.user) {
      this.user.display_name = updateData.display_name;
    }
    if (this.user) {
      localStorage.setItem('gurug_user', JSON.stringify(this.user));
    }
    return res;
  }

  async testGeminiKey(apiKey) {
    return this._request('/api/settings/test-key', {
      method: 'POST',
      body: JSON.stringify({ api_key: apiKey })
    });
  }
}

// Global API Instance
const api = new GuruGAPI();

/**
 * Ultra-Natural Human Voice Synthesizer (NaturalTTS)
 * Designed to sound like a warm, engaging human mentor rather than a robotic machine.
 * Features:
 * - Intelligent neural/natural voice discovery (prioritizes Microsoft Natural, Google Neural, Apple Siri)
 * - Strict exclusion of legacy robotic desktop synthesizers (Microsoft David Desktop, eSpeak, SAPI5)
 * - Phonetic mathematical & LaTeX translation to smooth spoken words
 * - Sentence-by-sentence queue with realistic human breathing micro-pauses (80ms)
 * - Relaxed human pacing (0.94x) and warm vocal pitch (1.0)
 */
const NaturalTTS = {
  isSpeaking: false,
  isCancelled: false,
  voices: [],
  pauseTimer: null,

  init: () => {
    if (!('speechSynthesis' in window)) return;
    
    // Load voices immediately if already populated
    NaturalTTS.voices = window.speechSynthesis.getVoices() || [];
    
    // Listen for voiceschanged event (critical for modern Chrome & Edge)
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        NaturalTTS.voices = window.speechSynthesis.getVoices() || [];
        console.log(`[NaturalTTS] Loaded ${NaturalTTS.voices.length} system voices.`);
      };
    }
  },

  /**
   * Intelligently selects the highest-fidelity, most natural human voice available.
   * Prioritizes:
   * 1. Modern Natural / Neural Online voices (e.g. Jenny Natural, Aria Natural, Guy Natural, Swara Natural, Neerja Natural)
   * 2. High-quality Google Neural voices (Google US English, Google UK English Female, Google हिन्दी, etc.)
   * 3. Siri / Apple voices
   * 4. Human-sounding Indian English voices (Neerja, Heera, Veena)
   * Heavily penalizes and avoids legacy robotic Desktop/eSpeak/SAPI5 voices (Microsoft David Desktop, Zira, etc.)
   */
  getBestHumanVoice: (targetLangCode = 'en') => {
    if (!NaturalTTS.voices || NaturalTTS.voices.length === 0) {
      NaturalTTS.voices = window.speechSynthesis.getVoices() || [];
    }
    const voices = NaturalTTS.voices;
    if (!voices || voices.length === 0) return null;

    // Map language code to BCP 47
    const langMap = {
      'en': 'en-IN',
      'english': 'en-IN',
      'hi': 'hi-IN',
      'hindi': 'hi-IN',
      'hinglish': 'hi-IN',
      'bn': 'bn-IN',
      'bengali': 'bn-IN',
      'ta': 'ta-IN',
      'tamil': 'ta-IN',
      'te': 'te-IN',
      'telugu': 'te-IN',
      'kn': 'kn-IN',
      'kannada': 'kn-IN',
      'mr': 'mr-IN',
      'marathi': 'mr-IN',
      'gu': 'gu-IN',
      'gujarati': 'gu-IN',
      'ml': 'ml-IN',
      'malayalam': 'ml-IN',
      'ur': 'ur-IN',
      'urdu': 'ur-IN'
    };

    const targetBcp47 = langMap[targetLangCode.toLowerCase()] || 'en-IN';
    const targetPrefix = targetBcp47.slice(0, 2).toLowerCase();

    // Score and rank every available voice
    const scoredVoices = voices.map(v => {
      let score = 0;
      const name = (v.name || '').toLowerCase();
      const vLang = (v.lang || '').toLowerCase().replace('_', '-');

      // 1. Language matching
      if (vLang === targetBcp47.toLowerCase()) {
        score += 60;
      } else if (vLang.startsWith(targetPrefix)) {
        score += 35;
      } else if (vLang.startsWith('en')) {
        // Fallback English if target language voice isn't installed
        score += 10;
      }

      // 2. High-fidelity Natural / Neural Voices (Sounds authentically human!)
      if (name.includes('natural') || name.includes('neural') || name.includes('online (natural)')) {
        score += 150;
      }
      if (name.includes('google')) {
        score += 90;
      }
      if (name.includes('siri') || name.includes('apple')) {
        score += 80;
      }

      // 3. Natural Indian Accents / Regional names
      if (name.includes('neerja') || name.includes('swara') || name.includes('heera') || name.includes('veena') || name.includes('madhur') || name.includes('mohan')) {
        score += 70;
      }
      if (name.includes('india') || name.includes('indian')) {
        score += 40;
      }

      // 4. Female voice preference for warm tutoring cadence (Jenny, Aria, Neerja, Swara)
      if (name.includes('jenny') || name.includes('aria') || name.includes('neerja') || name.includes('swara') || name.includes('female')) {
        score += 25;
      }

      // 5. Heavy penalty for legacy robotic desktop voices (Microsoft David, Zira, Mark, eSpeak)
      if (name.includes('desktop') || name.includes('david') || name.includes('zira') || name.includes('mark')) {
        score -= 200;
      }
      if (name.includes('espeak') || name.includes('sapi')) {
        score -= 250;
      }

      return { voice: v, score, name: v.name, lang: v.lang };
    });

    // Sort descending by score
    scoredVoices.sort((a, b) => b.score - a.score);

    return scoredVoices[0]?.voice || voices[0] || null;
  },

  /**
   * Preprocesses text into clean, phonetic natural spoken sentences.
   * Strips HTML/SVG/cards and translates complex KaTeX math into spoken words.
   */
  toHumanSpokenText: (text) => {
    if (!text || typeof text !== 'string') return '';
    let t = text;

    // Remove HTML & SVG
    t = t.replace(/<svg[\s\S]*?<\/svg>/gi, ' ');
    t = t.replace(/<[^>]+>/g, ' ');

    // Remove visual diagram indicators & cards
    t = t.replace(/\[Visual Aid:.*?\]/gi, '');
    t = t.replace(/\[Concept Diagram:.*?\]/gi, '');
    t = t.replace(/!\[.*?\]\(.*?\)/g, ''); // Markdown image
    t = t.replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Markdown link text

    // Mathematical calculus & derivatives
    t = t.replace(/\\frac\{d\}\{dx\}/g, 'derivative with respect to x of ');
    t = t.replace(/\\frac\{d\^?2\}\{dx\^?2\}/g, 'second derivative with respect to x of ');
    t = t.replace(/\\frac\{d\}\{dt\}/g, 'derivative with respect to time of ');
    
    // Fractions: \frac{a}{b} -> a over b
    t = t.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1 over $2');

    // Roots
    t = t.replace(/\\sqrt\[3\]\{([^{}]+)\}/g, 'cube root of $1');
    t = t.replace(/\\sqrt\{([^{}]+)\}/g, 'square root of $1');
    t = t.replace(/\\sqrt\s*([a-zA-Z0-9]+)/g, 'square root of $1');

    // Powers
    t = t.replace(/([a-zA-Z0-9\)])\^2\b/g, '$1 squared');
    t = t.replace(/([a-zA-Z0-9\)])\^\{2\}/g, '$1 squared');
    t = t.replace(/([a-zA-Z0-9\)])\^3\b/g, '$1 cubed');
    t = t.replace(/([a-zA-Z0-9\)])\^\{3\}/g, '$1 cubed');
    t = t.replace(/([a-zA-Z0-9\)])\^\{([^}]+)\}/g, '$1 to the power of $2');
    t = t.replace(/([a-zA-Z0-9\)])\^([a-zA-Z0-9]+)/g, '$1 to the power of $2');

    // Math Operators
    t = t.replace(/\\pm/g, ' plus or minus ');
    t = t.replace(/\\times/g, ' times ');
    t = t.replace(/\\cdot/g, ' times ');
    t = t.replace(/\\div/g, ' divided by ');
    t = t.replace(/\\neq/g, ' is not equal to ');
    t = t.replace(/\\approx/g, ' is approximately ');
    t = t.replace(/\\leq?/g, ' is less than or equal to ');
    t = t.replace(/\\geq?/g, ' is greater than or equal to ');
    t = t.replace(/\\infty/g, ' infinity ');
    t = t.replace(/\\int/g, ' integral of ');
    t = t.replace(/\\sum/g, ' sum of ');

    // Trigonometry & Logarithms
    t = t.replace(/\\sin/g, ' sine of ');
    t = t.replace(/\\cos/g, ' cosine of ');
    t = t.replace(/\\tan/g, ' tangent of ');
    t = t.replace(/\\log/g, ' log of ');
    t = t.replace(/\\ln/g, ' natural log of ');

    // Greek letters
    t = t.replace(/\\theta/g, ' theta ');
    t = t.replace(/\\alpha/g, ' alpha ');
    t = t.replace(/\\beta/g, ' beta ');
    t = t.replace(/\\gamma/g, ' gamma ');
    t = t.replace(/\\Delta/g, ' delta ');
    t = t.replace(/\\lambda/g, ' lambda ');
    t = t.replace(/\\pi/g, ' pie ');
    t = t.replace(/\\sigma/g, ' sigma ');
    t = t.replace(/\\omega/g, ' omega ');

    // Clean remaining LaTeX commands and backslashes
    t = t.replace(/\\\w+/g, ' ');

    // Remove markdown symbols: #, *, _, `, ~, $, quotes
    t = t.replace(/[#*_`$~\{\}\[\]\(\)\\]/g, ' ');

    // Clean duplicate punctuation and commas
    t = t.replace(/,\s*,+/g, ','); // Collapse multiple commas
    t = t.replace(/[:;]\s*,/g, ':'); // Clean colons followed by commas
    t = t.replace(/,\s*([.!?])/g, '$1'); // Remove comma immediately before sentence terminators

    // Soften and decrease pauses before coordinating conjunctions and clause connectors
    // In speech, words like "and", "aur", "jismein", "jisse" already provide a natural transition;
    // having a hard comma right before them creates an unnaturally long, halting pause.
    t = t.replace(/,\s*(aur|and|ya|or|ki|jismein|jisse|jahan|jisko|tatha)\b/gi, ' $1');

    // Clean up spacing around commas and punctuation
    t = t.replace(/\s*,\s*/g, ', ');
    t = t.replace(/\s*([.!?])/g, '$1 ');

    // Normalize spacing
    t = t.replace(/\s+/g, ' ').trim();

    return t;
  },

  /**
   * Breaks long text into natural human conversational thought sentences.
   * Splits strictly on complete sentence terminators (. ! ? ; or newlines).
   * Commas are kept INSIDE sentences as natural continuous breath pauses,
   * completely preventing browser speech synthesis utterance-boundary repetition.
   */
  splitIntoSentences: (text) => {
    if (!text) return [];

    // Split on complete sentence terminators (. ! ? ; or newlines)
    const matches = text.match(/[^.!?;\n]+[.!?;\n]+(?:\s|$)|[^.!?;\n]+$/g) || [text];
    const sentences = [];

    for (const m of matches) {
      let s = m.trim();
      if (!s) continue;

      // Clean leading and trailing punctuation at sentence edges
      s = s.replace(/^[,;:\s]+/, '').replace(/[,;:\s]+$/, '').trim();
      if (!s) continue;

      // If an unbroken passage is exceptionally long (> 350 chars with no punctuation),
      // gently break it at word boundaries near 280 chars without trailing commas.
      if (s.length > 350) {
        const words = s.split(/\s+/);
        let currentChunk = '';
        for (const w of words) {
          if ((currentChunk + ' ' + w).length > 280 && currentChunk.length > 0) {
            // Strip trailing comma from chunk to prevent speech buffer hang/repeat
            const cleanChunk = currentChunk.replace(/[,;:\s]+$/, '').trim();
            if (cleanChunk) sentences.push(cleanChunk);
            currentChunk = w.replace(/^[,;:\s]+/, '');
          } else {
            currentChunk = currentChunk ? currentChunk + ' ' + w : w;
          }
        }
        const lastChunk = currentChunk.replace(/[,;:\s]+$/, '').trim();
        if (lastChunk) sentences.push(lastChunk);
      } else {
        sentences.push(s);
      }
    }

    return sentences.length > 0 ? sentences : [text.replace(/[,;:\s]+$/, '').trim()];
  },

  /**
   * Speaks the text with natural human cadence, decreased comma pauses,
   * tight 35ms micro-pauses between sentences, and warm vocal inflection.
   */
  speak: (text, langCode = 'en', onStart = null, onEnd = null) => {
    if (!('speechSynthesis' in window)) return;
    
    // Cancel any ongoing speech
    NaturalTTS.stop();
    NaturalTTS.isCancelled = false;

    const spokenText = NaturalTTS.toHumanSpokenText(text);
    if (!spokenText) return;

    const sentences = NaturalTTS.splitIntoSentences(spokenText);
    if (sentences.length === 0) return;

    const bestVoice = NaturalTTS.getBestHumanVoice(langCode);
    const voiceSettings = JSON.parse(localStorage.getItem('gurug_voice_settings') || '{}');
    const rate = parseFloat(voiceSettings.rate) || 0.98; // Crisp, tight natural pacing (shortens comma pauses)
    const pitch = parseFloat(voiceSettings.pitch) || 1.0; // Natural warm pitch

    NaturalTTS.isSpeaking = true;
    let started = false;
    let currentIndex = 0;

    const speakNextSentence = () => {
      if (NaturalTTS.isCancelled || currentIndex >= sentences.length) {
        NaturalTTS.isSpeaking = false;
        if (onEnd) onEnd();
        return;
      }

      let sentence = sentences[currentIndex];
      // Ensure sentence doesn't end with a dangling comma (prevents buffer hanging & repetition in Chrome)
      sentence = sentence.replace(/[,;:\s]+$/, '').trim();
      if (!sentence) {
        currentIndex++;
        speakNextSentence();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.rate = rate;
      utterance.pitch = pitch;

      if (bestVoice) {
        utterance.voice = bestVoice;
        utterance.lang = bestVoice.lang;
      }

      utterance.onstart = () => {
        if (!started) {
          started = true;
          if (onStart) onStart();
        }
      };

      utterance.onend = () => {
        if (NaturalTTS.isCancelled) return;
        currentIndex++;
        if (currentIndex < sentences.length) {
          // Tight, realistic 35ms micro-pause between sentences
          NaturalTTS.pauseTimer = setTimeout(speakNextSentence, 35);
        } else {
          NaturalTTS.isSpeaking = false;
          if (onEnd) onEnd();
        }
      };

      utterance.onerror = (e) => {
        console.warn('[NaturalTTS] Speech synthesis error:', e);
        if (NaturalTTS.isCancelled) return;
        currentIndex++;
        if (currentIndex < sentences.length) {
          NaturalTTS.pauseTimer = setTimeout(speakNextSentence, 35);
        } else {
          NaturalTTS.isSpeaking = false;
          if (onEnd) onEnd(e);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextSentence();
  },

  /**
   * Instantly stops playback and cancels queued sentence timers.
   */
  stop: () => {
    NaturalTTS.isCancelled = true;
    NaturalTTS.isSpeaking = false;
    if (NaturalTTS.pauseTimer) {
      clearTimeout(NaturalTTS.pauseTimer);
      NaturalTTS.pauseTimer = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  /**
   * Test human voice preview for the settings panel.
   */
  testVoice: (langCode = 'en', onStart = null, onEnd = null) => {
    const samples = {
      'en': "Hey there! I'm GuruG, your learning partner. Notice how natural and clear this sounds? We're going to make learning feel effortless!",
      'english': "Hey there! I'm GuruG, your learning partner. Notice how natural and clear this sounds? We're going to make learning feel effortless!",
      'hinglish': "Hey! Main hoon GuruG. Ab se study bilkul natural aur chill tareeqe se hogi. Jo bhi doubt ho, bina hesitate kiye poocho!",
      'hi': "नमस्ते! मैं गुरु-जी हूँ, आपका अपना लर्निंग पार्टनर। अब पढ़ाई होगी बिल्कुल आसान, मजेदार और स्वाभाविक!",
      'hindi': "नमस्ते! मैं गुरु-जी हूँ, आपका अपना लर्निंग पार्टनर। अब पढ़ाई होगी बिल्कुल आसान, मजेदार और स्वाभाविक!"
    };
    const sample = samples[langCode.toLowerCase()] || samples['en'];
    NaturalTTS.speak(sample, langCode, onStart, onEnd);
  }
};

// Aliased as TTS for 100% backward compatibility across all components
const TTS = NaturalTTS;
NaturalTTS.init();

/**
 * Real-time Speech-to-Text Voice Recognition & Microphone Diagnostics Helper
 */
const VoiceInput = {
  recognition: null,
  isListening: false,
  shouldBeListening: false,
  currentLang: 'en-IN',
  baseTranscript: '',
  finalTranscript: '',
  onResultCallback: null,
  onStatusChangeCallback: null,

  isSupported: () => {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  },

  init: (onResult, onStatusChange, lang = 'en-IN') => {
    VoiceInput.onResultCallback = onResult;
    VoiceInput.onStatusChangeCallback = onStatusChange;
    VoiceInput.currentLang = lang;
    return VoiceInput.isSupported();
  },

  start: (baseText = '') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (VoiceInput.onStatusChangeCallback) {
        VoiceInput.onStatusChangeCallback(false, 'Speech Recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
      }
      return false;
    }

    // Stop any lingering instance before re-creating
    if (VoiceInput.recognition) {
      try {
        VoiceInput.recognition.abort();
      } catch (e) {}
    }

    VoiceInput.baseTranscript = (baseText || '').trim();
    VoiceInput.finalTranscript = '';
    VoiceInput.shouldBeListening = true;

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true; // Crucial: Keep listening through pauses and multi-sentence arguments!
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = VoiceInput.currentLang || 'en-IN';

      rec.onstart = () => {
        VoiceInput.isListening = true;
        if (VoiceInput.onStatusChangeCallback) {
          VoiceInput.onStatusChangeCallback(true);
        }
      };

      rec.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            VoiceInput.finalTranscript += item[0].transcript + ' ';
          } else {
            interim += item[0].transcript;
          }
        }

        // Combine base text + final transcript + current interim words
        const parts = [];
        if (VoiceInput.baseTranscript) parts.push(VoiceInput.baseTranscript);
        if (VoiceInput.finalTranscript.trim()) parts.push(VoiceInput.finalTranscript.trim());
        if (interim.trim()) parts.push(interim.trim());
        const fullTranscript = parts.join(' ').trim();

        if (VoiceInput.onResultCallback) {
          VoiceInput.onResultCallback(fullTranscript, interim, VoiceInput.finalTranscript);
        }
      };

      rec.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === 'no-speech') {
          // Normal silence timeout in continuous mode; keep listening
          return;
        }

        VoiceInput.shouldBeListening = false;
        VoiceInput.isListening = false;

        let userMsg = `Speech recognition error: ${event.error}`;
        if (event.error === 'not-allowed') {
          userMsg = 'Microphone permission was blocked. Please click the camera/lock icon in your browser address bar and set Microphone to "Allow".';
        } else if (event.error === 'audio-capture') {
          userMsg = 'No working microphone found. Please connect your microphone or check Windows Sound settings.';
        } else if (event.error === 'network') {
          userMsg = 'Network connection issue with speech service. Check internet connection.';
        }

        if (VoiceInput.onStatusChangeCallback) {
          VoiceInput.onStatusChangeCallback(false, userMsg);
        }
      };

      rec.onend = () => {
        // If the user intended to keep listening and didn't call stop(), restart
        if (VoiceInput.shouldBeListening) {
          try {
            rec.start();
            return;
          } catch (e) {
            console.warn("Could not auto-restart recognition:", e);
          }
        }
        VoiceInput.isListening = false;
        VoiceInput.shouldBeListening = false;
        if (VoiceInput.onStatusChangeCallback) {
          VoiceInput.onStatusChangeCallback(false);
        }
      };

      VoiceInput.recognition = rec;
      rec.start();
      return true;
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      VoiceInput.isListening = false;
      VoiceInput.shouldBeListening = false;
      if (VoiceInput.onStatusChangeCallback) {
        VoiceInput.onStatusChangeCallback(false, `Could not start microphone: ${err.message}`);
      }
      return false;
    }
  },

  stop: () => {
    VoiceInput.shouldBeListening = false;
    VoiceInput.isListening = false;
    if (VoiceInput.recognition) {
      try {
        VoiceInput.recognition.stop();
      } catch (e) {
        try {
          VoiceInput.recognition.abort();
        } catch (e2) {}
      }
    }
    if (VoiceInput.onStatusChangeCallback) {
      VoiceInput.onStatusChangeCallback(false);
    }
  },

  /**
   * Diagnostic Hardware Tester: Checks audio hardware & measures real-time volume level (VU meter)
   */
  testMicrophone: async (onVolumeUpdate) => {
    const hasSpeech = VoiceInput.isSupported();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        ok: false,
        hasSpeech,
        error: 'MediaDevices API not supported in this browser. Please use Google Chrome or Microsoft Edge.'
      };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        return {
          ok: true,
          hasSpeech,
          stream,
          stopTest: () => stream.getTracks().forEach(t => t.stop())
        };
      }

      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let isRunning = true;

      const checkVolume = () => {
        if (!isRunning) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength; // 0 to 255
        const percent = Math.min(100, Math.round((avg / 128) * 100));
        if (onVolumeUpdate) {
          onVolumeUpdate(percent, avg);
        }
        requestAnimationFrame(checkVolume);
      };

      checkVolume();

      return {
        ok: true,
        hasSpeech,
        stream,
        audioCtx,
        stopTest: () => {
          isRunning = false;
          try {
            source.disconnect();
            audioCtx.close();
          } catch (e) {}
          stream.getTracks().forEach(t => t.stop());
        }
      };
    } catch (err) {
      let friendlyReason = err.message;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        friendlyReason = 'Microphone permission was denied by the browser. Please allow microphone access.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        friendlyReason = 'No physical microphone hardware detected on your device.';
      }
      return {
        ok: false,
        hasSpeech,
        error: friendlyReason,
        errorName: err.name
      };
    }
  }
};

/**
 * Math KaTeX Renderer & LaTeX Sanitization Helper
 */
function sanitizeMathExpression(raw) {
  if (!raw) return '';
  return raw
    // Fix function name directly attached to variable without space: \sinx -> \sin x, \cosx -> \cos x, etc.
    .replace(/\\(sin|cos|tan|cot|sec|csc|ln|log|exp|lim|arcsin|arccos|arctan)([a-zA-Z0-9])/g, '\\$1 $2')
    // Fix common punctuation like trailing dots or commas right inside display math
    .replace(/\s*([.,;])\s*$/, ' $1')
    .trim();
}

function renderMathInContainer(container) {
  if (!container) return;

  const tryRender = () => {
    if (window.renderMathInElement) {
      try {
        window.renderMathInElement(container, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });
      } catch (err) {
        console.warn("KaTeX renderMathInElement note:", err);
      }
    }
  };

  if (!window.renderMathInElement) {
    // Retry once in 200ms if script is still initializing
    setTimeout(tryRender, 200);
  } else {
    tryRender();
  }
}

/**
 * Enhanced Markdown to Safe HTML parser with strict Math preservation & Visual Concept Cards
 */
function formatMarkdown(text) {
  if (!text) return '';

  const mathEntries = [];
  const visualCards = [];

  // 0. Extract pre-formatted concept-visual-card HTML blocks (if any legacy messages contain them)
  // Uses balanced div scanning so arbitrarily nested divs are properly captured
  let out = text;
  while (true) {
    const cardIdx = out.indexOf('<div class="concept-visual-card');
    if (cardIdx === -1) break;
    let depth = 0;
    let endIdx = -1;
    const divPattern = /<\s*(\/)?\s*div\b[^>]*>/gi;
    divPattern.lastIndex = cardIdx;
    let match;
    while ((match = divPattern.exec(out)) !== null) {
      if (match[1]) {
        depth--;
        if (depth === 0) {
          endIdx = divPattern.lastIndex;
          break;
        }
      } else {
        depth++;
      }
    }
    if (endIdx !== -1) {
      const cardHtml = out.substring(cardIdx, endIdx);
      const id = visualCards.length;
      visualCards.push(cardHtml);
      out = out.substring(0, cardIdx) + `@@@VISUAL_CARD_${id}@@@` + out.substring(endIdx);
    } else {
      break;
    }
  }

  // Helper to store equation and return placeholder token
  const addMath = (type, code) => {
    const id = mathEntries.length;
    mathEntries.push({ type, code: sanitizeMathExpression(code) });
    return `@@@MATH_${type.toUpperCase()}_${id}@@@`;
  };

  // 1. Extract block math: \[ ... \]
  out = out.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (match, eq) => addMath('block', eq));

  // 2. Extract block math: $$ ... $$
  out = out.replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (match, eq) => addMath('block', eq));

  // 3. Extract LaTeX environments: \begin{...} ... \end{...}
  out = out.replace(/\\begin\{(equation|align|aligned|gather|matrix|pmatrix|bmatrix)\}([\s\S]*?)\\end\{\1\}/g, (match) => addMath('block', match));

  // 4. Extract inline math: \( ... \)
  out = out.replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, (match, eq) => addMath('inline', eq));

  // 5. Extract inline math: $ ... $
  out = out.replace(/\$([^\$\n\r]+?)\$/g, (match, eq) => addMath('inline', eq));

  // 6. Apply standard Markdown formatting on non-math text
  let html = out
    // Headings
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-purple-300 mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-4 mb-3">$1</h1>')
    // Bold & Italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-black/40 border border-white/10 rounded-lg p-3 my-3 text-sm text-cyan-300 font-mono overflow-x-auto"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-black/30 border border-white/10 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    // Bullet points (Unordered lists)
    .replace(/^\s*[-*]\s+(.*$)/gim, '<li class="ml-5 list-disc marker:text-cyan-400 text-gray-300 my-1 pl-1">$1</li>')
    // Numbered lists (Ordered lists: single marker bullet, eliminates double-numbering e.g. "1. 1.")
    .replace(/^\s*(\d+)[.)]\s+(?:(?:<strong[^>]*>|\*\*)?\s*\d+[.)]?\s*(?:<\/strong>|\*\*)?\s*)?(.*$)/gim, '<li class="ml-5 list-decimal marker:text-purple-400 marker:font-semibold text-gray-200 my-1 pl-1" value="$1">$2</li>')
    // Paragraphs and Line Breaks (will not affect equations because they are protected tokens!)
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
    // Clean up redundant line breaks after list items and code blocks
    .replace(/<\/li><br\/>/g, '</li>')
    .replace(/<\/pre><br\/>/g, '</pre>')
    .replace(/<\/h([1-3])><br\/>/g, '</h$1>');

  // 7. Re-insert and render math!
  for (let i = 0; i < mathEntries.length; i++) {
    const entry = mathEntries[i];
    const isBlock = entry.type === 'block';
    const token = `@@@MATH_${entry.type.toUpperCase()}_${i}@@@`;

    if (typeof window !== 'undefined' && window.katex && typeof window.katex.renderToString === 'function') {
      try {
        const rendered = window.katex.renderToString(entry.code, {
          displayMode: isBlock,
          throwOnError: false
        });
        const wrapped = isBlock
          ? `<div class="katex-display-container my-3 overflow-x-auto text-center">${rendered}</div>`
          : `<span class="katex-inline-container">${rendered}</span>`;
        html = html.replace(token, wrapped);
        continue;
      } catch (err) {
        console.warn("KaTeX renderToString error:", err);
      }
    }

    // Fallback if KaTeX has not loaded yet: render clean standard delimiter for renderMathInContainer
    const fallback = isBlock
      ? `<div class="katex-display-container my-3 overflow-x-auto text-center">$$${entry.code}$$</div>`
      : `<span class="katex-inline-container">$${entry.code}$</span>`;
    html = html.replace(token, fallback);
  }

  // 8. Re-insert protected Visual Concept Cards
  for (let j = 0; j < visualCards.length; j++) {
    const cardToken = `@@@VISUAL_CARD_${j}@@@`;
    html = html.replace(cardToken, visualCards[j]);
  }

  return html;
}

/**
 * Educational Lightbox Modal Controller
 */
window.openImageLightbox = function(src, title, caption) {
  const modal = document.getElementById('image-lightbox-modal');
  const imgEl = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');
  const captionEl = document.getElementById('lightbox-caption');

  if (modal && imgEl) {
    imgEl.src = src;
    if (titleEl) titleEl.innerText = title || "Visual Concept Diagram";
    if (captionEl) captionEl.innerText = caption || "Visual educational illustration to facilitate intuitive understanding of the concept.";
    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }
};

window.closeImageLightbox = function() {
  const modal = document.getElementById('image-lightbox-modal');
  if (modal) {
    modal.classList.add('hidden');
    const imgEl = document.getElementById('lightbox-img');
    if (imgEl) imgEl.src = "";
  }
};

// Delegated click listener: handles lightbox triggers safely without inline onclick quote escaping issues
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.visual-lightbox-trigger, [data-lightbox-src], [data-src]');
    if (trigger && !trigger.closest('#image-lightbox-modal')) {
      const src = trigger.getAttribute('data-src') || trigger.getAttribute('data-lightbox-src');
      const title = trigger.getAttribute('data-title') || trigger.getAttribute('data-lightbox-title') || '';
      const caption = trigger.getAttribute('data-caption') || trigger.getAttribute('data-lightbox-caption') || '';
      if (src && window.openImageLightbox) {
        window.openImageLightbox(src, title, caption);
      }
    }
  });
}

// Listen for Escape key to close Lightbox modal
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeImageLightbox();
    }
  });
}

/**
 * Educational Circular Radial Progress Ring Badge
 * Recreates the exact radial design from the user's reference:
 * - Pure white circular inner disc (#FFFFFF)
 * - Light gray background track (#E2E8F0)
 * - Gradient progress arc with rounded caps (Teal/Cyan -> Electric Blue -> Indigo)
 * - Centered bold, high-contrast dark percentage text (${pct}%)
 */
function renderSubjectProgressCircle(percent, size = 68, idPrefix = 'subj_prog', extraClass = '') {
  const pct = Math.max(0, Math.min(100, Math.round(percent || 0)));
  const strokeWidth = size >= 64 ? 6.5 : (size >= 48 ? 5.5 : 4);
  const radius = (size / 2) - (strokeWidth / 2) - 1.5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const uniqueId = `${idPrefix}_${Math.random().toString(36).substr(2, 6)}`;
  const fontSize = size >= 64 ? Math.round(size * 0.23) : (size >= 48 ? Math.round(size * 0.25) : 10);

  return `
    <div class="relative shrink-0 flex items-center justify-center select-none ${extraClass}" style="width: ${size}px; height: ${size}px;">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="transform -rotate-90 drop-shadow-sm overflow-visible">
        <defs>
          <linearGradient id="circGrad_${uniqueId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#06B6D4" />
            <stop offset="50%" stop-color="#3B82F6" />
            <stop offset="100%" stop-color="#4F46E5" />
          </linearGradient>
        </defs>
        <!-- Solid white background disc as in reference attachment -->
        <circle 
          cx="${size / 2}" 
          cy="${size / 2}" 
          r="${size / 2}" 
          fill="#FFFFFF" 
        />
        <!-- Background gray track -->
        <circle 
          cx="${size / 2}" 
          cy="${size / 2}" 
          r="${radius}" 
          fill="none" 
          stroke="#E2E8F0" 
          stroke-width="${strokeWidth}" 
        />
        <!-- Foreground gradient progress arc with rounded end caps -->
        <circle 
          cx="${size / 2}" 
          cy="${size / 2}" 
          r="${radius}" 
          fill="none" 
          stroke="url(#circGrad_${uniqueId})" 
          stroke-width="${strokeWidth}" 
          stroke-linecap="round" 
          stroke-dasharray="${circumference.toFixed(2)}" 
          stroke-dashoffset="${offset.toFixed(2)}" 
          class="transition-all duration-700 ease-out"
        />
      </svg>
      <!-- Center bold percentage text -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span class="font-extrabold text-[#0B132B] tracking-tight leading-none" style="font-size: ${fontSize}px; font-family: system-ui, -apple-system, sans-serif;">
          ${pct}%
        </span>
      </div>
    </div>
  `;
}

window.renderSubjectProgressCircle = renderSubjectProgressCircle;
