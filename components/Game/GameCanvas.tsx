"use client";

// GameCanvas - Main game canvas component with full game logic

import React, { useRef, useEffect, useCallback, useState } from "react";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useControls } from "@/hooks/useControls";
import {
  GameState,
  GamePhase,
  Asteroid,
  PowerUp,
  PowerUpType,
  GemTier,
  GameStats,
} from "@/types/game";
import {
  createInitialState,
  createAsteroid,
  createPowerUp,
  createProjectile,
  createGem,
  createUFO,
  createFloatingText,
  createDashParticles,
  createExplosionParticles,
  createPowerUpParticles,
  createGemParticles,
  createComboParticles,
  checkCollision,
  updateStars,
  updateNebulae,
  updateParticles,
  updateFloatingTexts,
  updateAchievements,
  updateSpeedLines,
  updateUFOs,
  updateCombo,
  incrementCombo,
  updateScreenShake,
  triggerScreenShake,
  checkAchievements,
  getDifficultyLevel,
  getSpeedMultiplier,
  getSpawnRateMultiplier,
  getWaveAsteroidCount,
  isBossWave,
  isPowerUpActive,
  getPowerUpColor,
  saveHighScore,
  getHighScore,
  clamp,
  createInitialComboState,
  createInitialWaveState,
  createInitialStats,
  // Phase 5: Dynamic effects
  registerKill,
  triggerScreenFlash,
  updateScreenFlash,
  updateKillStreak,
  triggerBossWarning,
  updateBossWarning,
  triggerWarpEffect,
  updateWarpEffect,
  // Phase 6: Upgrade system
  checkAndApplyUpgrade,
  createUpgradeBurstParticles,
  // Background regeneration
  createStars,
  createNebulae,
} from "@/lib/gameEngine";
import {
  GAME_CONFIG,
  SHIP_CONFIG,
  POWERUP_CONFIG,
  ASTEROID_CONFIG,
  GEM_CONFIG,
  WAVE_CONFIG,
  SCREEN_SHAKE_CONFIG,
  UFO_CONFIG,
  DASH_CONFIG,
  FLOATING_TEXT_CONFIG,
} from "@/lib/constants";
import { renderGame } from "@/lib/renderer";

interface TargetImage {
  id: string;
  dataUrl: string;
  name: string;
}

interface ShipDesign {
  id: string;
  name: string;
  description: string;
  color: string;
  accentColor: string;
  type: "fighter" | "cruiser" | "scout" | "interceptor" | "destroyer";
}

interface GameCanvasProps {
  onGameStart: () => void;
  onGameOver: (
    score: number,
    isNewHighScore: boolean,
    stats?: GameStats
  ) => void;
  gamePhase: GamePhase;
  setGamePhase: (phase: GamePhase) => void;
  targetImages?: TargetImage[];
  selectedShip?: ShipDesign;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  onGameStart,
  onGameOver,
  gamePhase,
  setGamePhase,
  targetImages = [],
  selectedShip,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const gameStateRef = useRef<GameState>(
    createInitialState(canvasSize.width, canvasSize.height, getHighScore())
  );
  const lastAsteroidSpawnRef = useRef<number>(0);
  const lastPowerUpSpawnRef = useRef<number>(0);
  const lastTrailUpdateRef = useRef<number>(0);
  const lastGemSpawnRef = useRef<number>(0);

  const isPlaying = gamePhase === "playing";
  const isActiveGame = gamePhase === "playing" || gamePhase === "paused";
  const {
    direction,
    isPaused,
    isShooting,
    isDashing,
    togglePause,
    setTouchDirection,
    setTouchShooting,
    triggerDash,
  } = useControls(isActiveGame);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setCanvasSize({ width: clientWidth, height: clientHeight });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Regenerate stars and nebulae when canvas size changes significantly
  useEffect(() => {
    if (canvasSize.width > 800 || canvasSize.height > 600) {
      const state = gameStateRef.current;
      // Regenerate background elements with correct dimensions
      state.stars = createStars(canvasSize.width, canvasSize.height);
      state.nebulae = createNebulae(canvasSize.width, canvasSize.height);
    }
  }, [canvasSize.width, canvasSize.height]);

  // Update game state when phase changes
  useEffect(() => {
    const state = gameStateRef.current;
    state.phase = gamePhase;

    if (gamePhase === "menu") {
      // Reset to initial state but keep stars and nebulae
      const newState = createInitialState(
        canvasSize.width,
        canvasSize.height,
        getHighScore()
      );
      newState.stars = state.stars;
      newState.nebulae = state.nebulae;
      gameStateRef.current = newState;
    }
  }, [gamePhase, canvasSize]);

  // Handle pause state
  useEffect(() => {
    if (isPaused && gamePhase === "playing") {
      setGamePhase("paused");
    } else if (!isPaused && gamePhase === "paused") {
      setGamePhase("playing");
    }
  }, [isPaused, gamePhase, setGamePhase]);

  // Fire projectiles
  const handleShooting = useCallback(
    (state: GameState, currentTime: number) => {
      if (!isShooting) return;

      const hasRapidFire = isPowerUpActive(state.activePowerUps, "rapidfire");
      const hasLaser = isPowerUpActive(state.activePowerUps, "laser");
      const cooldown = hasRapidFire
        ? SHIP_CONFIG.rapidFireCooldown
        : SHIP_CONFIG.fireCooldown;

      if (currentTime - state.lastProjectileTime > cooldown) {
        state.projectiles.push(createProjectile(state.ship, hasLaser));
        state.lastProjectileTime = currentTime;
        state.stats.shotsFired++;

        // Triple shot with rapid fire
        if (hasRapidFire) {
          const leftProjectile = createProjectile(state.ship, hasLaser);
          leftProjectile.position.x -= 15;
          leftProjectile.velocity.x = -1;

          const rightProjectile = createProjectile(state.ship, hasLaser);
          rightProjectile.position.x += 15;
          rightProjectile.velocity.x = 1;

          state.projectiles.push(leftProjectile, rightProjectile);
          state.stats.shotsFired += 2;
        }
      }
    },
    [isShooting]
  );

  // Spawn asteroids
  const spawnAsteroids = useCallback(
    (state: GameState, currentTime: number) => {
      if (state.wave.isTransitioning) return;

      const difficulty = getDifficultyLevel(state.score);
      const spawnRate =
        GAME_CONFIG.asteroidSpawnRate * getSpawnRateMultiplier(difficulty);

      if (currentTime - lastAsteroidSpawnRef.current > spawnRate) {
        // Check if we should spawn a boss
        const shouldSpawnBoss =
          isBossWave(state.wave.current) &&
          state.asteroids.filter((a) => a.isBoss).length === 0 &&
          state.wave.asteroidsRemaining <=
            getWaveAsteroidCount(state.wave.current) / 2;

        // Create asteroid
        const asteroid = createAsteroid(canvasSize.width, shouldSpawnBoss);

        // Assign a random target image if any are available
        if (targetImages.length > 0) {
          const randomIndex = Math.floor(Math.random() * targetImages.length);
          asteroid.targetImageUrl = targetImages[randomIndex].dataUrl;
        }

        state.asteroids.push(asteroid);
        lastAsteroidSpawnRef.current = currentTime;
      }
    },
    [canvasSize.width, targetImages]
  );

  // Spawn power-ups
  const spawnPowerUps = useCallback(
    (state: GameState, currentTime: number) => {
      if (
        currentTime - lastPowerUpSpawnRef.current >
        GAME_CONFIG.powerUpSpawnRate
      ) {
        if (Math.random() < 0.35) {
          state.powerUps.push(createPowerUp(canvasSize.width));
        }
        lastPowerUpSpawnRef.current = currentTime;
      }
    },
    [canvasSize.width]
  );

  // Update ship position
  const updateShip = useCallback(
    (state: GameState, deltaTime: number) => {
      const { ship } = state;
      const slowMoActive = isPowerUpActive(state.activePowerUps, "slowmo");
      const speedMultiplier = slowMoActive ? 1.5 : 1;

      // Smooth acceleration
      const targetVelocity =
        direction === "left"
          ? -GAME_CONFIG.shipSpeed * speedMultiplier
          : direction === "right"
          ? GAME_CONFIG.shipSpeed * speedMultiplier
          : 0;

      ship.velocity.x += (targetVelocity - ship.velocity.x) * 0.2;

      // Update position
      ship.position.x += ship.velocity.x;
      ship.position.x = clamp(
        ship.position.x,
        ship.width / 2,
        canvasSize.width - ship.width / 2
      );

      // Update trail
      const currentTime = Date.now();
      if (currentTime - lastTrailUpdateRef.current > 30) {
        ship.trail.unshift({ x: ship.position.x, y: ship.position.y });
        if (ship.trail.length > SHIP_CONFIG.trailLength) {
          ship.trail.pop();
        }
        lastTrailUpdateRef.current = currentTime;
      }

      // Update invincibility
      if (ship.invincible) {
        ship.invincibleTimer -= deltaTime;
        if (ship.invincibleTimer <= 0) {
          ship.invincible = false;
        }
      }
    },
    [direction, canvasSize.width]
  );

  // Update projectiles
  const updateProjectiles = useCallback(
    (state: GameState, deltaTime: number) => {
      state.projectiles = state.projectiles.filter((projectile) => {
        projectile.position.x += projectile.velocity.x;
        projectile.position.y += projectile.velocity.y;
        return projectile.position.y > -projectile.height && projectile.active;
      });
    },
    []
  );

  // Update asteroids
  const updateAsteroids = useCallback(
    (state: GameState, deltaTime: number) => {
      const difficulty = getDifficultyLevel(state.score);
      const speedMultiplier = getSpeedMultiplier(difficulty);
      const slowMoActive = isPowerUpActive(state.activePowerUps, "slowmo");
      const effectiveSpeed = slowMoActive
        ? speedMultiplier * 0.5
        : speedMultiplier;

      state.asteroids = state.asteroids.filter((asteroid) => {
        asteroid.position.x += asteroid.velocity.x * effectiveSpeed;
        asteroid.position.y += asteroid.velocity.y * effectiveSpeed;
        asteroid.rotation += asteroid.rotationSpeed;
        return asteroid.position.y < canvasSize.height + asteroid.height;
      });
    },
    [canvasSize.height]
  );

  // Update gems
  const updateGems = useCallback(
    (state: GameState) => {
      const magnetActive = isPowerUpActive(state.activePowerUps, "magnet");

      state.gems = state.gems.filter((gem) => {
        // Magnet effect - always active for gems at close range
        const dx = state.ship.position.x - gem.position.x;
        const dy = state.ship.position.y - gem.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const magnetRange = magnetActive
          ? GEM_CONFIG.magnetRange * 1.5
          : GEM_CONFIG.magnetRange * 0.5;
        const magnetSpeed = magnetActive
          ? GEM_CONFIG.magnetSpeed
          : GEM_CONFIG.magnetSpeed * 0.5;

        if (dist < magnetRange) {
          gem.position.x += (dx / dist) * magnetSpeed;
          gem.position.y += (dy / dist) * magnetSpeed;
        } else {
          gem.position.y += gem.velocity.y;
        }

        gem.rotation += 0.03;
        return gem.position.y < canvasSize.height + gem.height && gem.active;
      });
    },
    [canvasSize.height]
  );

  // Update power-ups
  const updatePowerUps = useCallback(
    (state: GameState) => {
      const magnetActive = isPowerUpActive(state.activePowerUps, "magnet");

      state.powerUps = state.powerUps.filter((powerUp) => {
        if (magnetActive) {
          const dx = state.ship.position.x - powerUp.position.x;
          const dy = state.ship.position.y - powerUp.position.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            powerUp.position.x += (dx / dist) * 3;
            powerUp.position.y += (dy / dist) * 3;
          }
        }

        powerUp.position.y += powerUp.velocity.y;
        powerUp.rotation += 0.02;
        return powerUp.position.y < canvasSize.height + powerUp.height;
      });
    },
    [canvasSize.height]
  );

  // Update active power-ups timer
  const updateActivePowerUps = useCallback(
    (state: GameState, deltaTime: number) => {
      state.activePowerUps = state.activePowerUps
        .map((p) => ({
          ...p,
          remainingTime: p.remainingTime - deltaTime,
        }))
        .filter((p) => p.remainingTime > 0);
    },
    []
  );

  // Handle wave transitions
  const updateWaves = useCallback(
    (state: GameState, deltaTime: number) => {
      if (state.wave.isTransitioning) {
        state.wave.transitionTimer -= deltaTime;
        if (state.wave.transitionTimer <= 0) {
          state.wave.isTransitioning = false;
          state.wave.current++;
          state.wave.asteroidsRemaining = getWaveAsteroidCount(
            state.wave.current
          );
          state.stats.wavesCompleted++;
          setGamePhase("playing");
        }
      } else if (
        state.wave.asteroidsRemaining <= 0 &&
        state.asteroids.length === 0
      ) {
        // Start wave transition
        state.wave.isTransitioning = true;
        state.wave.transitionTimer = WAVE_CONFIG.transitionDuration;
        setGamePhase("waveTransition");
      }
    },
    [setGamePhase]
  );

  // Check collisions
  const checkCollisions = useCallback((state: GameState) => {
    const { ship, asteroids, powerUps, projectiles, gems } = state;
    const hasShield = isPowerUpActive(state.activePowerUps, "shield");
    const currentTime = Date.now();

    // Check projectile-asteroid collisions
    for (const projectile of projectiles) {
      if (!projectile.active) continue;

      for (const asteroid of asteroids) {
        if (!asteroid.active) continue;

        if (checkCollision(projectile, asteroid)) {
          projectile.active = false;
          asteroid.health -= projectile.damage;
          state.stats.shotsHit++;

          // Add hit particles
          state.particles.push(
            ...createExplosionParticles(
              { x: projectile.position.x, y: projectile.position.y },
              5,
              ["#ffffff", "#00fff5"]
            )
          );

          // Screen shake on hit
          state.screenShake = triggerScreenShake(
            SCREEN_SHAKE_CONFIG.hitIntensity,
            100
          );

          if (asteroid.health <= 0) {
            asteroid.active = false;
            state.particles.push(
              ...createExplosionParticles(asteroid.position)
            );

            // Increment combo
            state.combo = incrementCombo(state.combo, currentTime);

            // Register kill for streak system
            state.killStreak = registerKill(state.killStreak, currentTime);

            // Screen flash on kill (boss gets special flash)
            state.screenFlash = triggerScreenFlash(
              asteroid.isBoss ? "bossKill" : "kill"
            );

            // Bonus points with combo multiplier
            const basePoints = asteroid.isBoss
              ? ASTEROID_CONFIG.bossConfig.points
              : ASTEROID_CONFIG.sizes[asteroid.size].points;
            state.score += basePoints * state.combo.multiplier;

            // Check for ship upgrade based on new score
            const upgradeResult = checkAndApplyUpgrade(state.ship, state.score);
            if (upgradeResult.upgraded) {
              state.ship = upgradeResult.ship;
              // Level up effects!
              state.particles.push(
                ...createUpgradeBurstParticles(state.ship.position)
              );
              state.screenFlash = triggerScreenFlash("powerUp");
              state.floatingTexts.push(
                createFloatingText(
                  { x: state.ship.position.x, y: state.ship.position.y - 50 },
                  `⬆️ LEVEL ${upgradeResult.newLevel}!`,
                  "#ffd700",
                  true
                )
              );
            }

            state.stats.asteroidsDestroyed++;
            state.wave.totalAsteroidsDestroyed++;
            state.wave.asteroidsRemaining = Math.max(
              0,
              state.wave.asteroidsRemaining - 1
            );

            // Combo particles
            if (state.combo.count % 5 === 0 && state.combo.count > 0) {
              state.particles.push(...createComboParticles(asteroid.position));
            }

            // Spawn gem
            if (Math.random() < GEM_CONFIG.spawnChance) {
              state.gems.push(createGem(asteroid.position));
            }

            // Screen shake for destruction
            const shakeIntensity = asteroid.isBoss
              ? SCREEN_SHAKE_CONFIG.nukeIntensity
              : SCREEN_SHAKE_CONFIG.explosionIntensity;
            state.screenShake = triggerScreenShake(shakeIntensity);

            // Floating score text
            const scoreText = `+${basePoints * state.combo.multiplier}`;
            state.floatingTexts.push(
              createFloatingText(
                asteroid.position,
                scoreText,
                FLOATING_TEXT_CONFIG.pointsColor,
                asteroid.isBoss
              )
            );
          }
        }
      }
    }

    // Projectile-UFO collisions
    for (const projectile of projectiles) {
      if (!projectile.active) continue;

      for (const ufo of state.ufos) {
        if (!ufo.active) continue;

        if (checkCollision(projectile, ufo)) {
          projectile.active = false;
          ufo.health -= projectile.damage;
          state.stats.shotsHit++;

          if (ufo.health <= 0) {
            ufo.active = false;
            state.particles.push(
              ...createExplosionParticles(ufo.position, 35, [
                "#8b5cf6",
                "#a78bfa",
                "#c4b5fd",
              ])
            );
            state.score += UFO_CONFIG.points * state.combo.multiplier;
            state.stats.ufosDestroyed++;
            state.combo = incrementCombo(state.combo, currentTime);

            // Floating text
            state.floatingTexts.push(
              createFloatingText(
                ufo.position,
                `+${UFO_CONFIG.points * state.combo.multiplier}`,
                "#8b5cf6",
                true
              )
            );

            // Always drop a gem from UFO
            state.gems.push(createGem(ufo.position));
            state.screenShake = triggerScreenShake(
              SCREEN_SHAKE_CONFIG.explosionIntensity
            );
          }
        }
      }
    }

    // Check ship-asteroid collisions
    for (const asteroid of asteroids) {
      if (!asteroid.active) continue;

      if (checkCollision(ship, asteroid)) {
        asteroid.active = false;

        // Re-check shield status at collision time to ensure it's current
        const shieldActive = isPowerUpActive(state.activePowerUps, "shield");

        if (!ship.invincible && !shieldActive) {
          // Trigger damage screen flash
          state.screenFlash = triggerScreenFlash("damage");
          state.particles.push(...createExplosionParticles(ship.position));
          state.screenShake = triggerScreenShake(
            SCREEN_SHAKE_CONFIG.nukeIntensity
          );

          // Reset combo on death
          state.combo = createInitialComboState();
          state.stats.maxCombo = Math.max(
            state.stats.maxCombo,
            state.combo.maxCombo
          );

          return true; // Game over
        } else {
          // Destroy asteroid with shield/invincibility - player is protected!
          state.particles.push(...createExplosionParticles(asteroid.position));
          state.score += ASTEROID_CONFIG.sizes[asteroid.size].points;
        }
      }
    }

    // Check gem collisions
    for (const gem of gems) {
      if (!gem.active) continue;

      if (checkCollision(ship, gem)) {
        gem.active = false;
        state.particles.push(...createGemParticles(gem.position, gem.tier));

        const gemPoints = GEM_CONFIG.tiers[gem.tier].points;
        state.score += gemPoints * state.combo.multiplier;
        state.stats.gemsCollected++;
      }
    }

    // Check power-up collisions
    for (const powerUp of powerUps) {
      if (!powerUp.active) continue;

      if (checkCollision(ship, powerUp)) {
        powerUp.active = false;
        state.stats.powerUpsCollected++;

        // Add particles
        state.particles.push(
          ...createPowerUpParticles(
            powerUp.position,
            getPowerUpColor(powerUp.type)
          )
        );

        // Handle nuke power-up
        if (powerUp.type === "nuke") {
          // Destroy all asteroids
          for (const asteroid of state.asteroids) {
            if (asteroid.active) {
              state.particles.push(
                ...createExplosionParticles(asteroid.position)
              );
              state.score += asteroid.isBoss
                ? ASTEROID_CONFIG.bossConfig.points
                : ASTEROID_CONFIG.sizes[asteroid.size].points;
              state.stats.asteroidsDestroyed++;

              // Spawn gems
              if (Math.random() < GEM_CONFIG.spawnChance * 1.5) {
                state.gems.push(createGem(asteroid.position));
              }
            }
          }
          state.asteroids = [];
          state.screenShake = triggerScreenShake(
            SCREEN_SHAKE_CONFIG.nukeIntensity
          );
          continue;
        }

        // Apply power-up
        const existingIndex = state.activePowerUps.findIndex(
          (p) => p.type === powerUp.type
        );
        if (existingIndex >= 0) {
          state.activePowerUps[existingIndex].remainingTime +=
            POWERUP_CONFIG.duration[powerUp.type] / 2;
        } else {
          state.activePowerUps.push({
            type: powerUp.type,
            remainingTime: POWERUP_CONFIG.duration[powerUp.type],
            duration: POWERUP_CONFIG.duration[powerUp.type],
          });
        }
      }
    }

    // Remove inactive entities
    state.asteroids = state.asteroids.filter((a) => a.active);
    state.powerUps = state.powerUps.filter((p) => p.active);
    state.gems = state.gems.filter((g) => g.active);
    state.projectiles = state.projectiles.filter((p) => p.active);

    return false;
  }, []);

  // Main game update
  const handleUpdate = useCallback(
    (deltaTime: number) => {
      const state = gameStateRef.current;
      const currentTime = Date.now();

      // Always update background elements
      state.stars = updateStars(
        state.stars,
        deltaTime,
        canvasSize.height,
        canvasSize.width
      );
      state.nebulae = updateNebulae(
        state.nebulae,
        deltaTime,
        canvasSize.height,
        canvasSize.width
      );

      // Update screen shake
      state.screenShake = updateScreenShake(state.screenShake, deltaTime);

      // Only update game when playing
      if (state.phase !== "playing") {
        // Handle wave transition timer
        if (state.phase === "waveTransition") {
          updateWaves(state, deltaTime);
        }
        return;
      }

      state.gameTime += deltaTime;

      // Update combo timeout
      state.combo = updateCombo(state.combo, currentTime);

      // Update difficulty
      state.difficulty = getDifficultyLevel(state.score);

      // Handle shooting
      handleShooting(state, currentTime);

      // Spawn entities
      spawnAsteroids(state, currentTime);
      spawnPowerUps(state, currentTime);

      // Update entities
      updateShip(state, deltaTime);
      updateProjectiles(state, deltaTime);
      updateAsteroids(state, deltaTime);
      updateGems(state);
      updatePowerUps(state);
      updateActivePowerUps(state, deltaTime);
      updateWaves(state, deltaTime);

      // Update particles
      state.particles = updateParticles(state.particles, deltaTime);

      // Limit particles
      if (state.particles.length > GAME_CONFIG.maxParticles) {
        state.particles = state.particles.slice(-GAME_CONFIG.maxParticles);
      }

      // Phase 2 Updates: UFOs, floating texts, achievements, speed lines
      state.ufos = updateUFOs(
        state.ufos,
        deltaTime,
        canvasSize.width,
        canvasSize.height,
        currentTime
      );
      state.floatingTexts = updateFloatingTexts(state.floatingTexts, deltaTime);
      state.achievements = updateAchievements(state.achievements, deltaTime);
      state.speedLines = updateSpeedLines(
        state.speedLines,
        deltaTime,
        canvasSize.height,
        canvasSize.width,
        state.ship.velocity.x
      );

      // Phase 5 Updates: Dynamic visual effects
      state.screenFlash = updateScreenFlash(state.screenFlash, deltaTime);
      state.killStreak = updateKillStreak(state.killStreak, deltaTime);
      state.bossWarning = updateBossWarning(state.bossWarning, deltaTime);
      state.warpEffect = updateWarpEffect(state.warpEffect, deltaTime);

      // Check for new achievements
      const newAchievements = checkAchievements(
        state,
        state.unlockedAchievements
      );
      for (const { key, achievement } of newAchievements) {
        state.unlockedAchievements.add(key);
        state.achievements.push(achievement);
      }

      // Spawn UFOs occasionally (after wave 3)
      if (
        state.wave.current >= UFO_CONFIG.waveStart &&
        state.ufos.length === 0
      ) {
        if (Math.random() < UFO_CONFIG.spawnChance * 0.01) {
          state.ufos.push(createUFO(canvasSize.width));
        }
      }

      // Check collisions
      const gameOver = checkCollisions(state);

      if (gameOver) {
        // Update max combo stat
        state.stats.maxCombo = Math.max(
          state.stats.maxCombo,
          state.combo.maxCombo
        );

        const isNewHighScore = state.score > state.highScore;
        if (isNewHighScore) {
          saveHighScore(state.score);
          state.highScore = state.score;
        }
        setGamePhase("gameOver");
        onGameOver(state.score, isNewHighScore, state.stats);
      }

      // Add score over time
      const doubleActive = isPowerUpActive(state.activePowerUps, "double");
      const scoreIncrement = doubleActive ? 2 : 1;
      if (
        Math.floor(state.gameTime / 100) >
        Math.floor((state.gameTime - deltaTime) / 100)
      ) {
        state.score += scoreIncrement;
      }
    },
    [
      canvasSize,
      handleShooting,
      spawnAsteroids,
      spawnPowerUps,
      updateShip,
      updateProjectiles,
      updateAsteroids,
      updateGems,
      updatePowerUps,
      updateActivePowerUps,
      updateWaves,
      checkCollisions,
      setGamePhase,
      onGameOver,
    ]
  );

  // Render game
  const handleRender = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    renderGame(
      ctx,
      gameStateRef.current,
      canvasSize.width,
      canvasSize.height,
      selectedShip
    );
  }, [canvasSize, selectedShip]);

  // Game loop
  useGameLoop({
    onUpdate: handleUpdate,
    onRender: handleRender,
    isRunning: gamePhase === "playing" || gamePhase === "waveTransition",
  });

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent, dir: "left" | "right") => {
    e.preventDefault();
    setTouchDirection(dir);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setTouchDirection("none");
  };

  // Get state for UI
  const score = gameStateRef.current.score;
  const highScore = gameStateRef.current.highScore;
  const activePowerUps = gameStateRef.current.activePowerUps;
  const wave = gameStateRef.current.wave;
  const combo = gameStateRef.current.combo;
  const stats = gameStateRef.current.stats;

  return (
    <div ref={containerRef} className="game-container">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="game-canvas"
      />

      {/* UI Overlay - only show during gameplay */}
      {(gamePhase === "playing" ||
        gamePhase === "paused" ||
        gamePhase === "waveTransition") && (
        <div className="ui-overlay">
          {/* Score */}
          <div className="score-display">
            <span className="score-label">Score</span>
            <span className="score-value">{score.toLocaleString()}</span>
          </div>

          {/* Wave indicator */}
          <div className="wave-indicator">
            <span className="wave-label">Wave</span>
            <span className="wave-value">{wave.current}</span>
          </div>

          {/* High Score */}
          <div className="high-score">
            <span className="score-label">Best</span>
            <span className="score-value">{highScore.toLocaleString()}</span>
          </div>

          {/* Pause Button */}
          <button
            className="pause-btn"
            onClick={togglePause}
            style={{ top: "80px" }}
          >
            <svg viewBox="0 0 24 24">
              {gamePhase === "paused" ? (
                <polygon points="5,3 19,12 5,21" />
              ) : (
                <>
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </>
              )}
            </svg>
          </button>

          {/* Stats display */}
          <div className="stats-display">
            <div className="stat-item">
              <span className="stat-icon">💎</span>
              <span className="stat-value">{stats.gemsCollected}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">💥</span>
              <span className="stat-value">{stats.asteroidsDestroyed}</span>
            </div>
          </div>

          {/* Active Power-ups */}
          {activePowerUps.length > 0 && (
            <div className="powerup-indicators">
              {activePowerUps.map((p) => (
                <div
                  key={p.type}
                  className="powerup-indicator active"
                  style={{ borderColor: getPowerUpColor(p.type) }}
                >
                  {POWERUP_CONFIG.icons[p.type]}
                  <div
                    className="powerup-timer"
                    style={{
                      height: `${(p.remainingTime / p.duration) * 100}%`,
                      background: getPowerUpColor(p.type),
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Touch Controls (mobile) */}
          <div className="touch-controls">
            <button
              className="touch-btn"
              onTouchStart={(e) => handleTouchStart(e, "left")}
              onTouchEnd={handleTouchEnd}
              onMouseDown={() => setTouchDirection("left")}
              onMouseUp={() => setTouchDirection("none")}
              onMouseLeave={() => setTouchDirection("none")}
            >
              <svg viewBox="0 0 24 24">
                <polygon points="15,4 15,20 5,12" />
              </svg>
            </button>

            {/* Fire button */}
            <button
              className="touch-btn fire-btn"
              onTouchStart={() => setTouchShooting(true)}
              onTouchEnd={() => setTouchShooting(false)}
              onMouseDown={() => setTouchShooting(true)}
              onMouseUp={() => setTouchShooting(false)}
              onMouseLeave={() => setTouchShooting(false)}
            >
              <svg viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>

            <button
              className="touch-btn"
              onTouchStart={(e) => handleTouchStart(e, "right")}
              onTouchEnd={handleTouchEnd}
              onMouseDown={() => setTouchDirection("right")}
              onMouseUp={() => setTouchDirection("none")}
              onMouseLeave={() => setTouchDirection("none")}
            >
              <svg viewBox="0 0 24 24">
                <polygon points="9,4 9,20 19,12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
