'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Crown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Truck,
  PlusCircle,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';
import { toast } from 'sonner';

interface LabOrder {
  id: string;
  orderNumber: string;
  patientName: string;
  patientRm: string;
  doctorName: string;
  fdiTeeth: number[];
  prostheticType: string;
  shade: string;
  vendorName: string;
  status: 'SENT_TO_VENDOR' | 'IN_FABRICATION' | 'RECEIVED_QC_PASSED' | 'SEATED_COMPLETED';
  estimatedDate: string;
  hasScheduleInterlock: boolean;
}

const SAMPLE_ORDERS: LabOrder[] = [
  {
    id: 'lab-1',
    orderNumber: 'LAB-2026-0041',
    patientName: 'Ny. Dwi Lestari',
    patientRm: 'RM-2026-0812',
    doctorName: 'drg. Hendra Sp.BM',
    fdiTeeth: [46],
    prostheticType: 'Crown Zirconia Monolithic',
    shade: 'A2 (VITA 3D-Master)',
    vendorName: 'Dental Lab Artindo Perkasa',
    status: 'IN_FABRICATION',
    estimatedDate: '28 Sep 2026',
    hasScheduleInterlock: true,
  },
  {
    id: 'lab-2',
    orderNumber: 'LAB-2026-0038',
    patientName: 'Tn. Kevin Pratama',
    patientRm: 'RM-2026-0790',
    doctorName: 'drg. Sarah Sp.KG',
    fdiTeeth: [11, 21],
    prostheticType: 'E-Max Veneer All-Ceramic',
    shade: 'BL2 Bleach Shade',
    vendorName: 'DentArt Estetika Laboratorium',
    status: 'RECEIVED_QC_PASSED',
    estimatedDate: '24 Sep 2026',
    hasScheduleInterlock: false,
  },
  {
    id: 'lab-3',
    orderNumber: 'LAB-2026-0032',
    patientName: 'Bpk. Ahmad Fauzi',
    patientRm: 'RM-2026-0891',
    doctorName: 'drg. Budi Sp.Ort',
    fdiTeeth: [16, 26, 36, 46],
    prostheticType: 'Clear Aligner Phase 1 (Stage 1-8)',
    shade: 'Transparent High-Elastic',
    vendorName: 'Invisalign / ClearAlign Labs',
    status: 'SENT_TO_VENDOR',
    estimatedDate: '05 Okt 2026',
    hasScheduleInterlock: true,
  },
];

export const DentalLabView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
            <Crown className="w-5 h-5 text-brand-primary" />
            Dental Lab Hub & SPK Interlock (Modul 03)
          </h2>
          <p className="text-xs text-text-secondary">
            Pelacakan pesanan mahkota tiruan, veneer, aligner, dan rangka tiruan dengan proteksi jadwal interlock.
          </p>
        </div>

        <Button
          size="sm"
          className="bg-brand-primary hover:bg-brand-hover text-white rounded-xl gap-2 text-xs font-bold shadow-xs h-9"
          onClick={() => {
            triggerHapticFeedback('light');
            toast.success('Formulir SPK Dental Lab Baru dibuka.');
          }}
        >
          <PlusCircle className="w-4 h-4" />
          Terbitkan SPK Lab Baru
        </Button>
      </div>

      {/* Critical Interlock Alert Banner */}
      <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-300 dark:border-amber-800 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex flex-col text-xs text-amber-900 dark:text-amber-200">
          <strong className="font-bold">Schedule Interlock Aktif:</strong>
          <p className="mt-0.5 text-text-secondary">
            Kalender klinik otomatis mengunci dan menolak janji temu kontrol pemasangan untuk pasien jika status SPK lab belum <strong>RECEIVED_QC_PASSED</strong>. Mencegah insiden pasien hadir namun cetakan belum dikirim vendor.
          </p>
        </div>
      </div>

      {/* Active Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SAMPLE_ORDERS.map((order) => {
          const isPassed = order.status === 'RECEIVED_QC_PASSED';
          const isInFabrication = order.status === 'IN_FABRICATION';

          return (
            <Card
              key={order.id}
              className={`rounded-3xl border bg-surface-card shadow-xs transition-all ${
                order.hasScheduleInterlock
                  ? 'border-amber-300 dark:border-amber-800'
                  : 'border-border-subtle'
              }`}
            >
              <CardHeader className="bg-surface-subtle/50 pb-3 border-b border-border-subtle">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-brand-primary">
                    {order.orderNumber}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold rounded-full ${
                      isPassed
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300'
                        : isInFabrication
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {isPassed
                      ? 'Lolos QC Klinik'
                      : isInFabrication
                      ? 'Dalam Fabrikasi Lab'
                      : 'Dikirim ke Vendor'}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-bold text-text-primary mt-1">
                  {order.patientName}
                </CardTitle>
                <span className="text-[11px] text-text-muted">
                  No. RM: {order.patientRm} • DP: {order.doctorName}
                </span>
              </CardHeader>

              <CardContent className="p-4 flex flex-col gap-3 text-xs">
                <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-surface-subtle border border-border-subtle">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Jenis Restorasi:</span>
                    <strong className="text-text-primary text-right">{order.prostheticType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Elemen Gigi:</span>
                    <strong className="font-mono text-brand-primary">
                      Gigi {order.fdiTeeth.join(', ')}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Warna / Shade:</span>
                    <span className="font-medium text-text-secondary">{order.shade}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-brand-primary" />
                    {order.vendorName}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Est: {order.estimatedDate}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
                  {isPassed ? (
                    <Button
                      size="sm"
                      className="w-full text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-8"
                      onClick={() => {
                        triggerHapticFeedback('success');
                        toast.success('Janji temu pemasangan dibuka di kalender.');
                      }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Jadwalkan Kontrol Pasang
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs font-bold rounded-xl gap-1.5 h-8 border-amber-300 text-amber-800 dark:text-amber-300"
                      onClick={() => {
                        triggerHapticFeedback('medium');
                        toast.info('Status order diverifikasi ke kurir lab.');
                      }}
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      Cek QC & Penerimaan
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
