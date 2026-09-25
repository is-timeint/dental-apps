'use client';

import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { QueueItem } from '@/types/dental';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Clock,
  HeartPulse,
  ShieldAlert,
  ArrowRight,
  PhoneCall,
  Check,
} from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';
import { DAMPED_SPRINGS } from '@/lib/motion';
import { toast } from 'sonner';

interface QueueCardProps {
  item: QueueItem;
  onCallPatient: (id: string) => void;
  onSeatPatient: (id: string) => void;
}

export const QueueCard: React.FC<QueueCardProps> = ({
  item,
  onCallPatient,
  onSeatPatient,
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 0, 150], [-4, 0, 4]);
  const opacity = useTransform(x, [-150, 0, 150], [0.6, 1, 0.6]);

  const isEmergency = item.priority === 'EMERGENCY';
  const isFastTrack = item.priority === 'FAST_TRACK';
  const hasSafetyAlert = item.clinicalWarnings.length > 0;
  const hasAllergy = item.allergies.length > 0;

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      triggerHapticFeedback('success');
      onSeatPatient(item.id);
      toast.success(`${item.patientName} dipindahkan ke Dental Chair.`);
    } else if (info.offset.x < -100) {
      triggerHapticFeedback('medium');
      onCallPatient(item.id);
      toast.info(`Memanggil antrean ${item.ticketCode} (${item.patientName})`);
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: -120, right: 120 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileHover={{ y: -3 }}
      transition={DAMPED_SPRINGS.tactile}
      className={`relative p-5 rounded-3xl border bg-surface-card shadow-xs transition-shadow duration-200 select-none cursor-grab active:cursor-grabbing ${
        hasSafetyAlert
          ? 'border-rose-300 dark:border-rose-900 ring-1 ring-rose-400/20'
          : 'border-border-subtle hover:border-brand-primary/50'
      }`}
    >
      {/* Top Meta: Ticket & Priority */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-brand-primary text-white font-mono text-sm font-extrabold tracking-wide shadow-xs">
            {item.ticketCode}
          </span>
          <span className="text-xs font-bold text-text-primary">
            {item.patientName} ({item.patientAge} th)
          </span>
        </div>

        <Badge
          variant="outline"
          className={`text-[10px] uppercase font-bold tracking-wider rounded-full ${
            isEmergency
              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300'
              : isFastTrack
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200'
          }`}
        >
          {item.priority}
        </Badge>
      </div>

      {/* Chief Complaint */}
      <p className="text-xs text-text-secondary line-clamp-2 mb-3 bg-surface-subtle/50 p-2.5 rounded-xl border border-border-subtle/50">
        <span className="font-semibold text-text-primary">Keluhan: </span>
        {item.chiefComplaint}
      </p>

      {/* Vital Signs Strip & Safety Interlocks */}
      {item.vitalSigns && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg bg-surface-subtle border border-border-subtle">
            <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
            <span>
              TD: <strong>{item.vitalSigns.systolic}/{item.vitalSigns.diastolic}</strong> mmHg
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg bg-surface-subtle border border-border-subtle">
            <span>HR: <strong>{item.vitalSigns.pulseRate}</strong> bpm</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg bg-surface-subtle border border-border-subtle">
            <span>SpO2: <strong>{item.vitalSigns.oxygenSaturation}%</strong></span>
          </div>
        </div>
      )}

      {/* Clinical Allergy & Safety Interlock Warnings */}
      {(hasAllergy || hasSafetyAlert) && (
        <div className="flex flex-col gap-1.5 mb-4">
          {hasAllergy && (
            <div className="flex items-center gap-1.5 text-[11px] text-rose-700 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Alergi: {item.allergies.join(', ')}</span>
            </div>
          )}

          {item.clinicalWarnings.map((warn, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer Info & Action Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-xs">
        <div className="flex items-center gap-1 text-text-muted">
          <Clock className="w-3.5 h-3.5" />
          <span>Antre sejak {item.waitingSince}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs rounded-xl"
            onClick={() => {
              triggerHapticFeedback('light');
              onCallPatient(item.id);
            }}
          >
            <PhoneCall className="w-3 h-3 text-brand-primary" />
            Panggil
          </Button>

          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs rounded-xl bg-brand-primary hover:bg-brand-hover text-white"
            onClick={() => {
              triggerHapticFeedback('success');
              onSeatPatient(item.id);
            }}
          >
            <span>Masuk Kursi</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
