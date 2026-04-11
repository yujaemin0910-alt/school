export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    if (response.headers.get("content-type")?.includes("javascript")) {
      let body = await response.text();
      const updatedBody = body
        .replace("'AIzaSy...'", `'${env.FIREBASE_API_KEY || ''}'`)
        .replace("'school-block.firebaseapp.com'", `'${env.FIREBASE_AUTH_DOMAIN || ''}'`)
        .replace("'school-block'", `'${env.FIREBASE_PROJECT_ID || ''}'`);
      return new Response(updatedBody, { headers: response.headers });
    }
    return response;
  }
};
