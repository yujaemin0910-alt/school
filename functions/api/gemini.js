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
    const prompt = `당신은 한국 고등학생 생활기록부 세부능력특기사항 전문 작성자입니다. 반드시 한국어로만 답하세요. 한자, 영어, 중국어는 절대 사용하지 마세요. 아래 규칙을 반드시 따르세요:
1. 반드시 한국어로만 작성
2. 정확히 ${charCount}자 분량으로 작성 (매우 중요!)
3. 문장 마지막은 반드시 '~함.'으로 끝내기
4. 탐구 과정, 심화 학습, 진로 연계 내용 포함
5. 절대로 현재 문장을 반복하지 마세요
6. 현재 문장 다음에 이어질 새로운 내용만 작성하세요
7. 출력은 새로 추가되는 내용만 포함해야 합니다

현재 문장: ${coreText}

새로 추가할 내용:`;

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