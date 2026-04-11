import { researchArticles } from './articles.js';

document.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = {
        apiKey: "AIzaSy...",
        authDomain: "school-block.firebaseapp.com",
        projectId: "school-block"
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
    const assembleBtn = document.getElementById('assemble-btn'), clearBtn = document.getElementById('clear-btn'), exampleBtn = document.getElementById('example-btn');
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
    const fillBlocksBtn = document.getElementById('fill-blocks-btn');
    
    const detailTitle = document.getElementById('detail-title');
    const detailKeywords = document.getElementById('detail-keywords');
    const detailBody = document.getElementById('detail-body');

    let currentArticle = null;
    
    const wordRecommendBtn = document.getElementById('word-recommend-btn');
    const wordPopup = document.getElementById('word-popup'), closePopup = document.getElementById('close-popup'), wordListContainer = document.getElementById('word-list');

    const authModal = document.getElementById('auth-modal'), modalCloseBtn = document.getElementById('modal-close-btn'), modalLoginBtn = document.getElementById('modal-login-btn');
    const loginNavBtn = document.getElementById('login-nav-btn');
    const userStatusMini = document.getElementById('user-status'), userPhotoMini = document.getElementById('user-photo-mini'), userNameMini = document.getElementById('user-name-mini');

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
        const text = finalText.value;
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

    const assembleBlocks = () => {
        const v1 = sanitizeInput(q1.value.trim()), v2 = sanitizeInput(q2.value.trim()), v3 = sanitizeInput(q3.value.trim()), v4 = sanitizeInput(q4.value.trim());
        if (!v1 && !v2 && !v3 && !v4) return alert("블록을 입력해주세요.");

        let res = "";
        if (v1 && v2 && v3 && v4) {
            res = `${v1} 호기심을 바탕으로 ${v2} 탐구를 수행함. 이를 통해 ${v3} 사실을 확인하였으며, 이후 ${v4} 계기가 됨.`;
        } else if (v1 && v2 && v3) {
            res = `${v1} 관심을 가지고 ${v2} 과정을 통해 ${v3} 점을 깊이 있게 분석함.`;
        } else {
            res = [v1, v2, v3, v4].filter(x => x).join(' ');
        }

        res = res.replace(/\s+/g, ' ').trim();
        if (res && !res.endsWith('.')) res += '.';
        resultText.value = res;
        saveToLocal();
    };

    const renderArticleList = () => {
        articleList.innerHTML = '';
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
                </div>
            `;
            
            card.onclick = () => showArticleDetail(art);
            articleList.appendChild(card);
        });
    };

    const showArticleDetail = (article) => {
        currentArticle = article;
        detailTitle.textContent = article.title;
        detailKeywords.innerHTML = article.keywords.map(k => `<span class="keyword-badge">#${k}</span>`).join('');
        
        const paragraphs = article.content.split('\n\n');
        detailBody.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
        
        articleListView.classList.remove('active');
        articleDetailView.classList.add('active');
    };

    const hideArticleDetail = () => {
        articleDetailView.classList.remove('active');
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

    [q1, q2, q3, q4, resultText, finalText].forEach(el => el.addEventListener('input', updateCounters));
    categorySelect.addEventListener('change', updateCounters);

    tabBtns.forEach(btn => btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
        
        const headerTitle = document.querySelector('header h1');
        if (btn.dataset.tab === 'explorer') {
            headerTitle.innerHTML = '탐구 주제 찾기 <span class="highlight">: 뉴스</span>';
            renderArticleList();
            hideArticleDetail();
        } else {
            headerTitle.innerHTML = '생기부 조립기 <span class="highlight">: 블록</span>';
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
    
    addToFinalBtn.addEventListener('click', () => {
        if (!resultText.value.trim()) return;
        finalText.value = (finalText.value.trim() ? finalText.value + " " : "") + resultText.value.trim();
        updateCounters();
        addToFinalBtn.textContent = '✅ 추가됨';
        setTimeout(() => addToFinalBtn.textContent = '➕ 문장 쌓기', 1500);
    });

    clearBtn.addEventListener('click', () => {
        if (confirm("모든 내용을 삭제할까요?")) {
            q1.value = q2.value = q3.value = q4.value = resultText.value = finalText.value = '';
            updateCounters();
        }
    });

    exampleBtn.addEventListener('click', () => {
        const randomArt = researchArticles[Math.floor(Math.random() * researchArticles.length)];
        fillBlocksWithArticle(randomArt);
        tabBtns[0].click();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    copyFinalBtn.addEventListener('click', () => {
        if (!finalText.value) return;
        navigator.clipboard.writeText(finalText.value).then(() => {
            const originalIcon = copyFinalBtn.textContent;
            copyFinalBtn.textContent = '✅';
            setTimeout(() => copyFinalBtn.textContent = originalIcon, 2000);
        });
    });

    saveHistoryBtn.addEventListener('click', () => {
        checkAuthAndExecute(async (user) => {
            try {
                await db.collection('users').doc(user.uid).collection('history').add({
                    content: finalText.value,
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
                    const target = (document.activeElement === finalText) ? finalText : resultText;
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
            categorySelect.value = saved.category || 'autonomous';
            updateCounters();
        } catch(e) {}
    };
    
    loadFromLocal();
});
