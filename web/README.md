# School LMS — Web

Next.js web application with API backend.

**Stack:** Next.js 15 · PostgreSQL · Prisma · Cloudinary · NextAuth · Stripe · Resend

## Project layout

```
web/
├── app/                 # Next.js App Router (routes, pages, API)
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
├── src/                 # Application source (not routes)
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── shared/
│   ├── providers/
│   ├── styles/
│   └── types/
├── prisma/
├── public/
├── middleware.ts
├── docker-compose.yml
└── package.json
```

## Setup

```bash
npm install
cp .env.example .env.local
```

### Database (PostgreSQL)

```bash
docker compose up -d
npm run db:generate
npm run db:push
npm run db:seed
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Seed accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@school.com | Password123! |
| Admin | principal@school.com | Password123! |
| Accountant | accountant@school.com | Password123! |
| Teacher | teacher@school.com | Password123! |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:migrate` | Run migrations |
