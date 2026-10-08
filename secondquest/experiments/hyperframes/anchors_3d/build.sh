#!/usr/bin/env bash
# Prepares assets/ (fonts, not in git) and bundles three.js + the relics + the scene into vendor/anchors.bundle.js.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p assets/fonts vendor
cp ../../../public/shared/fonts/{Anton-Regular,Inter-800}.woff2 assets/fonts/
[ -d node_modules/three ] || npm install --no-fund --no-audit --silent
npx esbuild src/scene.ts --bundle --format=iife --minify --target=chrome120 --outfile=vendor/anchors.bundle.js --log-level=warning
