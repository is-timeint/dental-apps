'use client';

import React, { useState } from 'react';
import { ClinicalSidebar, ModuleId } from '@/components/layout/clinical-sidebar';
import { TopNav } from '@/components/layout/top-nav';
import { ChairStatusGrid } from '@/components/clinical/chair-status-grid';
import { OdontogramGrid } from '@/components/clinical/odontogram-grid';
import { QueueCard } from '@/components/clinical/queue-card';
import { PeriodontalPreview } from '@/components/clinical/periodontal-preview';
import { DentalLabView } from '@/components/modules/dental-lab-view';
import { BmhpInventoryView } from '@/components/modules/bmhp-inventory-view';
import { SatuSehatView } from '@/components/modules/satusehat-view';
import { BpjsPcareView } from '@/components/modules/bpjs-pcare-view';
import { Intraoral3DViewer } from '@/components/clinical/intraoral-3d-viewer';
import { XrayDicomViewer } from '@/components/clinical/xray-dicom-viewer';
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
  AlertTriangle,
  Pill,
  ShieldAlert,
  Tv,
  MessageSquare,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { triggerHapticFeedback } from '@/lib/haptic';

// Tab items definition for StandardSlidingTabs with magnetic activeTabPill
const CLINICAL_TABS: TabItem[] = [
  { id: 'odontogram', label: 'Odontogram 2.0 (EMR)' },
  { id: 'live-floor', label: 'Live Floor & Unit Gigi', badgeCount: 3 },
  { id: 'periodontal', label: 'Periodontal Charting' },
  { id: 'dental-lab', label: 'Dental Lab Hub & SPK', badgeCount: 2 },
  { id: 'queue-triage', label: 'Antrean & Triage Medis', badgeCount: 3 },
  { id: 'billing-pos', label: 'Kasir & Billing POS' },
  { id: 'bmhp-inventory', label: 'Smart BMHP & Stok' },
  { id: 'satusehat-bpjs', label: 'SATUSEHAT & BPJS P-Care' },
];

export default function Home() {
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const [activeSidebarModule, setActiveSidebarModule] = useState<ModuleId>('odontogram');
  const [emrSubMode, setEmrSubMode] = useState<'ODONTOGRAM' | 'DICOM_XRAY' | 'INTRAORAL_3D'>('ODONTOGRAM');

  const {
    dailyRevenue,
    completedProceduresCount,
    chairs,
    queue,
    advanceQueueStatus,
    updateChairStatus,
  } = useDentalStore();

  const occupiedChairsCount = chairs.filter((c) => c.status === 'IN_TREATMENT').length;
  const waitingQueueCount = queue.filter(
    (q) => q.status === 'WAITING' || q.status === 'TRIAGED'
  ).length;

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

  // Sync sidebar selection to corresponding sliding tab
  const handleSelectSidebarModule = (id: ModuleId) => {
    setActiveSidebarModule(id);
    switch (id) {
      case 'odontogram':
        setActiveTabIdx(0);
        setEmrSubMode('ODONTOGRAM');
        break;
      case 'xray-agent':
        setActiveTabIdx(0);
        setEmrSubMode('DICOM_XRAY');
        break;
      case 'live-floor':
        setActiveTabIdx(1);
        break;
      case 'periodontal':
        setActiveTabIdx(2);
        break;
      case 'dental-lab':
        setActiveTabIdx(3);
        break;
      case 'safety-triage':
      case 'queue-tv':
        setActiveTabIdx(4);
        break;
      case 'billing-pos':
      case 'cashier-reconciliation':
      case 'insurance-tpa':
        setActiveTabIdx(5);
        break;
      case 'bmhp-inventory':
      case 'logistics':
        setActiveTabIdx(6);
        break;
      case 'satusehat':
      case 'bpjs-pcare':
      case 'prescription':
      case 'whatsapp-crm':
        setActiveTabIdx(7);
        break;
      default:
        setActiveTabIdx(0);
    }
  };

  // Sync sliding tab click to corresponding sidebar module
  const handleSlidingTabChange = (idx: number) => {
    setActiveTabIdx(idx);
    const tabId = CLINICAL_TABS[idx].id;
    if (tabId === 'odontogram') setActiveSidebarModule('odontogram');
    else if (tabId === 'live-floor') setActiveSidebarModule('live-floor');
    else if (tabId === 'periodontal') setActiveSidebarModule('periodontal');
    else if (tabId === 'dental-lab') setActiveSidebarModule('dental-lab');
    else if (tabId === 'queue-triage') setActiveSidebarModule('queue-tv');
    else if (tabId === 'billing-pos') setActiveSidebarModule('billing-pos');
    else if (tabId === 'bmhp-inventory') setActiveSidebarModule('bmhp-inventory');
    else if (tabId === 'satusehat-bpjs') setActiveSidebarModule('satusehat');
  };

  return (
    <div className="flex h-screen w-full bg-canvas-background text-text-primary overflow-hidden">
      {/* 16-Module Clinical Sidebar */}
      <ClinicalSidebar
        activeModule={activeSidebarModule}
        onSelectModule={handleSelectSidebarModule}
      />

      {/* Main Clinical Canvas Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Full-Width Header Top Bar */}
        <TopNav />

        {/* Scrollable Clinical Workspace */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-6">
          {/* KPI Strip with Rolling Number Ticker */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 shrink-0">
            {/* Revenue */}
            <Card className="rounded-2xl border-border-subtle bg-surface-card shadow-xs">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Pendapatan Hari Ini
                  </span>
                  <div className="mt-0.5">
                    <RollingNumberTicker value={dailyRevenue} prefix="Rp" />
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-brand-primary">
                  <Wallet className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            {/* Completed Procedures */}
            <Card className="rounded-2xl border-border-subtle bg-surface-card shadow-xs">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Tindakan Selesai
                  </span>
                  <div className="mt-0.5">
                    <RollingNumberTicker
                      value={completedProceduresCount}
                      prefix=""
                      suffix="Tindakan"
                    />
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <CalendarCheck className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            {/* Active Chairs */}
            <Card className="rounded-2xl border-border-subtle bg-surface-card shadow-xs">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Unit Gigi Terisi
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-bold font-mono text-text-primary">
                      {occupiedChairsCount}
                    </span>
                    <span className="text-xs font-mono text-text-muted">/ {chairs.length} Unit</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-brand-primary">
                  <Activity className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            {/* Waiting Queue */}
            <Card className="rounded-2xl border-border-subtle bg-surface-card shadow-xs">
              <CardContent className="p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                    Antrean Pasien
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-bold font-mono text-text-primary">
                      {waitingQueueCount}
                    </span>
                    <span className="text-xs text-text-muted">Pasien Menunggu</span>
                  </div>
                </div>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Users className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Standard Sliding Tabs with Magnetic Pill Indicator & Direction-Aware Slide */}
          <StandardSlidingTabs
            tabs={CLINICAL_TABS}
            activeTab={activeTabIdx}
            onChange={handleSlidingTabChange}
          >
            {(activeIndex) => {
              // Tab 0: Odontogram 2.0 (Core EMR)
              if (activeIndex === 0) {
                return (
                  <div className="flex flex-col gap-4">
                    {/* Active Patient EMR Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-surface-card border border-border-subtle shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-300 dark:border-teal-700 flex items-center justify-center font-black text-brand-primary text-base">
                          AF
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-text-primary">
                              Bpk. Ahmad Fauzi (42 th)
                            </h3>
                            <Badge variant="outline" className="text-[10px] font-mono border-teal-300 text-brand-primary">
                              RM-2026-0891
                            </Badge>
                            <Badge className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-300 text-[10px] font-bold">
                              Alergi: Penisilin (Amoxicillin)
                            </Badge>
                          </div>
                          <p className="text-xs text-text-muted mt-0.5">
                            Dokter DPJP: <strong>drg. Sarah Sp.KG</strong> • Kursi: <strong>Operatory 1 (Master Suite)</strong> • Diagnosis: <strong>Karies Profunda Gigi 46</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs gap-1.5 border-teal-300 text-brand-primary py-1 px-3">
                          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                          Sesi EDR Terkunci (Chair-Side Active)
                        </Badge>
                      </div>
                    </div>

                    {/* EMR Modality Switcher (PRD 3.1: SVG Odontogram, 2D DICOM, Three.js 3D) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-surface-subtle border border-border-subtle rounded-2xl">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHapticFeedback('selection');
                            setEmrSubMode('ODONTOGRAM');
                          }}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                            emrSubMode === 'ODONTOGRAM'
                              ? 'bg-brand-primary text-white shadow-xs'
                              : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          Bagan Odontogram 2D (FDI)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            triggerHapticFeedback('selection');
                            setEmrSubMode('DICOM_XRAY');
                          }}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                            emrSubMode === 'DICOM_XRAY'
                              ? 'bg-brand-primary text-white shadow-xs'
                              : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          Radiologi DICOM 2D (Cornerstone)
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            triggerHapticFeedback('selection');
                            setEmrSubMode('INTRAORAL_3D');
                          }}
                          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                            emrSubMode === 'INTRAORAL_3D'
                              ? 'bg-brand-primary text-white shadow-xs'
                              : 'text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          Pemindai 3D Intraoral (Three.js STL)
                        </button>
                      </div>

                      <div className="text-[11px] text-text-muted px-2">
                        Pencitraan Medis & 3D (PRD 3.1)
                      </div>
                    </div>

                    {/* Modality View Body */}
                    {emrSubMode === 'ODONTOGRAM' && <OdontogramGrid />}
                    {emrSubMode === 'DICOM_XRAY' && <XrayDicomViewer />}
                    {emrSubMode === 'INTRAORAL_3D' && <Intraoral3DViewer />}
                  </div>
                );
              }

              // Tab 1: Live Floor & Dental Chairs
              if (activeIndex === 1) {
                return (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-black text-text-primary">
                          Live Floor & Dental Chair Operations (Modul 01)
                        </h2>
                        <p className="text-xs text-text-secondary">
                          Representasi denah fisik operatory, timer tindakan real-time, dan siklus sterilisasi PPI Kemenkes.
                        </p>
                      </div>

                      <Button
                        size="sm"
                        className="bg-brand-primary hover:bg-brand-hover text-white rounded-xl gap-2 text-xs font-bold shadow-xs h-9"
                        onClick={() => {
                          triggerHapticFeedback('light');
                          toast.info('Panggilan otomatis disiarkan ke TV Ruang Tunggu.');
                        }}
                      >
                        <UserCheck className="w-4 h-4" />
                        Panggil Antrean ke Kursi Tersedia
                      </Button>
                    </div>

                    <ChairStatusGrid />
                  </div>
                );
              }

              // Tab 2: Periodontal Charting
              if (activeIndex === 2) {
                return (
                  <div className="flex flex-col gap-5">
                    <div>
                      <h2 className="text-lg font-black text-text-primary">
                        Periodontal Charting & OHI-S Index (Modul 12)
                      </h2>
                      <p className="text-xs text-text-secondary">
                        Pemetaan 6-point probing depth saku periodontal dan Bleeding on Probing (BOP) sesuai standar WHO.
                      </p>
                    </div>

                    <PeriodontalPreview />
                  </div>
                );
              }

              // Tab 3: Dental Lab Hub & SPK
              if (activeIndex === 3) {
                return <DentalLabView />;
              }

              // Tab 4: Queue & Triage Interlock
              if (activeIndex === 4) {
                return (
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-black text-text-primary">
                          Antrean Pasien & Clinical Safety Interlock (Modul 13 & 14)
                        </h2>
                        <p className="text-xs text-text-secondary">
                          Geser kartu antrean ke kanan untuk memasukkan pasien ke Dental Chair, atau ke kiri untuk memanggil audio.
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl text-xs font-bold gap-1.5 h-9"
                        onClick={() => {
                          triggerHapticFeedback('light');
                          toast.success('Form registrasi walk-in dibuka.');
                        }}
                      >
                        <PlusCircle className="w-4 h-4 text-brand-primary" />
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

              // Tab 5: Billing POS & Kasir
              if (activeIndex === 5) {
                return (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-black text-text-primary">
                          Kasir, Billing POS & Rekonsiliasi Shift (Modul 05, 10, 15)
                        </h2>
                        <p className="text-xs text-text-secondary">
                          Multi-payment split (QRIS, Kartu Debit, Asuransi TPA) dan Blind Drop Cash Drawer shift kasir.
                        </p>
                      </div>

                      <Button
                        size="sm"
                        className="bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-bold gap-1.5 shadow-xs h-9"
                        onClick={() => {
                          triggerHapticFeedback('light');
                          toast.success('Menutup shift kasir & mencetak Blind Drop Report.');
                        }}
                      >
                        <Receipt className="w-4 h-4" />
                        Tutup Shift Kasir (Blind Drop)
                      </Button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] font-bold uppercase text-text-muted">
                              Total QRIS Masuk
                            </span>
                            <p className="text-lg font-black font-mono text-teal-700 dark:text-teal-300 mt-1">
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
                            <span className="text-[11px] font-bold uppercase text-text-muted">
                              Debit & Kartu Kredit
                            </span>
                            <p className="text-lg font-black font-mono text-text-primary mt-1">
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
                            <span className="text-[11px] font-bold uppercase text-text-muted">
                              Klaim TPA / Asuransi
                            </span>
                            <p className="text-lg font-black font-mono text-text-primary mt-1">
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

              // Tab 6: Smart BMHP & Inventaris
              if (activeIndex === 6) {
                return <BmhpInventoryView />;
              }

              // Tab 7: SATUSEHAT & BPJS P-Care
              if (activeIndex === 7) {
                return (
                  <div className="flex flex-col gap-8">
                    <SatuSehatView />
                    <div className="border-t border-border-subtle pt-6">
                      <BpjsPcareView />
                    </div>
                  </div>
                );
              }

              return null;
            }}
          </StandardSlidingTabs>
        </main>
      </div>
    </div>
  );
}
