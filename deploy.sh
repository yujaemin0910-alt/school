export CLOUDFLARE_API_TOKEN=cfut_4r81RAkafo5abrsUOb3zN5WInTbxPFcI9vyoGrIA38e0e655
git add .
git commit -m "update"
git push origin main
npx wrangler pages deploy . --project-name=school-block --commit-dirty=true
