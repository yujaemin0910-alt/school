export CLOUDFLARE_API_TOKEN=cfut_aMkIodWQ5baFEN4ZGdQLRNmfeoSrzaPAxOA1PVxAecd7fa54
git add .
git commit -m "update"
git push origin main
npx wrangler pages deploy . --project-name=school-block --commit-dirty=true
