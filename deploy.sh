export CLOUDFLARE_API_TOKEN=cfut_UTtm4MHjLEyG1bGFOziTveu5detvXjTMV8n47Fye936115c8
git add .
git commit -m "update"
git push origin main
npx wrangler pages deploy . --project-name=school-block --commit-dirty=true
