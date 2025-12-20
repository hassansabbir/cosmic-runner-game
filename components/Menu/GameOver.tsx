"use client";

// GameOver - Game over screen with score display and stats

import React, { useEffect, useState } from "react";

interface GameStats {
  asteroidsDestroyed: number;
  gemsCollected: number;
  shotsFired: number;
  shotsHit: number;
  maxCombo: number;
  wavesCompleted: number;
  powerUpsCollected: number;
}

interface GameOverProps {
  score: number;
  isNewHighScore: boolean;
  onRestart: () => void;
  onMenu: () => void;
  stats?: GameStats;
}

const GameOver: React.FC<GameOverProps> = ({
  score,
  isNewHighScore,
  onRestart,
  onMenu,
  stats,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Animate score counting up
  useEffect(() => {
    if (score === 0) {
      setDisplayScore(0);
      setAnimationComplete(true);
      return;
    }

    const duration = 1500; // ms
    const frameDuration = 16; // ~60fps
    const totalFrames = duration / frameDuration;
    const increment = score / totalFrames;
    let currentFrame = 0;

    const timer = setInterval(() => {
      currentFrame++;
      setDisplayScore(Math.min(Math.round(increment * currentFrame), score));

      if (currentFrame >= totalFrames) {
        clearInterval(timer);
        setAnimationComplete(true);
      }
    }, frameDuration);

    return () => clearInterval(timer);
  }, [score]);

  const accuracy =
    stats && stats.shotsFired > 0
      ? Math.round((stats.shotsHit / stats.shotsFired) * 100)
      : 0;

  return (
    <div className="menu-screen">
      <h1 className="game-over-title">Game Over</h1>

      <div className="final-score">
        <div className="final-score-label">Your Score</div>
        <div className="final-score-value">{displayScore.toLocaleString()}</div>
      </div>

      {isNewHighScore && animationComplete && (
        <div className="new-high-score">🏆 New High Score! 🏆</div>
      )}

      {/* Stats Grid */}
      {stats && animationComplete && (
        <div className="game-stats-grid">
          <div className="game-stat-card">
            <div className="game-stat-label">Asteroids</div>
            <div className="game-stat-value">{stats.asteroidsDestroyed}</div>
          </div>
          <div className="game-stat-card">
            <div className="game-stat-label">Gems</div>
            <div className="game-stat-value">{stats.gemsCollected}</div>
          </div>
          <div className="game-stat-card">
            <div className="game-stat-label">Max Combo</div>
            <div className="game-stat-value">{stats.maxCombo}x</div>
          </div>
          <div className="game-stat-card">
            <div className="game-stat-label">Waves</div>
            <div className="game-stat-value">{stats.wavesCompleted}</div>
          </div>
          <div className="game-stat-card">
            <div className="game-stat-label">Accuracy</div>
            <div className="game-stat-value">{accuracy}%</div>
          </div>
          <div className="game-stat-card">
            <div className="game-stat-label">Power-Ups</div>
            <div className="game-stat-value">{stats.powerUpsCollected}</div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <button className="start-btn" onClick={onRestart}>
          Play Again
        </button>
        <button
          className="start-btn"
          onClick={onMenu}
          style={{
            borderColor: "var(--neon-magenta)",
            color: "var(--neon-magenta)",
          }}
        >
          Main Menu
        </button>
      </div>

      <div
        style={{
          marginTop: "40px",
          fontSize: "14px",
          color: "var(--star-dim)",
        }}
      >
        Press <kbd>SPACE</kbd> or <kbd>ENTER</kbd> to restart
      </div>
    </div>
  );
};

export default GameOver;
