<div align="center">

# 🧱 Tetris Web

> A modern implementation of the classic Tetris game built with React 18, TypeScript, and Canvas 2D. Features complete SRS rotation system, 7-bag randomizer, DAS/ARR input, Lock Delay, T-Spin detection, and PWA offline support.

[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/tests-168%2F168%20passing-brightgreen?style=for-the-badge)](tetris/src/engine/__tests__)
[![PWA](https://img.shields.io/badge/PWA-installable-purple?style=for-the-badge)](https://web.dev/progressive-web-apps/)
[![Deploy](https://img.shields.io/badge/deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

**[English](README.md)** · **[中文](README.zh-CN.md)**

<br />

[Live Demo](#-live-demo) · [Features](#-features) · [Quick Start](#-quick-start) · [Documentation](#-documentation) · [Architecture](#-architecture)

</div>

---

## 🎮 Live Demo

**Play now:** [https://web-game-03-tetris.vercel.app](https://web-game-03-tetris.vercel.app)

> Note: If the demo link is not working, you can run the project locally using the [Quick Start](#-quick-start) guide.

---

## 🎯 Features

### Core Gameplay
- **🎯 Complete SRS Rotation System** — Super Rotation System with full wall kick tables for all 7 tetrominoes (I, O, T, S, Z, J, L), including corrected CCW kick tables following the [official Tetris wiki specification](https://tetris.wiki/Super_Rotation_System)
- **🎲 7-Bag Randomizer** — Modern randomization algorithm that ensures each bag of 7 tetrominoes contains exactly one of each piece, providing fair and predictable gameplay
- **👻 Ghost Piece** — Visual preview showing where the current piece will land, essential for strategic placement
- **📦 Hold System** — Store a piece for later use with the Hold mechanic (press `C` or `Shift`)
- **🔮 Next Queue** — Preview the next 5 upcoming pieces to plan your strategy
- **⚡ Progressive Difficulty** — Speed increases every 10 lines cleared, with 15 levels total
- **🏆 Advanced Scoring** — NES base scoring + T-Spin detection (3-corner rule) + Back-to-Back ×1.5 + Perfect Clear bonuses + Combo multipliers
- **⏱️ Lock Delay** — 500ms delay before locking with up to 15 resets on movement/rotation, following Tetris Guideline
- **🎮 DAS/ARR Input** — Configurable Delayed Auto Shift (167ms) and Auto Repeat Rate (33ms) for competitive play
- **💾 High Score Persistence** — Automatically saves your best score to localStorage
- **📱 PWA Support** — Installable, offline-capable Progressive Web App with Service Worker caching

### Technical Excellence
- **🎨 Canvas 2D Rendering** — Smooth 60 FPS rendering with DPI-aware scaling and responsive layout
- **🎵 Synthesized Audio** — 9 unique sound effects generated with Web Audio API (zero external assets) + volume control
- **⌨️ Keyboard & Touch Support** — Full desktop keyboard controls + mobile virtual D-pad (6 buttons)
- **📱 Responsive Design** — Adapts to different screen sizes with landscape optimization for mobile
- **🔒 Type Safety** — 100% TypeScript strict mode with Zod schema validation
- **✅ Comprehensive Testing** — 168 unit tests covering all core game logic, SRS kicks, DAS/ARR, scoring, and lock delay
- **🎭 Three-Layer Architecture** — Clean separation between UI (React), State (Zustand), and Engine (Pure TypeScript)
- **♿ Accessibility** — ARIA labels, dialog roles, and `prefers-reduced-motion` support

---

## 🎲 Gameplay Mechanics

### Tetrominoes
The game features the standard 7 tetrominoes:

```
I-piece:  ████        O-piece:  ██        T-piece:  ███
          (4 cells)             ██                  █

S-piece:   ██         Z-piece:  ██        J-piece:  █
           ██                   ██                  ███
                                                    █

L-piece:      █       (Each piece has 4 rotation states)
            ███
            █
```

### SRS Rotation System
- **Wall Kicks** — When rotation is blocked, the system tests 5 offset positions (or 5 special positions for I-piece) before rejecting the rotation
- **Rotation States** — Each piece has 4 rotation states (0°, 90°, 180°, 270°)
- **CW & CCW Kicks** — Independent kick tables for clockwise and counter-clockwise rotation, strictly following the [official Tetris Guideline](https://tetris.wiki/Tetris_Guideline)

### Scoring
| Action | Points | Formula |
|--------|--------|---------|
| Single (1 line) | 100 × level | Base score |
| Double (2 lines) | 300 × level | 3× single |
| Triple (3 lines) | 500 × level | 5× single |
| Tetris (4 lines) | 800 × level | 8× single |
| T-Spin Single | 800 × level | T-Spin bonus |
| T-Spin Double | 1200 × level | T-Spin bonus |
| T-Spin Triple | 1600 × level | T-Spin bonus |
| Back-to-Back | ×1.5 | Consecutive Tetris/T-Spin |
| Perfect Clear | 800-2000 × level | Board cleared |
| Combo Bonus | 50 × combo × level | Consecutive line clears |
| Soft Drop | 1 per cell | Per cell dropped |
| Hard Drop | 2 per cell | Per cell dropped |

### Speed Curve
| Level | Lines Required | Gravity (ms/cell) |
|-------|----------------|-------------------|
| 1 | 0-9 | 1000 |
| 2 | 10-19 | 793 |
| 3 | 20-29 | 618 |
| ... | ... | ... |
| 15 | 140+ | 17 (maximum speed) |

Formula: `gravity = max(17, 1000 × 0.89^(level-1))`

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0

### Installation

```bash
# Clone the repository
git clone git@github.com:NOSOLUTIONLOVE/Web_Game_03_Tetris.git
cd Web_Game_03_Tetris/tetris

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open at `http://localhost:5173`

### Build for Production

```bash
# Type check
npm run type-check

# Lint code
npm run lint

# Run tests
npm run test

# Build production bundle
npm run build

# Preview production build
npm run preview
```

The optimized bundle will be in the `dist/` directory (~140KB gzipped) with PWA Service Worker.

### PWA Installation
- **Desktop** — Click the install icon in the browser address bar
- **Mobile** — Use "Add to Home Screen" from the browser menu
- **Offline** — The game works fully offline after first visit

---

## 🎹 Controls

### Keyboard Controls

| Key | Action |
|-----|--------|
| `←` / `A` | Move left |
| `→` / `D` | Move right |
| `↓` / `S` | Soft drop (accelerate descent) |
| `↑` / `W` / `X` | Rotate clockwise |
| `Z` | Rotate counter-clockwise |
| `Space` | Hard drop (instant drop) |
| `C` / `Shift` | Hold piece |
| `P` / `Esc` | Pause/Resume |
| `R` | Restart game |
| `M` | Toggle mute |
| `Enter` | Start/Confirm |

### Mobile Controls (Virtual D-Pad)

Touch devices automatically display a virtual D-pad at the bottom of the screen:

| Button | Action |
|--------|--------|
| ◀ | Move left |
| ▶ | Move right |
| ▼ | Soft drop |
| ↻ | Rotate |
| HOLD | Hold piece |
| ⤓ | Hard drop |

**Mobile Tips:**
- Rotate device to landscape for best experience
- Canvas automatically adapts to screen width
- DAS/ARR supports long-press for continuous movement

---

## 🛠️ Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Build Tool** | Vite | 5.x | Lightning-fast HMR and optimized builds |
| **Framework** | React | 18.3 | Component-based UI library |
| **Language** | TypeScript | 5.4 | Static type checking and IntelliSense |
| **Styling** | Tailwind CSS | 3.4 | Utility-first CSS framework |
| **UI Components** | shadcn/ui | latest | High-quality Radix UI components |
| **State Management** | Zustand | 4.5 | Lightweight, TypeScript-first state management |
| **Animation** | Framer Motion | 11.3 | Production-ready animations |
| **Icons** | Lucide React | 0.408 | Beautiful consistent icons |
| **Rendering** | Canvas 2D | Native API | High-performance game rendering |
| **Testing** | Vitest | 1.6 | Vite-native unit testing framework |
| **Test DOM** | happy-dom | 14 | Lightweight DOM implementation |
| **Validation** | Zod | 3.23 | TypeScript-first schema validation |
| **PWA** | vite-plugin-pwa | 1.3 | Service Worker + manifest generation |
| **Deployment** | Vercel | — | Zero-config deployment platform |

### Why These Choices?

**Vite + React 18** — Modern tooling with instant hot module replacement and optimized production builds.

**TypeScript Strict Mode** — Catches bugs at compile time, improves code quality, and provides excellent IDE support.

**Canvas 2D** — Direct control over rendering for smooth 60 FPS gameplay without the overhead of a game engine.

**Zustand** — Minimal boilerplate, TypeScript-first, perfect for game state that needs to sync with the engine.

**Three-Layer Architecture** — Clean separation of concerns:
- **UI Layer** (React) — Handles rendering and user interactions
- **State Layer** (Zustand) — Manages game state and persistence
- **Engine Layer** (Pure TypeScript) — Framework-agnostic game logic

---

## 🏛️ Architecture

### Three-Layer Design

```
┌─────────────────────────────────────────────────────────┐
│  UI Layer (React + Framer Motion)                       │
│  ├─ TetrisGame (Canvas mount + Engine context)          │
│  ├─ HUD (score, level, lines, combo, B2B)               │
│  ├─ MainMenu / PauseOverlay / GameOverModal             │
│  ├─ SettingsPanel (DAS/ARR/volume/reset)                │
│  ├─ MobileControls (virtual D-pad)                      │
│  ├─ ErrorBoundary (crash recovery)                      │
│  └─ Footer (context-sensitive shortcuts)                │
└────────────────────┬────────────────────────────────────┘
                     │ Engine Context + Zustand
                     ▼
┌─────────────────────────────────────────────────────────┐
│  State Layer (Zustand + persist middleware)             │
│  └─ useGameStore: phase, score, highScore, level, ...   │
└────────────────────┬────────────────────────────────────┘
                     │ Callbacks (onPhaseChange, onStateChange, ...)
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Engine Layer (Pure TypeScript, framework-agnostic)     │
│  ├─ GameEngine (orchestration + state machine + loop)   │
│  ├─ Board (10×20 grid with 2-row buffer)                │
│  ├─ Tetromino (7 types + rotation + SRS wall kicks)     │
│  ├─ Bag (7-bag randomizer)                              │
│  ├─ ScoringSystem (NES + T-Spin + B2B + Perfect Clear)  │
│  ├─ LockDelayManager (500ms delay + 15 resets)          │
│  ├─ Renderer (DPI-aware Canvas 2D rendering)            │
│  ├─ Input (keyboard + DAS/ARR + touch)                  │
│  └─ AudioSystem (Web Audio synthesis + volume)          │
└─────────────────────────────────────────────────────────┘
```

### Key Design Decisions

**Engine Doesn't Subscribe to Store** — The 60 FPS game loop pushes events via callbacks, avoiding React re-render overhead during gameplay.

**Single Canvas Draw Per Frame** — Each frame clears and redraws the entire canvas for optimal performance with minimal elements.

**Fixed 60 Hz Time Step** — Physics simulation is decoupled from frame rate, ensuring consistent gameplay across devices.

**Strict SRS Implementation** — 43 unit tests verify every wall kick case (CW + CCW) against the official specification.

**Config-Driven Architecture** — All gameplay parameters (DAS/ARR, Lock Delay, scoring tables) centralized in CONFIG.

### Data Flow

**Engine → UI (Event-Driven):**
```
GameEngine.tickGravity()
  ↓
lockCurrent() → findFullLines() → handleLineClear(rows)
  ↓
ScoringSystem.calculate() → callbacks.onStateChange(snapshot)
  ↓
React re-renders HUD (batched update)
```

**UI → Engine (Command-Driven):**
```
Keyboard event
  ↓
Input.handleKey(e, callbacks)
  ↓
callbacks.onAction('moveLeft')
  ↓
GameEngine.handleAction('moveLeft')
  ↓
tryMove(current, -1, 0) → board.isValidPosition(test)
  ↓ (true)
current.move(-1, 0) → pushState() → UI updates
```

---

## 📁 Project Structure

```
Web_Game_03_Tetris/
├── tetris/                              # Main project directory
│   ├── docs/                            # Project documentation (6 docs)
│   │   ├── 01-项目立项.md                # Project initiation
│   │   ├── 02-需求拆分.md                # Requirements breakdown
│   │   ├── 03-技术选型.md                # Technology selection
│   │   ├── 04-项目架构.md                # Architecture design
│   │   ├── 05-执行规划.md                # Execution planning
│   │   └── 06-部署指南.md                # Deployment guide
│   ├── public/                          # Static assets
│   │   ├── 404.html                     # Custom 404 page
│   │   └── favicon.svg                  # Site icon (PWA icon)
│   ├── src/
│   │   ├── components/                  # React UI components
│   │   │   ├── ui/                      # shadcn/ui components
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   └── switch.tsx
│   │   │   ├── ErrorBoundary.tsx        # Crash recovery boundary
│   │   │   ├── TetrisGame.tsx           # Canvas mount + Engine context
│   │   │   ├── HUD.tsx                  # Heads-up display
│   │   │   ├── MainMenu.tsx             # Main menu overlay
│   │   │   ├── PauseOverlay.tsx         # Pause screen
│   │   │   ├── GameOverModal.tsx        # Game over dialog with stats
│   │   │   ├── SettingsPanel.tsx        # Settings (DAS/ARR/volume)
│   │   │   ├── MobileControls.tsx       # Virtual D-pad for touch
│   │   │   ├── Overlays.tsx             # Overlay manager
│   │   │   └── Footer.tsx               # Keyboard shortcuts footer
│   │   ├── engine/                      # Pure TypeScript game engine
│   │   │   ├── __tests__/               # Unit tests (168 tests)
│   │   │   │   ├── Bag.test.ts
│   │   │   │   ├── Board.test.ts
│   │   │   │   ├── GameEngine.test.ts
│   │   │   │   ├── Input.test.ts
│   │   │   │   ├── LockDelayManager.test.ts
│   │   │   │   ├── ScoringSystem.test.ts
│   │   │   │   └── Tetromino.test.ts
│   │   │   ├── GameEngine.ts            # Main game loop + state machine
│   │   │   ├── Board.ts                 # Grid logic (10×20 + buffer)
│   │   │   ├── Tetromino.ts             # Piece entity + rotation
│   │   │   ├── tetrominoes.ts           # 7 tetromino shapes
│   │   │   ├── srs.ts                   # SRS wall kick tables (CW + CCW)
│   │   │   ├── Bag.ts                   # 7-bag randomizer
│   │   │   ├── ScoringSystem.ts         # NES + T-Spin + B2B + PC scoring
│   │   │   ├── LockDelayManager.ts      # Lock delay with reset limit
│   │   │   ├── Renderer.ts              # DPI-aware Canvas 2D rendering
│   │   │   ├── Input.ts                 # Keyboard + DAS/ARR + touch
│   │   │   └── LockDelayManager.ts      # Lock delay management
│   │   ├── lib/                         # Utility libraries
│   │   │   ├── audio.ts                 # Web Audio synthesis + volume
│   │   │   ├── storage.ts               # localStorage wrapper
│   │   │   └── utils.ts                 # Utility functions
│   │   ├── store/
│   │   │   └── useGameStore.ts          # Zustand global state
│   │   ├── config/
│   │   │   └── index.ts                 # CONFIG + Zod schemas
│   │   ├── App.tsx                      # Root component
│   │   ├── main.tsx                     # Entry point
│   │   └── index.css                    # Global styles
│   ├── components.json                  # shadcn/ui configuration
│   ├── index.html                       # HTML entry (PWA meta tags)
│   ├── package.json                     # Dependencies + scripts
│   ├── tsconfig.json                    # TypeScript configuration
│   ├── vite.config.ts                   # Vite config (PWA + chunk split)
│   ├── tailwind.config.ts               # Tailwind configuration
│   ├── postcss.config.cjs               # PostCSS configuration
│   ├── vercel.json                      # Vercel deployment config
│   └── README.md                        # Project README (Chinese)
├── PRD-俄罗斯方块.md                     # Product requirements document
└── README.md                            # Project documentation (this file)
```

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)
npm run preview          # Preview production build

# Code Quality
npm run type-check       # TypeScript type checking
npm run lint             # ESLint code checking
npm run lint:fix         # Auto-fix ESLint errors
npm run format           # Format code with Prettier

# Testing
npm run test             # Run unit tests once
npm run test:watch       # Run tests in watch mode

# Build
npm run build            # Build for production (includes PWA SW)
```

### Quality Gates

The project enforces strict quality standards:

- ✅ **TypeScript** — 0 errors in strict mode
- ✅ **ESLint** — 0 errors, follows project conventions
- ✅ **Tests** — 168/168 tests passing
- ✅ **Build** — Successful production build (~140KB gzipped)

---

## ✅ Testing

### Test Coverage

The project includes **168 comprehensive unit tests** covering:

- **Bag Randomizer** — 7-bag algorithm correctness (9 tests)
- **Board Logic** — Grid operations, line clearing, T-Spin detection, collision (29 tests)
- **Tetromino** — Movement, rotation, SRS CW + CCW wall kick values (43 tests)
- **Input** — DAS/ARR timing, left/right key exclusivity, soft drop, key dedup (10 tests)
- **ScoringSystem** — NES scoring, T-Spin, B2B chains, Perfect Clear, combos (30 tests)
- **LockDelayManager** — Delay, reset, reset limit (12 tests)
- **GameEngine** — State machine, scoring, hold, lock delay, hard drop, game over (35 tests)

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx vitest src/engine/__tests__/GameEngine.test.ts
```

### Test Philosophy

- **No React Dependencies** — Engine tests don't require React or DOM
- **happy-dom Stubs** — Lightweight DOM implementation for Canvas and AudioContext
- **Public API Testing** — Tests use public methods, not internal state
- **Edge Case Coverage** — Tests verify boundary conditions and error states
- **Fake Timers** — DAS/ARR and lock delay tests use vitest fake timers for deterministic timing

---

## 🚀 Deployment

### Deploy to Vercel

This project is configured for zero-config deployment on Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repository to [Vercel](https://vercel.com) for automatic deployments.

### Manual Deployment

```bash
# Build production bundle
npm run build

# Deploy the 'dist' directory to any static hosting
# - Vercel
# - Netlify
# - GitHub Pages
# - AWS S3 + CloudFront
# - Any static file server
```

### PWA Configuration

The project uses `vite-plugin-pwa` for Progressive Web App support:

- **Service Worker** — Auto-generated, precaches all static assets
- **Manifest** — Auto-generated `manifest.webmanifest` with app metadata
- **Offline** — Full offline support after first visit
- **Installable** — Can be installed to desktop/home screen

### Vercel Configuration

The `vercel.json` file includes SPA routing rewrites:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 📖 Documentation

The project includes comprehensive documentation (in Chinese):

| Document | Description |
|----------|-------------|
| [01 - Project Initiation](tetris/docs/01-项目立项.md) | Project motivation, goals, and scope |
| [02 - Requirements Breakdown](tetris/docs/02-需求拆分.md) | Task list and PRD mapping |
| [03 - Technology Selection](tetris/docs/03-技术选型.md) | Technology stack decisions and rationale |
| [04 - Architecture Design](tetris/docs/04-项目架构.md) | Code organization and module design |
| [05 - Execution Planning](tetris/docs/05-执行规划.md) | Implementation roadmap and milestones |
| [06 - Deployment Guide](tetris/docs/06-部署指南.md) | Vercel deployment manual |
| [PRD (Product Requirements)](PRD-俄罗斯方块.md) | Complete product requirements document |

---

## 🎓 Learning Outcomes

This project demonstrates mastery of:

### Game Development Concepts
- **SRS Rotation System** — Industry-standard tetromino rotation with CW + CCW wall kicks
- **7-Bag Randomizer** — Fair random piece generation algorithm
- **T-Spin Detection** — 3-corner rule for competitive T-Spin recognition
- **Lock Delay** — Modern Tetris Guideline lock delay with reset limit
- **DAS/ARR** — Competitive input system with configurable timing
- **Collision Detection** — AABB (Axis-Aligned Bounding Box) collision system
- **Line Clear Algorithm** — Efficient grid row detection and removal
- **Game State Machine** — Menu → Playing → Paused → Game Over transitions
- **Fixed Time Step Loop** — Decoupling physics from frame rate

### Frontend Engineering
- **React 18** — Modern React with hooks and context
- **TypeScript Strict Mode** — Type-safe code with zero `any` types
- **Canvas 2D Rendering** — DPI-aware direct pixel control for game graphics
- **Web Audio API** — Synthesized sound effects with volume control
- **Zustand State Management** — Lightweight, TypeScript-first state with persistence
- **PWA** — Service Worker, manifest, offline support
- **Responsive Design** — Adapting to different screen sizes and input methods
- **Accessibility** — ARIA labels, dialog roles, reduced motion support

### Software Quality
- **Unit Testing** — 168 tests with comprehensive coverage of core logic
- **Code Organization** — Clean three-layer architecture with extracted subsystems
- **Documentation** — Comprehensive project documentation
- **Performance Optimization** — 60 FPS rendering with batched state updates and React.memo

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Tetris Wiki](https://tetris.wiki/)** — Comprehensive documentation of Tetris mechanics
- **[Tetris Guideline](https://tetris.wiki/Tetris_Guideline)** — Official game specifications
- **[Jstris](https://jstris.jezevec10.com/)** — Reference implementation for modern Tetris
- **[Vite](https://vitejs.dev/)** — Lightning-fast build tool
- **[React](https://react.dev/)** — UI component framework
- **[Zustand](https://github.com/pmndrs/zustand)** — Lightweight state management
- **[vite-plugin-pwa](https://vite-pwa-org.netlify.app/)** — PWA plugin for Vite

---

## 📞 Contact & Support

- **GitHub Issues** — [Report bugs or request features](https://github.com/NOSOLUTIONLOVE/Web_Game_03_Tetris/issues)
- **Live Demo** — [Play the game online](https://web-game-03-tetris.vercel.app)

---

<div align="center">

**If this project helps you, please give it a ⭐ Star!**

[GitHub](https://github.com/NOSOLUTIONLOVE/Web_Game_03_Tetris) · [Live Demo](https://web-game-03-tetris.vercel.app) · [Issue Feedback](https://github.com/NOSOLUTIONLOVE/Web_Game_03_Tetris/issues)

</div>
