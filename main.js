import { researchArticles } from './articles.js';

document.addEventListener('DOMContentLoaded', () => {
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

        const connectors = {
            '호기심': ['에 대한 호기심에서 출발하여', '궁금증에 이끌려'],
            '관심': ['에 관심을 갖게 되어', '에 대한 관심을 가지고'],
            '궁금증': ['에 대한 궁금증에서 출발하여', '궁금증 해소의 필요성을 느껴'],
            '의문': ['에 대한 의문을 해결하고자', '의문 제기에서 시작하여'],
            '문제': ['에 대한 문제의식을 가지고', '문제 인식에서 출발하여'],
            '필요': ['의 필요성을 느껴', '의 필요성을 인식하여'],
            '때문': ['에 대한 탐구가 필요하다고 생각하여']
        };

        const getConnector = (text) => {
            for (const [key, vals] of Object.entries(connectors)) {
                if (text.includes(key)) {
                    return vals[Math.floor(Math.random() * vals.length)];
                }
            }
            return '에 관심을 갖게 되어';
        };

        const formatProcess = (text) => {
            text = text.replace(/을$/, '').replace(/를$/, '');
            if (!text.includes('를') && !text.includes('을') && !text.includes('를') && !text.includes('의')) {
                if (!text.includes('함')) {
                    text += '에 대한 탐구를 수행함';
                } else {
                    text = text.replace(/함$/, '을 수행함');
                }
            } else {
                if (!text.includes('수행') && !text.includes('진행') && !text.includes('활동')) {
                    text = text.replace(/(탐구|분석|조사|연구)/, '$1을 수행함');
                }
                if (!text.includes('수행') && !text.includes('진행')) {
                    text += '을 수행함';
                }
            }
            return text;
        };

        const formatResult = (text) => {
            text = text.replace(/\.$/, '');
            if (!text.includes('을') && !text.includes('를') && !text.includes('이') && !text.includes('가')) {
                if (text.endsWith('다') && !text.includes('함')) {
                    text = text.slice(0, -1);
                }
                text += '을(를) 확인함';
            } else {
                if (!text.includes('확인') && !text.includes('발견') && !text.includes('이해')) {
                    text += '을(를) 확인함';
                }
            }
            return text;
        };

        const formatGrowth = (text) => {
            text = text.replace(/\.$/, '');
            if (!text.includes('되') && !text.includes('됨') && !text.includes('계기') && !text.includes('목표') && !text.includes('꿈')) {
                if (text.includes('싶다')) {
                    text = text.replace(/싶다.*$/, '싶다는 목표를 갖게 됨');
                } else {
                    text += '에 관심을 갖게 됨';
                }
            } else {
                if (!text.includes('됨') && !text.includes('거다')) {
                    text += '이(가) 구체화됨';
                }
            }
            return text;
        };

        let result = '';
        const c1 = getConnector(v1);

        if (v1 && v2 && v3 && v4) {
            result = `${v1} ${c1} ${formatProcess(v2)}. ${formatResult(v3)}을(를) 확인하였으며, ${formatGrowth(v4)}.`;
        } else if (v1 && v2 && v3) {
            result = `${v1} ${c1} ${formatProcess(v2)}. 이를 통해 ${formatResult(v3)}을(를) 깊이 있게 이해함.`;
        } else if (v1 && v2) {
            result = `${v1} ${c1} ${formatProcess(v2)}.`;
        } else if (v1 && v3) {
            result = `${v1} ${c1} ${formatResult(v3)}을(를) 이해함.`;
        } else if (v2 && v3) {
            result = `${formatProcess(v2)}. 이를 통해 ${formatResult(v3)}을(를) 확인함.`;
        } else if (v1 && v4) {
            result = `${v1} ${c1}, ${formatGrowth(v4)}.`;
        } else if (v3 && v4) {
            result = `${formatResult(v3)}을(를) 확인하였으며, ${formatGrowth(v4)}.`;
        } else if (v1) {
            result = `${v1} ${c1} 탐구를 시작함.`;
        } else if (v2) {
            result = `${formatProcess(v2)}.`;
        } else if (v3) {
            result = `${formatResult(v3)}을(를) 이해함.`;
        } else if (v4) {
            result = `${formatGrowth(v4)}.`;
        }

        result = result.replace(/\s+/g, ' ').replace(/\.\./g, '.').trim();
        resultText.value = result;
        saveToLocal();
    };

        const makeMotivational = (text) => {
            if (!text) return '';
            text = normalize(text);
            const starters = ['에 대한 호기심', '에 대한 궁금증', '에 대한 관심', '을/를 통해'];
            const hasStarter = starters.some(s => text.includes(s));
            if (!hasStarter && !text.includes('에 관심을 갖게 되어') && !text.includes('을/를的好奇')) {
                if (text.includes('?')) {
                    text = text.replace('?', '') + '에 대한 궁금증';
                }
            }
            if (text.startsWith('나는') || text.startsWith('저는')) {
                text = text.replace(/^(나는|저는)/, '');
            }
            if (text.startsWith('화제') || text.startsWith('주제')) {
                text = text + '에 관심을 갖게 되어';
            }
            if (!text.includes('호기심') && !text.includes('관심') && !text.includes('궁금증') && !text.includes('의문') && !text.includes('의미')) {
                if (!text.includes('때문') && !text.includes('계기')) {
                    text = text + '에 관심을 갖게 되어';
                }
            }
            return text;
        };

        const makeProcessual = (text) => {
            if (!text) return '';
            text = normalize(text);
            text = text.replace(/을$/, '을');
            text = text.replace(/를$/, '를');
            text = text.replace(/에$/, '에');
            if (!text.includes('탐구') && !text.includes('분석') && !text.includes('조사') && !text.includes('연구') && !text.includes('학습') && !text.includes('활동') && !text.includes('실습') && !text.includes('수행') && !text.includes('진행')) {
                if (text.includes('을/를')) {
                    text = text + '에 대한 탐구를 수행함';
                } else if (!text.includes('함')) {
                    text = text + '에 대한 탐구를 수행함';
                }
            }
            if (text.endsWith('을') || text.endsWith('를')) {
                text = text + ' 탐구를 수행함';
            } else if (text.endsWith('를') || text.endsWith('을')) {
                text = text + ' 탐구';
            }
            if (!text.includes('을') && !text.includes('를') && !text.includes('에') && !text.includes('과') && !text.includes('와')) {
                if (text.length < 15 && !text.includes('함')) {
                    text = text + '에 대한 탐구를 수행함';
                }
            }
            text = text.replace(/을 탐구를 수행함$/, '을 탐구함');
            text = text.replace(/를 탐구를 수행함$/, '를 탐구함');
            text = text.replace(/에 대한 탐구를 수행함$/, '에 대한 탐구를 수행함');
            text = text.replace(/탐구를 수행함$/, '탐구를 수행함');
            if (!text.includes('을') && !text.includes('를') && !text.includes('에 대한')) {
                if (text.includes('탐구') || text.includes('분석') || text.includes('조사')) {
                    if (!text.includes('을') && !text.includes('의')) {
                        text = text.replace(/(탐구|분석|조사|연구)/, '$1을');
                    }
                }
            }
            return text;
        };

        const makeResult = (text) => {
            if (!text) return '';
            text = normalize(text);
            if (!text.includes('을') && !text.includes('를') && !text.includes('이') && !text.includes('가') && !text.includes('은') && !text.includes('는')) {
                if (text.endsWith('다') && !text.includes('함')) {
                    text = text.slice(0, -1) + '음';
                }
                if (!text.endsWith('음') && !text.endsWith('임') && !text.endsWith('함')) {
                    text = text + '을(를) 알게 됨';
                }
            }
            if (text.includes('을/를')) {
                text = text.replace('을/를', '을') + '을(를) 확인함';
            }
            if (!text.includes('확인') && !text.includes('발견') && !text.includes('인식') && !text.includes('이해') && !text.includes('알게') && !text.includes('인함')) {
                if (text.endsWith('다')) {
                    text = text.slice(0, -1) + '은(는) ' + text.slice(0, -1) + '을 확인함';
                }
            }
            if (!text.includes('을') && !text.includes('를') && text.includes('확인')) {
                text = text + '을 확인함';
            }
            if (!text.includes('이') && !text.includes('을') && !text.includes('를') && text.includes('확인함')) {
                if (text.includes('됨')) {
                    text = text.replace('됨', '됨을 확인함');
                }
            }
            return text;
        };

        const makeGrowth = (text) => {
            if (!text) return '';
            text = normalize(text);
            if (!text.includes('되') && !text.includes('成长') && !text.includes('발견') && !text.includes('계기') && !text.includes('목표') && !text.includes('꿈') && !text.includes('관심') && !text.includes('의지')) {
                text = text + '에 관심을 갖게 됨';
            }
            if (text.includes('싶다')) {
                text = text.replace(/싶다.*$/, '싶다는 목표를 갖게 됨');
            }
            if (!text.includes('됨') && !text.includes('거다') && !text.includes('것이다')) {
                text = text + '을(가) 구체화됨';
            }
            return text;
        };

        let result = '';
        
        if (v1 && v2 && v3 && v4) {
            const m1 = makeMotivational(v1);
            const m2 = makeProcessual(v2);
            const m3 = makeResult(v3);
            const m4 = makeGrowth(v4);
            
            const connectors = {
                '호기심': ['에 대한 호기심에서 출발하여', '궁금증을 바탕으로', '호기심에 이끌려'],
                '관심': ['에 관심을 갖게 되어', '에 대한 관심을 가지고', '관심에서 시작하여'],
                '궁금증': ['에 대한 궁금증에서 출발하여', '궁금증 해소의 필요성을 느껴', '궁금증에 이끌려'],
                '의문': ['에 대한 의문을 해결하고자', '의문 제기에서 시작하여', '의문 해소를 위해'],
                '때문': ['에 대한 탐구가 필요한 점을认识到하여', '때문이다. 이로 인해', '때문이다. 이를 통해']
            };
            
            let connector = '에 관심을 갖게 되어';
            for (const [key, vals] of Object.entries(connectors)) {
                if (m1.includes(key)) {
                    connector = vals[Math.floor(Math.random() * vals.length)];
                    break;
                }
            }
            
            if (m1.includes('때문')) {
                result = `${m1}라는 점을 인식하여 ${m2}. ${m3}을(를) 확인하였으며, ${m4}.`;
            } else {
                result = `${m1} ${connector} ${m2}. ${m3}을(를) 확인하였으며, ${m4}.`;
            }
        } else if (v1 && v2 && v3) {
            const m1 = makeMotivational(v1);
            const m2 = makeProcessual(v2);
            const m3 = makeResult(v3);
            result = `${m1}에 관심을 갖게 되어 ${m2}. 이를 통해 ${m3}을(를) 깊이 있게 이해함.`;
        } else if (v1 && v2) {
            const m1 = makeMotivational(v1);
            const m2 = makeProcessual(v2);
            result = `${m1}에 관심을 갖게 되어 ${m2}.`;
        } else if (v1 && v3) {
            const m1 = makeMotivational(v1);
            const m3 = makeResult(v3);
            result = `${m1}에 관심을 갖게 되어 ${m3}을(를) 이해함.`;
        } else if (v2 && v3) {
            const m2 = makeProcessual(v2);
            const m3 = makeResult(v3);
            result = `${m2}. 이를 통해 ${m3}을(를) 확인함.`;
        } else if (v1 && v4) {
            const m1 = makeMotivational(v1);
            const m4 = makeGrowth(v4);
            result = `${m1}에 관심을 갖게 되어, ${m4}.`;
        } else if (v3 && v4) {
            const m3 = makeResult(v3);
            const m4 = makeGrowth(v4);
            result = `${m3}을(를) 확인하였으며, ${m4}.`;
        } else if (v1) {
            const m1 = makeMotivational(v1);
            result = `${m1}에 관심을 갖게 되어 탐구를 시작함.`;
        } else if (v2) {
            const m2 = makeProcessual(v2);
            result = `${m2}.`;
        } else if (v3) {
            const m3 = makeResult(v3);
            result = `${m3}을(를) 이해함.`;
        } else if (v4) {
            const m4 = makeGrowth(v4);
            result = `${m4}.`;
        }

        result = result.replace(/\s+/g, ' ').replace(/\.\./g, '.').replace(/\,\./g, '.').trim();
        result = result.charAt(0).toUpperCase() + result.slice(1);
        if (!result.endsWith('.') && !result.endsWith('다')) result += '.';
        
        resultText.value = result;
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
                </div>
            `;
            detailBody.innerHTML += sourcesHtml;
        }
        
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
