'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Smile,
  HeartPulse,
  Pill,
  ShieldAlert,
  Crown,
  Boxes,
  Truck,
  Image as ImageIcon,
  Receipt,
  RotateCcw,
  Building,
  Tv,
  MessageSquare,
  Network,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  History,
} from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';

export type ModuleId =
  | 'live-floor'
  | 'odontogram'
  | 'periodontal'
  | 'prescription'
  | 'safety-triage'
  | 'dental-lab'
  | 'bmhp-inventory'
  | 'logistics'
  | 'xray-agent'
  | 'billing-pos'
  | 'cashier-reconciliation'
  | 'insurance-tpa'
  | 'queue-tv'
  | 'whatsapp-crm'
  | 'satusehat'
  | 'bpjs-pcare'
  | 'audit-trail';

interface ModuleItem {
  id: ModuleId;
  code: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
}

interface ModuleCategory {
  categoryName: string;
  modules: ModuleItem[];
}

const MODULE_CATEGORIES: ModuleCategory[] = [
  {
    categoryName: 'Operatori & Klinis',
    modules: [
      { id: 'odontogram', code: 'M-02', name: 'Odontogram 2.0 (EMR)', icon: Smile, badge: 'Aktif' },
      { id: 'live-floor', code: 'M-01', name: 'Live Floor & Dental Chair', icon: Activity, badge: 3 },
      { id: 'periodontal', code: 'M-12', name: 'Periodontal Charting', icon: HeartPulse },
      { id: 'prescription', code: 'M-11', name: 'e-Prescription (KFA)', icon: Pill },
      { id: 'safety-triage', code: 'M-14', name: 'Safety & Triage Interlock', icon: ShieldAlert, badge: 'Alert', badgeColor: 'bg-rose-500 text-white' },
    ],
  },
  {
    categoryName: 'Dental Lab & Logistik',
    modules: [
      { id: 'dental-lab', code: 'M-03', name: 'Dental Lab Hub & SPK', icon: Crown, badge: 2 },
      { id: 'bmhp-inventory', code: 'M-04', name: 'Smart BMHP & Inventaris', icon: Boxes },
      { id: 'logistics', code: 'M-09', name: 'Logistik Multi-Cabang', icon: Truck },
      { id: 'xray-agent', code: 'M-06', name: 'X-Ray Edge DICOM Ingestion', icon: ImageIcon },
    ],
  },
  {
    categoryName: 'Finansial & Kasir',
    modules: [
      { id: 'billing-pos', code: 'M-05', name: 'Billing POS & Split-Bill', icon: Receipt },
      { id: 'cashier-reconciliation', code: 'M-15', name: 'Rekonsiliasi Kasir & Shift', icon: RotateCcw },
      { id: 'insurance-tpa', code: 'M-10', name: 'Klaim Asuransi & TPA', icon: CreditCard },
    ],
  },
  {
    categoryName: 'Pasien & Integrasi',
    modules: [
      { id: 'queue-tv', code: 'M-13', name: 'Antrean TV & Audio Calling', icon: Tv, badge: 3 },
      { id: 'whatsapp-crm', code: 'M-08', name: 'WhatsApp CRM & Recall', icon: MessageSquare },
      { id: 'satusehat', code: 'M-07', name: 'SATUSEHAT FHIR R4 Engine', icon: Network, badge: 'Sync', badgeColor: 'bg-emerald-500 text-white' },
      { id: 'bpjs-pcare', code: 'M-16', name: 'BPJS P-Care Gigi Bridging', icon: Building },
      { id: 'audit-trail', code: 'M-17', name: 'Audit Trail & Forensik EMR', icon: History, badge: 'PDP', badgeColor: 'bg-teal-600 text-white' },
    ],
  },
];

interface ClinicalSidebarProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
}

export const ClinicalSidebar: React.FC<ClinicalSidebarProps> = ({
  activeModule,
  onSelectModule,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleModuleClick = (id: ModuleId) => {
    triggerHapticFeedback('selection');
    onSelectModule(id);
  };

  return (
    <aside
      className={`relative flex flex-col border-r border-border-subtle bg-surface-card transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-18' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-border-subtle shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-brand-primary to-teal-800 flex items-center justify-center text-white shadow-sm shrink-0">
              <Activity className="w-5 h-5 text-teal-200" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-text-primary truncate">
                  Dental-Apps
                </span>
                <span className="text-[9px] font-mono font-bold uppercase px-1 py-0.2 rounded bg-teal-500/10 text-brand-primary border border-teal-300/40">
                  PMS
                </span>
              </div>
              <span className="text-[10px] text-text-muted leading-none">
                Clinical Workspace
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="w-9 h-9 mx-auto rounded-2xl bg-gradient-to-br from-brand-primary to-teal-800 flex items-center justify-center text-white shadow-sm">
            <Activity className="w-5 h-5 text-teal-200" />
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            triggerHapticFeedback('light');
            setCollapsed(!collapsed);
          }}
          className={`w-7 h-7 rounded-lg border border-border-subtle bg-surface-subtle hover:bg-slate-200 dark:hover:bg-slate-800 text-text-secondary flex items-center justify-center transition-all ${
            collapsed ? 'mx-auto mt-2' : ''
          }`}
          title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Modules List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-5 scrollbar-thin">
        {MODULE_CATEGORIES.map((cat, catIdx) => (
          <div key={catIdx} className="flex flex-col gap-1">
            {!collapsed && (
              <span className="px-3 text-[10px] font-mono font-black uppercase tracking-wider text-text-muted">
                {cat.categoryName}
              </span>
            )}

            <div className="flex flex-col gap-0.5">
              {cat.modules.map((mod) => {
                const isActive = activeModule === mod.id;
                const Icon = mod.icon;

                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => handleModuleClick(mod.id)}
                    title={collapsed ? `${mod.code}: ${mod.name}` : undefined}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors group cursor-pointer select-none ${
                      isActive
                        ? 'text-white'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-subtle'
                    }`}
                  >
                    <Icon
                      className={`relative z-10 w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-text-muted group-hover:text-brand-primary'
                      }`}
                    />

                    {!collapsed && (
                      <div className="relative z-10 flex items-center justify-between w-full min-w-0">
                        <span className="truncate">{mod.name}</span>
                        {mod.badge !== undefined && (
                          <span
                            className={`ml-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                              mod.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-surface-subtle text-text-secondary')
                            }`}
                          >
                            {mod.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {isActive && (
                      <motion.div
                        layoutId="activeSidebarIndicator"
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
          </div>
        ))}
      </div>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-3 border-t border-border-subtle bg-surface-subtle/40 flex items-center justify-between text-[11px] text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Klinik Terkoneksi</span>
          </div>
          <span className="font-mono">v2.0.0</span>
        </div>
      )}
    </aside>
  );
};
