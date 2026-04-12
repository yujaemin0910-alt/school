export CLOUDFLARE_API_TOKEN=cfut_tRmgLJQnA4OxTHcL7uZYSTfUDpPR85INUZscLSIyedaa339e
git add .
git commit -m "update"
git push origin main
npx wrangler pages deploy . --project-name=school-block --commit-dirty=true
