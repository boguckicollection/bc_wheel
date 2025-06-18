const wheel = document.getElementById('wheel');
const spinButton = document.getElementById('spinButton');
const editPanel = document.getElementById('editPanel');
const spinAudio = document.getElementById('spinAudio');

let prizes = JSON.parse(localStorage.getItem('prizes')) || [
    'Nagroda 1',
    'Nagroda 2',
    'Nagroda 3',
    'Nagroda 4',
    'booste'
];
let history = JSON.parse(localStorage.getItem('history')) || [];

let angle = 0;
let spinning = false;
let spinStrength = 10;

function drawWheel() {
    wheel.innerHTML = '<div class="pointer"></div>';
    const segAngle = 360 / prizes.length;
    prizes.forEach((prize, i) => {
        const seg = document.createElement('div');
        seg.className = 'segment';
        seg.style.transform = `rotate(${i * segAngle}deg) skewY(${90 - segAngle}deg)`;
        seg.style.backgroundColor = `hsl(${i * (360 / prizes.length)},70%,40%)`;

        const label = document.createElement('span');
        label.className = 'label';
        label.textContent = prize;
        label.style.transform = `skewY(${-(90 - segAngle)}deg) rotate(${segAngle / 2}deg)`;

        seg.appendChild(label);
        wheel.appendChild(seg);
    });
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
    if (spinning || spinStrength <= 0) return;
    spinning = true;
    const segAngle = 360 / prizes.length;
    const rand = Math.floor(Math.random() * prizes.length);
    const targetAngle = spinStrength * 360 + rand * segAngle + segAngle / 2;
    angle = targetAngle;
    wheel.style.transform = `rotate(-${angle}deg)`;
    spinAudio.currentTime = 0;
    spinAudio.play();
    setTimeout(() => {
        spinning = false;
        const result = prizes[rand];
        if (result.toLowerCase() === 'booste') {
            confetti();
        }
        highlightSegment(rand);
        history.push(result);
        localStorage.setItem('history', JSON.stringify(history));
    }, 4000);
    spinStrength = Math.max(0, spinStrength - 2);
}

function highlightSegment(index) {
    const segs = wheel.querySelectorAll('.segment');
    segs.forEach(s => s.classList.remove('highlight'));
    segs[index].classList.add('highlight');
}

spinButton.addEventListener('click', spinWheel);

drawWheel();
buildEditor();

// Example chat command handler
function onChatCommand(cmd) {
    if (cmd === '!spin') {
        spinWheel();
    }
}
