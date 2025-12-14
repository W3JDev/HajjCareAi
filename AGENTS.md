# HajjCare AI Agent Guidelines

> **Primary Maintainer:** w3jdev (w3jdev.com)  
> **Context:** HajjCare is an accessibility-focused Progressive Web App (PWA) for elderly Hajj pilgrims. It uses React, TypeScript, Tailwind CSS, and Google Gemini AI.

## 1. Project Structure & Scope
- **Root-Level Architecture:** This project does **NOT** use a `src/` folder. All source code (`components/`, `pages/`, `services/`, `context/`, `hooks/`, `utils/`, `App.tsx`, `main.tsx`) resides in the root directory.
- **Tech Stack:**
  - **Framework:** React 18+ (Vite)
  - **Language:** TypeScript (Strict mode)
  - **Styling:** Tailwind CSS (Mobile-first, Dark mode support)
  - **AI:** Google GenAI SDK (`@google/genai`) - Models: `gemini-2.5-flash`, `gemini-3-pro-preview` (Thinking), `gemini-live` (WebRTC).
  - **Maps:** Leaflet (`react-leaflet`) + OSRM for routing + Gemini Grounding.
  - **State:** React Context API (`AppContext`).
  - **Storage:** LocalStorage (Offline-first architecture).

## 2. Coding Standards
### TypeScript & React
- **Functional Components:** Use `export default function ComponentName() {}`.
- **Typing:** Explicitly type all props and state interfaces in `types.ts` or locally if isolated.
- **Hooks:** Ensure custom hooks are prefixed with `use`.
- **Null Safety:** Use optional chaining (`?.`) and nullish coalescing (`??`) aggressively.

### Styling (Tailwind)
- **Mobile-First:** Default classes are mobile. Use `md:`, `lg:` for larger screens.
- **Dark Mode:** Always implement `dark:` variants for every color class.
- **Safe Areas:** Use `pt-safe` and `pb-safe` utilities for mobile notches/home bars.

### Gemini AI Integration rules
- **Import:** Always `import { GoogleGenAI } from "@google/genai";`
- **Client:** Initialize via `new GoogleGenAI({ apiKey: process.env.API_KEY })`.
- **Streaming:** Use `generateContentStream` for long text.
- **Thinking:** Use `gemini-3-pro-preview` with `thinkingConfig` for complex religious queries.
- **Live API:** Handle WebRTC audio strictly via `utils/audio.ts` helpers.

## 3. Boundaries & "Do Not Touch"
- **API Keys:** NEVER hardcode API keys. Use `process.env.API_KEY`.
- **manifest.json:** Do not modify PWA configuration without explicit instruction.
- **Service Worker:** Do not modify caching strategies in `service-worker.js` unless fixing offline bugs.

## 4. Workflows
- **Refactoring:** When refactoring, ensure existing features (SOS, Translation) remain functional offline.
- **New Features:** 
  1. Define types in `types.ts`.
  2. Create service methods in `services/`.
  3. Create UI in `pages/` or `components/`.
  4. Register route in `App.tsx`.

## 5. Commands
- **Dev Server:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`
