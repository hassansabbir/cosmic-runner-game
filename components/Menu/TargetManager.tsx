"use client";

// TargetManager - Component for managing custom target images

import React, { useState, useCallback, useRef, useEffect } from "react";

interface TargetImage {
  id: string;
  dataUrl: string;
  name: string;
}

interface TargetManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onTargetsChange: (targets: TargetImage[]) => void;
}

const STORAGE_KEY = "cosmicRunnerTargets";

// Load targets from localStorage
export const loadTargets = (): TargetImage[] => {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Save targets to localStorage
export const saveTargets = (targets: TargetImage[]): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(targets));
  } catch (e) {
    console.error("Failed to save targets:", e);
  }
};

const TargetManager: React.FC<TargetManagerProps> = ({
  isOpen,
  onClose,
  onTargetsChange,
}) => {
  const [targets, setTargets] = useState<TargetImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load targets on mount
  useEffect(() => {
    const loaded = loadTargets();
    setTargets(loaded);
    onTargetsChange(loaded);
  }, [onTargetsChange]);

  // Handle file selection
  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      Array.from(files).forEach((file) => {
        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;

          // Resize image to max 100x100 for performance
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const size = 100;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d")!;

            // Draw circular crop
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();

            // Center and scale the image
            const scale = Math.max(size / img.width, size / img.height);
            const x = (size - img.width * scale) / 2;
            const y = (size - img.height * scale) / 2;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.8);

            const newTarget: TargetImage = {
              id:
                Date.now().toString() + Math.random().toString(36).substr(2, 9),
              dataUrl: resizedDataUrl,
              name: file.name,
            };

            setTargets((prev) => {
              const updated = [...prev, newTarget];
              saveTargets(updated);
              onTargetsChange(updated);
              return updated;
            });
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(file);
      });
    },
    [onTargetsChange]
  );

  // Delete target
  const handleDelete = useCallback(
    (id: string) => {
      setTargets((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        saveTargets(updated);
        onTargetsChange(updated);
        return updated;
      });
    },
    [onTargetsChange]
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  if (!isOpen) return null;

  return (
    <div className="target-manager-overlay">
      <div className="target-manager-modal">
        <div className="target-manager-header">
          <h2>🎯 Manage Targets</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <p className="target-manager-description">
          Upload photos of people to use as targets! They&apos;ll appear on the
          asteroids.
        </p>

        {/* Upload Area */}
        <div
          className={`upload-zone ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-icon">📷</div>
          <p>Drag & drop images here</p>
          <p className="upload-hint">or click to select files</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Target Grid */}
        <div className="target-grid">
          {targets.length === 0 ? (
            <p className="no-targets">
              No targets uploaded yet. Add some faces!
            </p>
          ) : (
            targets.map((target) => (
              <div key={target.id} className="target-item">
                <img src={target.dataUrl} alt={target.name} />
                <button
                  className="delete-target-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(target.id);
                  }}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <div className="target-manager-footer">
          <span>
            {targets.length} target{targets.length !== 1 ? "s" : ""} loaded
          </span>
          <button className="done-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TargetManager;
export type { TargetImage };
