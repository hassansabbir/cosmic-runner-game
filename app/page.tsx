"use client";

// Main Game Page - Orchestrates the game flow

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import StartScreen from "@/components/Menu/StartScreen";
import GameOver from "@/components/Menu/GameOver";
import TargetManager, {
  TargetImage,
  loadTargets,
} from "@/components/Menu/TargetManager";
import ShipSelector, {
  ShipDesign,
  loadSelectedShip,
  SHIP_DESIGNS,
} from "@/components/Menu/ShipSelector";
import { GamePhase, GameStats } from "@/types/game";
import { getHighScore } from "@/lib/gameEngine";

// Dynamic import for GameCanvas to avoid SSR issues
const GameCanvas = dynamic(() => import("@/components/Game/GameCanvas"), {
  ssr: false,
  loading: () => (
    <div className="loading">
      <div className="loading-spinner" />
      <div className="loading-text">Loading...</div>
    </div>
  ),
});

export default function Home() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("menu");
  const [highScore, setHighScore] = useState<number>(0);
  const [lastScore, setLastScore] = useState<number>(0);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [lastStats, setLastStats] = useState<GameStats | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  // Target management
  const [showTargetManager, setShowTargetManager] = useState(false);
  const [targets, setTargets] = useState<TargetImage[]>([]);

  // Ship selection
  const [showShipSelector, setShowShipSelector] = useState(false);
  const [selectedShip, setSelectedShip] = useState<ShipDesign>(SHIP_DESIGNS[0]);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    setHighScore(getHighScore());
    setTargets(loadTargets());
    setSelectedShip(loadSelectedShip());
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gamePhase === "menu" && (e.code === "Space" || e.code === "Enter")) {
        e.preventDefault();
        handleStart();
      } else if (
        gamePhase === "gameOver" &&
        (e.code === "Space" || e.code === "Enter")
      ) {
        e.preventDefault();
        handleRestart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gamePhase]);

  const handleStart = useCallback(() => {
    setGamePhase("playing");
    setLastScore(0);
    setIsNewHighScore(false);
    setLastStats(undefined);
  }, []);

  const handleGameStart = useCallback(() => {
    // Called when game actually starts
  }, []);

  const handleGameOver = useCallback(
    (score: number, newHighScore: boolean, stats?: GameStats) => {
      setLastScore(score);
      setIsNewHighScore(newHighScore);
      setLastStats(stats);
      if (newHighScore) {
        setHighScore(score);
      }
    },
    []
  );

  const handleRestart = useCallback(() => {
    setGamePhase("menu");
    // Small delay then start
    setTimeout(() => {
      setGamePhase("playing");
      setLastScore(0);
      setIsNewHighScore(false);
      setLastStats(undefined);
    }, 100);
  }, []);

  const handleMenu = useCallback(() => {
    setGamePhase("menu");
    setHighScore(getHighScore());
  }, []);

  const handleManageTargets = useCallback(() => {
    setShowTargetManager(true);
  }, []);

  const handleTargetsChange = useCallback((newTargets: TargetImage[]) => {
    setTargets(newTargets);
  }, []);

  const handleSelectShip = useCallback(() => {
    setShowShipSelector(true);
  }, []);

  const handleShipChange = useCallback((ship: ShipDesign) => {
    setSelectedShip(ship);
  }, []);

  if (!mounted) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <main>
      {/* Game Canvas - always rendered for background */}
      <GameCanvas
        onGameStart={handleGameStart}
        onGameOver={handleGameOver}
        gamePhase={gamePhase}
        setGamePhase={setGamePhase}
        targetImages={targets}
        selectedShip={selectedShip}
      />

      {/* Menu Screens */}
      {gamePhase === "menu" && (
        <StartScreen
          onStart={handleStart}
          highScore={highScore}
          onManageTargets={handleManageTargets}
          targetCount={targets.length}
          onSelectShip={handleSelectShip}
          selectedShipName={selectedShip.name}
          selectedShipColor={selectedShip.color}
        />
      )}

      {gamePhase === "gameOver" && (
        <GameOver
          score={lastScore}
          isNewHighScore={isNewHighScore}
          onRestart={handleRestart}
          onMenu={handleMenu}
          stats={lastStats}
        />
      )}

      {/* Target Manager Modal */}
      <TargetManager
        isOpen={showTargetManager}
        onClose={() => setShowTargetManager(false)}
        onTargetsChange={handleTargetsChange}
      />

      {/* Ship Selector Modal */}
      <ShipSelector
        isOpen={showShipSelector}
        onClose={() => setShowShipSelector(false)}
        onShipChange={handleShipChange}
        currentShipId={selectedShip.id}
      />
    </main>
  );
}
