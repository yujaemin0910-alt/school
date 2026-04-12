export CLOUDFLARE_API_TOKEN=cfut_GBAcr4KnfLPxr5BhcCZYrItFCAZRY2X6l3dIbXwcdbf008bf
git add .
git commit -m "update"
git push origin main
npx wrangler pages deploy . --project-name=school-block --commit-dirty=true
