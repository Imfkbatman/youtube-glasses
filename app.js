const STORAGE_KEYS = {
  apiKey: 'ytg.apiKey',
  clientId: 'ytg.clientId',
  region: 'ytg.region',
  fullscreen: 'ytg.fullscreen',
  history: 'ytg.history',
  favorites: 'ytg.favorites'
};

const starterVideos = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Classic music video',
    channel: 'YouTube',
    kind: 'video'
  },
  {
    id: 'M7lc1UVf-VE',
    title: 'YouTube embedded player demo',
    channel: 'Google for Developers',
    kind: 'video'
  },
  {
    id: 'jNQXAC9IVRw',
    title: 'Me at the zoo',
    channel: 'jawed',
    kind: 'shorts'
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Global music hit',
    channel: 'YouTube',
    kind: 'video'
  }
];

const screens = {
  home: document.getElementById('home'),
  search: document.getElementById('search'),
  library: document.getElementById('library'),
  settings: document.getElementById('settings'),
  player: document.getElementById('player')
};

const app = document.getElementById('app');
const searchInput = document.getElementById('searchInput');
const searchInputSearch = document.getElementById('searchInputSearch');
const searchButton = document.getElementById('searchButton');
const searchButtonSearch = document.getElementById('searchButtonSearch');
const voiceButton = document.getElementById('voiceButton');
const voiceButtonSearch = document.getElementById('voiceButtonSearch');
const backButton = document.getElementById('backButton');
const settingsButton = document.getElementById('settingsButton');
const refreshTrendsButton = document.getElementById('refreshTrendsButton');
const openYouTubeSearchButton = document.getElementById('openYouTubeSearchButton');
const clearHistoryButton = document.getElementById('clearHistoryButton');
const saveSettingsButton = document.getElementById('saveSettingsButton');
const googleButton = document.getElementById('googleButton');
const apiKeyInput = document.getElementById('apiKeyInput');
const clientIdInput = document.getElementById('clientIdInput');
const regionSelect = document.getElementById('regionSelect');
const fullscreenToggle = document.getElementById('fullscreenToggle');
const trendGrid = document.getElementById('trendGrid');
const trendStatus = document.getElementById('trendStatus');
const searchResults = document.getElementById('searchResults');
const searchStatus = document.getElementById('searchStatus');
const libraryList = document.getElementById('libraryList');
const libraryStatus = document.getElementById('libraryStatus');
const settingsStatus = document.getElementById('settingsStatus');
const frame = document.getElementById('ytFrame');
const frameShell = document.getElementById('frameShell');
const playerBackButton = document.getElementById('playerBackButton');
const favoriteButton = document.getElementById('favoriteButton');
const fullscreenButton = document.getElementById('fullscreenButton');
const openVideoButton = document.getElementById('openVideoButton');
const toast = document.getElementById('toast');
const searchInputs = [searchInput, searchInputSearch];

const state = {
  activeScreen: 'home',
  previousScreen: 'home',
  focusables: [],
  focusIndex: 0,
  searchMode: 'video',
  libraryMode: 'history',
  googleToken: '',
  currentVideo: null,
  settings: {
    apiKey: '',
    clientId: '',
    region: 'US',
    fullscreen: true
  },
  history: [],
  favorites: []
};

function safeParse(value, fallback) {
  try {
    return JSON.parse(value) ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function loadState() {
  state.settings.apiKey = localStorage.getItem(STORAGE_KEYS.apiKey) || '';
  state.settings.clientId = localStorage.getItem(STORAGE_KEYS.clientId) || '';
  state.settings.region = localStorage.getItem(STORAGE_KEYS.region) || 'US';
  state.settings.fullscreen = localStorage.getItem(STORAGE_KEYS.fullscreen) !== 'false';
  state.history = safeParse(localStorage.getItem(STORAGE_KEYS.history), []);
  state.favorites = safeParse(localStorage.getItem(STORAGE_KEYS.favorites), []);

  apiKeyInput.value = state.settings.apiKey;
  clientIdInput.value = state.settings.clientId;
  regionSelect.value = state.settings.region;
  fullscreenToggle.checked = state.settings.fullscreen;
}

function persistSettings() {
  state.settings.apiKey = apiKeyInput.value.trim();
  state.settings.clientId = clientIdInput.value.trim();
  state.settings.region = regionSelect.value;
  state.settings.fullscreen = fullscreenToggle.checked;

  localStorage.setItem(STORAGE_KEYS.apiKey, state.settings.apiKey);
  localStorage.setItem(STORAGE_KEYS.clientId, state.settings.clientId);
  localStorage.setItem(STORAGE_KEYS.region, state.settings.region);
  localStorage.setItem(STORAGE_KEYS.fullscreen, String(state.settings.fullscreen));
}

function persistLibrary() {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(state.history.slice(0, 40)));
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(state.favorites.slice(0, 40)));
}

function toastMessage(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toast.dataset.timer);
  toast.dataset.timer = window.setTimeout(() => toast.classList.remove('visible'), 2400);
}

function setStatus(element, message) {
  element.textContent = message || '';
}

function thumbnailUrl(id) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function normalizeVideo(video) {
  return {
    id: video.id,
    title: video.title || 'YouTube video',
    channel: video.channel || 'YouTube',
    kind: video.kind === 'shorts' ? 'shorts' : 'video',
    thumb: video.thumb || thumbnailUrl(video.id)
  };
}

function isFavorite(id) {
  return state.favorites.some(video => video.id === id);
}

function upsertHistory(video) {
  const normalized = normalizeVideo(video);
  state.history = [normalized, ...state.history.filter(item => item.id !== normalized.id)].slice(0, 40);
  persistLibrary();
  renderLibrary();
}

function toggleFavorite(video) {
  if (!video) return;
  const normalized = normalizeVideo(video);
  if (isFavorite(normalized.id)) {
    state.favorites = state.favorites.filter(item => item.id !== normalized.id);
    toastMessage('Удалено из избранного');
  } else {
    state.favorites = [normalized, ...state.favorites.filter(item => item.id !== normalized.id)].slice(0, 40);
    toastMessage('Добавлено в избранное');
  }
  persistLibrary();
  updateFavoriteButton();
  renderLibrary();
}

function extractVideoId(text) {
  const value = (text || '').trim();
  if (!value) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;

  try {
    const url = new URL(value);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.split('/').filter(Boolean)[0]?.slice(0, 11) || '';
    }
    if (url.searchParams.get('v')) {
      return url.searchParams.get('v').slice(0, 11);
    }
    const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
    const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];
  } catch (error) {
    return '';
  }

  return '';
}

function videoUrl(id) {
  if (!id) return 'https://m.youtube.com';
  return `https://m.youtube.com/watch?v=${encodeURIComponent(id)}`;
}

function searchUrl(query) {
  return `https://m.youtube.com/results?search_query=${encodeURIComponent(query || '')}`;
}

function getVisibleSearchInput() {
  return searchInputs.find(input => input.offsetParent !== null) || searchInput;
}

function getSearchQuery() {
  const active = searchInputs.includes(document.activeElement) ? document.activeElement : getVisibleSearchInput();
  return active.value.trim();
}

function syncSearchInputs(value) {
  searchInputs.forEach(input => {
    if (input.value !== value) input.value = value;
  });
}

function getActiveFocusScope() {
  return screens[state.activeScreen];
}

function refreshFocusables(keepIndex = false) {
  const scope = getActiveFocusScope();
  const topItems = state.activeScreen === 'player'
    ? []
    : Array.from(document.querySelectorAll('.topbar .focusable'));
  const dockItems = state.activeScreen === 'player'
    ? []
    : Array.from(document.querySelectorAll('.dock .focusable'));
  state.focusables = [
    ...Array.from(scope.querySelectorAll('.focusable:not([disabled])')),
    ...dockItems,
    ...topItems
  ].filter(element => element.offsetParent !== null);

  if (!keepIndex) {
    state.focusIndex = 0;
  }
  if (state.focusables.length) {
    state.focusIndex = Math.max(0, Math.min(state.focusIndex, state.focusables.length - 1));
    setFocus(state.focusIndex);
  }
}

function setFocus(index) {
  state.focusables.forEach(element => element.classList.remove('focused'));
  if (!state.focusables.length) return;
  state.focusIndex = (index + state.focusables.length) % state.focusables.length;
  const element = state.focusables[state.focusIndex];
  element.classList.add('focused');
  element.focus({ preventScroll: true });
}

function moveFocus(delta) {
  if (!state.focusables.length) refreshFocusables(true);
  setFocus(state.focusIndex + delta);
}

function showScreen(name) {
  if (!screens[name]) return;
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[name].classList.add('active');
  app.classList.toggle('player-mode', name === 'player');
  backButton.hidden = name === 'home' || name === 'player';
  backButton.disabled = backButton.hidden;
  if (name !== 'player') {
    state.previousScreen = state.activeScreen === 'player' ? state.previousScreen : state.activeScreen;
  }
  state.activeScreen = name;

  document.querySelectorAll('.dock-button').forEach(button => {
    button.classList.toggle('active', button.dataset.route === name);
  });

  refreshFocusables();
}

function goBack() {
  if (state.activeScreen === 'player') {
    closePlayer();
    return;
  }
  if (state.activeScreen === 'settings') {
    showScreen(state.previousScreen || 'home');
    return;
  }
  showScreen('home');
}

function renderVideoList(container, videos, emptyText) {
  container.replaceChildren();
  const normalizedVideos = videos.map(normalizeVideo).filter(video => video.id);

  if (!normalizedVideos.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = emptyText;
    container.appendChild(empty);
    refreshFocusables(true);
    return;
  }

  normalizedVideos.slice(0, 12).forEach(video => {
    const button = document.createElement('button');
    button.className = 'video-card focusable';
    button.type = 'button';
    button.dataset.video = JSON.stringify(video);
    button.innerHTML = `
      <span class="thumb">
        <img src="${video.thumb}" alt="" loading="lazy" />
        <span class="badge">${video.kind === 'shorts' ? 'Shorts' : 'Play'}</span>
      </span>
      <span class="video-meta">
        <span class="video-title"></span>
        <span class="video-channel"></span>
      </span>
      <span class="video-action">›</span>
    `;
    button.querySelector('.video-title').textContent = video.title;
    button.querySelector('.video-channel').textContent = video.channel;
    button.addEventListener('click', () => playVideo(video));
    container.appendChild(button);
  });

  refreshFocusables(true);
}

function renderFallbackTrends(message = 'Локальная подборка. Для живых трендов добавьте YouTube API key.') {
  setStatus(trendStatus, message);
  renderVideoList(trendGrid, starterVideos, 'Нет видео для показа');
}

function apiReady() {
  return Boolean(state.googleToken || state.settings.apiKey);
}

async function youtubeFetch(endpoint, params) {
  if (!apiReady()) {
    throw new Error('missing-api');
  }

  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, value);
  });

  const options = {};
  if (state.googleToken) {
    options.headers = { Authorization: `Bearer ${state.googleToken}` };
  } else {
    url.searchParams.set('key', state.settings.apiKey);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`youtube-${response.status}`);
  }
  return response.json();
}

function normalizeSearchItems(items, kind = state.searchMode) {
  return items
    .map(item => {
      const id = typeof item.id === 'string' ? item.id : item.id?.videoId;
      const snippet = item.snippet || {};
      if (!id) return null;
      return normalizeVideo({
        id,
        title: snippet.title,
        channel: snippet.channelTitle,
        kind,
        thumb: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url
      });
    })
    .filter(Boolean);
}

async function loadTrends() {
  if (!apiReady()) {
    renderFallbackTrends();
    return;
  }

  setStatus(trendStatus, 'Загружаю тренды YouTube...');
  try {
    const data = await youtubeFetch('videos', {
      part: 'snippet',
      chart: 'mostPopular',
      maxResults: 8,
      regionCode: state.settings.region
    });
    const videos = normalizeSearchItems(data.items || [], 'video');
    setStatus(trendStatus, `Регион: ${state.settings.region}`);
    renderVideoList(trendGrid, videos, 'Тренды не загрузились');
  } catch (error) {
    renderFallbackTrends('Не удалось загрузить live-тренды. Показываю локальную подборку.');
  }
}

async function runSearch() {
  const query = getSearchQuery();
  syncSearchInputs(query);
  if (!query) {
    showScreen('search');
    setStatus(searchStatus, 'Введите запрос или ссылку на видео');
    renderVideoList(searchResults, starterVideos, 'Введите запрос');
    return;
  }

  const id = extractVideoId(query);
  if (id) {
    playVideo({
      id,
      title: 'YouTube video',
      channel: 'Direct link',
      kind: query.includes('/shorts/') ? 'shorts' : state.searchMode
    });
    return;
  }

  showScreen('search');
  setStatus(searchStatus, 'Ищу видео...');

  if (!apiReady()) {
    const localMatches = starterVideos.filter(video => {
      const haystack = `${video.title} ${video.channel}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
    setStatus(searchStatus, 'Без API key доступен локальный поиск и переход в YouTube');
    renderVideoList(searchResults, localMatches, 'Нажмите YouTube для поиска на m.youtube.com');
    return;
  }

  try {
    const data = await youtubeFetch('search', {
      part: 'snippet',
      type: 'video',
      maxResults: 8,
      q: state.searchMode === 'shorts' ? `${query} #shorts` : query
    });
    const videos = normalizeSearchItems(data.items || [], state.searchMode);
    setStatus(searchStatus, state.searchMode === 'shorts' ? 'Результаты Shorts' : 'Результаты YouTube');
    renderVideoList(searchResults, videos, 'Ничего не найдено');
  } catch (error) {
    setStatus(searchStatus, 'Поиск YouTube недоступен. Проверьте ключ или вход Google.');
    renderVideoList(searchResults, [], 'Нет результатов');
  }
}

function playVideo(video) {
  const normalized = normalizeVideo(video);
  state.currentVideo = normalized;
  state.previousScreen = state.activeScreen === 'player' ? state.previousScreen : state.activeScreen;
  frameShell.classList.toggle('shorts', normalized.kind === 'shorts');
  frame.src = `https://www.youtube.com/embed/${normalized.id}?autoplay=1&playsinline=1&controls=1&rel=0`;
  upsertHistory(normalized);
  updateFavoriteButton();
  showScreen('player');
  if (state.settings.fullscreen) {
    requestFullscreen();
  }
}

function closePlayer() {
  frame.src = 'about:blank';
  showScreen(state.previousScreen || 'home');
}

function updateFavoriteButton() {
  if (!state.currentVideo) return;
  const saved = isFavorite(state.currentVideo.id);
  favoriteButton.classList.toggle('saved', saved);
  favoriteButton.textContent = saved ? 'Сохранено' : 'Сохранить';
}

async function requestFullscreen() {
  const target = document.documentElement;
  try {
    if (!document.fullscreenElement && target.requestFullscreen) {
      await target.requestFullscreen();
    }
  } catch (error) {
    toastMessage('Fullscreen ожидает жест пользователя');
  }
}

function openCurrentVideo() {
  const target = state.currentVideo ? videoUrl(state.currentVideo.id) : 'https://m.youtube.com';
  window.location.href = target;
}

function openYouTubeSearch() {
  const query = getSearchQuery();
  window.location.href = query ? searchUrl(query) : 'https://m.youtube.com';
}

function renderLibrary() {
  const items = state.libraryMode === 'favorites' ? state.favorites : state.history;
  setStatus(
    libraryStatus,
    state.libraryMode === 'favorites' ? `${state.favorites.length} в избранном` : `${state.history.length} в истории`
  );
  renderVideoList(
    libraryList,
    items,
    state.libraryMode === 'favorites' ? 'Избранное пока пустое' : 'История пока пустая'
  );
}

function clearHistory() {
  if (state.libraryMode === 'favorites') {
    state.favorites = [];
  } else {
    state.history = [];
  }
  persistLibrary();
  renderLibrary();
  toastMessage('Готово');
}

function selectSearchMode(mode) {
  state.searchMode = mode;
  document.querySelectorAll('[data-search-mode]').forEach(button => {
    button.classList.toggle('active', button.dataset.searchMode === mode);
  });
  if (searchInput.value.trim()) runSearch();
}

function selectLibraryMode(mode) {
  state.libraryMode = mode;
  document.querySelectorAll('[data-library-mode]').forEach(button => {
    button.classList.toggle('active', button.dataset.libraryMode === mode);
  });
  renderLibrary();
}

function saveSettings() {
  persistSettings();
  setStatus(settingsStatus, 'Настройки сохранены');
  toastMessage('Настройки сохранены');
  loadTrends();
}

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function signInGoogle() {
  persistSettings();
  if (!state.settings.clientId) {
    setStatus(settingsStatus, 'Добавьте Google OAuth Client ID');
    toastMessage('Нужен Client ID');
    return;
  }

  try {
    await loadGoogleScript();
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: state.settings.clientId,
      scope: 'https://www.googleapis.com/auth/youtube.readonly',
      callback: tokenResponse => {
        if (tokenResponse?.access_token) {
          state.googleToken = tokenResponse.access_token;
          setStatus(settingsStatus, 'Google подключен');
          toastMessage('Google подключен');
          loadTrends();
        }
      }
    });
    tokenClient.requestAccessToken();
  } catch (error) {
    setStatus(settingsStatus, 'Google вход недоступен в этом WebView');
  }
}

function startVoiceSearch() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const activeInput = getVisibleSearchInput();
  activeInput.focus({ preventScroll: true });
  if (!SpeechRecognition) {
    toastMessage('Голосовой ввод недоступен в этом WebView');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = navigator.language?.startsWith('ru') ? 'ru-RU' : 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = event => {
    const transcript = event.results?.[0]?.[0]?.transcript || '';
    syncSearchInputs(transcript);
    runSearch();
  };
  recognition.onerror = () => toastMessage('Не удалось распознать голос');
  recognition.start();
}

function bindEvents() {
  searchButton.addEventListener('click', runSearch);
  searchButtonSearch.addEventListener('click', runSearch);
  searchInputs.forEach(input => {
    input.addEventListener('input', () => syncSearchInputs(input.value));
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        runSearch();
      }
    });
  });
  voiceButton.addEventListener('click', startVoiceSearch);
  voiceButtonSearch.addEventListener('click', startVoiceSearch);
  refreshTrendsButton.addEventListener('click', loadTrends);
  openYouTubeSearchButton.addEventListener('click', openYouTubeSearch);
  clearHistoryButton.addEventListener('click', clearHistory);
  saveSettingsButton.addEventListener('click', saveSettings);
  googleButton.addEventListener('click', signInGoogle);
  backButton.addEventListener('click', goBack);
  settingsButton.addEventListener('click', () => {
    state.previousScreen = state.activeScreen;
    showScreen('settings');
  });
  playerBackButton.addEventListener('click', closePlayer);
  favoriteButton.addEventListener('click', () => toggleFavorite(state.currentVideo));
  fullscreenButton.addEventListener('click', requestFullscreen);
  openVideoButton.addEventListener('click', openCurrentVideo);

  document.querySelectorAll('[data-route]').forEach(button => {
    button.addEventListener('click', () => showScreen(button.dataset.route));
  });
  document.querySelectorAll('[data-search-mode]').forEach(button => {
    button.addEventListener('click', () => selectSearchMode(button.dataset.searchMode));
  });
  document.querySelectorAll('[data-library-mode]').forEach(button => {
    button.addEventListener('click', () => selectLibraryMode(button.dataset.libraryMode));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveFocus(1);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      moveFocus(-1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      const active = document.activeElement;
      if (active && active.matches('button, .video-card')) {
        event.preventDefault();
        active.click();
      }
    } else if (event.key === 'Escape' || event.key === 'Backspace') {
      event.preventDefault();
      goBack();
    }
  });

  let startX = 0;
  let startY = 0;
  app.addEventListener('pointerdown', event => {
    startX = event.clientX;
    startY = event.clientY;
  });
  app.addEventListener('pointerup', event => {
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    const horizontal = Math.abs(dx) > Math.abs(dy);
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 36) return;
    if (horizontal) {
      moveFocus(dx > 0 ? 1 : -1);
    } else if (dy < 0) {
      document.activeElement?.click();
    } else {
      goBack();
    }
  });
}

function init() {
  loadState();
  bindEvents();
  renderFallbackTrends('');
  renderLibrary();
  loadTrends();
  backButton.hidden = true;
  backButton.disabled = true;
  refreshFocusables();
}

init();
