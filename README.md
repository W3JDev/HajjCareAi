# 🕋 HajjCare - AI Pilgrim Companion

**HajjCare** is an accessibility-first Progressive Web App (PWA) designed to assist elderly Hajj pilgrims. It leverages Multimodal AI (Google Gemini) to bridge language barriers, manage health, navigate holy sites, and provide real-time religious guidance.

![Status](https://img.shields.io/badge/Status-Beta-blue) ![Stack](https://img.shields.io/badge/Stack-React%20|%20TypeScript%20|%20Gemini-green)

## 🚀 Quick Start

1.  **Clone & Install**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Ensure `process.env.API_KEY` is available with a valid Google GenAI API key.

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📚 Documentation

The complete enterprise documentation is located in the [`/docs`](./docs) folder:

*   **[Product Vision & Pitch](./docs/01-product/01-vision-pitch.md)**: Why this exists and who it serves.
*   **[Product Requirements (PRD)](./docs/01-product/02-prd.md)**: Detailed feature specifications.
*   **[Architecture](./docs/02-architecture/01-system-overview.md)**: System design, data models, and AI integration.
*   **[Engineering](./docs/03-engineering/01-setup-standards.md)**: Setup guides and coding standards.
*   **[Changelog](./docs/04-process/01-changelog.md)**: Version history.

## ✨ Core Features

*   **Multilingual AI Translation:** Voice-to-Voice and Camera-based translation (Bengali, English, Malay, Urdu, Turkish, Indonesian).
*   **Live Assistant:** Real-time conversational AI with "Family Member" persona using Gemini Live API.
*   **Offline Navigation:** Custom map markers for Kaaba, Mina, Arafat with OSRM routing.
*   **Health Tracker:** Monitor hydration, medications, and generate AI health summaries.
*   **Ritual Guide:** Step-by-step Hajj/Umrah guides, Duas, and Tawaaf counter.
*   **Emergency SOS:** One-tap location sharing and medical info display.

## 🤝 Contributing

Please read [AGENTS.md](./AGENTS.md) for coding rules and AI-agent guidelines.

---

### 👨‍💻 Crafted by w3jdev

**w3jdev** · [w3jdev.com](https://w3jdev.com) · [GitHub](https://github.com/w3jdev) · [LinkedIn](https://linkedin.com/in/w3jdev)

_Enterprise-grade AI solutions engineered with precision._
