'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Receipt,
  CreditCard,
  QrCode,
  Wallet,
  Building,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Percent,
  Calculator,
  ShieldCheck,
  FileText,
  Lock,
  DollarSign,
  UserCheck,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';
import { toast } from 'sonner';

type FinancialSubTab = 'BILLING_POS' | 'DOCTOR_COMMISSION' | 'UNIT_ECONOMICS' | 'SHIFT_RECON';

interface InvoiceLineItem {
  id: string;
  name: string;
  fdiTooth?: number;
  category: 'JASA_DOKTER' | 'LAB_VENDOR' | 'BMHP_KHUSUS' | 'OBAT_FARMASI' | 'SARANA_KLINIK';
  grossPrice: number;
  labDeduction: number;
  bmhpDeduction: number;
}

export const EnterpriseFinancialView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinancialSubTab>('BILLING_POS');

  // Sample Active Patient Billing Context
  const [invoiceItems, setInvoiceItems] = useState<InvoiceLineItem[]>([
    {
      id: 'item-1',
      name: 'Preparasi & Pemasangan Crown Zirconia Monolithic',
      fdiTooth: 46,
      category: 'JASA_DOKTER',
      grossPrice: 3800000,
      labDeduction: 1200000, // Biaya Dental Lab Artindo Perkasa
      bmhpDeduction: 150000,  // Bonding + Resin Semen RelyX
    },
    {
      id: 'item-2',
      name: 'Perawatan Saluran Akar (PSA) Multi-Root Kunjungan Akhir (Obturasi)',
      fdiTooth: 46,
      category: 'JASA_DOKTER',
      grossPrice: 1650000,
      labDeduction: 0,
      bmhpDeduction: 220000,  // Gutta percha, sealer AH Plus, paper point
    },
    {
      id: 'item-3',
      name: 'Resep Obat Pasca Tindakan (Clindamycin 300mg + Asam Mefenamat)',
      category: 'OBAT_FARMASI',
      grossPrice: 185000,
      labDeduction: 0,
      bmhpDeduction: 0,
    },
    {
      id: 'item-4',
      name: 'Biaya Administrasi & Paket Sterilisasi Pouch Instrumen',
      category: 'SARANA_KLINIK',
      grossPrice: 75000,
      labDeduction: 0,
      bmhpDeduction: 0,
    },
  ]);

  // Doctor Commission Parameters
  const [commissionRate, setCommissionRate] = useState<number>(45); // 45% default
  const [pphRate, setPphRate] = useState<number>(2.5); // 2.5% tarif efektif progresif

  // Multi-Tender Payment Amounts
  const totalInvoice = invoiceItems.reduce((acc, curr) => acc + curr.grossPrice, 0);
  const [insuranceCovered, setInsuranceCovered] = useState<number>(2500000); // Plafon Asuransi AdMedika
  const [depositUsed, setDepositUsed] = useState<number>(1000000); // Deposit Escrow Pasien
  const remainingCashQris = Math.max(0, totalInvoice - insuranceCovered - depositUsed);

  // Shift Reconciliation (Blind Drop) States
  const [openingFloat] = useState<number>(500000); // Kas awal Rp 500.000
  const [blindCountInput, setBlindCountInput] = useState<string>('2710000');
  const [shiftReconciled, setShiftReconciled] = useState<boolean>(false);
  const [supervisorPin, setSupervisorPin] = useState<string>('');

  // Calculations for Doctor Commission (Formula PRD Section 5.5)
  const doctorProcedures = invoiceItems.filter((i) => i.category === 'JASA_DOKTER');
  const grossDoctorProcedures = doctorProcedures.reduce((acc, i) => acc + i.grossPrice, 0);
  const totalLabDeduction = doctorProcedures.reduce((acc, i) => acc + i.labDeduction, 0);
  const totalBmhpDeduction = doctorProcedures.reduce((acc, i) => acc + i.bmhpDeduction, 0);

  // Dasar Pengenaan Jasa = Tarif - Lab - BMHP Khusus
  const netServiceBase = grossDoctorProcedures - totalLabDeduction - totalBmhpDeduction;
  const grossCommission = (netServiceBase * commissionRate) / 100;
  // PPh 21 Tenaga Ahli Bukan Pegawai (50% x Bruto x Tarif Progresif)
  const pph21Amount = (grossCommission * 0.5 * pphRate) / 100;
  const netTakeHomeDoctor = grossCommission - pph21Amount;

  // Clinic Net Margin
  const pharmacyRevenue = invoiceItems.filter((i) => i.category === 'OBAT_FARMASI').reduce((acc, i) => acc + i.grossPrice, 0);
  const facilityRevenue = invoiceItems.filter((i) => i.category === 'SARANA_KLINIK').reduce((acc, i) => acc + i.grossPrice, 0);
  const clinicRetainedFromProcedures = netServiceBase - grossCommission;
  const clinicGrossMargin = clinicRetainedFromProcedures + pharmacyRevenue + facilityRevenue;
  const clinicMarginPercent = (clinicGrossMargin / totalInvoice) * 100;

  const handleSimulatePayment = () => {
    triggerHapticFeedback('success');
    toast.success(`Pembayaran Faktur ${totalInvoice.toLocaleString('id-ID')} Berhasil Diselesaikan! Struk & E-Receipt diterbitkan.`);
  };

  const handleReconcileShift = () => {
    triggerHapticFeedback('selection');
    const entered = parseFloat(blindCountInput) || 0;
    const expected = openingFloat + remainingCashQris;
    const variance = entered - expected;

    if (variance === 0) {
      toast.success('Rekonsiliasi Sempurna! Uang fisik kasir balance 100% dengan catatan sistem.');
    } else if (variance < 0) {
      toast.error(`Shortage Kas Terdeteksi: Selisih Kurang Rp ${Math.abs(variance).toLocaleString('id-ID')}. Berita Acara Kasir diterbitkan.`);
    } else {
      toast.warning(`Overage Kas Terdeteksi: Selisih Lebih Rp ${variance.toLocaleString('id-ID')}.`);
    }
    setShiftReconciled(true);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-surface-card border border-border-subtle shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-300 dark:border-teal-700 flex items-center justify-center text-brand-primary">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-text-primary tracking-tight">
                Enterprise Financial Engine & Billing POS
              </h2>
              <Badge variant="outline" className="text-[10px] font-mono border-teal-300 text-brand-primary">
                Modul 05 & 15
              </Badge>
            </div>
            <p className="text-xs text-text-secondary">
              Multi-Bucket Split Billing, Dynamic Multi-Tender, Kalkulasi PPh 21 Dokter, dan Blind Drop Shift Control.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 text-xs py-1 px-3">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Audit-Ready General Ledger
          </Badge>
        </div>
      </div>

      {/* Sliding Sub-Tabs Bar */}
      <div className="flex items-center p-1.5 bg-surface-subtle border border-border-subtle rounded-2xl w-fit max-w-full overflow-x-auto shadow-2xs select-none">
        {[
          { id: 'BILLING_POS' as const, label: 'Kasir & Multi-Bucket Split', icon: Receipt },
          { id: 'DOCTOR_COMMISSION' as const, label: 'Honor Dokter & PPh 21', icon: Calculator },
          { id: 'UNIT_ECONOMICS' as const, label: 'Unit Economics & Margin', icon: PieChart },
          { id: 'SHIFT_RECON' as const, label: 'Rekonsiliasi Shift (Blind Drop)', icon: RotateCcw },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                triggerHapticFeedback('selection');
                setActiveTab(tab.id);
              }}
              className={`relative px-4 py-2 text-xs font-bold tracking-tight transition-colors cursor-pointer rounded-xl flex items-center gap-2 ${
                isActive ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon className="relative z-10 w-3.5 h-3.5" />
              <span className="relative z-10">{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="financialTabPill"
                  className="absolute inset-0 bg-brand-primary rounded-xl shadow-xs z-0"
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

      {/* Tab 1: Billing POS & Multi-Bucket Split */}
      {activeTab === 'BILLING_POS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          {/* Left Column: Invoice Items & Bucket Allocation (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
              <CardHeader className="border-b border-border-subtle pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-primary" />
                    <CardTitle className="text-sm font-bold text-text-primary">
                      Faktur Tagihan Pasien: Bpk. Ahmad Fauzi (RM-2026-0891)
                    </CardTitle>
                  </div>
                  <span className="text-[11px] font-mono text-text-muted">
                    No: INV/2026/09/SNP-0142
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-3">
                {invoiceItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-surface-subtle border border-border-subtle flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary">{item.name}</span>
                          {item.fdiTooth && (
                            <Badge variant="outline" className="text-[10px] font-mono border-teal-400 text-brand-primary py-0 px-1.5">
                              FDI #{item.fdiTooth}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted mt-0.5">
                          Pos GL: {item.category.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-xs text-text-primary whitespace-nowrap">
                        Rp {item.grossPrice.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Deductions breakdown if JASA_DOKTER */}
                    {item.category === 'JASA_DOKTER' && (item.labDeduction > 0 || item.bmhpDeduction > 0) && (
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border-subtle/80 text-[11px] text-text-secondary">
                        {item.labDeduction > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 font-mono">
                            Dental Lab Passthrough: -Rp {item.labDeduction.toLocaleString('id-ID')}
                          </span>
                        )}
                        {item.bmhpDeduction > 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono">
                            BMHP Khusus: -Rp {item.bmhpDeduction.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Subtotals & Grand Total */}
                <div className="pt-3 border-t border-border-subtle flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>Total Tagihan Tindakan & Resep:</span>
                    <span className="font-mono font-bold">Rp {totalInvoice.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>Tanggungan Asuransi (Pre-Auth):</span>
                    <span className="font-mono text-purple-600">-Rp {insuranceCovered.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-secondary">
                    <span>Penggunaan Saldo Deposit Escrow:</span>
                    <span className="font-mono text-teal-600">-Rp {depositUsed.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-extrabold text-brand-primary pt-2 border-t border-dashed border-border-subtle">
                    <span>Sisa Tagihan Pasien (Out-of-Pocket):</span>
                    <span className="font-mono text-base">Rp {remainingCashQris.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Multi-Tender Payment Gateway (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
              <CardHeader className="border-b border-border-subtle pb-3">
                <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-brand-primary" />
                  Multi-Tender Payment Split
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-4">
                {/* 1. Asuransi TPA Co-Pay Card */}
                <div className="p-3 rounded-2xl bg-purple-500/5 border border-purple-200 dark:border-purple-900 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-purple-600" />
                      Klaim Asuransi AdMedika
                    </span>
                    <Badge variant="outline" className="text-[10px] border-purple-300 text-purple-600">
                      Approved
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-muted">Plafon Terkunci:</span>
                    <span className="font-bold text-purple-700 dark:text-purple-300">
                      Rp {insuranceCovered.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* 2. Deposit Escrow Account */}
                <div className="p-3 rounded-2xl bg-teal-500/5 border border-teal-200 dark:border-teal-900 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-primary flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-brand-primary" />
                      Deposit Escrow Multi-Visit
                    </span>
                    <span className="text-[10px] text-text-muted">Saldo: Rp 4.500.000</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-muted">Dipotong Kunjungan Ini:</span>
                    <span className="font-bold text-brand-primary">
                      Rp {depositUsed.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* 3. Direct Out-of-Pocket Payment (QRIS / EDC) */}
                <div className="p-3.5 rounded-2xl bg-surface-subtle border border-border-subtle flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-text-primary">
                      Pembayaran Sisa Kasir:
                    </span>
                    <span className="text-sm font-mono font-black text-brand-primary">
                      Rp {remainingCashQris.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => triggerHapticFeedback('selection')}
                      className="p-3 rounded-xl border border-brand-primary/40 bg-teal-500/10 text-brand-primary flex flex-col items-center gap-1.5 text-xs font-bold"
                    >
                      <QrCode className="w-5 h-5" />
                      <span>QRIS Dinamis</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerHapticFeedback('selection')}
                      className="p-3 rounded-xl border border-border-subtle bg-surface-card hover:bg-slate-100 dark:hover:bg-slate-800 text-text-primary flex flex-col items-center gap-1.5 text-xs font-bold"
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Mesin EDC Debit</span>
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleSimulatePayment}
                  className="w-full bg-brand-primary hover:bg-brand-hover text-white rounded-xl h-10 font-bold text-xs gap-2 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Selesaikan Transaksi & Cetak Kwitansi
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Doctor Commission & PPh 21 Engine */}
      {activeTab === 'DOCTOR_COMMISSION' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          {/* Doctor Commission Summary (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
              <CardHeader className="border-b border-border-subtle pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold text-text-primary">
                      Kalkulasi Jasa Medis: drg. Sarah Sp.KG (Spesialis Konservasi Gigi)
                    </CardTitle>
                    <span className="text-[11px] text-text-muted">
                      Formula Resmi PRD 5.5: (Tarif Tindakan - Lab Passthrough - BMHP Khusus) × % Komisi
                    </span>
                  </div>
                  <Badge variant="outline" className="border-teal-400 text-brand-primary font-mono text-[10px]">
                    STR: 31.2.1.100.2.18
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-4">
                {/* Visual Formula Step Breakdown */}
                <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex flex-col gap-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">1. Bruto Tarif Tindakan Dokter:</span>
                    <span className="font-mono font-bold text-text-primary">
                      Rp {grossDoctorProcedures.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-purple-700 dark:text-purple-300">
                    <span>2. Potongan Dental Lab (Crown Zirconia):</span>
                    <span className="font-mono font-bold">
                      -Rp {totalLabDeduction.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-amber-700 dark:text-amber-300">
                    <span>3. Potongan BMHP Khusus (Semen + Obturasi):</span>
                    <span className="font-mono font-bold">
                      -Rp {totalBmhpDeduction.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-dashed border-border-subtle flex items-center justify-between font-bold text-brand-primary">
                    <span>4. Dasar Pengenaan Jasa Medis Bersih:</span>
                    <span className="font-mono text-sm">
                      Rp {netServiceBase.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Commission & Tax Sliders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl bg-surface-subtle border border-border-subtle flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-text-primary">Kontrak Komisi Dokter:</span>
                      <span className="font-mono font-bold text-brand-primary">{commissionRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="60"
                      step="5"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      className="accent-brand-primary cursor-pointer"
                    />
                    <span className="text-[10px] text-text-muted">Standar Dokter Spesialis: 40%–50%</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface-subtle border border-border-subtle flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-text-primary">Tarif Efektif PPh 21:</span>
                      <span className="font-mono font-bold text-rose-600">{pphRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="5.0"
                      step="0.5"
                      value={pphRate}
                      onChange={(e) => setPphRate(Number(e.target.value))}
                      className="accent-rose-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-text-muted">Tenaga Ahli Bukan Pegawai (PP 58/2023)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Net Take-Home Pay Slip (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Card className="rounded-3xl border-teal-300 dark:border-teal-800 bg-gradient-to-b from-teal-500/[0.04] to-surface-card shadow-xs">
              <CardHeader className="border-b border-border-subtle pb-3">
                <CardTitle className="text-sm font-bold text-brand-primary flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Slip Honor Bersih Dokter (Take-Home)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between text-text-secondary">
                  <span>Honor Komisi Bruto ({commissionRate}%):</span>
                  <span className="font-mono font-bold text-text-primary">
                    Rp {grossCommission.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-rose-600">
                  <span>Potongan Pajak PPh 21 Tenaga Ahli:</span>
                  <span className="font-mono font-bold">
                    -Rp {pph21Amount.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-teal-900 text-white flex flex-col gap-1 mt-2">
                  <span className="text-[11px] font-medium text-teal-200 uppercase tracking-wider">
                    Honor Bersih Masuk Rekening (Nett):
                  </span>
                  <span className="text-2xl font-black font-mono tracking-tight text-white">
                    Rp {netTakeHomeDoctor.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-teal-300/80 mt-1">
                    Auto-Disbursement via API Bank Mandiri Virtual Account
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    triggerHapticFeedback('light');
                    toast.info('Slip Jasa Medis PDF terunduh.');
                  }}
                  className="w-full mt-2 rounded-xl text-xs font-bold gap-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Unduh Slip Jasa Medis Dokter (PDF)
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: Unit Economics & Margin Analisis per Tindakan */}
      {activeTab === 'UNIT_ECONOMICS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase text-text-muted">Total Pendapatan Pasien</span>
              <span className="text-xl font-black font-mono text-text-primary">
                Rp {totalInvoice.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-text-muted mt-1">Gross Inflow 1 Kunjungan</span>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase text-purple-600">Total Biaya Vendor Lab</span>
              <span className="text-xl font-black font-mono text-purple-700 dark:text-purple-300">
                Rp {totalLabDeduction.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-text-muted mt-1">Direct Pass-Through Lab</span>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase text-brand-primary">Alokasi Jasa Dokter</span>
              <span className="text-xl font-black font-mono text-brand-primary">
                Rp {grossCommission.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-text-muted mt-1">Fee Dokter Bruto ({commissionRate}%)</span>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-emerald-300 dark:border-emerald-800 bg-emerald-500/[0.04] shadow-xs">
            <CardContent className="p-4 flex flex-col gap-1">
              <span className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                Gross Margin Klinik (Netto)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black font-mono text-emerald-800 dark:text-emerald-200">
                  Rp {clinicGrossMargin.toLocaleString('id-ID')}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600">
                  ({clinicMarginPercent.toFixed(1)}%)
                </span>
              </div>
              <span className="text-[10px] text-emerald-600/80 mt-1">Laba Ditahan Klinik</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 4: Shift Reconciliation (Blind Drop) */}
      {activeTab === 'SHIFT_RECON' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          <div className="lg:col-span-6 flex flex-col gap-4">
            <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
              <CardHeader className="border-b border-border-subtle pb-3">
                <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-brand-primary" />
                  Formulir Blind Drop Cash Count (Tutup Shift Kasir)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col gap-4 text-xs">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Prosedur Anti-Fraud Blind Count:
                  </div>
                  Kasir dilarang melihat angka total sistem sebelum memasukkan perhitungan fisik uang kertas dan koin di laci kas.
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-text-primary">Kas Awal Laci (Opening Float):</span>
                  <div className="p-2.5 rounded-xl bg-surface-subtle font-mono text-xs border border-border-subtle">
                    Rp {openingFloat.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-text-primary">
                    Hitungan Fisik Uang Kasir (Blind Count Fisik):
                  </span>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-text-muted font-mono font-bold">Rp</span>
                    <input
                      type="number"
                      value={blindCountInput}
                      onChange={(e) => setBlindCountInput(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-border-subtle bg-surface-subtle font-mono font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="font-bold text-text-primary">PIN Otorisasi Supervisor (2-Factor Approval):</span>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="Masukkan 6 Digit PIN Supervisor"
                      value={supervisorPin}
                      onChange={(e) => setSupervisorPin(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-border-subtle bg-surface-subtle font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleReconcileShift}
                  className="bg-brand-primary hover:bg-brand-hover text-white rounded-xl h-10 font-bold text-xs gap-2 shadow-xs cursor-pointer mt-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Verifikasi & Kunci Shift Kasir
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-4">
            {shiftReconciled && (
              <Card className="rounded-3xl border-emerald-300 dark:border-emerald-800 bg-surface-card shadow-xs animate-in zoom-in-95">
                <CardHeader className="border-b border-border-subtle pb-3">
                  <CardTitle className="text-sm font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Berita Acara Rekonsiliasi Shift Sah
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex flex-col gap-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Uang Fisik Dihitung:</span>
                    <span className="font-mono font-bold">
                      Rp {parseFloat(blindCountInput).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Ekspektasi Sistem:</span>
                    <span className="font-mono font-bold">
                      Rp {(openingFloat + remainingCashQris).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-300 text-emerald-800 dark:text-emerald-200 font-bold flex items-center justify-between">
                    <span>Status Selisih (Variance):</span>
                    <span className="font-mono text-sm">NOL (SEIMBANG / BALANCED)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-subtle text-[11px] text-text-muted">
                    <ShieldCheck className="w-4 h-4 text-brand-primary" />
                    <span>Kantong Setoran Bank #BAG-2026-0925-01 Tersegel dengan Barcode Tamper-Evident.</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
