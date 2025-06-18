const wheel = document.getElementById('wheel');
const spinButton = document.getElementById('spinButton');
const editPanel = document.getElementById('editPanel');
const spinAudio = document.getElementById('spinAudio');
let prizes = ['Nagroda 1', 'Nagroda 2', 'Nagroda 3', 'Nagroda 4', 'booste'];
let angle = 0;
let spinning = false;

function drawWheel() {
    wheel.innerHTML = '<div class="pointer"></div>';
    const segAngle = 360 / prizes.length;
    prizes.forEach((prize, i) => {
        const seg = document.createElement('div');
        seg.className = 'segment';
        seg.textContent = prize;
        seg.style.transform = `rotate(${i * segAngle}deg) skewY(${90 - segAngle}deg)`;
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
        });
        editPanel.appendChild(input);
    });
}

function spinWheel() {
    if (spinning) return;
    spinning = true;
    const segAngle = 360 / prizes.length;
    const rand = Math.floor(Math.random() * prizes.length);
    const targetAngle = 3600 + rand * segAngle + segAngle / 2;
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
    }, 4000);
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
