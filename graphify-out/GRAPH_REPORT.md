# Graph Report - Dental-Apps  (2026-09-25)

## Corpus Check
- 68 files · ~32,350 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 505 nodes · 671 edges · 49 communities (42 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8c16e921`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UI/UX, Motion Physics & Micro-Interaction Standards
- Product Requirement Document (PRD)
- 5. Spesifikasi Kebutuhan Fungsional (FRD)
- Dental-Apps — Skill Orchestration & Unified Synergy Framework
- Color Palette & Semantic Tokens
- Dental-Apps — Project Development Guidelines & Security Standards
- 1. Security-First Architecture & Medico-Legal Compliance (CRITICAL)
- 5. Standar Modal, Dialog, dan Bottom Sheet
- 1. Executive Summary & Problem Statements
- rules/graphify.md
- workflows/graphify.md
- CLAUDE.md
- dependencies
- components.json
- useDentalStore.ts
- drawer.tsx
- dropdown-menu.tsx
- Modul 01: Live Floor & Chair Operations
- Modul 02: Clinical Workspace & Odontogram 2.0 (Core EMR)
- tabs.tsx
- Modul 03: Dental Lab Hub & Schedule Interlock
- Modul 04: Inventaris & Smart BMHP (Procedure-Based BOM)
- Modul 12: Periodontal Charting & OHI-S (Pemeriksaan Gusi)
- layout.tsx
- Modul 05: Billing, POS & Commission Engine
- Modul 06: Local Edge Agent (Auto X-Ray Ingestion)
- Modul 07: SATUSEHAT Interoperability Engine
- Modul 11: e-Prescription & Kamus Farmasi (KFA Kemenkes)
- Modul 13: Physical Queue TV Display & Audio Calling System
- Modul 14: Clinical Safety Interlock & Triage Medis (Vital Signs)
- Modul 15: Rekonsiliasi Kasir, Shift Management & Refund Workflow
- Modul 16: Bridging BPJS Kesehatan P-Care Gigi (Add-On Extension)
- Indeks Dokumentasi Modular Dental-Apps (PMS/EDR)
- README.md
- AGENTS.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- 20260925_init_dental_schema.sql
- Rule: Prevent Generic AI Look & Enforce Humanized Design

## God Nodes (most connected - your core abstractions)
1. `triggerHapticFeedback()` - 27 edges
2. `5. Spesifikasi Kebutuhan Fungsional (FRD)` - 17 edges
3. `compilerOptions` - 16 edges
4. `Button()` - 12 edges
5. `Badge()` - 11 edges
6. `useDentalStore` - 11 edges
7. `clinics` - 11 edges
8. `Product Requirement Document (PRD)` - 11 edges
9. `Dental-Apps — Project Development Guidelines & Security Standards` - 10 edges
10. `1. Security-First Architecture & Medico-Legal Compliance (CRITICAL)` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Drawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `useDrawer()` --references--> `react`  [EXTRACTED]
  src/components/ui/drawer.tsx → package.json
- `ToolItem` --references--> `ToothCondition`  [EXTRACTED]
  src/components/clinical/odontogram-grid.tsx → src/types/dental.ts
- `QueueCardProps` --references--> `QueueItem`  [EXTRACTED]
  src/components/clinical/queue-card.tsx → src/types/dental.ts
- `Home()` --calls--> `triggerHapticFeedback()`  [EXTRACTED]
  src/app/page.tsx → src/lib/haptic.ts

## Import Cycles
- None detected.

## Communities (49 total, 7 thin omitted)

### Community 0 - "UI/UX, Motion Physics & Micro-Interaction Standards"
Cohesion: 0.08
Nodes (25): 1.1 Token Fisika Gerak (Motion Constants), 1.2 Velocity-Aware Inertial Tracking (Responsivitas Kecepatan Geser), 1. Prinsip Interaksi & Standar Motion Fisika, 2.1 Spesifikasi Gerak Tab, 2.2 Template Komponen Tab Standar (React + Framer Motion), 2. Standar Transisi Tab: Direction-Aware Sliding & Staggered Reveal, 3.1 Spesifikasi Kompresi Mikro Pegas (Tactile Scale Dip), 3.2 Efek Serapan Tinta Klinis (Liquid Ink Fill Effect) (+17 more)

### Community 1 - "Product Requirement Document (PRD)"
Cohesion: 0.05
Nodes (42): 1.1 Latar Belakang, 1.2 Masalah Utama Industri, 1.3 Tujuan Produk (Objectives), 1. Executive Summary & Problem Statements, 2.1 Multi-Tenancy & Tenant Scoping Mutlak, 2.2 Role-Based Access Control (RBAC) Klinis, 2. User Persona, Access Control (RBAC) & Multi-Tenancy, 3.1 Frontend & Touch Engine (+34 more)

### Community 2 - "5. Spesifikasi Kebutuhan Fungsional (FRD)"
Cohesion: 0.20
Nodes (9): 1. Damped Spring Physics (No Linear Animations), 2.1 Odontogram 2.0 (Vector 5-Surface Tooth), 2.2 Direction-Aware Sliding Tabs, 2.3 Velocity-Aware Swipeable Queue Cards, 2.4 Rolling Number Ticker, 2.5 Live Floor Breathing Pulse, 2. Standar Micro-Interaction per Komponen Utama, 3. Touch Engine Lockdown (Kenyamanan Touchscreen Tablet) (+1 more)

### Community 3 - "Dental-Apps — Skill Orchestration & Unified Synergy Framework"
Cohesion: 0.14
Nodes (13): 1. Inventori & Tanggung Jawab Ekosistem Skill Terpasang, 2. Resolusi Sinergi Antar-Skill (Bukan Konflik, Saling Melengkapi), 3. Lima Aturan Supremasi Mutlak (Hierarchy of Authority), 4.1 UI/UX & Desain Klinis (`color-palette.md` & `design-standards.md`), 4.2 Kualitas & Integritas Data (`security_and_quality.md`), 4. Standar Spesifik Domain Dental-Apps (PMS Integration), 5. Matriks Alur Kerja per Jenis Tugas (Workflows), 6. Protokol Eksekusi & Commit Perubahan (+5 more)

### Community 4 - "Color Palette & Semantic Tokens"
Cohesion: 0.18
Nodes (10): 1. Aturan Distribusi Kroma & Fokus Visual (Rasio 60-30-10), 2.1 Mode Terang (Light Mode - Meja Kasir, Administrasi & Konsultasi), 2.2 Warna Brand, Fokus & Interaksi, 2.3 Operatory Dim Mode (Mode Khusus Ruang Tindakan Dokter Gigi), 2. Token Warna Antarmuka (UI System Tokens), 3. Karantina Warna Medis (Clinical Chromatic Quarantine), 4. Status Operasional & Sistem Notifikasi, 5. File Konfigurasi Siap Pakai: `tailwind.config.ts` (+2 more)

### Community 5 - "Dental-Apps — Project Development Guidelines & Security Standards"
Cohesion: 0.10
Nodes (19): 1.1 OWASP API Security Top 10 + Standar Klinis, 1.2 Multi-Tenancy & Clinical Data Isolation, 1.3 Keamanan Berkas Medis (Rontgen, Foto Intraoral, DICOM), 1.4 Perlindungan PHI / PII & Kebijakan Zero-Logging, 1.5 Next.js App Router & Server Actions Hardening, 1.6 Rate Limiting, Brute Force & Anti-Scraping, 1.7 Concurrency Control & Database Locking (Race Condition Prevention), 1.8 Immutable Medico-Legal Audit Trail (+11 more)

### Community 6 - "1. Security-First Architecture & Medico-Legal Compliance (CRITICAL)"
Cohesion: 0.11
Nodes (40): CLINICAL_TABS, Home(), ChairStatusGrid(), CLINICAL_TOOLS, FDI_ANATOMICAL_LABELS, OdontogramGrid(), OdontogramTooth(), PeriodontalPreview() (+32 more)

### Community 7 - "5. Standar Modal, Dialog, dan Bottom Sheet"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 8 - "1. Executive Summary & Problem Statements"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+17 more)

### Community 12 - "dependencies"
Cohesion: 0.07
Nodes (29): @base-ui/react, class-variance-authority, cn, framer-motion, lucide-react, next, dependencies, @base-ui/react (+21 more)

### Community 13 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 14 - "useDentalStore.ts"
Cohesion: 0.12
Nodes (25): ToolItem, CONDITION_FILLS, FDI_ANATOMICAL_NAMES, OdontogramToothProps, QueueCardProps, DAMPED_SPRINGS, MOTION_CONSTANTS, tabSlideVariants (+17 more)

### Community 15 - "drawer.tsx"
Cohesion: 0.13
Nodes (7): react, react, Drawer(), DrawerContent(), DrawerContext, DrawerContextProps, useDrawer()

### Community 16 - "dropdown-menu.tsx"
Cohesion: 0.15
Nodes (4): DropdownMenu(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuTrigger()

### Community 20 - "Modul 01: Live Floor & Chair Operations"
Cohesion: 0.33
Nodes (5): 1. Ringkasan Klinis & Operasional, 2. State Machine Dental Chair, 3. UI/UX Interaction Standards, 4. Keamanan & Multi-Tenancy, Modul 01: Live Floor & Chair Operations

### Community 21 - "Modul 02: Clinical Workspace & Odontogram 2.0 (Core EMR)"
Cohesion: 0.33
Nodes (5): 1. Ringkasan Klinis & Regulasi, 2. Anatomi 5-Permukaan Vektor Gigi (Vector Tooth Model), 3. Micro-Interaction: Ink Absorption Effect, 4. Keamanan Medis & Audit Immutability, Modul 02: Clinical Workspace & Odontogram 2.0 (Core EMR)

### Community 23 - "Modul 03: Dental Lab Hub & Schedule Interlock"
Cohesion: 0.40
Nodes (4): 1. Ringkasan Klinis & Operasional, 2. Status Lifecycle Order Lab (SPK Digital), 3. Aturan Schedule Interlock (Anti-Insiden), Modul 03: Dental Lab Hub & Schedule Interlock

### Community 24 - "Modul 04: Inventaris & Smart BMHP (Procedure-Based BOM)"
Cohesion: 0.40
Nodes (4): 1. Ringkasan Klinis & Logistik, 2. Contoh Pemetaan Bill of Materials (BOM) Tindakan Gigi, 3. Fitur Kritis & Audit FEFO (First-Expired, First-Out), Modul 04: Inventaris & Smart BMHP (Procedure-Based BOM)

### Community 25 - "Modul 12: Periodontal Charting & OHI-S (Pemeriksaan Gusi)"
Cohesion: 0.40
Nodes (4): 1. Ringkasan Klinis Periodonsia, 2. Metodologi 6-Point Probing Per Gigi, 3. Ambang Batas Klinis & Visual Alert, Modul 12: Periodontal Charting & OHI-S (Pemeriksaan Gusi)

### Community 26 - "layout.tsx"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 27 - "Modul 05: Billing, POS & Commission Engine"
Cohesion: 0.50
Nodes (3): 1. Ringkasan Finansial & Kasir, 2. Fitur Kunci Billing Dental, Modul 05: Billing, POS & Commission Engine

### Community 28 - "Modul 06: Local Edge Agent (Auto X-Ray Ingestion)"
Cohesion: 0.50
Nodes (3): 1. Ringkasan Teknis Radiologi Gigi, 2. Alur Kerja Watcher Folder, Modul 06: Local Edge Agent (Auto X-Ray Ingestion)

### Community 29 - "Modul 07: SATUSEHAT Interoperability Engine"
Cohesion: 0.50
Nodes (3): 1. Regulasi & Kepatuhan Kemenkes RI, 2. Resource FHIR Gigi yang Dikelola, Modul 07: SATUSEHAT Interoperability Engine

### Community 30 - "Modul 11: e-Prescription & Kamus Farmasi (KFA Kemenkes)"
Cohesion: 0.50
Nodes (3): 1. Ringkasan Klinis & Farmasi, 2. Fitur Kritis & Safety Checks, Modul 11: e-Prescription & Kamus Farmasi (KFA Kemenkes)

### Community 31 - "Modul 13: Physical Queue TV Display & Audio Calling System"
Cohesion: 0.50
Nodes (3): 1. Ringkasan Ruang Tunggu, 2. Fitur Kunci, Modul 13: Physical Queue TV Display & Audio Calling System

### Community 32 - "Modul 14: Clinical Safety Interlock & Triage Medis (Vital Signs)"
Cohesion: 0.50
Nodes (3): 1. Ringkasan Keselamatan Pasien (Patient Safety), 2. Aturan Hard-Stop Klinis (Clinical Interlocks), Modul 14: Clinical Safety Interlock & Triage Medis (Vital Signs)

### Community 33 - "Modul 15: Rekonsiliasi Kasir, Shift Management & Refund Workflow"
Cohesion: 0.50
Nodes (3): 1. Ringkasan Kasir & Pengendalian Kas, 2. Mekanisme Blind Drop Reconciliation, Modul 15: Rekonsiliasi Kasir, Shift Management & Refund Workflow

### Community 34 - "Modul 16: Bridging BPJS Kesehatan P-Care Gigi (Add-On Extension)"
Cohesion: 0.50
Nodes (3): 1. Ringkasan Integrasi BPJS FKTP, 2. Kriptografi & Protokol Autentikasi BPJS, Modul 16: Bridging BPJS Kesehatan P-Care Gigi (Add-On Extension)

### Community 35 - "Indeks Dokumentasi Modular Dental-Apps (PMS/EDR)"
Cohesion: 0.50
Nodes (3): Indeks Dokumentasi Modular Dental-Apps (PMS/EDR), Matriks Modul & Relasi Sistem, Standar Keamanan & Kepatuhan Antar Modul

### Community 36 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 37 - "AGENTS.md"
Cohesion: 0.29
Nodes (6): 1. Prevent Generic AI Look & Enforce Humanized Design (MANDATORY), 2. Micro-Interactions, Motion Physics & Tactile Standards (MANDATORY), 3. Medical-Grade Security & Multi-Tenancy (MANDATORY), 4. Graphify Knowledge Graph Rule, DENTAL-APPS PMS/EDR PROJECT RULES, This is NOT the Next.js you know

### Community 44 - "20260925_init_dental_schema.sql"
Cohesion: 0.61
Nodes (11): audit_logs, branches, clinics, dental_chairs, dental_lab_orders, encounters, invoices, odontogram_surfaces (+3 more)

### Community 49 - "Rule: Prevent Generic AI Look & Enforce Humanized Design"
Cohesion: 0.33
Nodes (5): 1. Prinsip Canvas & Tata Letak Ruang Nyata, 2. Tipografi & Konten Medis Manusiawi, 3. Disiplin Warna & Karantina Medis, 4. Kehangatan Humanis & Ergonomi Pengguna, Rule: Prevent Generic AI Look & Enforce Humanized Design

## Knowledge Gaps
- **251 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+246 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `1. Executive Summary & Problem Statements`, `drawer.tsx`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `react` connect `drawer.tsx` to `dependencies`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _251 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI/UX, Motion Physics & Micro-Interaction Standards` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._
- **Should `Product Requirement Document (PRD)` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `Dental-Apps — Skill Orchestration & Unified Synergy Framework` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Dental-Apps — Project Development Guidelines & Security Standards` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._