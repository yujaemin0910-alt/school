const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Parser = require('rss-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();
const db = admin.firestore();
const parser = new Parser();

// Gemini API Key from your input
const GEMINI_API_KEY = "AIzaSyCPfO5TjleAXlqVV8Mc480rwYpSbuayClg";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * RSS 크롤러 및 Gemini 요약 배치 처리 스케줄러 (매일 1회 실행)
 */
exports.dailyArticleCrawl = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    const feeds = [
        'https://www.sciencetimes.co.kr/rss',
        'https://www.dongascience.com/rss'
    ];

    let allItems = [];
    try {
        for (const url of feeds) {
            const feed = await parser.parseURL(url);
            allItems = allItems.concat(feed.items.slice(0, 3)); // 각 사이트별 최신 3개씩
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        다음은 최신 과학 기술 기사들의 요약본들이다. 
        고등학생들이 이 기사를 읽고 '학교생활기록부(생기부)' 탐구 활동을 할 수 있도록 아래 JSON 배열 형식으로만 응답하라.
        응답 형식 (JSON Array):
        [{
            "title": "기사 제목",
            "summary": "3줄 한국어 요약",
            "keywords": ["키워드1", "키워드2"],
            "q1_hint": "활동 동기 예시 (호기심 기반)",
            "q2_hint": "구체적 탐구 과정 예시",
            "q3_hint": "탐구 결과 및 알게 된 점 예시",
            "q4_hint": "이후 심화 탐구 방향 예시",
            "publishedAt": "YYYY-MM-DD"
        }]

        기사 데이터:
        ${allItems.map(item => `제목: ${item.title}, 내용: ${item.contentSnippet}`).join('\n\n')}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonStr = response.text().replace(/```json|```/g, '').trim();
        const articles = JSON.parse(jsonStr);

        const batch = db.batch();
        articles.forEach(article => {
            const docRef = db.collection('articles').doc();
            batch.set(docRef, {
                ...article,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();
        console.log(`Successfully updated ${articles.length} articles.`);
        return null;
    } catch (error) {
        console.error("Batch Processing Error:", error);
        return null;
    }
});

/**
 * 사용자별 일일 호출 횟수 제한 (Rate Limiter)
 */
async function checkRateLimit(uid) {
    const today = new Date().toISOString().split('T')[0];
    const userLimitRef = db.collection('usage_limits').doc(`${uid}_${today}`);
    
    return db.runTransaction(async (transaction) => {
        const doc = await transaction.get(userLimitRef);
        const count = doc.exists ? doc.data().count : 0;
        if (count >= 50) throw new Error('Daily limit reached');
        transaction.set(userLimitRef, { count: count + 1 }, { merge: true });
        return true;
    });
}
