const expTable = {
    140: 1048823330, 141: 1080288029, 142: 1112696670, 143: 1146077570, 144: 1180459898,
    145: 1215873694, 146: 1271135154, 147: 1328908247, 148: 1389307127, 149: 1452451135,
    150: 151846504008, 151: 161922886168, 152: 172667926971, 153: 184125997937, 154: 196344415034,
    155: 209373634071, 156: 229965482826, 157: 252582535170, 158: 277423969410, 159: 304708552994,
    160: 334676569098, 161: 385971529328, 162: 445128327487, 163: 513351925922, 164: 592031968254,
    165: 682771084972, 166: 787417537349, 167: 908102864593, 168: 1047285301085, 169: 1207799848050,
    170: 0
};

const places = [
    { id: 'p1', name: "바람계곡", level: 1, time: 360, exp: 24236714 },
    { id: 'p2', name: "은빛호수", level: 1, time: 360, exp: 12118357 },
    { id: 'p3', name: "서부마을", level: 1, time: 360, exp: 12118357 },
    { id: 'p4', name: "무한빙벽", level: 71, time: 540, exp: 1162296236 },
    { id: 'p5', name: "미소마을", level: 71, time: 540, exp: 581148118 },
    { id: 'p6', name: "무한산", level: 71, time: 540, exp: 581148118 },
    { id: 'p7', name: "디지몬 미궁", level: 141, time: 720, exp: 6792654230 },
    { id: 'p8', name: "서버 대륙 협곡", level: 141, time: 720, exp: 3396327115 },
    { id: 'p9', name: "빛의 언덕", level: 141, time: 720, exp: 3396327115 },
    { id: 'p10', name: "도쿄타워", level: 152, time: 900, exp: 22839906430 },
    { id: 'p11', name: "시부야", level: 152, time: 900, exp: 11419953215 },
    { id: 'p12', name: "미나토 구", level: 152, time: 900, exp: 11419953215 },
    { id: 'p13', name: "후지 TV 옥상", level: 161, time: 1080, exp: 41061627419 },
    { id: 'p14', name: "신주쿠 역", level: 161, time: 1080, exp: 27374418279 },
    { id: 'p15', name: "빅사이트", level: 161, time: 1080, exp: 27374418279 }
];

function toggleTheme() {
    const body = document.body;
    const btn = document.querySelector('.theme-toggle');
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        btn.innerHTML = '☀️';
        localStorage.setItem('dmo_theme', 'dark');
    } else {
        btn.innerHTML = '🌙';
        localStorage.setItem('dmo_theme', 'light');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('dmo_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.querySelector('.theme-toggle').innerHTML = '☀️';
    }
}

function calculate() {
    const lvInput = document.getElementById('userLevel');
    let lv = parseInt(lvInput.value);
    const tbody = document.getElementById('resultBody');
    const expDisplay = document.getElementById('reqExpDisplay');

    // [수정됨] 타이핑 방해 방지: 입력값(lvInput.value)을 강제로 바꾸지 않고 내부 변수(calcLv)만 보정
    let calcLv = lv;
    if (!calcLv || calcLv < 140) calcLv = 140; // 140 미만 입력 중일 때는 140 기준으로 미리 보여줌
    if (calcLv > 170) calcLv = 170;

    const requiredExp = expTable[calcLv];
    if(calcLv === 170) expDisplay.innerHTML = "MAX LEVEL";
    else expDisplay.innerHTML = formatKoreanNumber(requiredExp);

    tbody.innerHTML = '';

    let results = places.map(p => {
        const expPerHour = (p.exp / p.time) * 60;
        const percent = (p.exp / requiredExp) * 100;
        const isLocked = calcLv < p.level; // calcLv 사용
        return { ...p, expPerHour, percent, isLocked };
    });

    results.sort((a, b) => {
        if (a.isLocked !== b.isLocked) {
            return a.isLocked ? 1 : -1;
        }
        return b.expPerHour - a.expPerHour;
    });

    let dividerAdded = false;

    results.forEach((item, index) => {
        if (item.isLocked && !dividerAdded) {
            tbody.innerHTML += `<tr class="divider-row"><td colspan="7">▼ 탐험 불가 (레벨 부족) ▼</td></tr>`;
            dividerAdded = true;
        }

        const hour = Math.floor(item.time / 60);
        
        let percentStr = "";
        if (item.isLocked) {
            percentStr = "탐험불가"; 
        } else {
            percentStr = item.percent.toFixed(4) + "%";
            if (item.percent < 0.0001) percentStr = "0.0001%↓";
            if (item.percent >= 100) percentStr = "<b>LEVEL UP</b>";
        }

        const rowClass = (index === 0 && !item.isLocked) ? 'rank-1' : (item.isLocked ? 'locked' : '');
        const rankDisplay = item.isLocked ? "-" : index + 1;

        let perColor = '';
        if (item.isLocked) perColor = 'inherit';
        else if (index === 0) perColor = 'var(--rank1-text)';
        else perColor = 'var(--rank1-text)';

        const row = `<tr class="${rowClass}">
            <td>${rankDisplay}</td>
            <td style="text-align:left; font-weight:600;">${item.name}</td>
            <td><span class="req-badge">Lv.${item.level}↑</span></td>
            <td>${hour}시간</td>
            <td>${formatSimple(item.exp)}</td>
            <td style="color:${perColor}; font-weight:bold;">${percentStr}</td>
            <td>${formatSimple(Math.floor(item.expPerHour))}/h</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

function formatKoreanNumber(num) {
    if (num === 0) return "0";
    const units = ["", "만", "억", "조", "경"];
    let result = ""; let temp = num; let idx = 0;
    while (temp > 0) {
        const part = temp % 10000;
        if (part > 0) result = `${part.toLocaleString()}${units[idx]} ` + result;
        temp = Math.floor(temp / 10000); idx++;
    }
    return result.trim();
}

function formatSimple(num) {
    if (num >= 1000000000000) return (num/1000000000000).toFixed(2) + "조";
    if (num >= 100000000) return (num/100000000).toFixed(1) + "억";
    if (num >= 10000) return (num/10000).toFixed(0) + "만";
    return num.toLocaleString();
}

// [추가된 부분] 입력창 값 변경 시 실시간 자동 계산
document.getElementById('userLevel').addEventListener('input', calculate);

// 초기 실행
loadTheme();
calculate();