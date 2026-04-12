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
    const remainingBytes = parseInt(request.headers.get('X-Remaining-Bytes') || '0');
    const charCount = Math.floor(remainingBytes / 3);
    const prompt = `당신은 한국 고등학생 생활기록부 세부능력특기사항 전문 작성자입니다. 반드시 한국어로만 답하세요. 한자, 영어, 중국어는 절대 사용하지 마세요. 다음 생기부 문장에 이어서 내용을 보완해줘. 한국어 기준 약 ${charCount}자 분량으로 작성하고 ~함.으로 끝내줘.

현재 문장: ${coreText}`;

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
      'Access-Control-Allow-Headers': 'Content-Type, X-Remaining-Bytes'
    }
  });
}