export CLOUDFLARE_API_TOKEN=cfut_5rxnm57FEfxUmJxeULmXSTmWR56i8L1OYISCmUcNe9a141d9
git add .
git commit -m "update"
git push origin main
npx wrangler pages deploy . --project-name=school-block --commit-dirty=true
