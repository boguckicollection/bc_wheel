const wheel = document.getElementById('wheel');
const spinButton = document.getElementById('spinButton');
const editPanel = document.getElementById('editPanel');
const spinAudio = document.getElementById('spinAudio');
const resultsTable = document.getElementById('resultsTable');

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
    prizes.forEach((prize, i) => {
        const seg = document.createElement('div');
        seg.className = 'segment';
        seg.style.transform = `rotate(${i * segAngle}deg) skewY(${90 - segAngle}deg)`;
        seg.style.backgroundColor = `hsl(${i * (360 / prizes.length)},70%,40%)`;

        const label = document.createElement('span');
        label.className = 'label';
        label.textContent = prize;
        label.style.transform = `skewY(${-(90 - segAngle)}deg) rotate(${segAngle / 2}deg) translateY(-80%)`;

        seg.appendChild(label);
        wheel.appendChild(seg);
    });
    updateResultsTable();
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

function spinWheel() {
    if (spinning) return;
    spinning = true;
    wheel.classList.add('spinning');
    const segAngle = 360 / prizes.length;
    const extraSpins = 2 + Math.floor(Math.random() * 4); // at least two full spins
    const rand = Math.floor(Math.random() * prizes.length);
    const randomOffset = Math.random() * segAngle;
    const spinAngle = extraSpins * 360 + rand * segAngle + randomOffset;
    angle += spinAngle;
    wheel.style.transform = `rotate(${angle}deg)`;
    spinAudio.currentTime = 0;
    spinAudio.play();
    setTimeout(() => {
        spinning = false;
        wheel.classList.remove('spinning');
        const index = (prizes.length - Math.floor((angle % 360) / segAngle)) % prizes.length;
        const result = prizes[index];
        if (result.toLowerCase() === 'booster') {
            confetti();
        }
        highlightSegment(index);
        history.push(result);
        localStorage.setItem('history', JSON.stringify(history));
        updateResultsTable();
    }, 4000);
}

function highlightSegment(index) {
    const segs = wheel.querySelectorAll('.segment');
    segs.forEach(s => s.classList.remove('highlight'));
    segs[index].classList.add('highlight');
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

drawWheel();
buildEditor();
updateResultsTable();

// Example chat command handler
function onChatCommand(cmd) {
    if (cmd === '!spin') {
        spinWheel();
    }
}
