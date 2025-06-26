const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spin');
const resultEl = document.getElementById('result');
const editor = document.getElementById('editor');
const historyTable = document.getElementById('history');
const spinSound = document.getElementById('spinSound');
const boosterSound = document.getElementById('boosterSound');
const tshirtSound = document.getElementById('tshirtSound');
const pointerEl = document.getElementById('pointer');

// Different fonts for each sector
const prizeFonts = [
  'Impact, Charcoal, sans-serif',
  'Trebuchet MS, sans-serif',
  'Courier New, monospace',
  'Brush Script MT, cursive',
  'Papyrus, fantasy'
];

const PEG_COUNT = 30;
const SPIN_DURATION = 4000; // spin time in milliseconds

let prizes = JSON.parse(localStorage.getItem('prizes')) || [
  'BOOSTER',
  'KARTA',
  'KOSZULKI',
  'PUSZKA',
  'PRZYPINKA'
];
let history = JSON.parse(localStorage.getItem('history')) || [];
let angle = 0;
let spinning = false;

const LABEL_PADDING = 15;

function drawTriangularText(ctx, text) {
  ctx.save();
  ctx.textAlign = 'left';
  const len = text.length;
  let width = 0;
  for (let i = 0; i < len; i++) {
    const progress = i / Math.max(len - 1, 1);
    const scale = 1 - progress * 0.6;
    width += ctx.measureText(text[i]).width * scale;
  }
  let x = -width / 2 + LABEL_PADDING;
  for (let i = 0; i < len; i++) {
    const ch = text[i];
    const progress = i / Math.max(len - 1, 1);
    const scale = 1 - progress * 0.6; // gradually narrow
    ctx.save();
    ctx.translate(x, 0);
    ctx.scale(scale, 1);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    x += ctx.measureText(ch).width * scale;
  }
  ctx.restore();
}

function drawWheel() {
  const radius = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const seg = 2 * Math.PI / prizes.length;

  for (let i = 0; i < prizes.length; i++) {
    const start = angle + i * seg;
    const end = start + seg;
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius - 4, start, end);
    ctx.closePath();
    ctx.fillStyle = `hsl(${i * 360 / prizes.length}, 60%, 80%)`;
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    const mid = start + seg / 2;
    ctx.save();
    const labelRadius = radius * 0.65;
    ctx.translate(radius + labelRadius * Math.cos(mid), radius + labelRadius * Math.sin(mid));
    ctx.rotate(mid + Math.PI);
    ctx.fillStyle = '#fff';
    let fontSize = radius / 5;
    ctx.font = `bold ${fontSize}px ${prizeFonts[i % prizeFonts.length]}`;
    const maxWidth = seg * radius * 0.65;
    while (ctx.measureText(prizes[i]).width > maxWidth && fontSize > 10) {
      fontSize -= 1;
      ctx.font = `bold ${fontSize}px ${prizeFonts[i % prizeFonts.length]}`;
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    drawTriangularText(ctx, prizes[i]);
    ctx.restore();
  }

  // pegs
  for (let i = 0; i < PEG_COUNT; i++) {
    const a = angle + i * (2 * Math.PI / PEG_COUNT);
    const x = radius + (radius - 6) * Math.cos(a);
    const y = radius + (radius - 6) * Math.sin(a);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.stroke();
  }
}

function updateHistory() {
  historyTable.innerHTML = '<tr><th>Gratis</th><th>Ilość</th></tr>';
  prizes.forEach(p => {
    const count = history.filter(h => h === p).length;
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    const td2 = document.createElement('td');
    td1.textContent = p;
    td2.textContent = count;
    tr.appendChild(td1);
    tr.appendChild(td2);
    historyTable.appendChild(tr);
  });
}

function buildEditor() {
  editor.innerHTML = '';
  prizes.forEach((p, i) => {
    const input = document.createElement('input');
    input.value = p;
    input.addEventListener('change', e => {
      prizes[i] = e.target.value;
      localStorage.setItem('prizes', JSON.stringify(prizes));
      drawWheel();
      updateHistory();
    });
    editor.appendChild(input);
  });
}

function showResult(text) {
  resultEl.textContent = text;
  resultEl.classList.remove('show');
  void resultEl.offsetWidth;
  resultEl.classList.add('show');
}

function triggerEffects(prize) {
  const p = prize.toLowerCase();
  if (p === 'booster') {
    confetti({ particleCount: 200, spread: 100, origin: { y: 0.2 } });
    boosterSound.currentTime = 0;
    boosterSound.play();
  }
  if (p === 'koszulki') {
    tshirtSound.currentTime = 0;
    tshirtSound.play();
  }
}

function spin() {
  if (spinning) return;
  spinning = true;
  const seg = 2 * Math.PI / prizes.length;
  const target = Math.floor(Math.random() * prizes.length);
  const finalAngle = angle + (5 + Math.floor(Math.random() * 4)) * 2 * Math.PI + target * seg + seg / 2;
  const start = performance.now();
  const duration = SPIN_DURATION;
  const initial = angle;
  const pegStep = 2 * Math.PI / PEG_COUNT;
  let lastPeg = Math.floor(angle / pegStep);

  spinSound.currentTime = 0;
  spinSound.play();

  requestAnimationFrame(function animate(now) {
    let t = (now - start) / duration;
    if (t > 1) t = 1;
    const eased = 1 - Math.pow(1 - t, 3);
    angle = initial + eased * (finalAngle - initial);
    const currentPeg = Math.floor(angle / pegStep);
    if (currentPeg !== lastPeg) {
      pointerEl.classList.remove('hit');
      void pointerEl.offsetWidth;
      pointerEl.classList.add('hit');
      lastPeg = currentPeg;
    }
    drawWheel();
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      angle %= 2 * Math.PI;
      const prize = prizes[target];
      history.push(prize);
      localStorage.setItem('history', JSON.stringify(history));
      updateHistory();
      showResult(prize);
      triggerEffects(prize);
    }
  });
}

spinBtn.addEventListener('click', spin);

drawWheel();
buildEditor();
updateHistory();

// example for chat command integration
function onChatCommand(cmd) {
  if (cmd === '!spin') spin();
}
