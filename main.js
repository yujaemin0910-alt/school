let researchArticles = [];

async function loadArticles() {
    try {
        const response = await fetch('./articles.json');
        researchArticles = await response.json();
        console.log('Articles loaded:', researchArticles.length);
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
    const resultText = document.getElementById('result-text');
    const saveHistoryBtn = document.getElementById('save-history-btn');
    const copyResultBtn = document.getElementById('copy-result-btn');
    
    const charCount = document.getElementById('char-count'), byteCount = document.getElementById('byte-count');
    const remainingByte = document.getElementById('remaining-byte'), progressBar = document.getElementById('progress-bar');
    const categorySelect = document.getElementById('category');
    
    const tabBtns = document.querySelectorAll('.tab-btn'), tabPanes = document.querySelectorAll('.tab-pane');
    const articleList = document.getElementById('article-list');
    const articleListView = document.getElementById('article-list-view');
    const articleDetailView = document.getElementById('article-detail-view');
    const backBtn = document.getElementById('back-btn');
    const fillBlocksBtn = document.getElementById('fill-blocks-btn');
    
    const detailTitle = document.getElementById('detail-title');
    const detailKeywords = document.getElementById('detail-keywords');
    const detailBody = document.getElementById('detail-body');

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

    const vocabularyData = [
        { orig: "알아봤다", recommends: ["탐구함", "분석함", "고찰함", "조사함", "규명함"] },
        { orig: "도와줬다", recommends: ["조력함", "기여함", "협력함", "지원함", "봉사함"] },
        { orig: "생각했다", recommends: ["성찰함", "판단함", "추론함", "견해를 넓힘", "인식함"] },
        { orig: "노력했다", recommends: ["경주함", "몰두함", "심혈을 기울임", "정진함", "매진함"] },
        { orig: "잘한다", recommends: ["탁월함", "능숙함", "우수함", "두각을 나타냄", "역량이 뛰어남"] },
        { orig: "배웠다", recommends: ["체득함", "학습함", "습득함", "이해의 폭을 넓힘", "내면화함"] }
    ];

    const tempDiv = document.createElement('div');
    const sanitizeInput = (text) => {
        tempDiv.textContent = text;
        return tempDiv.innerHTML.replace(/<[^>]*>?/gm, '');
    };

    const getByteLength = (str) => {
        const encoder = new TextEncoder();
        return encoder.encode(str).length;
    };

    const checkAuthAndExecute = (action) => {
        if (!auth || !auth.currentUser) {
            authModal.classList.add('active');
        } else {
            action(auth.currentUser);
        }
    };

    const insertAtCursor = (textarea, text) => {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const val = textarea.value;
        textarea.value = val.substring(0, start) + text + val.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
        updateCounters();
    };

    const updateCounters = () => {
        const text = resultText.value;
        const bLen = getByteLength(text);
        const selectedOption = categorySelect.options[categorySelect.selectedIndex];
        const mBytes = parseInt(selectedOption.getAttribute('data-bytes') || 1500);
        
        charCount.textContent = `${text.length}자`;
        byteCount.textContent = `${bLen}바이트`;
        remainingByte.textContent = Math.max(0, mBytes - bLen);
        
        const pct = Math.min((bLen / mBytes) * 100, 100);
        progressBar.style.width = `${pct}%`;
        progressBar.className = 'progress-bar-fill';
        if (pct >= 90) progressBar.classList.add('danger');
        else if (pct >= 70) progressBar.classList.add('warning');
        
        saveToLocal();
    };

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
        const v1 = sanitizeInput(q1.value.trim());
        const v2 = sanitizeInput(q2.value.trim());
        const v3 = sanitizeInput(q3.value.trim());
        const v4 = sanitizeInput(q4.value.trim());
        
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
            result = `${p}. 이를 통해 ${cleanInput(v3)}을(를) 이해함.`;
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

    const renderArticleList = () => {
        console.log('Rendering articles, count:', researchArticles.length);
        articleList.innerHTML = '';
        if (researchArticles.length === 0) {
            articleList.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px;">기사를 불러오는 중...</p>';
            return;
        }
        researchArticles.forEach(art => {
            const card = document.createElement('div');
            card.className = 'article-card';
            card.innerHTML = `
                <div class="article-content">
                    <h4>${art.title}</h4>
                    <p>${art.summary}</p>
                    <div class="keywords">
                        ${art.keywords.map(k => `<span class="keyword-badge">#${k}</span>`).join('')}
                    </div>
                    <button class="detail-btn" data-id="${art.id}">자세히 보기</button>
                </div>
            `;
            
            const detailBtn = card.querySelector('.detail-btn');
            detailBtn.onclick = (e) => {
                e.stopPropagation();
                showArticleDetail(art);
            };
            
            articleList.appendChild(card);
        });
    };

    const showArticleDetail = (article) => {
        currentArticle = article;
        detailTitle.textContent = article.title;
        detailKeywords.innerHTML = article.keywords.map(k => `<span class="keyword-badge">#${k}</span>`).join('');
        
        const paragraphs = article.content.split('\n\n');
        detailBody.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
        
        if (article.sources && article.sources.length > 0) {
            const sourcesHtml = `
                <div class="sources-section">
                    <h5 class="sources-title">📎 출처 및 참고자료</h5>
                    <div class="sources-list">
                        ${article.sources.map(s => `
                            <a href="${s.url}" target="_blank" rel="noopener" class="source-link">
                                • ${s.label}
                            </a>
                        `).join('')}
                    </div>
                    <button class="detail-fill-btn">✨ 블록에 채우기</button>
                </div>
            `;
            detailBody.innerHTML += sourcesHtml;
            
            const detailFillBtn = detailBody.querySelector('.detail-fill-btn');
            detailFillBtn.addEventListener('click', () => {
                fillBlocksWithArticle(article);
                hideArticleDetail();
                tabBtns[0].click();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
        articleListView.style.display = 'none';
        articleListView.classList.remove('active');
        articleDetailView.classList.add('active');
    };

    const hideArticleDetail = () => {
        articleDetailView.classList.remove('active');
        articleListView.style.display = 'block';
        setTimeout(() => {
            articleListView.classList.add('active');
            currentArticle = null;
        }, 300);
    };

    const fillBlocksWithArticle = (art) => {
        q1.value = art.q1_hint;
        q2.value = art.q2_hint;
        q3.value = art.q3_hint || "";
        q4.value = art.q4_hint || "";
        
        document.querySelectorAll('.input-card').forEach(c => {
            c.style.animation = 'none';
            setTimeout(() => c.style.animation = 'highlight-pulse 1s', 10);
        });
        
        saveToLocal();
        updateCounters();
    };

    [q1, q2, q3, q4, resultText, resultText].forEach(el => el.addEventListener('input', updateCounters));
    categorySelect.addEventListener('change', updateCounters);

    tabBtns.forEach(btn => btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
        
        if (btn.dataset.tab === 'explorer') {
            renderArticleList();
            hideArticleDetail();
        }
    }));

    backBtn.addEventListener('click', hideArticleDetail);

    fillBlocksBtn.addEventListener('click', () => {
        if (!currentArticle) return;
        fillBlocksWithArticle(currentArticle);
        hideArticleDetail();
        tabBtns[0].click();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    assembleBtn.addEventListener('click', assembleBlocks);
    reassembleBtn.addEventListener('click', reassembleBlocks);

    clearBtn.addEventListener('click', () => {
        if (confirm("모든 내용을 삭제할까요?")) {
            q1.value = q2.value = q3.value = q4.value = resultText.value = '';
            autoResize(resultText);
            lastInputs = { v1: '', v2: '', v3: '', v4: '' };
            lastInputs = { v1: '', v2: '', v3: '', v4: '' };
            updateCounters();
        }
    });

    copyResultBtn.addEventListener('click', () => {
        if (!resultText.value) return;
        navigator.clipboard.writeText(resultText.value).then(() => {
            const originalIcon = copyResultBtn.textContent;
            copyResultBtn.textContent = '✅';
            setTimeout(() => copyResultBtn.textContent = originalIcon, 2000);
        });
    });

    saveHistoryBtn.addEventListener('click', () => {
        checkAuthAndExecute(async (user) => {
            try {
                await db.collection('users').doc(user.uid).collection('history').add({
                    content: resultText.value,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                alert("히스토리에 저장되었습니다!");
            } catch (e) { alert("저장 실패!"); }
        });
    });

    wordRecommendBtn.addEventListener('click', () => {
        wordListContainer.innerHTML = '';
        vocabularyData.forEach(item => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';
            wordItem.innerHTML = `<span class="word-orig">[${item.orig}]</span>`;
            const recommendsDiv = document.createElement('div');
            recommendsDiv.className = 'word-recommends';
            item.recommends.forEach(rec => {
                const tag = document.createElement('span');
                tag.className = 'recommend-tag';
                tag.textContent = rec;
                tag.onclick = () => {
                    const target = (document.activeElement === resultText) ? resultText : resultText;
                    insertAtCursor(target, rec);
                };
                recommendsDiv.appendChild(tag);
            });
            wordItem.appendChild(recommendsDiv);
            wordListContainer.appendChild(wordItem);
        });
        wordPopup.classList.add('active');
    });

    closePopup.addEventListener('click', () => wordPopup.classList.remove('active'));

    modalCloseBtn.addEventListener('click', () => authModal.classList.remove('active'));
    modalLoginBtn.addEventListener('click', () => {
        auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(() => authModal.classList.remove('active'));
    });
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
            q1: q1.value, q2: q2.value, q3: q3.value, q4: q4.value, final: resultText.value, category: categorySelect.value
        }));
    };
    const loadFromLocal = () => {
        try {
            const saved = JSON.parse(localStorage.getItem('block_v3_draft') || '{}');
            q1.value = saved.q1 || ''; q2.value = saved.q2 || ''; q3.value = saved.q3 || ''; q4.value = saved.q4 || '';
            resultText.value = saved.final || '';
            autoResize(resultText);
            categorySelect.value = saved.category || 'autonomous';
            updateCounters();
        } catch(e) {}
    };
    
    loadFromLocal();
});
