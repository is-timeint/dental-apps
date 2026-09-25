'use client';

import React from 'react';
import { useDentalStore } from '@/store/useDentalStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Droplets, Info } from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';

export const PeriodontalPreview: React.FC = () => {
  const { periodontalData, selectedToothFdi, updatePeriodontalPoint } = useDentalStore();
  const activeFdi = selectedToothFdi || 46;
  const perio = periodontalData[activeFdi] || {
    fdiNumber: activeFdi,
    db: 3,
    b: 2,
    mb: 3,
    dl: 3,
    l: 2,
    ml: 3,
    bop: false,
  };

  const getDepthColor = (depth: number) => {
    if (depth <= 3) return 'bg-emerald-500 text-white';
    if (depth <= 5) return 'bg-amber-500 text-white';
    return 'bg-rose-600 text-white animate-pulse';
  };

  const handleDepthChange = (
    key: 'db' | 'b' | 'mb' | 'dl' | 'l' | 'ml',
    delta: number
  ) => {
    triggerHapticFeedback('selection');
    const current = perio[key];
    const updated = Math.max(1, Math.min(12, current + delta));
    updatePeriodontalPoint(activeFdi, { [key]: updated });
  };

  const hasDeepPocket =
    perio.db >= 5 ||
    perio.b >= 5 ||
    perio.mb >= 5 ||
    perio.dl >= 5 ||
    perio.l >= 5 ||
    perio.ml >= 5;

  return (
    <Card className="rounded-3xl border-border-subtle shadow-sm overflow-hidden">
      <CardHeader className="bg-surface-subtle/50 pb-3 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
              <span>Periodontal 6-Point Probing (Gigi {activeFdi})</span>
              {perio.bop && (
                <Badge variant="destructive" className="text-[10px] gap-1 px-1.5 py-0.5">
                  <Droplets className="w-3 h-3" />
                  BOP Positif
                </Badge>
              )}
            </CardTitle>
            <p className="text-xs text-text-secondary">
              Kedalaman saku gusi (Pocket Depth) Standar WHO / AAP
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('medium');
              updatePeriodontalPoint(activeFdi, { bop: !perio.bop });
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              perio.bop
                ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                : 'bg-surface-subtle text-text-secondary border-border-subtle hover:text-text-primary'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>{perio.bop ? 'Perdarahan Aktif' : 'Cek BOP'}</span>
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-5 flex flex-col gap-5">
        {hasDeepPocket && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Terdeteksi saku periodontal dalam (&ge; 5mm). Indikasi scaling & root planing (SRP) mendalam atau kuretase.
            </span>
          </div>
        )}

        {/* 6-Point Probing Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Buccal / Labial Surface (3 Points) */}
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-surface-subtle border border-border-subtle">
            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Sisi Fasial / Bukal:
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              {(['mb', 'b', 'db'] as const).map((point) => (
                <div key={point} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-text-muted uppercase font-mono font-bold">
                    {point}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-xs ${getDepthColor(
                      perio[point]
                    )}`}
                  >
                    {perio[point]}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleDepthChange(point, -1)}
                      className="w-5 h-5 rounded bg-surface-card border border-border-subtle text-xs hover:bg-slate-100 flex items-center justify-center"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDepthChange(point, 1)}
                      className="w-5 h-5 rounded bg-surface-card border border-border-subtle text-xs hover:bg-slate-100 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lingual / Palatal Surface (3 Points) */}
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-surface-subtle border border-border-subtle">
            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Sisi Lingual / Palatal:
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              {(['ml', 'l', 'dl'] as const).map((point) => (
                <div key={point} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-text-muted uppercase font-mono font-bold">
                    {point}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-xs ${getDepthColor(
                      perio[point]
                    )}`}
                  >
                    {perio[point]}
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleDepthChange(point, -1)}
                      className="w-5 h-5 rounded bg-surface-card border border-border-subtle text-xs hover:bg-slate-100 flex items-center justify-center"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDepthChange(point, 1)}
                      className="w-5 h-5 rounded bg-surface-card border border-border-subtle text-xs hover:bg-slate-100 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary pt-2 border-t border-border-subtle">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500" />
            <span>1–3 mm (Sulcus Sehat)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-500" />
            <span>4–5 mm (Saku Sedang)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-600" />
            <span>&ge; 6 mm (Periodontitis Kronis)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
