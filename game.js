const board = document.querySelector('#board');
const ball = document.querySelector('#ball');
const goal = document.querySelector('.goal');
const sensorButton = document.querySelector('#sensor-button');
const resetButton = document.querySelector('#reset-button');
const playAgainButton = document.querySelector('#play-again');
const sensorStatus = document.querySelector('#sensor-status');
const sensorDot = document.querySelector('#sensor-dot');
const moveCount = document.querySelector('#move-count');
const finishMessage = document.querySelector('#finish-message');
const finishTitle = document.querySelector('#finish-title');
const finishCaption = document.querySelector('#finish-caption');
const levelNumber = document.querySelector('#level-number');
const levelName = document.querySelector('#level-name');
const languageButton = document.querySelector('#language-button');
const eyebrow = document.querySelector('#eyebrow');
const heroTitle = document.querySelector('#game-title');
const subtitle = document.querySelector('#subtitle');
const keyboardHint = document.querySelector('#keyboard-hint');
const startLabel = document.querySelector('#start-label');
const finishLabel = document.querySelector('#finish-label');
const footerTagline = document.querySelector('#footer-tagline');
const footerDevice = document.querySelector('#footer-device');

// 칸 수를 늘리면 길이 길어지고 막다른 길도 많아져 난도가 올라갑니다.
const GRID_SIZE = 12;
const LEVELS = [
  { name: '초록 정원', seed: 2471 },
  { name: '뒤틀린 숲', seed: 2026 },
  { name: '별빛 미로', seed: 9017 },
  { name: '돌아가는 탑', seed: 6139 },
  { name: '마지막 도전', seed: 42173 }
];
const COPY = {
  ko: {
    documentTitle: '기울여라! — 센서 미로', languageName: 'English', languageAria: 'Switch to English',
    eyebrow: '기울여서 탈출하기', title: '공을 <span>목표까지</span><br>굴려보세요.',
    subtitle: '기기를 기울이거나 방향키를 눌러<br class="desktop-break"> 파란 공을 초록색 목표에 데려가세요.',
    keyboardHint: '키보드로도 조작할 수 있어요', sensorInitial: '센서 연결 전', sensorConnected: '센서 연결됨 · 기울여 보세요',
    sensorWaiting: '기울기를 기다리는 중…', sensorNoSupport: '이 브라우저는 센서를 지원하지 않아요',
    sensorNoResponse: '센서 응답 없음 · 방향키로 플레이', sensorDenied: '센서 권한을 허용할 수 없어요 · 방향키로 플레이',
    sensorButton: '기울기 센서 켜기 ↗', sensorConnecting: '센서 연결 중…', sensorUnavailable: '센서 응답 없음',
    reset: '다시 시작 ↻', moves: count => `이동 ${count}`, boardAria: '벽을 피해 공을 목표까지 움직이는 미로',
    goalAria: '목표 지점', ballAria: '플레이어 공', start: 'START', finish: 'FINISH',
    footerTagline: '작은 기울기, 큰 모험.', footerDevice: 'Surface Pro 11 · 터치와 센서로 플레이',
    levelNames: ['초록 정원', '뒤틀린 숲', '별빛 미로', '돌아가는 탑', '마지막 도전'],
    arrived: level => `${level}번째 미로 도착!`, nextCaption: '다음 코스도 도전해 볼까요?',
    allDone: '다섯 미로를 모두 통과했어요!', next: '다음 미로 →', again: '처음부터 다시 ↻'
  },
  en: {
    documentTitle: 'Tilt & Roll — Sensor Maze', languageName: '한국어', languageAria: '한국어로 전환',
    eyebrow: 'TILT YOUR WAY OUT', title: 'Roll the ball<br><span>to the goal.</span>',
    subtitle: 'Tilt your device or use the arrow keys<br class="desktop-break"> to guide the blue ball to the green goal.',
    keyboardHint: 'You can also use your keyboard', sensorInitial: 'Sensor not connected',
    sensorConnected: 'Sensor connected · Tilt to play', sensorWaiting: 'Waiting for tilt…',
    sensorNoSupport: 'This browser does not support sensors', sensorNoResponse: 'No sensor response · Use the arrow keys',
    sensorDenied: 'Sensor permission unavailable · Use the arrow keys', sensorButton: 'Enable tilt sensor ↗',
    sensorConnecting: 'Connecting sensor…', sensorUnavailable: 'Sensor unavailable', reset: 'Start over ↻',
    moves: count => `Moves ${count}`, boardAria: 'Maze. Guide the ball around the walls to the goal.',
    goalAria: 'Goal', ballAria: 'Player ball', start: 'START', finish: 'FINISH',
    footerTagline: 'A little tilt. A big adventure.', footerDevice: 'Surface Pro 11 · Play with touch and sensors',
    levelNames: ['Green Garden', 'Twisted Forest', 'Starlight Maze', 'Turning Tower', 'Final Challenge'],
    arrived: level => `Maze ${level} complete!`, nextCaption: 'Ready for the next course?',
    allDone: 'You completed all five mazes!', next: 'Next maze →', again: 'Play again ↻'
  }
};
const player = { x: 50 / GRID_SIZE, y: 50 / GRID_SIZE, radius: 3, moves: 0, won: false };
let currentLevel = 0;
let walls = [];
let tilt = { x: 0, y: 0 };
let lastFrame = 0;
let sensorOn = false;
let sensorStatusKey = 'sensorInitial';
let sensorButtonKey = 'sensorButton';
let language = 'ko';

function copy(key) {
  return COPY[language][key];
}

function setSensorStatus(key) {
  sensorStatusKey = key;
  sensorStatus.textContent = copy(key);
}

function setSensorButton(key) {
  sensorButtonKey = key;
  sensorButton.textContent = copy(key);
}

function updateFinishText() {
  if (!player.won) return;
  const isLastLevel = currentLevel === LEVELS.length - 1;
  finishTitle.textContent = COPY[language].arrived(currentLevel + 1);
  finishCaption.textContent = isLastLevel ? copy('allDone') : copy('nextCaption');
  playAgainButton.textContent = isLastLevel ? copy('again') : copy('next');
}

function applyLanguage() {
  const words = COPY[language];
  document.documentElement.lang = language;
  document.title = words.documentTitle;
  languageButton.textContent = words.languageName;
  languageButton.setAttribute('aria-label', words.languageAria);
  eyebrow.textContent = words.eyebrow;
  heroTitle.innerHTML = words.title;
  subtitle.innerHTML = words.subtitle;
  keyboardHint.textContent = words.keyboardHint;
  levelNumber.textContent = `LEVEL ${String(currentLevel + 1).padStart(2, '0')} / ${String(LEVELS.length).padStart(2, '0')}`;
  levelName.textContent = words.levelNames[currentLevel];
  board.setAttribute('aria-label', words.boardAria);
  goal.setAttribute('aria-label', words.goalAria);
  ball.setAttribute('aria-label', words.ballAria);
  startLabel.innerHTML = `${words.start} <i></i>`;
  finishLabel.innerHTML = `${words.finish} <i>★</i>`;
  footerTagline.textContent = words.footerTagline;
  footerDevice.textContent = words.footerDevice;
  sensorStatus.textContent = words[sensorStatusKey];
  sensorButton.textContent = words[sensorButtonKey];
  resetButton.textContent = words.reset;
  moveCount.textContent = words.moves(player.moves);
  updateFinishText();
}

function updateLanguage(nextLanguage) {
  language = nextLanguage;
  try { localStorage.setItem('tilt-maze-language', language); } catch { /* Browser storage may be disabled. */ }
  applyLanguage();
}

function makeRandom(seed) {
  // 같은 숫자는 매번 같은 미로를 만듭니다.
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function createMaze(seed) {
  const random = makeRandom(seed);
  const cells = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({ seen: false, top: true, right: true, bottom: true, left: true }))
  );
  const stack = [[0, 0]];
  cells[0][0].seen = true;

  // 막다른 칸에 도달하면 되돌아가며, 모든 칸이 이어지는 미로를 만듭니다.
  while (stack.length) {
    const [row, col] = stack[stack.length - 1];
    const choices = [
      [row - 1, col, 'top', 'bottom'], [row, col + 1, 'right', 'left'],
      [row + 1, col, 'bottom', 'top'], [row, col - 1, 'left', 'right']
    ].filter(([nextRow, nextCol]) =>
      nextRow >= 0 && nextRow < GRID_SIZE && nextCol >= 0 && nextCol < GRID_SIZE && !cells[nextRow][nextCol].seen
    );

    if (!choices.length) {
      stack.pop();
      continue;
    }
    const [nextRow, nextCol, wall, oppositeWall] = choices[Math.floor(random() * choices.length)];
    cells[row][col][wall] = false;
    cells[nextRow][nextCol][oppositeWall] = false;
    cells[nextRow][nextCol].seen = true;
    stack.push([nextRow, nextCol]);
  }

  const segments = [];
  cells.forEach((line, row) => line.forEach((cell, col) => {
    const size = 100 / GRID_SIZE;
    // 오른쪽과 아래쪽 벽만 그려 중복을 피합니다. 바깥 테두리는 보드가 막아줍니다.
    if (col < GRID_SIZE - 1 && cell.right) segments.push([(col + 1) * size - 1, row * size, 2, size]);
    if (row < GRID_SIZE - 1 && cell.bottom) segments.push([col * size, (row + 1) * size - 1, size, 2]);
  }));
  return segments;
}

function setLevel(index) {
  currentLevel = index;
  walls = createMaze(LEVELS[index].seed);
  board.querySelectorAll('.wall').forEach(wall => wall.remove());
  walls.forEach(([x, y, width, height]) => {
    const wall = document.createElement('div');
    wall.className = 'wall';
    wall.setAttribute('aria-hidden', 'true');
    wall.style.left = `${x}%`;
    wall.style.top = `${y}%`;
    wall.style.width = `${width}%`;
    wall.style.height = `${height}%`;
    board.append(wall);
  });

  levelNumber.textContent = `LEVEL ${String(index + 1).padStart(2, '0')} / ${String(LEVELS.length).padStart(2, '0')}`;
  levelName.textContent = COPY[language].levelNames[index];
  const goalSize = (100 / GRID_SIZE) * 0.72;
  const goalCenter = ((GRID_SIZE - 0.5) / GRID_SIZE) * 100;
  goal.style.width = `${goalSize}%`;
  goal.style.height = `${goalSize}%`;
  goal.style.left = `${goalCenter - goalSize / 2}%`;
  goal.style.top = `${goalCenter - goalSize / 2}%`;
  resetGame();
}

function updateDisplay() {
  ball.style.left = `${player.x - player.radius}%`;
  ball.style.top = `${player.y - player.radius}%`;
  moveCount.textContent = COPY[language].moves(player.moves);
}

function touchesWall(x, y) {
  return walls.some(([wx, wy, ww, wh]) =>
    x + player.radius > wx && x - player.radius < wx + ww &&
    y + player.radius > wy && y - player.radius < wy + wh
  );
}

function moveBall(dx, dy) {
  if (player.won) return;
  const nextX = Math.max(player.radius, Math.min(100 - player.radius, player.x + dx));
  const nextY = Math.max(player.radius, Math.min(100 - player.radius, player.y + dy));
  let moved = false;
  if (!touchesWall(nextX, player.y)) { moved ||= nextX !== player.x; player.x = nextX; }
  if (!touchesWall(player.x, nextY)) { moved ||= nextY !== player.y; player.y = nextY; }
  if (moved) { player.moves += 1; updateDisplay(); }
  const goalCenter = ((GRID_SIZE - 0.5) / GRID_SIZE) * 100;
  if (player.x > goalCenter - player.radius && player.y > goalCenter - player.radius) {
    player.won = true;
    updateFinishText();
    finishMessage.classList.add('show');
  }
}

function frame(time) {
  if (lastFrame) {
    const elapsed = Math.min((time - lastFrame) / 16.67, 2);
    if (Math.abs(tilt.x) + Math.abs(tilt.y) > 0.02) moveBall(tilt.x * elapsed, tilt.y * elapsed);
  }
  lastFrame = time;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function handleOrientation(event) {
  if (event.gamma === null || event.beta === null) return;
  tilt.x = Math.max(-1, Math.min(1, event.gamma / 25)) * 0.8;
  tilt.y = Math.max(-1, Math.min(1, event.beta / 25)) * 0.8;
  if (!sensorOn) {
    sensorOn = true;
    setSensorStatus('sensorConnected');
    sensorDot.classList.add('active');
  }
}

async function enableSensor() {
  if (typeof DeviceOrientationEvent === 'undefined') {
    setSensorStatus('sensorNoSupport');
    return;
  }
  try {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') throw new Error('permission denied');
    }
    window.addEventListener('deviceorientation', handleOrientation);
    setSensorStatus('sensorWaiting');
    setSensorButton('sensorConnecting');
    sensorButton.disabled = true;
    window.setTimeout(() => {
      if (!sensorOn) {
        setSensorStatus('sensorNoResponse');
        setSensorButton('sensorUnavailable');
      }
    }, 2500);
  } catch {
    setSensorStatus('sensorDenied');
  }
}

function resetGame() {
  const cellCenter = 50 / GRID_SIZE;
  player.x = cellCenter;
  player.y = cellCenter;
  player.moves = 0;
  player.won = false;
  tilt = { x: 0, y: 0 };
  finishMessage.classList.remove('show');
  updateDisplay();
}

const keyDirections = {
  ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2],
  a: [-2, 0], d: [2, 0], w: [0, -2], s: [0, 2]
};
window.addEventListener('keydown', event => {
  const direction = keyDirections[event.key];
  if (!direction) return;
  event.preventDefault();
  moveBall(...direction);
});

let dragging = false;
board.addEventListener('pointerdown', event => { dragging = true; board.setPointerCapture(event.pointerId); });
board.addEventListener('pointerup', () => { dragging = false; });
board.addEventListener('pointermove', event => {
  if (!dragging || player.won) return;
  const rect = board.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  moveBall(Math.max(-3, Math.min(3, x - player.x)), Math.max(-3, Math.min(3, y - player.y)));
});

sensorButton.addEventListener('click', enableSensor);
resetButton.addEventListener('click', resetGame);
languageButton.addEventListener('click', () => updateLanguage(language === 'ko' ? 'en' : 'ko'));
playAgainButton.addEventListener('click', () => {
  if (currentLevel < LEVELS.length - 1) setLevel(currentLevel + 1);
  else setLevel(0);
});
try {
  if (localStorage.getItem('tilt-maze-language') === 'en') language = 'en';
} catch { /* Use Korean when browser storage is unavailable. */ }
applyLanguage();
setLevel(0);

