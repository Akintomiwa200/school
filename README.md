# School LMS

Two **independent** projects:

| Folder | Stack |
|--------|-------|
| [`web/`](./web/) | Next.js · PostgreSQL · Prisma · Cloudinary |
| [`mobile/`](./mobile/) | React Native · Expo · NativeWind |

Each has its own `package.json` — install and run separately.

## Layout convention

Both projects use the same pattern:

- **`app/`** — routes & screens (Next.js App Router / Expo Router)
- **`src/`** — components, hooks, lib, services, shared code

### Web
```bash
cd web && npm install && npm run dev
```

### Mobile
```bash
cd mobile && npm install && npm run dev
```

See each folder's README for full setup.
"# school" 
