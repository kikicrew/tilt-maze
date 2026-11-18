const board = document.querySelector('#board');
const ball = document.querySelector('#ball');
const sensorButton = document.querySelector('#sensor-button');
const resetButton = document.querySelector('#reset-button');
const playAgainButton = document.querySelector('#play-again');
const sensorStatus = document.querySelector('#sensor-status');
const sensorDot = document.querySelector('#sensor-dot');
const moveCount = document.querySelector('#move-count');
const finishMessage = document.querySelector('#finish-message');

// 좌표는 보드 왼쪽 위가 (0, 0), 오른쪽 아래가 (100, 100)인 퍼센트입니다.
const player = { x: 9, y: 9, radius: 4, moves: 0, won: false };
const walls = [
  [20, 0, 7, 30], [20, 30, 39, 7], [52, 37, 7, 26], [30, 63, 29, 7],
  [30, 70, 7, 21], [68, 16, 7, 28], [68, 44, 23, 7], [84, 51, 7, 27],
  [57, 78, 34, 7], [0, 46, 12, 7]
];
let tilt = { x: 0, y: 0 };
let lastFrame = 0;
let sensorOn = false;

// HTML에서 미로 벽을 읽어와 화면과 충돌 판정을 같은 정보로 관리합니다.
walls.forEach(([x, y, width, height], index) => {
  const wall = document.createElement('div');
  wall.className = `wall w${index + 1}`;
  wall.setAttribute('aria-hidden', 'true');
  board.append(wall);
});

function updateDisplay() {
  ball.style.left = `${player.x - player.radius}%`;
  ball.style.top = `${player.y - player.radius}%`;
  moveCount.textContent = `이동 ${player.moves}`;
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
  // 가로와 세로를 따로 검사해 벽을 따라 부드럽게 미끄러집니다.
  if (!touchesWall(nextX, player.y)) { moved ||= nextX !== player.x; player.x = nextX; }
  if (!touchesWall(player.x, nextY)) { moved ||= nextY !== player.y; player.y = nextY; }
  if (moved) { player.moves += 1; updateDisplay(); }
  if (player.x > 76 && player.y > 77) {
    player.won = true;
    finishMessage.classList.add('show');
  }
}

function frame(time) {
  if (lastFrame) {
    const elapsed = Math.min((time - lastFrame) / 16.67, 2);
    if (Math.abs(tilt.x) + Math.abs(tilt.y) > 0.02) {
      moveBall(tilt.x * elapsed, tilt.y * elapsed);
    }
  }
  lastFrame = time;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function handleOrientation(event) {
  if (event.gamma === null || event.beta === null) return;
  // 센서값을 -1~1 범위로 줄여 기기를 조금만 기울여도 조작되게 합니다.
  tilt.x = Math.max(-1, Math.min(1, event.gamma / 25)) * 0.8;
  tilt.y = Math.max(-1, Math.min(1, event.beta / 25)) * 0.8;
  if (!sensorOn) {
    sensorOn = true;
    sensorStatus.textContent = '센서 연결됨 · 기울여 보세요';
    sensorDot.classList.add('active');
  }
}

async function enableSensor() {
  // 일부 브라우저(주로 iPhone)는 버튼을 누른 뒤 센서 권한을 요청해야 합니다.
  if (typeof DeviceOrientationEvent === 'undefined') {
    sensorStatus.textContent = '이 브라우저는 센서를 지원하지 않아요';
    return;
  }
  try {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') throw new Error('permission denied');
    }
    window.addEventListener('deviceorientation', handleOrientation);
    sensorStatus.textContent = '기울기를 기다리는 중…';
    sensorButton.textContent = '센서 연결 중…';
    sensorButton.disabled = true;
    // 센서 이벤트가 오지 않는 환경에서 키보드 조작을 계속 안내합니다.
    window.setTimeout(() => {
      if (!sensorOn) {
        sensorStatus.textContent = '센서 응답 없음 · 방향키로 플레이';
        sensorButton.textContent = '센서 응답 없음';
      }
    }, 2500);
  } catch {
    sensorStatus.textContent = '센서 권한을 허용할 수 없어요 · 방향키로 플레이';
  }
}

function resetGame() {
  player.x = 9; player.y = 9; player.moves = 0; player.won = false;
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

// 마우스나 터치 드래그를 지원해 센서 없는 PC에서도 바로 체험할 수 있습니다.
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
playAgainButton.addEventListener('click', resetGame);
updateDisplay();
