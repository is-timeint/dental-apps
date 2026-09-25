'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Boxes,
  AlertTriangle,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';
import { toast } from 'sonner';

interface BmhpItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  minThreshold: number;
  batchNo: string;
  expiryDate: string;
  isExpiringSoon: boolean;
  isLowStock: boolean;
}

const SAMPLE_BMHP: BmhpItem[] = [
  {
    id: 'bmhp-1',
    name: 'Komposit Filtek Z350 XT Universal (A2)',
    category: 'Restoratif / Konservasi',
    stock: 8,
    unit: 'Syringe 4g',
    minThreshold: 5,
    batchNo: 'B-3910A',
    expiryDate: '15 Okt 2026',
    isExpiringSoon: true,
    isLowStock: false,
  },
  {
    id: 'bmhp-2',
    name: 'Pehacain Anestesi Lokal (Lidocaine + Adrenalin)',
    category: 'Bedah Mulut & Anestesi',
    stock: 3,
    unit: 'Ampul 2ml',
    minThreshold: 10,
    batchNo: 'PEH-8821',
    expiryDate: '12 Des 2027',
    isExpiringSoon: false,
    isLowStock: true,
  },
  {
    id: 'bmhp-3',
    name: 'Etching Gel Asam Fosfat 37% (Eco-Etch)',
    category: 'Bahan Perekat & Bonding',
    stock: 14,
    unit: 'Syringe 2ml',
    minThreshold: 4,
    batchNo: 'ETCH-901',
    expiryDate: '20 Jan 2028',
    isExpiringSoon: false,
    isLowStock: false,
  },
  {
    id: 'bmhp-4',
    name: 'Sectional Matrix Band Kit (Garrison Composi-Tight)',
    category: 'Instrumen Penambalan',
    stock: 22,
    unit: 'Band',
    minThreshold: 15,
    batchNo: 'MAT-440',
    expiryDate: 'N/A',
    isExpiringSoon: false,
    isLowStock: false,
  },
];

export const BmhpInventoryView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
            <Boxes className="w-5 h-5 text-brand-primary" />
            Inventaris & Smart BMHP (Procedure-Based BOM)
          </h2>
          <p className="text-xs text-text-secondary">
            Pengurangan stok material dental otomatis saat dokter klik Selesai Tindakan di Odontogram EMR.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl text-xs font-bold gap-1.5 h-9"
            onClick={() => {
              triggerHapticFeedback('light');
              toast.info('Laporan Stock Opname Blind Count diunduh.');
            }}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Stock Opname Blind Count
          </Button>

          <Button
            size="sm"
            className="bg-brand-primary hover:bg-brand-hover text-white rounded-xl gap-1.5 text-xs font-bold shadow-xs h-9"
            onClick={() => {
              triggerHapticFeedback('light');
              toast.success('Form Purchase Order (PO) Bahan Baru dibuka.');
            }}
          >
            <PlusCircle className="w-4 h-4" />
            Order Pengadaan BMHP
          </Button>
        </div>
      </div>

      {/* Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SAMPLE_BMHP.map((item) => (
          <Card
            key={item.id}
            className={`rounded-3xl border bg-surface-card shadow-xs ${
              item.isLowStock
                ? 'border-rose-300 dark:border-rose-900 ring-1 ring-rose-400/20'
                : item.isExpiringSoon
                ? 'border-amber-300 dark:border-amber-900'
                : 'border-border-subtle'
            }`}
          >
            <CardHeader className="bg-surface-subtle/50 pb-3 border-b border-border-subtle">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-text-muted">
                  Batch: {item.batchNo}
                </span>
                {item.isLowStock && (
                  <Badge variant="destructive" className="text-[9px] px-1.5 py-0.2">
                    Stok Menipis
                  </Badge>
                )}
                {item.isExpiringSoon && (
                  <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 text-[9px] px-1.5 py-0.2">
                    ED &lt; 30 Hari
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xs font-bold text-text-primary line-clamp-2 mt-1">
                {item.name}
              </CardTitle>
              <span className="text-[10px] text-text-muted">{item.category}</span>
            </CardHeader>

            <CardContent className="p-4 flex flex-col gap-3 text-xs">
              <div className="flex items-baseline justify-between p-2.5 rounded-xl bg-surface-subtle border border-border-subtle">
                <span className="text-text-muted">Sisa Stok Fisik:</span>
                <span className="font-mono font-extrabold text-base text-text-primary">
                  {item.stock} <span className="text-xs font-normal text-text-secondary">{item.unit}</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span>Batas Minimum: {item.minThreshold} {item.unit}</span>
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-brand-primary" />
                  ED: {item.expiryDate}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
