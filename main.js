document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Config (로그인/히스토리용 - 필요 시 설정) ---
    const firebaseConfig = { projectId: "school-block" };
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- DOM Elements ---
    const q1 = document.getElementById('q1'), q2 = document.getElementById('q2'), q3 = document.getElementById('q3'), q4 = document.getElementById('q4');
    const assembleBtn = document.getElementById('assemble-btn'), clearBtn = document.getElementById('clear-btn'), exampleBtn = document.getElementById('example-btn');
    const resultText = document.getElementById('result-text'), addToFinalBtn = document.getElementById('add-to-final-btn');
    const finalText = document.getElementById('final-text'), copyFinalBtn = document.getElementById('copy-final-btn');
    const saveHistoryBtn = document.getElementById('save-history-btn');
    
    const charCount = document.getElementById('char-count'), byteCount = document.getElementById('byte-count');
    const remainingByte = document.getElementById('remaining-byte'), progressBar = document.getElementById('progress-bar');
    const categorySelect = document.getElementById('category');
    
    const tabBtns = document.querySelectorAll('.tab-btn'), tabPanes = document.querySelectorAll('.tab-pane');
    const articleList = document.getElementById('article-list');
    
    const authModal = document.getElementById('auth-modal'), modalCloseBtn = document.getElementById('modal-close-btn'), modalLoginBtn = document.getElementById('modal-login-btn');
    const loginNavBtn = document.getElementById('login-nav-btn');
    const userStatusMini = document.getElementById('user-status'), userPhotoMini = document.getElementById('user-photo-mini'), userNameMini = document.getElementById('user-name-mini');

    // --- Static Data (무료 모드용 탐구 샘플) ---
    const backupArticles = [
        {
            title: "양자 컴퓨터의 원리와 미래 암호 체계",
            summary: "양자 중첩과 얽힘을 이용한 계산 방식의 혁신을 다룹니다. 기존 RSA 암호 체계의 붕괴 가능성과 양자 내성 암호 연구의 중요성을 설명합니다.",
            keywords: ["양자역학", "암호학", "차세대컴퓨팅"],
            q1_hint: "디지털 보안 수업 중 현재 암호 체계가 미래에도 안전할지 의문이 생겨",
            q2_hint: "양자 컴퓨터의 비트 단위인 큐비트의 특성을 조사하고 쇼어 알고리즘을 분석함",
            q3_hint: "양자 우위 달성이 보안 생태계에 미칠 파급력을 확인하고 대응 방안을 정리함",
            q4_hint: "정보 보안 전문가로서 수학적 난제를 활용한 새로운 암호 알고리즘 설계에 관심을 가짐"
        },
        {
            title: "미세 플라스틱이 해양 생태계 및 인체에 미치는 영향",
            summary: "해양 생물 체내에 축적된 미세 플라스틱이 먹이 사슬을 통해 인간에게 도달하는 과정을 분석합니다. 미생물을 이용한 생분해 기술의 현황을 다룹니다.",
            keywords: ["환경공학", "해양생태", "생분해"],
            q1_hint: "해양 오염 뉴스에서 먹이 사슬 상층부의 축적 문제를 보고 해결책을 고민하며",
            q2_hint: "플라스틱 분해 효소를 가진 미생물 '이데오넬라 사카이엔시스'의 기작을 조사함",
            q3_hint: "친환경 소재로의 전환이 경제적 가치뿐만 아니라 생존의 필수 조건임을 깨달음",
            q4_hint: "화학 공학을 통해 플라스틱 제로 사회를 위한 원천 기술 개발에 기여하고 싶어짐"
        }
    ];

    // --- Utilities ---
    const sanitizeInput = (text) => {
        const temp = document.createElement('div');
        temp.textContent = text;
        return temp.innerHTML.replace(/<[^>]*>?/gm, '');
    };

    const getByteLength = (str) => {
        let bytes = 0;
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            bytes += (code <= 127) ? 1 : 3;
        }
        return bytes;
    };

    const checkAuthAndExecute = (action) => {
        const user = auth.currentUser;
        if (user) action(user);
        else authModal.classList.add('active');
    };

    // --- Core Logic ---
    const updateCounters = () => {
        const text = finalText.value;
        const bLen = getByteLength(text);
        const mBytes = parseInt(categorySelect.options[categorySelect.selectedIndex].getAttribute('data-bytes') || 1500);
        
        charCount.textContent = `${text.length}자`;
        byteCount.textContent = `${bLen}바이트`;
        remainingByte.textContent = Math.max(0, mBytes - bLen);
        
        const pct = Math.min((bLen / mBytes) * 100, 100);
        progressBar.style.width = `${pct}%`;
        progressBar.classList.toggle('warning', pct >= 70 && pct < 90);
        progressBar.classList.toggle('danger', pct >= 90);
        saveToLocal();
    };

    const assembleBlocks = () => {
        const v1 = sanitizeInput(q1.value.trim()), v2 = sanitizeInput(q2.value.trim()), v3 = sanitizeInput(q3.value.trim()), v4 = sanitizeInput(q4.value.trim());
        if (!v1 && !v2 && !v3 && !v4) return alert("블록을 입력해주세요.");

        let res = "";
        if (v1 && v2 && v3 && v4) res = `${v1} 호기심을 바탕으로 ${v2} 탐구를 수행함. 이를 통해 ${v3} 사실을 확인하였으며, 이후 ${v4} 계기가 됨.`;
        else if (v1 && v2) res = `${v1} 관심을 가지고 ${v2} 과정을 심도 있게 분석함.`;
        else res = [v1, v2, v3, v4].filter(x => x).join(' ');

        res = res.replace(/\s+/g, ' ').trim();
        if (res && !res.endsWith('.')) res += '.';
        resultText.value = res;
        document.querySelector('.result-section').classList.add('active');
    };

    // --- Explorer Logic (Free Mode: Static Data) ---
    const fetchArticles = () => {
        articleList.innerHTML = '';
        backupArticles.forEach(art => {
            const card = document.createElement('div');
            card.className = 'article-card';
            card.innerHTML = `
                <h4>${art.title}</h4>
                <p>${art.summary}</p>
                <div class="keywords">${art.keywords.map(k => `<span class="keyword-badge">#${k}</span>`).join('')}</div>
            `;
            card.onclick = () => {
                if (confirm("이 기사의 힌트로 블록을 채울까요?")) {
                    q1.value = art.q1_hint; q2.value = art.q2_hint; q3.value = art.q3_hint; q4.value = art.q4_hint;
                    tabBtns[0].click();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            };
            articleList.appendChild(card);
        });
    };

    // --- Event Listeners ---
    tabBtns.forEach(btn => btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
        if (btn.dataset.tab === 'explorer') fetchArticles();
    }));

    assembleBtn.addEventListener('click', assembleBlocks);
    addToFinalBtn.addEventListener('click', () => {
        if (!resultText.value.trim()) return;
        finalText.value = (finalText.value.trim() ? finalText.value + " " : "") + resultText.value.trim();
        updateCounters();
    });

    exampleBtn.addEventListener('click', () => {
        q1.value = "인공지능의 윤리적 가이드라인 제정 소식을 접하고";
        q2.value = "알고리즘 편향성이 사회적 불평등에 미치는 영향을 사례 중심으로 연구함";
        q3.value = "기술 개발 단계에서부터 윤리적 고려가 필수적임을 논리적으로 증명함";
        q4.value = "공학 기술이 인간의 존엄성을 해치지 않는 방향으로 발전해야 함을 인식함";
        updateCounters();
    });

    saveHistoryBtn.addEventListener('click', () => {
        checkAuthAndExecute(async (user) => {
            try {
                // Firebase 무료 요금제에서도 Firestore는 일정량 무료입니다.
                await db.collection('users').doc(user.uid).collection('history').add({
                    content: finalText.value,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                alert("히스토리에 저장되었습니다!");
            } catch (e) { alert("저장 실패: 데이터베이스 설정을 확인하세요."); }
        });
    });

    // Auth Logic
    auth.onAuthStateChanged(user => {
        if (user) {
            loginNavBtn.classList.add('hidden');
            userStatusMini.classList.remove('hidden');
            userPhotoMini.src = user.photoURL;
            userNameMini.textContent = user.displayName.split(' ')[0];
        } else {
            loginNavBtn.classList.remove('hidden');
            userStatusMini.classList.add('hidden');
        }
    });

    modalLoginBtn.addEventListener('click', () => {
        auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(() => authModal.classList.remove('active'));
    });
    modalCloseBtn.addEventListener('click', () => authModal.classList.remove('active'));
    loginNavBtn.addEventListener('click', () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()));

    // Storage
    const saveToLocal = () => {
        localStorage.setItem('block_v2_draft', JSON.stringify({
            q1: q1.value, q2: q2.value, q3: q3.value, q4: q4.value, final: finalText.value
        }));
    };
    const loadFromLocal = () => {
        const saved = JSON.parse(localStorage.getItem('block_v2_draft') || '{}');
        q1.value = saved.q1 || ''; q2.value = saved.q2 || ''; q3.value = saved.q3 || ''; q4.value = saved.q4 || '';
        finalText.value = saved.final || '';
        updateCounters();
    };

    [q1, q2, q3, q4, finalText].forEach(el => el.addEventListener('input', updateCounters));
    categorySelect.addEventListener('change', updateCounters);
    
    // Init
    loadFromLocal();
});
