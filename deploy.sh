export CLOUDFLARE_API_TOKEN=cfut_mZSHl3Rl22sUYDYsW2idZwoeQgNrE5rnuVjOpgVp2a3b6464
git add .
git commit -m "update"
git push origin main
npx wrangler pages deploy . --project-name=school-block --commit-dirty=true
