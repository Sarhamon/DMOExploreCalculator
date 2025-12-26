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
    const pctInput = document.getElementById('currentPercent');
    
    let lv = parseInt(lvInput.value);
    let curPct = parseFloat(pctInput.value);

    let calcLv = lv;
    if (!calcLv || calcLv < 140) calcLv = 140;
    if (calcLv > 170) calcLv = 170;

    if (isNaN(curPct) || curPct < 0) curPct = 0;
    if (curPct >= 100) curPct = 99.9999;

    // --- [추가됨] 일지 경험치 배율 로직 시작 ---
    let expMultiplier = 1.0; 
    // HTML에 name="journal"인 라디오 버튼이 있다고 가정
    const selectedJournal = document.querySelector('input[name="journal"]:checked');
    if (selectedJournal) {
        if (selectedJournal.value === '1') expMultiplier = 1.05; // 5% 추가
        else if (selectedJournal.value === '2') expMultiplier = 1.10; // 10% 추가
    }
    // --- [추가됨] 일지 경험치 배율 로직 끝 ---

    const tbody = document.getElementById('resultBody');
    const expDisplay = document.getElementById('reqExpDisplay');

    const requiredExp = expTable[calcLv];
    if(calcLv === 170) expDisplay.innerHTML = "MAX LEVEL";
    else expDisplay.innerHTML = formatKoreanNumber(requiredExp);

    tbody.innerHTML = '';

    let results = places.map(p => {
        // --- [수정됨] 실제 획득 경험치 계산 (기본 경험치 * 배율) ---
        const gainedExp = p.exp * expMultiplier; 
        
        // 시간당 효율과 퍼센트 계산 시 p.exp 대신 gainedExp 사용
        const expPerHour = (gainedExp / p.time) * 60;
        const percent = (gainedExp / requiredExp) * 100;
        
        const isLocked = calcLv < p.level;
        
        // 렙업까지 필요한 횟수 계산
        let runsNeeded = 0;
        if (!isLocked && percent > 0) {
            const remaining = 100 - curPct;
            runsNeeded = Math.ceil(remaining / percent);
        }

        // 종료 후 예상 경험치
        const endPercent = curPct + percent;

        return { ...p, expPerHour, percent, isLocked, runsNeeded, endPercent };
    });

    // ... (이하 정렬 및 출력 로직은 기존과 동일) ...
    results.sort((a, b) => {
        if (a.isLocked !== b.isLocked) {
            return a.isLocked ? 1 : -1;
        }
        return b.expPerHour - a.expPerHour;
    });

    let dividerAdded = false;

    results.forEach((item, index) => {
        if (item.isLocked && !dividerAdded) {
            tbody.innerHTML += `<tr class="divider-row"><td colspan="8">▼ 입장 불가 (레벨 부족) ▼</td></tr>`;
            dividerAdded = true;
        }

        const hour = Math.floor(item.time / 60);
        
        let percentStr = "";
        let endPercentStr = "";
        let runsStr = "";

        if (item.isLocked) {
            percentStr = "탐험불가"; 
            endPercentStr = "-";
            runsStr = "-";
        } else {
            // 판당 획득 %
            percentStr = item.percent.toFixed(4) + "%";
            if (item.percent < 0.0001) percentStr = "0.0001%↓";

            // 종료 후 %
            endPercentStr = item.endPercent.toFixed(4) + "%";
            if (item.endPercent >= 100) endPercentStr = "<b>LEVEL UP</b>";

            // 남은 횟수
            runsStr = `<span class="runs-badge">${item.runsNeeded}회</span>`;
            if (item.percent >= 100) runsStr = `<span class="runs-badge">1회</span>`;
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
            <td style="color:${perColor}; font-weight:bold;">${percentStr}</td>
            <td>${endPercentStr}</td>
            <td>${runsStr}</td>
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

document.getElementById('userLevel').addEventListener('input', calculate);
document.getElementById('currentPercent').addEventListener('input', calculate);

loadTheme();
calculate();