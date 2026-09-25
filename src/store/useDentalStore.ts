import { create } from 'zustand';
import {
  ClinicBranch,
  DentalChair,
  QueueItem,
  ToothCondition,
  ToothData,
  ToothSurface,
  PeriodontalPoint,
} from '@/types/dental';

interface DentalStoreState {
  // Theme & Branch
  isOperatoryDim: boolean;
  setOperatoryDim: (dim: boolean) => void;
  activeBranch: ClinicBranch;
  branches: ClinicBranch[];
  setActiveBranch: (branch: ClinicBranch) => void;

  // Live Floor Chairs
  chairs: DentalChair[];
  updateChairStatus: (chairId: string, status: DentalChair['status']) => void;

  // Odontogram State
  activeConditionTool: ToothCondition;
  setActiveConditionTool: (condition: ToothCondition) => void;
  selectedToothFdi: number | null;
  setSelectedToothFdi: (fdi: number | null) => void;
  odontogram: Record<number, ToothData>;
  paintSurface: (fdiNumber: number, surface: ToothSurface, condition: ToothCondition) => void;
  setToothGeneralCondition: (fdiNumber: number, condition: ToothCondition) => void;
  resetTooth: (fdiNumber: number) => void;

  // Queue State
  queue: QueueItem[];
  advanceQueueStatus: (id: string, newStatus: QueueItem['status']) => void;
  removeQueueItem: (id: string) => void;

  // Periodontal State
  periodontalData: Record<number, PeriodontalPoint>;
  updatePeriodontalPoint: (fdiNumber: number, point: Partial<PeriodontalPoint>) => void;

  // Metrics
  dailyRevenue: number;
  completedProceduresCount: number;
}

const INITIAL_BRANCHES: ClinicBranch[] = [
  { id: 'b1', name: 'Cabang Utama Senopati', code: 'SNP-01', city: 'Jakarta Selatan', totalChairs: 4, activeChairsCount: 3 },
  { id: 'b2', name: 'Cabang BSD Grand Boulevard', code: 'BSD-02', city: 'Tangerang Selatan', totalChairs: 6, activeChairsCount: 4 },
  { id: 'b3', name: 'Cabang Surabaya Darmo', code: 'SBY-03', city: 'Surabaya', totalChairs: 4, activeChairsCount: 2 },
];

const INITIAL_CHAIRS: DentalChair[] = [
  {
    id: 'chair-1',
    number: 1,
    name: 'Operatory 1 (Master Suite)',
    status: 'IN_TREATMENT',
    doctorName: 'drg. Sarah Sp.KG',
    patientTicket: 'A-007',
    patientInitials: 'Bpk. Ahmad (42 th)',
    procedureName: 'Root Canal Treatment (Gigi 46)',
    startedAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    estimatedMinutes: 45,
  },
  {
    id: 'chair-2',
    number: 2,
    name: 'Operatory 2 (Ortho & Aesthetic)',
    status: 'IN_TREATMENT',
    doctorName: 'drg. Budi Sp.Ort',
    patientTicket: 'B-014',
    patientInitials: 'Sdri. Jessica (24 th)',
    procedureName: 'Bonding Bracket & Wire Arch',
    startedAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
    estimatedMinutes: 30,
  },
  {
    id: 'chair-3',
    number: 3,
    name: 'Operatory 3 (Surgery & Endo)',
    status: 'DISINFECTION',
    doctorName: 'drg. Hendra Sp.BM',
    patientTicket: 'A-005',
    patientInitials: 'Ibu Ratna (51 th)',
    procedureName: 'Post-Odontektomi Disinfeksi',
    startedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    estimatedMinutes: 5,
  },
  {
    id: 'chair-4',
    number: 4,
    name: 'Operatory 4 (Hygiene & Pediatric)',
    status: 'AVAILABLE',
    doctorName: 'drg. Maria (GP)',
    estimatedMinutes: 0,
  },
];

const INITIAL_QUEUE: QueueItem[] = [
  {
    id: 'q-1',
    ticketCode: 'A-008',
    patientId: 'PT-9801',
    patientName: 'Ny. Dwi Lestari',
    patientAge: 48,
    chiefComplaint: 'Nyeri berdenyut rahang bawah kanan sejak 2 hari, tidak bisa tidur.',
    assignedDoctor: 'drg. Sarah Sp.KG',
    priority: 'EMERGENCY',
    status: 'WAITING',
    vitalSigns: { systolic: 138, diastolic: 88, pulseRate: 84, oxygenSaturation: 98, temperature: 36.8 },
    allergies: ['Penisilin (Amoxicillin)'],
    clinicalWarnings: ['Riwayat Alergi Antibiotik Beta-Laktam', 'Tensi Pra-Hipertensi'],
    waitingSince: '14:20',
  },
  {
    id: 'q-2',
    ticketCode: 'B-015',
    patientId: 'PT-9822',
    patientName: 'Tn. Kevin Pratama',
    patientAge: 29,
    chiefComplaint: 'Kontrol rutin bracket kawat lepas pada gigi 13 & 23.',
    assignedDoctor: 'drg. Budi Sp.Ort',
    priority: 'NORMAL',
    status: 'TRIAGED',
    vitalSigns: { systolic: 118, diastolic: 76, pulseRate: 72, oxygenSaturation: 99, temperature: 36.5 },
    allergies: [],
    clinicalWarnings: [],
    waitingSince: '14:35',
  },
  {
    id: 'q-3',
    ticketCode: 'C-003',
    patientId: 'PT-9840',
    patientName: 'Bpk. Herman Wijaya',
    patientAge: 62,
    chiefComplaint: 'Rencana scaling kalkulus berat & ekstraksi sisa akar gigi 36.',
    assignedDoctor: 'drg. Hendra Sp.BM',
    priority: 'FAST_TRACK',
    status: 'WAITING',
    vitalSigns: { systolic: 162, diastolic: 98, pulseRate: 78, oxygenSaturation: 97, temperature: 36.6 },
    allergies: ['Aspirin / NSAID'],
    clinicalWarnings: ['CRITICAL SAFETY ALERT: Hipertensi Grade 2 (>160/90). Anestesi adrenalin diinterlock.'],
    waitingSince: '14:42',
  },
];

const ADULT_FDI_TEETH = [
  // Maxillary Right (Q1)
  18, 17, 16, 15, 14, 13, 12, 11,
  // Maxillary Left (Q2)
  21, 22, 23, 24, 25, 26, 27, 28,
  // Mandibular Right (Q4)
  48, 47, 46, 45, 44, 43, 42, 41,
  // Mandibular Left (Q3)
  31, 32, 33, 34, 35, 36, 37, 38,
];

const INITIAL_ODONTOGRAM: Record<number, ToothData> = {};
ADULT_FDI_TEETH.forEach((fdi) => {
  INITIAL_ODONTOGRAM[fdi] = {
    fdiNumber: fdi,
    surfaces: {
      O: 'HEALTHY',
      M: 'HEALTHY',
      D: 'HEALTHY',
      B: 'HEALTHY',
      L: 'HEALTHY',
    },
    generalCondition: 'HEALTHY',
  };
});

// Seed sample clinical teeth for Ahmad (Chair 1)
INITIAL_ODONTOGRAM[46] = {
  fdiNumber: 46,
  surfaces: { O: 'CARIES', M: 'CARIES', D: 'HEALTHY', B: 'HEALTHY', L: 'HEALTHY' },
  generalCondition: 'ENDO',
  notes: 'Nekrose pulpa c. karies profunda MO. Masuk PSA Visit 2.',
};
INITIAL_ODONTOGRAM[16] = {
  fdiNumber: 16,
  surfaces: { O: 'RESTORED', M: 'RESTORED', D: 'HEALTHY', B: 'HEALTHY', L: 'HEALTHY' },
  generalCondition: 'RESTORED',
  notes: 'Restorasi komposit kelas 2 MO baik.',
};
INITIAL_ODONTOGRAM[36] = {
  fdiNumber: 36,
  surfaces: { O: 'HEALTHY', M: 'HEALTHY', D: 'HEALTHY', B: 'HEALTHY', L: 'HEALTHY' },
  generalCondition: 'RADIX',
  notes: 'Sisa akar gigi 36 indikasi ekstraksi bedah.',
};
INITIAL_ODONTOGRAM[28] = {
  fdiNumber: 28,
  surfaces: { O: 'HEALTHY', M: 'HEALTHY', D: 'HEALTHY', B: 'HEALTHY', L: 'HEALTHY' },
  generalCondition: 'MISSING',
  notes: 'Agenesis / riwayat ekstraksi.',
};

export const useDentalStore = create<DentalStoreState>((set) => ({
  isOperatoryDim: false,
  setOperatoryDim: (dim) => {
    if (typeof document !== 'undefined') {
      if (dim) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ isOperatoryDim: dim });
  },

  activeBranch: INITIAL_BRANCHES[0],
  branches: INITIAL_BRANCHES,
  setActiveBranch: (branch) => set({ activeBranch: branch }),

  chairs: INITIAL_CHAIRS,
  updateChairStatus: (chairId, status) =>
    set((state) => ({
      chairs: state.chairs.map((c) =>
        c.id === chairId
          ? {
              ...c,
              status,
              startedAt: status === 'IN_TREATMENT' ? new Date().toISOString() : c.startedAt,
            }
          : c
      ),
    })),

  activeConditionTool: 'CARIES',
  setActiveConditionTool: (condition) => set({ activeConditionTool: condition }),
  selectedToothFdi: 46,
  setSelectedToothFdi: (fdi) => set({ selectedToothFdi: fdi }),

  odontogram: INITIAL_ODONTOGRAM,
  paintSurface: (fdiNumber, surface, condition) =>
    set((state) => {
      const tooth = state.odontogram[fdiNumber] || {
        fdiNumber,
        surfaces: { O: 'HEALTHY', M: 'HEALTHY', D: 'HEALTHY', B: 'HEALTHY', L: 'HEALTHY' },
        generalCondition: 'HEALTHY',
      };
      return {
        odontogram: {
          ...state.odontogram,
          [fdiNumber]: {
            ...tooth,
            surfaces: {
              ...tooth.surfaces,
              [surface]: condition,
            },
          },
        },
      };
    }),

  setToothGeneralCondition: (fdiNumber, condition) =>
    set((state) => {
      const tooth = state.odontogram[fdiNumber] || {
        fdiNumber,
        surfaces: { O: 'HEALTHY', M: 'HEALTHY', D: 'HEALTHY', B: 'HEALTHY', L: 'HEALTHY' },
        generalCondition: 'HEALTHY',
      };
      return {
        odontogram: {
          ...state.odontogram,
          [fdiNumber]: {
            ...tooth,
            generalCondition: condition,
          },
        },
      };
    }),

  resetTooth: (fdiNumber) =>
    set((state) => ({
      odontogram: {
        ...state.odontogram,
        [fdiNumber]: {
          fdiNumber,
          surfaces: { O: 'HEALTHY', M: 'HEALTHY', D: 'HEALTHY', B: 'HEALTHY', L: 'HEALTHY' },
          generalCondition: 'HEALTHY',
        },
      },
    })),

  queue: INITIAL_QUEUE,
  advanceQueueStatus: (id, newStatus) =>
    set((state) => ({
      queue: state.queue.map((item) => (item.id === id ? { ...item, status: newStatus } : item)),
    })),
  removeQueueItem: (id) =>
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== id),
    })),

  periodontalData: {
    46: { fdiNumber: 46, db: 3, b: 3, mb: 4, dl: 3, l: 3, ml: 4, bop: true },
    16: { fdiNumber: 16, db: 2, b: 2, mb: 3, dl: 2, l: 2, ml: 2, bop: false },
    36: { fdiNumber: 36, db: 6, b: 5, mb: 7, dl: 6, l: 5, ml: 6, bop: true, furcationGrade: 2 },
  },
  updatePeriodontalPoint: (fdiNumber, point) =>
    set((state) => ({
      periodontalData: {
        ...state.periodontalData,
        [fdiNumber]: {
          ...(state.periodontalData[fdiNumber] || {
            fdiNumber,
            db: 2,
            b: 2,
            mb: 2,
            dl: 2,
            l: 2,
            ml: 2,
            bop: false,
          }),
          ...point,
        },
      },
    })),

  dailyRevenue: 28450000,
  completedProceduresCount: 14,
}));
