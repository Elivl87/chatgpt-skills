Rebuild: git clone https://github.com/pablodelucca/pixel-agents, checkout UPSTREAM_COMMIT, `git apply secondquest-fork.patch`,
remove "workspaces" from the root package.json, `npm install --ignore-scripts` in webview-ui, then in webview-ui:
`npx tsx sqtools/decode-assets.ts public/assets <out>/office-data.json` and `npx vite build -c sqtools/vite.sq.config.ts`
(outputs ../dist/sq/pixel-office.{js,css,ttf}); the page is sqtools/page/index.html.
