# alibaba_scammers

Stack: Next.js 16 + React 19, Drizzle ORM (Neon serverless Postgres), Tailwind CSS v4.

## Package manager: pnpm — do NOT use npm or yarn

This project uses **pnpm**. Source of truth is `pnpm-lock.yaml`, and pnpm is pinned via the
`packageManager` field in `package.json` (corepack).

| Task | Command |
| --- | --- |
| Install deps | `pnpm install` |
| Add a dependency | `pnpm add <pkg>` (`-D` for dev) |
| Dev server | `pnpm dev` |
| Production build | `pnpm build` — run this to surface TypeScript type errors |
| Lint | `pnpm lint` |

### Why not `npm install`

Running `npm install` against pnpm's symlinked `node_modules` produces a **spurious
`ERESOLVE` error**: npm misreads a transitive dependency's own devDependency (e.g. `knip`,
declared by `@eslint-community/eslint-utils`) as a root dependency. It is **not** a real
dependency conflict — a clean-slate `npm install` (just `package.json`, empty `node_modules`)
resolves fine. The error only appears when npm is pointed at a pnpm-created tree, often
compounded by a stale `node_modules/.package-lock.json` left over from a prior npm run.

If `node_modules` ever gets into a bad state, reset it cleanly:

```bash
rm -rf node_modules && pnpm install
```
