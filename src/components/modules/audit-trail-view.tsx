'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  Lock,
  Clock,
  Terminal,
  ArrowRight,
  ShieldCheck,
  User,
  History,
  AlertCircle,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';
import { toast } from 'sonner';

type AuditAction = 'ALL' | 'READ_EMR' | 'UPDATE_ODONTOGRAM' | 'PRESCRIBE_MED' | 'VOID_INVOICE' | 'EXPORT_DATA';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  action: 'READ_EMR' | 'UPDATE_ODONTOGRAM' | 'PRESCRIBE_MED' | 'VOID_INVOICE' | 'EXPORT_DATA';
  tableName: string;
  recordIdentifier: string;
  description: string;
  sha256Hash: string;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
}

const SAMPLE_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: '25 Sep 2026, 18:22:15 WIB',
    userName: 'drg. Sarah Sp.KG',
    userRole: 'ROLE_DENTIST',
    ipAddress: '192.168.1.42 (iPad Operatori 1)',
    action: 'UPDATE_ODONTOGRAM',
    tableName: 'odontogram_snapshots',
    recordIdentifier: 'PATIENT #RM-2026-0891 (Gigi 46)',
    description: 'Mengubah status permukaan Oklusal Gigi 46 dari Karies Profunda menjadi Mahkota Tiruan (Crown Zirconia).',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    oldValues: { tooth: 46, surface_O: 'CARIES', status: 'IN_TREATMENT' },
    newValues: { tooth: 46, surface_O: 'CROWN', status: 'FITTED_COMPLETED' },
  },
  {
    id: 'log-002',
    timestamp: '25 Sep 2026, 18:15:02 WIB',
    userName: 'drg. Sarah Sp.KG',
    userRole: 'ROLE_DENTIST',
    ipAddress: '192.168.1.42 (iPad Operatori 1)',
    action: 'PRESCRIBE_MED',
    tableName: 'prescriptions',
    recordIdentifier: 'RX-2026-0891',
    description: 'Menerbitkan e-Prescription Clindamycin 300mg (KFA: 930018241) dan Asam Mefenamat 500mg.',
    sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    oldValues: null,
    newValues: { prescription_id: 'RX-2026-0891', items_count: 2, kfa_codes: ['930018241', '930010982'] },
  },
  {
    id: 'log-003',
    timestamp: '25 Sep 2026, 17:58:30 WIB',
    userName: 'Siti Rahmawati (Frontdesk)',
    userRole: 'ROLE_FRONTDESK',
    ipAddress: '192.168.1.10 (PC Kasir Utama)',
    action: 'READ_EMR',
    tableName: 'patients',
    recordIdentifier: 'PATIENT #RM-2026-0891',
    description: 'Membuka profil rekam medis pasien Bpk. Ahmad Fauzi untuk konfirmasi registrasi & klaim asuransi.',
    sha256Hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    oldValues: null,
    newValues: { access_type: 'VIEW_PATIENT_DEMOGRAPHICS', session_id: 'sess_99182' },
  },
  {
    id: 'log-004',
    timestamp: '25 Sep 2026, 16:40:11 WIB',
    userName: 'drg. Hendra Sp.BM (Supervisor)',
    userRole: 'ROLE_ADMIN',
    ipAddress: '192.168.1.101 (Laptop Direksi)',
    action: 'VOID_INVOICE',
    tableName: 'invoices',
    recordIdentifier: 'INV-2026-09-SNP-0129',
    description: 'Otorisasi 2-Factor PIN untuk pembatalan invoice kasir karena salah input metode EDC ke QRIS.',
    sha256Hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    oldValues: { invoice_id: 'INV-2026-09-SNP-0129', status: 'UNPAID', total: 1850000 },
    newValues: { invoice_id: 'INV-2026-09-SNP-0129', status: 'VOIDED', authorized_by: 'drg. Hendra' },
  },
  {
    id: 'log-005',
    timestamp: '25 Sep 2026, 14:10:44 WIB',
    userName: 'drg. Sarah Sp.KG',
    userRole: 'ROLE_DENTIST',
    ipAddress: '192.168.1.42 (iPad Operatori 1)',
    action: 'EXPORT_DATA',
    tableName: 'medical_records',
    recordIdentifier: 'DOC-CLAIM-ADMEDIKA-0891',
    description: 'Mengekspor resume medis terenkripsi dan rontgen DICOM untuk kelengkapan klaim asuransi TPA.',
    sha256Hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    oldValues: null,
    newValues: { format: 'PDF/A Encrypted', watermark: 'KLAIM ASURANSI ADMEDIKA', pages: 3 },
  },
];

export const AuditTrailView: React.FC = () => {
  const [filterAction, setFilterAction] = useState<AuditAction>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(SAMPLE_AUDIT_LOGS[0]);

  const filteredLogs = SAMPLE_AUDIT_LOGS.filter((log) => {
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    const matchesSearch =
      searchQuery === '' ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recordIdentifier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-surface-card border border-border-subtle shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-300 dark:border-teal-700 flex items-center justify-center text-brand-primary">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-text-primary tracking-tight">
                Medico-Legal Audit Trail & Forensik Akses Data
              </h2>
              <Badge variant="outline" className="text-[10px] font-mono border-teal-300 text-brand-primary">
                Modul 17 • Permenkes 24/2022
              </Badge>
            </div>
            <p className="text-xs text-text-secondary">
              Pencatatan aktivitas append-only permanen anti-tamper dengan verifikasi stempel waktu dan SHA-256 integrity hash.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 text-xs py-1 px-3">
            <Lock className="w-3.5 h-3.5 mr-1" />
            Immutable Append-Only DB Trigger
          </Badge>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-card p-3 rounded-2xl border border-border-subtle shadow-xs text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-bold text-text-muted mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-brand-primary" />
            Filter Aksi:
          </span>
          {[
            { id: 'ALL' as const, label: 'Semua Log' },
            { id: 'UPDATE_ODONTOGRAM' as const, label: 'Ubah Odontogram' },
            { id: 'PRESCRIBE_MED' as const, label: 'Resep Obat' },
            { id: 'VOID_INVOICE' as const, label: 'Batal/Refund Kasir' },
            { id: 'READ_EMR' as const, label: 'Akses Baca EMR' },
            { id: 'EXPORT_DATA' as const, label: 'Ekspor Berkas' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                triggerHapticFeedback('selection');
                setFilterAction(item.id);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                filterAction === item.id
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-64 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-text-muted" />
          <input
            type="text"
            placeholder="Cari nama staf, pasien, atau hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border-subtle bg-surface-subtle text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      {/* Main Grid: Log List (7 cols) + Diff Inspector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Log Entries List */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {filteredLogs.map((log) => {
            const isSelected = selectedLog?.id === log.id;
            return (
              <div
                key={log.id}
                onClick={() => {
                  triggerHapticFeedback('selection');
                  setSelectedLog(log);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'border-brand-primary bg-teal-500/[0.04] shadow-sm ring-1 ring-brand-primary/40'
                    : 'border-border-subtle bg-surface-card hover:bg-surface-subtle/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-text-primary">{log.userName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-subtle border border-border-subtle text-text-muted">
                      {log.userRole}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {log.timestamp}
                  </span>
                </div>

                <p className="text-xs text-text-primary font-medium leading-relaxed">
                  {log.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-subtle/80 text-[10px] font-mono text-text-muted">
                  <span className="text-brand-primary font-bold">
                    Tabel: {log.tableName} • {log.recordIdentifier}
                  </span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Diff & Hash Inspector Panel */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs sticky top-24">
            <CardHeader className="border-b border-border-subtle pb-3">
              <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Database className="w-4 h-4 text-brand-primary" />
                Inspektur Diff Mediko-Legal (JSON Before/After)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-4 text-xs">
              {selectedLog ? (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-text-primary">Stempel SHA-256 Integritas Data:</span>
                    <div className="p-2.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[10px] break-all border border-slate-800">
                      {selectedLog.sha256Hash}
                    </div>
                  </div>

                  {selectedLog.oldValues && (
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Nilai Lama Sebelum Perubahan (Old Values):
                      </span>
                      <pre className="p-3 rounded-xl bg-rose-500/5 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 font-mono text-[11px] overflow-x-auto">
                        {JSON.stringify(selectedLog.oldValues, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.newValues && (
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Nilai Baru Tersimpan (New Values):
                      </span>
                      <pre className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 font-mono text-[11px] overflow-x-auto">
                        {JSON.stringify(selectedLog.newValues, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-300 dark:border-teal-800 text-brand-primary text-[11px] font-medium flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Lolos verifikasi digital signature UU ITE & Permenkes No. 24/2022.</span>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-text-muted">
                  Pilih salah satu log di sebelah kiri untuk melihat rincian diff mediko-legal.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
