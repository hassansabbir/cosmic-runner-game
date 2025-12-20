// useGameLoop - Custom hook for smooth 60fps game loop

import { useEffect, useRef, useCallback } from "react";

interface UseGameLoopOptions {
  onUpdate: (deltaTime: number) => void;
  onRender: () => void;
  isRunning: boolean;
  targetFPS?: number;
}

export const useGameLoop = ({
  onUpdate,
  onRender,
  isRunning,
  targetFPS = 60,
}: UseGameLoopOptions) => {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const accumulatorRef = useRef<number>(0);
  const frameInterval = 1000 / targetFPS;

  const gameLoop = useCallback(
    (timestamp: number) => {
      if (previousTimeRef.current === undefined) {
        previousTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - previousTimeRef.current;
      previousTimeRef.current = timestamp;

      if (isRunning) {
        accumulatorRef.current += deltaTime;

        // Fixed time step for physics
        while (accumulatorRef.current >= frameInterval) {
          onUpdate(frameInterval);
          accumulatorRef.current -= frameInterval;
        }
      }

      // Always render (for background animations even when paused)
      onRender();

      requestRef.current = requestAnimationFrame(gameLoop);
    },
    [isRunning, onUpdate, onRender, frameInterval]
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameLoop]);
};
