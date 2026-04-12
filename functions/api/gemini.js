export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const coreText = await request.text();
    const prompt = `다음 생기부 문장의 부족한 부분을 보완할 내용을 한 문장으로 추천해줘. 전문적인 탐구 용어를 사용하고 "~함."으로 끝내줘.\n\n현재 문장: ${coreText}`;

    const body = {
      model: "openai/gpt-oss-120b:free",
      messages: [{ role: "user", content: prompt }]
    };

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();
    console.log('OpenRouter API response:', JSON.stringify(data));
    
    const result = data?.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ result }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    console.log('OpenRouter API error:', error.message, error.stack);
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