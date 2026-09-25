'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Image as ImageIcon,
  Sun,
  Contrast,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Ruler,
  ShieldCheck,
  Clock,
  FlipHorizontal,
} from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';
import { toast } from 'sonner';

export const XrayDicomViewer: React.FC = () => {
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(115);
  const [inverted, setInverted] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [rulerActive, setRulerActive] = useState<boolean>(false);
  const [workingLength, setWorkingLength] = useState<number>(21.5); // mm

  const handleReset = () => {
    triggerHapticFeedback('selection');
    setBrightness(100);
    setContrast(115);
    setInverted(false);
    setZoom(1);
    setRulerActive(false);
  };

  return (
    <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-sm overflow-hidden flex flex-col w-full">
      <CardHeader className="bg-surface-subtle/50 pb-3 border-b border-border-subtle flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-teal-500/10 border border-teal-300 dark:border-teal-700 flex items-center justify-center text-brand-primary">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
              <span>Viewer Radiologi Dental DICOM 2D (Periapikal / Bitewing)</span>
              <Badge variant="outline" className="text-[10px] font-mono border-teal-300 text-brand-primary">
                DICOM R-Viewer
              </Badge>
            </CardTitle>
            <p className="text-xs text-text-secondary">
              Citra radiologi gigi digital dengan kontrol Window/Leveling, Invert, dan Pengukuran Saluran Akar.
            </p>
          </div>
        </div>

        {/* Security & Presigned URL Tag (PRD 3.2: TTL ≤ 15 Min) */}
        <div className="flex items-center gap-2">
          <Badge className="bg-teal-500/10 text-brand-primary border-teal-300 text-xs gap-1.5 py-1 px-2.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
            <span>Presigned S3/R2 (TTL: 14m 20s)</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 flex flex-col gap-4">
        {/* Radiograph Screen Canvas */}
        <div className="relative w-full h-[400px] rounded-2xl bg-black overflow-hidden flex items-center justify-center select-none shadow-inner border border-slate-800">
          {/* Simulated High-Res Dental X-Ray Image (Periapical Molar with Root Canal Preparation) */}
          <div
            style={{
              filter: `brightness(${brightness}%) contrast(${contrast}%) ${
                inverted ? 'invert(1)' : 'invert(0)'
              }`,
              transform: `scale(${zoom})`,
              transition: 'transform 0.15s ease-out',
            }}
            className="relative w-full h-full flex items-center justify-center p-4 cursor-crosshair"
          >
            {/* SVG Anatomical Dental Radiograph Visualization */}
            <svg
              viewBox="0 0 400 300"
              className="w-full h-full max-h-[360px] drop-shadow-lg"
            >
              {/* Alveolar Bone Trabeculae Background Gradient */}
              <defs>
                <radialGradient id="boneDense" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2a2e39" />
                  <stop offset="100%" stopColor="#101217" />
                </radialGradient>
                <linearGradient id="rootCanalGutta" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
              </defs>

              <rect width="400" height="300" fill="url(#boneDense)" />

              {/* Surrounding Periodontal Ligament Space & Bone Texture */}
              <path
                d="M 60,200 Q 140,240 200,240 Q 260,240 340,200 L 340,300 L 60,300 Z"
                fill="#1e222b"
                opacity="0.7"
              />

              {/* Adjacent Tooth 45 (Premolar 2) Outline */}
              <path
                d="M 70,60 C 80,40 120,40 130,60 L 135,130 C 130,190 100,210 100,220 C 100,210 70,190 65,130 Z"
                fill="#475569"
                stroke="#64748B"
                strokeWidth="2"
                opacity="0.8"
              />

              {/* Target Tooth 46 (Molar 1 with Endodontic PSA) */}
              <path
                d="M 150,60 C 170,30 250,30 270,60 L 280,120 C 290,170 300,230 280,250 C 265,240 255,180 230,140 C 205,180 195,240 180,250 C 160,230 170,170 140,120 Z"
                fill="#64748b"
                stroke="#94a3b8"
                strokeWidth="2.5"
              />

              {/* Pulp Chamber & Radiopaque Gutta Percha Obturation in Roots */}
              <path
                d="M 195,95 L 225,95 L 220,130 L 255,240 L 250,242 L 215,140 L 205,140 L 170,242 L 165,240 L 200,130 Z"
                fill="url(#rootCanalGutta)"
                opacity="0.95"
              />

              {/* Apical Foramen Radiolucency Halo (Lesi Periapikal) */}
              <circle cx="168" cy="245" r="9" fill="#090d16" opacity="0.8" />
              <circle cx="252" cy="245" r="8" fill="#090d16" opacity="0.8" />

              {/* Endodontic Working Length Ruler Calibrated Line */}
              {rulerActive && (
                <g>
                  <line
                    x1="180"
                    y1="50"
                    x2="168"
                    y2="245"
                    stroke="#14B8A6"
                    strokeWidth="3"
                    strokeDasharray="4 2"
                  />
                  <circle cx="180" cy="50" r="4" fill="#14B8A6" />
                  <circle cx="168" cy="245" r="4" fill="#EF4444" />
                  <rect x="185" y="130" width="70" height="24" rx="6" fill="#0F766E" />
                  <text
                    x="220"
                    y="146"
                    fill="#FFFFFF"
                    fontFamily="monospace"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {workingLength} mm
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Film Orientation & Patient Overlay Stamp */}
          <div className="absolute top-3 left-4 text-xs font-mono text-slate-300 pointer-events-none drop-shadow-md">
            <span className="font-bold text-teal-400">R (Kanan Pasien)</span> • Gigi 46 Periapikal
            <div className="text-[10px] text-slate-400">Sens: RVG CMOS • 70kV 7mA 0.12s</div>
          </div>
        </div>

        {/* DICOM Control Toolbars */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface-subtle border border-border-subtle">
          {/* Sliders Window/Leveling */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-text-muted" />
              <span className="text-xs font-bold text-text-primary">Brightness:</span>
              <input
                type="range"
                min="50"
                max="180"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-24 accent-brand-primary"
              />
              <span className="text-xs font-mono text-text-muted">{brightness}%</span>
            </div>

            <div className="flex items-center gap-2">
              <Contrast className="w-4 h-4 text-text-muted" />
              <span className="text-xs font-bold text-text-primary">Contrast:</span>
              <input
                type="range"
                min="80"
                max="220"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-24 accent-brand-primary"
              />
              <span className="text-xs font-mono text-text-muted">{contrast}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                triggerHapticFeedback('selection');
                setInverted(!inverted);
              }}
              className={`text-xs gap-1.5 h-8 rounded-xl font-bold ${
                inverted ? 'bg-brand-primary text-white border-brand-primary' : ''
              }`}
            >
              <FlipHorizontal className="w-3.5 h-3.5" />
              Invert Warna
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                triggerHapticFeedback('selection');
                setRulerActive(!rulerActive);
                toast.info(rulerActive ? 'Penggaris PSA dinonaktifkan.' : 'Kalibrasi panjang kerja PSA aktif (21.5 mm).');
              }}
              className={`text-xs gap-1.5 h-8 rounded-xl font-bold ${
                rulerActive ? 'bg-teal-600 text-white border-teal-700' : ''
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              Ukur PSA (mm)
            </Button>

            <div className="flex items-center border border-border-subtle rounded-xl overflow-hidden bg-surface-card">
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback('light');
                  setZoom((z) => Math.max(0.7, z - 0.2));
                }}
                className="p-1.5 hover:bg-surface-subtle"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-text-secondary" />
              </button>
              <span className="px-2 text-xs font-mono font-bold text-text-primary">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback('light');
                  setZoom((z) => Math.min(2.5, z + 0.2));
                }}
                className="p-1.5 hover:bg-surface-subtle"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-text-secondary" />
              </button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleReset}
              className="text-xs gap-1.5 h-8 rounded-xl text-text-muted hover:text-text-primary"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
