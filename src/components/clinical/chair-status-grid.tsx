'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDentalStore } from '@/store/useDentalStore';
import { ChairStatus, DentalChair } from '@/types/dental';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  User,
  Activity,
  Sparkles,
  AlertCircle,
  Wrench,
  CheckCircle2,
  BellRing,
} from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';
import { DAMPED_SPRINGS } from '@/lib/motion';
import { toast } from 'sonner';

export const ChairStatusGrid: React.FC = () => {
  const { chairs, updateChairStatus } = useDentalStore();
  const [elapsedTimes, setElapsedTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const updated: Record<string, string> = {};
      chairs.forEach((chair) => {
        if (chair.startedAt && chair.status === 'IN_TREATMENT') {
          const diffMs = now - new Date(chair.startedAt).getTime();
          const mins = Math.floor(diffMs / 60000);
          const secs = Math.floor((diffMs % 60000) / 1000);
          updated[chair.id] = `${mins.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`;
        }
      });
      setElapsedTimes(updated);
    }, 1000);

    return () => clearInterval(interval);
  }, [chairs]);

  const handleStatusCycle = (chair: DentalChair) => {
    triggerHapticFeedback('medium');
    let nextStatus: ChairStatus = 'AVAILABLE';
    if (chair.status === 'AVAILABLE') nextStatus = 'IN_TREATMENT';
    else if (chair.status === 'IN_TREATMENT') nextStatus = 'DISINFECTION';
    else if (chair.status === 'DISINFECTION') nextStatus = 'AVAILABLE';
    else if (chair.status === 'MAINTENANCE') nextStatus = 'AVAILABLE';

    updateChairStatus(chair.id, nextStatus);
    toast.success(`Unit ${chair.name} dialihkan ke status: ${nextStatus}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      {chairs.map((chair) => {
        const isInTreatment = chair.status === 'IN_TREATMENT';
        const isDisinfection = chair.status === 'DISINFECTION';
        const isAvailable = chair.status === 'AVAILABLE';
        const isMaintenance = chair.status === 'MAINTENANCE';

        return (
          <motion.div
            key={chair.id}
            whileHover={{ y: -4 }}
            transition={DAMPED_SPRINGS.gentle}
            className="flex flex-col"
          >
            <Card
              className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${
                isInTreatment
                  ? 'border-brand-primary bg-gradient-to-b from-teal-500/[0.04] to-surface-card shadow-md ring-1 ring-brand-primary/30'
                  : isDisinfection
                  ? 'border-amber-400 bg-amber-500/[0.03] shadow-xs'
                  : isAvailable
                  ? 'border-emerald-300 dark:border-emerald-900/60 bg-surface-card hover:border-emerald-400'
                  : 'border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 opacity-75'
              }`}
            >
              {/* Dynamic Breathing Top Bar for In-Treatment */}
              {isInTreatment && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600 animate-pulse" />
              )}

              <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                {/* Header: Chair Number & Status Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-surface-subtle font-mono text-sm font-extrabold text-text-primary border border-border-subtle">
                      0{chair.number}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary line-clamp-1">
                        {chair.name}
                      </h4>
                      <span className="text-[11px] text-text-muted">
                        {chair.doctorName || 'Belum Ada Dokter'}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      isInTreatment
                        ? 'bg-teal-500/10 text-brand-primary border-teal-300 dark:border-teal-700'
                        : isDisinfection
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300'
                        : isAvailable
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    {isInTreatment
                      ? 'Sedang Tindakan'
                      : isDisinfection
                      ? 'Disinfeksi PPI'
                      : isAvailable
                      ? 'Tersedia'
                      : 'Maintenance'}
                  </Badge>
                </div>

                {/* Body Content based on Status */}
                {isInTreatment && (
                  <div className="flex flex-col gap-2 p-3 bg-surface-subtle/70 rounded-2xl border border-border-subtle/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted font-medium flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-brand-primary" />
                        Pasien:
                      </span>
                      <strong className="text-text-primary font-semibold">
                        {chair.patientInitials}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted font-medium flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-teal-600" />
                        Tindakan:
                      </span>
                      <span className="text-text-secondary font-medium text-[11px] truncate max-w-[130px]">
                        {chair.procedureName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border-subtle">
                      <span className="text-text-muted font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
                        Durasi Berjalan:
                      </span>
                      <span className="font-mono font-bold text-xs text-brand-primary bg-teal-500/10 px-2 py-0.5 rounded-md">
                        {elapsedTimes[chair.id] || '00:00'}
                      </span>
                    </div>
                  </div>
                )}

                {isDisinfection && (
                  <div className="flex flex-col items-center justify-center p-4 bg-amber-500/5 rounded-2xl border border-amber-200 dark:border-amber-900/50 text-center gap-1">
                    <Sparkles className="w-6 h-6 text-amber-600 animate-bounce" />
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      Sterilisasi Unit Gigi
                    </span>
                    <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                      SOP PPI Kemenkes: Semprot desinfektan permukaan & flush suction (3 mnt).
                    </p>
                  </div>
                )}

                {isAvailable && (
                  <div className="flex flex-col items-center justify-center p-4 bg-emerald-500/5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 text-center gap-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      Unit Steril & Siap
                    </span>
                    <p className="text-[11px] text-text-muted">
                      Menunggu panggilan pasien berikutnya dari antrean utama.
                    </p>
                  </div>
                )}

                {isMaintenance && (
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 text-center gap-1">
                    <Wrench className="w-6 h-6 text-slate-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Servis Handpiece / Kompresor
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Unit dinonaktifkan sementara untuk maintenance rutin.
                    </p>
                  </div>
                )}

                {/* Footer Quick Action Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs gap-1.5 h-8 rounded-xl font-medium"
                    onClick={() => handleStatusCycle(chair)}
                  >
                    Ganti Status
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl text-text-muted hover:text-brand-primary"
                    onClick={() => {
                      triggerHapticFeedback('light');
                      toast.info(`Memanggil asisten perawat ke ${chair.name}`);
                    }}
                    title="Panggil Perawat / Asisten"
                  >
                    <BellRing className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
