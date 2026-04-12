export CLOUDFLARE_API_TOKEN=cfut_ThNP6QdHgbrIoA2e28JiXm7fqOx9Uy7WlLPkpvwO975edc31
git add .
git commit -m "update"
git push origin main
npx wrangler pages deploy . --project-name=school-block --commit-dirty=true
