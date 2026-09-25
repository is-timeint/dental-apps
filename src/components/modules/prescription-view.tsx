'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Pill,
  AlertTriangle,
  CheckCircle2,
  Printer,
  QrCode,
  PlusCircle,
  Clock,
  ShieldAlert,
  Sparkles,
  Info,
  Trash2,
  FileText,
} from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';
import { toast } from 'sonner';

interface PrescriptionItem {
  id: string;
  name: string;
  kfaCode: string; // 9-digit KFA Kemenkes code
  category: string;
  dosage: string;
  frequency: string;
  quantity: number;
  unit: string;
  instructions: string;
  isPenicillinDerivative: boolean;
}

const KFA_DENTAL_FORMULARY: Omit<PrescriptionItem, 'id' | 'quantity' | 'instructions'>[] = [
  {
    name: 'Clindamycin HCl 300 mg Kapsul',
    kfaCode: '930018241',
    category: 'Antibiotik Lincosamide (Aman Penisilin)',
    dosage: '300 mg',
    frequency: '3 x 1 kapsul per hari',
    unit: 'Kapsul',
    isPenicillinDerivative: false,
  },
  {
    name: 'Amoxicillin 500 mg Kaplet',
    kfaCode: '930004128',
    category: 'Antibiotik Golongan Penisilin',
    dosage: '500 mg',
    frequency: '3 x 1 kaplet per hari',
    unit: 'Kaplet',
    isPenicillinDerivative: true,
  },
  {
    name: 'Asam Mefenamat 500 mg Kaplet',
    kfaCode: '930010982',
    category: 'Analgesik & Anti-inflamasi (NSAID)',
    dosage: '500 mg',
    frequency: '3 x 1 kaplet bila nyeri (sesudah makan)',
    unit: 'Kaplet',
    isPenicillinDerivative: false,
  },
  {
    name: 'Natrium Diklofenak 50 mg Tablet Enterik',
    kfaCode: '930015520',
    category: 'Analgesik Akut Pasca Bedah',
    dosage: '50 mg',
    frequency: '2 x 1 tablet sesudah makan',
    unit: 'Tablet',
    isPenicillinDerivative: false,
  },
  {
    name: 'Chlorhexidine Gluconate 0.2% Obat Kumur',
    kfaCode: '930030114',
    category: 'Antiseptik Rongga Mulut',
    dosage: '15 mL kumur 30 detik',
    frequency: '2 x 1 sehari pagi dan malam',
    unit: 'Botol 100ml',
    isPenicillinDerivative: false,
  },
];

export const PrescriptionView: React.FC = () => {
  // Current patient has Penicillin Allergy alert in active EMR
  const hasPenicillinAllergy = true;

  const [prescribedItems, setPrescribedItems] = useState<PrescriptionItem[]>([
    {
      id: 'rx-1',
      name: 'Clindamycin HCl 300 mg Kapsul',
      kfaCode: '930018241',
      category: 'Antibiotik Lincosamide (Aman Penisilin)',
      dosage: '300 mg',
      frequency: '3 x 1 kapsul per hari',
      quantity: 15,
      unit: 'Kapsul',
      instructions: 'Dihabiskan untuk profilaksis infeksi pasca PSA & mahkota gigi.',
      isPenicillinDerivative: false,
    },
    {
      id: 'rx-2',
      name: 'Asam Mefenamat 500 mg Kaplet',
      kfaCode: '930010982',
      category: 'Analgesik & Anti-inflamasi (NSAID)',
      dosage: '500 mg',
      frequency: '3 x 1 kaplet (sesudah makan)',
      quantity: 10,
      unit: 'Kaplet',
      instructions: 'Diminum bila terasa nyeri atau berdenyut.',
      isPenicillinDerivative: false,
    },
  ]);

  const [selectedKfa, setSelectedKfa] = useState<string>(KFA_DENTAL_FORMULARY[0].kfaCode);
  const [rxQuantity, setRxQuantity] = useState<number>(10);
  const [rxInstructions, setRxInstructions] = useState<string>('Diminum teratur sesudah makan.');

  const handleAddMedication = () => {
    const med = KFA_DENTAL_FORMULARY.find((m) => m.kfaCode === selectedKfa);
    if (!med) return;

    if (hasPenicillinAllergy && med.isPenicillinDerivative) {
      triggerHapticFeedback('criticalAlert');
      toast.error('HARD-STOP ALERT: Pasien memiliki riwayat ALERGI PENISILIN! Peresepan Amoxicillin diblokir demi keselamatan jiwa pasien.', {
        duration: 5000,
      });
      return;
    }

    triggerHapticFeedback('selection');
    const newItem: PrescriptionItem = {
      id: `rx-${Date.now()}`,
      ...med,
      quantity: rxQuantity,
      instructions: rxInstructions,
    };
    setPrescribedItems([...prescribedItems, newItem]);
    toast.success(`${med.name} ditambahkan ke resep elektronik.`);
  };

  const handleRemoveMedication = (id: string) => {
    triggerHapticFeedback('light');
    setPrescribedItems(prescribedItems.filter((i) => i.id !== id));
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-surface-card border border-border-subtle shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-300 dark:border-teal-700 flex items-center justify-center text-brand-primary">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-text-primary tracking-tight">
                e-Prescription & Kamus Farmasi KFA (Modul 11)
              </h2>
              <Badge variant="outline" className="text-[10px] font-mono border-teal-300 text-brand-primary">
                Kemenkes RI FHIR R4
              </Badge>
            </div>
            <p className="text-xs text-text-secondary">
              Peresepan digital dengan 9-digit kode KFA, validasi interlock alergi otomatis, dan pencetakan etiket ber-QR Code.
            </p>
          </div>
        </div>

        {/* Patient Allergy Banner Alert */}
        {hasPenicillinAllergy && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-rose-500/10 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold animate-pulse">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Alergi Pasien Aktif: Penisilin (Amoxicillin / Ampicillin)</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Form Racik Resep Baru (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
            <CardHeader className="border-b border-border-subtle pb-3">
              <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-brand-primary" />
                Pilih Obat Formularium Dental (KFA)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-text-primary">Katalog Obat KFA:</label>
                <select
                  value={selectedKfa}
                  onChange={(e) => setSelectedKfa(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border-subtle bg-surface-subtle text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-primary"
                >
                  {KFA_DENTAL_FORMULARY.map((med) => (
                    <option key={med.kfaCode} value={med.kfaCode}>
                      {med.name} (KFA: {med.kfaCode}) {med.isPenicillinDerivative ? '⚠️ [PENISILIN]' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Warning if selected drug is penicillin */}
              {KFA_DENTAL_FORMULARY.find((m) => m.kfaCode === selectedKfa)?.isPenicillinDerivative && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-300 text-rose-700 dark:text-rose-300 text-[11px] font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>PERINGATAN: Obat ini adalah turunan penisilin. Sistem akan memblokir penambahan ke resep!</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-primary">Jumlah (Kuantitas):</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={rxQuantity}
                    onChange={(e) => setRxQuantity(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-border-subtle bg-surface-subtle font-mono text-xs font-bold text-text-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-text-primary">Kode KFA Kemenkes:</label>
                  <div className="p-2 rounded-xl bg-surface-subtle font-mono text-xs text-text-muted border border-border-subtle">
                    {selectedKfa}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-text-primary">Instruksi & Aturan Pakai Khusus:</label>
                <textarea
                  rows={2}
                  value={rxInstructions}
                  onChange={(e) => setRxInstructions(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-border-subtle bg-surface-subtle text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <Button
                onClick={handleAddMedication}
                className="w-full bg-brand-primary hover:bg-brand-hover text-white rounded-xl h-10 font-bold text-xs gap-2 shadow-xs cursor-pointer mt-1"
              >
                <PlusCircle className="w-4 h-4" />
                Tambahkan ke Lembar Resep Digital
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Lembar Resep Aktif & Etiket Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
            <CardHeader className="border-b border-border-subtle pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-primary" />
                    Lembar Resep Digital #RX-2026-0891
                  </CardTitle>
                  <span className="text-[11px] text-text-muted">
                    DPJP: drg. Sarah Sp.KG • SIP: 446.1/092/SIP-D/2024
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    triggerHapticFeedback('light');
                    toast.success('Etiket QR Code berhasil dikirim ke printer thermal farmasi.');
                  }}
                  className="rounded-xl text-xs font-bold gap-1.5 h-8 border-border-subtle"
                >
                  <Printer className="w-3.5 h-3.5 text-brand-primary" />
                  Cetak Etiket QR
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-3">
              {prescribedItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-surface-subtle border border-border-subtle flex flex-col gap-2 relative group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-teal-500/10 text-brand-primary flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary">{item.name}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-teal-500/10 text-brand-primary font-mono text-[10px]">
                            KFA: {item.kfaCode}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-teal-700 dark:text-teal-300 mt-0.5">
                          {item.frequency} • Jumlah: {item.quantity} {item.unit}
                        </p>
                        <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                          Catatan: {item.instructions}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(item.id)}
                      className="text-text-muted hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Obat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Etiket Preview Badge */}
                  <div className="flex items-center justify-between pt-2 border-t border-border-subtle/80 text-[10px] text-text-muted font-mono">
                    <span className="flex items-center gap-1">
                      <QrCode className="w-3 h-3 text-text-muted" />
                      QR Validasi FHIR MedicationRequest
                    </span>
                    <span className="text-emerald-600 font-bold">STATUS: TERVERIFIKASI FARMASI</span>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-3 border-t border-border-subtle text-xs">
                <span className="text-text-muted">Total Item Obat: {prescribedItems.length} Resep</span>
                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 py-1 px-3 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  SATUSEHAT Ready (KFA Mapping 100%)
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
