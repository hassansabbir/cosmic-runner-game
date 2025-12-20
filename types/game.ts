// Game Types and Interfaces

export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  width: number;
  height: number;
  active: boolean;
}

export interface Ship extends Entity {
  lives: number;
  invincible: boolean;
  invincibleTimer: number;
  trail: Vector2D[];
  lastFireTime: number;
  isDashing: boolean;
  dashCooldown: number;
  dashTimer: number;
  // Phase 6: Upgrade system
  upgradeLevel: number;
  upgradeBonuses: ShipUpgradeBonuses;
}

// Progressive ship upgrade bonuses
export interface ShipUpgradeBonuses {
  projectileCount: number;
  fireRateMultiplier: number;
  damageMultiplier: number;
  trailLength: number;
  glowIntensity: number;
  auraColor: string;
}

export interface Asteroid extends Entity {
  rotation: number;
  rotationSpeed: number;
  size: "small" | "medium" | "large";
  vertices: Vector2D[];
  health: number;
  maxHealth: number;
  isBoss: boolean;
  targetImageUrl?: string; // Optional custom face image
}

export interface Star extends Entity {
  brightness: number;
  twinkleSpeed: number;
  layer: number; // 0 = far, 1 = mid, 2 = close
}

export interface PowerUp extends Entity {
  type: PowerUpType;
  rotation: number;
  pulsePhase: number;
}

export type PowerUpType =
  | "shield"
  | "slowmo"
  | "magnet"
  | "double"
  | "rapidfire"
  | "laser"
  | "nuke"
  | "homing";

export interface Projectile extends Entity {
  damage: number;
  color: string;
  isLaser: boolean;
  isHoming: boolean;
  targetId?: string;
}

export interface Gem extends Entity {
  tier: GemTier;
  rotation: number;
  pulsePhase: number;
  sparkleOffset: number;
}

export type GemTier = "bronze" | "silver" | "gold" | "diamond";

// UFO enemy that shoots at player
export interface UFO extends Entity {
  health: number;
  maxHealth: number;
  lastShootTime: number;
  shootCooldown: number;
  movementPhase: number;
}

// Floating score/damage text
export interface FloatingText {
  id: string;
  position: Vector2D;
  text: string;
  color: string;
  fontSize: number;
  life: number;
  maxLife: number;
  velocity: Vector2D;
}

// Achievement notification
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  displayTime: number;
  maxDisplayTime: number;
}

// Speed line effect
export interface SpeedLine {
  id: string;
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
}

export interface Particle {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  type?: "explosion" | "trail" | "sparkle" | "combo" | "dash";
}

export interface ComboState {
  count: number;
  multiplier: number;
  lastHitTime: number;
  maxCombo: number;
  isActive: boolean;
}

export interface WaveState {
  current: number;
  asteroidsRemaining: number;
  isTransitioning: boolean;
  transitionTimer: number;
  totalAsteroidsDestroyed: number;
}

export interface GameStats {
  asteroidsDestroyed: number;
  gemsCollected: number;
  shotsFired: number;
  shotsHit: number;
  maxCombo: number;
  wavesCompleted: number;
  powerUpsCollected: number;
  ufosDestroyed: number;
  dashesUsed: number;
}

export interface ScreenShake {
  intensity: number;
  duration: number;
  elapsed: number;
}

export interface Nebula {
  id: string;
  position: Vector2D;
  size: number;
  color: string;
  alpha: number;
  speed: number;
}

export interface GameState {
  phase: GamePhase;
  score: number;
  highScore: number;
  ship: Ship;
  asteroids: Asteroid[];
  powerUps: PowerUp[];
  particles: Particle[];
  stars: Star[];
  activePowerUps: ActivePowerUp[];
  difficulty: number;
  gameTime: number;
  // New state properties
  projectiles: Projectile[];
  gems: Gem[];
  combo: ComboState;
  wave: WaveState;
  stats: GameStats;
  screenShake: ScreenShake;
  nebulae: Nebula[];
  lastProjectileTime: number;
  // Phase 2 additions
  ufos: UFO[];
  floatingTexts: FloatingText[];
  achievements: Achievement[];
  speedLines: SpeedLine[];
  unlockedAchievements: Set<string>;
  // Phase 5: Dynamic effects
  screenFlash: ScreenFlash;
  killStreak: KillStreak;
  bossWarning: BossWarning;
  warpEffect: WarpEffect;
}

// Screen flash effect for kills/damage/powerups
export interface ScreenFlash {
  active: boolean;
  color: string;
  alpha: number;
  duration: number;
  elapsed: number;
}

// Kill streak tracking
export interface KillStreak {
  count: number;
  lastKillTime: number;
  streakTimeout: number;
  currentTier: number;
  displayText: string;
  displayTimer: number;
}

// Boss warning animation
export interface BossWarning {
  active: boolean;
  timer: number;
  duration: number;
  pulsePhase: number;
}

// Warp/speed effect for wave transitions
export interface WarpEffect {
  active: boolean;
  intensity: number;
  duration: number;
  elapsed: number;
}

export type GamePhase =
  | "menu"
  | "playing"
  | "paused"
  | "gameOver"
  | "waveTransition";

export interface ActivePowerUp {
  type: PowerUpType;
  remainingTime: number;
  duration: number;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  shipSpeed: number;
  baseAsteroidSpeed: number;
  asteroidSpawnRate: number;
  powerUpSpawnRate: number;
  starCount: number;
  maxParticles: number;
}

export type GameAction =
  | { type: "START_GAME" }
  | { type: "PAUSE_GAME" }
  | { type: "RESUME_GAME" }
  | { type: "GAME_OVER" }
  | { type: "RESTART" }
  | { type: "MOVE_SHIP"; direction: "left" | "right" | "none" }
  | { type: "UPDATE"; deltaTime: number }
  | { type: "COLLECT_POWERUP"; powerUpType: PowerUpType }
  | { type: "HIT_ASTEROID" }
  | { type: "ADD_SCORE"; points: number }
  | { type: "FIRE_PROJECTILE" }
  | { type: "COLLECT_GEM"; tier: GemTier }
  | { type: "INCREMENT_COMBO" }
  | { type: "RESET_COMBO" }
  | { type: "DASH" }
  | { type: "SHOW_ACHIEVEMENT"; achievement: string };
