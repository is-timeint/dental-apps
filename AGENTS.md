<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# DENTAL-APPS PMS/EDR PROJECT RULES

### 1. Prevent Generic AI Look & Enforce Humanized Design (MANDATORY)
- Follow `.agents/rules/prevent-generic-ai-look.md`.
- No narrow centered `max-w-7xl` boxes that waste 40% of the canvas. Use full-width (`w-full`), edge-to-edge workspaces with dynamic split-panes.
- No dummy/robot text or broken typography formatting (e.g. `Rp28.450.000` must be clean without spaces).
- Strictly adhere to the 60-30-10 palette in `color-palette.md` (Soft Bone `#F8F9FA`, Pure Bento `#FFFFFF`, Deep Forest Teal `#0F766E`, Mint `#14B8A6`).
- Medical chromatic quarantine: Red (`#EF4444`) and Amber (`#D97706`) are strictly for dental pathology and clinical alerts only.
- Full 16-module PRD menu alignment via `ClinicalSidebar`.

### 2. Micro-Interactions, Motion Physics & Tactile Standards (MANDATORY)
- Follow `.agents/rules/micro-interactions.md` and `design-standards.md`.
- No linear animations. Use `DAMPED_SPRINGS` (`gentle`, `snappy`, `tactile`, `bouncy`).
- Odontogram: Scale-dip (`scale(0.94)`), 300ms ink-absorption ripple effect, and tactile haptic feedback (`triggerHapticFeedback('light')`).
- Sliding Tabs: Direction-aware entrance/exit with magnetic pill indicator (`layoutId="activeTabPill"`).
- Queue Cards: Velocity-aware inertial dragging with rotation and rubber-band elastic resistance.
- Rolling Ticker: Vertical digit rolling for currency and completed procedures with zero-jitter digit alignment.
- Live Floor: Breathing pulse border on active operatory chairs (`IN_TREATMENT`).
- Touch Lockdown: `overscroll-behavior-y: none`, `user-select: none`, `touch-action: manipulation`.

### 3. Medical-Grade Security & Multi-Tenancy (MANDATORY)
- Multi-tenancy isolation: Every Supabase query and Server Action must filter by `clinic_id`.
- Zero-PHI logging: Never log patient names, NIK, or medical records to console or server logs.
- Pre-Signed URLs: Dental X-rays (DICOM/JPEG) must use signed URLs with TTL &le; 15 minutes.
- Immutable audit log: Every change to dental records must record an append-only audit trail.

### 4. Graphify Knowledge Graph Rule
- After modifying code files in this session, run `graphify update .` to keep the knowledge graph current.
