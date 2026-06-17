# School LMS — Mobile

React Native mobile app using Expo Router and NativeWind.

**Stack:** Expo · React Native · NativeWind · TanStack Query

## Project layout

```
mobile/
├── app/                 # Expo Router (screens & navigation)
│   ├── (auth)/
│   ├── (tabs)/
│   ├── _layout.tsx
│   └── index.tsx
├── src/                 # Application source (not routes)
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── shared/
│   ├── providers/
│   ├── store/
│   ├── config/
│   └── styles/
├── assets/
└── package.json
```

## Setup

```bash
npm install
cp .env.example .env
```

Set `EXPO_PUBLIC_API_URL` to your web API (e.g. `http://localhost:3000/api/v1`).

## Run

```bash
npm run dev        # Expo dev server
npm run android    # Android emulator
npm run ios        # iOS simulator
```
