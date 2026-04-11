let researchArticles = [];

async function loadArticles() {
    try {
        const response = await fetch('./articles.json');
        researchArticles = await response.json();
    } catch (error) {
        console.error('Failed to load articles:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadArticles();
    
    const firebaseConfig = {
        apiKey: "AIzaSyBDp-6qkS3IFmDUF_qeGWerFFmRIb2m6Bk",
        authDomain: "school-block-ab36d.firebaseapp.com",
        projectId: "school-block-ab36d",
        storageBucket: "school-block-ab36d.firebasestorage.app",
        messagingSenderId: "450302633606",
        appId: "1:450302633606:web:0013eaea91fd46f8a51307",
        measurementId: "G-62BVCT0MM8"
    };
    
    let auth = null;
    let db = null;

    try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
    } catch (e) {
        console.warn("Firebase initialization failed.", e);
    }

    const q1 = document.getElementById('q1'), q2 = document.getElementById('q2'), q3 = document.getElementById('q3'), q4 = document.getElementById('q4');
    const assembleBtn = document.getElementById('assemble-btn'), clearBtn = document.getElementById('clear-btn');
    const reassembleBtn = document.getElementById('reassemble-btn');
    const resultText = document.getElementById('result-text'), addToFinalBtn = document.getElementById('add-to-final-btn');
    const finalText = document.getElementById('final-text'), copyFinalBtn = document.getElementById('copy-final-btn');
    const saveHistoryBtn = document.getElementById('save-history-btn');
    
    const charCount = document.getElementById('char-count'), byteCount = document.getElementById('byte-count');
    const remainingByte = document.getElementById('remaining-byte'), progressBar = document.getElementById('progress-bar');
    const categorySelect = document.getElementById('category');
    
    const tabBtns = document.querySelectorAll('.tab-btn'), tabPanes = document.querySelectorAll('.tab-pane');
    const articleList = document.getElementById('article-list');
    const articleListView = document.getElementById('article-list-view');
    const articleDetailView = document.getElementById('article-detail-view');
    const backBtn = document.getElementById('back-btn');
    const detailFillBtn = document.getElementById('detail-fill-btn');
    
    const detailTitle = document.getElementById('detail-title');
    const detailKeywords = document.getElementById('detail-keywords');
    const detailArticleBody = document.getElementById('detail-article-body');
    const detailSources = document.getElementById('detail-sources');

    let currentArticle = null;
    let lastInputs = { v1: '', v2: '', v3: '', v4: '' };
    
    const wordRecommendBtn = document.getElementById('word-recommend-btn');
    const wordPopup = document.getElementById('word-popup'), closePopup = document.getElementById('close-popup'), wordListContainer = document.getElementById('word-list');

    const authModal = document.getElementById('auth-modal'), modalCloseBtn = document.getElementById('modal-close-btn'), modalLoginBtn = document.getElementById('modal-login-btn');
    const loginNavBtn = document.getElementById('login-nav-btn');
    const userStatusMini = document.getElementById('user-status'), userPhotoMini = document.getElementById('user-photo-mini'), userNameMini = document.getElementById('user-name-mini');

    const autoResize = (textarea) => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(68, textarea.scrollHeight) + 'px';
    };

    resultText.addEventListener('input', () => autoResize(resultText));
    finalText.addEventListener('input', () => autoResize(finalText));

    const vocabularyData = [
        { orig: "알아봤다", recommends: ["탐구함", "분석함", "고찰함", "조사함", "규명함"] },
        { orig: "도와줬다", recommends: ["조력함", "기여함", "협력함", "지원함", "봉사함"] },
        { orig: "좋았다", recommends: ["유익하였음", "도움이 되었음", "가치 있다고 판단함"] },
        { orig: "많았다", recommends: ["풍부하였음", "다양하게 축적됨", "풍성하게 확인됨"] },
        { orig: "발견했다", recommends: ["인식함", "발견함", "확인함", "관찰함"] },
        { orig: "생겼다", recommends: ["나타남", "도출됨", "얻어짐"] },
        { orig: "관찰했다", recommends: ["관찰함", "조사함", "분석함", "연구함"] },
        { orig: "연구했다", recommends: ["연구함", "분석함", "탐구함", "고찰함"] },
        { orig: "시작했다", recommends: ["착수함", "시작함", "실시함"] },
        { orig: "정리했다", recommends: ["정리함", "체계화함", "분석함", "종합함"] }
    ];

    const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const extractCoreKeyword = (text) => {
        text = text.trim();
        text = text.replace(/\.$/, '');
        
        const endings = [
            '에 의문을 품고', '에 호기심을 가지고', '의 원리가 궁금하여', '이 중요함을 인식하고', '을 접한 후 관심이 생겨',
            '에 대해 궁금해하며', '을 탐구하고자', '를 탐구하고자', '에 대해 알아보고자',
            '때문이다', '때문에', '으로 인해', '이로 인해', '때문이라고 생각한다', '때문이라고 생각하여',
            '产生了疑问', '에 대해 고민하며', '에 대해 생각하며', '에 대해 궁금증을 느꼈다',
            '하여', '해서', '했다', '하니', '하므로', '하니까', '하므로서',
            '되어', '됐어', '되었어', '되는데', '되어서', '되었는데',
            '에게서', '에게로', '에서', '으로', '에게', '를', '을', '이', '가', '은', '는', '와', '과', '고',
            '아生了', '나', '다', '라', '자', '거야', '야', '이야', '야',
            '어요', '아요', '해요', '해', '있어요', '있어', '없어요', '없어',
            '습니다', '었습니다', '합니다', '했습니다', '니다', '입니다', '다',
            '생겨', '느껴', '생기고', '느껴서', '느꼈다',
            '하고', '하여', '해서', '했던', '했고', '하려고', '하려고 해',
            '싶어', '싶다', '싶은', '가고', '오고', '이고', '이며',
            '인지', '인지라', '런지', '는지', '니까', '니깐', '니까요',
            '거든', '잖아', '잖고', '지', '고', '는', '은',
            '라고', '이라고', '다고', '다고요', '라고요',
            '라는', '이라는', '다는', '이란', '런'
        ];
        
        for (const ending of endings) {
            if (text.endsWith(ending)) {
                text = text.slice(0, -ending.length);
                break;
            }
        }
        
        text = text.replace(/^我当时/, '');
        text = text.replace(/^저는/, '');
        text = text.replace(/^나는/, '');
        text = text.replace(/^화제는/, '');
        text = text.replace(/^주제는/, '');
        
        text = text.trim();
        
        if (text.endsWith('의')) {
            text = text.slice(0, -1);
        }
        if (text.endsWith('을') || text.endsWith('를') || text.endsWith('이') || text.endsWith('가') || text.endsWith('은') || text.endsWith('는')) {
            text = text.slice(0, -1);
        }
        
        return text.trim() || text;
    };

    const addParticle = (text, particle) => {
        if (!text) return text;
        
        const lastChar = text.charAt(text.length - 1);
        const hasFinalConsonant = (lastChar.charCodeAt(0) - 0xAC00) % 28 > 0;
        
        if (particle === '을' || particle === '를') {
            return text + (hasFinalConsonant ? '을' : '를');
        }
        if (particle === '이' || particle === '가') {
            return text + (hasFinalConsonant ? '이' : '가');
        }
        if (particle === '은' || particle === '는') {
            return text + (hasFinalConsonant ? '은' : '는');
        }
        if (particle === '와' || particle === '과') {
            return text + (hasFinalConsonant ? '과' : '와');
        }
        return text + particle;
    };

    const fixKoreanGrammar = (text) => {
        const fixes = [
            [/확인함이며/gi, '확인하였으며'],
            [/이해함이며/gi, '이해하였으며'],
            [/파악함이며/gi, '파악하였으며'],
            [/검증함이며/gi, '검증하였으며'],
            [/학습함이며/gi, '학습하였으며'],
            [/탐구함이며/gi, '탐구하였으며'],
            [/수행함이며/gi, '수행하였으며'],
            [/진행함이며/gi, '진행하였으며'],
            [/발견함이며/gi, '발견하였으며'],
            [/분석함이며/gi, '분석하였으며'],
            [/확인함과/gi, '확인함과'],
            [/이해함과/gi, '이해함과'],
            [/수행함과/gi, '수행함과'],
            [/확인함으로/gi, '확인함으로써'],
            [/이해함으로/gi, '이해함으로써'],
            [/발견함으로/gi, '발견함으로써'],
            [/파악함으로/gi, '파악함으로써'],
            [/알게됨에/gi, '알게 됨에'],
            [/있게됨에/gi, '있게 됨에'],
            [/넓힘으며/gi, '넓히며'],
            [/강해짐으며/gi, '강해지며'],
            [/계기가됨/gi, '계기가 됨'],
            [/구체화하게됨/gi, '구체화하게 됨'],
            [/이해하게됨/gi, '이해하게 됨'],
        ];
        
        for (const [pattern, replacement] of fixes) {
            text = text.replace(pattern, replacement);
        }
        
        return text;
    };

    const applyPattern = (text, pattern) => {
        const keyword = extractCoreKeyword(text);
        
        let result = pattern.replace('{input}', keyword);
        
        if (pattern.includes('{input}을') || pattern.includes('{input}을(를)')) {
            result = result.replace('{input}', addParticle(keyword, '을'));
        } else if (pattern.includes('{input}를')) {
            result = result.replace('{input}', addParticle(keyword, '를'));
        } else if (pattern.includes('{input}이') || pattern.includes('{input}이(가)')) {
            result = result.replace('{input}', addParticle(keyword, '이'));
        } else if (pattern.includes('{input}가')) {
            result = result.replace('{input}', addParticle(keyword, '가'));
        } else if (pattern.includes('{input}의')) {
            result = result.replace('{input}', keyword + '의');
        }
        
        return result;
    };

    const motivationPatterns = [
        "{input}에 의문을 품고",
        "{input}에 호기심을 가지고",
        "{input}의 원리가 궁금하여",
        "{input}이 중요함을 인식하고",
        "{input}을 접한 후 관심이 생겨"
    ];

    const processPatterns = [
        "관련 논문과 문헌을 탐독하며 {input}을 분석함",
        "{input}을 직접 실험·관찰하며 탐구함",
        "{input}의 원리를 자료 조사를 통해 체계적으로 학습함",
        "{input}을 다각도로 비교·분석하는 탐구를 수행함",
        "{input}에 대한 심층 조사를 진행함"
    ];

    const resultPatterns = [
        "이를 통해 {input}임을 확인함",
        "{input}라는 사실을 이해하게 됨",
        "{input}의 핵심 원리를 파악함",
        "{input}임을 실증적으로 검증함",
        "{input}에 대한 이해의 폭을 넓힘"
    ];

    const changePatterns = [
        "나아가 {input}에 관심을 갖게 됨",
        "{input}을 목표로 삼는 계기가 됨",
        "{input} 분야로 진로를 구체화하게 됨",
        "{input}에 대한 탐구 의지가 더욱 강해짐",
        "{input}의 중요성을 깨닫고 관련 역량을 키우고자 함"
    ];

    const assembleBlocks = () => {
        const v1 = q1.value.trim();
        const v2 = q2.value.trim();
        const v3 = q3.value.trim();
        const v4 = q4.value.trim();
        
        lastInputs = { v1, v2, v3, v4 };
        
        if (!v1 && !v2 && !v3 && !v4) {
            return alert("블록을 입력해주세요.");
        }

        let result = '';

        if (v1 && v2 && v3 && v4) {
            const m = applyPattern(randomPick(motivationPatterns), v1);
            const p = applyPattern(randomPick(processPatterns), v2);
            const r = applyPattern(randomPick(resultPatterns), v3);
            const c = applyPattern(randomPick(changePatterns), v4);
            result = `${m} ${p}. ${r}으며, ${c}.`;
        } else if (v1 && v2 && v3) {
            const m = applyPattern(randomPick(motivationPatterns), v1);
            const p = applyPattern(randomPick(processPatterns), v2);
            const r = applyPattern(randomPick(resultPatterns), v3);
            result = `${m} ${p}. ${r}.`;
        } else if (v1 && v2) {
            const m = applyPattern(randomPick(motivationPatterns), v1);
            const p = applyPattern(randomPick(processPatterns), v2);
            result = `${m} ${p}.`;
        } else if (v1 && v3) {
            const m = applyPattern(randomPick(motivationPatterns), v1);
            const r = applyPattern(randomPick(resultPatterns), v3);
            result = `${m} ${r}.`;
        } else if (v2 && v3) {
            const p = applyPattern(randomPick(processPatterns), v2);
            const r = applyPattern(randomPick(resultPatterns), v3);
            result = `${p}. 이를 통해 ${extractCoreKeyword(v3)}을(를) 이해함.`;
        } else if (v1 && v4) {
            const m = applyPattern(randomPick(motivationPatterns), v1);
            const c = applyPattern(randomPick(changePatterns), v4);
            result = `${m}, ${c}.`;
        } else if (v3 && v4) {
            const r = applyPattern(randomPick(resultPatterns), v3);
            const c = applyPattern(randomPick(changePatterns), v4);
            result = `${r}으며, ${c}.`;
        } else if (v1) {
            const m = applyPattern(randomPick(motivationPatterns), v1);
            result = `${m} 탐구를 시작함.`;
        } else if (v2) {
            const p = applyPattern(randomPick(processPatterns), v2);
            result = `${p}.`;
        } else if (v3) {
            const r = applyPattern(randomPick(resultPatterns), v3);
            result = `${r}.`;
        } else if (v4) {
            const c = applyPattern(randomPick(changePatterns), v4);
            result = `${c}.`;
        }

        result = result.replace(/\s+/g, ' ').replace(/\.\./g, '.').trim();
        result = fixKoreanGrammar(result);
        resultText.value = result;
        autoResize(resultText);
        saveToLocal();
    };

    const reassembleBlocks = () => {
        if (!lastInputs.v1 && !lastInputs.v2 && !lastInputs.v3 && !lastInputs.v4) {
            return alert("먼저 조립 버튼을 눌러주세요.");
        }
        assembleBlocks();
    };

    // ==========================================
    // 기사 목록 렌더링
    // ==========================================
    const renderArticleList = () => {
        articleList.innerHTML = '';
        
        researchArticles.forEach(art => {
            const card = document.createElement('div');
            card.className = 'article-card';
            card.innerHTML = `
                <h4 class="article-card-title">${art.title}</h4>
                <p class="article-card-summary">${art.summary}</p>
                <div class="article-card-keywords">
                    ${art.keywords.map(k => `<span class="keyword-badge">#${k}</span>`).join('')}
                </div>
                <button class="article-card-btn">자세히 보기</button>
            `;
            
            card.querySelector('.article-card-btn').addEventListener('click', () => {
                showArticleDetail(art);
            });
            
            articleList.appendChild(card);
        });
    };

    // ==========================================
    // 기사 상세 보기
    // ==========================================
    const showArticleDetail = (article) => {
        currentArticle = article;
        
        detailTitle.textContent = article.title;
        detailKeywords.innerHTML = article.keywords.map(k => `<span class="keyword-badge">#${k}</span>`).join('');
        
        const paragraphs = article.content.split('\n\n');
        detailArticleBody.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
        
        if (article.sources && article.sources.length > 0) {
            detailSources.innerHTML = `
                <div class="sources-title">📎 출처 및 참고자료</div>
                <div class="sources-list">
                    ${article.sources.map(s => `
                        <a href="${s.url}" target="_blank" rel="noopener" class="source-link">• ${s.label}</a>
                    `).join('')}
                </div>
            `;
        } else {
            detailSources.innerHTML = '';
        }
        
        articleListView.classList.add('hidden');
        articleDetailView.classList.remove('hidden');
    };

    // ==========================================
    // 뒤로가기 (상세 → 목록)
    // ==========================================
    const hideArticleDetail = () => {
        articleDetailView.classList.add('hidden');
        articleListView.classList.remove('hidden');
        currentArticle = null;
    };

    // ==========================================
    // 블록에 채우기
    // ==========================================
    const fillBlocksWithArticle = (art) => {
        q1.value = art.q1_hint;
        q2.value = art.q2_hint;
        q3.value = art.q3_hint || "";
        q4.value = art.q4_hint || "";
        
        [q1, q2, q3, q4].forEach(q => autoResize(q));
        
        document.querySelectorAll('.input-card').forEach(c => {
            c.style.animation = 'none';
            setTimeout(() => c.style.animation = 'highlight-pulse 1s', 10);
        });
        
        saveToLocal();
        updateCounters();
    };

    [q1, q2, q3, q4, resultText, finalText].forEach(el => el.addEventListener('input', updateCounters));
    categorySelect.addEventListener('change', updateCounters);

    // ==========================================
    // 탭 전환
    // ==========================================
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabName + '-tab').classList.add('active');
            
            if (tabName === 'explorer') {
                hideArticleDetail();
                renderArticleList();
            }
        });
    });

    backBtn.addEventListener('click', hideArticleDetail);

    detailFillBtn.addEventListener('click', () => {
        if (!currentArticle) return;
        fillBlocksWithArticle(currentArticle);
        hideArticleDetail();
        tabBtns[0].click();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    assembleBtn.addEventListener('click', assembleBlocks);
    reassembleBtn.addEventListener('click', reassembleBlocks);
    
    addToFinalBtn.addEventListener('click', () => {
        if (!resultText.value.trim()) return;
        finalText.value = (finalText.value.trim() ? finalText.value + " " : "") + resultText.value.trim();
        autoResize(finalText);
        updateCounters();
        addToFinalBtn.textContent = '✅ 추가됨';
        setTimeout(() => addToFinalBtn.textContent = '➕ 문장 쌓기', 1500);
    });

    clearBtn.addEventListener('click', () => {
        if (confirm("모든 내용을 삭제할까요?")) {
            q1.value = q2.value = q3.value = q4.value = resultText.value = finalText.value = '';
            [q1, q2, q3, q4].forEach(q => autoResize(q));
            autoResize(resultText);
            autoResize(finalText);
            lastInputs = { v1: '', v2: '', v3: '', v4: '' };
            updateCounters();
            saveToLocal();
        }
    });

    copyFinalBtn.addEventListener('click', () => {
        if (!finalText.value) return;
        navigator.clipboard.writeText(finalText.value).then(() => {
            const originalIcon = copyFinalBtn.textContent;
            copyFinalBtn.textContent = '✅';
            setTimeout(() => copyFinalBtn.textContent = originalIcon, 2000);
        });
    });

    const updateCounters = () => {
        const bytes = new TextEncoder().encode(finalText.value).length;
        const maxBytes = parseInt(categorySelect.options[categorySelect.selectedIndex].dataset.bytes) || 1500;
        const remaining = maxBytes - bytes;
        
        charCount.textContent = `${finalText.value.length}자`;
        byteCount.textContent = `${bytes}바이트`;
        remainingByte.textContent = remaining;
        
        const pct = Math.min(100, (bytes / maxBytes) * 100);
        progressBar.style.width = `${pct}%`;
        
        if (remaining < 0) {
            progressBar.style.background = 'var(--danger)';
            remainingByte.style.color = 'var(--danger)';
        } else if (remaining < 200) {
            progressBar.style.background = 'var(--warning)';
            remainingByte.style.color = 'var(--warning)';
        } else {
            progressBar.style.background = 'var(--primary)';
            remainingByte.style.color = 'var(--text-sub)';
        }
        
        const limitBadge = document.getElementById('char-limit-badge');
        if (limitBadge) {
            limitBadge.textContent = `최대 ${maxBytes}바이트`;
        }
    };

    const checkAuthAndExecute = async (action) => {
        if (!auth || !auth.currentUser) {
            authModal.classList.remove('hidden');
            return;
        }
        action(auth.currentUser);
    };

    modalCloseBtn.addEventListener('click', () => authModal.classList.add('hidden'));
    authModal.addEventListener('click', (e) => { if (e.target === authModal) authModal.classList.add('hidden'); });
    modalLoginBtn.addEventListener('click', () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(() => authModal.classList.remove('active')));

    loginNavBtn.addEventListener('click', () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()));

    const logoutNavBtn = document.getElementById('logout-nav-btn');
    if (logoutNavBtn) {
        logoutNavBtn.addEventListener('click', () => {
            if (auth) auth.signOut();
        });
    }

    if (auth) {
        auth.onAuthStateChanged(user => {
            if (user) {
                loginNavBtn.classList.add('hidden');
                userStatusMini.classList.remove('hidden');
                userPhotoMini.src = user.photoURL || '';
                userNameMini.textContent = (user.displayName || '사용자').split(' ')[0];
            } else {
                loginNavBtn.classList.remove('hidden');
                userStatusMini.classList.add('hidden');
            }
        });
    }

    const saveToLocal = () => {
        localStorage.setItem('block_v3_draft', JSON.stringify({
            q1: q1.value, q2: q2.value, q3: q3.value, q4: q4.value, final: finalText.value, category: categorySelect.value
        }));
    };
    const loadFromLocal = () => {
        try {
            const saved = JSON.parse(localStorage.getItem('block_v3_draft') || '{}');
            q1.value = saved.q1 || ''; q2.value = saved.q2 || ''; q3.value = saved.q3 || ''; q4.value = saved.q4 || '';
            finalText.value = saved.final || '';
            autoResize(finalText);
            categorySelect.value = saved.category || 'autonomous';
            [q1, q2, q3, q4].forEach(q => autoResize(q));
            updateCounters();
        } catch(e) {}
    };
    
    loadFromLocal();

    wordRecommendBtn.addEventListener('click', () => {
        const text = resultText.value;
        wordListContainer.innerHTML = '';
        
        vocabularyData.forEach(item => {
            if (text.includes(item.orig)) {
                const div = document.createElement('div');
                div.className = 'word-item';
                div.innerHTML = `<span class="word-original">${item.orig}</span> → <span class="word-arrow">│</span> ${item.recommends.map(r => `<button class="recommend-tag">${r}</button>`).join('')}`;
                wordListContainer.appendChild(div);
                
                div.querySelectorAll('.recommend-tag').forEach(btn => {
                    btn.addEventListener('click', () => {
                        resultText.value = text.replace(item.orig, btn.textContent);
                        autoResize(resultText);
                    });
                });
            }
        });
        
        if (!wordListContainer.children.length) {
            wordListContainer.innerHTML = '<p style="color:var(--text-muted);padding:20px;text-align:center;">변경할 어휘가 없습니다.</p>';
        }
        
        wordPopup.classList.remove('hidden');
    });
    
    closePopup.addEventListener('click', () => wordPopup.classList.add('hidden'));
    wordPopup.addEventListener('click', (e) => { if (e.target === wordPopup) wordPopup.classList.add('hidden'); });
});
