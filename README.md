# School LMS

A full school Learning Management System with a **Next.js web app** (dashboard + API) and a **React Native mobile app**.

| Folder | Stack | Run |
|--------|-------|-----|
| [`web/`](./web/) | Next.js · PostgreSQL · Prisma · Cloudinary | `pnpm dev` |
| [`mobile/`](./mobile/) | Expo · React Native · NativeWind | `pnpm start` |

Each app is **independent** — its own `package.json`, lockfile, and dependencies. Install and run from inside each folder.

## Quick start

### Web

```bash
cd web
pnpm install
cp .env.example .env.local
docker compose up -d
pnpm dev
```

### Mobile

```bash
cd mobile
pnpm install
cp .env.example .env
pnpm start
```

See [web/README.md](./web/README.md) and [mobile/README.md](./mobile/README.md) for full setup.

## Project layout

Both apps follow the same convention:

| Folder | Purpose |
|--------|---------|
| **`app/`** | Routes & screens (Next.js App Router / Expo Router) |
| **`src/`** | Components, hooks, lib, services, shared code |

## Governance

| Document | Description |
|----------|-------------|
| [LICENSE](./LICENSE) | MIT License |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Community standards |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute |
| [SECURITY.md](./SECURITY.md) | Reporting vulnerabilities |
| [CHANGELOG.md](./CHANGELOG.md) | Release history |

## License

This project is licensed under the [MIT License](./LICENSE).
