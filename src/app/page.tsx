'use client';

import React from 'react';
import { TopNav } from '@/components/layout/top-nav';
import { ChairStatusGrid } from '@/components/clinical/chair-status-grid';
import { OdontogramGrid } from '@/components/clinical/odontogram-grid';
import { QueueCard } from '@/components/clinical/queue-card';
import { PeriodontalPreview } from '@/components/clinical/periodontal-preview';
import { StandardSlidingTabs, TabItem } from '@/components/ui/sliding-tabs';
import { RollingNumberTicker } from '@/components/ui/rolling-ticker';
import { useDentalStore } from '@/store/useDentalStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Activity,
  CalendarCheck,
  CreditCard,
  PlusCircle,
  QrCode,
  Receipt,
  UserCheck,
  Users,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { triggerHapticFeedback } from '@/lib/haptic';

export default function Home() {
  const {
    dailyRevenue,
    completedProceduresCount,
    chairs,
    queue,
    advanceQueueStatus,
    updateChairStatus,
  } = useDentalStore();

  const occupiedChairsCount = chairs.filter((c) => c.status === 'IN_TREATMENT').length;
  const waitingQueueCount = queue.filter((q) => q.status === 'WAITING' || q.status === 'TRIAGED').length;

  const tabs: TabItem[] = [
    { id: 'live-floor', label: 'Live Floor & Unit Gigi', badgeCount: occupiedChairsCount },
    { id: 'odontogram', label: 'Odontogram 2.0 (Core EMR)' },
    { id: 'queue-triage', label: 'Antrean & Triage Medis', badgeCount: waitingQueueCount },
    { id: 'periodontal', label: 'Pemeriksaan Periodontal' },
    { id: 'billing-pos', label: 'Billing & Kasir POS' },
  ];

  const handleCallPatient = (id: string) => {
    advanceQueueStatus(id, 'CALLED');
  };

  const handleSeatPatient = (id: string) => {
    advanceQueueStatus(id, 'IN_CHAIR');
    const availableChair = chairs.find((c) => c.status === 'AVAILABLE');
    if (availableChair) {
      updateChairStatus(availableChair.id, 'IN_TREATMENT');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas-background text-text-primary">
      {/* Top Navigation */}
      <TopNav />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        {/* KPI Metrics Strip with Rolling Ticker */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Pendapatan Hari Ini
                </span>
                <RollingNumberTicker value={dailyRevenue} prefix="Rp " className="mt-1" />
              </div>
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center text-brand-primary">
                <Wallet className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          {/* Completed Procedures */}
          <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Tindakan Selesai
                </span>
                <RollingNumberTicker
                  value={completedProceduresCount}
                  prefix=""
                  className="mt-1"
                />
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          {/* Active Chairs */}
          <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Unit Gigi Terisi
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold font-mono text-text-primary">
                    {occupiedChairsCount}
                  </span>
                  <span className="text-xs font-mono text-text-muted">/ {chairs.length} Unit</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center text-brand-primary">
                <Activity className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          {/* Queue Count */}
          <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  Pasien Menunggu
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold font-mono text-text-primary">
                    {waitingQueueCount}
                  </span>
                  <span className="text-xs text-text-muted">Orang di Ruang Tunggu</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Users className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sliding Tabs Main Workspace */}
        <StandardSlidingTabs tabs={tabs} defaultTab={0}>
          {(activeIndex) => {
            // Tab 0: Live Floor
            if (activeIndex === 0) {
              return (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-text-primary">
                        Live Floor & Dental Unit Operatory
                      </h2>
                      <p className="text-xs text-text-secondary">
                        Monitoring real-time utilisasi kursi periksa, timer tindakan dokter, dan status sterilisasi PPI.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-brand-primary hover:bg-brand-hover text-white rounded-xl gap-1.5 text-xs shadow-xs"
                        onClick={() => {
                          triggerHapticFeedback('light');
                          toast.info('Panggilan otomatis disiarkan ke TV Ruang Tunggu');
                        }}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Panggil Antrean Berikutnya
                      </Button>
                    </div>
                  </div>

                  <ChairStatusGrid />
                </div>
              );
            }

            // Tab 1: Odontogram 2.0 (Core EMR)
            if (activeIndex === 1) {
              return (
                <div className="flex flex-col gap-5">
                  {/* Active Patient EMR Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-surface-card border border-border-subtle shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-300 dark:border-teal-700 flex items-center justify-center font-bold text-brand-primary text-base">
                        AH
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-text-primary">
                            Bpk. Ahmad Fauzi (42 th)
                          </h3>
                          <Badge variant="outline" className="text-[10px] font-mono border-teal-300">
                            RM-2026-0891
                          </Badge>
                          <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 text-[10px]">
                            Alergi: Penisilin
                          </Badge>
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">
                          Dokter Pemeriksa: <strong>drg. Sarah Sp.KG</strong> • Kursi: <strong>Operatory 1</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs gap-1.5 border-teal-300 text-brand-primary">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                        Sesi EDR Terkunci (Chair-Side Active)
                      </Badge>
                    </div>
                  </div>

                  <OdontogramGrid />
                </div>
              );
            }

            // Tab 2: Queue & Triage
            if (activeIndex === 2) {
              return (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-text-primary">
                        Antrean Pasien & Clinical Triage Interlock
                      </h2>
                      <p className="text-xs text-text-secondary">
                        Geser kartu antrean ke kanan untuk memasukkan pasien ke Dental Chair, atau ke kiri untuk memanggil audio.
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl text-xs gap-1.5"
                      onClick={() => {
                        triggerHapticFeedback('light');
                        toast.success('Form pendaftaran pasien baru dibuka.');
                      }}
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-brand-primary" />
                      Registrasi Walk-In Pasien
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {queue.map((item) => (
                      <QueueCard
                        key={item.id}
                        item={item}
                        onCallPatient={handleCallPatient}
                        onSeatPatient={handleSeatPatient}
                      />
                    ))}
                  </div>
                </div>
              );
            }

            // Tab 3: Periodontal Charting
            if (activeIndex === 3) {
              return (
                <div className="flex flex-col gap-5">
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">
                      Pemeriksaan Jaringan Periodontal (Gusi & Tulang Alveolar)
                    </h2>
                    <p className="text-xs text-text-secondary">
                      Pemetaan kedalaman saku periodontal (6-Point Probing) dan Bleeding on Probing (BOP) sesuai standar WHO.
                    </p>
                  </div>

                  <PeriodontalPreview />
                </div>
              );
            }

            // Tab 4: Billing & POS
            if (activeIndex === 4) {
              return (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-text-primary">
                        Kasir, POS & Split Payment Reconciliation
                      </h2>
                      <p className="text-xs text-text-secondary">
                        Modul pembayaran cepat terintegrasi QRIS Statis/Dinamis, klaim asuransi TPA, dan perhitungan komisi dokter.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs gap-1.5 shadow-xs"
                        onClick={() => {
                          triggerHapticFeedback('light');
                          toast.success('Menutup shift kasir & mencetak Blind Drop Report.');
                        }}
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Tutup Shift Kasir (Blind Drop)
                      </Button>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                            Total QRIS Masuk
                          </span>
                          <p className="text-lg font-bold font-mono text-teal-700 dark:text-teal-300 mt-1">
                            Rp 14.850.000
                          </p>
                          <span className="text-[10px] text-text-muted">7 Transaksi Sukses</span>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center text-brand-primary">
                          <QrCode className="w-5 h-5" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                            Debit & Kartu Kredit
                          </span>
                          <p className="text-lg font-bold font-mono text-text-primary mt-1">
                            Rp 9.600.000
                          </p>
                          <span className="text-[10px] text-text-muted">4 Transaksi EDC</span>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                          <CreditCard className="w-5 h-5" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                            Klaim TPA / Asuransi
                          </span>
                          <p className="text-lg font-bold font-mono text-text-primary mt-1">
                            Rp 4.000.000
                          </p>
                          <span className="text-[10px] text-text-muted">3 Berkas Pre-Auth</span>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                          <Wallet className="w-5 h-5" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            }

            return null;
          }}
        </StandardSlidingTabs>
      </main>
    </div>
  );
}
