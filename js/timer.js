//=====数据=====
let sessions = JSON.parse(localStorage.getItem('focusSessions')) || [];


let focusData = JSON.parse(localStorage.getItem('focusData')) || {
    endAt: null,        // 正在跑时是结束毫秒数；暂停/空闲是 null
    remaining: 25 * 60, // 剩余秒数
    total: 25 * 60      // 这一轮总秒数
};

let timerId = null;
let isRunning = false;

//=====保存=====
function saveSessions() {
    localStorage.setItem('focusSessions', JSON.stringify(sessions));
}

function saveFocusData() {
    localStorage.setItem('focusData', JSON.stringify(focusData));
}

function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
}

//=====当前还剩几秒=====
function currentRemain() {
    if (focusData.endAt) {
        return Math.ceil((focusData.endAt - Date.now()) / 1000);
    }
    return focusData.remaining;
}

//=====刷新显示=====
function renderTime() {
    const el = document.getElementById('timerDisplay');
    if (!el) return;
    const r = Math.max(0, currentRemain());
    const h = String(Math.floor(r / 3600)).padStart(2, '0');
    const m = String(Math.floor((r % 3600) / 60)).padStart(2, '0');
    const s = String(r % 60).padStart(2, '0');
    el.textContent = h + ':' + m + ':' + s;
}

function renderToday() {
    const el1 = document.getElementById('focusCount');
    if (!el1) return; // 不在专注页就直接跳过
    const today = todayStr();
    const todaySessions = sessions.filter(s => s.date === today);
    el1.textContent = todaySessions.length;
    document.getElementById('focusMinutes').textContent =
        todaySessions.reduce((sum, s) => sum + s.minutes, 0);
}

//=====提示音=====
function playSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.value = 0.25;
        for (let i = 0; i < 12; i++) {
            const osc = ctx.createOscillator();
            osc.connect(gain);
            osc.frequency.value = 1000;
            const t = ctx.currentTime + i * 0.25;
            osc.start(t);
            osc.stop(t + 0.15);
        }
        setTimeout(() => { ctx.close(); }, 1400);
    } catch (e) { }
}

//=====计时心跳=====
function tick() {
    const remain = currentRemain();
    if (remain <= 0) {
        finishFocus();
        return;
    }
    renderTime();
}

//=====开始或继续=====
function startTimer() {
    if (isRunning) return;
    focusData.endAt = Date.now() + currentRemain() * 1000;
    saveFocusData();
    isRunning = true;
    setPauseText('暂停');
    timerId = setInterval(tick, 250);
}

//=====暂停=====
function pauseTimer() {
    if (!isRunning) return;
    clearInterval(timerId);
    timerId = null;
    isRunning = false;
    focusData.remaining = Math.max(0, currentRemain());
    focusData.endAt = null;
    saveFocusData();
    setPauseText('继续');
    renderTime();
}

function setPauseText(t) {
    const btn = document.getElementById('pauseBtn');
    if (btn) btn.textContent = t;
}

//=====重置=====
function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    isRunning = false;
    focusData.remaining = focusData.total;
    focusData.endAt = null;
    saveFocusData();
    setPauseText('暂停');
    renderTime();
}

//=====结束=====
function finishFocus() {
    clearInterval(timerId);
    timerId = null;
    isRunning = false;

    sessions.push({ date: todayStr(), minutes: Math.round(focusData.total / 60) });
    saveSessions();
    renderToday();

    focusData.remaining = focusData.total;
    focusData.endAt = null;
    saveFocusData();

    playSound();
    alert('时间到!');
    setPauseText('暂停');
    renderTime();
}

//=====按钮绑定=====
const startBtn = document.getElementById('startBtn');
if (startBtn) startBtn.addEventListener('click', startTimer);

const pauseBtn = document.getElementById('pauseBtn');
if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
        if (isRunning) pauseTimer();
        else if (focusData.remaining < focusData.total) startTimer();
    });
}

const resetBtn = document.getElementById('resetBtn');
if (resetBtn) resetBtn.addEventListener('click', resetTimer);

//=====25/45/60预设=====
document.querySelectorAll('.time-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        focusData.total = Number(btn.dataset.min) * 60;
        resetTimer();
    });
});

//=====自定义时长=====
const customBtn = document.getElementById('customBtn');
if (customBtn) {
    customBtn.addEventListener('click', () => {
        const h = Number(document.getElementById('customHour').value) || 0;
        const m = Number(document.getElementById('customMin').value) || 0;
        const s = Number(document.getElementById('customSec').value) || 0;
        const total = h * 3600 + m * 60 + s;

        if (h > 99 || m > 59 || s > 59) {
            alert('小时不能超过99，分钟和秒不能超过59！');
            return;
        }
        if (total <= 0) {
            alert('请输入大于 0 的时长！');
            return;
        }

        focusData.total = total;
        resetTimer();
    });
}

//=====页面打开时：恢复状态=====
(function init() {
    // 如果之前正在跑，接着跑
    if (focusData.endAt) {
        if (currentRemain() <= 0) {
            finishFocus(); // 在别的页面期间刚好跑完了，补记一次
        } else {
            startTimer();  // 重新挂上心跳，界面继续走
        }
    } else if (focusData.remaining < focusData.total) {
        setPauseText('继续'); // 暂停中，提醒可以点"继续"
    }
    renderTime();
    renderToday();
})();