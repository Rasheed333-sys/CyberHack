# CYBERHACK

**Browse Beyond. Stay Unseen.**

CyberHack is the frontend and software architecture foundation for a privacy-first AI browsing assistant. It's not a chatbot skin — it's a command-center UI for searching, researching, and browsing the web, built so real privacy and security infrastructure can be connected underneath it without a rewrite.

> **Status:** frontend + architecture only. AI, search, web retrieval, privacy relay, and security-analysis backends are **not implemented yet**. Everywhere the UI shows data from one of those systems, it is clearly mock/demo data — see [What's real vs. mock](#whats-real-vs-mock) below. CyberHack does not claim to provide absolute anonymity; it reduces exposure and is explicit about what is and isn't active.

---

## Tech stack

- React 18 + TypeScript (strict)
- Vite
- Tailwind CSS
- Zustand (state)
- React Router
- Framer Motion (sparing use — sidebar/drawer transitions only)
- Lucide icons

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

Other commands:

```bash
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build locally
npm run lint       # ESLint
```

Requires Node 18+.

---

## Project structure