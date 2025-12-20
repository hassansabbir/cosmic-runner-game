# 🚀 Cosmic Runner

A fast-paced space shooter game built with **Next.js** and **HTML5 Canvas**.

![Cosmic Runner](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🎮 **Smooth Gameplay** - 60 FPS canvas rendering with responsive controls
- 🚀 **6 Unique Ships** - Choose from Fighter, Cruiser, Stealth, Tank, Speedster, and Destroyer
- 🎯 **Custom Targets** - Upload faces/images to use as asteroid targets
- ⚡ **Power-ups** - Shield, Rapid Fire, Laser, and Nuke
- 📈 **Progressive Upgrades** - Ship automatically upgrades as you score (6 levels)
- 🏆 **Kill Streaks** - Double Kill, Triple Kill, Rampage, Godlike!
- 🌌 **Dynamic Backgrounds** - Parallax stars, nebulae, and shooting stars
- 📱 **Mobile Support** - Touch controls for mobile devices

## 🎮 Controls

| Key     | Action               |
| ------- | -------------------- |
| ← →     | Move ship left/right |
| Space   | Fire projectiles     |
| Shift   | Dash (dodge enemies) |
| Esc / P | Pause game           |

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Rendering**: HTML5 Canvas
- **Styling**: CSS3 with custom animations
- **State Management**: React hooks with refs

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd newGame

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main game page
│   └── globals.css        # Global styles
├── components/
│   ├── Game/
│   │   └── GameCanvas.tsx # Main game canvas component
│   └── Menu/
│       ├── StartScreen.tsx
│       ├── GameOver.tsx
│       ├── ShipSelector.tsx
│       └── TargetManager.tsx
├── lib/
│   ├── gameEngine.ts      # Game logic and physics
│   ├── renderer.ts        # Canvas rendering
│   └── constants.ts       # Game configuration
├── hooks/
│   ├── useGameLoop.ts     # Game loop hook
│   └── useControls.ts     # Input handling hook
└── types/
    └── game.ts            # TypeScript interfaces
```

## 🎯 Game Mechanics

### Upgrade System

| Level | Score | Name    | Projectiles | Fire Rate |
| ----- | ----- | ------- | ----------- | --------- |
| 1     | 0     | Rookie  | 1           | 1.0x      |
| 2     | 500   | Veteran | 1           | 1.15x     |
| 3     | 1500  | Elite   | 2           | 1.3x      |
| 4     | 3000  | Ace     | 2           | 1.5x      |
| 5     | 5000  | Legend  | 3           | 1.7x      |
| 6     | 10000 | Godlike | 3           | 2.0x      |

### Power-ups

- 🛡️ **Shield** - Invincibility for 15 seconds
- ⚡ **Rapid Fire** - 3x fire rate
- 🔴 **Laser** - Piercing projectiles
- 💥 **Nuke** - Destroys all asteroids on screen

## 📄 License

MIT License - feel free to use this project for learning or your own games!

---

Made with ❤️ and lots of ☕
