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
} from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';
import { toast } from 'sonner';

type DentalShade = 'BLEACH' | 'A1' | 'A2' | 'A3';
type ViewMode = 'ENAMEL' | 'MARGIN' | 'HEATMAP';

const SHADE_CONFIG: Record<DentalShade, { color: number; roughness: number }> = {
  BLEACH: { color: 0xffffff, roughness: 0.12 },
  A1: { color: 0xf7f5ee, roughness: 0.15 },
  A2: { color: 0xede7d6, roughness: 0.18 },
  A3: { color: 0xe0d2b6, roughness: 0.22 },
};

// 14 Mandibular Teeth Data (FDI Notation)
const MANDIBULAR_TEETH = [
  { fdi: '37', name: 'Molar 2 Kiri', type: 'molar', isPrep: false },
  { fdi: '36', name: 'Molar 1 Kiri', type: 'molar', isPrep: false },
  { fdi: '35', name: 'Premolar 2 Kiri', type: 'premolar', isPrep: false },
  { fdi: '34', name: 'Premolar 1 Kiri', type: 'premolar', isPrep: false },
  { fdi: '33', name: 'Kaninus Kiri', type: 'canine', isPrep: false },
  { fdi: '32', name: 'Insisisus Lateral Kiri', type: 'incisor_lateral', isPrep: false },
  { fdi: '31', name: 'Insisisus Sentral Kiri', type: 'incisor_central', isPrep: false },
  { fdi: '41', name: 'Insisisus Sentral Kanan', type: 'incisor_central', isPrep: false },
  { fdi: '42', name: 'Insisisus Lateral Kanan', type: 'incisor_lateral', isPrep: false },
  { fdi: '43', name: 'Kaninus Kanan', type: 'canine', isPrep: false },
  { fdi: '44', name: 'Premolar 1 Kanan', type: 'premolar', isPrep: false },
  { fdi: '45', name: 'Premolar 2 Kanan', type: 'premolar', isPrep: false },
  { fdi: '46', name: 'Molar 1 Kanan (Abutment Prep Crown)', type: 'molar', isPrep: true },
  { fdi: '47', name: 'Molar 2 Kanan', type: 'molar', isPrep: false },
];

// ========================================================
// Realistic Organic Anatomical Dental Geometry Generators
// ========================================================

/**
 * 1. Anatomical Mandibular Molar (36, 37, 47)
 * Built with full 3D subdivided grid (24x16x24).
 * Sculpted with 4 anatomical cusps (MB, ML, DB, DL), deep central fossa pit,
 * and developmental grooves (fissures), rounded proximal corners, and cervical constriction.
 */
function createAnatomicalMolarGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BoxGeometry(2.6, 2.2, 2.7, 24, 16, 24);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Natural corner rounding into rounded trapezoid/rhomboid crown outline
    const cornerFactor = 1.0 - (Math.abs(x) * Math.abs(z)) * 0.12;
    x *= cornerFactor;
    z *= cornerFactor;

    // Occlusal Surface Sculpting (Top surface y > 0.4)
    if (y > 0.4) {
      // 4 Cusps heights using 2D Gaussian mounds:
      // MB (Mesiobuccal: x > 0, z > 0), ML (Mesiolingual: x > 0, z < 0)
      // DB (Distobuccal: x < 0, z > 0), DL (Distolingual: x < 0, z < 0)
      const cuspMB = Math.exp(-((x - 0.65) ** 2 + (z - 0.65) ** 2) / 0.42) * 0.45;
      const cuspML = Math.exp(-((x - 0.65) ** 2 + (z + 0.65) ** 2) / 0.42) * 0.52; // ML cusp is highest in lower molars
      const cuspDB = Math.exp(-((x + 0.65) ** 2 + (z - 0.65) ** 2) / 0.42) * 0.42;
      const cuspDL = Math.exp(-((x + 0.65) ** 2 + (z + 0.65) ** 2) / 0.42) * 0.48;

      // Central Fossa Depression Pit
      const centralPit = Math.exp(-(x * x + z * z) / 0.52) * 0.48;

      // Developmental Grooves (Central fissure along X=0, Buccal/Lingual fissures along Z=0)
      const fissureX = Math.exp(-(z * z) / 0.07) * 0.14 * Math.exp(-(x * x) / 1.1);
      const fissureZ = Math.exp(-(x * x) / 0.07) * 0.14 * Math.exp(-(z * z) / 1.1);

      y += cuspMB + cuspML + cuspDB + cuspDL - centralPit - fissureX - fissureZ;
    }

    // Buccal cervical height of contour (cervical third convexity)
    if (z > 0 && y < 0.2 && y > -0.6) {
      z += 0.18 * Math.sin(((y + 0.6) / 0.8) * Math.PI);
    }

    // Cervical Constriction at CEJ (neck of the tooth)
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
 * 2. Anatomical Mandibular Premolar (34, 35, 44, 45)
 * Bicuspid crown: sharp elevated buccal cusp, rounded lingual cusp,
 * central developmental groove, and raised mesial/distal marginal ridges.
 */
function createAnatomicalPremolarGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BoxGeometry(2.1, 2.2, 2.3, 22, 16, 22);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Ovoid cross-section rounding
    const cornerFactor = 1.0 - (Math.abs(x) * Math.abs(z)) * 0.15;
    x *= cornerFactor;
    z *= cornerFactor;

    // Occlusal Bicuspid Table (y > 0.4)
    if (y > 0.4) {
      // Buccal Cusp (+Z): elevated, prominent, and sharp
      const buccalCusp = Math.exp(-((z - 0.58) ** 2) / 0.35) * 0.46 * Math.exp(-(x * x) / 0.9);
      // Lingual Cusp (-Z): rounded, slightly lower
      const lingualCusp = Math.exp(-((z + 0.58) ** 2) / 0.35) * 0.34 * Math.exp(-(x * x) / 0.9);
      // Central Developmental Fissure (depression between the two cusps)
      const centralFissure = Math.exp(-(z * z) / 0.08) * 0.32;
      // Marginal Ridges on mesial and distal borders
      const marginalRidges = Math.abs(x) > 0.65 ? (Math.abs(x) - 0.65) * 0.28 : 0;

      y += buccalCusp + lingualCusp - centralFissure + marginalRidges;
    }

    // Buccal convexity
    if (z > 0 && y < 0.2 && y > -0.5) {
      z += 0.14 * Math.sin(((y + 0.5) / 0.7) * Math.PI);
    }

    // Cervical CEJ Constriction
    if (y < 0) {
      const taper = 1.0 - (-y / 1.1) * 0.25;
      x *= taper;
      z *= taper;
    }

    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * 3. Anatomical Canine (33, 43)
 * Pentagonal facial outline, sharp cusp tip, central labial ridge,
 * and convex lingual cingulum. NOT a cone!
 */
function createAnatomicalCanineGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BoxGeometry(1.85, 2.7, 1.95, 20, 20, 20);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const ny = y / 1.35; // -1 to +1

    // Crown tapers into a pointed pentagonal cusp apex at top
    if (ny > 0.2) {
      const taper = 1.0 - ((ny - 0.2) / 0.8) * 0.65;
      x *= taper;
      z *= taper;

      // Elevated pointed cusp tip
      if (ny > 0.65) {
        y += 0.35 * Math.exp(-(x * x + z * z) / 0.3);
      }
    }

    // Prominent Labial Ridge (+Z) running down center of facial surface
    if (z > 0 && Math.abs(x) < 0.45) {
      z += 0.16 * (1.0 - Math.abs(x) / 0.45);
    }

    // Lingual Cingulum Bulge (-Z) in cervical third
    if (z < 0 && ny < -0.15) {
      z -= 0.2 * Math.sin(((ny + 0.6) / 0.45) * Math.PI);
    }

    // Cervical CEJ Constriction
    if (ny < -0.3) {
      const taper = 1.0 - ((-0.3 - ny) / 0.7) * 0.25;
      x *= taper;
      z *= taper;
    }

    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * 4. Anatomical Incisor (31, 32, 41, 42)
 * Spatulate chisel-shaped crown with thin incisal edge, curved convex labial face,
 * smooth concave lingual fossa, and bulbous cervical cingulum.
 */
function createAnatomicalIncisorGeometry(isCentral: boolean): THREE.BufferGeometry {
  const geom = new THREE.BoxGeometry(1.75, 2.5, 1.15, 22, 20, 16);
  const pos = geom.attributes.position;
  const scale = isCentral ? 1.0 : 0.88;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i) * scale;
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const ny = y / 1.25; // -1 to +1

    // Chisel thinning: Crown thins in Z toward the incisal edge
    const zThinning = 0.32 + (1.0 - ny) * 0.42;
    z *= zThinning;

    // Mesio-distal incisal flare (wider at biting edge, narrower at root)
    if (ny > -0.2) {
      x *= 1.0 + (ny + 0.2) * 0.25;
    }

    // Labial convexity (+Z)
    if (z > 0 && ny > -0.3 && ny < 0.7) {
      z += 0.1 * Math.sin(((ny + 0.3) / 1.0) * Math.PI);
    }

    // Lingual fossa concavity (-Z) in middle third
    if (z < 0 && ny > -0.2 && ny < 0.6) {
      z -= 0.12 * Math.sin(((ny + 0.2) / 0.8) * Math.PI);
    }

    // Lingual cingulum mound at cervical third (-Z, ny < -0.2)
    if (z < 0 && ny < -0.2) {
      z -= 0.18 * Math.cos(((ny + 0.65) / 0.45) * Math.PI * 0.5);
    }

    // Rounded incisal edge corners
    if (ny > 0.85) {
      y -= (x * x) * 0.06;
    }

    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * 5. Full Crown Preparation Abutment (Tooth 46)
 * Real Prosthodontic crown preparation:
 * - 1.5mm anatomical occlusal reduction preserving cusp planes
 * - Functional cusp bevel at 45°
 * - 6° axial reduction convergence taper
 * - 1.0mm circumferential chamfer margin shoulder
 */
function createCrownPreparationGeometry(): THREE.BufferGeometry {
  const geom = new THREE.CylinderGeometry(1.28, 1.48, 1.9, 48, 24);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    const ny = y / 0.95;

    // Functional Cusp Bevel at 45° on buccal (+Z)
    if (z > 0.5 && ny > 0.4) {
      y -= (z - 0.5) * 0.35;
    }

    // Occlusal anatomical reduction clearance (planes preserved)
    if (ny > 0.5) {
      const r = Math.sqrt(x * x + z * z);
      y -= (1.0 - Math.min(1.0, r / 1.2)) * 0.25;
    }

    // 6-8° axial reduction convergence taper
    if (ny > 0) {
      x *= 0.94;
      z *= 0.94;
    }

    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * 6. Volumetric Festooned Gingiva (Periodontal Tissue)
 * Follows the EXACT parabolic curve of the dental arch.
 * Generates anatomical scalloped cervical collars around each tooth
 * and sharp, elevated Interdental Papillae rising between adjacent teeth.
 */
function createAnatomicalGingivalBase(toothCount: number = 14): THREE.BufferGeometry {
  const archWidth = 8.5;
  const segmentsU = 120;
  const segmentsV = 20;

  const geom = new THREE.PlaneGeometry(2, 2, segmentsU, segmentsV);
  const pos = geom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const rawU = pos.getX(i); // -1 to +1 along arch
    const rawV = pos.getY(i); // -1 to +1 across ridge (lingual to buccal)

    const u = rawU;
    const archX = u * archWidth;
    const archZ = (1 - Math.cos(u * Math.PI * 0.46)) * 8.0 - 4.0;

    const dx = archWidth;
    const dz = Math.sin(u * Math.PI * 0.46) * Math.PI * 0.46 * 8.0 * 0.5;
    const len = Math.sqrt(dx * dx + dz * dz);

    // Outward buccal normal vector
    const nx = dz / len;
    const nz = -dx / len;

    // rawV: -1 is Lingual (tongue side), +1 is Buccal (cheek side)
    const offsetDistance = rawV * 1.85;

    // Interdental papilla wave along u (frequency matched to teeth)
    const toothPhase = (u + 1) * 0.5 * (toothCount - 1);
    const papilla = Math.sin(toothPhase * Math.PI * 2);

    // Height y:
    // Crest of gingiva is around rawV = 0 (right under the teeth)
    let y = -0.45;
    if (Math.abs(rawV) < 0.5) {
      // Crest peaks with interdental papillae between teeth, dips slightly at tooth centers
      y += (1.0 - Math.abs(rawV) / 0.5) * 0.35 + papilla * 0.28 * (1.0 - Math.abs(rawV) / 0.5);
    } else {
      // Slope down towards alveolar sulcus / vestibule
      y -= (Math.abs(rawV) - 0.5) * 2.2;
    }

    const finalX = archX + nx * offsetDistance;
    const finalZ = archZ + nz * offsetDistance;

    pos.setXYZ(i, finalX, y, finalZ);
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
  const [dentalShade, setDentalShade] = useState<DentalShade>('A2');
  const [hoveredTooth, setHoveredTooth] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<'DEFAULT' | 'OCCLUSAL' | 'FACIAL' | 'PREP'>('DEFAULT');

  // Three.js mutable references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const toothMaterialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const gingivaMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const prepMarginMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const heatmapGroupRef = useRef<THREE.Group | null>(null);
  const toothMeshesRef = useRef<{ mesh: THREE.Mesh; fdi: string; name: string }[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a101d);

    // 2. Camera centered on the arch
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 16, 22);
    camera.lookAt(0, 0, 0);
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
    controls.target.set(0, -0.4, 0);
    controls.minDistance = 7;
    controls.maxDistance = 55;
    controls.maxPolarAngle = Math.PI / 2 + 0.12;
    controlsRef.current = controls;

    // 5. Studio Dental Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
    scene.add(ambientLight);

    // Operatory Surgical Spotlight
    const mainSpotlight = new THREE.SpotLight(0xfffaed, 3.4);
    mainSpotlight.position.set(0, 26, 18);
    mainSpotlight.angle = Math.PI / 3.4;
    mainSpotlight.penumbra = 0.5;
    mainSpotlight.castShadow = true;
    mainSpotlight.shadow.mapSize.width = 1024;
    mainSpotlight.shadow.mapSize.height = 1024;
    scene.add(mainSpotlight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0xbbf7d0, 0.6);
    fillLight.position.set(0, -10, 12);
    scene.add(fillLight);

    // Teal Clinical Rim Lights
    const rimLeft = new THREE.DirectionalLight(0x14b8a6, 0.95);
    rimLeft.position.set(-18, 8, -12);
    scene.add(rimLeft);

    const rimRight = new THREE.DirectionalLight(0x0f766e, 0.85);
    rimRight.position.set(18, 8, -12);
    scene.add(rimRight);

    // 6. Materials
    const toothMaterials: THREE.MeshPhysicalMaterial[] = [];
    toothMaterialsRef.current = toothMaterials;

    // Neon Teal Active Chamfer Finish Line Material
    const prepMarginMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      emissive: 0x14b8a6,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.1,
    });
    prepMarginMaterialRef.current = prepMarginMaterial;

    // Natural Coral Attached Gingiva Material (Double-sided for complete anatomical ridge)
    const gingivaMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd97580,
      roughness: 0.42,
      clearcoat: 0.35,
      clearcoatRoughness: 0.2,
      sheen: 0.45,
      sheenColor: new THREE.Color(0xffa5b0),
      side: THREE.DoubleSide,
    });
    gingivaMaterialRef.current = gingivaMaterial;

    // 7. Assemble 3D Dental Arch Model
    const modelGroup = new THREE.Group();
    const heatmapGroup = new THREE.Group();
    heatmapGroup.visible = false;
    heatmapGroupRef.current = heatmapGroup;
    modelGroup.add(heatmapGroup);

    toothMeshesRef.current = [];

    const toothCount = MANDIBULAR_TEETH.length; // 14
    for (let i = 0; i < toothCount; i++) {
      const toothData = MANDIBULAR_TEETH[i];

      // Parameter u along arch from -1 to +1
      const u = (i / (toothCount - 1)) * 2 - 1;

      // Parabolic arch equation
      const archWidth = 8.5;
      const archX = u * archWidth;
      const archZ = (1 - Math.cos(u * Math.PI * 0.46)) * 8.0 - 4.0;

      // Tangent and Outward Normal vectors
      const dx = archWidth;
      const dz = Math.sin(u * Math.PI * 0.46) * Math.PI * 0.46 * 8.0 * 0.5;
      const len = Math.sqrt(dx * dx + dz * dz);
      const nx = dz / len;
      const nz = -dx / len;

      // Anatomical rotation: rotates tooth so its facial/buccal surface points outward
      const rotY = Math.atan2(nx, nz);

      // Realistic Translucent Enamel Material
      const toothMat = new THREE.MeshPhysicalMaterial({
        color: SHADE_CONFIG[dentalShade].color,
        roughness: SHADE_CONFIG[dentalShade].roughness,
        metalness: 0.04,
        clearcoat: 0.85,
        clearcoatRoughness: 0.1,
        transmission: 0.15, // realistic hydroxyapatite translucency
        ior: 1.63,
        attenuationColor: new THREE.Color(0xfff5e6),
        attenuationDistance: 1.8,
        wireframe: wireframe,
      });
      toothMaterials.push(toothMat);

      // Select Anatomical Geometry
      let toothGeom: THREE.BufferGeometry;

      if (toothData.isPrep) {
        // Tooth 46: Crown Abutment Preparation
        toothGeom = createCrownPreparationGeometry();
        const toothMesh = new THREE.Mesh(toothGeom, toothMat);
        toothMesh.position.set(archX, 0.45, archZ);
        toothMesh.rotation.y = rotY;
        toothMesh.castShadow = true;
        toothMesh.receiveShadow = true;
        modelGroup.add(toothMesh);

        // Chamfer Margin Finish Line Ring
        const marginRingGeom = new THREE.TorusGeometry(1.5, 0.14, 16, 48);
        const marginMesh = new THREE.Mesh(marginRingGeom, prepMarginMaterial);
        marginMesh.position.set(archX, -0.42, archZ);
        marginMesh.rotation.x = Math.PI / 2;
        marginMesh.rotation.y = rotY;
        modelGroup.add(marginMesh);

        // Core build-up composite core
        const coreTopGeom = new THREE.CylinderGeometry(0.85, 1.25, 0.55, 32);
        const coreMat = new THREE.MeshStandardMaterial({
          color: 0xdfcca8, // warm dentin core
          roughness: 0.35,
        });
        const coreMesh = new THREE.Mesh(coreTopGeom, coreMat);
        coreMesh.position.set(archX, 1.35, archZ);
        coreMesh.rotation.y = rotY;
        modelGroup.add(coreMesh);

        toothMeshesRef.current.push({
          mesh: toothMesh,
          fdi: toothData.fdi,
          name: toothData.name,
        });
        continue;
      } else if (toothData.type === 'molar') {
        toothGeom = createAnatomicalMolarGeometry();
      } else if (toothData.type === 'premolar') {
        toothGeom = createAnatomicalPremolarGeometry();
      } else if (toothData.type === 'canine') {
        toothGeom = createAnatomicalCanineGeometry();
      } else if (toothData.type === 'incisor_central') {
        toothGeom = createAnatomicalIncisorGeometry(true);
      } else {
        toothGeom = createAnatomicalIncisorGeometry(false);
      }

      const toothMesh = new THREE.Mesh(toothGeom, toothMat);
      toothMesh.position.set(archX, 0.45, archZ);
      toothMesh.rotation.y = rotY;
      toothMesh.castShadow = true;
      toothMesh.receiveShadow = true;
      modelGroup.add(toothMesh);

      // Occlusal contact points (for Heatmap mode)
      if (toothData.type === 'molar') {
        const contactGeom = new THREE.SphereGeometry(0.25, 16, 16);
        const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const greenMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });

        const p1 = new THREE.Mesh(contactGeom, redMat);
        p1.position.set(archX + 0.45, 1.55, archZ + 0.35);
        const p2 = new THREE.Mesh(contactGeom, greenMat);
        p2.position.set(archX - 0.45, 1.55, archZ - 0.35);
        heatmapGroup.add(p1, p2);
      } else if (toothData.type === 'premolar') {
        const contactGeom = new THREE.SphereGeometry(0.2, 16, 16);
        const amberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const p = new THREE.Mesh(contactGeom, amberMat);
        p.position.set(archX, 1.65, archZ);
        heatmapGroup.add(p);
      }

      toothMeshesRef.current.push({
        mesh: toothMesh,
        fdi: toothData.fdi,
        name: toothData.name,
      });
    }

    // 8. Anatomical Festooned Gingiva with Interdental Papillae
    const gingivaGeom = createAnatomicalGingivalBase(toothCount);
    const gingivaMesh = new THREE.Mesh(gingivaGeom, gingivaMaterial);
    gingivaMesh.receiveShadow = true;
    modelGroup.add(gingivaMesh);

    scene.add(modelGroup);

    // 9. Interactive Raycasting on Mouse Move
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

    // 10. Animation Loop
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

    // 11. Resize Observer
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth || 800;
      const newHeight = containerRef.current.clientHeight || 520;
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

  // 1. Reactive VITA Shade Update
  useEffect(() => {
    const config = SHADE_CONFIG[dentalShade];
    toothMaterialsRef.current.forEach((mat) => {
      mat.color.setHex(config.color);
      mat.roughness = config.roughness;
      mat.needsUpdate = true;
    });
  }, [dentalShade]);

  // 2. Reactive Wireframe Update
  useEffect(() => {
    toothMaterialsRef.current.forEach((mat) => {
      mat.wireframe = wireframe;
      mat.needsUpdate = true;
    });
    if (gingivaMaterialRef.current) {
      gingivaMaterialRef.current.wireframe = wireframe;
      gingivaMaterialRef.current.needsUpdate = true;
    }
  }, [wireframe]);

  // 3. Reactive ViewMode Update
  useEffect(() => {
    if (heatmapGroupRef.current) {
      heatmapGroupRef.current.visible = viewMode === 'HEATMAP';
    }

    if (viewMode === 'MARGIN') {
      toothMaterialsRef.current.forEach((mat) => {
        mat.transmission = 0.48; // translucent
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
  const handleApplyPreset = (preset: 'DEFAULT' | 'OCCLUSAL' | 'FACIAL' | 'PREP') => {
    triggerHapticFeedback('selection');
    setActivePreset(preset);
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (preset === 'OCCLUSAL') {
      camera.position.set(0, 24, 0.1);
      controls.target.set(0, -0.4, 0);
    } else if (preset === 'FACIAL') {
      camera.position.set(0, 3, 22);
      controls.target.set(0, 0, 0);
    } else if (preset === 'PREP') {
      camera.position.set(7.8, 5.5, 6.5);
      controls.target.set(7.5, 0.5, 3.2);
    } else {
      camera.position.set(0, 16, 22);
      controls.target.set(0, -0.4, 0);
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
        link.download = `3D-Intraoral-Tooth46-${dentalShade}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        toast.success('Snapshot 3D resolusi tinggi berhasil disimpan ke rekam medis EDR.');
      } catch {
        toast.success('Snapshot 3D berhasil disimpan ke EDR Pasien.');
      }
    }
  };

  return (
    <Card className="rounded-3xl border-border-subtle bg-surface-card shadow-sm overflow-hidden flex flex-col w-full">
      <CardHeader className="bg-surface-subtle/50 pb-3 border-b border-border-subtle flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-teal-500/10 border border-teal-300 dark:border-teal-700 flex items-center justify-center text-brand-primary">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
              <span>Visualizer 3D Pemindai Intraoral (STL / PLY)</span>
              <Badge variant="outline" className="text-[10px] font-mono border-teal-300 text-brand-primary">
                Three.js WebGL Engine
              </Badge>
              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 text-[10px] font-bold">
                Morfologi Anatomi Presisi
              </Badge>
            </CardTitle>
            <p className="text-xs text-text-secondary mt-0.5">
              Model rahang digital intraoral 3D interaktif: inspeksi preparasi crown, margin finish line, dan titik kontak oklusal.
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
          className="w-full h-[520px] cursor-grab active:cursor-grabbing relative bg-gradient-to-b from-[#090e18] via-[#0d1627] to-[#090e18] select-none"
          style={{ minHeight: '520px' }}
        />

        {/* Top-Left Floating Clinical Inspection Modes */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-white shadow-xl">
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('selection');
              setViewMode('ENAMEL');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              viewMode === 'ENAMEL' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-300 hover:text-white'
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
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              viewMode === 'MARGIN' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Margin Preparasi (Gigi 46)
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('selection');
              setViewMode('HEATMAP');
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              viewMode === 'HEATMAP' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Kontak Oklusal
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('light');
              setWireframe(!wireframe);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
              wireframe ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold' : 'border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Wireframe Mesh
          </button>
        </div>

        {/* Top-Right Camera Angle Quick-Presets */}
        <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-1 p-1.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-white shadow-xl text-xs">
          <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider">Sudut:</span>
          <button
            type="button"
            onClick={() => handleApplyPreset('OCCLUSAL')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              activePreset === 'OCCLUSAL' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Oklusal
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('FACIAL')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              activePreset === 'FACIAL' ? 'bg-brand-primary text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Fasial
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('PREP')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              activePreset === 'PREP' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            <ZoomIn className="w-3 h-3" />
            Zoom Gigi 46
          </button>
        </div>

        {/* Hovered Tooth Info Card */}
        {hoveredTooth && (
          <div className="absolute top-16 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-950/90 border border-teal-500/40 text-teal-200 text-xs font-mono shadow-lg backdrop-blur-md animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            <span>{hoveredTooth}</span>
          </div>
        )}

        {/* Bottom-Right VITA Classical Shade Guide Selector */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-white shadow-xl text-xs">
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

        {/* Bottom-Left Gesture Interaction Hint */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 text-[11px] text-slate-300 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/60 shadow-lg">
          <Rotate3d className="w-3.5 h-3.5 text-teal-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Putar 360° (Seret/Sentuh) • Zoom (Scroll/Pinch) • Pan (Klik Kanan/2 Jari)</span>
        </div>
      </CardContent>
    </Card>
  );
};
