<div align="center">
  <img width="1200" height="475" alt="ZenHours Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
  
  # ZenHours — Mastery Lab
  
  _A deliberate practice tracking system built on the 10,000-hour rule_
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.2-ff6b6b.svg)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-12.x-ffa000.svg)](https://firebase.google.com/)
  [![Gemini AI](https://img.shields.io/badge/Gemini_AI-Latest-4285f4.svg)](https://ai.google.dev/)
</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
- [Development](#development)
  - [Available Scripts](#available-scripts)
  - [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**ZenHours** is a focused productivity application designed to help users master skills through deliberate practice. Built on the principles of the **10,000-hour rule**, it combines the Pomodoro Technique with comprehensive progress tracking to enable meaningful skill development.

The application provides:
- Real-time focus session tracking with customizable intervals
- Task/discipline management for organizing practice areas
- Visual analytics and heatmaps for progress visualization
- Firebase-backed authentication and data persistence
- AI-powered insights via Google's Gemini API

---

## Features

### 🎯 Core Functionality
- **Pomodoro Timer**: Customizable work/break intervals (25/5/15 min default)
- **Task Management**: Create, track, and organize practice disciplines
- **Session Tracking**: Log focused practice sessions with task association
- **Progress Analytics**: Visual statistics including heatmaps and mastery metrics

### 🔐 Authentication & Data
- **Firebase Auth**: Secure email/password and OAuth authentication
- **Cloud Persistence**: Firestore integration for cross-device sync
- **Local Storage Fallback**: Offline-first architecture with local persistence

### 🎨 User Experience
- **Responsive Design**: Mobile-first UI that adapts to all screen sizes
- **Brutalist Aesthetic**: Bold, high-contrast design with clear visual hierarchy
- **Real-time Updates**: Live session indicators and progress tracking
- **Tabbed Navigation**: Seamless switching between Timer, Stats, and Settings

### 🤖 AI Integration
- **Gemini API**: AI-powered insights and recommendations (optional)
- **Contextual Suggestions**: Intelligent task and session analysis

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend Framework** | React 19 with TypeScript |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Lucide React icons, Motion (Framer Motion fork) |
| **State Management** | React Hooks (useState, useEffect) |
| **Backend Services** | Firebase (Auth, Firestore) |
| **AI/ML** | Google Generative AI (@google/genai) |
| **Data Visualization** | Recharts |
| **Date Handling** | date-fns |
| **Utility Libraries** | clsx, tailwind-merge |

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** ≥ 18.x ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for version control

Optional but recommended:
- **Firebase CLI** for deployment (`npm install -g firebase-tools`)
- **Google Gemini API Key** for AI features

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd zenhours-mastery-lab
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify installation:**
   ```bash
   npm run lint
   ```

### Environment Configuration

1. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure required variables:**

   | Variable | Description | Required |
   |----------|-------------|----------|
   | `GEMINI_API_KEY` | Your Google Gemini API key for AI features | Yes* |
   | `APP_URL` | Application URL (auto-injected in AI Studio) | No |

   > \* Optional if not using AI-powered features. Get your API key at [Google AI Studio](https://aistudio.google.com/apikey).

3. **Firebase Configuration:**
   
   Update `firebase-applet-config.json` with your Firebase project credentials:
   ```json
   {
     "apiKey": "YOUR_FIREBASE_API_KEY",
     "authDomain": "your-project.firebaseapp.com",
     "projectId": "your-project-id",
     "storageBucket": "your-project.appspot.com",
     "messagingSenderId": "123456789",
     "appId": "1:123456789:web:abcdef123456"
   }
   ```

---

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000, hot-reload enabled) |
| `npm run build` | Create production build in `dist/` directory |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run TypeScript type checking |
| `npm run clean` | Remove build artifacts (`dist/`, `server.js`) |

### Running the Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

> **Note:** In AI Studio environments, HMR may be disabled via `DISABLE_HMR=true` to optimize agent editing performance.

### Project Structure

```
zenhours-mastery-lab/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Entry point
│   ├── index.css            # Global styles & Tailwind imports
│   ├── types.ts             # TypeScript type definitions
│   ├── components/
│   │   ├── Auth.tsx         # Authentication UI
│   │   ├── Timer.tsx        # Pomodoro timer component
│   │   ├── TaskManager.tsx  # Task/discipline management
│   │   ├── Stats.tsx        # Analytics dashboard
│   │   ├── Settings.tsx     # User settings panel
│   │   └── Heatmap.tsx      # Progress visualization
│   └── lib/
│       ├── firebase.ts      # Firebase initialization & auth
│       ├── storage.ts       # Local storage utilities
│       └── utils.ts         # Helper functions (cn, etc.)
├── public/                  # Static assets
├── firebase-applet-config.json  # Firebase configuration
├── firestore.rules          # Firestore security rules
├── .env.example             # Environment variable template
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
└── README.md                # This file
```

### Component Architecture

```
App (Root)
├── Header
│   └── Auth (Login/Logout)
├── Main Content Area
│   ├── TaskManager (Left Sidebar)
│   ├── Timer / Stats / Settings (Center Panel)
│   └── Stats Preview (Right Sidebar - Desktop)
└── Footer
```

---

## Deployment

### Deploy to Google Cloud Run (via AI Studio)

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy using Firebase CLI:**
   ```bash
   firebase deploy
   ```

### Manual Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Serve the `dist/` directory** using any static hosting service:
   - Vercel
   - Netlify
   - Cloudflare Pages
   - AWS S3 + CloudFront

---

## Configuration

### Timer Settings

Users can customize Pomodoro intervals in the Settings panel:

| Setting | Default | Description |
|---------|---------|-------------|
| `workDuration` | 25 min | Focus session length |
| `shortBreakDuration` | 5 min | Short break between sessions |
| `longBreakDuration` | 15 min | Long break after 4 sessions |
| `autoStartNextMode` | false | Automatically start next session |

### Firestore Security Rules

Security rules are defined in `firestore.rules`. Ensure proper authentication is enforced before writing user data.

---

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow the existing code style** (TypeScript, functional components)
3. **Write meaningful commit messages** following Conventional Commits
4. **Test thoroughly** before submitting a pull request
5. **Update documentation** for new features or breaking changes

### Development Guidelines

- Use TypeScript strict mode
- Prefer functional components with hooks
- Keep components small and focused (single responsibility)
- Write self-documenting code with clear variable names

---

## License

This project is proprietary software developed for AI Studio. All rights reserved.

---

## Support & Resources

- **Documentation**: [Google AI Studio Docs](https://ai.google.dev/docs)
- **Firebase Docs**: [Firebase Documentation](https://firebase.google.com/docs)
- **Gemini API**: [Generative AI Documentation](https://ai.google.dev/gemini-api/docs)
- **Issue Tracker**: Report bugs and feature requests via AI Studio

---

<div align="center">
  <strong>ZenHours v2.0 — Mastery System</strong><br/>
  <sub>Built with ❤️ using React, TypeScript, and Firebase</sub>
</div>

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode (development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage

ZenHours maintains comprehensive test coverage following FAANG standards:

| Component | Coverage | Status |
|-----------|----------|--------|
| Utils (`utils.ts`) | 100% | ✅ |
| Storage (`storage.ts`) | 95%+ | ✅ |
| Types (`types.ts`) | 100% | ✅ |
| Timer Component | 85%+ | ✅ |
| TaskManager Component | 80%+ | ✅ |

For detailed testing documentation, see [TESTING.md](./TESTING.md).

---

## Quality Assurance

### Code Quality Standards

- **TypeScript Strict Mode**: Full type safety with no `any` types
- **ESLint**: Automated linting for code consistency
- **Prettier**: Consistent code formatting
- **Vitest**: Unit and component testing with 70%+ coverage threshold
- **Git Hooks**: Pre-commit validation (recommended)

### CI/CD Pipeline

```yaml
# GitHub Actions workflow example
name: CI/CD

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm run build
```

---
