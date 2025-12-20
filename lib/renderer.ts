// Canvas Renderer - Handles all game rendering

import {
  GameState,
  Ship,
  Asteroid,
  PowerUp,
  Particle,
  Star,
  Projectile,
  Gem,
  Nebula,
  UFO,
  FloatingText,
  Achievement,
  SpeedLine,
} from "@/types/game";
import {
  COLORS,
  POWERUP_CONFIG,
  SHIP_CONFIG,
  GEM_CONFIG,
  UFO_CONFIG,
  DASH_CONFIG,
} from "./constants";
import { isPowerUpActive, getPowerUpColor } from "./gameEngine";

// Ship design type for renderer
interface ShipDesign {
  id: string;
  name: string;
  color: string;
  accentColor: string;
  type: "fighter" | "cruiser" | "scout" | "interceptor" | "destroyer";
}

// Draw ship with glow effect - supports multiple ship designs
export const drawShip = (
  ctx: CanvasRenderingContext2D,
  ship: Ship,
  time: number,
  hasShield: boolean,
  hasRapidFire: boolean,
  shipDesign?: ShipDesign
) => {
  const { x, y } = ship.position;
  const { width, height } = ship;

  // Use design colors or fallback to default cyan
  const mainColor = shipDesign?.color || COLORS.neonCyan;
  const accentColor = shipDesign?.accentColor || "#0088ff";
  const shipType = shipDesign?.type || "fighter";

  ctx.save();
  ctx.translate(x, y);

  // Draw trail first (behind ship)
  drawShipTrail(ctx, ship.trail, mainColor);

  // Invincibility blink effect
  if (ship.invincible && Math.floor(time / 100) % 2 === 0) {
    ctx.globalAlpha = 0.5;
  }

  // Shield effect
  if (hasShield) {
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(width, height) * 0.8, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.shield;
    ctx.lineWidth = 3;
    ctx.shadowColor = COLORS.shield;
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Rapid fire glow
  if (hasRapidFire) {
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(width, height) * 0.6, 0, Math.PI * 2);
    const pulseAlpha = 0.3 + Math.sin(time * 0.015) * 0.2;
    ctx.fillStyle = `rgba(251, 191, 36, ${pulseAlpha})`;
    ctx.fill();
  }

  // Upgrade level aura (Phase 6)
  if (ship.upgradeLevel && ship.upgradeLevel > 1) {
    const auraRadius =
      Math.max(width, height) * (0.7 + ship.upgradeLevel * 0.1);
    const pulseSize = Math.sin(time * 0.008) * 5;
    const auraColor =
      ship.upgradeBonuses?.auraColor || "rgba(0, 255, 245, 0.3)";
    const glowIntensity = ship.upgradeBonuses?.glowIntensity || 0.3;

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(0, 0, auraRadius + pulseSize, 0, Math.PI * 2);
    ctx.strokeStyle = auraColor;
    ctx.lineWidth = 2 + ship.upgradeLevel;
    ctx.shadowColor = auraColor.replace(/[\d.]+\)$/, "0.8)");
    ctx.shadowBlur = 15 * glowIntensity;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner glow gradient
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, auraRadius);
    gradient.addColorStop(0, auraColor.replace(/[\d.]+\)$/, "0.1)"));
    gradient.addColorStop(0.7, auraColor.replace(/[\d.]+\)$/, "0.05)"));
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // Draw ship body based on type
  drawShipBody(ctx, width, height, shipType, mainColor, accentColor);

  // Glow effect
  ctx.shadowColor = mainColor;
  ctx.shadowBlur = 15;
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Cockpit
  ctx.beginPath();
  ctx.ellipse(0, -height / 6, width / 6, height / 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = `${mainColor}88`;
  ctx.fill();

  // Engine flames (animated)
  const flameHeight = 15 + Math.sin(time * 0.02) * 5;
  const flameGradient = ctx.createLinearGradient(
    0,
    height / 3,
    0,
    height / 3 + flameHeight
  );
  flameGradient.addColorStop(0, hasRapidFire ? "#fbbf24" : mainColor);
  flameGradient.addColorStop(0.5, hasRapidFire ? "#f97316" : accentColor);
  flameGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.beginPath();
  ctx.moveTo(-width / 6, height / 3);
  ctx.lineTo(0, height / 3 + flameHeight);
  ctx.lineTo(width / 6, height / 3);
  ctx.closePath();
  ctx.fillStyle = flameGradient;
  ctx.fill();

  ctx.restore();
};

// Draw ship body based on ship type
const drawShipBody = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  shipType: string,
  mainColor: string,
  accentColor: string
) => {
  ctx.beginPath();

  switch (shipType) {
    case "scout":
      // Sleek arrow shape
      ctx.moveTo(0, -height / 2);
      ctx.lineTo(-width * 0.3, height * 0.1);
      ctx.lineTo(-width / 2, height * 0.4);
      ctx.lineTo(-width * 0.2, height * 0.3);
      ctx.lineTo(0, height * 0.45);
      ctx.lineTo(width * 0.2, height * 0.3);
      ctx.lineTo(width / 2, height * 0.4);
      ctx.lineTo(width * 0.3, height * 0.1);
      break;

    case "cruiser":
      // Heavy rounded shape
      ctx.moveTo(0, -height / 2);
      ctx.lineTo(-width * 0.25, -height * 0.2);
      ctx.lineTo(-width * 0.35, height * 0.1);
      ctx.lineTo(-width * 0.45, height * 0.35);
      ctx.lineTo(-width * 0.15, height * 0.45);
      ctx.lineTo(0, height * 0.35);
      ctx.lineTo(width * 0.15, height * 0.45);
      ctx.lineTo(width * 0.45, height * 0.35);
      ctx.lineTo(width * 0.35, height * 0.1);
      ctx.lineTo(width * 0.25, -height * 0.2);
      break;

    case "interceptor":
      // Sharp aggressive wings
      ctx.moveTo(0, -height / 2);
      ctx.lineTo(-width * 0.15, 0);
      ctx.lineTo(-width / 2, height * 0.3);
      ctx.lineTo(-width * 0.25, height * 0.35);
      ctx.lineTo(0, height * 0.4);
      ctx.lineTo(width * 0.25, height * 0.35);
      ctx.lineTo(width / 2, height * 0.3);
      ctx.lineTo(width * 0.15, 0);
      break;

    case "destroyer":
      // Broad and powerful
      ctx.moveTo(0, -height * 0.4);
      ctx.lineTo(-width * 0.2, -height * 0.3);
      ctx.lineTo(-width * 0.4, 0);
      ctx.lineTo(-width / 2, height * 0.3);
      ctx.lineTo(-width * 0.3, height * 0.4);
      ctx.lineTo(0, height * 0.3);
      ctx.lineTo(width * 0.3, height * 0.4);
      ctx.lineTo(width / 2, height * 0.3);
      ctx.lineTo(width * 0.4, 0);
      ctx.lineTo(width * 0.2, -height * 0.3);
      break;

    case "fighter":
    default:
      // Classic triangle with wings
      ctx.moveTo(0, -height / 2);
      ctx.lineTo(-width / 2, height / 2);
      ctx.lineTo(-width / 4, height / 3);
      ctx.lineTo(0, height / 2.5);
      ctx.lineTo(width / 4, height / 3);
      ctx.lineTo(width / 2, height / 2);
      break;
  }

  ctx.closePath();

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.3, mainColor);
  gradient.addColorStop(1, accentColor);
  ctx.fillStyle = gradient;
  ctx.fill();
};

// Draw ship trail
const drawShipTrail = (
  ctx: CanvasRenderingContext2D,
  trail: { x: number; y: number }[],
  color: string = COLORS.neonCyan
) => {
  if (trail.length < 2) return;

  ctx.save();

  for (let i = 1; i < trail.length; i++) {
    const alpha = i / trail.length;
    const size = (i / trail.length) * 4;

    ctx.beginPath();
    ctx.arc(
      trail[i].x - trail[0].x,
      trail[i].y - trail[0].y,
      size,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = `rgba(0, 255, 245, ${alpha * 0.5})`;
    ctx.fill();
  }

  ctx.restore();
};

// Draw projectile with glow
export const drawProjectile = (
  ctx: CanvasRenderingContext2D,
  projectile: Projectile,
  time: number
) => {
  const { x, y } = projectile.position;

  ctx.save();
  ctx.translate(x, y);

  // Outer glow
  ctx.beginPath();
  ctx.roundRect(
    -projectile.width / 2 - 3,
    -projectile.height / 2 - 3,
    projectile.width + 6,
    projectile.height + 6,
    4
  );
  ctx.fillStyle = projectile.isLaser ? COLORS.laserGlow : COLORS.projectileGlow;
  ctx.fill();

  // Main projectile body
  const gradient = ctx.createLinearGradient(
    0,
    -projectile.height / 2,
    0,
    projectile.height / 2
  );
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.3, projectile.color);
  gradient.addColorStop(1, projectile.isLaser ? "#660000" : "#006666");

  ctx.beginPath();
  ctx.roundRect(
    -projectile.width / 2,
    -projectile.height / 2,
    projectile.width,
    projectile.height,
    3
  );
  ctx.fillStyle = gradient;
  ctx.shadowColor = projectile.color;
  ctx.shadowBlur = 15;
  ctx.fill();

  ctx.restore();
};

// Draw gem with sparkle effect
export const drawGem = (
  ctx: CanvasRenderingContext2D,
  gem: Gem,
  time: number
) => {
  const { x, y } = gem.position;
  const tierConfig = GEM_CONFIG.tiers[gem.tier];
  const color = tierConfig.color;
  const pulseScale = 1 + Math.sin(time * 0.008 + gem.pulsePhase) * 0.1;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(gem.rotation);
  ctx.scale(pulseScale, pulseScale);

  // Outer glow
  ctx.beginPath();
  ctx.arc(0, 0, gem.width / 2 + 8, 0, Math.PI * 2);
  ctx.fillStyle = `${color}33`;
  ctx.fill();

  // Diamond shape
  const size = gem.width / 2;
  ctx.beginPath();
  ctx.moveTo(0, -size); // Top
  ctx.lineTo(size * 0.7, 0); // Right
  ctx.lineTo(0, size); // Bottom
  ctx.lineTo(-size * 0.7, 0); // Left
  ctx.closePath();

  // Gradient fill
  const gradient = ctx.createLinearGradient(-size, -size, size, size);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.3, color);
  gradient.addColorStop(0.7, color);
  gradient.addColorStop(1, `${color}88`);
  ctx.fillStyle = gradient;
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.fill();

  // Inner highlight
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.5);
  ctx.lineTo(size * 0.3, 0);
  ctx.lineTo(0, size * 0.3);
  ctx.lineTo(-size * 0.3, 0);
  ctx.closePath();
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fill();

  // Sparkle effect
  const sparkleTime = (time + gem.sparkleOffset) * 0.01;
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + sparkleTime;
    const dist = size * 0.8;
    const sparkleX = Math.cos(angle) * dist;
    const sparkleY = Math.sin(angle) * dist;
    const sparkleSize = 2 + Math.sin(sparkleTime * 3 + i) * 1;

    ctx.beginPath();
    ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  }

  ctx.restore();
};

// Draw nebula cloud
export const drawNebula = (ctx: CanvasRenderingContext2D, nebula: Nebula) => {
  const { x, y } = nebula.position;

  ctx.save();
  ctx.globalAlpha = nebula.alpha;

  const gradient = ctx.createRadialGradient(x, y, 0, x, y, nebula.size);
  gradient.addColorStop(0, nebula.color);
  gradient.addColorStop(0.5, nebula.color.replace(/[\d.]+\)$/, "0.05)"));
  gradient.addColorStop(1, "transparent");

  ctx.beginPath();
  ctx.arc(x, y, nebula.size, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.restore();
};

// Image cache for target faces
const imageCache = new Map<string, HTMLImageElement>();

const getOrLoadImage = (url: string): HTMLImageElement | null => {
  if (imageCache.has(url)) {
    const img = imageCache.get(url)!;
    return img.complete ? img : null;
  }

  const img = new Image();
  img.src = url;
  imageCache.set(url, img);
  return null; // Not loaded yet
};

// Draw asteroid
export const drawAsteroid = (
  ctx: CanvasRenderingContext2D,
  asteroid: Asteroid,
  time: number
) => {
  const { x, y } = asteroid.position;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(asteroid.rotation);

  // Boss asteroid special effects
  if (asteroid.isBoss) {
    // Pulsing glow
    const pulseAlpha = 0.3 + Math.sin(time * 0.005) * 0.2;
    ctx.beginPath();
    ctx.arc(0, 0, asteroid.width / 2 + 15, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 68, 68, ${pulseAlpha})`;
    ctx.fill();

    // Health bar
    const healthPercent = asteroid.health / asteroid.maxHealth;
    const barWidth = asteroid.width * 1.2;
    const barHeight = 8;
    const barY = -asteroid.height / 2 - 20;

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);

    ctx.fillStyle =
      healthPercent > 0.5
        ? "#22c55e"
        : healthPercent > 0.25
        ? "#fbbf24"
        : "#ef4444";
    ctx.fillRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.strokeRect(-barWidth / 2, barY, barWidth, barHeight);
  }

  // Check if we have a target face image
  if (asteroid.targetImageUrl) {
    const img = getOrLoadImage(asteroid.targetImageUrl);

    if (img) {
      // Draw face image in a circle
      const radius = asteroid.width / 2;

      // Outer glow ring
      ctx.beginPath();
      ctx.arc(0, 0, radius + 5, 0, Math.PI * 2);
      ctx.strokeStyle = asteroid.isBoss ? "#ff4444" : "#ff6b35";
      ctx.lineWidth = 4;
      ctx.shadowColor = asteroid.isBoss ? "#ff0000" : "#ff6b35";
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Clip to circle
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Draw the face image
      ctx.drawImage(img, -radius, -radius, radius * 2, radius * 2);

      // Add target crosshair overlay
      ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-radius * 0.3, 0);
      ctx.lineTo(radius * 0.3, 0);
      ctx.moveTo(0, -radius * 0.3);
      ctx.lineTo(0, radius * 0.3);
      ctx.stroke();
    } else {
      // Fallback to default asteroid while image loads
      drawDefaultAsteroid(ctx, asteroid, time);
    }
  } else {
    // Default asteroid rendering
    drawDefaultAsteroid(ctx, asteroid, time);
  }

  ctx.restore();
};

// Default asteroid polygon rendering
const drawDefaultAsteroid = (
  ctx: CanvasRenderingContext2D,
  asteroid: Asteroid,
  time: number
) => {
  // Draw asteroid polygon
  ctx.beginPath();
  asteroid.vertices.forEach((vertex, i) => {
    if (i === 0) {
      ctx.moveTo(vertex.x, vertex.y);
    } else {
      ctx.lineTo(vertex.x, vertex.y);
    }
  });
  ctx.closePath();

  // Gradient fill
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, asteroid.width / 2);
  if (asteroid.isBoss) {
    gradient.addColorStop(0, "#8b4444");
    gradient.addColorStop(1, COLORS.bossAsteroid);
  } else {
    gradient.addColorStop(0, "#4a4a6a");
    gradient.addColorStop(1, "#2a2a4a");
  }
  ctx.fillStyle = gradient;
  ctx.fill();

  // Stroke
  ctx.strokeStyle = asteroid.isBoss ? "#ff6666" : "#6a6a8a";
  ctx.lineWidth = asteroid.isBoss ? 3 : 2;
  if (asteroid.isBoss) {
    ctx.shadowColor = COLORS.bossGlow;
    ctx.shadowBlur = 10;
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Add some crater details
  ctx.beginPath();
  ctx.arc(
    asteroid.width * 0.15,
    -asteroid.height * 0.1,
    asteroid.width * 0.15,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fill();
};

// Draw power-up
export const drawPowerUp = (
  ctx: CanvasRenderingContext2D,
  powerUp: PowerUp,
  time: number
) => {
  const { x, y } = powerUp.position;
  const color = getPowerUpColor(powerUp.type);
  const pulseScale = 1 + Math.sin(time * 0.005) * 0.1;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(powerUp.rotation);
  ctx.scale(pulseScale, pulseScale);

  // Outer glow
  ctx.beginPath();
  ctx.arc(0, 0, powerUp.width / 2 + 5, 0, Math.PI * 2);
  ctx.fillStyle = `${color}33`;
  ctx.fill();

  // Main circle
  ctx.beginPath();
  ctx.arc(0, 0, powerUp.width / 2, 0, Math.PI * 2);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, powerUp.width / 2);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.3, color);
  gradient.addColorStop(1, `${color}88`);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Glow effect
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Icon
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(POWERUP_CONFIG.icons[powerUp.type], 0, 0);

  ctx.restore();
};

// Draw particles
export const drawParticles = (
  ctx: CanvasRenderingContext2D,
  particles: Particle[]
) => {
  particles.forEach((particle) => {
    ctx.save();
    ctx.globalAlpha = particle.alpha;
    ctx.beginPath();
    ctx.arc(
      particle.position.x,
      particle.position.y,
      particle.size,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = particle.type === "combo" ? 20 : 10;
    ctx.fill();
    ctx.restore();
  });
};

// Draw stars (background)
export const drawStars = (
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  time: number
) => {
  stars.forEach((star) => {
    const twinkle =
      0.5 + Math.sin(time * star.twinkleSpeed + star.position.x) * 0.5;
    const brightness = star.brightness * twinkle;

    ctx.save();
    ctx.globalAlpha = brightness;
    ctx.beginPath();
    ctx.arc(star.position.x, star.position.y, star.width, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.starColors[star.layer % COLORS.starColors.length];
    ctx.fill();

    // Add subtle glow to larger stars
    if (star.width > 1.5) {
      ctx.beginPath();
      ctx.arc(star.position.x, star.position.y, star.width * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.2})`;
      ctx.fill();
    }

    ctx.restore();
  });
};

// Draw combo indicator
export const drawComboIndicator = (
  ctx: CanvasRenderingContext2D,
  combo: { count: number; multiplier: number; isActive: boolean },
  canvasWidth: number,
  time: number
) => {
  if (!combo.isActive || combo.count < 2) return;

  const x = canvasWidth / 2;
  const y = 80;
  const scale = 1 + Math.sin(time * 0.01) * 0.05;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Combo count
  ctx.font = "bold 36px Orbitron, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Gradient text
  const gradient = ctx.createLinearGradient(-50, 0, 50, 0);
  gradient.addColorStop(0, COLORS.comboGold);
  gradient.addColorStop(0.5, "#ffffff");
  gradient.addColorStop(1, COLORS.comboGold);

  ctx.fillStyle = gradient;
  ctx.shadowColor = COLORS.comboGold;
  ctx.shadowBlur = 15;
  ctx.fillText(`${combo.count}x COMBO`, 0, 0);

  // Multiplier
  if (combo.multiplier > 1) {
    ctx.font = "bold 18px Orbitron, sans-serif";
    ctx.fillStyle = "#ff6b35";
    ctx.fillText(`${combo.multiplier}x MULTIPLIER`, 0, 30);
  }

  ctx.restore();
};

// Draw wave transition
export const drawWaveTransition = (
  ctx: CanvasRenderingContext2D,
  wave: number,
  canvasWidth: number,
  canvasHeight: number,
  time: number
) => {
  ctx.save();

  // Semi-transparent overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const x = canvasWidth / 2;
  const y = canvasHeight / 2;
  const scale = 1 + Math.sin(time * 0.01) * 0.05;

  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Wave text
  ctx.font = "bold 48px Orbitron, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLORS.waveBlue;
  ctx.shadowColor = COLORS.waveBlue;
  ctx.shadowBlur = 20;
  ctx.fillText(`WAVE ${wave}`, 0, 0);

  ctx.font = "24px Orbitron, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("GET READY!", 0, 50);

  ctx.restore();
};

// Apply screen shake transformation
export const applyScreenShake = (
  ctx: CanvasRenderingContext2D,
  intensity: number
): { offsetX: number; offsetY: number } => {
  const offsetX = (Math.random() - 0.5) * intensity * 2;
  const offsetY = (Math.random() - 0.5) * intensity * 2;
  ctx.translate(offsetX, offsetY);
  return { offsetX, offsetY };
};

// Draw UFO
export const drawUFO = (
  ctx: CanvasRenderingContext2D,
  ufo: UFO,
  time: number
) => {
  const { x, y } = ufo.position;

  ctx.save();
  ctx.translate(x, y);

  // Glow effect
  ctx.beginPath();
  ctx.ellipse(0, 0, ufo.width / 2 + 10, ufo.height / 2 + 8, 0, 0, Math.PI * 2);
  const glowAlpha = 0.3 + Math.sin(time * 0.008) * 0.1;
  ctx.fillStyle = `rgba(139, 92, 246, ${glowAlpha})`;
  ctx.fill();

  // UFO body (saucer shape)
  ctx.beginPath();
  ctx.ellipse(0, 0, ufo.width / 2, ufo.height / 2, 0, 0, Math.PI * 2);
  const gradient = ctx.createRadialGradient(0, -5, 0, 0, 0, ufo.width / 2);
  gradient.addColorStop(0, "#a78bfa");
  gradient.addColorStop(0.5, "#7c3aed");
  gradient.addColorStop(1, "#4c1d95");
  ctx.fillStyle = gradient;
  ctx.shadowColor = "#8b5cf6";
  ctx.shadowBlur = 15;
  ctx.fill();

  // Dome
  ctx.beginPath();
  ctx.ellipse(0, -5, ufo.width / 4, ufo.height / 2, 0, Math.PI, 0);
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  ctx.fill();

  // Lights
  const lightCount = 5;
  const lightRadius = 3;
  for (let i = 0; i < lightCount; i++) {
    const angle = (i / lightCount) * Math.PI + Math.PI;
    const lx = Math.cos(angle) * (ufo.width / 2 - 5);
    const ly = Math.sin(angle) * (ufo.height / 3);
    const lightAlpha = 0.5 + Math.sin(time * 0.01 + i) * 0.5;

    ctx.beginPath();
    ctx.arc(lx, ly, lightRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${lightAlpha})`;
    ctx.fill();
  }

  // Health bar
  const healthPercent = ufo.health / ufo.maxHealth;
  const barWidth = ufo.width * 0.8;
  const barHeight = 4;
  const barY = -ufo.height / 2 - 10;

  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
  ctx.fillStyle =
    healthPercent > 0.5
      ? "#22c55e"
      : healthPercent > 0.25
      ? "#fbbf24"
      : "#ef4444";
  ctx.fillRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight);

  ctx.restore();
};

// Draw floating text
export const drawFloatingText = (
  ctx: CanvasRenderingContext2D,
  text: FloatingText
) => {
  const alpha = text.life / text.maxLife;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `bold ${text.fontSize}px Orbitron, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = text.color;
  ctx.shadowColor = text.color;
  ctx.shadowBlur = 10;
  ctx.fillText(text.text, text.position.x, text.position.y);
  ctx.restore();
};

// Draw achievement toast
export const drawAchievement = (
  ctx: CanvasRenderingContext2D,
  achievement: Achievement,
  canvasWidth: number
) => {
  const alpha = Math.min(
    1,
    achievement.displayTime / 500,
    (achievement.maxDisplayTime - achievement.displayTime) / 500 + 0.5
  );
  const slideIn = Math.min(
    1,
    (achievement.maxDisplayTime - achievement.displayTime) / 300
  );
  const yOffset = -50 + slideIn * 50;

  ctx.save();
  ctx.globalAlpha = alpha;

  const x = canvasWidth / 2;
  const y = 130 + yOffset;
  const width = 280;
  const height = 60;

  // Background
  const gradient = ctx.createLinearGradient(x - width / 2, y, x + width / 2, y);
  gradient.addColorStop(0, "rgba(139, 92, 246, 0.9)");
  gradient.addColorStop(1, "rgba(244, 114, 182, 0.9)");

  ctx.beginPath();
  ctx.roundRect(x - width / 2, y - height / 2, width, height, 15);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Icon
  ctx.font = "28px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(achievement.icon, x - width / 2 + 15, y);

  // Title
  ctx.font = "bold 16px Orbitron, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(achievement.title, x - width / 2 + 55, y - 8);

  // Description
  ctx.font = "12px Arial, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.fillText(achievement.description, x - width / 2 + 55, y + 12);

  ctx.restore();
};

// Draw speed lines
export const drawSpeedLines = (
  ctx: CanvasRenderingContext2D,
  lines: SpeedLine[]
) => {
  ctx.save();

  lines.forEach((line) => {
    ctx.globalAlpha = line.alpha * 0.5;
    ctx.beginPath();
    ctx.moveTo(line.x, line.y);
    ctx.lineTo(line.x, line.y + line.length);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  ctx.restore();
};

// Draw dash effect
export const drawDashEffect = (
  ctx: CanvasRenderingContext2D,
  ship: Ship,
  time: number
) => {
  if (!ship.isDashing) return;

  ctx.save();

  // Motion blur trail
  const trailLength = 5;
  for (let i = 0; i < trailLength; i++) {
    const alpha = (1 - i / trailLength) * 0.3;
    const offsetX = i * (ship.velocity.x > 0 ? -10 : 10);

    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(ship.position.x + offsetX, ship.position.y - ship.height / 2);
    ctx.lineTo(
      ship.position.x - ship.width / 2 + offsetX,
      ship.position.y + ship.height / 2
    );
    ctx.lineTo(
      ship.position.x + ship.width / 2 + offsetX,
      ship.position.y + ship.height / 2
    );
    ctx.closePath();
    ctx.fillStyle = "#00fff5";
    ctx.fill();
  }

  ctx.restore();
};

// Draw the entire game
export const renderGame = (
  ctx: CanvasRenderingContext2D,
  state: GameState,
  canvasWidth: number,
  canvasHeight: number,
  shipDesign?: ShipDesign
) => {
  const time = Date.now();

  ctx.save();

  // Apply screen shake
  if (state.screenShake.intensity > 0) {
    applyScreenShake(ctx, state.screenShake.intensity);
  }

  // Clear canvas with gradient background
  const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  bgGradient.addColorStop(0, "#0a0a0f");
  bgGradient.addColorStop(0.5, "#1a1a2e");
  bgGradient.addColorStop(1, "#16213e");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(-20, -20, canvasWidth + 40, canvasHeight + 40);

  // Draw nebulae (behind stars)
  state.nebulae.forEach((nebula) => drawNebula(ctx, nebula));

  // Draw stars (always visible)
  drawStars(ctx, state.stars, time);

  // Draw speed lines
  if (state.speedLines.length > 0) {
    drawSpeedLines(ctx, state.speedLines);
  }

  // Only draw game entities when playing or paused
  if (
    state.phase === "playing" ||
    state.phase === "paused" ||
    state.phase === "waveTransition"
  ) {
    // Draw projectiles
    state.projectiles.forEach((projectile) => {
      if (projectile.active) {
        drawProjectile(ctx, projectile, time);
      }
    });

    // Draw asteroids
    state.asteroids.forEach((asteroid) => {
      if (asteroid.active) {
        drawAsteroid(ctx, asteroid, time);
      }
    });

    // Draw UFOs
    state.ufos.forEach((ufo) => {
      if (ufo.active) {
        drawUFO(ctx, ufo, time);
      }
    });

    // Draw gems
    state.gems.forEach((gem) => {
      if (gem.active) {
        drawGem(ctx, gem, time);
      }
    });

    // Draw power-ups
    state.powerUps.forEach((powerUp) => {
      if (powerUp.active) {
        drawPowerUp(ctx, powerUp, time);
      }
    });

    // Draw particles
    drawParticles(ctx, state.particles);

    // Draw dash effect
    drawDashEffect(ctx, state.ship, time);

    // Draw ship
    const hasShield = isPowerUpActive(state.activePowerUps, "shield");
    const hasRapidFire = isPowerUpActive(state.activePowerUps, "rapidfire");
    drawShip(ctx, state.ship, time, hasShield, hasRapidFire, shipDesign);

    // Draw floating texts
    state.floatingTexts.forEach((text) => drawFloatingText(ctx, text));

    // Draw combo indicator
    drawComboIndicator(ctx, state.combo, canvasWidth, time);

    // Draw achievements
    state.achievements.forEach((achievement) =>
      drawAchievement(ctx, achievement, canvasWidth)
    );
  }

  // Wave transition overlay
  if (state.phase === "waveTransition") {
    drawWaveTransition(
      ctx,
      state.wave.current,
      canvasWidth,
      canvasHeight,
      time
    );
  }

  // Draw warp effect
  if (state.warpEffect?.active) {
    drawWarpEffect(ctx, state.warpEffect, canvasWidth, canvasHeight, time);
  }

  // Draw boss warning
  if (state.bossWarning?.active) {
    drawBossWarning(ctx, state.bossWarning, canvasWidth, canvasHeight, time);
  }

  // Draw kill streak announcement
  if (state.killStreak?.displayTimer > 0) {
    drawKillStreak(ctx, state.killStreak, canvasWidth, canvasHeight, time);
  }

  // Draw screen flash (on top of everything)
  if (state.screenFlash?.active) {
    drawScreenFlash(ctx, state.screenFlash, canvasWidth, canvasHeight);
  }

  // Pause overlay
  if (state.phase === "paused") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(-20, -20, canvasWidth + 40, canvasHeight + 40);

    ctx.font = "bold 48px Orbitron, sans-serif";
    ctx.fillStyle = "#00fff5";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "#00fff5";
    ctx.shadowBlur = 20;
    ctx.fillText("PAUSED", canvasWidth / 2, canvasHeight / 2);
    ctx.shadowBlur = 0;
  }

  ctx.restore();
};

// Draw screen flash effect
const drawScreenFlash = (
  ctx: CanvasRenderingContext2D,
  flash: { active: boolean; color: string; alpha: number },
  canvasWidth: number,
  canvasHeight: number
) => {
  if (!flash.active || flash.alpha <= 0) return;

  ctx.save();
  ctx.fillStyle = flash.color;
  ctx.globalAlpha = flash.alpha;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();
};

// Draw kill streak announcement
const drawKillStreak = (
  ctx: CanvasRenderingContext2D,
  streak: { displayText: string; displayTimer: number; currentTier: number },
  canvasWidth: number,
  canvasHeight: number,
  time: number
) => {
  if (!streak.displayText || streak.displayTimer <= 0) return;

  ctx.save();

  const textY = canvasHeight * 0.3;
  const alpha = Math.min(1, streak.displayTimer / 500);
  const scale = 1 + Math.sin(time * 0.01) * 0.05;

  // Color based on tier
  const tierColors = [
    "#fbbf24", // Double
    "#fb923c", // Triple
    "#f97316", // Quad
    "#ef4444", // Rampage
    "#dc2626", // Dominating
    "#ff00ff", // Unstoppable
    "#8b5cf6", // Godlike
  ];
  const color = tierColors[Math.min(streak.currentTier, tierColors.length - 1)];

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = alpha;

  // Outer glow
  ctx.font = `bold ${48 * scale}px Orbitron, sans-serif`;
  ctx.shadowColor = color;
  ctx.shadowBlur = 30;
  ctx.fillStyle = color;
  ctx.fillText(streak.displayText, canvasWidth / 2, textY);

  // Inner white text
  ctx.shadowBlur = 0;
  ctx.font = `bold ${44 * scale}px Orbitron, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(streak.displayText, canvasWidth / 2, textY);

  ctx.restore();
};

// Draw boss warning
const drawBossWarning = (
  ctx: CanvasRenderingContext2D,
  warning: { active: boolean; timer: number; pulsePhase: number },
  canvasWidth: number,
  canvasHeight: number,
  time: number
) => {
  if (!warning.active) return;

  ctx.save();

  const pulseAlpha = 0.3 + Math.sin(time * 0.02) * 0.2;

  // Red vignette border
  const gradient = ctx.createRadialGradient(
    canvasWidth / 2,
    canvasHeight / 2,
    canvasHeight * 0.3,
    canvasWidth / 2,
    canvasHeight / 2,
    canvasHeight * 0.8
  );
  gradient.addColorStop(0, "rgba(255, 0, 0, 0)");
  gradient.addColorStop(1, `rgba(255, 0, 0, ${pulseAlpha})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Warning text
  const textScale = 1 + Math.sin(time * 0.015) * 0.1;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${60 * textScale}px Orbitron, sans-serif`;
  ctx.fillStyle = "#ff0000";
  ctx.shadowColor = "#ff0000";
  ctx.shadowBlur = 20;
  ctx.globalAlpha = 0.5 + Math.sin(time * 0.02) * 0.5;
  ctx.fillText("⚠️ WARNING ⚠️", canvasWidth / 2, canvasHeight / 2 - 30);

  ctx.font = "bold 24px Orbitron, sans-serif";
  ctx.fillText("BOSS INCOMING", canvasWidth / 2, canvasHeight / 2 + 30);

  ctx.restore();
};

// Draw warp effect (speed lines during wave transition)
const drawWarpEffect = (
  ctx: CanvasRenderingContext2D,
  warp: {
    active: boolean;
    intensity: number;
    elapsed: number;
    duration: number;
  },
  canvasWidth: number,
  canvasHeight: number,
  time: number
) => {
  if (!warp.active) return;

  ctx.save();

  const progress = warp.elapsed / warp.duration;
  const intensity = Math.sin(progress * Math.PI) * warp.intensity;
  const lineCount = 40;

  // Draw speed lines from center
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  for (let i = 0; i < lineCount; i++) {
    const angle = (i / lineCount) * Math.PI * 2 + time * 0.001;
    const length = 100 + Math.random() * 200 * intensity;
    const startDist = 50 + Math.random() * 100;

    const x1 = centerX + Math.cos(angle) * startDist;
    const y1 = centerY + Math.sin(angle) * startDist;
    const x2 = centerX + Math.cos(angle) * (startDist + length);
    const y2 = centerY + Math.sin(angle) * (startDist + length);

    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, "rgba(0, 255, 245, 0)");
    gradient.addColorStop(0.5, `rgba(0, 255, 245, ${intensity * 0.5})`);
    gradient.addColorStop(1, "rgba(0, 255, 245, 0)");

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();
};
