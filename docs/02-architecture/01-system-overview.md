# Architecture Overview

## 1. High-Level Diagram
`[User Device (PWA)] <--> [Service Worker Cache] <--> [Google Gemini API] / [OSRM API]`

## 2. Core Components

### A. Frontend (Client)
- **Framework:** React 19 (Vite).
- **State Management:** `AppContext` (React Context API).
  - chosen for simplicity over Redux due to moderate state complexity.
- **Routing:** `react-router-dom` (HashRouter for simplified static hosting).

### B. AI Services Layer (`geminiService.ts`)
- **Text/Reasoning:** `gemini-2.5-flash` (Speed) and `gemini-3-pro-preview` (Thinking/Deep Reasoning).
- **Vision:** `gemini-2.5-flash` (Image analysis).
- **Audio/Live:** `gemini-live` (WebSockets via SDK) for real-time conversation.
- **Grounding:** Google Search & Maps Grounding for factual location data.

### C. Data Persistence
- **Storage Strategy:** `localStorage`.
- **Reasoning:** 
  1. **Privacy:** Medical data stays on device.
  2. **Reliability:** Zero latency, works offline.
  3. **Cost:** No backend database costs.

## 3. Key Decisions (ADR Summary)
- **ADR-001:** Use **Tailwind** for styling to ensure small CSS bundle size and rapid UI iteration.
- **ADR-002:** Use **Client-Side AI** (API Key in Env) for MVP. Enterprise version will move to Proxy Server for key protection.
- **ADR-003:** Use **Leaflet** over Google Maps JS API for cost control and offline tile caching capabilities.
