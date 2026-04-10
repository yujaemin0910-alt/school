document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const q1 = document.getElementById('q1');
    const q2 = document.getElementById('q2');
    const q3 = document.getElementById('q3');
    const q4 = document.getElementById('q4');
    const assembleBtn = document.getElementById('assemble-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const resultText = document.getElementById('result-text');
    const resultSection = document.querySelector('.result-section');
    const categorySelect = document.getElementById('category');
    const charCount = document.getElementById('char-count');
    const byteCount = document.getElementById('byte-count');
    const limitText = document.getElementById('limit-text');
    const progressBar = document.getElementById('progress-bar');
    
    const wordRecommendBtn = document.getElementById('word-recommend-btn');
    const wordPopup = document.getElementById('word-popup');
    const closePopup = document.getElementById('close-popup');
    const wordListContainer = document.getElementById('word-list');

    // Advanced Vocabulary Data
    const vocabularyData = [
        { orig: "알아봤다", recommends: ["탐구함", "분석함", "고찰함", "조사함", "규명함"] },
        { orig: "도와줬다", recommends: ["조력함", "기여함", "협력함", "지원함", "봉사함"] },
        { orig: "생각했다", recommends: ["성찰함", "판단함", "추론함", "견해를 넓힘", "인식함"] },
        { orig: "노력했다", recommends: ["경주함", "몰두함", "심혈을 기울임", "정진함", "매진함"] },
        { orig: "잘한다", recommends: ["탁월함", "능숙함", "우수함", "두각을 나타냄", "역량이 뛰어남"] },
        { orig: "배웠다", recommends: ["체득함", "학습함", "습득함", "이해의 폭을 넓힘", "내면화함"] },
        { orig: "만들었다", recommends: ["제작함", "구축함", "창출함", "고안함", "설계함"] },
        { orig: "참여했다", recommends: ["참동함", "함께함", "일조함", "주도적으로 임함", "참가함"] }
    ];

    // Functions
    
    // Calculate Bytes (Hangul: 3 bytes, English/etc: 1 byte) - NEIS Standard
    const getByteLength = (str) => {
        let bytes = 0;
        for (let i = 0; i < str.length; i++) {
            const code = str.charCodeAt(i);
            if (code <= 127) {
                bytes += 1;
            } else {
                bytes += 3;
            }
        }
        return bytes;
    };

    const updateCounters = () => {
        const text = resultText.value;
        const charLen = text.length;
        const byteLen = getByteLength(text);
        
        const selectedOption = categorySelect.options[categorySelect.selectedIndex];
        const maxBytes = parseInt(selectedOption.getAttribute('data-bytes'));
        
        charCount.textContent = `${charLen}자`;
        byteCount.textContent = `${byteLen}바이트`;
        limitText.textContent = maxBytes;
        
        // Progress Bar
        const percentage = Math.min((byteLen / maxBytes) * 100, 100);
        progressBar.style.width = `${percentage}%`;
        
        // Color Change
        progressBar.classList.remove('warning', 'danger');
        if (percentage >= 90) {
            progressBar.classList.add('danger');
        } else if (percentage >= 70) {
            progressBar.classList.add('warning');
        }
    };

    const assembleBlocks = () => {
        const v1 = q1.value.trim();
        const v2 = q2.value.trim();
        const v3 = q3.value.trim();
        const v4 = q4.value.trim();

        if (!v1 && !v2 && !v3 && !v4) {
            alert("최소 하나 이상의 블록을 채워주세요!");
            return;
        }

        // Natural connection logic with better handling for missing blocks
        let sentences = [];
        
        if (v1) sentences.push(`${v1} 지적 호기심을 바탕으로`);
        if (v2) {
            const connect = v1 ? ' 관련 ' : '';
            sentences.push(`${connect}${v2} 활동을 수행함.`);
        } else if (v1) {
            sentences[sentences.length-1] += ' 탐구함.';
        }

        if (v3) {
            const prefix = (v1 || v2) ? '이를 통해 ' : '';
            sentences.push(`${prefix}${v3} 사실을 확인하였음.`);
        }

        if (v4) {
            const prefix = (v1 || v2 || v3) ? '나아가 ' : '';
            sentences.push(`${prefix}${v4} 계기가 됨.`);
        }

        let sentence = sentences.join(' ').replace(/\. \./g, '.').trim();
        
        // Final polish for natural flow
        if (sentence && !sentence.endsWith('.')) {
            sentence += '.';
        }

        resultText.value = sentence;
        resultSection.classList.add('active');
        updateCounters();
        
        // Scroll to result
        resultText.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const clearInputs = () => {
        if (confirm("모든 입력 내용을 초기화할까요?")) {
            q1.value = '';
            q2.value = '';
            q3.value = '';
            q4.value = '';
            resultText.value = '';
            resultSection.classList.remove('active');
            updateCounters();
        }
    };

    const copyToClipboard = () => {
        if (!resultText.value) return;
        
        navigator.clipboard.writeText(resultText.value).then(() => {
            const originalIcon = copyBtn.textContent;
            copyBtn.textContent = '✅';
            setTimeout(() => {
                copyBtn.textContent = originalIcon;
            }, 2000);
        });
    };

    const initWordPopup = () => {
        wordListContainer.innerHTML = '';
        vocabularyData.forEach(item => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-item';
            
            const origLabel = document.createElement('span');
            origLabel.className = 'word-orig';
            origLabel.textContent = `[${item.orig}] →`;
            
            const recommendsDiv = document.createElement('div');
            recommendsDiv.className = 'word-recommends';
            
            item.recommends.forEach(rec => {
                const tag = document.createElement('span');
                tag.className = 'recommend-tag';
                tag.textContent = rec;
                tag.onclick = () => {
                    navigator.clipboard.writeText(rec);
                    // Minimal toast or visual feedback instead of alert
                    tag.style.backgroundColor = 'var(--primary-color)';
                    tag.style.color = 'white';
                    setTimeout(() => {
                        tag.style.backgroundColor = '';
                        tag.style.color = '';
                    }, 1000);
                };
                recommendsDiv.appendChild(tag);
            });
            
            wordItem.appendChild(origLabel);
            wordItem.appendChild(recommendsDiv);
            wordListContainer.appendChild(wordItem);
        });
    };

    // Event Listeners
    assembleBtn.addEventListener('click', assembleBlocks);
    clearBtn.addEventListener('click', clearInputs);
    copyBtn.addEventListener('click', copyToClipboard);
    
    categorySelect.addEventListener('change', updateCounters);

    wordRecommendBtn.addEventListener('click', () => {
        initWordPopup();
        wordPopup.classList.add('active');
    });

    closePopup.addEventListener('click', () => {
        wordPopup.classList.remove('active');
    });

    wordPopup.addEventListener('click', (e) => {
        if (e.target === wordPopup) {
            wordPopup.classList.remove('active');
        }
    });

    // Initialize counters
    updateCounters();
});
