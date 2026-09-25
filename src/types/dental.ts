export type ChairStatus = 'AVAILABLE' | 'IN_TREATMENT' | 'DISINFECTION' | 'MAINTENANCE';

export interface DentalChair {
  id: string;
  number: number;
  name: string;
  status: ChairStatus;
  doctorName?: string;
  patientTicket?: string;
  patientInitials?: string;
  procedureName?: string;
  startedAt?: string; // ISO string
  estimatedMinutes?: number;
}

export type ToothSurface = 'O' | 'M' | 'D' | 'B' | 'L';

export type ToothCondition =
  | 'HEALTHY'
  | 'CARIES'
  | 'RESTORED'
  | 'ENDO'
  | 'MISSING'
  | 'RADIX'
  | 'CALCULUS'
  | 'CROWN';

export interface ToothData {
  fdiNumber: number;
  surfaces: {
    O: ToothCondition;
    M: ToothCondition;
    D: ToothCondition;
    B: ToothCondition;
    L: ToothCondition;
  };
  generalCondition?: ToothCondition;
  notes?: string;
}

export interface VitalSigns {
  systolic: number;
  diastolic: number;
  pulseRate: number;
  oxygenSaturation: number;
  temperature: number;
}

export type QueuePriority = 'NORMAL' | 'FAST_TRACK' | 'EMERGENCY';

export type QueueStatus = 'WAITING' | 'TRIAGED' | 'CALLED' | 'IN_CHAIR' | 'COMPLETED';

export interface QueueItem {
  id: string;
  ticketCode: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  chiefComplaint: string;
  assignedDoctor: string;
  priority: QueuePriority;
  status: QueueStatus;
  vitalSigns?: VitalSigns;
  allergies: string[];
  clinicalWarnings: string[];
  waitingSince: string;
}

export interface PeriodontalPoint {
  fdiNumber: number;
  db: number; // Disto-Buccal (mm)
  b: number;  // Mid-Buccal (mm)
  mb: number; // Mesio-Buccal (mm)
  dl: number; // Disto-Lingual (mm)
  l: number;  // Mid-Lingual (mm)
  ml: number; // Mesio-Lingual (mm)
  bop: boolean; // Bleeding on Probing
  furcationGrade?: 0 | 1 | 2 | 3;
}

export interface ClinicBranch {
  id: string;
  name: string;
  code: string;
  city: string;
  totalChairs: number;
  activeChairsCount: number;
}
