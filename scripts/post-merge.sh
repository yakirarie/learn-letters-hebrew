#!/bin/bash
set -e

cd "$(dirname "$0")/.."

# This used to say "static site, no build steps required". That stopped being
# true when the app moved to Vite + React + TypeScript, so the check is now a
# real one: install, then typecheck and build.

if [ -f package-lock.json ]; then
  echo "Installing dependencies (npm ci)..."
  npm ci
else
  echo "No lockfile found; running npm install..."
  npm install
fi

echo "Verifying the build (tsc --noEmit && vite build)..."
npm run build

echo
echo "Post-merge setup complete."
echo "Deployment is handled by .github/workflows/deploy.yml on push to main."
echo "For local development run: npm run dev"
