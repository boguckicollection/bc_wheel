const wheel = document.getElementById('wheel');
const spinButton = document.getElementById('spinButton');
const editPanel = document.getElementById('editPanel');
const spinAudio = document.getElementById('spinAudio');
const boosterAudio = document.getElementById('boosterAudio');
const tshirtAudio = document.getElementById('tshirtAudio');
const pointer = document.getElementById('pointer');
const segmentsOverlay = document.getElementById('segments');
const resultsTable = document.getElementById('resultsTable');
const resultText = document.getElementById('resultText');
const channel = new BroadcastChannel('wheel-sync');

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

function drawWheel() {
    wheel.innerHTML = '';
    const segAngle = 360 / prizes.length;
    const size = wheel.clientWidth;
    const radius = size / 2;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);

    prizes.forEach((prize, i) => {
        const start = i * segAngle;
        const end = start + segAngle;
        const large = segAngle > 180 ? 1 : 0;
        const x1 = radius + radius * Math.cos(start * Math.PI / 180);
        const y1 = radius + radius * Math.sin(start * Math.PI / 180);
        const x2 = radius + radius * Math.cos(end * Math.PI / 180);
        const y2 = radius + radius * Math.sin(end * Math.PI / 180);

        const group = document.createElementNS(svgNS, 'g');
        group.classList.add('segment');

        const path = document.createElementNS(svgNS, 'path');
        const d = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
        path.setAttribute('d', d);
        path.setAttribute('fill', `hsl(${i * (360 / prizes.length)},70%,40%)`);
        group.appendChild(path);

        const mid = start + segAngle / 2;
        const tx = radius + radius * 0.65 * Math.cos(mid * Math.PI / 180);
        const ty = radius + radius * 0.65 * Math.sin(mid * Math.PI / 180);
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', tx);
        text.setAttribute('y', ty);
        text.setAttribute('transform', `rotate(${mid} ${tx} ${ty})`);
        text.textContent = prize;
        text.classList.add('label');
        group.appendChild(text);

        svg.appendChild(group);
    });

    wheel.appendChild(svg);
    updateResultsTable();
    drawSegments();
}

function drawSegments() {
    segmentsOverlay.innerHTML = '';
    const segAngle = 360 / prizes.length;
    const size = segmentsOverlay.clientWidth;
    const radius = size / 2;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);

    for (let i = 0; i < prizes.length; i++) {
        const angle = i * segAngle;
        const x = radius + radius * Math.cos(angle * Math.PI / 180);
        const y = radius + radius * Math.sin(angle * Math.PI / 180);
        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', radius);
        line.setAttribute('y1', radius);
        line.setAttribute('x2', x);
        line.setAttribute('y2', y);
        svg.appendChild(line);
    }

    segmentsOverlay.appendChild(svg);
}

function buildEditor() {
    editPanel.innerHTML = '';
    prizes.forEach((prize, i) => {
        const input = document.createElement('input');
        input.value = prize;
        input.addEventListener('change', e => {
            prizes[i] = e.target.value;
            drawWheel();
            localStorage.setItem('prizes', JSON.stringify(prizes));
        });
        editPanel.appendChild(input);
    });
}

function spinWheel(remoteData = null) {
    if (spinning) return;
    spinning = true;
    wheel.classList.add('spinning');
    const segAngle = 360 / prizes.length;
    let spinAngle;
    let index;

    if (remoteData) {
        spinAngle = remoteData.spinAngle;
        index = remoteData.index;
    } else {
        const extraSpins = 2 + Math.floor(Math.random() * 4);
        index = Math.floor(Math.random() * prizes.length);
        const randomOffset = Math.random() * segAngle;
        spinAngle = extraSpins * 360 + index * segAngle + randomOffset;
        channel.postMessage({ type: 'spin', spinAngle, index });
    }

    angle += spinAngle;
    wheel.style.transform = `rotate(${angle}deg)`;
    segmentsOverlay.style.transform = `rotate(${angle}deg)`;
    spinAudio.currentTime = 0;
    spinAudio.play();
    const result = prizes[index];

    setTimeout(() => {
        spinning = false;
        wheel.classList.remove('spinning');
        triggerPrizeEffects(result);
        highlightSegment(index);
        showResultText(result);
        history.push(result);
        localStorage.setItem('history', JSON.stringify(history));
        updateResultsTable();
        angle = angle % 360;
        segmentsOverlay.style.transform = `rotate(${angle}deg)`;
    }, 4000);
}

function highlightSegment(index) {
    const segs = wheel.querySelectorAll('.segment');
    segs.forEach(s => s.classList.remove('highlight'));
    segs[index].classList.add('highlight');
}

function playSound(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
}

function shakeWheel() {
    wheel.classList.add('shake');
    setTimeout(() => wheel.classList.remove('shake'), 500);
}

function flashBorder() {
    wheel.classList.add('flash');
    setTimeout(() => wheel.classList.remove('flash'), 1000);
}

function pulseWheel() {
    wheel.classList.add('pulse');
    setTimeout(() => wheel.classList.remove('pulse'), 1000);
}

function glowWheel() {
    wheel.classList.add('glow');
    setTimeout(() => wheel.classList.remove('glow'), 1000);
}

function showResultText(text) {
    resultText.textContent = text;
    resultText.classList.remove('show');
    void resultText.offsetWidth;
    resultText.classList.add('show');
}

function bouncePointer() {
    pointer.classList.add('bounce');
    setTimeout(() => pointer.classList.remove('bounce'), 600);
}

function confettiBurst() {
    confetti({
        particleCount: 200,
        spread: 120,
        scalar: 1.2,
        origin: { y: 0.2 }
    });
}

function triggerPrizeEffects(result) {
    const res = result.toLowerCase();
    if (res === 'booster') {
        confettiBurst();
        playSound(boosterAudio);
        shakeWheel();
    } else if (res === 'karta') {
        pulseWheel();
    } else if (res === 'koszulki') {
        flashBorder();
        playSound(tshirtAudio);
    } else if (res === 'puszka') {
        bouncePointer();
    } else if (res === 'przypinka') {
        glowWheel();
    }
}

function updateResultsTable() {
    resultsTable.innerHTML = '<tr><th>Gratis</th><th>Ilość</th></tr>';
    prizes.forEach(prize => {
        const count = history.filter(h => h === prize).length;
        const tr = document.createElement('tr');
        const nameTd = document.createElement('td');
        nameTd.textContent = prize;
        const countTd = document.createElement('td');
        countTd.textContent = count;
        tr.appendChild(nameTd);
        tr.appendChild(countTd);
        resultsTable.appendChild(tr);
    });
}

spinButton.addEventListener('click', spinWheel);

channel.onmessage = e => {
    if (e.data && e.data.type === 'spin') {
        spinWheel(e.data);
    }
};

drawWheel();
buildEditor();
updateResultsTable();

// Example chat command handler
function onChatCommand(cmd) {
    if (cmd === '!spin') {
        spinWheel();
    }
}
