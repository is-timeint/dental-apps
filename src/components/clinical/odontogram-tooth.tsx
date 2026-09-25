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

// Strict Medical Quarantine Color Palette (color-palette.md STD-COL-001 Section 3)
const CONDITION_FILLS: Record<ToothCondition, string> = {
  HEALTHY: 'var(--tooth-enamel, #FAFAF7)',
  CARIES: '#EF4444',
  RESTORED: '#059669',
  ENDO: '#D97706',
  CROWN: '#7C3AED',
  MISSING: '#64748B',
  RADIX: '#B91C1C',
  CALCULUS: '#EAB308',
};

// Map FDI numbers to anatomical Indonesian clinical names
const FDI_ANATOMICAL_NAMES: Record<number, string> = {
  18: 'Molar 3 Kanan Atas (Wisdom)',
  17: 'Molar 2 Kanan Atas',
  16: 'Molar 1 Kanan Atas',
  15: 'Premolar 2 Kanan Atas',
  14: 'Premolar 1 Kanan Atas',
  13: 'Kaninus Kanan Atas (Taring)',
  12: 'Insisivus 2 Kanan Atas (Seri Lateral)',
  11: 'Insisivus 1 Kanan Atas (Seri Sentral)',

  21: 'Insisivus 1 Kiri Atas (Seri Sentral)',
  22: 'Insisivus 2 Kiri Atas (Seri Lateral)',
  23: 'Kaninus Kiri Atas (Taring)',
  24: 'Premolar 1 Kiri Atas',
  25: 'Premolar 2 Kiri Atas',
  26: 'Molar 1 Kiri Atas',
  27: 'Molar 2 Kiri Atas',
  28: 'Molar 3 Kiri Atas (Wisdom)',

  48: 'Molar 3 Kanan Bawah (Wisdom)',
  47: 'Molar 2 Kanan Bawah',
  46: 'Molar 1 Kanan Bawah',
  45: 'Premolar 2 Kanan Bawah',
  44: 'Premolar 1 Kanan Bawah',
  43: 'Kaninus Kanan Bawah (Taring)',
  42: 'Insisivus 2 Kanan Bawah',
  41: 'Insisivus 1 Kanan Bawah',

  31: 'Insisivus 1 Kiri Bawah',
  32: 'Insisivus 2 Kiri Bawah',
  33: 'Kaninus Kiri Bawah (Taring)',
  34: 'Premolar 1 Kiri Bawah',
  35: 'Premolar 2 Kiri Bawah',
  36: 'Molar 1 Kiri Bawah',
  37: 'Molar 2 Kiri Bawah',
  38: 'Molar 3 Kiri Bawah (Wisdom)',
};

export const OdontogramTooth: React.FC<OdontogramToothProps> = ({
  tooth,
  isSelected,
  activeTool,
  onSelectTooth,
  onPaintSurface,
}) => {
  const [lastClickedSurface, setLastClickedSurface] = useState<ToothSurface | null>(null);

  const isUpperArch = tooth.fdiNumber >= 11 && tooth.fdiNumber <= 28;
  const isRightSide =
    (tooth.fdiNumber >= 11 && tooth.fdiNumber <= 18) ||
    (tooth.fdiNumber >= 41 && tooth.fdiNumber <= 48);

  // Dental orientation: Mesial is towards dental midline, Distal is away
  const leftSurface: ToothSurface = isRightSide ? 'D' : 'M';
  const rightSurface: ToothSurface = isRightSide ? 'M' : 'D';
  const topSurface: ToothSurface = isUpperArch ? 'B' : 'L';
  const bottomSurface: ToothSurface = isUpperArch ? 'L' : 'B';

  const handleSurfaceClick = (e: React.MouseEvent, surface: ToothSurface) => {
    e.stopPropagation();
    triggerHapticFeedback('light');
    setLastClickedSurface(surface);
    setTimeout(() => setLastClickedSurface(null), 300);
    onPaintSurface(tooth.fdiNumber, surface, activeTool);
    onSelectTooth(tooth.fdiNumber);
  };

  const isMissing = tooth.generalCondition === 'MISSING';
  const isRadix = tooth.generalCondition === 'RADIX';
  const isEndo = tooth.generalCondition === 'ENDO';
  const isCrown = tooth.generalCondition === 'CROWN';

  const hasPathology =
    Object.values(tooth.surfaces).some((cond) => cond !== 'HEALTHY') ||
    (tooth.generalCondition && tooth.generalCondition !== 'HEALTHY');

  return (
    <motion.div
      onClick={() => {
        triggerHapticFeedback('selection');
        onSelectTooth(tooth.fdiNumber);
      }}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.94 }}
      transition={DAMPED_SPRINGS.tactile}
      title={`${tooth.fdiNumber} — ${FDI_ANATOMICAL_NAMES[tooth.fdiNumber] || 'Elemen Gigi'}`}
      className={`group relative flex flex-col items-center p-2 rounded-2xl cursor-pointer transition-all duration-200 select-none ${
        isSelected
          ? 'bg-teal-500/10 ring-2 ring-brand-primary shadow-sm'
          : hasPathology
          ? 'bg-amber-500/5 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-amber-300/40 dark:border-amber-700/30'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent'
      }`}
    >
      {/* FDI Tooth Number */}
      <div className="flex items-center gap-1 mb-1.5">
        <span
          className={`font-mono text-xs font-black tracking-tight px-1.5 py-0.5 rounded-md transition-colors ${
            isSelected
              ? 'bg-brand-primary text-white shadow-2xs'
              : 'text-text-primary bg-surface-subtle group-hover:bg-brand-primary/10 group-hover:text-brand-primary'
          }`}
        >
          {tooth.fdiNumber}
        </span>
      </div>

      {/* Anatomical 5-Surface FDI Tooth Model */}
      <div className="relative w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.06)] overflow-visible"
        >
          <defs>
            <radialGradient id={`enamel-glow-${tooth.fdiNumber}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#EDECE8" stopOpacity="1" />
            </radialGradient>
          </defs>

          {/* Outer Tooth Enamel Base Shadow */}
          <rect
            x="2"
            y="2"
            width="96"
            height="96"
            rx="16"
            fill="var(--surface-subtle, #F1F3F5)"
            stroke="var(--border-strong, #CBD5E1)"
            strokeWidth="1.5"
          />

          {/* Top Surface (Buccal/Lingual) */}
          <polygon
            points="6,6 94,6 74,26 26,26"
            fill={CONDITION_FILLS[tooth.surfaces[topSurface]]}
            stroke="var(--border-strong, #94A3B8)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="transition-colors duration-200 hover:brightness-95 active:brightness-90 cursor-pointer"
            onClick={(e) => handleSurfaceClick(e, topSurface)}
          />

          {/* Bottom Surface (Lingual/Buccal) */}
          <polygon
            points="26,74 74,74 94,94 6,94"
            fill={CONDITION_FILLS[tooth.surfaces[bottomSurface]]}
            stroke="var(--border-strong, #94A3B8)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="transition-colors duration-200 hover:brightness-95 active:brightness-90 cursor-pointer"
            onClick={(e) => handleSurfaceClick(e, bottomSurface)}
          />

          {/* Left Surface (Mesial or Distal) */}
          <polygon
            points="6,6 26,26 26,74 6,94"
            fill={CONDITION_FILLS[tooth.surfaces[leftSurface]]}
            stroke="var(--border-strong, #94A3B8)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="transition-colors duration-200 hover:brightness-95 active:brightness-90 cursor-pointer"
            onClick={(e) => handleSurfaceClick(e, leftSurface)}
          />

          {/* Right Surface (Distal or Mesial) */}
          <polygon
            points="94,6 94,94 74,74 74,26"
            fill={CONDITION_FILLS[tooth.surfaces[rightSurface]]}
            stroke="var(--border-strong, #94A3B8)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="transition-colors duration-200 hover:brightness-95 active:brightness-90 cursor-pointer"
            onClick={(e) => handleSurfaceClick(e, rightSurface)}
          />

          {/* Center Occlusal / Incisal Pit Surface */}
          <polygon
            points="26,26 74,26 74,74 26,74"
            fill={CONDITION_FILLS[tooth.surfaces.O]}
            stroke="var(--border-strong, #94A3B8)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="transition-colors duration-200 hover:brightness-95 active:brightness-90 cursor-pointer"
            onClick={(e) => handleSurfaceClick(e, 'O')}
          />

          {/* Missing Tooth Overlay (Crossed Bars) */}
          {isMissing && (
            <g stroke="#64748B" strokeWidth="6" strokeLinecap="round">
              <line x1="10" y1="10" x2="90" y2="90" />
              <line x1="90" y1="10" x2="10" y2="90" />
            </g>
          )}

          {/* Radix (Sisa Akar) Overlay */}
          {isRadix && (
            <g>
              <circle cx="50" cy="50" r="20" fill="#B91C1C" opacity="0.9" />
              <line x1="38" y1="50" x2="62" y2="50" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            </g>
          )}

          {/* Crown Overlay Border */}
          {isCrown && (
            <rect
              x="4"
              y="4"
              width="92"
              height="92"
              rx="14"
              fill="none"
              stroke="#7C3AED"
              strokeWidth="6"
              strokeDasharray="10 5"
            />
          )}

          {/* Endodontic (PSA) Root Canal Indicator */}
          {isEndo && (
            <line
              x1="50"
              y1="12"
              x2="50"
              y2="88"
              stroke="#D97706"
              strokeWidth="7"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Ink Absorption Ripple Animation */}
        {lastClickedSurface && (
          <span
            className="absolute inset-0 rounded-2xl pointer-events-none animate-ping opacity-40"
            style={{ backgroundColor: CONDITION_FILLS[activeTool] }}
          />
        )}
      </div>

      {/* Surface Pathology Multi-Dot Indicator */}
      <div className="flex gap-1 mt-1.5 h-2 items-center justify-center">
        {tooth.surfaces.O !== 'HEALTHY' && (
          <span
            className="w-1.5 h-1.5 rounded-full ring-1 ring-white"
            style={{ backgroundColor: CONDITION_FILLS[tooth.surfaces.O] }}
          />
        )}
        {tooth.generalCondition && tooth.generalCondition !== 'HEALTHY' && (
          <span
            className="w-1.5 h-1.5 rounded-full ring-1 ring-white"
            style={{ backgroundColor: CONDITION_FILLS[tooth.generalCondition] }}
          />
        )}
      </div>
    </motion.div>
  );
};
