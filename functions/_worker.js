export async function onRequest(context) {
  const { next, env } = context;
  const response = await next();

  const contentType = response.headers.get("content-type") || "";

  // JS 파일에만 Firebase config 주입
  if (contentType.includes("javascript") || contentType.includes("text/html")) {
    let body = await response.text();

    // 환경 변수 치환
    if (env.FIREBASE_API_KEY) {
      body = body.replace(
        /apiKey:\s*"[^"]*"/g,
        `apiKey: "${env.FIREBASE_API_KEY}"`
      );
    }
    if (env.FIREBASE_AUTH_DOMAIN) {
      body = body.replace(
        /authDomain:\s*"[^"]*"/g,
        `authDomain: "${env.FIREBASE_AUTH_DOMAIN}"`
      );
    }
    if (env.FIREBASE_PROJECT_ID) {
      body = body.replace(
        /projectId:\s*"[^"]*"/g,
        `projectId: "${env.FIREBASE_PROJECT_ID}"`
      );
    }

    return new Response(body, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    });
  }

  return response;
}
