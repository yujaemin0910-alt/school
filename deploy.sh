export CLOUDFLARE_API_TOKEN=cfut_BnsrqQRVXiCKIbTTYgwC7vQI3PbVTErxkz6Zo7et5a15a290
git add .
git commit -m "update"
git push origin main
npx wrangler pages deploy . --project-name=school-block --commit-dirty=true
