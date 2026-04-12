export CLOUDFLARE_API_TOKEN=cfut_kGVMNMU12Fg1d7im1Rmo1PE8B0gveqji6dc9BTMZb0fc1559
git add .
git commit -m "update"
git push origin main
npx wrangler pages deploy . --project-name=school-block --commit-dirty=true
