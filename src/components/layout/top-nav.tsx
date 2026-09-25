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
  Activity,
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
    <header className="sticky top-0 z-40 w-full bg-surface-card/95 backdrop-blur-md border-b border-border-subtle shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Branch Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-primary to-teal-800 flex items-center justify-center text-white shadow-sm ring-2 ring-brand-primary/20">
              <Activity className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-text-primary flex items-center gap-1.5">
                Dental-Apps
                <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-md bg-teal-500/10 text-brand-primary border border-teal-300 dark:border-teal-800">
                  PMS 2.0
                </span>
              </span>
              <p className="text-[11px] text-text-muted leading-none mt-0.5">
                Practice Management & EDR
              </p>
            </div>
          </div>

          <div className="hidden md:flex h-6 w-px bg-border-subtle mx-1" />

          {/* Branch Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden sm:flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary px-3 h-9 rounded-xl border border-border-subtle/60 cursor-pointer bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
              <Building2 className="w-3.5 h-3.5 text-brand-primary" />
              <span>{activeBranch.name}</span>
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
                  className={`flex items-center justify-between text-xs py-2 rounded-xl cursor-pointer ${
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

        {/* Center: Live Clock & Clinical Security Tag */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-subtle text-xs font-mono font-medium text-text-secondary border border-border-subtle">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{currentTime || '15:00:00'} WIB</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <ShieldCheck className="w-4 h-4 text-brand-primary" />
            <span className="text-[11px] font-medium">Permenkes 24/2022 & SATUSEHAT Ready</span>
          </div>
        </div>

        {/* Right: Operatory Dim Toggle & Staff Profile */}
        <div className="flex items-center gap-2.5">
          {/* Operatory Dim Mode Switch */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleDim}
            className={`h-9 px-3 gap-2 rounded-xl text-xs font-semibold border transition-all ${
              isOperatoryDim
                ? 'bg-slate-900 text-teal-300 border-teal-500/40 shadow-xs'
                : 'hover:bg-slate-100 text-text-secondary border-border-subtle'
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

          {/* Active Doctor Chip */}
          <div className="flex items-center gap-2 pl-2 border-l border-border-subtle">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-300 dark:border-teal-700 flex items-center justify-center text-brand-primary">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-text-primary leading-tight">
                drg. Sarah Sp.KG
              </span>
              <span className="text-[10px] text-text-muted">
                Dokter Gigi Spesialis Konservasi
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
