# SuperOffer — Monorepo

SuperOffer is a reverse education marketplace connecting students, universities, lenders, and consultancies.

## Repository Structure

```text
superoffer/
├── frontend/    # Angular 22 standalone application
├── backend/     # Node.js / Express 5 backend with MongoDB & Auth
└── README.md    # Documentation
```

## Quick Start

### Prerequisites
- Node.js >= 22.x
- npm >= 10.x

### Installation

Install dependencies for all workspaces:
```bash
npm install
```

### Running Locally

**Run Backend:**
```bash
npm run start:backend
# or for auto-reload dev mode:
npm run dev:backend
```

**Run Frontend:**
```bash
npm run start:frontend
```

### Build & Test

**Build Frontend:**
```bash
npm run build
```

**Run Backend Tests:**
```bash
npm run test
```

## Features
- **Student Profile & Discovery**: Single structured student profile with permission-based discovery.
- **Institutional Onboarding & Approvals**: Admin queue for verifying universities, banks, and consultancies.
- **Authentication Logs**: Detailed audit logging of logins, logouts, session duration, user agents, IP addresses, and CSV export.
- **Dynamic Marketplace Data**: Public stats, partner universities, degrees, and testimonials served dynamically from the backend API.
- **Official Branding**: Integrated SuperOffer brand identity across header, footer, auth, admin panel, and browser favicon.
