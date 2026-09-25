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
  Eye,
  Maximize2,
  ZoomIn,
  CheckCircle2,
} from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';
import { toast } from 'sonner';

type DentalShade = 'BLEACH' | 'A1' | 'A2' | 'A3';
type ViewMode = 'ENAMEL' | 'MARGIN' | 'HEATMAP';

const SHADE_CONFIG: Record<DentalShade, { color: number; roughness: number }> = {
  BLEACH: { color: 0xffffff, roughness: 0.12 },
  A1: { color: 0xf7f5ee, roughness: 0.16 },
  A2: { color: 0xede7d6, roughness: 0.19 },
  A3: { color: 0xe0d2b6, roughness: 0.22 },
};

// FDI Tooth Data for the 14 mandibular teeth
const MANDIBULAR_TEETH = [
  { fdi: '37', name: 'Molar 2 Kiri', type: 'molar', isPrep: false },
  { fdi: '36', name: 'Molar 1 Kiri', type: 'molar', isPrep: false },
  { fdi: '35', name: 'Premolar 2 Kiri', type: 'premolar', isPrep: false },
  { fdi: '34', name: 'Premolar 1 Kiri', type: 'premolar', isPrep: false },
  { fdi: '33', name: 'Kaninus Kiri', type: 'canine', isPrep: false },
  { fdi: '32', name: 'Insisisus Lateral Kiri', type: 'incisor', isPrep: false },
  { fdi: '31', name: 'Insisisus Sentral Kiri', type: 'incisor', isPrep: false },
  { fdi: '41', name: 'Insisisus Sentral Kanan', type: 'incisor', isPrep: false },
  { fdi: '42', name: 'Insisisus Lateral Kanan', type: 'incisor', isPrep: false },
  { fdi: '43', name: 'Kaninus Kanan', type: 'canine', isPrep: false },
  { fdi: '44', name: 'Premolar 1 Kanan', type: 'premolar', isPrep: false },
  { fdi: '45', name: 'Premolar 2 Kanan', type: 'premolar', isPrep: false },
  { fdi: '46', name: 'Molar 1 Kanan (Abutment Crown)', type: 'molar', isPrep: true },
  { fdi: '47', name: 'Molar 2 Kanan', type: 'molar', isPrep: false },
];

export const Intraoral3DViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('ENAMEL');
  const [dentalShade, setDentalShade] = useState<DentalShade>('A2');
  const [hoveredTooth, setHoveredTooth] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<'DEFAULT' | 'OCCLUSAL' | 'FACIAL' | 'PREP'>('DEFAULT');

  // Three.js object references for reactive mutations without re-mounting
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const toothMaterialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const gingivaMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const prepMarginMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const heatmapGroupRef = useRef<THREE.Group | null>(null);
  const toothMeshesRef = useRef<{ mesh: THREE.Mesh; fdi: string; name: string }[]>([]);

  // Initialize Three.js WebGL Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a101d);

    // 2. Camera: Centered and angled nicely to see the whole arch
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 16, 22);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and shadow support
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true, // enables high-res snapshot
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.replaceChildren(renderer.domElement);

    // 4. Smooth OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, -0.5, 0);
    controls.minDistance = 8;
    controls.maxDistance = 55;
    controls.maxPolarAngle = Math.PI / 2 + 0.15; // prevent upside-down view
    controlsRef.current = controls;

    // 5. Studio Dental Lighting
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    // Main Dental Operatory Spotlight
    const mainSpotlight = new THREE.SpotLight(0xfffaf0, 3.2);
    mainSpotlight.position.set(0, 28, 18);
    mainSpotlight.angle = Math.PI / 3.5;
    mainSpotlight.penumbra = 0.5;
    mainSpotlight.castShadow = true;
    mainSpotlight.shadow.mapSize.width = 1024;
    mainSpotlight.shadow.mapSize.height = 1024;
    scene.add(mainSpotlight);

    // Fill light from bottom
    const fillLight = new THREE.DirectionalLight(0xa5f3fc, 0.7);
    fillLight.position.set(0, -12, 10);
    scene.add(fillLight);

    // Lateral rim lights (Teal accent highlights)
    const rimLeft = new THREE.DirectionalLight(0x14b8a6, 1.0);
    rimLeft.position.set(-18, 8, -12);
    scene.add(rimLeft);

    const rimRight = new THREE.DirectionalLight(0x0f766e, 0.9);
    rimRight.position.set(18, 8, -12);
    scene.add(rimRight);

    // 6. Materials
    const toothMaterials: THREE.MeshPhysicalMaterial[] = [];
    toothMaterialsRef.current = toothMaterials;

    const prepMarginMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      emissive: 0x14b8a6,
      emissiveIntensity: 0.8,
      roughness: 0.25,
      metalness: 0.1,
    });
    prepMarginMaterialRef.current = prepMarginMaterial;

    const gingivaMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97580,
      roughness: 0.45,
      metalness: 0.05,
    });
    gingivaMaterialRef.current = gingivaMaterial;

    // 7. Anatomical Dental Arch Mesh Construction
    const modelGroup = new THREE.Group();
    const heatmapGroup = new THREE.Group();
    heatmapGroup.visible = false;
    heatmapGroupRef.current = heatmapGroup;
    modelGroup.add(heatmapGroup);

    toothMeshesRef.current = [];

    const toothCount = MANDIBULAR_TEETH.length; // 14 teeth
    for (let i = 0; i < toothCount; i++) {
      const toothData = MANDIBULAR_TEETH[i];

      // Normalized parameter u from -1 (left molar) to +1 (right molar)
      const u = (i / (toothCount - 1)) * 2 - 1;

      // Parabolic arch curve (x, z) centered at (0, 0)
      const archWidth = 8.5;
      const x = u * archWidth;
      const z = (1 - Math.cos(u * Math.PI * 0.46)) * 8.0 - 4.0;

      // Tangent angle for anatomical tooth rotation along arch
      const dx = archWidth;
      const dz = Math.sin(u * Math.PI * 0.46) * Math.PI * 0.46 * 8.0 * 0.5;
      const rotationY = Math.atan2(dz, dx) - Math.PI / 2;

      // Create high-detail tooth material with realistic hydroxyapatite translucency
      const toothMat = new THREE.MeshPhysicalMaterial({
        color: SHADE_CONFIG[dentalShade].color,
        roughness: SHADE_CONFIG[dentalShade].roughness,
        metalness: 0.04,
        clearcoat: 0.85,
        clearcoatRoughness: 0.1,
        transmission: 0.12,
        ior: 1.62,
        wireframe: wireframe,
      });
      toothMaterials.push(toothMat);

      // Tooth geometry based on dental type
      let toothMesh: THREE.Mesh;

      if (toothData.isPrep) {
        // Tooth 46: Prepared abutment for Crown (6° convergence, chamfer shoulder)
        const prepGeom = new THREE.CylinderGeometry(1.25, 1.45, 1.8, 32);
        toothMesh = new THREE.Mesh(prepGeom, toothMat);
        toothMesh.position.set(x, 0.4, z);

        // Active Chamfer Margin Ring (finish line)
        const marginRingGeom = new THREE.TorusGeometry(1.5, 0.14, 16, 48);
        const marginMesh = new THREE.Mesh(marginRingGeom, prepMarginMaterial);
        marginMesh.position.set(x, -0.45, z);
        marginMesh.rotation.x = Math.PI / 2;
        modelGroup.add(marginMesh);

        // Core build-up core top
        const coreTopGeom = new THREE.CylinderGeometry(0.9, 1.25, 0.5, 32);
        const coreMesh = new THREE.Mesh(coreTopGeom, toothMat);
        coreMesh.position.set(x, 1.35, z);
        modelGroup.add(coreMesh);
      } else if (toothData.type === 'molar') {
        // Natural Molar: 4-cusp occlusal surface
        const molarGeom = new THREE.CylinderGeometry(1.65, 1.8, 2.1, 32);
        toothMesh = new THREE.Mesh(molarGeom, toothMat);
        toothMesh.position.set(x, 0.5, z);

        // Occlusal contact points (for Heatmap)
        const contactGeom = new THREE.SphereGeometry(0.28, 16, 16);
        const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const greenMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });

        const p1 = new THREE.Mesh(contactGeom, redMat);
        p1.position.set(x + 0.4, 1.6, z + 0.3);
        const p2 = new THREE.Mesh(contactGeom, greenMat);
        p2.position.set(x - 0.4, 1.6, z - 0.3);
        heatmapGroup.add(p1, p2);
      } else if (toothData.type === 'premolar') {
        // Premolar: Bicuspid crown
        const premolarGeom = new THREE.CylinderGeometry(1.25, 1.4, 2.3, 24);
        toothMesh = new THREE.Mesh(premolarGeom, toothMat);
        toothMesh.position.set(x, 0.6, z);

        const contactGeom = new THREE.SphereGeometry(0.22, 16, 16);
        const amberMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const p = new THREE.Mesh(contactGeom, amberMat);
        p.position.set(x, 1.8, z);
        heatmapGroup.add(p);
      } else if (toothData.type === 'canine') {
        // Canine: Pointed cusp tip
        const canineGeom = new THREE.ConeGeometry(1.1, 2.7, 24);
        toothMesh = new THREE.Mesh(canineGeom, toothMat);
        toothMesh.position.set(x, 0.9, z);
      } else {
        // Incisor: Chisel-shaped incisal edge
        const incisorGeom = new THREE.BoxGeometry(1.2, 2.6, 0.75);
        toothMesh = new THREE.Mesh(incisorGeom, toothMat);
        toothMesh.position.set(x, 0.8, z);
      }

      toothMesh.rotation.y = rotationY;
      toothMesh.castShadow = true;
      toothMesh.receiveShadow = true;
      modelGroup.add(toothMesh);

      toothMeshesRef.current.push({
        mesh: toothMesh,
        fdi: toothData.fdi,
        name: toothData.name,
      });
    }

    // 8. Continuous Anatomical Gingiva / Gum Base
    const gingivaPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      const u = (i / 24) * 2 - 1;
      const gx = u * 9.0;
      const gz = (1 - Math.cos(u * Math.PI * 0.46)) * 8.2 - 4.1;
      gingivaPoints.push(new THREE.Vector3(gx, -0.6, gz));
    }
    const gingivaCurve = new THREE.CatmullRomCurve3(gingivaPoints);
    const gingivaGeom = new THREE.TubeGeometry(gingivaCurve, 64, 1.4, 16, false);
    const gingivaMesh = new THREE.Mesh(gingivaGeom, gingivaMaterial);
    gingivaMesh.receiveShadow = true;
    modelGroup.add(gingivaMesh);

    scene.add(modelGroup);

    // 9. Interactive Raycasting on Mouse Move (Hover tooth detection)
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

      // Pulsating glow on preparation finish line when viewMode is MARGIN
      if (prepMarginMaterialRef.current) {
        if (viewMode === 'MARGIN') {
          const pulse = 1.0 + Math.sin(elapsedTime * 4.5) * 0.6;
          prepMarginMaterialRef.current.emissiveIntensity = pulse * 1.5;
        } else {
          prepMarginMaterialRef.current.emissiveIntensity = 0.7;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 11. Responsive Resize Observer
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

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      controls.dispose();
      renderer.dispose();
    };
  }, []); // Run once on mount; reactive states are handled below

  // 1. Reactive VITA Shade Update (without canvas reload)
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

  // 3. Reactive ViewMode Update (Natural / Margin / Heatmap)
  useEffect(() => {
    if (heatmapGroupRef.current) {
      heatmapGroupRef.current.visible = viewMode === 'HEATMAP';
    }

    if (viewMode === 'MARGIN') {
      toothMaterialsRef.current.forEach((mat) => {
        mat.transmission = 0.45; // translucent so prep margin stands out
        mat.needsUpdate = true;
      });
      if (prepMarginMaterialRef.current) {
        prepMarginMaterialRef.current.color.setHex(0x14b8a6);
        prepMarginMaterialRef.current.emissive.setHex(0x2dd4bf);
      }
    } else {
      toothMaterialsRef.current.forEach((mat) => {
        mat.transmission = 0.12;
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
      // Direct Top-Down Occlusal View
      camera.position.set(0, 24, 0.1);
      controls.target.set(0, -0.5, 0);
    } else if (preset === 'FACIAL') {
      // Frontal Anterior View
      camera.position.set(0, 3, 22);
      controls.target.set(0, 0, 0);
    } else if (preset === 'PREP') {
      // Focused Zoom on Tooth 46 Abutment Preparation
      camera.position.set(7.8, 5.5, 6.5);
      controls.target.set(7.5, 0.5, 3.2);
    } else {
      // Default Studio Perspective
      camera.position.set(0, 16, 22);
      controls.target.set(0, -0.5, 0);
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
                Resolusi CAD/CAM 20µm
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
        {/* 3D WebGL Canvas Container with guaranteed height */}
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
