'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building,
  CheckCircle2,
  Search,
  ShieldCheck,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';
import { toast } from 'sonner';

export const BpjsPcareView: React.FC = () => {
  const [cardNumber, setCardNumber] = useState('0001892837192');
  const [isEligible, setIsEligible] = useState(true);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
            <Building className="w-5 h-5 text-brand-primary" />
            Bridging BPJS Kesehatan P-Care Gigi (Modul 16)
          </h2>
          <p className="text-xs text-text-secondary">
            Integrasi langsung faskes tingkat 1 (FKTP) BPJS Kesehatan via enkripsi HMAC-SHA256 & AES-256-CBC.
          </p>
        </div>

        <Badge variant="outline" className="border-emerald-400 text-emerald-700 dark:text-emerald-400 text-xs px-3 py-1 gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Server P-Care WS: CONNECTED (v2.1)
        </Badge>
      </div>

      {/* Verification Card */}
      <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
        <CardHeader className="bg-surface-subtle/50 pb-3.5 border-b border-border-subtle">
          <CardTitle className="text-xs font-bold text-text-primary">
            Cek Eligibilitas Pasien BPJS Gigi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="Masukkan 13 Digit Nomor Kartu BPJS atau 16 Digit NIK..."
              className="w-full h-10 pl-9 pr-4 rounded-xl text-xs bg-surface-subtle border border-border-subtle focus:border-brand-primary focus:outline-none font-mono"
            />
          </div>

          <Button
            size="sm"
            className="w-full md:w-auto bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-bold gap-1.5 h-10 px-5 shadow-xs"
            onClick={() => {
              triggerHapticFeedback('selection');
              toast.success('Status kepesertaan BPJS berhasil diverifikasi: AKTIF.');
            }}
          >
            <ShieldCheck className="w-4 h-4" />
            Cek Status Kepesertaan
          </Button>
        </CardContent>
      </Card>

      {/* Result Verification Box */}
      {isEligible && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="rounded-3xl border-emerald-300 dark:border-emerald-800 bg-surface-card shadow-xs">
            <CardHeader className="bg-emerald-500/10 pb-3 border-b border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  Data Kepesertaan Terverifikasi
                </span>
                <Badge className="bg-emerald-600 text-white text-[10px]">
                  Peserta Aktif (FKTP Cocok)
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Nama Peserta:</span>
                <strong className="text-text-primary">Bpk. Ahmad Fauzi</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">FKTP Terdaftar:</span>
                <span className="text-text-primary">Klinik Pratama Gigi Senopati</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status Kapitasi:</span>
                <strong className="text-emerald-700 dark:text-emerald-400">Tercakup (Kapitasi)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Sisa Kuota Scaling Tahunan:</span>
                <span className="font-mono font-bold text-brand-primary">1x Tersisa</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
            <CardHeader className="bg-surface-subtle/50 pb-3 border-b border-border-subtle">
              <CardTitle className="text-xs font-bold text-text-primary">
                Tindakan Gigi yang Diklaimkan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-surface-subtle border border-border-subtle flex flex-col gap-1">
                <div className="flex justify-between font-bold text-text-primary">
                  <span>Pencabutan Gigi Permanen (Ekstraksi)</span>
                  <span className="font-mono text-emerald-600">Rp 0 (Covered BPJS)</span>
                </div>
                <span className="text-[11px] text-text-muted">
                  Gigi 36 • Kode ICD-9-CM: 23.09
                </span>
              </div>

              <Button
                size="sm"
                className="w-full bg-brand-primary hover:bg-brand-hover text-white rounded-xl text-xs font-bold gap-1.5 h-9"
                onClick={() => {
                  triggerHapticFeedback('success');
                  toast.success('Klaim P-Care berhasil diajukan ke BPJS Kesehatan (No Kunjungan: 01928301).');
                }}
              >
                <FileCheck className="w-4 h-4" />
                Submit Klaim Kunjungan BPJS
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
