"use client";

// ShipSelector - Component for selecting different ship designs

import React, { useState, useEffect, useCallback } from "react";

export interface ShipDesign {
  id: string;
  name: string;
  description: string;
  color: string;
  accentColor: string;
  type: "fighter" | "cruiser" | "scout" | "interceptor" | "destroyer";
}

// Available ship designs
export const SHIP_DESIGNS: ShipDesign[] = [
  {
    id: "default",
    name: "Cosmic Fighter",
    description: "Balanced & reliable",
    color: "#00fff5",
    accentColor: "#0088ff",
    type: "fighter",
  },
  {
    id: "phoenix",
    name: "Phoenix",
    description: "Sleek & fast",
    color: "#ff6b35",
    accentColor: "#ff4444",
    type: "scout",
  },
  {
    id: "nebula",
    name: "Nebula Cruiser",
    description: "Heavy & powerful",
    color: "#8b5cf6",
    accentColor: "#a855f7",
    type: "cruiser",
  },
  {
    id: "viper",
    name: "Viper X",
    description: "Aggressive design",
    color: "#22c55e",
    accentColor: "#16a34a",
    type: "interceptor",
  },
  {
    id: "shadow",
    name: "Shadow Stealth",
    description: "Dark & mysterious",
    color: "#6366f1",
    accentColor: "#818cf8",
    type: "fighter",
  },
  {
    id: "solar",
    name: "Solar Flare",
    description: "Radiant energy",
    color: "#fbbf24",
    accentColor: "#f59e0b",
    type: "destroyer",
  },
];

interface ShipSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onShipChange: (ship: ShipDesign) => void;
  currentShipId: string;
}

const STORAGE_KEY = "cosmicRunnerShip";

// Load selected ship from localStorage
export const loadSelectedShip = (): ShipDesign => {
  if (typeof window === "undefined") return SHIP_DESIGNS[0];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const ship = SHIP_DESIGNS.find((s) => s.id === saved);
      return ship || SHIP_DESIGNS[0];
    }
    return SHIP_DESIGNS[0];
  } catch {
    return SHIP_DESIGNS[0];
  }
};

// Save selected ship to localStorage
export const saveSelectedShip = (shipId: string): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, shipId);
  } catch (e) {
    console.error("Failed to save ship:", e);
  }
};

// Render ship preview on canvas
const renderShipPreview = (
  ctx: CanvasRenderingContext2D,
  design: ShipDesign,
  size: number
) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const scale = size / 80;

  ctx.save();
  ctx.translate(centerX, centerY);

  // Glow effect
  ctx.shadowColor = design.color;
  ctx.shadowBlur = 15;

  switch (design.type) {
    case "fighter":
      // Classic triangle with wings
      ctx.beginPath();
      ctx.moveTo(0, -25 * scale);
      ctx.lineTo(-20 * scale, 20 * scale);
      ctx.lineTo(-8 * scale, 15 * scale);
      ctx.lineTo(0, 25 * scale);
      ctx.lineTo(8 * scale, 15 * scale);
      ctx.lineTo(20 * scale, 20 * scale);
      ctx.closePath();
      break;

    case "scout":
      // Sleek arrow shape
      ctx.beginPath();
      ctx.moveTo(0, -28 * scale);
      ctx.lineTo(-15 * scale, 5 * scale);
      ctx.lineTo(-25 * scale, 20 * scale);
      ctx.lineTo(-10 * scale, 15 * scale);
      ctx.lineTo(0, 22 * scale);
      ctx.lineTo(10 * scale, 15 * scale);
      ctx.lineTo(25 * scale, 20 * scale);
      ctx.lineTo(15 * scale, 5 * scale);
      ctx.closePath();
      break;

    case "cruiser":
      // Heavy rounded shape
      ctx.beginPath();
      ctx.moveTo(0, -22 * scale);
      ctx.lineTo(-12 * scale, -10 * scale);
      ctx.lineTo(-18 * scale, 5 * scale);
      ctx.lineTo(-22 * scale, 18 * scale);
      ctx.lineTo(-8 * scale, 22 * scale);
      ctx.lineTo(0, 18 * scale);
      ctx.lineTo(8 * scale, 22 * scale);
      ctx.lineTo(22 * scale, 18 * scale);
      ctx.lineTo(18 * scale, 5 * scale);
      ctx.lineTo(12 * scale, -10 * scale);
      ctx.closePath();
      break;

    case "interceptor":
      // Sharp aggressive wings
      ctx.beginPath();
      ctx.moveTo(0, -25 * scale);
      ctx.lineTo(-8 * scale, 0);
      ctx.lineTo(-28 * scale, 15 * scale);
      ctx.lineTo(-12 * scale, 18 * scale);
      ctx.lineTo(0, 20 * scale);
      ctx.lineTo(12 * scale, 18 * scale);
      ctx.lineTo(28 * scale, 15 * scale);
      ctx.lineTo(8 * scale, 0);
      ctx.closePath();
      break;

    case "destroyer":
      // Broad and powerful
      ctx.beginPath();
      ctx.moveTo(0, -20 * scale);
      ctx.lineTo(-10 * scale, -15 * scale);
      ctx.lineTo(-20 * scale, 0);
      ctx.lineTo(-25 * scale, 15 * scale);
      ctx.lineTo(-15 * scale, 20 * scale);
      ctx.lineTo(0, 15 * scale);
      ctx.lineTo(15 * scale, 20 * scale);
      ctx.lineTo(25 * scale, 15 * scale);
      ctx.lineTo(20 * scale, 0);
      ctx.lineTo(10 * scale, -15 * scale);
      ctx.closePath();
      break;
  }

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, -25 * scale, 0, 25 * scale);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.3, design.color);
  gradient.addColorStop(1, design.accentColor);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Stroke
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cockpit highlight
  ctx.beginPath();
  ctx.ellipse(0, -5 * scale, 4 * scale, 6 * scale, 0, 0, Math.PI * 2);
  ctx.fillStyle = `${design.color}88`;
  ctx.fill();

  ctx.restore();
};

// Ship preview canvas component
const ShipPreview: React.FC<{
  design: ShipDesign;
  size: number;
  isSelected: boolean;
}> = ({ design, size, isSelected }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw ship
    renderShipPreview(ctx, design, size);
  }, [design, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        border: isSelected
          ? `3px solid ${design.color}`
          : "3px solid transparent",
        borderRadius: "12px",
        background: "rgba(0, 0, 0, 0.3)",
        boxShadow: isSelected ? `0 0 20px ${design.color}66` : "none",
        transition: "all 0.2s ease",
      }}
    />
  );
};

const ShipSelector: React.FC<ShipSelectorProps> = ({
  isOpen,
  onClose,
  onShipChange,
  currentShipId,
}) => {
  const [selectedId, setSelectedId] = useState(currentShipId);

  useEffect(() => {
    setSelectedId(currentShipId);
  }, [currentShipId]);

  const handleSelect = useCallback(
    (ship: ShipDesign) => {
      setSelectedId(ship.id);
      saveSelectedShip(ship.id);
      onShipChange(ship);
    },
    [onShipChange]
  );

  if (!isOpen) return null;

  return (
    <div className="ship-selector-overlay">
      <div className="ship-selector-modal">
        <div className="ship-selector-header">
          <h2>🚀 Select Your Ship</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <p className="ship-selector-description">
          Choose your spacecraft! Each has a unique design.
        </p>

        <div className="ship-grid">
          {SHIP_DESIGNS.map((ship) => (
            <div
              key={ship.id}
              className={`ship-option ${
                selectedId === ship.id ? "selected" : ""
              }`}
              onClick={() => handleSelect(ship)}
              style={{
                borderColor:
                  selectedId === ship.id ? ship.color : "transparent",
              }}
            >
              <ShipPreview
                design={ship}
                size={80}
                isSelected={selectedId === ship.id}
              />
              <div className="ship-info">
                <span className="ship-name" style={{ color: ship.color }}>
                  {ship.name}
                </span>
                <span className="ship-desc">{ship.description}</span>
              </div>
              {selectedId === ship.id && (
                <div className="selected-badge">✓</div>
              )}
            </div>
          ))}
        </div>

        <div className="ship-selector-footer">
          <span style={{ color: "var(--star-dim)" }}>
            Selected:{" "}
            <strong
              style={{
                color: SHIP_DESIGNS.find((s) => s.id === selectedId)?.color,
              }}
            >
              {SHIP_DESIGNS.find((s) => s.id === selectedId)?.name}
            </strong>
          </span>
          <button className="done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShipSelector;
