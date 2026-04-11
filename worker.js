export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const GEMINI_API_KEY = env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return new Response('API key not configured', { status: 500 });
    }

    const corsOrigin = 'https://school.jamna.workers.dev';
    const coreText = request.headers.get('x-core-text') || '';
    const prompt = `다음 생기부 문장의 부족한 부분을 보완할 내용을 한 문장으로 추천해줘. 전문적인 탐구 용어를 사용하고 "~함."으로 끝내줘.\n\n현재 문장: ${coreText}`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256
      }
    };

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );

      const data = await response.json();
      const result = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return new Response(JSON.stringify({ result }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-core-text'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': corsOrigin
        }
      });
    }
  }
};