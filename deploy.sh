export CLOUDFLARE_API_TOKEN=cfut_NzxszgKT682aCv9VQLDW0i9aXYwTbLbQ5y7A52EU16726c76
git add .
git commit -m "update"
git push origin main
npx wrangler pages deploy . --project-name=school-block --commit-dirty=true
