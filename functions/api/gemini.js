export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const coreText = await request.text();
    const prompt = `다음 생기부 문장의 부족한 부분을 보완할 내용을 한 문장으로 추천해줘. 전문적인 탐구 용어를 사용하고 "~함."으로 끝내줘.\n\n현재 문장: ${coreText}`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    console.log('Gemini API response:', JSON.stringify(data));
    
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.candidates?.[0]?.finishReason || '';

    return new Response(JSON.stringify({ result }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.log('Gemini API error:', error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}