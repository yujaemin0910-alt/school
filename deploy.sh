export CLOUDFLARE_API_TOKEN=cfut_ITyrvhEZXdFDmpHvBA3xJQMMVyh1BgfiI4realojaa3edf2e
git add .
git commit -m "update"
git push origin main
npx wrangler pages deploy . --project-name=school-block --commit-dirty=true
