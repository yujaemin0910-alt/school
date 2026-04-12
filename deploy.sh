export CLOUDFLARE_API_TOKEN=cfut_Fw7v0RaSXfoadGEo5e7hcJBfkv5z4MnyjPlZtQba973dd881
git add .
git commit -m "update"
git push origin main
npx wrangler pages deploy . --project-name=school-block --commit-dirty=true
