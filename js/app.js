/**
 * Cenovicz Oftalmologia - Smart TV Digital Signage Player
 * High-Performance Slideshow Controller
 */

(function () {
  'use strict';

  // State
  const state = {
    currentIndex: 0,
    isPlaying: true,
    slideDuration: 12, // seconds
    transitionEffect: 'fade', // 'fade' | 'zoom' | 'slide'
    showClock: true,
    showProgress: true,
    autoReloadHours: 6,
    timer: null,
    progressInterval: null,
    progressPercent: 0,
    startTime: null,
    remainingTime: null,
    hudTimeout: null,
    isHudVisible: true,
    wakeLock: null,
    activeLayer: 'A', // 'A' or 'B'
  };

  // DOM Elements
  const dom = {
    app: document.getElementById('app'),
    slidesViewport: document.getElementById('slidesViewport'),
    layerA: document.getElementById('layerA'),
    layerB: document.getElementById('layerB'),
    imgA: document.getElementById('imgA'),
    imgB: document.getElementById('imgB'),
    hudContainer: document.getElementById('hudContainer'),
    hudBottom: document.getElementById('hudBottom'),
    clockWidget: document.getElementById('clockWidget'),
    clockTime: document.getElementById('clockTime'),
    clockDate: document.getElementById('clockDate'),
    statusBadge: document.getElementById('statusBadge'),
    statusText: document.getElementById('statusText'),
    slideCounter: document.getElementById('slideCounter'),
    progressBar: document.getElementById('progressBar'),
    progressContainer: document.getElementById('progressContainer'),
    btnPrev: document.getElementById('btnPrev'),
    btnNext: document.getElementById('btnNext'),
    btnPlayPause: document.getElementById('btnPlayPause'),
    iconPlay: document.getElementById('iconPlay'),
    iconPause: document.getElementById('iconPause'),
    btnFullscreen: document.getElementById('btnFullscreen'),
    iconExpand: document.getElementById('iconExpand'),
    iconCompress: document.getElementById('iconCompress'),
    btnGrid: document.getElementById('btnGrid'),
    btnSettings: document.getElementById('btnSettings'),
    modalGrid: document.getElementById('modalGrid'),
    modalSettings: document.getElementById('modalSettings'),
    btnCloseGrid: document.getElementById('btnCloseGrid'),
    btnCloseSettings: document.getElementById('btnCloseSettings'),
    slideGridContainer: document.getElementById('slideGridContainer'),
    settingsForm: document.getElementById('settingsForm'),
    settingDuration: document.getElementById('settingDuration'),
    settingTransition: document.getElementById('settingTransition'),
    settingShowClock: document.getElementById('settingShowClock'),
    settingShowProgress: document.getElementById('settingShowProgress'),
    settingAutoReload: document.getElementById('settingAutoReload'),
    toastContainer: document.getElementById('toastContainer'),
  };

  // Load Settings from LocalStorage
  function loadStoredSettings() {
    try {
      const saved = localStorage.getItem('cenovicz_tv_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.slideDuration) state.slideDuration = parseInt(parsed.slideDuration, 10);
        if (parsed.transitionEffect) state.transitionEffect = parsed.transitionEffect;
        if (typeof parsed.showClock === 'boolean') state.showClock = parsed.showClock;
        if (typeof parsed.showProgress === 'boolean') state.showProgress = parsed.showProgress;
        if (typeof parsed.autoReloadHours === 'number') state.autoReloadHours = parsed.autoReloadHours;
      }
    } catch (e) {
      console.warn('Erro ao carregar configurações salvas:', e);
    }
  }

  // Save Settings to LocalStorage
  function saveStoredSettings() {
    try {
      const toSave = {
        slideDuration: state.slideDuration,
        transitionEffect: state.transitionEffect,
        showClock: state.showClock,
        showProgress: state.showProgress,
        autoReloadHours: state.autoReloadHours,
      };
      localStorage.setItem('cenovicz_tv_settings', JSON.stringify(toSave));
    } catch (e) {
      console.warn('Erro ao salvar configurações:', e);
    }
  }

  // Sync Settings with Form UI
  function applySettingsUI() {
    dom.settingDuration.value = state.slideDuration;
    dom.settingTransition.value = state.transitionEffect;
    dom.settingShowClock.checked = state.showClock;
    dom.settingShowProgress.checked = state.showProgress;
    dom.settingAutoReload.value = state.autoReloadHours;

    dom.clockWidget.style.display = state.showClock ? 'flex' : 'none';
    dom.progressContainer.style.display = state.showProgress ? 'block' : 'none';

    dom.app.className = `transition-${state.transitionEffect}`;
  }

  // Toast Notification
  let toastTimer = null;
  function showToast(msg) {
    if (!dom.toastContainer) return;
    dom.toastContainer.textContent = msg;
    dom.toastContainer.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      dom.toastContainer.classList.remove('show');
    }, 2500);
  }

  // Preload Images
  function preloadSlide(index) {
    const total = SLIDES_CONFIG.slides.length;
    const safeIndex = (index + total) % total;
    const img = new Image();
    img.src = SLIDES_CONFIG.slides[safeIndex].src;
  }

  // Update Clock & Date (Reception / Waiting Room Feature)
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    dom.clockTime.textContent = `${hours}:${minutes}`;

    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    const diaNome = diasSemana[now.getDay()];
    const diaNum = String(now.getDate()).padStart(2, '0');
    const mesNome = meses[now.getMonth()];
    dom.clockDate.textContent = `${diaNome}, ${diaNum} de ${mesNome}`;
  }

  // Screen Wake Lock API (Keep TV Screen Awake)
  async function requestWakeLock() {
    if ('wakeLock' in navigator && state.isPlaying) {
      try {
        state.wakeLock = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.log('Wake Lock request error:', err);
      }
    }
  }

  function releaseWakeLock() {
    if (state.wakeLock !== null) {
      state.wakeLock.release().then(() => {
        state.wakeLock = null;
      });
    }
  }

  // Slide Render Logic with Double-Buffer GPU Layers
  function renderSlide(index, skipAnimation = false) {
    const slides = SLIDES_CONFIG.slides;
    const total = slides.length;
    state.currentIndex = (index + total) % total;
    const currentSlide = slides[state.currentIndex];

    const currentLayer = state.activeLayer === 'A' ? dom.layerA : dom.layerB;
    const nextLayer = state.activeLayer === 'A' ? dom.layerB : dom.layerA;
    const nextImg = state.activeLayer === 'A' ? dom.imgB : dom.imgA;

    // Load next image into inactive layer
    nextImg.src = currentSlide.src;
    nextImg.alt = currentSlide.title || `Slide ${state.currentIndex + 1}`;

    // Swap active class
    nextLayer.classList.add('active');
    currentLayer.classList.remove('active');
    state.activeLayer = state.activeLayer === 'A' ? 'B' : 'A';

    // Update Counter & Grid highlight
    const formattedCurrent = String(state.currentIndex + 1).padStart(2, '0');
    const formattedTotal = String(total).padStart(2, '0');
    dom.slideCounter.textContent = `${formattedCurrent} / ${formattedTotal}`;

    updateGridActiveItem();

    // Preload next and previous slides
    preloadSlide(state.currentIndex + 1);
    preloadSlide(state.currentIndex + 2);
    preloadSlide(state.currentIndex - 1);

    // Reset Progress & Timer
    startSlideTimer();
  }

  // Get duration for current slide
  function getCurrentDuration() {
    const slide = SLIDES_CONFIG.slides[state.currentIndex];
    return (slide && slide.duration) ? slide.duration : state.slideDuration;
  }

  // Slide Timer & Progress Bar
  function startSlideTimer() {
    clearTimeout(state.timer);
    clearInterval(state.progressInterval);
    dom.progressBar.style.width = '0%';

    if (!state.isPlaying) return;

    const duration = getCurrentDuration() * 1000;
    const intervalStep = 100;
    let elapsed = 0;

    state.progressInterval = setInterval(() => {
      if (!state.isPlaying) return;
      elapsed += intervalStep;
      const percent = Math.min((elapsed / duration) * 100, 100);
      dom.progressBar.style.width = `${percent}%`;

      if (elapsed >= duration) {
        clearInterval(state.progressInterval);
        nextSlide();
      }
    }, intervalStep);
  }

  function pauseSlideshow() {
    state.isPlaying = false;
    clearInterval(state.progressInterval);
    clearTimeout(state.timer);

    dom.statusBadge.classList.add('paused');
    dom.statusText.textContent = 'Pausado';
    dom.iconPlay.style.display = 'block';
    dom.iconPause.style.display = 'none';

    releaseWakeLock();
    showToast('Apresentação pausada');
  }

  function resumeSlideshow() {
    state.isPlaying = true;
    dom.statusBadge.classList.remove('paused');
    dom.statusText.textContent = 'Transmitindo';
    dom.iconPlay.style.display = 'none';
    dom.iconPause.style.display = 'block';

    requestWakeLock();
    startSlideTimer();
    showToast('Apresentação em execução');
  }

  function togglePlayPause() {
    if (state.isPlaying) {
      pauseSlideshow();
    } else {
      resumeSlideshow();
    }
  }

  function nextSlide() {
    renderSlide(state.currentIndex + 1);
  }

  function prevSlide() {
    renderSlide(state.currentIndex - 1);
  }

  function goToSlide(index) {
    renderSlide(index);
    closeModals();
  }

  // Auto-Hide HUD for Clean TV Display
  function showHud() {
    dom.hudContainer.classList.remove('hud-hidden');
    state.isHudVisible = true;
    clearTimeout(state.hudTimeout);

    // If modal is open, do not auto-hide HUD
    if (dom.modalGrid.classList.contains('open') || dom.modalSettings.classList.contains('open')) {
      return;
    }

    state.hudTimeout = setTimeout(() => {
      dom.hudContainer.classList.add('hud-hidden');
      state.isHudVisible = false;
    }, 3500);
  }

  // Slide Grid Drawer Builder
  function buildSlideGrid() {
    dom.slideGridContainer.innerHTML = '';
    SLIDES_CONFIG.slides.forEach((slide, index) => {
      const item = document.createElement('div');
      item.className = `slide-grid-item ${index === state.currentIndex ? 'current' : ''}`;
      item.tabIndex = 0;
      item.dataset.index = index;

      item.innerHTML = `
        <img src="${slide.src}" alt="${slide.title}" loading="lazy">
        <div class="slide-grid-label">
          <span>Slide ${index + 1}</span>
          <span>${slide.duration || state.slideDuration}s</span>
        </div>
      `;

      item.addEventListener('click', () => goToSlide(index));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          goToSlide(index);
        }
      });

      dom.slideGridContainer.appendChild(item);
    });
  }

  function updateGridActiveItem() {
    const items = dom.slideGridContainer.querySelectorAll('.slide-grid-item');
    items.forEach((item, idx) => {
      if (idx === state.currentIndex) {
        item.classList.add('current');
      } else {
        item.classList.remove('current');
      }
    });
  }

  // Modals
  function openModal(modal) {
    closeModals();
    modal.classList.add('open');
    showHud();
  }

  function closeModals() {
    dom.modalGrid.classList.remove('open');
    dom.modalSettings.classList.remove('open');
    showHud();
  }

  // Fullscreen Management
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Erro ao entrar em tela cheia:', err);
      });
      dom.iconExpand.style.display = 'none';
      dom.iconCompress.style.display = 'block';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      dom.iconExpand.style.display = 'block';
      dom.iconCompress.style.display = 'none';
    }
  }

  // Auto-Reload Protection for 24/7 Smart TVs
  function setupAutoReload() {
    if (state.autoReloadHours > 0) {
      const reloadMs = state.autoReloadHours * 60 * 60 * 1000;
      setTimeout(() => {
        window.location.reload();
      }, reloadMs);
    }
  }

  // Event Listeners Setup
  function setupEvents() {
    // Buttons
    dom.btnPlayPause.addEventListener('click', togglePlayPause);
    dom.btnNext.addEventListener('click', nextSlide);
    dom.btnPrev.addEventListener('click', prevSlide);
    dom.btnFullscreen.addEventListener('click', toggleFullscreen);

    dom.btnGrid.addEventListener('click', () => {
      buildSlideGrid();
      openModal(dom.modalGrid);
    });

    dom.btnSettings.addEventListener('click', () => {
      openModal(dom.modalSettings);
    });

    dom.btnCloseGrid.addEventListener('click', closeModals);
    dom.btnCloseSettings.addEventListener('click', closeModals);

    // Close modals on backdrop click
    dom.modalGrid.addEventListener('click', (e) => {
      if (e.target === dom.modalGrid) closeModals();
    });
    dom.modalSettings.addEventListener('click', (e) => {
      if (e.target === dom.modalSettings) closeModals();
    });

    // Settings Form Inputs
    dom.settingDuration.addEventListener('change', (e) => {
      state.slideDuration = parseInt(e.target.value, 10);
      saveStoredSettings();
      startSlideTimer();
      showToast(`Tempo por slide: ${state.slideDuration}s`);
    });

    dom.settingTransition.addEventListener('change', (e) => {
      state.transitionEffect = e.target.value;
      dom.app.className = `transition-${state.transitionEffect}`;
      saveStoredSettings();
      showToast(`Transição alterada`);
    });

    dom.settingShowClock.addEventListener('change', (e) => {
      state.showClock = e.target.checked;
      dom.clockWidget.style.display = state.showClock ? 'flex' : 'none';
      saveStoredSettings();
    });

    dom.settingShowProgress.addEventListener('change', (e) => {
      state.showProgress = e.target.checked;
      dom.progressContainer.style.display = state.showProgress ? 'block' : 'none';
      saveStoredSettings();
    });

    dom.settingAutoReload.addEventListener('change', (e) => {
      state.autoReloadHours = parseInt(e.target.value, 10);
      saveStoredSettings();
      showToast(`Auto-recarga: a cada ${state.autoReloadHours}h`);
    });

    // User Movement / Interaction to Show HUD
    window.addEventListener('mousemove', showHud);
    window.addEventListener('touchstart', showHud, { passive: true });
    window.addEventListener('click', showHud);

    // Double click to toggle fullscreen
    dom.slidesViewport.addEventListener('dblclick', toggleFullscreen);

    // Keyboard & Remote Control Keybindings
    window.addEventListener('keydown', (e) => {
      showHud();

      // If typing in input or select, don't trigger global shortcuts
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        if (e.key === 'Escape') closeModals();
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case 'MediaTrackNext':
        case 'd':
        case 'D':
        case 'l':
        case 'L':
          e.preventDefault();
          nextSlide();
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'MediaTrackPrevious':
        case 'a':
        case 'A':
        case 'j':
        case 'J':
          e.preventDefault();
          prevSlide();
          break;

        case ' ':
        case 'MediaPlayPause':
        case 'MediaPlay':
        case 'MediaPause':
        case 'k':
        case 'K':
          e.preventDefault();
          togglePlayPause();
          break;

        case 'Enter':
          if (!dom.modalGrid.classList.contains('open') && !dom.modalSettings.classList.contains('open')) {
            e.preventDefault();
            nextSlide();
          }
          break;

        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;

        case 'g':
        case 'G':
          e.preventDefault();
          if (dom.modalGrid.classList.contains('open')) {
            closeModals();
          } else {
            buildSlideGrid();
            openModal(dom.modalGrid);
          }
          break;

        case 's':
        case 'S':
          e.preventDefault();
          if (dom.modalSettings.classList.contains('open')) {
            closeModals();
          } else {
            openModal(dom.modalSettings);
          }
          break;

        case 'Escape':
          e.preventDefault();
          closeModals();
          break;
      }
    });

    // Re-acquire Wake Lock when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && state.isPlaying) {
        requestWakeLock();
      }
    });
  }

  // Initialization
  function init() {
    loadStoredSettings();
    applySettingsUI();
    setupEvents();
    buildSlideGrid();

    // Clock Interval
    updateClock();
    setInterval(updateClock, 1000);

    // Initial Slide
    renderSlide(0);

    // Wake Lock & Auto-Reload
    requestWakeLock();
    setupAutoReload();

    // Trigger initial HUD timeout
    showHud();
  }

  // Boot up when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
