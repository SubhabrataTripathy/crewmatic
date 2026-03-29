# Contributing to Crewmatic

Thank you for your interest in contributing to Crewmatic! This guide will help you get started.

## Development Setup

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Quick Start

```bash
git clone https://github.com/SubhabrataTripathy/crewmatic.git
cd crewmatic
npm install
npm run dev
```

This starts both the Express server (`:3001`) and Vite frontend (`:5173`).

## Project Structure

```
crewmatic/
├── server/                  # Express backend
│   ├── index.ts            # Server entry
│   ├── db.ts               # SQLite schema
│   ├── seed.ts             # Demo data
│   ├── websocket.ts        # WebSocket server
│   ├── routes/             # REST API routes
│   └── services/           # Business logic
├── src/                     # React frontend
│   ├── lib/                # API client, WebSocket client
│   ├── stores/             # Zustand state management
│   ├── pages/              # Page components
│   └── components/         # Shared components
└── package.json
```

## How to Contribute

### Reporting Bugs

1. Check existing issues first
2. Create a new issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - OS + Node.js version

### Pull Requests

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit with conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
4. Push and open a PR against `main`
5. Describe your changes and link related issues

### Code Style

- TypeScript for all source files
- Use existing patterns in the codebase
- Keep components focused and reusable
- Write descriptive variable names

### Areas We Need Help

- 🔌 **Agent Adapters** — Connect real AI providers (Claude Code, OpenClaw, Codex)
- 🖥️ **Desktop Packaging** — Tauri v2 integration for native desktop app
- 🧪 **Testing** — Unit tests, E2E tests, API tests
- 📱 **Mobile** — Responsive design improvements
- 📖 **Documentation** — Guides, tutorials, examples
- 🌐 **i18n** — Internationalization support

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
