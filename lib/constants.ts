// Game Constants and Configuration

import { GameConfig } from "@/types/game";

export const GAME_CONFIG: GameConfig = {
  canvasWidth: 800,
  canvasHeight: 600,
  shipSpeed: 8,
  baseAsteroidSpeed: 3,
  asteroidSpawnRate: 1500, // ms
  powerUpSpawnRate: 10000, // ms
  starCount: 150,
  maxParticles: 300,
};

export const COLORS = {
  // Ship colors
  shipBody: "#00fff5",
  shipGlow: "rgba(0, 255, 245, 0.5)",
  shipTrail: "#00fff5",

  // Asteroid colors
  asteroidFill: "#2a2a4a",
  asteroidStroke: "#4a4a6a",
  bossAsteroid: "#8b0000",
  bossGlow: "rgba(255, 68, 68, 0.5)",

  // Power-up colors
  shield: "#22c55e",
  slowmo: "#8b5cf6",
  magnet: "#f472b6",
  double: "#fb923c",
  rapidfire: "#fbbf24",
  laser: "#ff0000",
  nuke: "#ff6b6b",

  // Projectile colors
  projectile: "#00fff5",
  projectileGlow: "rgba(0, 255, 245, 0.8)",
  laserBeam: "#ff0000",
  laserGlow: "rgba(255, 0, 0, 0.8)",

  // Gem colors
  gemBronze: "#cd7f32",
  gemSilver: "#c0c0c0",
  gemGold: "#ffd700",
  gemDiamond: "#b9f2ff",

  // Particle colors
  explosionColors: ["#ff6b35", "#f7931e", "#ffcc00", "#ff4444"],
  trailColors: ["#00fff5", "#00cccc", "#009999"],
  comboColors: ["#ffd700", "#ff6b35", "#ff00ff", "#00fff5"],

  // Star colors
  starColors: ["#ffffff", "#ffffcc", "#ccccff", "#ffcccc"],

  // Nebula colors
  nebulaColors: [
    "rgba(139, 92, 246, 0.15)",
    "rgba(244, 114, 182, 0.12)",
    "rgba(0, 255, 245, 0.1)",
    "rgba(251, 146, 60, 0.08)",
  ],

  // UI colors
  neonCyan: "#00fff5",
  neonMagenta: "#ff00ff",
  neonPurple: "#8b5cf6",
  comboGold: "#ffd700",
  waveBlue: "#60a5fa",
};

export const SHIP_CONFIG = {
  width: 40,
  height: 50,
  trailLength: 15,
  invincibilityDuration: 2000, // ms
  fireCooldown: 250, // ms between shots
  rapidFireCooldown: 80, // ms when rapid fire active
};

export const ASTEROID_CONFIG = {
  sizes: {
    small: { width: 25, height: 25, points: 10, health: 1 },
    medium: { width: 40, height: 40, points: 25, health: 2 },
    large: { width: 60, height: 60, points: 50, health: 3 },
  },
  bossConfig: {
    width: 100,
    height: 100,
    points: 200,
    health: 10,
  },
  minVertices: 6,
  maxVertices: 10,
};

export const PROJECTILE_CONFIG = {
  width: 6,
  height: 15,
  speed: 12,
  damage: 1,
  laserWidth: 8,
  laserDamage: 2,
};

export const GEM_CONFIG = {
  width: 25,
  height: 25,
  speed: 2.5,
  spawnChance: 0.4, // 40% chance when asteroid destroyed
  magnetRange: 200,
  magnetSpeed: 8,
  tiers: {
    bronze: { points: 25, weight: 50, color: "#cd7f32" },
    silver: { points: 50, weight: 30, color: "#c0c0c0" },
    gold: { points: 100, weight: 15, color: "#ffd700" },
    diamond: { points: 250, weight: 5, color: "#b9f2ff" },
  },
};

export const COMBO_CONFIG = {
  timeout: 2000, // ms before combo resets
  maxMultiplier: 10,
  milestones: [5, 10, 25, 50, 100], // Achievement triggers
};

export const WAVE_CONFIG = {
  baseAsteroids: 10,
  asteroidsPerWave: 5,
  transitionDuration: 2000, // ms
  bossWaveInterval: 5, // Boss every 5 waves
  difficultyScale: 1.15, // Speed multiplier per wave
};

export const POWERUP_CONFIG = {
  width: 35,
  height: 35,
  duration: {
    shield: 5000,
    slowmo: 4000,
    magnet: 6000,
    double: 8000,
    rapidfire: 5000,
    laser: 4000,
    nuke: 0, // Instant effect
    homing: 6000,
  },
  icons: {
    shield: "🛡️",
    slowmo: "⚡",
    magnet: "🧲",
    double: "✨",
    rapidfire: "🔥",
    laser: "🔴",
    nuke: "💣",
    homing: "🎯",
  },
};

export const DIFFICULTY_CONFIG = {
  scoreThresholds: [1000, 2500, 5000, 10000, 20000],
  speedMultipliers: [1, 1.2, 1.4, 1.6, 1.8, 2.0],
  spawnRateMultipliers: [1, 0.9, 0.8, 0.7, 0.6, 0.5],
};

export const PARTICLE_CONFIG = {
  explosion: {
    count: 25,
    minSpeed: 2,
    maxSpeed: 10,
    minLife: 500,
    maxLife: 1200,
    minSize: 2,
    maxSize: 8,
  },
  trail: {
    spawnRate: 50, // ms
    minLife: 200,
    maxLife: 400,
    size: 4,
  },
  powerUpCollect: {
    count: 20,
    minSpeed: 3,
    maxSpeed: 8,
    life: 800,
    size: 5,
  },
  gemCollect: {
    count: 12,
    minSpeed: 2,
    maxSpeed: 5,
    life: 500,
    size: 3,
  },
  comboParticle: {
    count: 8,
    speed: 4,
    life: 600,
    size: 6,
  },
};

export const STAR_CONFIG = {
  layers: [
    { speed: 0.3, sizeRange: [0.5, 1], count: 60 },
    { speed: 0.6, sizeRange: [1, 2], count: 50 },
    { speed: 1.0, sizeRange: [2, 3], count: 40 },
  ],
};

export const NEBULA_CONFIG = {
  count: 5,
  minSize: 150,
  maxSize: 400,
  speed: 0.2,
  opacity: 0.15,
};

export const SCREEN_SHAKE_CONFIG = {
  hitIntensity: 5,
  explosionIntensity: 10,
  nukeIntensity: 20,
  duration: 200, // ms
};

// Phase 2 Constants

export const UFO_CONFIG = {
  width: 50,
  height: 25,
  health: 3,
  speed: 2,
  shootCooldown: 2000, // ms
  projectileSpeed: 5,
  projectileDamage: 1,
  points: 200,
  spawnChance: 0.15, // 15% chance per wave
  waveStart: 3, // UFOs start appearing at wave 3
};

export const DASH_CONFIG = {
  speed: 25,
  duration: 150, // ms
  cooldown: 1000, // ms
  invincibleDuration: 200, // ms of invincibility after dash
};

export const FLOATING_TEXT_CONFIG = {
  fontSize: 18,
  largeFontSize: 28,
  lifetime: 1000, // ms
  floatSpeed: 2,
  comboColor: "#ffd700",
  damageColor: "#ff4444",
  pointsColor: "#00ff88",
  gemColors: {
    bronze: "#cd7f32",
    silver: "#c0c0c0",
    gold: "#ffd700",
    diamond: "#b9f2ff",
  },
};

export const ACHIEVEMENT_CONFIG = {
  displayTime: 3000, // ms
  achievements: {
    firstKill: {
      title: "First Blood!",
      icon: "💀",
      description: "Destroy your first asteroid",
    },
    combo5: {
      title: "Combo Starter!",
      icon: "🔥",
      description: "Reach a 5x combo",
    },
    combo10: {
      title: "Combo Master!",
      icon: "⚡",
      description: "Reach a 10x combo",
    },
    combo25: {
      title: "Unstoppable!",
      icon: "🌟",
      description: "Reach a 25x combo",
    },
    wave5: { title: "Survivor!", icon: "🛡️", description: "Survive to Wave 5" },
    wave10: {
      title: "Veteran!",
      icon: "🎖️",
      description: "Survive to Wave 10",
    },
    gems50: {
      title: "Gem Collector!",
      icon: "💎",
      description: "Collect 50 gems",
    },
    ufoSlayer: {
      title: "UFO Hunter!",
      icon: "👽",
      description: "Destroy your first UFO",
    },
    perfectDash: {
      title: "Untouchable!",
      icon: "💨",
      description: "Dash through 3 asteroids",
    },
  },
};

export const SPEED_LINE_CONFIG = {
  count: 15,
  minLength: 50,
  maxLength: 150,
  minSpeed: 15,
  maxSpeed: 30,
  fadeSpeed: 0.02,
  triggerSpeed: 3, // Ship speed needed to show lines
};

export const HOMING_CONFIG = {
  speed: 8,
  turnRate: 0.1, // How fast projectile turns toward target
  duration: 3000, // ms before homing effect fades
  searchRadius: 300, // How far to search for targets
};

// Phase 5: Kill Streak Configuration
export const KILL_STREAK_CONFIG = {
  timeout: 2000, // ms between kills to maintain streak
  tiers: [
    { count: 2, text: "DOUBLE KILL!", color: "#fbbf24", points: 25 },
    { count: 3, text: "TRIPLE KILL!", color: "#fb923c", points: 50 },
    { count: 4, text: "QUAD KILL!", color: "#f97316", points: 100 },
    { count: 5, text: "RAMPAGE!", color: "#ef4444", points: 150 },
    { count: 7, text: "DOMINATING!", color: "#dc2626", points: 200 },
    { count: 10, text: "UNSTOPPABLE!", color: "#ff00ff", points: 300 },
    { count: 15, text: "GODLIKE!", color: "#8b5cf6", points: 500 },
  ],
  displayDuration: 1500, // ms to show streak text
};

// Screen Flash Configuration
export const SCREEN_FLASH_CONFIG = {
  killFlash: { color: "rgba(255, 215, 0, 0.3)", duration: 150 }, // Gold
  damageFlash: { color: "rgba(255, 0, 0, 0.4)", duration: 200 }, // Red
  powerUpFlash: { color: "rgba(0, 255, 245, 0.25)", duration: 200 }, // Cyan
  nukeFlash: { color: "rgba(255, 255, 255, 0.8)", duration: 300 }, // White
  bossKillFlash: { color: "rgba(255, 100, 100, 0.5)", duration: 400 }, // Bright red
};

// Boss Warning Configuration
export const BOSS_WARNING_CONFIG = {
  duration: 2000, // ms warning display time
  pulseRate: 0.01, // Pulse speed
  borderWidth: 10,
};

// Warp Effect Configuration
export const WARP_EFFECT_CONFIG = {
  duration: 800, // ms
  maxIntensity: 1.0,
  lineCount: 30,
};

// Phase 6: Progressive Ship Upgrade Configuration
export const UPGRADE_CONFIG = {
  levels: [
    {
      level: 1,
      scoreThreshold: 0,
      name: "Rookie",
      projectileCount: 1,
      fireRateMultiplier: 1.0,
      damageMultiplier: 1.0,
      trailLength: 15,
      glowIntensity: 0.3,
      auraColor: "rgba(0, 255, 245, 0.2)",
    },
    {
      level: 2,
      scoreThreshold: 500,
      name: "Veteran",
      projectileCount: 1,
      fireRateMultiplier: 1.15,
      damageMultiplier: 1.2,
      trailLength: 20,
      glowIntensity: 0.5,
      auraColor: "rgba(0, 255, 100, 0.3)",
    },
    {
      level: 3,
      scoreThreshold: 1500,
      name: "Elite",
      projectileCount: 2,
      fireRateMultiplier: 1.3,
      damageMultiplier: 1.4,
      trailLength: 25,
      glowIntensity: 0.6,
      auraColor: "rgba(255, 200, 0, 0.3)",
    },
    {
      level: 4,
      scoreThreshold: 3000,
      name: "Ace",
      projectileCount: 2,
      fireRateMultiplier: 1.5,
      damageMultiplier: 1.6,
      trailLength: 30,
      glowIntensity: 0.7,
      auraColor: "rgba(255, 100, 50, 0.35)",
    },
    {
      level: 5,
      scoreThreshold: 5000,
      name: "Legend",
      projectileCount: 3,
      fireRateMultiplier: 1.7,
      damageMultiplier: 1.8,
      trailLength: 35,
      glowIntensity: 0.8,
      auraColor: "rgba(255, 50, 150, 0.4)",
    },
    {
      level: 6,
      scoreThreshold: 10000,
      name: "Godlike",
      projectileCount: 3,
      fireRateMultiplier: 2.0,
      damageMultiplier: 2.0,
      trailLength: 40,
      glowIntensity: 1.0,
      auraColor: "rgba(150, 50, 255, 0.5)",
    },
  ],
  upgradeBurstParticles: 50,
  levelUpFlashDuration: 500,
};
