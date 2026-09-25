'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDentalStore } from '@/store/useDentalStore';
import { OdontogramTooth } from './odontogram-tooth';
import { ToothCondition } from '@/types/dental';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Info,
} from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';
import { DAMPED_SPRINGS } from '@/lib/motion';

const TOOL_PALETTE: {
  condition: ToothCondition;
  label: string;
  color: string;
  bgLight: string;
  description: string;
}[] = [
  { condition: 'CARIES', label: 'Karies (Dentin/Enamel)', color: '#EF4444', bgLight: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900', description: 'Kavitas aktif / karies primer' },
  { condition: 'RESTORED', label: 'Restorasi (Komposit/GIC)', color: '#059669', bgLight: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900', description: 'Tumpatan tambalan sehat' },
  { condition: 'ENDO', label: 'Perawatan Saluran Akar (PSA)', color: '#D97706', bgLight: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900', description: 'Obturasi saluran akar' },
  { condition: 'CROWN', label: 'Crown / Mahkota Tiruan', color: '#7C3AED', bgLight: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900', description: 'Porcelain fused metal / Zirconia' },
  { condition: 'RADIX', label: 'Sisa Akar (Radix)', color: '#B91C1C', bgLight: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900', description: 'Mahkota hancur menyisakan akar' },
  { condition: 'MISSING', label: 'Gigi Hilang (Missing)', color: '#64748B', bgLight: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800', description: 'Agenesis atau pasca ekstraksi' },
  { condition: 'CALCULUS', label: 'Kalkulus / Karang Gigi', color: '#EAB308', bgLight: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900', description: 'Deposit subgingival/supragingival' },
  { condition: 'HEALTHY', label: 'Sehat / Hapus Catatan', color: '#0F766E', bgLight: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900', description: 'Permukaan anatomi utuh' },
];

export const OdontogramGrid: React.FC = () => {
  const [archType, setArchType] = useState<'ADULT' | 'PEDIATRIC'>('ADULT');
  const {
    odontogram,
    activeConditionTool,
    setActiveConditionTool,
    selectedToothFdi,
    setSelectedToothFdi,
    paintSurface,
    setToothGeneralCondition,
    resetTooth,
  } = useDentalStore();

  const selectedTooth = selectedToothFdi ? odontogram[selectedToothFdi] : null;

  // Adult teeth array
  const q1 = [18, 17, 16, 15, 14, 13, 12, 11]; // Maxillary Right
  const q2 = [21, 22, 23, 24, 25, 26, 27, 28]; // Maxillary Left
  const q4 = [48, 47, 46, 45, 44, 43, 42, 41]; // Mandibular Right
  const q3 = [31, 32, 33, 34, 35, 36, 37, 38]; // Mandibular Left

  const handleToolSelect = (tool: ToothCondition) => {
    triggerHapticFeedback('selection');
    setActiveConditionTool(tool);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full">
      {/* Main Arch & Charting Canvas */}
      <div className="flex-1 flex flex-col gap-5">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-card p-3 rounded-2xl border border-border-subtle shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted px-2">
              Jenis Geligi:
            </span>
            <div className="flex bg-surface-subtle p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback('selection');
                  setArchType('ADULT');
                }}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  archType === 'ADULT'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Permanen Dewasa (FDI 11–48)
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback('selection');
                  setArchType('PEDIATRIC');
                }}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                  archType === 'PEDIATRIC'
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Gigi Sulung Anak (FDI 51–85)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1.5 border-teal-300 dark:border-teal-800 text-brand-primary">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Auto-Save Active (Zero-Lag)
            </Badge>
          </div>
        </div>

        {/* Clinical Color Palette Selector */}
        <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
              Peralatan Diagnosa & Tindakan (Tap untuk mengaktifkan kuas):
            </span>
            <span className="text-xs text-text-muted font-mono">
              Alat Aktif: <strong className="text-text-primary">{activeConditionTool}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {TOOL_PALETTE.map((tool) => {
              const isActive = activeConditionTool === tool.condition;
              return (
                <button
                  key={tool.condition}
                  type="button"
                  onClick={() => handleToolSelect(tool.condition)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all duration-200 select-none ${
                    isActive
                      ? 'ring-2 ring-brand-primary shadow-sm scale-102 ' + tool.bgLight
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border-border-subtle'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full mb-1 border border-black/10 shadow-2xs"
                    style={{ backgroundColor: tool.color }}
                  />
                  <span className="text-[11px] font-semibold leading-tight line-clamp-1">
                    {tool.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dental Arch Quadrants Canvas */}
        <div className="bg-surface-card p-6 rounded-3xl border border-border-subtle shadow-sm flex flex-col gap-6 overflow-x-auto">
          {/* Maxillary (Upper Jaw) */}
          <div className="flex flex-col gap-1 items-center min-w-[620px]">
            <span className="text-[11px] font-bold tracking-wider uppercase text-text-muted mb-2">
              Rahang Atas (Maxilla)
            </span>
            <div className="flex items-center gap-3">
              {/* Q1 (Right) */}
              <div className="flex items-center gap-1 p-2 rounded-2xl bg-surface-subtle/50 border border-border-subtle/60">
                {q1.map((fdi) => (
                  <OdontogramTooth
                    key={fdi}
                    tooth={odontogram[fdi]}
                    isSelected={selectedToothFdi === fdi}
                    activeTool={activeConditionTool}
                    onSelectTooth={setSelectedToothFdi}
                    onPaintSurface={paintSurface}
                  />
                ))}
              </div>

              {/* Midline Divider */}
              <div className="h-16 w-0.5 bg-brand-primary/40 rounded-full" />

              {/* Q2 (Left) */}
              <div className="flex items-center gap-1 p-2 rounded-2xl bg-surface-subtle/50 border border-border-subtle/60">
                {q2.map((fdi) => (
                  <OdontogramTooth
                    key={fdi}
                    tooth={odontogram[fdi]}
                    isSelected={selectedToothFdi === fdi}
                    activeTool={activeConditionTool}
                    onSelectTooth={setSelectedToothFdi}
                    onPaintSurface={paintSurface}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Central Horizontal Palatal/Lingual Meridian */}
          <div className="relative flex items-center justify-center my-1">
            <div className="w-full border-t border-dashed border-border-strong/70" />
            <span className="absolute bg-surface-card px-4 py-0.5 text-[10px] font-mono font-medium text-text-muted border border-border-subtle rounded-full">
              GARIS OKLUSAL & GINGIVA
            </span>
          </div>

          {/* Mandibular (Lower Jaw) */}
          <div className="flex flex-col gap-1 items-center min-w-[620px]">
            <div className="flex items-center gap-3">
              {/* Q4 (Right) */}
              <div className="flex items-center gap-1 p-2 rounded-2xl bg-surface-subtle/50 border border-border-subtle/60">
                {q4.map((fdi) => (
                  <OdontogramTooth
                    key={fdi}
                    tooth={odontogram[fdi]}
                    isSelected={selectedToothFdi === fdi}
                    activeTool={activeConditionTool}
                    onSelectTooth={setSelectedToothFdi}
                    onPaintSurface={paintSurface}
                  />
                ))}
              </div>

              {/* Midline Divider */}
              <div className="h-16 w-0.5 bg-brand-primary/40 rounded-full" />

              {/* Q3 (Left) */}
              <div className="flex items-center gap-1 p-2 rounded-2xl bg-surface-subtle/50 border border-border-subtle/60">
                {q3.map((fdi) => (
                  <OdontogramTooth
                    key={fdi}
                    tooth={odontogram[fdi]}
                    isSelected={selectedToothFdi === fdi}
                    activeTool={activeConditionTool}
                    onSelectTooth={setSelectedToothFdi}
                    onPaintSurface={paintSurface}
                  />
                ))}
              </div>
            </div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-text-muted mt-2">
              Rahang Bawah (Mandibula)
            </span>
          </div>
        </div>
      </div>

      {/* Side Inspector: Selected Tooth Clinical Detail Panel */}
      <div className="w-full xl:w-88 flex flex-col gap-4">
        <Card className="rounded-3xl border-border-subtle shadow-sm overflow-hidden">
          <CardHeader className="bg-surface-subtle/50 pb-3 border-b border-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-primary text-white">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-text-primary">
                    Detail Klinis Gigi
                  </CardTitle>
                  <p className="text-xs text-text-secondary">
                    FDI Nomenclature Standar KKI
                  </p>
                </div>
              </div>
              {selectedTooth && (
                <span className="text-xl font-mono font-extrabold text-brand-primary bg-teal-500/10 px-2.5 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800">
                  {selectedTooth.fdiNumber}
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-4 flex flex-col gap-4">
            {selectedTooth ? (
              <>
                {/* Surface Status Breakdown */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-text-secondary">
                    Status 5-Permukaan:
                  </span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(['O', 'M', 'D', 'B', 'L'] as const).map((surf) => {
                      const cond = selectedTooth.surfaces[surf];
                      return (
                        <div
                          key={surf}
                          onClick={() => {
                            triggerHapticFeedback('light');
                            paintSurface(selectedTooth.fdiNumber, surf, activeConditionTool);
                          }}
                          className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-subtle border border-border-subtle cursor-pointer hover:border-brand-primary transition-colors"
                        >
                          <span className="text-xs font-bold text-text-primary">{surf}</span>
                          <span className="text-[10px] text-text-muted uppercase font-mono mt-0.5">
                            {cond === 'HEALTHY' ? 'OK' : cond.substring(0, 3)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* General Condition Status */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-text-secondary">
                    Kondisi Keseluruhan / Morfologi:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(['CROWN', 'ENDO', 'RADIX', 'MISSING'] as const).map((cond) => {
                      const isApplied = selectedTooth.generalCondition === cond;
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => {
                            triggerHapticFeedback('medium');
                            setToothGeneralCondition(
                              selectedTooth.fdiNumber,
                              isApplied ? 'HEALTHY' : cond
                            );
                          }}
                          className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                            isApplied
                              ? 'bg-brand-primary text-white border-brand-primary shadow-2xs'
                              : 'bg-surface-subtle border-border-subtle text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clinical Notes Field */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-text-secondary">
                    Catatan Diagnosa / Rencana Terapi:
                  </span>
                  <div className="p-3 bg-surface-subtle rounded-xl text-xs text-text-secondary border border-border-subtle min-h-[60px]">
                    {selectedTooth.notes || 'Belum ada catatan klinis khusus untuk elemen ini.'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      triggerHapticFeedback('selection');
                      resetTooth(selectedTooth.fdiNumber);
                    }}
                    className="flex-1 gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Gigi
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5 text-xs bg-brand-primary hover:bg-brand-hover text-white"
                    onClick={() => triggerHapticFeedback('light')}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Simpan EDR
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-text-muted">
                <Info className="w-8 h-8 stroke-1 mb-2 text-text-muted" />
                <p className="text-xs">
                  Pilih salah satu elemen gigi pada bagan untuk memeriksa atau mencatat diagnosa.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
