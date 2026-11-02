/**
 * GuruG Lens - Google Lens Style Visual Search, OCR & Cloud Knowledge Engine
 * Allows students to scan textbook photos, equations, diagrams, or objects
 * using live camera, upload, or paste, and retrieves cloud explanations,
 * step-by-step solutions, and concept diagrams.
 */

let currentLensMode = 'search'; // 'search' | 'text' | 'homework'
let lensSelectedImageData = null;
let lensExtractedText = '';
let lensMediaStream = null;
let isLensScanning = false;
let lensFacingMode = 'environment';
let lensSamplesCache = [];

async function renderLens() {
  const user = api.user || {};
  const currentLang = user.preferred_language || 'English';

  // Fetch preset samples if not already cached
  if (!lensSamplesCache || lensSamplesCache.length === 0) {
    try {
      const res = await api.getLensSamples();
      if (res && res.samples) {
        lensSamplesCache = res.samples;
      }
    } catch (e) {
      console.warn('[GuruGLens] Could not fetch samples:', e);
    }
  }

  return `
  <div class="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6 fade-in select-none">
    
    <!-- Top Header & Branding -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/25 shrink-0">
          <div class="w-full h-full bg-[#0B0F17] rounded-[14px] flex items-center justify-center text-cyan-400">
            <i data-lucide="camera" class="w-6 h-6"></i>
          </div>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Guru<span class="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">G Lens</span></h1>
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>Visual Cloud Search</span>
            </span>
          </div>
          <p class="text-xs text-gray-400 mt-0.5">Scan textbook equations, handwritten notes & science diagrams — Google Lens for Education.</p>
        </div>
      </div>

      <!-- Mode Selector Pills (Google Lens Style) -->
      <div class="flex items-center bg-black/40 p-1.5 rounded-2xl border border-white/10 self-start sm:self-auto shrink-0">
        <button onclick="setLensMode('search')" id="lens-mode-search" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${currentLensMode === 'search' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30' : 'text-gray-300 hover:text-white'}">
          <i data-lucide="search" class="w-3.5 h-3.5"></i>
          <span>Visual Search</span>
        </button>

        <button onclick="setLensMode('text')" id="lens-mode-text" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${currentLensMode === 'text' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'text-gray-300 hover:text-white'}">
          <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
          <span>Text & OCR</span>
        </button>

        <button onclick="setLensMode('homework')" id="lens-mode-homework" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${currentLensMode === 'homework' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'text-gray-300 hover:text-white'}">
          <i data-lucide="calculator" class="w-3.5 h-3.5"></i>
          <span>Homework</span>
        </button>
      </div>
    </div>

    <!-- MAIN VIEWFINDER & SCANNER CARD -->
    <div class="glass-panel-elevated rounded-3xl border border-white/15 p-4 sm:p-6 space-y-4 shadow-2xl relative">
      
      <!-- Viewfinder Viewport -->
      <div id="lens-viewfinder-container" class="lens-viewfinder w-full min-h-[320px] sm:min-h-[380px] bg-black/60 rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden transition-all">
        
        <!-- Google Lens Corner Brackets -->
        <div class="lens-corner lens-corner-tl"></div>
        <div class="lens-corner lens-corner-tr"></div>
        <div class="lens-corner lens-corner-bl"></div>
        <div class="lens-corner lens-corner-br"></div>

        <!-- Glowing Laser Scan Line (Active during scan) -->
        <div id="lens-laser-bar" class="lens-laser-line hidden"></div>

        <!-- 1. Live Video Stream Element -->
        <video id="lens-video" autoplay playsinline class="hidden w-full h-full object-contain max-h-[460px] rounded-2xl"></video>

        <!-- 2. Loaded Image Preview -->
        <div id="lens-preview-wrapper" class="hidden relative max-w-full max-h-[460px] flex items-center justify-center p-2">
          <img id="lens-preview-img" src="" alt="Scanned Document" class="max-w-full max-h-[420px] object-contain rounded-xl shadow-lg border border-white/10" />
        </div>

        <!-- 3. Empty State / Drag & Drop Dropzone -->
        <div id="lens-empty-state" class="p-6 text-center max-w-md space-y-4 my-auto">
          <div class="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
            <i data-lucide="scan-line" class="w-8 h-8 animate-pulse"></i>
          </div>

          <div>
            <h3 class="text-base sm:text-lg font-bold text-white">Capture or Upload to Search</h3>
            <p class="text-xs text-gray-400 mt-1">Point your camera at a textbook, paste a screenshot (Ctrl+V), or drag an image here.</p>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button onclick="startLensCamera()" class="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer">
              <i data-lucide="video" class="w-4 h-4"></i>
              <span>Open Live Camera</span>
            </button>

            <label class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition-all flex items-center gap-2 cursor-pointer">
              <i data-lucide="upload" class="w-4 h-4 text-purple-400"></i>
              <span>Upload Photo</span>
              <input type="file" id="lens-file-input" accept="image/*" class="hidden" onchange="handleLensFileUpload(event)" />
            </label>
          </div>

          <div class="text-[11px] text-gray-500 pt-2 flex items-center justify-center gap-2">
            <kbd class="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-mono text-[10px]">Ctrl + V</kbd>
            <span>Paste from clipboard anytime</span>
          </div>
        </div>

        <!-- Hidden Canvas for frame snapshots & OCR downscaling -->
        <canvas id="lens-canvas" class="hidden"></canvas>
      </div>

      <!-- Google Lens "Add to Search" Bar (Search Input on Image) -->
      <div id="lens-search-box-row" class="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
            <i data-lucide="search" class="w-4 h-4"></i>
          </div>
          <input 
            type="text" 
            id="lens-search-input" 
            placeholder="Add to search or ask anything about this image (e.g. 'Solve this', 'What is this diagram?')..." 
            onkeydown="if(event.key==='Enter') executeLensScan(this.value)"
            class="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
          />
        </div>
        <button onclick="executeLensScan(document.getElementById('lens-search-input').value)" id="lens-search-submit-btn" class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
          <span>Search Cloud ⚡</span>
        </button>
      </div>

      <!-- Quick Subject & Intent Filter Chips -->
      <div class="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px]">
        <span class="text-gray-400 text-[10px] font-semibold mr-1">Quick Intent:</span>
        <button type="button" onclick="setLensQueryPrompt('What concept or diagram is shown in this image?')" class="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 border border-white/10 text-[11px] transition-all cursor-pointer">
          🔍 What is this?
        </button>
        <button type="button" onclick="setLensQueryPrompt('Solve the problem or question shown in this image step-by-step with formulas')" class="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-300 border border-white/10 text-[11px] transition-all cursor-pointer">
          🧮 Solve Problem
        </button>
        <button type="button" onclick="triggerManualOCR()" class="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-purple-500/20 text-gray-300 hover:text-purple-300 border border-white/10 text-[11px] transition-all cursor-pointer">
          📝 Extract Text (OCR)
        </button>
        <button type="button" onclick="setLensQueryPrompt('Analyze the mathematics and equations in this image')" class="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-[11px] transition-all cursor-pointer">
          📐 Math
        </button>
        <button type="button" onclick="setLensQueryPrompt('Explain the physics principles and motion laws in this image')" class="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-[11px] transition-all cursor-pointer">
          ⚡ Physics
        </button>
        <button type="button" onclick="setLensQueryPrompt('Explain the biological structures and processes in this image')" class="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-[11px] transition-all cursor-pointer">
          🌱 Biology
        </button>
        <button type="button" onclick="setLensQueryPrompt('Explain the chemistry reaction and molecular formulas in this image')" class="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-[11px] transition-all cursor-pointer">
          🧪 Chemistry
        </button>
      </div>

      <!-- Action Control Bar Under Viewfinder -->
      <div id="lens-control-bar" class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
        
        <!-- Left: Status Indicator -->
        <div class="flex items-center gap-2 text-xs text-gray-400">
          <span id="lens-status-dot" class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span id="lens-status-text">Ready to scan. Select an image or open camera.</span>
        </div>

        <!-- Right: Action Buttons -->
        <div class="flex items-center gap-2 ml-auto">
          
          <!-- Camera Active Controls -->
          <button id="lens-snap-btn" onclick="captureLensSnapshot()" class="hidden px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all cursor-pointer">
            <i data-lucide="aperture" class="w-4 h-4"></i>
            <span>Snap & Search ⚡</span>
          </button>

          <button id="lens-flip-btn" onclick="flipLensCamera()" class="hidden p-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer" title="Flip Camera Front/Back">
            <i data-lucide="refresh-cw" class="w-4 h-4"></i>
          </button>

          <button id="lens-close-cam-btn" onclick="cleanupLensCamera()" class="hidden px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer">
            Close Camera ✕
          </button>

          <button id="lens-clear-btn" onclick="clearLensPreview()" class="hidden px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer">
            Clear Image ✕
          </button>

        </div>
      </div>

    </div>

    <!-- RESULTS DISPLAY CONTAINER -->
    <div id="lens-results-container" class="space-y-6"></div>

  </div>
  `;
}

function initLensView() {
  // Listen for global clipboard paste (Ctrl+V)
  window.removeEventListener('paste', handleLensPaste);
  window.addEventListener('paste', handleLensPaste);

  // Setup drag & drop on the viewfinder
  const dropZone = document.getElementById('lens-viewfinder-container');
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('lens-drop-active');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('lens-drop-active');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('lens-drop-active');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processUploadedImageFile(e.dataTransfer.files[0]);
      }
    });
  }
}

function setLensMode(mode) {
  currentLensMode = mode;
  ['search', 'text', 'homework'].forEach(m => {
    const btn = document.getElementById(`lens-mode-${m}`);
    if (btn) {
      if (m === mode) {
        const bg = m === 'search' ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30' :
                   m === 'text' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' :
                   'bg-indigo-600 text-white shadow-md shadow-indigo-600/30';
        btn.className = `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${bg}`;
      } else {
        btn.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all text-gray-300 hover:text-white';
      }
    }
  });

  const searchInput = document.getElementById('lens-search-input');
  if (searchInput) {
    searchInput.placeholder = mode === 'search' ? "Add to search or ask anything about this image..." :
                              mode === 'text' ? "Enter or verify text extracted from this photo..." :
                              "Ask GuruG to solve the problem shown in this photo...";
  }

  // If user already has an inquiry or image loaded, re-scan
  const query = searchInput ? searchInput.value.trim() : '';
  if (lensSelectedImageData || query) {
    executeLensScan(query);
  }
}

function setLensQueryPrompt(promptText) {
  const searchInput = document.getElementById('lens-search-input');
  if (searchInput) {
    searchInput.value = promptText;
  }
  executeLensScan(promptText);
}

async function startLensCamera() {
  cleanupLensCamera();
  const video = document.getElementById('lens-video');
  const emptyState = document.getElementById('lens-empty-state');
  const previewWrapper = document.getElementById('lens-preview-wrapper');
  const snapBtn = document.getElementById('lens-snap-btn');
  const flipBtn = document.getElementById('lens-flip-btn');
  const closeCamBtn = document.getElementById('lens-close-cam-btn');
  const clearBtn = document.getElementById('lens-clear-btn');
  const statusText = document.getElementById('lens-status-text');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Camera access is not supported by your browser. Please upload an image instead.");
    return;
  }

  try {
    statusText.innerText = "Requesting camera stream...";
    lensMediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: lensFacingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });

    if (video) {
      video.srcObject = lensMediaStream;
      video.classList.remove('hidden');
    }
    if (emptyState) emptyState.classList.add('hidden');
    if (previewWrapper) previewWrapper.classList.add('hidden');

    if (snapBtn) snapBtn.classList.remove('hidden');
    if (flipBtn) flipBtn.classList.remove('hidden');
    if (closeCamBtn) closeCamBtn.classList.remove('hidden');
    if (clearBtn) clearBtn.classList.add('hidden');

    statusText.innerText = "Live camera active. Frame textbook equation or diagram, then click Snap!";
    if (window.lucide) window.lucide.createIcons();
  } catch (err) {
    console.error('[GuruGLens] Camera error:', err);
    statusText.innerText = "Camera permission denied or camera not available.";
    alert("Could not access camera: " + err.message + "\nYou can still upload images or paste screenshots with Ctrl+V.");
  }
}

function captureLensSnapshot() {
  const video = document.getElementById('lens-video');
  const canvas = document.getElementById('lens-canvas');
  if (!video || !canvas) return;

  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  cleanupLensCamera();
  displayLensPreviewImage(dataUrl, false);
}

function flipLensCamera() {
  lensFacingMode = lensFacingMode === 'environment' ? 'user' : 'environment';
  startLensCamera();
}

function cleanupLensCamera() {
  if (lensMediaStream) {
    lensMediaStream.getTracks().forEach(track => track.stop());
    lensMediaStream = null;
  }
  const video = document.getElementById('lens-video');
  if (video) {
    video.srcObject = null;
    video.classList.add('hidden');
  }
  const snapBtn = document.getElementById('lens-snap-btn');
  const flipBtn = document.getElementById('lens-flip-btn');
  const closeCamBtn = document.getElementById('lens-close-cam-btn');
  if (snapBtn) snapBtn.classList.add('hidden');
  if (flipBtn) flipBtn.classList.add('hidden');
  if (closeCamBtn) closeCamBtn.classList.add('hidden');
}

function handleLensFileUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (file) {
    processUploadedImageFile(file);
  }
}

function handleLensPaste(e) {
  if (!e.clipboardData) return;
  const items = e.clipboardData.items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const file = items[i].getAsFile();
      processUploadedImageFile(file);
      break;
    }
  }
}

function processUploadedImageFile(file) {
  if (!file.type.startsWith('image/')) {
    alert("Please select a valid image file (PNG, JPG, WebP).");
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    // False indicates this is a genuine user upload, not a preset sample!
    displayLensPreviewImage(event.target.result, false);
  };
  reader.readAsDataURL(file);
}

function displayLensPreviewImage(dataUrl, isSample = false) {
  lensSelectedImageData = dataUrl;
  cleanupLensCamera();

  // If this is a real user upload (NOT a sample), CLEAR old sample text!
  if (!isSample) {
    lensExtractedText = '';
    const searchInput = document.getElementById('lens-search-input');
    const resultsContainer = document.getElementById('lens-results-container');
    if (searchInput) searchInput.value = '';
    if (resultsContainer) resultsContainer.innerHTML = '';
  }

  const previewWrapper = document.getElementById('lens-preview-wrapper');
  const previewImg = document.getElementById('lens-preview-img');
  const emptyState = document.getElementById('lens-empty-state');
  const clearBtn = document.getElementById('lens-clear-btn');
  const statusText = document.getElementById('lens-status-text');

  if (previewImg) previewImg.src = dataUrl;
  if (previewWrapper) previewWrapper.classList.remove('hidden');
  if (emptyState) emptyState.classList.add('hidden');
  if (clearBtn) clearBtn.classList.remove('hidden');
  if (statusText) statusText.innerText = "Image loaded into viewfinder.";

  if (window.lucide) window.lucide.createIcons();

  // If this is a genuine user upload, run optimized OCR & analyze!
  if (!isSample) {
    runOptimizedOCR(dataUrl);
  }
}

/**
 * High-speed client-side canvas preprocessor and Tesseract OCR runner.
 * Scales huge images down to max 1200px and enhances contrast for sharp recognition.
 */
function runOptimizedOCR(dataUrl) {
  const statusText = document.getElementById('lens-status-text');
  const statusDot = document.getElementById('lens-status-dot');

  if (statusText) statusText.innerText = "Analyzing image and scanning text (Optical Character Recognition)...";
  if (statusDot) statusDot.className = "w-2 h-2 rounded-full bg-cyan-400 animate-pulse";

  const img = new Image();
  img.onload = async () => {
    try {
      // 1. Create an offscreen canvas for scaling & contrast enhancement
      const canvas = document.createElement('canvas');
      const maxDim = 1200;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

      // 2. Run Tesseract.js if available
      if (window.Tesseract && typeof window.Tesseract.recognize === 'function') {
        const ocrRes = await window.Tesseract.recognize(optimizedDataUrl, 'eng', {
          logger: m => {
            if (m.status === 'recognizing text' && statusText) {
              const pct = Math.round((m.progress || 0) * 100);
              statusText.innerText = `Scanning image text: ${pct}%...`;
            }
          }
        });

        const rawText = ocrRes?.data?.text ? ocrRes.data.text.trim() : '';
        if (rawText && rawText.length > 2) {
          lensExtractedText = rawText;

          if (statusText) statusText.innerText = "Text detected! Searching cloud knowledge...";
          if (statusDot) statusDot.className = "w-2 h-2 rounded-full bg-emerald-400";

          // Execute search with the detected text
          executeLensScan(rawText);
          return;
        }
      }

      // If no text was found (e.g. pure diagram, visual object, anatomy, circuit):
      if (statusText) statusText.innerText = "Visual diagram/photo detected. Tell GuruG what to search or click an intent chip above!";
      if (statusDot) statusDot.className = "w-2 h-2 rounded-full bg-cyan-400";
      
      const searchInput = document.getElementById('lens-search-input');
      if (searchInput) searchInput.focus();

      // Trigger scan to show guiding card if searchInput is empty
      executeLensScan();
    } catch (ocrErr) {
      console.warn('[GuruGLens] OCR Error:', ocrErr);
      if (statusText) statusText.innerText = "Image loaded. Type your question or click a subject chip above to search!";
      executeLensScan();
    }
  };
  img.src = dataUrl;
}

function triggerManualOCR() {
  if (!lensSelectedImageData) {
    alert("Please upload or capture an image first.");
    return;
  }
  runOptimizedOCR(lensSelectedImageData);
}

function clearLensPreview() {
  lensSelectedImageData = null;
  lensExtractedText = '';
  cleanupLensCamera();

  const previewWrapper = document.getElementById('lens-preview-wrapper');
  const previewImg = document.getElementById('lens-preview-img');
  const emptyState = document.getElementById('lens-empty-state');
  const clearBtn = document.getElementById('lens-clear-btn');
  const statusText = document.getElementById('lens-status-text');
  const resultsContainer = document.getElementById('lens-results-container');
  const searchInput = document.getElementById('lens-search-input');

  if (previewImg) previewImg.src = '';
  if (previewWrapper) previewWrapper.classList.add('hidden');
  if (emptyState) emptyState.classList.remove('hidden');
  if (clearBtn) clearBtn.classList.add('hidden');
  if (resultsContainer) resultsContainer.innerHTML = '';
  if (searchInput) searchInput.value = '';
  if (statusText) statusText.innerText = "Ready to scan. Select an image or open camera.";

  if (window.lucide) window.lucide.createIcons();
}

function handleSelectLensSample(sampleId) {
  const sample = (lensSamplesCache || []).find(s => s.id === sampleId);
  if (!sample) return;

  currentLensMode = sample.mode || 'search';
  setLensMode(currentLensMode);

  // Set sample text & preview (true indicates this is a preset sample)
  lensExtractedText = sample.sample_text;
  if (sample.preview_svg) {
    displayLensPreviewImage(sample.preview_svg, true);
  }

  const searchInput = document.getElementById('lens-search-input');
  if (searchInput) searchInput.value = sample.sample_text;

  executeLensScan(sample.sample_text);
}

async function executeLensScan(customQuery = null) {
  if (isLensScanning) return;
  isLensScanning = true;

  const laserBar = document.getElementById('lens-laser-bar');
  const statusText = document.getElementById('lens-status-text');
  const statusDot = document.getElementById('lens-status-dot');
  const searchSubmitBtn = document.getElementById('lens-search-submit-btn');
  const resultsContainer = document.getElementById('lens-results-container');
  const searchInput = document.getElementById('lens-search-input');

  if (laserBar) laserBar.classList.remove('hidden');
  if (statusDot) {
    statusDot.className = "w-2 h-2 rounded-full bg-cyan-400 animate-ping";
  }
  if (searchSubmitBtn) {
    searchSubmitBtn.disabled = true;
    searchSubmitBtn.innerHTML = `<span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span><span>Searching...</span>`;
  }

  // Determine effective query from user input, OCR, or passed argument
  const inputVal = searchInput ? searchInput.value.trim() : '';
  const effectiveQuery = customQuery !== null ? customQuery : (inputVal || lensExtractedText);

  if (statusText) {
    statusText.innerText = effectiveQuery 
      ? `Searching cloud knowledge base for: "${effectiveQuery.slice(0, 40)}..."` 
      : "Connecting to cloud visual search engine...";
  }

  try {
    const user = api.user || {};
    const customKey = localStorage.getItem('gurug_custom_key') || '';
    const res = await api.scanLens({
      image_data: lensSelectedImageData,
      extracted_text: effectiveQuery,
      mode: currentLensMode,
      language: user.preferred_language || 'English',
      grade_level: user.grade_level || 'Class 9–10',
      query_hint: effectiveQuery,
      custom_key: customKey
    });

    if (resultsContainer) {
      resultsContainer.innerHTML = renderLensResult(res);
      renderMathInContainer(resultsContainer);
      if (window.lucide) window.lucide.createIcons();
      // Smooth scroll to results
      resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (statusText) statusText.innerText = `Scan complete! Identified: ${res.entity_name || 'Academic Concept'}`;
    if (statusDot) statusDot.className = "w-2 h-2 rounded-full bg-emerald-400";
  } catch (err) {
    console.error('[GuruGLens] Scan error:', err);
    if (statusText) statusText.innerText = "Scan error: " + err.message;
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <strong>Could not complete cloud search:</strong> ${escapeHtml(err.message)}
        </div>
      `;
    }
  } finally {
    isLensScanning = false;
    if (laserBar) laserBar.classList.add('hidden');
    if (searchSubmitBtn) {
      searchSubmitBtn.disabled = false;
      searchSubmitBtn.innerHTML = `<i data-lucide="sparkles" class="w-3.5 h-3.5"></i><span>Search Cloud ⚡</span>`;
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

function renderLensResult(data) {
  const isPrompt = data.status === 'waiting_input';
  const entity = data.entity_name || "Academic Concept";
  const subject = data.subject || "General Science";
  const confidence = data.confidence || 98;
  const summary = data.summary || "";
  const explanationHtml = formatMarkdown(data.detailed_explanation || "");
  const formulas = data.katex_formulas || [];
  const keyFacts = data.key_facts || [];
  const cloudLinks = data.cloud_search_results || [];
  const questions = data.suggested_questions || [];
  const visual = data.visual_aid;

  return `
  <!-- ========================================================
       GOOGLE LENS CLOUD KNOWLEDGE RESULT CARD
       ======================================================== -->
  <div class="glass-panel-elevated p-6 sm:p-8 rounded-3xl ${isPrompt ? 'border border-amber-500/40 bg-amber-950/10' : 'border border-cyan-500/30 glow-cyan'} space-y-6 fade-in">
    
    <!-- Top Result Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-2xl ${isPrompt ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'} flex items-center justify-center shrink-0">
          <i data-lucide="${isPrompt ? 'help-circle' : 'check-circle-2'}" class="w-6 h-6"></i>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isPrompt ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}">${subject}</span>
            <span class="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>${confidence}% Visual Match</span>
            </span>
          </div>
          <h2 class="text-xl sm:text-2xl font-extrabold text-white mt-1">${escapeHtml(entity)}</h2>
        </div>
      </div>

      <!-- Action Buttons Top Bar -->
      ${!isPrompt ? `
        <div class="flex items-center gap-2 shrink-0">
          <button onclick="readAloudLensResult()" id="lens-read-btn" class="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer">
            <i data-lucide="volume-2" class="w-4 h-4"></i>
            <span id="lens-read-btn-text">Read Aloud 🔊</span>
          </button>

          <button onclick="transferToTutor('${escapeHtml(entity)}')" class="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer">
            <i data-lucide="message-square" class="w-4 h-4"></i>
            <span>Ask GuruG 💬</span>
          </button>
        </div>
      ` : ''}
    </div>

    <!-- Summary Box -->
    ${summary ? `
      <div class="p-4 rounded-2xl ${isPrompt ? 'bg-amber-500/10 border border-amber-500/20 text-amber-200' : 'bg-white/[0.03] border border-white/10 text-gray-200'} text-xs sm:text-sm leading-relaxed font-medium">
        💡 <strong>${isPrompt ? 'Action Guide:' : 'Quick Overview:'}</strong> ${escapeHtml(summary)}
      </div>
    ` : ''}

    <!-- Key Mathematical / Scientific Formulas (KaTeX) -->
    ${formulas.length > 0 ? `
      <div class="space-y-2">
        <div class="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
          <i data-lucide="code" class="w-3.5 h-3.5"></i>
          <span>Mathematical & Governing Formulas</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          ${formulas.map(f => {
            const raw = (f || '').toString().trim();
            const clean = raw.replace(/^[\$]+|[\$]+$/g, '').trim();
            if (!clean) return '';
            return `
            <div class="p-3 rounded-xl bg-black/40 border border-white/10 text-center text-xs text-white overflow-x-auto font-mono">
              $$ ${clean} $$
            </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Visual Concept Diagram (If Available from Visual Engine) -->
    ${visual && visual.image_url ? `
      <div class="concept-visual-card p-4 rounded-2xl bg-gradient-to-br from-purple-950/20 via-black/40 to-cyan-950/20 border border-purple-500/30 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span class="font-bold text-white text-xs sm:text-sm">${escapeHtml(visual.title || entity)}</span>
          </div>
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Concept Diagram</span>
        </div>

        <div class="relative rounded-xl overflow-hidden bg-black/50 border border-white/10 text-center cursor-pointer group" onclick="openImageLightbox('${visual.image_url}', '${escapeHtml(visual.title || entity)}', '${escapeHtml(visual.caption || '')}')">
          <img src="${visual.image_url}" alt="${visual.title || entity}" class="w-full max-h-80 object-contain mx-auto py-2 transition-transform duration-300 group-hover:scale-[1.02]" loading="lazy" />
          <div class="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            <span>🔍 Click to Zoom</span>
          </div>
        </div>

        <div class="text-xs text-gray-300 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
          <p class="font-medium text-purple-200">💡 <strong>Visual Insight:</strong> ${escapeHtml(visual.caption || '')}</p>
        </div>
      </div>
    ` : ''}

    <!-- Detailed Explanation Body -->
    <div class="space-y-2">
      <div class="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
        <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
        <span>Deep Conceptual & Step-by-Step Breakdown</span>
      </div>
      <div class="tutor-rendered-content text-xs sm:text-sm text-gray-200 leading-relaxed space-y-3 p-4 rounded-2xl bg-black/30 border border-white/5" id="lens-explanation-text">
        ${explanationHtml}
      </div>
    </div>

    <!-- Key Facts Grid -->
    ${keyFacts.length > 0 ? `
      <div class="space-y-2">
        <div class="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
          <i data-lucide="check-square" class="w-3.5 h-3.5"></i>
          <span>Key Takeaways & Insights</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          ${keyFacts.map(fact => `
            <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-xs text-gray-300 flex items-start gap-2.5">
              <span class="text-emerald-400 font-bold">•</span>
              <span class="leading-relaxed">${escapeHtml(fact)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Cloud Search References -->
    ${cloudLinks.length > 0 ? `
      <div class="space-y-2 pt-2 border-t border-white/10">
        <div class="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <i data-lucide="globe" class="w-3.5 h-3.5"></i>
          <span>Cloud Knowledge References</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${cloudLinks.map(link => `
            <div class="p-3.5 rounded-xl bg-black/40 border border-white/10 hover:border-cyan-500/30 transition-colors">
              <div class="text-xs font-bold text-cyan-300">${escapeHtml(link.title)}</div>
              <div class="text-[11px] text-gray-400 mt-1 leading-relaxed">${escapeHtml(link.snippet)}</div>
              <div class="text-[9px] text-purple-400 font-mono mt-2">${escapeHtml(link.source || 'Cloud Knowledge')}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Bottom Actions Hub -->
    <div class="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div class="text-xs font-bold text-white">What would you like to do next with this concept?</div>
        <div class="text-[11px] text-gray-400">Launch a live tutor chat, generate a practice quiz, or solve numericals</div>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button onclick="transferToTutor('${escapeHtml(entity)}')" class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 cursor-pointer">
          Ask GuruG 💬
        </button>

        <button onclick="transferToSolver('${escapeHtml(entity)}')" class="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30 cursor-pointer">
          Solve Step-by-Step 🧮
        </button>

        <button onclick="transferToQuiz('${escapeHtml(entity)}')" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer">
          Take Quiz 📝
        </button>
      </div>
    </div>

  </div>
  `;
}

function copyLensText() {
  const textarea = document.getElementById('lens-ocr-textarea');
  const btn = document.getElementById('copy-lens-text-btn');
  if (!textarea) return;

  navigator.clipboard.writeText(textarea.value);
  if (btn) {
    btn.innerHTML = `<i data-lucide="check" class="w-3 h-3 text-emerald-400"></i><span class="text-emerald-300">Copied!</span>`;
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
      btn.innerHTML = `<i data-lucide="copy" class="w-3 h-3"></i><span>Copy Text</span>`;
      if (window.lucide) window.lucide.createIcons();
    }, 2000);
  }
}

let isLensSpeaking = false;
function readAloudLensResult() {
  const btn = document.getElementById('lens-read-btn');
  const btnText = document.getElementById('lens-read-btn-text');
  const container = document.getElementById('lens-explanation-text');

  if (isLensSpeaking) {
    TTS.stop();
    isLensSpeaking = false;
    if (btnText) btnText.innerText = "Read Aloud 🔊";
    return;
  }

  const text = container ? container.innerText : '';
  if (!text) return;

  const user = api.user || {};
  const lang = user.preferred_language || 'en';

  isLensSpeaking = true;
  if (btnText) btnText.innerText = "Speaking Natural Voice... ⏹";

  TTS.speak(
    text,
    lang,
    () => {
      isLensSpeaking = true;
      if (btnText) btnText.innerText = "Speaking Natural Voice... ⏹";
    },
    () => {
      isLensSpeaking = false;
      if (btnText) btnText.innerText = "Read Aloud 🔊";
    }
  );
}

function transferToTutor(topic) {
  const prompt = `I scanned this topic using GuruG Lens: "${topic}". Can you explain it conversationally and give me an intuitive real-life example?`;
  sessionStorage.setItem('gurug_pending_question', prompt);
  sessionStorage.setItem('gurug_target_prompt', prompt);
  window.location.hash = '#/tutor';
}

function transferToSolver(topic) {
  const prompt = `Solve and break down this problem from GuruG Lens: "${topic}"`;
  sessionStorage.setItem('gurug_target_problem', prompt);
  window.location.hash = '#/solver';
}

function transferToQuiz(topic) {
  sessionStorage.setItem('gurug_target_topic', topic);
  window.location.hash = '#/quiz';
}
