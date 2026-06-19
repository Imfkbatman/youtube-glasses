const screens = {
  home: document.getElementById('home'),
  player: document.getElementById('player')
};

const input = document.getElementById('videoInput');
const playBtn = document.getElementById('playBtn');
const frame = document.getElementById('ytFrame');
const backBtn = document.getElementById('backBtn');
const openMobile = document.getElementById('openMobile');

let focusables = [];
let focusIndex = 0;

function refreshFocusables() {
  const active = document.querySelector('.screen.active');
  focusables = Array.from(active.querySelectorAll('.focusable'));
  focusIndex = Math.max(0, Math.min(focusIndex, focusables.length - 1));
  setFocus();
}

function setFocus() {
  focusables.forEach(el => el.classList.remove('focused'));
  if (focusables[focusIndex]) {
    focusables[focusIndex].classList.add('focused');
    focusables[focusIndex].focus({ preventScroll: true });
  }
}

function show(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
  focusIndex = 0;
  refreshFocusables();
}

function extractVideoId(text) {
  text = (text || '').trim();
  if (!text) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(text)) return text;

  try {
    const url = new URL(text);
    if (url.hostname.includes('youtu.be')) return url.pathname.replace('/', '').slice(0, 11);
    if (url.searchParams.get('v')) return url.searchParams.get('v').slice(0, 11);
    const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
    const shortsMatch = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];
  } catch (e) {}

  return text.slice(0, 11);
}

function play(idOrUrl) {
  const id = extractVideoId(idOrUrl);
  if (!id) return;
  frame.src = `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&controls=1&rel=0`;
  show('player');
}

playBtn.addEventListener('click', () => play(input.value));
backBtn.addEventListener('click', () => {
  frame.src = 'about:blank';
  show('home');
});
openMobile.addEventListener('click', () => {
  window.location.href = 'https://m.youtube.com';
});

document.querySelectorAll('.preset').forEach(btn => {
  btn.addEventListener('click', () => play(btn.dataset.id));
});

document.addEventListener('keydown', e => {
  const key = e.key;
  if (key === 'ArrowDown' || key === 'ArrowRight') {
    e.preventDefault();
    focusIndex = (focusIndex + 1) % focusables.length;
    setFocus();
  } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
    e.preventDefault();
    focusIndex = (focusIndex - 1 + focusables.length) % focusables.length;
    setFocus();
  } else if (key === 'Enter' || key === ' ') {
    e.preventDefault();
    const el = focusables[focusIndex];
    if (el) el.click();
  } else if (key === 'Escape' || key === 'Backspace') {
    if (screens.player.classList.contains('active')) {
      frame.src = 'about:blank';
      show('home');
    }
  }
});

refreshFocusables();
