# Security Policy

## Supported versions

Security fixes are provided for the latest release on the default branch.

| Component | Location | Notes |
|-----------|----------|--------|
| Web API & dashboard | `web/` | Next.js + Prisma |
| Mobile app | `mobile/` | Expo + React Native |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

If you discover a security issue, report it privately to:

**security@your-school-domain.com** (replace with your security contact)

Include:

- Description of the vulnerability
- Steps to reproduce
- Affected component (`web` or `mobile`)
- Potential impact
- Suggested fix (if any)

We aim to acknowledge reports within **3 business days** and will work with you on a coordinated disclosure timeline.

## Security practices for contributors

- Never commit secrets (`.env`, API keys, database URLs with credentials, Cloudinary keys, Stripe keys).
- Use `.env.example` files as templates only — no real values.
- Validate and sanitize all user input on API routes.
- Follow least-privilege for role-based access (admin, teacher, student, etc.).
- Keep dependencies updated via `pnpm run upgrade` in each app folder.
- Run `pnpm audit` periodically in `web/` and `mobile/`.

## Sensitive data

This system may process student, staff, and financial data. Treat all production data as confidential and comply with your institution's data protection policies (e.g. FERPA, GDPR where applicable).
