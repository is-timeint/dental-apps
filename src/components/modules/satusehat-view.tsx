'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Network,
  CheckCircle2,
  RefreshCw,
  Building,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';
import { toast } from 'sonner';

export const SatuSehatView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-text-primary flex items-center gap-2">
            <Network className="w-5 h-5 text-brand-primary" />
            SATUSEHAT Interoperability Engine (Modul 07)
          </h2>
          <p className="text-xs text-text-secondary">
            Integrasi HL7 FHIR R4 Kemenkes RI untuk kepatuhan Permenkes No. 24 Tahun 2022 (RME Gigi).
          </p>
        </div>

        <Button
          size="sm"
          className="bg-brand-primary hover:bg-brand-hover text-white rounded-xl gap-2 text-xs font-bold shadow-xs h-9"
          onClick={() => {
            triggerHapticFeedback('success');
            toast.success('Sinkronisasi batch 14 Encounter berhasil terkirim ke Kemenkes RI.');
          }}
        >
          <RefreshCw className="w-4 h-4" />
          Sync Manual ke DTO Kemenkes
        </Button>
      </div>

      {/* Integration Status Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-text-muted">
                Status Konektivitas API
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <strong className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  ONLINE (OAuth 2.0 Valid)
                </strong>
              </div>
              <span className="text-[10px] text-text-muted">Org ID: 10002819-ID</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-text-muted">
                Encounter Terkirim Hari Ini
              </span>
              <p className="text-xl font-black font-mono text-text-primary mt-1">
                14 / 14
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">100% Sukses (HTTP 201 Created)</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center text-brand-primary">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-text-muted">
                Mapping ICD-10 & SNOMED CT
              </span>
              <p className="text-xl font-black font-mono text-brand-primary mt-1">
                24 Terminologi
              </p>
              <span className="text-[10px] text-text-muted">K02 (Karies), K04 (Pulpitis), K05 (Perio)</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-600">
              <Building className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sample Payload Inspection */}
      <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-xs overflow-hidden">
        <CardHeader className="bg-surface-subtle/50 pb-3 border-b border-border-subtle flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-brand-primary" />
            <CardTitle className="text-xs font-bold text-text-primary">
              Inspeksi Payload FHIR Bundle R4 Terakhir (Encounter + Condition Gigi 46)
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono border-teal-300 text-brand-primary">
            HTTP 201 Created
          </Badge>
        </CardHeader>
        <CardContent className="p-4">
          <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [
    {
      "resource": {
        "resourceType": "Encounter",
        "status": "finished",
        "class": { "code": "AMB", "display": "ambulatory" },
        "subject": { "reference": "Patient/100000000001", "display": "Bpk. Ahmad Fauzi" },
        "serviceProvider": { "reference": "Organization/10002819-ID" }
      }
    },
    {
      "resource": {
        "resourceType": "Condition",
        "clinicalStatus": { "coding": [{ "code": "active" }] },
        "code": {
          "coding": [
            { "system": "http://hl7.org/fhir/sid/icd-10", "code": "K02.1", "display": "Caries of dentine" },
            { "system": "http://snomed.info/sct", "code": "80967001", "display": "Dental caries (disorder)" }
          ]
        },
        "bodySite": [{ "text": "Gigi FDI 46 - Molar 1 Mandibula Kanan" }]
      }
    }
  ]
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
