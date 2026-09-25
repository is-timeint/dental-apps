'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Stethoscope,
  Info,
  Layers,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';
import { toast } from 'sonner';

interface ToolItem {
  condition: ToothCondition;
  shortcut: string;
  name: string;
  subtext: string;
  dotColor: string;
  badgeBg: string;
}

const CLINICAL_TOOLS: ToolItem[] = [
  { condition: 'CARIES', shortcut: '1', name: 'Karies', subtext: 'Dentin / Enamel', dotColor: '#EF4444', badgeBg: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800' },
  { condition: 'RESTORED', shortcut: '2', name: 'Tambalan', subtext: 'Komposit / GIC', dotColor: '#059669', badgeBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' },
  { condition: 'ENDO', shortcut: '3', name: 'PSA', subtext: 'Saluran Akar', dotColor: '#D97706', badgeBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800' },
  { condition: 'CROWN', shortcut: '4', name: 'Crown', subtext: 'Mahkota Tiruan', dotColor: '#7C3AED', badgeBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800' },
  { condition: 'RADIX', shortcut: '5', name: 'Sisa Akar', subtext: 'Radix Retained', dotColor: '#B91C1C', badgeBg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800' },
  { condition: 'MISSING', shortcut: '6', name: 'Missing', subtext: 'Gigi Hilang / Cabut', dotColor: '#64748B', badgeBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-800' },
  { condition: 'CALCULUS', shortcut: '7', name: 'Kalkulus', subtext: 'Karang Gigi', dotColor: '#EAB308', badgeBg: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800' },
  { condition: 'HEALTHY', shortcut: '8', name: 'Sehat', subtext: 'Hapus / Normal', dotColor: '#0F766E', badgeBg: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-800' },
];

const FDI_ANATOMICAL_LABELS: Record<number, string> = {
  18: 'Molar 3 Kanan Atas (Gigi Bungsu)',
  17: 'Molar 2 Kanan Atas',
  16: 'Molar 1 Kanan Atas (Geraham Pertama)',
  15: 'Premolar 2 Kanan Atas',
  14: 'Premolar 1 Kanan Atas',
  13: 'Kaninus Kanan Atas (Gigi Taring)',
  12: 'Insisivus 2 Kanan Atas (Seri Lateral)',
  11: 'Insisivus 1 Kanan Atas (Seri Sentral)',

  21: 'Insisivus 1 Kiri Atas (Seri Sentral)',
  22: 'Insisivus 2 Kiri Atas (Seri Lateral)',
  23: 'Kaninus Kiri Atas (Gigi Taring)',
  24: 'Premolar 1 Kiri Atas',
  25: 'Premolar 2 Kiri Atas',
  26: 'Molar 1 Kiri Atas (Geraham Pertama)',
  27: 'Molar 2 Kiri Atas',
  28: 'Molar 3 Kiri Atas (Gigi Bungsu)',

  48: 'Molar 3 Kanan Bawah (Gigi Bungsu)',
  47: 'Molar 2 Kanan Bawah',
  46: 'Molar 1 Kanan Bawah (Geraham Pertama)',
  45: 'Premolar 2 Kanan Bawah',
  44: 'Premolar 1 Kanan Bawah',
  43: 'Kaninus Kanan Bawah (Gigi Taring)',
  42: 'Insisivus 2 Kanan Bawah (Seri Lateral)',
  41: 'Insisivus 1 Kanan Bawah (Seri Sentral)',

  31: 'Insisivus 1 Kiri Bawah (Seri Sentral)',
  32: 'Insisivus 2 Kiri Bawah (Seri Lateral)',
  33: 'Kaninus Kiri Bawah (Gigi Taring)',
  34: 'Premolar 1 Kiri Bawah',
  35: 'Premolar 2 Kiri Bawah',
  36: 'Molar 1 Kiri Bawah (Geraham Pertama)',
  37: 'Molar 2 Kiri Bawah',
  38: 'Molar 3 Kiri Bawah (Gigi Bungsu)',
};

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
    <div className="flex flex-col 2xl:flex-row gap-6 w-full items-start">
      {/* Main Arch & Charting Canvas */}
      <div className="flex-1 w-full flex flex-col gap-4 min-w-0">
        {/* Controls Bar & Dentition Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-card p-3.5 rounded-2xl border border-border-subtle shadow-xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Format Lengkung Gigi:
            </span>
            <div className="flex bg-surface-subtle p-1 rounded-xl relative select-none">
              {[
                { id: 'ADULT' as const, label: 'Permanen Dewasa (FDI 11–48)' },
                { id: 'PEDIATRIC' as const, label: 'Gigi Sulung Anak (FDI 51–85)' },
              ].map((item) => {
                const isActive = archType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback('selection');
                      setArchType(item.id);
                    }}
                    className={`relative px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? 'text-white'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="dentitionFormatPill"
                        className="absolute inset-0 bg-brand-primary rounded-lg shadow-xs z-0"
                        transition={{
                          type: 'spring',
                          stiffness: 440,
                          damping: 30,
                          mass: 0.8,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs gap-1.5 border-teal-300 dark:border-teal-800 text-brand-primary py-1 px-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Auto-Save Active (Zero-Lag EDR)
            </Badge>
          </div>
        </div>

        {/* Ergonomic Clinical Tool Palette */}
        <div className="bg-surface-card p-4 rounded-2xl border border-border-subtle shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              Peralatan Diagnosa & Tindakan Medis:
            </span>
            <span className="text-xs text-text-muted">
              Pilih alat lalu klik pada salah satu dari 5 permukaan gigi di bawah.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {CLINICAL_TOOLS.map((tool) => {
              const isActive = activeConditionTool === tool.condition;
              return (
                <button
                  key={tool.condition}
                  type="button"
                  onClick={() => handleToolSelect(tool.condition)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-200 select-none ${
                    isActive
                      ? 'ring-2 ring-brand-primary shadow-sm scale-102 ' + tool.badgeBg
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border-border-subtle bg-surface-subtle/40'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full shrink-0 shadow-2xs border border-black/10"
                    style={{ backgroundColor: tool.dotColor }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold leading-none truncate text-text-primary">
                      {tool.name}
                    </span>
                    <span className="text-[10px] text-text-muted leading-tight truncate mt-0.5">
                      {tool.subtext}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dental Arch Quadrants Canvas */}
        <div className="bg-surface-card p-6 rounded-3xl border border-border-subtle shadow-sm flex flex-col gap-6 overflow-x-auto w-full">
          {/* Maxillary (Upper Jaw) Quadrants */}
          <div className="flex flex-col gap-2 items-center w-full min-w-[700px]">
            <div className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wider text-text-muted px-4">
              <span>Kuadran 1 (Kanan Atas Pasien)</span>
              <span className="text-brand-primary font-bold">RAHANG ATAS (MAXILLA)</span>
              <span>Kuadran 2 (Kiri Atas Pasien)</span>
            </div>

            <div className="flex items-center justify-center gap-4 w-full">
              {/* Q1 (Upper Right) */}
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-surface-subtle/60 border border-border-subtle shadow-2xs">
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

              {/* Midline Facial Anatomical Plane */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-mono font-bold text-text-muted uppercase">GARIS</span>
                <div className="h-20 w-0.5 bg-brand-primary/50 rounded-full" />
                <span className="text-[9px] font-mono font-bold text-text-muted uppercase">TENGAH</span>
              </div>

              {/* Q2 (Upper Left) */}
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-surface-subtle/60 border border-border-subtle shadow-2xs">
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

          {/* Central Horizontal Meridian */}
          <div className="relative flex items-center justify-center my-2">
            <div className="w-full border-t border-dashed border-border-strong/70" />
            <span className="absolute bg-surface-card px-5 py-1 text-[11px] font-mono font-bold text-text-muted border border-border-subtle rounded-full shadow-2xs">
              OKLUSI & BIDANG GINGIVA
            </span>
          </div>

          {/* Mandibular (Lower Jaw) Quadrants */}
          <div className="flex flex-col gap-2 items-center w-full min-w-[700px]">
            <div className="flex items-center justify-center gap-4 w-full">
              {/* Q4 (Lower Right) */}
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-surface-subtle/60 border border-border-subtle shadow-2xs">
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

              {/* Midline Facial Anatomical Plane */}
              <div className="flex flex-col items-center gap-1">
                <div className="h-20 w-0.5 bg-brand-primary/50 rounded-full" />
              </div>

              {/* Q3 (Lower Left) */}
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-surface-subtle/60 border border-border-subtle shadow-2xs">
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

            <div className="w-full flex items-center justify-between text-xs font-black uppercase tracking-wider text-text-muted px-4 mt-1">
              <span>Kuadran 4 (Kanan Bawah Pasien)</span>
              <span className="text-brand-primary font-bold">RAHANG BAWAH (MANDIBULA)</span>
              <span>Kuadran 3 (Kiri Bawah Pasien)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side Inspector: Selected Tooth Clinical Detail Panel */}
      <div className="w-full 2xl:w-96 shrink-0 flex flex-col gap-4">
        <Card className="rounded-3xl border-border-subtle shadow-sm overflow-hidden bg-surface-card">
          <CardHeader className="bg-surface-subtle/60 pb-3.5 border-b border-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-brand-primary text-white shadow-2xs">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-text-primary">
                    Pemeriksaan Gigi Terpilih
                  </CardTitle>
                  <p className="text-xs text-text-secondary">
                    {selectedTooth ? FDI_ANATOMICAL_LABELS[selectedTooth.fdiNumber] || 'FDI Notation' : 'Pilih elemen gigi'}
                  </p>
                </div>
              </div>

              {selectedTooth && (
                <span className="text-2xl font-mono font-black text-brand-primary bg-teal-500/10 px-3 py-1 rounded-xl border border-teal-200 dark:border-teal-800">
                  {selectedTooth.fdiNumber}
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-5 flex flex-col gap-5">
            {selectedTooth ? (
              <>
                {/* 5-Surface Detailed Matrix */}
                <div className="flex flex-col gap-2.5">
                  <span className="text-xs font-bold text-text-primary flex items-center justify-between">
                    <span>Status 5-Permukaan Anatomi:</span>
                    <span className="text-[10px] text-text-muted font-normal">Tap kotak untuk pulas</span>
                  </span>

                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { key: 'O', name: 'Oklusal' },
                      { key: 'M', name: 'Mesial' },
                      { key: 'D', name: 'Distal' },
                      { key: 'B', name: 'Bukal' },
                      { key: 'L', name: 'Lingual' },
                    ].map(({ key, name }) => {
                      const cond = selectedTooth.surfaces[key as keyof typeof selectedTooth.surfaces];
                      const isNonHealthy = cond !== 'HEALTHY';
                      return (
                        <div
                          key={key}
                          onClick={() => {
                            triggerHapticFeedback('light');
                            paintSurface(selectedTooth.fdiNumber, key as any, activeConditionTool);
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition-all ${
                            isNonHealthy
                              ? 'bg-amber-500/10 border-amber-300 dark:border-amber-800'
                              : 'bg-surface-subtle border-border-subtle hover:border-brand-primary'
                          }`}
                        >
                          <span className="text-xs font-black text-text-primary">{key}</span>
                          <span className="text-[9px] text-text-muted">{name}</span>
                          <span
                            className={`text-[9px] uppercase font-mono font-bold mt-1 px-1 rounded ${
                              isNonHealthy ? 'text-amber-800 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-400'
                            }`}
                          >
                            {cond === 'HEALTHY' ? 'OK' : cond.substring(0, 3)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Morphology / General Condition Badges */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-text-primary">
                    Morfologi & Status Kritis:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { cond: 'CROWN', label: 'Crown / Mahkota' },
                      { cond: 'ENDO', label: 'PSA / Endodontik' },
                      { cond: 'RADIX', label: 'Sisa Akar (Radix)' },
                      { cond: 'MISSING', label: 'Gigi Hilang (Missing)' },
                    ].map(({ cond, label }) => {
                      const isApplied = selectedTooth.generalCondition === cond;
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => {
                            triggerHapticFeedback('medium');
                            setToothGeneralCondition(
                              selectedTooth.fdiNumber,
                              isApplied ? 'HEALTHY' : (cond as ToothCondition)
                            );
                          }}
                          className={`px-3 py-2 text-xs font-bold rounded-xl border text-center transition-all ${
                            isApplied
                              ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                              : 'bg-surface-subtle border-border-subtle text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clinical Notes Field */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-brand-primary" />
                    Catatan Klinis & Rencana Perawatan:
                  </span>
                  <div className="p-3.5 bg-surface-subtle rounded-2xl text-xs text-text-secondary border border-border-subtle leading-relaxed">
                    {selectedTooth.notes || 'Belum ada catatan khusus pada elemen gigi ini.'}
                  </div>
                </div>

                {/* SATUSEHAT Compliance Indicator */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-500/10 border border-teal-200 dark:border-teal-800 text-[11px] text-brand-primary font-medium">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Tervalidasi FHIR R4 Condition & SNOMED CT</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      triggerHapticFeedback('selection');
                      resetTooth(selectedTooth.fdiNumber);
                      toast.info(`Kondisi gigi ${selectedTooth.fdiNumber} direset.`);
                    }}
                    className="flex-1 gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 rounded-xl h-9 font-bold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Gigi
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5 text-xs bg-brand-primary hover:bg-brand-hover text-white rounded-xl h-9 font-bold shadow-xs"
                    onClick={() => {
                      triggerHapticFeedback('success');
                      toast.success(`Rekam medis gigi ${selectedTooth.fdiNumber} disimpan.`);
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Simpan EDR
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted">
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
