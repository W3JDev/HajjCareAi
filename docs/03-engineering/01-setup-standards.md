# Engineering Guide

## 1. Setup & Installation
1.  **Node Version:** v18 or higher.
2.  **API Keys:** Create a `.env` file (or set in deployment vars):
    ```
    API_KEY=AIzaSy...
    ```
    *Note: Get key from AI Studio.*

## 2. Directory Structure
*   `components/` - Reusable UI widgets (Header, Navigation, Modal).
*   `pages/` - Full screen views (Dashboard, MapView).
*   `context/` - Global state providers.
*   `services/` - External API logic (AI, Maps).
*   `hooks/` - Custom React hooks.
*   `utils/` - Helpers (Audio decoding, Formatting).
*   `docs/` - Project documentation.

## 3. Coding Standards
*   **Linting:** ESLint standard configuration.
*   **Formatting:** Prettier.
*   **Components:** 
    *   Keep components under 200 lines.
    *   Extract logic to custom hooks if complex.
*   **Performance:**
    *   Lazy load heavy routes (Map, Live Assistant).
    *   Memoize complex calculations in `MapView`.

## 4. Deployment
*   **Platform:** Vercel / Netlify / GitHub Pages.
*   **Build Command:** `npm run build`.
*   **Output Dir:** `dist`.
*   **Environment:** Ensure `API_KEY` is set in the build environment variables.
