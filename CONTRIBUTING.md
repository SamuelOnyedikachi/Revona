# Contributing to ReVora

Thank you for your interest in contributing! ReVora is open-source and welcomes contributions
from developers, designers, researchers, and circular economy practitioners.

## Getting started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/revora.git`
3. Follow the [Quick start](README.md#quick-start-local) guide
4. Create a branch: `git checkout -b feature/your-feature-name`

## Branch naming

- `feature/` — new features
- `fix/` — bug fixes
- `docs/` — documentation only
- `test/` — test additions or fixes
- `i18n/` — translations (Yoruba, Igbo, Hausa welcome!)

## Code style

- JavaScript (ES2022+), no TypeScript required
- ESLint + Prettier config is included — run `npm run lint` before committing
- React functional components + hooks only (no class components)
- MUI for all UI components — avoid inline styles except for dynamic values

## Pull request checklist

- [ ] Tests pass: `npm test` in both `server/` and `client/`
- [ ] New features include tests
- [ ] No console.log left in production paths
- [ ] PR description explains **what** and **why**

## Priority contribution areas

- 🌍 **i18n:** Yoruba, Igbo, and Hausa translations (`client/src/i18n/`)
- 📱 **PWA:** Service worker for offline listing browsing
- 📲 **SMS fallback:** Africa's Talking / Termii integration for low-connectivity users
- 📊 **Analytics:** Monthly impact trend data from real DB aggregations
- ♿ **Accessibility:** WCAG 2.1 AA audit and fixes
- 🔔 **Push notifications:** Web Push API for pickup reminders

## Code of conduct

Be kind and constructive. We are building infrastructure for food security and environmental
sustainability in Nigeria — every contribution matters.
