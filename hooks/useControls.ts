// useControls - Custom hook for keyboard and touch input

import { useState, useEffect, useCallback, useRef } from "react";

export type Direction = "left" | "right" | "none";

interface UseControlsReturn {
  direction: Direction;
  isPaused: boolean;
  isShooting: boolean;
  isDashing: boolean;
  togglePause: () => void;
  setTouchDirection: (dir: Direction) => void;
  setTouchShooting: (shooting: boolean) => void;
  triggerDash: () => void;
}

export const useControls = (isPlaying: boolean): UseControlsReturn => {
  const [direction, setDirection] = useState<Direction>("none");
  const [isPaused, setIsPaused] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  const [isDashing, setIsDashing] = useState(false);
  const keysPressed = useRef<Set<string>>(new Set());
  const lastDashTime = useRef<number>(0);

  const updateDirection = useCallback(() => {
    const left =
      keysPressed.current.has("ArrowLeft") || keysPressed.current.has("KeyA");
    const right =
      keysPressed.current.has("ArrowRight") || keysPressed.current.has("KeyD");

    if (left && !right) {
      setDirection("left");
    } else if (right && !left) {
      setDirection("right");
    } else {
      setDirection("none");
    }
  }, []);

  const updateShooting = useCallback(() => {
    const shooting = keysPressed.current.has("Space");
    setIsShooting(shooting);
  }, []);

  const triggerDash = useCallback(() => {
    const now = Date.now();
    // Dash cooldown of 1 second
    if (now - lastDashTime.current > 1000) {
      setIsDashing(true);
      lastDashTime.current = now;
      // Reset dash after animation
      setTimeout(() => setIsDashing(false), 150);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Prevent default for game keys
      if (
        [
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Space",
          "KeyA",
          "KeyD",
          "ShiftLeft",
          "ShiftRight",
        ].includes(e.code)
      ) {
        e.preventDefault();
      }

      // Pause toggle
      if (e.code === "Escape" || e.code === "KeyP") {
        if (isPlaying) {
          setIsPaused((prev) => !prev);
        }
        return;
      }

      // Dash on Shift
      if ((e.code === "ShiftLeft" || e.code === "ShiftRight") && isPlaying) {
        triggerDash();
        return;
      }

      keysPressed.current.add(e.code);
      updateDirection();
      updateShooting();
    },
    [isPlaying, updateDirection, updateShooting, triggerDash]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);
      updateDirection();
      updateShooting();
    },
    [updateDirection, updateShooting]
  );

  // Touch controls
  const setTouchDirection = useCallback((dir: Direction) => {
    setDirection(dir);
  }, []);

  const setTouchShooting = useCallback((shooting: boolean) => {
    setIsShooting(shooting);
  }, []);

  const togglePause = useCallback(() => {
    if (isPlaying) {
      setIsPaused((prev) => !prev);
    }
  }, [isPlaying]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Reset direction when not playing
  useEffect(() => {
    if (!isPlaying) {
      setDirection("none");
      setIsPaused(false);
      setIsShooting(false);
      setIsDashing(false);
      keysPressed.current.clear();
    }
  }, [isPlaying]);

  return {
    direction,
    isPaused,
    isShooting,
    isDashing,
    togglePause,
    setTouchDirection,
    setTouchShooting,
    triggerDash,
  };
};
