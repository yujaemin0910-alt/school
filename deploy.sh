export CLOUDFLARE_API_TOKEN=cfut_mQmEarsmXqZxjKE3YL8EavnTLwR8nRexDoPdVbtEe0454ee9
git add .
git commit -m "update"
git push origin main
npx wrangler pages deploy . --project-name=school-block --commit-dirty=true
