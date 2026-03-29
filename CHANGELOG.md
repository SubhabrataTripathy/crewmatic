# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-29

### Added

- **Full-stack architecture** — Express backend + React frontend
- **SQLite database** with 7 tables: companies, agents, tasks, budgets, cost_entries, audit_log, goals, policies
- **REST API** with 14 endpoints for full CRUD operations
- **WebSocket server** for real-time event broadcasting (16 event types)
- **Heartbeat monitor** — Automatic agent health checking every 15 seconds
- **Audit logging** — Automatic activity tracking for all agent lifecycle events
- **Multi-company support** — Switch between companies in the sidebar
- **Dashboard** — Command center with metrics, spend trends, cost charts, agent status, live activity
- **Agent Management** — Hire/fire agents, heartbeat monitoring, status tracking, cost breakdown
- **Task Board** — Kanban view with 5 columns, inline task creation, status transitions via API
- **Budget Center** — Spending limits, budget gauges, per-agent cost breakdown, daily spend charts
- **Audit Trail** — Searchable, filterable activity log with type-based icons
- **Org Chart** — Interactive company hierarchy visualization
- **Settings** — Appearance, notifications, governance, API key configuration
- **Onboarding** — Two-step wizard with "skip to demo" option
- **Premium dark theme** — Glassmorphism design system with gradient accents
- **Goal tracking** — OKR-style progress bars on dashboard
