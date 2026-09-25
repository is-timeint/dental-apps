'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ToothCondition, ToothData, ToothSurface } from '@/types/dental';
import { DAMPED_SPRINGS } from '@/lib/motion';
import { triggerHapticFeedback } from '@/lib/haptic';

interface OdontogramToothProps {
  tooth: ToothData;
  isSelected: boolean;
  activeTool: ToothCondition;
  onSelectTooth: (fdi: number) => void;
  onPaintSurface: (fdi: number, surface: ToothSurface, condition: ToothCondition) => void;
}

const CONDITION_COLORS: Record<ToothCondition, string> = {
  HEALTHY: 'var(--surface-card, #FFFFFF)',
  CARIES: '#EF4444',
  RESTORED: '#059669',
  ENDO: '#D97706',
  CROWN: '#7C3AED',
  MISSING: '#64748B',
  RADIX: '#B91C1C',
  CALCULUS: '#EAB308',
};

export const OdontogramTooth: React.FC<OdontogramToothProps> = ({
  tooth,
  isSelected,
  activeTool,
  onSelectTooth,
  onPaintSurface,
}) => {
  const [ripplingSurface, setRipplingSurface] = useState<ToothSurface | null>(null);

  const isUpperArch = tooth.fdiNumber >= 11 && tooth.fdiNumber <= 28;
  const isRightSide =
    (tooth.fdiNumber >= 11 && tooth.fdiNumber <= 18) ||
    (tooth.fdiNumber >= 41 && tooth.fdiNumber <= 48);

  // Mesial is towards the midline; Distal is away
  // For Right Quadrant (Q1, Q4): Midline is on the right side of the tooth visually
  // So Mesial is right polygon, Distal is left polygon.
  // For Left Quadrant (Q2, Q3): Midline is on the left side of the tooth visually
  // So Mesial is left polygon, Distal is right polygon.
  const leftSurface: ToothSurface = isRightSide ? 'D' : 'M';
  const rightSurface: ToothSurface = isRightSide ? 'M' : 'D';
  const topSurface: ToothSurface = isUpperArch ? 'B' : 'L';
  const bottomSurface: ToothSurface = isUpperArch ? 'L' : 'B';

  const handleSurfaceClick = (e: React.MouseEvent, surface: ToothSurface) => {
    e.stopPropagation();
    triggerHapticFeedback('light');
    setRipplingSurface(surface);
    setTimeout(() => setRipplingSurface(null), 300);
    onPaintSurface(tooth.fdiNumber, surface, activeTool);
    onSelectTooth(tooth.fdiNumber);
  };

  const isMissing = tooth.generalCondition === 'MISSING';
  const isRadix = tooth.generalCondition === 'RADIX';
  const isEndo = tooth.generalCondition === 'ENDO';
  const isCrown = tooth.generalCondition === 'CROWN';

  return (
    <motion.div
      onClick={() => {
        triggerHapticFeedback('light');
        onSelectTooth(tooth.fdiNumber);
      }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.94 }}
      transition={DAMPED_SPRINGS.tactile}
      className={`relative flex flex-col items-center p-1.5 rounded-xl cursor-pointer transition-colors duration-200 select-none ${
        isSelected
          ? 'bg-teal-500/10 ring-2 ring-teal-600 dark:ring-teal-400 shadow-sm'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
      }`}
    >
      {/* FDI Tooth Number */}
      <span
        className={`text-xs font-mono font-bold tracking-tight mb-1 ${
          isSelected
            ? 'text-teal-700 dark:text-teal-300 scale-105'
            : 'text-slate-600 dark:text-slate-400'
        }`}
      >
        {tooth.fdiNumber}
      </span>

      {/* SVG 5-Surface Anatomical FDI Tooth Model */}
      <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-xs overflow-visible"
        >
          {/* Top Surface (Buccal/Lingual) */}
          <polygon
            points="0,0 100,0 75,25 25,25"
            fill={CONDITION_COLORS[tooth.surfaces[topSurface]]}
            stroke="var(--border-strong, #CBD5E1)"
            strokeWidth="3"
            strokeLinejoin="round"
            className="transition-colors duration-200 hover:brightness-95 active:brightness-90 cursor-pointer"
            onClick={(e) => handleSurfaceClick(e, topSurface)}
          />

          {/* Bottom Surface (Lingual/Buccal) */}
          <polygon
            points="25,75 75,75 100,100 0,100"
            fill={CONDITION_COLORS[tooth.surfaces[bottomSurface]]}
            stroke="var(--border-strong, #CBD5E1)"
            strokeWidth="3"
            strokeLinejoin="round"
            className="transition-colors duration-200 hover:brightness-95 active:brightness-90 cursor-pointer"
            onClick={(e) => handleSurfaceClick(e, bottomSurface)}
          />

          {/* Left Surface (Mesial or Distal) */}
          <polygon
            points="0,0 25,25 25,75 0,100"
            fill={CONDITION_COLORS[tooth.surfaces[leftSurface]]}
            stroke="var(--border-strong, #CBD5E1)"
            strokeWidth="3"
            strokeLinejoin="round"
            className="transition-colors duration-200 hover:brightness-95 active:brightness-90 cursor-pointer"
            onClick={(e) => handleSurfaceClick(e, leftSurface)}
          />

          {/* Right Surface (Distal or Mesial) */}
          <polygon
            points="100,0 100,100 75,75 75,25"
            fill={CONDITION_COLORS[tooth.surfaces[rightSurface]]}
            stroke="var(--border-strong, #CBD5E1)"
            strokeWidth="3"
            strokeLinejoin="round"
            className="transition-colors duration-200 hover:brightness-95 active:brightness-90 cursor-pointer"
            onClick={(e) => handleSurfaceClick(e, rightSurface)}
          />

          {/* Center Surface (Occlusal / Incisal) */}
          <polygon
            points="25,25 75,25 75,75 25,75"
            fill={CONDITION_COLORS[tooth.surfaces.O]}
            stroke="var(--border-strong, #CBD5E1)"
            strokeWidth="3"
            strokeLinejoin="round"
            className="transition-colors duration-200 hover:brightness-95 active:brightness-90 cursor-pointer"
            onClick={(e) => handleSurfaceClick(e, 'O')}
          />

          {/* Missing Tooth Overlay (X-Line) */}
          {isMissing && (
            <g stroke="#EF4444" strokeWidth="5" strokeLinecap="round">
              <line x1="5" y1="5" x2="95" y2="95" />
              <line x1="95" y1="5" x2="5" y2="95" />
            </g>
          )}

          {/* Radix (Sisa Akar) Overlay */}
          {isRadix && (
            <circle cx="50" cy="50" r="16" fill="#B91C1C" opacity="0.85" />
          )}

          {/* Crown (Mahkota Tiruan) Overlay Border */}
          {isCrown && (
            <rect
              x="2"
              y="2"
              width="96"
              height="96"
              rx="12"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="5"
              strokeDasharray="8 4"
            />
          )}

          {/* Endodontic (PSA) Root Indicator */}
          {isEndo && (
            <line
              x1="50"
              y1="10"
              x2="50"
              y2="90"
              stroke="#D97706"
              strokeWidth="6"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Ink Absorption Ripple Effect */}
        {ripplingSurface && (
          <span
            className="absolute inset-0 rounded-full pointer-events-none animate-ping opacity-35"
            style={{ backgroundColor: CONDITION_COLORS[activeTool] }}
          />
        )}
      </div>

      {/* Surface Status Labels Dot Indicator */}
      <div className="flex gap-0.5 mt-1.5 h-1.5 items-center justify-center">
        {tooth.surfaces.O !== 'HEALTHY' && (
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: CONDITION_COLORS[tooth.surfaces.O] }}
          />
        )}
        {tooth.generalCondition && tooth.generalCondition !== 'HEALTHY' && (
          <span
            className="w-1.5 h-1.5 rounded-full ring-1 ring-white"
            style={{ backgroundColor: CONDITION_COLORS[tooth.generalCondition] }}
          />
        )}
      </div>
    </motion.div>
  );
};
