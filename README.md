# Vibe coding template

A small [T3 Stack](https://create.t3.gg/)–style starter for learning **vibe coding** (building with AI): **Next.js (App Router)**, **TypeScript**, **Tailwind**, **tRPC**, and **MongoDB** via **Mongoose**. Secrets stay on the server; the browser talks only to tRPC.

## What you need installed

- [Node.js](https://nodejs.org/) (LTS is fine)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free cluster (or local MongoDB)

## Quick start

1. **Clone** this repository (or use it as a template on GitHub).

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set **`MONGODB_URI`** to your connection string from Atlas (Database → Connect → Drivers). Replace `<password>` and pick a database name in the path.

4. **Atlas checklist** (if you use the cloud)

   - Create a database user with a password.
   - In **Network Access**, add your IP or `0.0.0.0/0` for local learning (not for production).

5. **Run the app**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000). You should see a sidebar with navigation and placeholder pages.

## Project layout (where things go)

| Area | Path | Purpose |
|------|------|--------|
| Pages & layouts | `src/app/` | Routes and UI |
| tRPC routers | `src/server/api/routers/` | Server API and database access |
| Router registration | `src/server/api/root.ts` | Combines routers |
| Mongoose models | `src/server/db/models/` | Database shapes |
| DB connection | `src/server/db/connection.ts` | Single shared Mongo connection |
| Env validation | `src/env.js` | Safe list of environment variables |
| Business rules | `docs/business-rules/` | Regras de negócio e requisitos |
| AI rules (Cursor) | `.cursor/rules/` | Comportamento da assistente |
| AI hints (legacy) | `.cursorrules` | Índice rápido para a IA |

## Using Cursor (or another AI editor)

Open the folder in Cursor. Rules in **`.cursor/rules/`** teach the assistant to:

- Read `docs/business-rules/` before implementing
- Ask questions when requirements are unclear
- Suggest plan reviews and Git sync before risky changes
- **Explain every terminal command in plain language** (see `terminal-commands.mdc`)
- Explain changes in plain language for beginners

**Useful prompt references:**

```
@docs/project-context.md
@docs/business-rules/pendencies-kanban.md
```

Describe what you want in plain language; one feature at a time works best.

## Scripts

- `pnpm dev` — development server (Turbopack)
- `pnpm build` / `pnpm start` — production build and run
- `pnpm check` — lint + TypeScript check

## Stack reference

- [Next.js](https://nextjs.org/docs)
- [tRPC](https://trpc.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Mongoose](https://mongoosejs.com/docs/guide.html)

## Deploying

Use any host that supports Next.js (e.g. [Vercel](https://vercel.com)). Set **`MONGODB_URI`** in the host’s environment variables. For Docker or CI builds you can use `SKIP_ENV_VALIDATION` if needed; see [T3 env docs](https://env.t3.gg/docs/nextjs).

## License

Use freely for learning and as a template for your own projects.
