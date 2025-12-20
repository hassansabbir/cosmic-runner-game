"use client";

// StartScreen - Ultra Dynamic Interactive Title Screen

import React, { useEffect, useRef, useState } from "react";

interface StartScreenProps {
  onStart: () => void;
  highScore: number;
  onManageTargets: () => void;
  targetCount: number;
  onSelectShip: () => void;
  selectedShipName: string;
  selectedShipColor: string;
}

// Star particle for space background
interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkle: number;
}

// Shooting star effect
interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
}

const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  highScore,
  onManageTargets,
  targetCount,
  onSelectShip,
  selectedShipName,
  selectedShipColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animationRef = useRef<number>(0);
  const [isHovering, setIsHovering] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);

  // Initialize stars
  useEffect(() => {
    starsRef.current = Array.from({ length: 200 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.1,
      opacity: Math.random() * 0.8 + 0.2,
      twinkle: Math.random() * Math.PI * 2,
    }));
  }, []);

  // Animate stars and effects
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let frameTime = 0;

    const animate = () => {
      frameTime++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient nebula background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(frameTime * 0.005) * 100,
        canvas.height / 2 + Math.cos(frameTime * 0.003) * 100,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.8
      );
      gradient.addColorStop(0, "rgba(139, 92, 246, 0.15)");
      gradient.addColorStop(0.3, "rgba(59, 130, 246, 0.08)");
      gradient.addColorStop(0.6, "rgba(0, 255, 245, 0.05)");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars with twinkle
      starsRef.current.forEach((star) => {
        star.twinkle += 0.02;
        const twinkleOpacity =
          star.opacity * (0.5 + Math.sin(star.twinkle) * 0.5);

        // Star moves slightly toward mouse
        const dx = mousePos.x - star.x;
        const dy = mousePos.y - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300) {
          star.x += dx * 0.0003;
          star.y += dy * 0.0003;
        }

        // Draw star with glow
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkleOpacity})`;
        ctx.shadowColor = "#00fff5";
        ctx.shadowBlur = star.size * 3;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Spawn shooting stars occasionally
      if (Math.random() < 0.01) {
        shootingStarsRef.current.push({
          x: Math.random() * canvas.width,
          y: 0,
          length: Math.random() * 80 + 40,
          speed: Math.random() * 8 + 4,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
          opacity: 1,
        });
      }

      // Update and draw shooting stars
      shootingStarsRef.current = shootingStarsRef.current.filter((ss) => {
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.opacity -= 0.015;

        if (ss.opacity <= 0) return false;

        // Draw shooting star trail
        const gradient = ctx.createLinearGradient(
          ss.x,
          ss.y,
          ss.x - Math.cos(ss.angle) * ss.length,
          ss.y - Math.sin(ss.angle) * ss.length
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${ss.opacity})`);
        gradient.addColorStop(0.4, `rgba(0, 255, 245, ${ss.opacity * 0.5})`);
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(
          ss.x - Math.cos(ss.angle) * ss.length,
          ss.y - Math.sin(ss.angle) * ss.length
        );
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();

        return ss.y < canvas.height && ss.x < canvas.width;
      });

      // Draw mouse glow effect
      const mouseGradient = ctx.createRadialGradient(
        mousePos.x,
        mousePos.y,
        0,
        mousePos.x,
        mousePos.y,
        150
      );
      mouseGradient.addColorStop(0, "rgba(0, 255, 245, 0.08)");
      mouseGradient.addColorStop(0.5, "rgba(139, 92, 246, 0.04)");
      mouseGradient.addColorStop(1, "transparent");
      ctx.fillStyle = mouseGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      setTime(frameTime);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [mousePos]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="start-screen-container" onMouseMove={handleMouseMove}>
      <canvas ref={canvasRef} className="particle-canvas" />

      {/* Animated gradient overlay */}
      <div
        className="gradient-overlay"
        style={{
          background: `radial-gradient(ellipse at ${
            50 + Math.sin(time * 0.01) * 10
          }% ${50 + Math.cos(time * 0.008) * 10}%, 
            rgba(139, 92, 246, 0.1) 0%, 
            rgba(0, 255, 245, 0.05) 50%, 
            transparent 100%)`,
        }}
      />

      {/* Main content */}
      <div className="start-screen-content">
        {/* Logo section with 3D effect */}
        <div className="logo-section">
          <div className="logo-glow" />
          <h1 className="main-title">
            <span className="title-cosmic">COSMIC</span>
            <span className="title-runner">RUNNER</span>
          </h1>
          <p className="tagline">Navigate the stars. Destroy the targets.</p>
        </div>

        {/* High score display */}
        {highScore > 0 && (
          <div className="trophy-display">
            <div className="trophy-icon">🏆</div>
            <div className="trophy-content">
              <span className="trophy-label">BEST</span>
              <span className="trophy-score">{highScore.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Central start button with pulse effect */}
        <button
          className={`mega-start-btn ${
            isHovering === "start" ? "hovering" : ""
          }`}
          onClick={onStart}
          onMouseEnter={() => setIsHovering("start")}
          onMouseLeave={() => setIsHovering(null)}
        >
          <div className="btn-pulse" />
          <div className="btn-content">
            <span className="play-icon">▶</span>
            <span className="play-text">PLAY</span>
          </div>
          <div className="btn-ring" />
        </button>

        {/* Options row */}
        <div className="options-row">
          <button
            className={`option-btn ${isHovering === "ship" ? "active" : ""}`}
            onClick={onSelectShip}
            onMouseEnter={() => setIsHovering("ship")}
            onMouseLeave={() => setIsHovering(null)}
          >
            <span className="option-emoji">🚀</span>
            <div className="option-info">
              <span className="option-title">SHIP</span>
              <span
                className="option-value"
                style={{ color: selectedShipColor }}
              >
                {selectedShipName}
              </span>
            </div>
          </button>

          <button
            className={`option-btn ${isHovering === "targets" ? "active" : ""}`}
            onClick={onManageTargets}
            onMouseEnter={() => setIsHovering("targets")}
            onMouseLeave={() => setIsHovering(null)}
          >
            <span className="option-emoji">🎯</span>
            <div className="option-info">
              <span className="option-title">TARGETS</span>
              <span className="option-value">
                {targetCount > 0 ? `${targetCount} Loaded` : "Upload"}
              </span>
            </div>
            {targetCount > 0 && (
              <span className="option-badge">{targetCount}</span>
            )}
          </button>
        </div>

        {/* Controls footer */}
        <div className="controls-footer">
          <div className="control-chip">
            <kbd>←→</kbd> Move
          </div>
          <div className="control-chip">
            <kbd>SPACE</kbd> Fire
          </div>
          <div className="control-chip">
            <kbd>SHIFT</kbd> Dash
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="corner-deco top-left" />
      <div className="corner-deco top-right" />
      <div className="corner-deco bottom-left" />
      <div className="corner-deco bottom-right" />

      {/* Scanlines effect */}
      <div className="scanlines" />
    </div>
  );
};

export default StartScreen;
