# Contributing to School LMS

Thank you for your interest in contributing. This repository contains two
independent applications:

- **`web/`** — Next.js web app (frontend + API)
- **`mobile/`** — React Native (Expo) mobile app

## Getting started

1. Fork and clone the repository.
2. Choose the app you are working on (`web` or `mobile`).
3. Install dependencies with **pnpm** inside that folder only:

```bash
cd web    # or cd mobile
pnpm install
```

4. Copy environment files and configure local settings:

```bash
# Web
cp .env.example .env.local

# Mobile
cp .env.example .env
```

5. Run the app:

```bash
# Web
pnpm dev

# Mobile
pnpm start
```

See each folder's README for database, Docker, and Expo setup details.

## Development guidelines

- Follow the existing layout: **`app/`** for routes, **`src/`** for application code.
- Match naming and patterns used in the surrounding files.
- Keep changes focused; avoid unrelated refactors in the same pull request.
- Run type checks before submitting:

```bash
pnpm run typecheck
```

- For web changes, verify the build when touching core infrastructure:

```bash
pnpm run build
```

## Upgrading dependencies

Each app manages its own `package.json`. To upgrade packages in one app:

```bash
cd web    # or mobile
pnpm run upgrade
```

For mobile, the upgrade script also runs `expo install --fix` to align Expo SDK packages.

## Pull requests

1. Create a branch from the default branch.
2. Write clear commit messages describing **why** the change was made.
3. Update documentation if behavior or setup steps change.
4. Open a pull request with:
   - Summary of changes
   - Which app is affected (`web`, `mobile`, or both)
   - Steps to test

## Reporting issues

- **Bugs & features:** Open a GitHub issue with steps to reproduce, expected vs actual behavior, and environment (OS, Node version, pnpm version).
- **Security vulnerabilities:** Do **not** open a public issue. See [SECURITY.md](./SECURITY.md).

## Code of conduct

This project follows our [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it.
