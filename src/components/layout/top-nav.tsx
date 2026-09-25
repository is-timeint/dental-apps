'use client';

import React, { useState, useEffect } from 'react';
import { useDentalStore } from '@/store/useDentalStore';
import {
  Moon,
  Sun,
  Building2,
  ChevronDown,
  ShieldCheck,
  Bell,
  Stethoscope,
  Search,
  AlertTriangle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { triggerHapticFeedback } from '@/lib/haptic';

export const TopNav: React.FC = () => {
  const {
    isOperatoryDim,
    setOperatoryDim,
    activeBranch,
    branches,
    setActiveBranch,
  } = useDentalStore();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleDim = () => {
    triggerHapticFeedback('selection');
    setOperatoryDim(!isOperatoryDim);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-surface-card border-b border-border-subtle shadow-2xs">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Branch Switcher */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 text-xs font-bold text-text-primary px-3 py-1.5 rounded-xl border border-border-subtle bg-surface-subtle/60 hover:bg-surface-subtle cursor-pointer transition-colors shadow-2xs">
              <Building2 className="w-4 h-4 text-brand-primary" />
              <span>{activeBranch.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-primary/10 text-brand-primary">
                {activeBranch.code}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64 rounded-2xl p-1.5 shadow-lg">
              {branches.map((b) => (
                <DropdownMenuItem
                  key={b.id}
                  onClick={() => {
                    triggerHapticFeedback('selection');
                    setActiveBranch(b);
                  }}
                  className={`flex items-center justify-between text-xs py-2 px-3 rounded-xl cursor-pointer ${
                    b.id === activeBranch.id ? 'bg-teal-500/10 text-brand-primary font-bold' : ''
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{b.name}</span>
                    <span className="text-[10px] text-text-muted">{b.city}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-subtle">
                    {b.code}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center: Search Patient Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Cari Cepat: Nama Pasien, No. Rekam Medis (RM), atau NIK..."
              className="w-full h-9 pl-9 pr-4 rounded-xl text-xs bg-surface-subtle border border-border-subtle focus:border-brand-primary focus:bg-surface-card focus:outline-none transition-all placeholder:text-text-muted"
            />
          </div>
        </div>

        {/* Right: Live Status, Dim Mode & Staff Profile */}
        <div className="flex items-center gap-3">
          {/* Live Clock & Compliance */}
          <div className="hidden xl:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-subtle text-xs font-mono font-bold text-text-secondary border border-border-subtle">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{currentTime || '16:00:00'} WIB</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-text-secondary px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-300 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                SATUSEHAT RME Ready
              </span>
            </div>
          </div>

          {/* Operatory Dim Mode Switch */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleDim}
            className={`h-9 px-3 gap-2 rounded-xl text-xs font-bold border transition-all ${
              isOperatoryDim
                ? 'bg-slate-900 text-teal-300 border-teal-500/40 shadow-xs'
                : 'hover:bg-slate-100 text-text-secondary border-border-subtle bg-surface-card'
            }`}
            title="Ganti Mode Ruang Tindakan (Operatory Dim Mode)"
          >
            {isOperatoryDim ? (
              <>
                <Moon className="w-4 h-4 text-teal-400" />
                <span className="hidden sm:inline">Operatory Dim</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            )}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-text-secondary hover:text-text-primary relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
          </Button>

          {/* Active Doctor Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-border-subtle">
            <div className="w-9 h-9 rounded-2xl bg-teal-500/10 border border-teal-300 dark:border-teal-700 flex items-center justify-center text-brand-primary shrink-0">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-black text-text-primary leading-tight">
                drg. Sarah Sp.KG
              </span>
              <span className="text-[10px] text-text-muted font-medium">
                Spesialis Konservasi Gigi
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
