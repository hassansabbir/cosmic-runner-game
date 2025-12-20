// Game Engine - Core Game Logic

import {
  GameState,
  GamePhase,
  Ship,
  Asteroid,
  PowerUp,
  Particle,
  Star,
  Vector2D,
  PowerUpType,
  ActivePowerUp,
  Projectile,
  Gem,
  GemTier,
  ComboState,
  WaveState,
  GameStats,
  ScreenShake,
  Nebula,
  UFO,
  FloatingText,
  Achievement,
  SpeedLine,
  ScreenFlash,
  KillStreak,
  BossWarning,
  WarpEffect,
} from "@/types/game";
import {
  GAME_CONFIG,
  SHIP_CONFIG,
  ASTEROID_CONFIG,
  POWERUP_CONFIG,
  PARTICLE_CONFIG,
  STAR_CONFIG,
  COLORS,
  DIFFICULTY_CONFIG,
  PROJECTILE_CONFIG,
  GEM_CONFIG,
  COMBO_CONFIG,
  WAVE_CONFIG,
  NEBULA_CONFIG,
  SCREEN_SHAKE_CONFIG,
  UFO_CONFIG,
  DASH_CONFIG,
  FLOATING_TEXT_CONFIG,
  ACHIEVEMENT_CONFIG,
  SPEED_LINE_CONFIG,
} from "./constants";

// Utility functions
export const generateId = (): string => Math.random().toString(36).substr(2, 9);

export const randomRange = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

export const randomInt = (min: number, max: number): number =>
  Math.floor(randomRange(min, max + 1));

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

// Create initial ship
export const createShip = (
  canvasWidth: number,
  canvasHeight: number
): Ship => ({
  id: "player-ship",
  position: {
    x: canvasWidth / 2,
    y: canvasHeight - 100,
  },
  velocity: { x: 0, y: 0 },
  width: SHIP_CONFIG.width,
  height: SHIP_CONFIG.height,
  active: true,
  lives: 3,
  invincible: false,
  invincibleTimer: 0,
  trail: [],
  lastFireTime: 0,
  isDashing: false,
  dashCooldown: 0,
  dashTimer: 0,
  // Phase 6: Upgrade system
  upgradeLevel: 1,
  upgradeBonuses: {
    projectileCount: 1,
    fireRateMultiplier: 1.0,
    damageMultiplier: 1.0,
    trailLength: 15,
    glowIntensity: 0.3,
    auraColor: "rgba(0, 255, 245, 0.2)",
  },
});

// Create asteroid with random polygon shape
export const createAsteroid = (
  canvasWidth: number,
  isBoss: boolean = false
): Asteroid => {
  if (isBoss) {
    const config = ASTEROID_CONFIG.bossConfig;
    const vertexCount = 12;
    const vertices: Vector2D[] = [];

    for (let i = 0; i < vertexCount; i++) {
      const angle = (i / vertexCount) * Math.PI * 2;
      const radius = (config.width / 2) * randomRange(0.8, 1.2);
      vertices.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      });
    }

    return {
      id: generateId(),
      position: {
        x: canvasWidth / 2,
        y: -config.height,
      },
      velocity: { x: 0, y: GAME_CONFIG.baseAsteroidSpeed * 0.7 },
      width: config.width,
      height: config.height,
      active: true,
      rotation: 0,
      rotationSpeed: randomRange(-0.01, 0.01),
      size: "large",
      vertices,
      health: config.health,
      maxHealth: config.health,
      isBoss: true,
    };
  }

  const sizeKey = (["small", "medium", "large"] as const)[randomInt(0, 2)];
  const config = ASTEROID_CONFIG.sizes[sizeKey];
  const vertexCount = randomInt(
    ASTEROID_CONFIG.minVertices,
    ASTEROID_CONFIG.maxVertices
  );
  const vertices: Vector2D[] = [];

  for (let i = 0; i < vertexCount; i++) {
    const angle = (i / vertexCount) * Math.PI * 2;
    const radius = (config.width / 2) * randomRange(0.7, 1.3);
    vertices.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }

  return {
    id: generateId(),
    position: {
      x: randomRange(config.width, canvasWidth - config.width),
      y: -config.height,
    },
    velocity: { x: randomRange(-1, 1), y: GAME_CONFIG.baseAsteroidSpeed },
    width: config.width,
    height: config.height,
    active: true,
    rotation: randomRange(0, Math.PI * 2),
    rotationSpeed: randomRange(-0.03, 0.03),
    size: sizeKey,
    vertices,
    health: config.health,
    maxHealth: config.health,
    isBoss: false,
  };
};

// Create power-up
export const createPowerUp = (canvasWidth: number): PowerUp => {
  const types: PowerUpType[] = [
    "shield",
    "slowmo",
    "magnet",
    "double",
    "rapidfire",
    "laser",
    "nuke",
  ];
  const weights = [20, 15, 15, 15, 15, 10, 10]; // Weighted random
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  let selectedIndex = 0;

  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      selectedIndex = i;
      break;
    }
  }

  const type = types[selectedIndex];

  return {
    id: generateId(),
    position: {
      x: randomRange(50, canvasWidth - 50),
      y: -POWERUP_CONFIG.height,
    },
    velocity: { x: 0, y: 2 },
    width: POWERUP_CONFIG.width,
    height: POWERUP_CONFIG.height,
    active: true,
    type,
    rotation: 0,
    pulsePhase: 0,
  };
};

// Create projectile
export const createProjectile = (
  ship: Ship,
  isLaser: boolean = false,
  isHoming: boolean = false
): Projectile => ({
  id: generateId(),
  position: {
    x: ship.position.x,
    y: ship.position.y - ship.height / 2,
  },
  velocity: { x: 0, y: -PROJECTILE_CONFIG.speed },
  width: isLaser ? PROJECTILE_CONFIG.laserWidth : PROJECTILE_CONFIG.width,
  height: PROJECTILE_CONFIG.height,
  active: true,
  damage: isLaser ? PROJECTILE_CONFIG.laserDamage : PROJECTILE_CONFIG.damage,
  color: isHoming ? "#8b5cf6" : isLaser ? COLORS.laserBeam : COLORS.projectile,
  isLaser,
  isHoming,
});

// Create gem
export const createGem = (position: Vector2D): Gem => {
  // Weighted random tier selection
  const tiers: GemTier[] = ["bronze", "silver", "gold", "diamond"];
  const weights = [
    GEM_CONFIG.tiers.bronze.weight,
    GEM_CONFIG.tiers.silver.weight,
    GEM_CONFIG.tiers.gold.weight,
    GEM_CONFIG.tiers.diamond.weight,
  ];
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  let selectedTier: GemTier = "bronze";

  for (let i = 0; i < tiers.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      selectedTier = tiers[i];
      break;
    }
  }

  return {
    id: generateId(),
    position: { ...position },
    velocity: { x: randomRange(-1, 1), y: GEM_CONFIG.speed },
    width: GEM_CONFIG.width,
    height: GEM_CONFIG.height,
    active: true,
    tier: selectedTier,
    rotation: 0,
    pulsePhase: randomRange(0, Math.PI * 2),
    sparkleOffset: randomRange(0, 1000),
  };
};

// Create stars for background
export const createStars = (
  canvasWidth: number,
  canvasHeight: number
): Star[] => {
  const stars: Star[] = [];

  STAR_CONFIG.layers.forEach((layer, layerIndex) => {
    for (let i = 0; i < layer.count; i++) {
      stars.push({
        id: generateId(),
        position: {
          x: randomRange(0, canvasWidth),
          y: randomRange(0, canvasHeight),
        },
        velocity: { x: 0, y: layer.speed },
        width: randomRange(layer.sizeRange[0], layer.sizeRange[1]),
        height: randomRange(layer.sizeRange[0], layer.sizeRange[1]),
        active: true,
        brightness: randomRange(0.3, 1),
        twinkleSpeed: randomRange(0.02, 0.05),
        layer: layerIndex,
      });
    }
  });

  return stars;
};

// Create nebulae for background
export const createNebulae = (
  canvasWidth: number,
  canvasHeight: number
): Nebula[] => {
  const nebulae: Nebula[] = [];

  for (let i = 0; i < NEBULA_CONFIG.count; i++) {
    nebulae.push({
      id: generateId(),
      position: {
        x: randomRange(0, canvasWidth),
        y: randomRange(0, canvasHeight),
      },
      size: randomRange(NEBULA_CONFIG.minSize, NEBULA_CONFIG.maxSize),
      color: COLORS.nebulaColors[i % COLORS.nebulaColors.length],
      alpha: randomRange(0.05, NEBULA_CONFIG.opacity),
      speed: NEBULA_CONFIG.speed * randomRange(0.5, 1.5),
    });
  }

  return nebulae;
};

// Create explosion particles
export const createExplosionParticles = (
  position: Vector2D,
  count?: number,
  colors?: string[]
): Particle[] => {
  const particles: Particle[] = [];
  const { minSpeed, maxSpeed, minLife, maxLife, minSize, maxSize } =
    PARTICLE_CONFIG.explosion;
  const particleCount = count || PARTICLE_CONFIG.explosion.count;
  const particleColors = colors || COLORS.explosionColors;

  for (let i = 0; i < particleCount; i++) {
    const angle = randomRange(0, Math.PI * 2);
    const speed = randomRange(minSpeed, maxSpeed);
    const life = randomRange(minLife, maxLife);

    particles.push({
      id: generateId(),
      position: { ...position },
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      },
      life,
      maxLife: life,
      size: randomRange(minSize, maxSize),
      color: particleColors[randomInt(0, particleColors.length - 1)],
      alpha: 1,
      type: "explosion",
    });
  }

  return particles;
};

// Create power-up collection particles
export const createPowerUpParticles = (
  position: Vector2D,
  color: string
): Particle[] => {
  const particles: Particle[] = [];
  const { count, minSpeed, maxSpeed, life, size } =
    PARTICLE_CONFIG.powerUpCollect;

  for (let i = 0; i < count; i++) {
    const angle = randomRange(0, Math.PI * 2);
    const speed = randomRange(minSpeed, maxSpeed);

    particles.push({
      id: generateId(),
      position: { ...position },
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      },
      life,
      maxLife: life,
      size,
      color,
      alpha: 1,
      type: "sparkle",
    });
  }

  return particles;
};

// Create gem collection particles
export const createGemParticles = (
  position: Vector2D,
  tier: GemTier
): Particle[] => {
  const particles: Particle[] = [];
  const { count, minSpeed, maxSpeed, life, size } = PARTICLE_CONFIG.gemCollect;
  const color = GEM_CONFIG.tiers[tier].color;

  for (let i = 0; i < count; i++) {
    const angle = randomRange(0, Math.PI * 2);
    const speed = randomRange(minSpeed, maxSpeed);

    particles.push({
      id: generateId(),
      position: { ...position },
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      },
      life,
      maxLife: life,
      size,
      color,
      alpha: 1,
      type: "sparkle",
    });
  }

  return particles;
};

// Create combo particles
export const createComboParticles = (position: Vector2D): Particle[] => {
  const particles: Particle[] = [];
  const { count, speed, life, size } = PARTICLE_CONFIG.comboParticle;

  for (let i = 0; i < count; i++) {
    const angle = randomRange(0, Math.PI * 2);

    particles.push({
      id: generateId(),
      position: { ...position },
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed - 2,
      },
      life,
      maxLife: life,
      size,
      color: COLORS.comboColors[randomInt(0, COLORS.comboColors.length - 1)],
      alpha: 1,
      type: "combo",
    });
  }

  return particles;
};

// Check collision between two entities
export const checkCollision = (
  a: { position: Vector2D; width: number; height: number },
  b: { position: Vector2D; width: number; height: number }
): boolean => {
  const aLeft = a.position.x - a.width / 2;
  const aRight = a.position.x + a.width / 2;
  const aTop = a.position.y - a.height / 2;
  const aBottom = a.position.y + a.height / 2;

  const bLeft = b.position.x - b.width / 2;
  const bRight = b.position.x + b.width / 2;
  const bTop = b.position.y - b.height / 2;
  const bBottom = b.position.y + b.height / 2;

  return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
};

// Get difficulty level based on score
export const getDifficultyLevel = (score: number): number => {
  for (let i = DIFFICULTY_CONFIG.scoreThresholds.length - 1; i >= 0; i--) {
    if (score >= DIFFICULTY_CONFIG.scoreThresholds[i]) {
      return i + 1;
    }
  }
  return 0;
};

// Get speed multiplier for current difficulty
export const getSpeedMultiplier = (difficulty: number): number =>
  DIFFICULTY_CONFIG.speedMultipliers[
    Math.min(difficulty, DIFFICULTY_CONFIG.speedMultipliers.length - 1)
  ];

// Get spawn rate multiplier for current difficulty
export const getSpawnRateMultiplier = (difficulty: number): number =>
  DIFFICULTY_CONFIG.spawnRateMultipliers[
    Math.min(difficulty, DIFFICULTY_CONFIG.spawnRateMultipliers.length - 1)
  ];

// Check if power-up is active
export const isPowerUpActive = (
  activePowerUps: ActivePowerUp[],
  type: PowerUpType
): boolean =>
  activePowerUps.some((p) => p.type === type && p.remainingTime > 0);

// Get power-up color
export const getPowerUpColor = (type: PowerUpType): string => {
  const colorMap: Record<PowerUpType, string> = {
    shield: COLORS.shield,
    slowmo: COLORS.slowmo,
    magnet: COLORS.magnet,
    double: COLORS.double,
    rapidfire: COLORS.rapidfire,
    laser: COLORS.laser,
    nuke: COLORS.nuke,
    homing: "#8b5cf6",
  };
  return colorMap[type];
};

// Initial combo state
export const createInitialComboState = (): ComboState => ({
  count: 0,
  multiplier: 1,
  lastHitTime: 0,
  maxCombo: 0,
  isActive: false,
});

// Initial wave state
export const createInitialWaveState = (): WaveState => ({
  current: 1,
  asteroidsRemaining: WAVE_CONFIG.baseAsteroids,
  isTransitioning: false,
  transitionTimer: 0,
  totalAsteroidsDestroyed: 0,
});

// Initial game stats
export const createInitialStats = (): GameStats => ({
  asteroidsDestroyed: 0,
  gemsCollected: 0,
  shotsFired: 0,
  shotsHit: 0,
  maxCombo: 0,
  wavesCompleted: 0,
  powerUpsCollected: 0,
  ufosDestroyed: 0,
  dashesUsed: 0,
});

// Initial screen shake
export const createInitialScreenShake = (): ScreenShake => ({
  intensity: 0,
  duration: 0,
  elapsed: 0,
});

// Initial screen flash
export const createInitialScreenFlash = (): ScreenFlash => ({
  active: false,
  color: "rgba(255, 255, 255, 0)",
  alpha: 0,
  duration: 0,
  elapsed: 0,
});

// Initial kill streak
export const createInitialKillStreak = (): KillStreak => ({
  count: 0,
  lastKillTime: 0,
  streakTimeout: 2000,
  currentTier: 0,
  displayText: "",
  displayTimer: 0,
});

// Initial boss warning
export const createInitialBossWarning = (): BossWarning => ({
  active: false,
  timer: 0,
  duration: 2000,
  pulsePhase: 0,
});

// Initial warp effect
export const createInitialWarpEffect = (): WarpEffect => ({
  active: false,
  intensity: 0,
  duration: 800,
  elapsed: 0,
});

// Create initial game state
export const createInitialState = (
  canvasWidth: number,
  canvasHeight: number,
  highScore: number = 0
): GameState => ({
  phase: "menu",
  score: 0,
  highScore,
  ship: createShip(canvasWidth, canvasHeight),
  asteroids: [],
  powerUps: [],
  particles: [],
  stars: createStars(canvasWidth, canvasHeight),
  activePowerUps: [],
  difficulty: 0,
  gameTime: 0,
  projectiles: [],
  gems: [],
  combo: createInitialComboState(),
  wave: createInitialWaveState(),
  stats: createInitialStats(),
  screenShake: createInitialScreenShake(),
  nebulae: createNebulae(canvasWidth, canvasHeight),
  lastProjectileTime: 0,
  // Phase 2 additions
  ufos: [],
  floatingTexts: [],
  achievements: [],
  speedLines: [],
  unlockedAchievements: new Set(),
  // Phase 5: Dynamic effects
  screenFlash: createInitialScreenFlash(),
  killStreak: createInitialKillStreak(),
  bossWarning: createInitialBossWarning(),
  warpEffect: createInitialWarpEffect(),
});

// Update stars (parallax scrolling)
export const updateStars = (
  stars: Star[],
  deltaTime: number,
  canvasHeight: number,
  canvasWidth: number
): Star[] => {
  return stars.map((star) => {
    let newY = star.position.y + star.velocity.y * deltaTime * 0.05;

    if (newY > canvasHeight) {
      newY = 0;
      return {
        ...star,
        position: { x: randomRange(0, canvasWidth), y: newY },
        brightness: randomRange(0.3, 1),
      };
    }

    return {
      ...star,
      position: { ...star.position, y: newY },
      brightness:
        star.brightness + Math.sin(Date.now() * star.twinkleSpeed) * 0.01,
    };
  });
};

// Update nebulae
export const updateNebulae = (
  nebulae: Nebula[],
  deltaTime: number,
  canvasHeight: number,
  canvasWidth: number
): Nebula[] => {
  return nebulae.map((nebula) => {
    let newY = nebula.position.y + nebula.speed * deltaTime * 0.02;

    if (newY > canvasHeight + nebula.size) {
      return {
        ...nebula,
        position: {
          x: randomRange(-nebula.size / 2, canvasWidth + nebula.size / 2),
          y: -nebula.size,
        },
        alpha: randomRange(0.05, NEBULA_CONFIG.opacity),
      };
    }

    return {
      ...nebula,
      position: { ...nebula.position, y: newY },
    };
  });
};

// Update particles
export const updateParticles = (
  particles: Particle[],
  deltaTime: number
): Particle[] => {
  return particles
    .map((particle) => ({
      ...particle,
      position: {
        x: particle.position.x + particle.velocity.x,
        y: particle.position.y + particle.velocity.y,
      },
      life: particle.life - deltaTime,
      alpha: particle.life / particle.maxLife,
      size: particle.size * (particle.life / particle.maxLife),
    }))
    .filter((particle) => particle.life > 0);
};

// Update combo state
export const updateCombo = (
  combo: ComboState,
  currentTime: number
): ComboState => {
  if (
    combo.isActive &&
    currentTime - combo.lastHitTime > COMBO_CONFIG.timeout
  ) {
    return {
      ...combo,
      count: 0,
      multiplier: 1,
      isActive: false,
    };
  }
  return combo;
};

// Increment combo
export const incrementCombo = (
  combo: ComboState,
  currentTime: number
): ComboState => {
  const newCount = combo.count + 1;
  const newMultiplier = Math.min(
    Math.floor(newCount / 5) + 1,
    COMBO_CONFIG.maxMultiplier
  );
  const newMaxCombo = Math.max(combo.maxCombo, newCount);

  return {
    count: newCount,
    multiplier: newMultiplier,
    lastHitTime: currentTime,
    maxCombo: newMaxCombo,
    isActive: true,
  };
};

// Update screen shake
export const updateScreenShake = (
  shake: ScreenShake,
  deltaTime: number
): ScreenShake => {
  if (shake.intensity <= 0) return shake;

  const newElapsed = shake.elapsed + deltaTime;
  if (newElapsed >= shake.duration) {
    return createInitialScreenShake();
  }

  return {
    ...shake,
    elapsed: newElapsed,
    intensity: shake.intensity * (1 - newElapsed / shake.duration),
  };
};

// Trigger screen shake
export const triggerScreenShake = (
  intensity: number,
  duration: number = SCREEN_SHAKE_CONFIG.duration
): ScreenShake => ({
  intensity,
  duration,
  elapsed: 0,
});

// Calculate wave asteroid count
export const getWaveAsteroidCount = (wave: number): number =>
  WAVE_CONFIG.baseAsteroids + (wave - 1) * WAVE_CONFIG.asteroidsPerWave;

// Check if current wave is a boss wave
export const isBossWave = (wave: number): boolean =>
  wave % WAVE_CONFIG.bossWaveInterval === 0;

// Save high score to localStorage
export const saveHighScore = (score: number): void => {
  if (typeof window !== "undefined") {
    const currentHigh = getHighScore();
    if (score > currentHigh) {
      localStorage.setItem("cosmicRunnerHighScore", score.toString());
    }
  }
};

// Get high score from localStorage
export const getHighScore = (): number => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("cosmicRunnerHighScore");
    return saved ? parseInt(saved, 10) : 0;
  }
  return 0;
};

// ==================== PHASE 2 FUNCTIONS ====================

// Create UFO enemy
export const createUFO = (canvasWidth: number): UFO => ({
  id: generateId(),
  position: {
    x: randomRange(UFO_CONFIG.width, canvasWidth - UFO_CONFIG.width),
    y: -UFO_CONFIG.height,
  },
  velocity: { x: randomRange(-2, 2), y: UFO_CONFIG.speed },
  width: UFO_CONFIG.width,
  height: UFO_CONFIG.height,
  active: true,
  health: UFO_CONFIG.health,
  maxHealth: UFO_CONFIG.health,
  lastShootTime: 0,
  shootCooldown: UFO_CONFIG.shootCooldown,
  movementPhase: randomRange(0, Math.PI * 2),
});

// Create floating score text
export const createFloatingText = (
  position: Vector2D,
  text: string,
  color: string,
  isLarge: boolean = false
): FloatingText => ({
  id: generateId(),
  position: { ...position },
  text,
  color,
  fontSize: isLarge
    ? FLOATING_TEXT_CONFIG.largeFontSize
    : FLOATING_TEXT_CONFIG.fontSize,
  life: FLOATING_TEXT_CONFIG.lifetime,
  maxLife: FLOATING_TEXT_CONFIG.lifetime,
  velocity: { x: randomRange(-0.5, 0.5), y: -FLOATING_TEXT_CONFIG.floatSpeed },
});

// Create achievement notification
export const createAchievement = (
  achievementKey: string
): Achievement | null => {
  const config =
    ACHIEVEMENT_CONFIG.achievements[
      achievementKey as keyof typeof ACHIEVEMENT_CONFIG.achievements
    ];
  if (!config) return null;

  return {
    id: generateId(),
    title: config.title,
    description: config.description,
    icon: config.icon,
    displayTime: ACHIEVEMENT_CONFIG.displayTime,
    maxDisplayTime: ACHIEVEMENT_CONFIG.displayTime,
  };
};

// Create speed line
export const createSpeedLine = (
  canvasWidth: number,
  canvasHeight: number
): SpeedLine => ({
  id: generateId(),
  x: randomRange(0, canvasWidth),
  y: randomRange(0, canvasHeight),
  length: randomRange(SPEED_LINE_CONFIG.minLength, SPEED_LINE_CONFIG.maxLength),
  speed: randomRange(SPEED_LINE_CONFIG.minSpeed, SPEED_LINE_CONFIG.maxSpeed),
  alpha: 1,
});

// Update floating texts
export const updateFloatingTexts = (
  texts: FloatingText[],
  deltaTime: number
): FloatingText[] => {
  return texts
    .map((text) => ({
      ...text,
      position: {
        x: text.position.x + text.velocity.x,
        y: text.position.y + text.velocity.y,
      },
      life: text.life - deltaTime,
    }))
    .filter((text) => text.life > 0);
};

// Update achievements
export const updateAchievements = (
  achievements: Achievement[],
  deltaTime: number
): Achievement[] => {
  return achievements
    .map((a) => ({
      ...a,
      displayTime: a.displayTime - deltaTime,
    }))
    .filter((a) => a.displayTime > 0);
};

// Update speed lines
export const updateSpeedLines = (
  lines: SpeedLine[],
  deltaTime: number,
  canvasHeight: number,
  canvasWidth: number,
  shipSpeed: number
): SpeedLine[] => {
  // Only show speed lines when moving fast
  if (Math.abs(shipSpeed) < SPEED_LINE_CONFIG.triggerSpeed) {
    return lines
      .map((line) => ({
        ...line,
        alpha: Math.max(0, line.alpha - SPEED_LINE_CONFIG.fadeSpeed * 2),
      }))
      .filter((line) => line.alpha > 0.01);
  }

  let updatedLines = lines.map((line) => ({
    ...line,
    y: line.y + line.speed * deltaTime * 0.1,
    alpha: Math.min(0.7, line.alpha + SPEED_LINE_CONFIG.fadeSpeed),
  }));

  // Remove off-screen and respawn
  updatedLines = updatedLines.filter(
    (line) => line.y < canvasHeight + line.length
  );

  // Add new lines if needed
  while (updatedLines.length < SPEED_LINE_CONFIG.count) {
    const newLine = createSpeedLine(canvasWidth, 0);
    newLine.y = -newLine.length;
    newLine.alpha = 0.1;
    updatedLines.push(newLine);
  }

  return updatedLines;
};

// Update UFOs
export const updateUFOs = (
  ufos: UFO[],
  deltaTime: number,
  canvasWidth: number,
  canvasHeight: number,
  time: number
): UFO[] => {
  return ufos
    .map((ufo) => {
      // Sinusoidal movement
      const newX =
        ufo.position.x + Math.sin(time * 0.002 + ufo.movementPhase) * 2;
      const newY = ufo.position.y + ufo.velocity.y;

      return {
        ...ufo,
        position: {
          x: clamp(newX, ufo.width / 2, canvasWidth - ufo.width / 2),
          y: newY,
        },
      };
    })
    .filter((ufo) => ufo.position.y < canvasHeight + ufo.height && ufo.active);
};

// Create dash particles
export const createDashParticles = (
  position: Vector2D,
  direction: number
): Particle[] => {
  const particles: Particle[] = [];
  const count = 10;

  for (let i = 0; i < count; i++) {
    particles.push({
      id: generateId(),
      position: { x: position.x + randomRange(-20, 20), y: position.y },
      velocity: { x: -direction * randomRange(3, 8), y: randomRange(-2, 2) },
      life: 300,
      maxLife: 300,
      size: randomRange(3, 6),
      color: COLORS.neonCyan,
      alpha: 1,
      type: "dash",
    });
  }

  return particles;
};

// Check achievement unlocks
export const checkAchievements = (
  state: GameState,
  unlockedSet: Set<string>
): { key: string; achievement: Achievement }[] => {
  const newAchievements: { key: string; achievement: Achievement }[] = [];

  // First kill
  if (state.stats.asteroidsDestroyed === 1 && !unlockedSet.has("firstKill")) {
    const a = createAchievement("firstKill");
    if (a) newAchievements.push({ key: "firstKill", achievement: a });
  }

  // Combo milestones
  if (state.combo.count >= 5 && !unlockedSet.has("combo5")) {
    const a = createAchievement("combo5");
    if (a) newAchievements.push({ key: "combo5", achievement: a });
  }
  if (state.combo.count >= 10 && !unlockedSet.has("combo10")) {
    const a = createAchievement("combo10");
    if (a) newAchievements.push({ key: "combo10", achievement: a });
  }
  if (state.combo.count >= 25 && !unlockedSet.has("combo25")) {
    const a = createAchievement("combo25");
    if (a) newAchievements.push({ key: "combo25", achievement: a });
  }

  // Wave milestones
  if (state.wave.current >= 5 && !unlockedSet.has("wave5")) {
    const a = createAchievement("wave5");
    if (a) newAchievements.push({ key: "wave5", achievement: a });
  }
  if (state.wave.current >= 10 && !unlockedSet.has("wave10")) {
    const a = createAchievement("wave10");
    if (a) newAchievements.push({ key: "wave10", achievement: a });
  }

  // Gem collector
  if (state.stats.gemsCollected >= 50 && !unlockedSet.has("gems50")) {
    const a = createAchievement("gems50");
    if (a) newAchievements.push({ key: "gems50", achievement: a });
  }

  // UFO hunter
  if (state.stats.ufosDestroyed === 1 && !unlockedSet.has("ufoSlayer")) {
    const a = createAchievement("ufoSlayer");
    if (a) newAchievements.push({ key: "ufoSlayer", achievement: a });
  }

  return newAchievements;
};

// Import kill streak config
import { KILL_STREAK_CONFIG, SCREEN_FLASH_CONFIG } from "./constants";

// Trigger screen flash
export const triggerScreenFlash = (
  type: "kill" | "damage" | "powerUp" | "nuke" | "bossKill"
): ScreenFlash => {
  const config =
    SCREEN_FLASH_CONFIG[`${type}Flash` as keyof typeof SCREEN_FLASH_CONFIG];
  return {
    active: true,
    color: config.color,
    alpha: 1,
    duration: config.duration,
    elapsed: 0,
  };
};

// Update screen flash
export const updateScreenFlash = (
  flash: ScreenFlash,
  deltaTime: number
): ScreenFlash => {
  if (!flash.active) return flash;

  const elapsed = flash.elapsed + deltaTime;
  const progress = elapsed / flash.duration;

  if (progress >= 1) {
    return { ...flash, active: false, alpha: 0, elapsed: flash.duration };
  }

  return {
    ...flash,
    elapsed,
    alpha: 1 - progress,
  };
};

// Register kill and update streak
export const registerKill = (
  streak: KillStreak,
  currentTime: number
): KillStreak => {
  const timeSinceLastKill = currentTime - streak.lastKillTime;
  const isStreak = timeSinceLastKill < streak.streakTimeout;

  const newCount = isStreak ? streak.count + 1 : 1;

  // Find appropriate tier
  let tierIndex = -1;
  let tierText = "";
  for (let i = KILL_STREAK_CONFIG.tiers.length - 1; i >= 0; i--) {
    if (newCount >= KILL_STREAK_CONFIG.tiers[i].count) {
      tierIndex = i;
      tierText = KILL_STREAK_CONFIG.tiers[i].text;
      break;
    }
  }

  return {
    count: newCount,
    lastKillTime: currentTime,
    streakTimeout: KILL_STREAK_CONFIG.timeout,
    currentTier: tierIndex,
    displayText: tierText,
    displayTimer: tierText ? KILL_STREAK_CONFIG.displayDuration : 0,
  };
};

// Update kill streak display timer
export const updateKillStreak = (
  streak: KillStreak,
  deltaTime: number
): KillStreak => {
  if (streak.displayTimer <= 0) return streak;

  return {
    ...streak,
    displayTimer: Math.max(0, streak.displayTimer - deltaTime),
  };
};

// Trigger boss warning
export const triggerBossWarning = (): BossWarning => ({
  active: true,
  timer: 2000,
  duration: 2000,
  pulsePhase: 0,
});

// Update boss warning
export const updateBossWarning = (
  warning: BossWarning,
  deltaTime: number
): BossWarning => {
  if (!warning.active) return warning;

  const timer = warning.timer - deltaTime;

  if (timer <= 0) {
    return { ...warning, active: false, timer: 0 };
  }

  return {
    ...warning,
    timer,
    pulsePhase: warning.pulsePhase + deltaTime * 0.01,
  };
};

// Trigger warp effect
export const triggerWarpEffect = (): WarpEffect => ({
  active: true,
  intensity: 1,
  duration: 800,
  elapsed: 0,
});

// Update warp effect
export const updateWarpEffect = (
  warp: WarpEffect,
  deltaTime: number
): WarpEffect => {
  if (!warp.active) return warp;

  const elapsed = warp.elapsed + deltaTime;

  if (elapsed >= warp.duration) {
    return { ...warp, active: false, elapsed: warp.duration };
  }

  return {
    ...warp,
    elapsed,
  };
};

// Import upgrade config
import { UPGRADE_CONFIG } from "./constants";

// Get upgrade level for a given score
export const getUpgradeForScore = (score: number) => {
  const levels = UPGRADE_CONFIG.levels;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (score >= levels[i].scoreThreshold) {
      return levels[i];
    }
  }
  return levels[0];
};

// Apply upgrade to ship
export const applyUpgrade = (ship: Ship, upgradeLevel: number): Ship => {
  const upgrade =
    UPGRADE_CONFIG.levels[upgradeLevel - 1] || UPGRADE_CONFIG.levels[0];
  return {
    ...ship,
    upgradeLevel: upgrade.level,
    upgradeBonuses: {
      projectileCount: upgrade.projectileCount,
      fireRateMultiplier: upgrade.fireRateMultiplier,
      damageMultiplier: upgrade.damageMultiplier,
      trailLength: upgrade.trailLength,
      glowIntensity: upgrade.glowIntensity,
      auraColor: upgrade.auraColor,
    },
  };
};

// Create upgrade burst particles
export const createUpgradeBurstParticles = (position: Vector2D): Particle[] => {
  const particles: Particle[] = [];
  const count = UPGRADE_CONFIG.upgradeBurstParticles;
  const colors = ["#ffd700", "#ff6b35", "#00fff5", "#ff00ff", "#8b5cf6"];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = randomRange(3, 8);
    particles.push({
      id: generateId(),
      position: { x: position.x, y: position.y },
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed,
      },
      life: randomRange(600, 1200),
      maxLife: 1200,
      size: randomRange(3, 8),
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      type: "sparkle",
    });
  }
  return particles;
};

// Check and apply upgrade based on score
export const checkAndApplyUpgrade = (
  ship: Ship,
  score: number
): { ship: Ship; upgraded: boolean; newLevel: number } => {
  const upgrade = getUpgradeForScore(score);
  if (upgrade.level > ship.upgradeLevel) {
    return {
      ship: applyUpgrade(ship, upgrade.level),
      upgraded: true,
      newLevel: upgrade.level,
    };
  }
  return { ship, upgraded: false, newLevel: ship.upgradeLevel };
};
