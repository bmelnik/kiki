# Kiki agent guidance

## Project shape

- This is a Next.js 14 + React 18 + TypeScript app served through the custom Express entrypoint in [server.js](server.js).
- The customer-facing menu is in [src/app/page.tsx](src/app/page.tsx); admin UI and login are under [src/app/admin/](src/app/admin/).
- API routes live under [src/app/api/](src/app/api/). Keep authentication checks in the route and rely on [src/middleware.ts](src/middleware.ts) to protect `/admin/:path*` pages.
- Shared menu types and fallback data are in [src/lib/mainMenuData.ts](src/lib/mainMenuData.ts); grouping rules are in [src/lib/menuGrouping.ts](src/lib/menuGrouping.ts).

## Commands

- `npm run dev` starts the local app through `server.js` on port 3000.
- `npm run lint` runs the Next.js ESLint checks.
- `npm run build` first runs [scripts/fetch-menu-from-blob.js](scripts/fetch-menu-from-blob.js), then runs `next build`.
- `npm start` serves the production build through `server.js`.
- There is no test script in `package.json`; use lint and a local smoke check for UI or route changes.

## Menu data and deployment

- Menu content is Hebrew and the UI is RTL. Preserve existing Hebrew text, `dir="rtl"`, and the nested category/subcategory/item shape unless the task explicitly changes the data contract.
- The public menu is static at runtime: [src/app/api/menu/route.ts](src/app/api/menu/route.ts) serves data bundled from `data/menu.json` during the build.
- Admin saves write to Vercel Blob through [src/lib/menuStorage.ts](src/lib/menuStorage.ts), then optionally trigger `VERCEL_DEPLOY_HOOK_URL` so the public menu is rebuilt.
- Never add production writes to `process.cwd()/data` or assume the serverless filesystem is writable. Local JSON writes are development-only.
- Production admin menu updates require `BLOB_READ_WRITE_TOKEN`; `ADMIN_PASSWORD` and `SESSION_SECRET` are required for admin authentication. Treat these as environment variables, never hard-code or commit them.

## Change and validation habits

- Keep changes scoped to the owning route, component, or library. Preserve the existing Tailwind styling and public API shapes.
- For menu changes, validate both the admin save path and the public rebuild/static-data path when relevant; a successful Blob write alone does not update the public menu until a deploy/build occurs.
- After code changes, run the narrowest relevant check first, then `npm run lint`; for build/data-flow changes also run `npm run build` when the required Blob environment is available.
- Use [README.md](README.md) for the basic local startup reference; do not duplicate general Next.js documentation here.
