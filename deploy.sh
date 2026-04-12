export CLOUDFLARE_API_TOKEN=cfut_jXircHSCDLZ91E17JGMPBdPb9rt6rNCivA9xAEMP890794f2
git add .
git commit -m "update"
git push origin main
npx wrangler pages deploy . --project-name=school-block --commit-dirty=true
