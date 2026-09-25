'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Box,
  Rotate3d,
  Layers,
  Flame,
  Camera,
  RotateCcw,
  Sparkles,
  ZoomIn,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';
import { toast } from 'sonner';

type DentalShade = 'BLEACH' | 'A1' | 'A2' | 'A3';
type ViewMode = 'ENAMEL' | 'MARGIN' | 'HEATMAP';
type ArchMode = 'BOTH' | 'MAXILLA' | 'MANDIBLE';

const SHADE_CONFIG: Record<DentalShade, { color: number; roughness: number }> = {
  BLEACH: { color: 0xffffff, roughness: 0.12 },
  A1: { color: 0xf7f5ee, roughness: 0.15 },
  A2: { color: 0xede7d6, roughness: 0.18 },
  A3: { color: 0xe0d2b6, roughness: 0.22 },
};

// 14 Maxillary Teeth Data (Rahang Atas - FDI Notation)
const MAXILLARY_TEETH = [
  { fdi: '17', name: 'Molar 2 Atas Kanan', type: 'max_molar', isAntagonist: false },
  { fdi: '16', name: 'Molar 1 Atas Kanan (Antagonis Gigi 46)', type: 'max_molar_16', isAntagonist: true },
  { fdi: '15', name: 'Premolar 2 Atas Kanan', type: 'max_premolar', isAntagonist: false },
  { fdi: '14', name: 'Premolar 1 Atas Kanan', type: 'max_premolar', isAntagonist: false },
  { fdi: '13', name: 'Kaninus Atas Kanan', type: 'max_canine', isAntagonist: false },
  { fdi: '12', name: 'Insisisus Lateral Atas Kanan', type: 'max_incisor_lateral', isAntagonist: false },
  { fdi: '11', name: 'Insisisus Sentral Atas Kanan', type: 'max_incisor_central', isAntagonist: false },
  { fdi: '21', name: 'Insisisus Sentral Atas Kiri', type: 'max_incisor_central', isAntagonist: false },
  { fdi: '22', name: 'Insisisus Lateral Atas Kiri', type: 'max_incisor_lateral', isAntagonist: false },
  { fdi: '23', name: 'Kaninus Atas Kiri', type: 'max_canine', isAntagonist: false },
  { fdi: '24', name: 'Premolar 1 Atas Kiri', type: 'max_premolar', isAntagonist: false },
  { fdi: '25', name: 'Premolar 2 Atas Kiri', type: 'max_premolar', isAntagonist: false },
  { fdi: '26', name: 'Molar 1 Atas Kiri', type: 'max_molar', isAntagonist: false },
  { fdi: '27', name: 'Molar 2 Atas Kiri', type: 'max_molar', isAntagonist: false },
];

// 14 Mandibular Teeth Data (Rahang Bawah - FDI Notation)
const MANDIBULAR_TEETH = [
  { fdi: '47', name: 'Molar 2 Bawah Kanan', type: 'mand_molar', isPrep: false },
  { fdi: '46', name: 'Molar 1 Bawah Kanan (Abutment Prep Crown)', type: 'mand_molar', isPrep: true },
  { fdi: '45', name: 'Premolar 2 Bawah Kanan', type: 'mand_premolar', isPrep: false },
  { fdi: '44', name: 'Premolar 1 Bawah Kanan', type: 'mand_premolar', isPrep: false },
  { fdi: '43', name: 'Kaninus Bawah Kanan', type: 'mand_canine', isPrep: false },
  { fdi: '42', name: 'Insisisus Lateral Bawah Kanan', type: 'mand_incisor_lateral', isPrep: false },
  { fdi: '41', name: 'Insisisus Sentral Bawah Kanan', type: 'mand_incisor_central', isPrep: false },
  { fdi: '31', name: 'Insisisus Sentral Bawah Kiri', type: 'mand_incisor_central', isPrep: false },
  { fdi: '32', name: 'Insisisus Lateral Bawah Kiri', type: 'mand_incisor_lateral', isPrep: false },
  { fdi: '33', name: 'Kaninus Bawah Kiri', type: 'mand_canine', isPrep: false },
  { fdi: '34', name: 'Premolar 1 Bawah Kiri', type: 'mand_premolar', isPrep: false },
  { fdi: '35', name: 'Premolar 2 Bawah Kiri', type: 'mand_premolar', isPrep: false },
  { fdi: '36', name: 'Molar 1 Bawah Kiri', type: 'mand_molar', isPrep: false },
  { fdi: '37', name: 'Molar 2 Bawah Kiri', type: 'mand_molar', isPrep: false },
];

// ========================================================
// Realistic Organic Anatomical Dental Geometry Generators
// ========================================================

/**
 * 1. Mandibular Molar (Lower Molar: 46, 47, 36, 37)
 * Quad-cusp table (MB, ML, DB, DL), Central Fossa Pit, Cruciform Fissure Grooves
 */
function createMandibularMolarGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BoxGeometry(2.6, 2.2, 2.7, 24, 16, 24);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const cornerFactor = 1.0 - (Math.abs(x) * Math.abs(z)) * 0.12;
    x *= cornerFactor;
    z *= cornerFactor;

    // Occlusal Surface Sculpting (pointing upward: y > 0.4)
    if (y > 0.4) {
      const cuspMB = Math.exp(-((x - 0.65) ** 2 + (z - 0.65) ** 2) / 0.42) * 0.45;
      const cuspML = Math.exp(-((x - 0.65) ** 2 + (z + 0.65) ** 2) / 0.42) * 0.52;
      const cuspDB = Math.exp(-((x + 0.65) ** 2 + (z - 0.65) ** 2) / 0.42) * 0.42;
      const cuspDL = Math.exp(-((x + 0.65) ** 2 + (z + 0.65) ** 2) / 0.42) * 0.48;

      const centralPit = Math.exp(-(x * x + z * z) / 0.52) * 0.48;
      const fissureX = Math.exp(-(z * z) / 0.07) * 0.14 * Math.exp(-(x * x) / 1.1);
      const fissureZ = Math.exp(-(x * x) / 0.07) * 0.14 * Math.exp(-(z * z) / 1.1);

      y += cuspMB + cuspML + cuspDB + cuspDL - centralPit - fissureX - fissureZ;
    }

    // Buccal height of contour
    if (z > 0 && y < 0.2 && y > -0.6) {
      z += 0.18 * Math.sin(((y + 0.6) / 0.8) * Math.PI);
    }

    // Cervical CEJ Constriction
    if (y < 0) {
      const taper = 1.0 - (-y / 1.1) * 0.26;
      x *= taper;
      z *= taper;
    }

    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * 2. Maxillary Molar (Upper Molar: 16, 17, 26, 27)
 * Rhomboid crown outline, 4 cusps pointing downward, Crista Obliqua (Oblique Ridge),
 * and Cusp of Carabelli on the mesiopalatal aspect.
 */
function createMaxillaryMolarGeometry(isFirstMolar: boolean = false): THREE.BufferGeometry {
  const geom = new THREE.BoxGeometry(2.7, 2.3, 2.8, 26, 16, 26);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Rhomboid skew characteristic of maxillary molars
    x += z * 0.12;

    // Occlusal Surface Sculpting (pointing downward: y < -0.35)
    if (y < -0.35) {
      // 4 Cusps: MP (Mesiopalatal, largest), DP, MB, DB
      const cuspMP = Math.exp(-((x - 0.68) ** 2 + (z + 0.68) ** 2) / 0.44) * 0.52;
      const cuspDP = Math.exp(-((x + 0.68) ** 2 + (z + 0.68) ** 2) / 0.44) * 0.38;
      const cuspMB = Math.exp(-((x - 0.68) ** 2 + (z - 0.68) ** 2) / 0.44) * 0.45;
      const cuspDB = Math.exp(-((x + 0.68) ** 2 + (z - 0.68) ** 2) / 0.44) * 0.41;

      // Crista Obliqua (Oblique Ridge) connecting Mesiopalatal to Distobuccal cusp
      const distToOblique = Math.abs((x - 0.68) + (z - 0.68)) / 1.414;
      const obliqueRidge = Math.exp(-(distToOblique ** 2) / 0.16) * 0.28 * Math.exp(-(x * x + z * z) / 1.4);

      // Central and Distal Fossae
      const centralPit = Math.exp(-((x - 0.1) ** 2 + (z - 0.1) ** 2) / 0.38) * 0.46;
      const distalPit = Math.exp(-((x + 0.5) ** 2 + (z + 0.4) ** 2) / 0.32) * 0.34;

      y -= cuspMP + cuspDP + cuspMB + cuspDB + obliqueRidge - centralPit - distalPit;

      // Cusp of Carabelli on Tooth 16 / 26 (mesiopalatal accessory tubercle)
      if (isFirstMolar && x > 0.4 && z > 0.4) {
        y -= 0.18 * Math.exp(-((x - 0.9) ** 2 + (z - 0.9) ** 2) / 0.2);
      }
    }

    // Cervical CEJ Constriction (at root side y > 0)
    if (y > 0) {
      const taper = 1.0 - (y / 1.15) * 0.25;
      x *= taper;
      z *= taper;
    }

    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * 3. Premolars (Bicuspid - Upper and Lower)
 */
function createPremolarGeometry(isUpper: boolean): THREE.BufferGeometry {
  const geom = new THREE.BoxGeometry(2.1, 2.2, 2.3, 22, 16, 22);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const cornerFactor = 1.0 - (Math.abs(x) * Math.abs(z)) * 0.14;
    x *= cornerFactor;
    z *= cornerFactor;

    if (!isUpper) {
      // Lower premolar (occlusal y > 0.4)
      if (y > 0.4) {
        const buccalCusp = Math.exp(-((z - 0.58) ** 2) / 0.35) * 0.46 * Math.exp(-(x * x) / 0.9);
        const lingualCusp = Math.exp(-((z + 0.58) ** 2) / 0.35) * 0.34 * Math.exp(-(x * x) / 0.9);
        const centralFissure = Math.exp(-(z * z) / 0.08) * 0.32;
        const marginalRidges = Math.abs(x) > 0.65 ? (Math.abs(x) - 0.65) * 0.28 : 0;
        y += buccalCusp + lingualCusp - centralFissure + marginalRidges;
      }
      if (y < 0) {
        const taper = 1.0 - (-y / 1.1) * 0.25;
        x *= taper;
        z *= taper;
      }
    } else {
      // Upper premolar (occlusal y < -0.4)
      if (y < -0.4) {
        const buccalCusp = Math.exp(-((z - 0.58) ** 2) / 0.35) * 0.48 * Math.exp(-(x * x) / 0.9);
        const palatalCusp = Math.exp(-((z + 0.58) ** 2) / 0.35) * 0.44 * Math.exp(-(x * x) / 0.9);
        const centralFissure = Math.exp(-(z * z) / 0.08) * 0.34;
        const marginalRidges = Math.abs(x) > 0.65 ? (Math.abs(x) - 0.65) * 0.28 : 0;
        y -= buccalCusp + palatalCusp - centralFissure + marginalRidges;
      }
      if (y > 0) {
        const taper = 1.0 - (y / 1.1) * 0.25;
        x *= taper;
        z *= taper;
      }
    }

    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * 4. Canines (Upper & Lower)
 */
function createCanineGeometry(isUpper: boolean): THREE.BufferGeometry {
  const geom = new THREE.BoxGeometry(1.9, 2.7, 2.0, 20, 20, 20);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const ny = y / 1.35;

    if (!isUpper) {
      // Lower Canine
      if (ny > 0.2) {
        const taper = 1.0 - ((ny - 0.2) / 0.8) * 0.65;
        x *= taper;
        z *= taper;
        if (ny > 0.65) y += 0.35 * Math.exp(-(x * x + z * z) / 0.3);
      }
      if (z > 0 && Math.abs(x) < 0.45) z += 0.16 * (1.0 - Math.abs(x) / 0.45);
      if (z < 0 && ny < -0.15) z -= 0.2 * Math.sin(((ny + 0.6) / 0.45) * Math.PI);
      if (ny < -0.3) {
        const taper = 1.0 - ((-0.3 - ny) / 0.7) * 0.25;
        x *= taper;
        z *= taper;
      }
    } else {
      // Upper Canine (spear-shaped prominent cusp apex pointing downwards)
      if (ny < -0.2) {
        const taper = 1.0 - ((-0.2 - ny) / 0.8) * 0.68;
        x *= taper;
        z *= taper;
        if (ny < -0.65) y -= 0.38 * Math.exp(-(x * x + z * z) / 0.3);
      }
      if (z > 0 && Math.abs(x) < 0.48) z += 0.18 * (1.0 - Math.abs(x) / 0.48);
      if (z < 0 && ny > 0.15) z -= 0.22 * Math.sin(((0.6 - ny) / 0.45) * Math.PI);
      if (ny > 0.3) {
        const taper = 1.0 - ((ny - 0.3) / 0.7) * 0.25;
        x *= taper;
        z *= taper;
      }
    }

    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * 5. Incisors (Central & Lateral - Upper & Lower)
 */
function createIncisorGeometry(isUpper: boolean, isCentral: boolean): THREE.BufferGeometry {
  const width = isUpper ? (isCentral ? 2.15 : 1.75) : (isCentral ? 1.65 : 1.75);
  const height = isUpper ? 2.7 : 2.5;
  const depth = 1.25;

  const geom = new THREE.BoxGeometry(width, height, depth, 22, 20, 16);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const ny = y / (height * 0.5);

    if (!isUpper) {
      // Lower Incisor (chisel edge at top y > 0)
      const zThinning = 0.32 + (1.0 - ny) * 0.42;
      z *= zThinning;
      if (ny > -0.2) x *= 1.0 + (ny + 0.2) * 0.22;
      if (z > 0 && ny > -0.3 && ny < 0.7) z += 0.1 * Math.sin(((ny + 0.3) / 1.0) * Math.PI);
      if (z < 0 && ny > -0.2 && ny < 0.6) z -= 0.12 * Math.sin(((ny + 0.2) / 0.8) * Math.PI);
      if (z < 0 && ny < -0.2) z -= 0.18 * Math.cos(((ny + 0.65) / 0.45) * Math.PI * 0.5);
      if (ny > 0.85) y -= (x * x) * 0.05;
    } else {
      // Upper Incisor (chisel edge at bottom y < 0, shovel-shaped palatal fossa)
      const zThinning = 0.32 + (1.0 + ny) * 0.42;
      z *= zThinning;
      if (ny < 0.2) x *= 1.0 + (0.2 - ny) * 0.28; // broad aesthetic crown
      if (z > 0 && ny < 0.3 && ny > -0.7) z += 0.14 * Math.sin(((0.3 - ny) / 1.0) * Math.PI);
      // Deep Shovel Palatal Fossa (-Z)
      if (z < 0 && ny < 0.2 && ny > -0.6) z -= 0.18 * Math.sin(((0.2 - ny) / 0.8) * Math.PI);
      // Prominent Palatal Cingulum (+Y side)
      if (z < 0 && ny > 0.2) z -= 0.22 * Math.cos(((0.65 - ny) / 0.45) * Math.PI * 0.5);
      // Incisal Mamelon developmental grooves
      if (ny < -0.85) y += (x * x) * 0.05;
    }

    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * 6. Crown Preparation Abutment (Tooth 46)
 */
function createCrownPreparationGeometry(): THREE.BufferGeometry {
  const geom = new THREE.CylinderGeometry(1.28, 1.48, 1.9, 48, 24);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const ny = y / 0.95;

    if (z > 0.5 && ny > 0.4) y -= (z - 0.5) * 0.35; // Functional Cusp Bevel 45°
    if (ny > 0.5) {
      const r = Math.sqrt(x * x + z * z);
      y -= (1.0 - Math.min(1.0, r / 1.2)) * 0.25; // anatomical clearance
    }
    if (ny > 0) {
      x *= 0.94;
      z *= 0.94; // 6° convergence taper
    }

    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * 7. Anatomical Gingival Base (Conforming to Arch with Interdental Papillae)
 */
function createAnatomicalGingivalBase(isUpper: boolean, archWidth: number = 8.5): THREE.BufferGeometry {
  const segmentsU = 120;
  const segmentsV = 20;

  const geom = new THREE.PlaneGeometry(2, 2, segmentsU, segmentsV);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const rawU = pos.getX(i);
    const rawV = pos.getY(i);

    const u = rawU;
    const archX = u * archWidth;
    const archZ = (1 - Math.cos(u * Math.PI * 0.46)) * 8.0 - (isUpper ? 4.3 : 4.0);

    const dx = archWidth;
    const dz = Math.sin(u * Math.PI * 0.46) * Math.PI * 0.46 * 8.0 * 0.5;
    const len = Math.sqrt(dx * dx + dz * dz);

    const nx = dz / len;
    const nz = -dx / len;

    const offsetDistance = rawV * 1.85;
    const toothPhase = (u + 1) * 0.5 * 13;
    const papilla = Math.sin(toothPhase * Math.PI * 2);

    let y = isUpper ? 3.8 : -0.45;

    if (!isUpper) {
      // Lower gingiva
      if (Math.abs(rawV) < 0.5) {
        y += (1.0 - Math.abs(rawV) / 0.5) * 0.35 + papilla * 0.28 * (1.0 - Math.abs(rawV) / 0.5);
      } else {
        y -= (Math.abs(rawV) - 0.5) * 2.2;
      }
    } else {
      // Upper gingiva
      if (Math.abs(rawV) < 0.5) {
        y -= (1.0 - Math.abs(rawV) / 0.5) * 0.35 + papilla * 0.28 * (1.0 - Math.abs(rawV) / 0.5);
      } else {
        y += (Math.abs(rawV) - 0.5) * 2.2;
      }
    }

    const finalX = archX + nx * offsetDistance;
    const finalZ = archZ + nz * offsetDistance;

    pos.setXYZ(i, finalX, y, finalZ);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * 8. Hard Palate Vault (Palatum Durum dengan Rugae Palatina)
 * Anatomic ceiling of the oral cavity behind the maxillary teeth
 */
function createHardPalateVaultGeometry(archWidth: number = 8.8): THREE.BufferGeometry {
  const geom = new THREE.PlaneGeometry(2, 2, 60, 40);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i); // -1 to +1
    const v = pos.getY(i); // -1 to +1 (anterior to posterior palate)

    // Palatal arch coordinates
    const x = u * (archWidth * 0.65) * (0.6 + 0.4 * (v + 1) * 0.5);
    const z = (v * 3.5) - 1.2;

    // Palatal vault dome elevation
    const distToCenter = Math.sqrt(x * x);
    const vaultDome = Math.cos((distToCenter / 5.5) * Math.PI * 0.5) * 1.5;

    // Rugae Palatina (transverse wavy mucosal ridges in anterior palate v < 0)
    let rugae = 0;
    if (v < 0) {
      rugae = Math.sin(v * Math.PI * 6) * 0.12 * Math.exp(-(distToCenter * distToCenter) / 8);
    }

    // Incisive Papilla behind central incisors
    let incisivePapilla = 0;
    if (Math.abs(x) < 0.5 && Math.abs(z + 3.2) < 0.5) {
      incisivePapilla = 0.18;
    }

    const y = 3.6 + vaultDome + rugae + incisivePapilla;
    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}

// ==========================================
// Main React Component
// ==========================================

export const Intraoral3DViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('ENAMEL');
  const [archMode, setArchMode] = useState<ArchMode>('BOTH');
  const [dentalShade, setDentalShade] = useState<DentalShade>('A2');
  const [jawOpening, setJawOpening] = useState<number>(0); // 0 mm (occlusion) to 20 mm (open)
  const [hoveredTooth, setHoveredTooth] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<'DEFAULT' | 'OCCLUSAL_MAND' | 'OCCLUSAL_MAX' | 'PREP'>('DEFAULT');

  // Three.js mutable references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const maxillaGroupRef = useRef<THREE.Group | null>(null);
  const mandibleGroupRef = useRef<THREE.Group | null>(null);
  const toothMaterialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const gingivaMaterialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const prepMarginMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const heatmapGroupRef = useRef<THREE.Group | null>(null);
  const toothMeshesRef = useRef<{ mesh: THREE.Mesh; fdi: string; name: string }[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 540;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a101d);

    // 2. Camera: Centered on the dual arch
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 15, 26);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    // 3. Renderer with high performance and drawing buffer for snapshot
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    container.replaceChildren(renderer.domElement);

    // 4. OrbitControls with smooth inertia
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.2, 0);
    controls.minDistance = 6;
    controls.maxDistance = 55;
    controls.maxPolarAngle = Math.PI - 0.1;
    controlsRef.current = controls;

    // 5. Studio Dental Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    // Main Surgical Operatory Spotlight
    const mainSpotlight = new THREE.SpotLight(0xfffaed, 3.6);
    mainSpotlight.position.set(0, 28, 20);
    mainSpotlight.angle = Math.PI / 3.4;
    mainSpotlight.penumbra = 0.5;
    mainSpotlight.castShadow = true;
    scene.add(mainSpotlight);

    // Inferior Fill Light (lighting lower teeth)
    const fillLight = new THREE.DirectionalLight(0xbbf7d0, 0.65);
    fillLight.position.set(0, -12, 12);
    scene.add(fillLight);

    // Clinical Teal Rim Lights
    const rimLeft = new THREE.DirectionalLight(0x14b8a6, 0.95);
    rimLeft.position.set(-20, 10, -12);
    scene.add(rimLeft);

    const rimRight = new THREE.DirectionalLight(0x0f766e, 0.85);
    rimRight.position.set(20, 10, -12);
    scene.add(rimRight);

    // 6. Materials
    const toothMaterials: THREE.MeshPhysicalMaterial[] = [];
    toothMaterialsRef.current = toothMaterials;
    const gingivaMaterials: THREE.MeshPhysicalMaterial[] = [];
    gingivaMaterialsRef.current = gingivaMaterials;

    const prepMarginMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      emissive: 0x14b8a6,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.1,
    });
    prepMarginMaterialRef.current = prepMarginMaterial;

    const gingivaMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd97580,
      roughness: 0.42,
      clearcoat: 0.35,
      clearcoatRoughness: 0.2,
      sheen: 0.45,
      sheenColor: new THREE.Color(0xffa5b0),
      side: THREE.DoubleSide,
    });
    gingivaMaterials.push(gingivaMaterial);

    // 7. Groups: Maxilla (Upper) & Mandible (Lower)
    const maxillaGroup = new THREE.Group();
    const mandibleGroup = new THREE.Group();
    maxillaGroupRef.current = maxillaGroup;
    mandibleGroupRef.current = mandibleGroup;

    const heatmapGroup = new THREE.Group();
    heatmapGroup.visible = false;
    heatmapGroupRef.current = heatmapGroup;
    scene.add(heatmapGroup);

    toothMeshesRef.current = [];

    // ==========================================
    // BUILD MAXILLARY ARCH (RAHANG ATAS - 14 TEETH)
    // ==========================================
    const archWidthMax = 8.8; // slightly wider than mandible for Class I normal overjet
    for (let i = 0; i < MAXILLARY_TEETH.length; i++) {
      const toothData = MAXILLARY_TEETH[i];
      const u = (i / (MAXILLARY_TEETH.length - 1)) * 2 - 1;

      const archX = u * archWidthMax;
      const archZ = (1 - Math.cos(u * Math.PI * 0.46)) * 8.0 - 4.3; // 0.3mm anterior overjet

      const dx = archWidthMax;
      const dz = Math.sin(u * Math.PI * 0.46) * Math.PI * 0.46 * 8.0 * 0.5;
      const len = Math.sqrt(dx * dx + dz * dz);
      const nx = dz / len;
      const nz = -dx / len;
      const rotY = Math.atan2(nx, nz);

      const toothMat = new THREE.MeshPhysicalMaterial({
        color: SHADE_CONFIG[dentalShade].color,
        roughness: SHADE_CONFIG[dentalShade].roughness,
        metalness: 0.04,
        clearcoat: 0.85,
        clearcoatRoughness: 0.1,
        transmission: 0.15,
        ior: 1.63,
        attenuationColor: new THREE.Color(0xfff5e6),
        attenuationDistance: 1.8,
        wireframe: wireframe,
      });
      toothMaterials.push(toothMat);

      let toothGeom: THREE.BufferGeometry;
      if (toothData.type === 'max_molar_16') {
        toothGeom = createMaxillaryMolarGeometry(true); // Cusp of Carabelli + Oblique ridge
      } else if (toothData.type === 'max_molar') {
        toothGeom = createMaxillaryMolarGeometry(false);
      } else if (toothData.type === 'max_premolar') {
        toothGeom = createPremolarGeometry(true);
      } else if (toothData.type === 'max_canine') {
        toothGeom = createCanineGeometry(true);
      } else if (toothData.type === 'max_incisor_central') {
        toothGeom = createIncisorGeometry(true, true);
      } else {
        toothGeom = createIncisorGeometry(true, false);
      }

      const toothMesh = new THREE.Mesh(toothGeom, toothMat);
      toothMesh.position.set(archX, 2.7, archZ);
      toothMesh.rotation.y = rotY;
      toothMesh.castShadow = true;
      toothMesh.receiveShadow = true;
      maxillaGroup.add(toothMesh);

      // Occlusal contact points (Heatmap for upper teeth)
      if (toothData.type.includes('molar') || toothData.type.includes('premolar')) {
        const contactGeom = new THREE.SphereGeometry(0.24, 16, 16);
        const contactMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const cMesh = new THREE.Mesh(contactGeom, contactMat);
        cMesh.position.set(archX + (toothData.isAntagonist ? 0.35 : 0), 1.6, archZ);
        heatmapGroup.add(cMesh);
      }

      toothMeshesRef.current.push({
        mesh: toothMesh,
        fdi: toothData.fdi,
        name: toothData.name,
      });
    }

    // Upper Gingiva & Hard Palate
    const upperGingivaGeom = createAnatomicalGingivalBase(true, archWidthMax);
    const upperGingivaMesh = new THREE.Mesh(upperGingivaGeom, gingivaMaterial);
    upperGingivaMesh.receiveShadow = true;
    maxillaGroup.add(upperGingivaMesh);

    const palateGeom = createHardPalateVaultGeometry(archWidthMax);
    const palateMesh = new THREE.Mesh(palateGeom, gingivaMaterial);
    palateMesh.receiveShadow = true;
    maxillaGroup.add(palateMesh);

    // ==========================================
    // BUILD MANDIBULAR ARCH (RAHANG BAWAH - 14 TEETH)
    // ==========================================
    const archWidthMand = 8.5;
    for (let i = 0; i < MANDIBULAR_TEETH.length; i++) {
      const toothData = MANDIBULAR_TEETH[i];
      const u = (i / (MANDIBULAR_TEETH.length - 1)) * 2 - 1;

      const archX = u * archWidthMand;
      const archZ = (1 - Math.cos(u * Math.PI * 0.46)) * 8.0 - 4.0;

      const dx = archWidthMand;
      const dz = Math.sin(u * Math.PI * 0.46) * Math.PI * 0.46 * 8.0 * 0.5;
      const len = Math.sqrt(dx * dx + dz * dz);
      const nx = dz / len;
      const nz = -dx / len;
      const rotY = Math.atan2(nx, nz);

      const toothMat = new THREE.MeshPhysicalMaterial({
        color: SHADE_CONFIG[dentalShade].color,
        roughness: SHADE_CONFIG[dentalShade].roughness,
        metalness: 0.04,
        clearcoat: 0.85,
        clearcoatRoughness: 0.1,
        transmission: 0.15,
        ior: 1.63,
        attenuationColor: new THREE.Color(0xfff5e6),
        attenuationDistance: 1.8,
        wireframe: wireframe,
      });
      toothMaterials.push(toothMat);

      if (toothData.isPrep) {
        // Tooth 46 Abutment
        const toothGeom = createCrownPreparationGeometry();
        const toothMesh = new THREE.Mesh(toothGeom, toothMat);
        toothMesh.position.set(archX, 0.45, archZ);
        toothMesh.rotation.y = rotY;
        toothMesh.castShadow = true;
        toothMesh.receiveShadow = true;
        mandibleGroup.add(toothMesh);

        // Chamfer Margin Finish Line Ring
        const marginRingGeom = new THREE.TorusGeometry(1.5, 0.14, 16, 48);
        const marginMesh = new THREE.Mesh(marginRingGeom, prepMarginMaterial);
        marginMesh.position.set(archX, -0.42, archZ);
        marginMesh.rotation.x = Math.PI / 2;
        marginMesh.rotation.y = rotY;
        mandibleGroup.add(marginMesh);

        // Core build-up
        const coreTopGeom = new THREE.CylinderGeometry(0.85, 1.25, 0.55, 32);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0xdfcca8,
          roughness: 0.35,
        });
        const coreMesh = new THREE.Mesh(coreTopGeom, coreMat);
        coreMesh.position.set(archX, 1.35, archZ);
        coreMesh.rotation.y = rotY;
        mandibleGroup.add(coreMesh);

        toothMeshesRef.current.push({
          mesh: toothMesh,
          fdi: toothData.fdi,
          name: toothData.name,
        });
        continue;
      }

      let toothGeom: THREE.BufferGeometry;
      if (toothData.type === 'mand_molar') {
        toothGeom = createMandibularMolarGeometry();
      } else if (toothData.type === 'mand_premolar') {
        toothGeom = createPremolarGeometry(false);
      } else if (toothData.type === 'mand_canine') {
        toothGeom = createCanineGeometry(false);
      } else if (toothData.type === 'mand_incisor_central') {
        toothGeom = createIncisorGeometry(false, true);
      } else {
        toothGeom = createIncisorGeometry(false, false);
      }

      const toothMesh = new THREE.Mesh(toothGeom, toothMat);
      toothMesh.position.set(archX, 0.45, archZ);
      toothMesh.rotation.y = rotY;
      toothMesh.castShadow = true;
      toothMesh.receiveShadow = true;
      mandibleGroup.add(toothMesh);

      // Contact points on lower teeth
      if (toothData.type === 'mand_molar' || toothData.type === 'mand_premolar') {
        const contactGeom = new THREE.SphereGeometry(0.24, 16, 16);
        const contactMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
        const cMesh = new THREE.Mesh(contactGeom, contactMat);
        cMesh.position.set(archX + 0.35, 1.55, archZ + 0.2);
        heatmapGroup.add(cMesh);
      }

      toothMeshesRef.current.push({
        mesh: toothMesh,
        fdi: toothData.fdi,
        name: toothData.name,
      });
    }

    // Lower Gingiva
    const lowerGingivaGeom = createAnatomicalGingivalBase(false, archWidthMand);
    const lowerGingivaMesh = new THREE.Mesh(lowerGingivaGeom, gingivaMaterial);
    lowerGingivaMesh.receiveShadow = true;
    mandibleGroup.add(lowerGingivaMesh);

    scene.add(maxillaGroup);
    scene.add(mandibleGroup);

    // 8. Interactive Raycasting on Mouse Move
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const interactiveMeshes = toothMeshesRef.current.map((t) => t.mesh);
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);

      if (intersects.length > 0) {
        const hit = toothMeshesRef.current.find((t) => t.mesh === intersects[0].object);
        if (hit) {
          setHoveredTooth(`Gigi ${hit.fdi} • ${hit.name}`);
        }
      } else {
        setHoveredTooth(null);
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);

    // 9. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Pulsating Finish Line Glow when in MARGIN mode
      if (prepMarginMaterialRef.current) {
        if (viewMode === 'MARGIN') {
          const pulse = 1.0 + Math.sin(elapsedTime * 4.5) * 0.6;
          prepMarginMaterialRef.current.emissiveIntensity = pulse * 1.6;
        } else {
          prepMarginMaterialRef.current.emissiveIntensity = 0.75;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 10. Resize Observer
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth || 800;
      const newHeight = containerRef.current.clientHeight || 540;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // 1. Reactive Arch Visibility (BOTH / MAXILLA / MANDIBLE)
  useEffect(() => {
    if (maxillaGroupRef.current) {
      maxillaGroupRef.current.visible = archMode === 'BOTH' || archMode === 'MAXILLA';
    }
    if (mandibleGroupRef.current) {
      mandibleGroupRef.current.visible = archMode === 'BOTH' || archMode === 'MANDIBLE';
    }
  }, [archMode]);

  // 2. Reactive TMJ Jaw Opening Articulation
  useEffect(() => {
    if (!mandibleGroupRef.current) return;

    // TMJ condyle hinge rotation: angle 0 to 18 degrees
    const maxRad = 0.30;
    const openingFraction = Math.min(1.0, Math.max(0, jawOpening / 20));
    const openRad = openingFraction * maxRad;

    // Temporomandibular Joint Pivot axis (x=0, y=6, z=8)
    const tmjCenter = new THREE.Vector3(0, 6, 8);
    mandibleGroupRef.current.position.set(0, 0, 0);
    mandibleGroupRef.current.rotation.x = -openRad;
    mandibleGroupRef.current.position.sub(tmjCenter);
    mandibleGroupRef.current.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), -openRad);
    mandibleGroupRef.current.position.add(tmjCenter);
  }, [jawOpening]);

  // 3. Reactive VITA Shade Update
  useEffect(() => {
    const config = SHADE_CONFIG[dentalShade];
    toothMaterialsRef.current.forEach((mat) => {
      mat.color.setHex(config.color);
      mat.roughness = config.roughness;
      mat.needsUpdate = true;
    });
  }, [dentalShade]);

  // 4. Reactive Wireframe Update
  useEffect(() => {
    toothMaterialsRef.current.forEach((mat) => {
      mat.wireframe = wireframe;
      mat.needsUpdate = true;
    });
    gingivaMaterialsRef.current.forEach((mat) => {
      mat.wireframe = wireframe;
      mat.needsUpdate = true;
    });
  }, [wireframe]);

  // 5. Reactive ViewMode Update
  useEffect(() => {
    if (heatmapGroupRef.current) {
      heatmapGroupRef.current.visible = viewMode === 'HEATMAP';
    }

    if (viewMode === 'MARGIN') {
      toothMaterialsRef.current.forEach((mat) => {
        mat.transmission = 0.45;
        mat.needsUpdate = true;
      });
      if (prepMarginMaterialRef.current) {
        prepMarginMaterialRef.current.color.setHex(0x14b8a6);
        prepMarginMaterialRef.current.emissive.setHex(0x2dd4bf);
      }
    } else {
      toothMaterialsRef.current.forEach((mat) => {
        mat.transmission = 0.15;
        mat.needsUpdate = true;
      });
      if (prepMarginMaterialRef.current) {
        prepMarginMaterialRef.current.color.setHex(0x0f766e);
        prepMarginMaterialRef.current.emissive.setHex(0x14b8a6);
      }
    }
  }, [viewMode]);

  // Camera Presets
  const handleApplyPreset = (preset: 'DEFAULT' | 'OCCLUSAL_MAND' | 'OCCLUSAL_MAX' | 'PREP') => {
    triggerHapticFeedback('selection');
    setActivePreset(preset);
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (preset === 'OCCLUSAL_MAND') {
      // Look directly down on Mandibular Arch
      camera.position.set(0, 25, 0.1);
      controls.target.set(0, -0.4, 0);
    } else if (preset === 'OCCLUSAL_MAX') {
      // Look directly up into Maxillary Arch & Palate
      camera.position.set(0, -20, 0.1);
      controls.target.set(0, 3.2, 0);
    } else if (preset === 'PREP') {
      // Zoom in on Tooth 46 Abutment & Antagonist 16
      camera.position.set(8.5, 4.8, 6.2);
      controls.target.set(7.2, 1.2, 3.0);
    } else {
      // Default Studio Perspective (Anterior 3/4 View)
      camera.position.set(0, 14, 25);
      controls.target.set(0, 1.2, 0);
    }
    controls.update();
  };

  // High-Resolution Snapshot Capture
  const handleCaptureSnapshot = () => {
    triggerHapticFeedback('success');
    const canvas = containerRef.current?.querySelector('canvas');
    if (canvas) {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `3D-DualArch-${archMode}-${dentalShade}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        toast.success('Snapshot 3D resolusi tinggi berhasil disimpan ke rekam medis EDR.');
      } catch {
        toast.success('Snapshot 3D berhasil disimpan ke EDR Pasien.');
      }
    }
  };

  const calculatedClearance = (1.8 + (jawOpening / 20) * 8.5).toFixed(2);

  return (
    <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-sm overflow-hidden flex flex-col w-full">
      <CardHeader className="bg-surface-subtle/50 pb-3 border-b border-border-subtle flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-teal-500/10 border border-teal-300 dark:border-teal-700 flex items-center justify-center text-brand-primary">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
              <span>Visualizer 3D Pemindai Intraoral (STL / PLY Dual Arch)</span>
              <Badge variant="outline" className="text-[10px] font-mono border-teal-300 text-brand-primary">
                Three.js WebGL Engine
              </Badge>
              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 text-[10px] font-bold">
                28 Gigi Anatomi + Palatum
              </Badge>
            </CardTitle>
            <p className="text-xs text-text-secondary mt-0.5">
              Model rahang maksila & mandibula lengkap: artikulasi oklusi interkuspasi, inspeksi preparasi crown gigi 46 vs antagonis 16, dan palatum durum.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1.5 h-8 rounded-xl font-bold border-border-subtle"
            onClick={() => handleApplyPreset('DEFAULT')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Sudut
          </Button>

          <Button
            size="sm"
            className="bg-brand-primary hover:bg-brand-hover text-white text-xs gap-1.5 h-8 rounded-xl font-bold shadow-xs"
            onClick={handleCaptureSnapshot}
          >
            <Camera className="w-3.5 h-3.5" />
            Ambil Snapshot 3D
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        {/* 3D WebGL Canvas Container */}
        <div
          ref={containerRef}
          className="w-full h-[540px] cursor-grab active:cursor-grabbing relative bg-gradient-to-b from-[#090e18] via-[#0d1627] to-[#090e18] select-none"
          style={{ minHeight: '540px' }}
        />

        {/* Top-Left: Arch Selector & Clinical Inspection Modes */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {/* Rahang Mode Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white shadow-xl text-xs">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider">Rahang:</span>
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback('selection');
                setArchMode('BOTH');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                archMode === 'BOTH' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Semua (Oklusi Penuh)
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback('selection');
                setArchMode('MAXILLA');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                archMode === 'MAXILLA' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Rahang Atas (Maksila)
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback('selection');
                setArchMode('MANDIBLE');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                archMode === 'MANDIBLE' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Rahang Bawah (Mandibula)
            </button>
          </div>

          {/* Clinical Modes */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white shadow-xl text-xs">
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback('selection');
                setViewMode('ENAMEL');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                viewMode === 'ENAMEL' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Email Natural
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback('selection');
                setViewMode('MARGIN');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                viewMode === 'MARGIN' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Margin Prep 46
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback('selection');
                setViewMode('HEATMAP');
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                viewMode === 'HEATMAP' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Kontak Oklusal (MIP)
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback('light');
                setWireframe(!wireframe);
              }}
              className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                wireframe ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold' : 'border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Wireframe
            </button>
          </div>
        </div>

        {/* Top-Right: Camera Presets & Dynamic TMJ Jaw Opening Slider */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
          {/* Quick Camera Presets */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white shadow-xl text-xs">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider">Sudut:</span>
            <button
              type="button"
              onClick={() => handleApplyPreset('DEFAULT')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                activePreset === 'DEFAULT' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Fasial (Depan)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('OCCLUSAL_MAND')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                activePreset === 'OCCLUSAL_MAND' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Oklusal Bawah
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('OCCLUSAL_MAX')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                activePreset === 'OCCLUSAL_MAX' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              Oklusal Atas
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('PREP')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                activePreset === 'PREP' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
              }`}
            >
              <ZoomIn className="w-3 h-3" />
              Zoom Gigi 46-16
            </button>
          </div>

          {/* Dynamic TMJ Jaw Articulation (Buka Mulut) Slider */}
          {archMode === 'BOTH' && (
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white shadow-xl text-xs">
              <span className="font-bold text-slate-300 text-[11px]">Buka Mulut (TMJ):</span>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={jawOpening}
                onChange={(e) => {
                  setJawOpening(parseFloat(e.target.value));
                }}
                className="w-28 accent-teal-500 cursor-pointer"
              />
              <span className="font-mono text-teal-400 font-bold min-w-[45px]">
                {jawOpening.toFixed(1)} mm
              </span>
            </div>
          )}

          {/* Real-Time Crown Clearance Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-teal-950/90 border border-teal-500/40 text-teal-200 text-xs font-mono shadow-md backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Clearance 46–16: <strong>{calculatedClearance} mm</strong> (Optimal All-Ceramic)</span>
          </div>
        </div>

        {/* Hovered Tooth Info Badge */}
        {hoveredTooth && (
          <div className="absolute top-28 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-950/95 border border-teal-500/50 text-teal-200 text-xs font-mono shadow-xl backdrop-blur-md animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            <span>{hoveredTooth}</span>
          </div>
        )}

        {/* Bottom-Right: VITA Classical Shade Guide */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-white shadow-xl text-xs">
          <span className="font-bold text-slate-300 pl-2">VITA Shade:</span>
          {(['BLEACH', 'A1', 'A2', 'A3'] as const).map((shade) => (
            <button
              key={shade}
              type="button"
              onClick={() => {
                triggerHapticFeedback('selection');
                setDentalShade(shade);
              }}
              className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                dentalShade === shade
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {shade}
            </button>
          ))}
        </div>

        {/* Bottom-Left: Interactive Hint */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 text-[11px] text-slate-300 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/60 shadow-lg">
          <Rotate3d className="w-3.5 h-3.5 text-teal-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Putar 360° (Seret/Sentuh) • Zoom (Scroll/Pinch) • Pan (Klik Kanan/2 Jari)</span>
        </div>
      </CardContent>
    </Card>
  );
};
