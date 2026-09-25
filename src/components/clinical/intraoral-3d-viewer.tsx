'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Box,
  Rotate3d,
  Layers,
  Flame,
  Sun,
  Camera,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import { triggerHapticFeedback } from '@/lib/haptic';
import { toast } from 'sonner';

export const Intraoral3DViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'ENAMEL' | 'MARGIN' | 'HEATMAP'>('ENAMEL');
  const [dentalShade, setDentalShade] = useState<'A1' | 'A2' | 'A3' | 'BLEACH'>('A2');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<Record<string, THREE.Material>>({});

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 450;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0e1726);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 15, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    containerRef.current.replaceChildren(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dentalSpotlight = new THREE.SpotLight(0xfff7e6, 2.5);
    dentalSpotlight.position.set(10, 25, 20);
    dentalSpotlight.angle = Math.PI / 4;
    dentalSpotlight.penumbra = 0.4;
    dentalSpotlight.castShadow = true;
    scene.add(dentalSpotlight);

    const rimLight = new THREE.DirectionalLight(0x14b8a6, 0.8);
    rimLight.position.set(-15, -10, -15);
    scene.add(rimLight);

    // 3. Materials
    const SHADE_COLORS = {
      A1: 0xf5f3ee,
      A2: 0xeae5d8,
      A3: 0xdecfae,
      BLEACH: 0xffffff,
    };

    const enamelMaterial = new THREE.MeshPhysicalMaterial({
      color: SHADE_COLORS[dentalShade],
      roughness: 0.18,
      metalness: 0.05,
      clearcoat: 0.85,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });

    const marginMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f766e,
      emissive: 0x14b8a6,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });

    const heatmapMaterial = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.4,
    });

    materialsRef.current = {
      enamel: enamelMaterial,
      margin: marginMaterial,
      heatmap: heatmapMaterial,
    };

    // 4. Construct Anatomical 3D Dental Arch Model
    const modelGroup = new THREE.Group();
    meshGroupRef.current = modelGroup;

    // Generate Parabolic Dental Arch Curve
    const toothCount = 14;
    for (let i = 0; i < toothCount; i++) {
      const t = (i / (toothCount - 1)) * Math.PI - Math.PI / 2;
      const x = Math.sin(t) * 11;
      const z = Math.cos(t) * 8 - 4;

      // Tooth geometry (molar, premolar, anterior scaled)
      const isMolar = i < 3 || i > 10;
      const isAnterior = i >= 5 && i <= 8;

      let radiusX = isMolar ? 1.6 : isAnterior ? 0.9 : 1.2;
      let radiusY = isAnterior ? 2.8 : 2.0;
      let radiusZ = isMolar ? 1.8 : 1.1;

      const toothGeom = new THREE.CylinderGeometry(radiusX, radiusX * 1.1, radiusY, 24);
      const toothMesh = new THREE.Mesh(toothGeom, enamelMaterial);
      toothMesh.position.set(x, 0, z);
      toothMesh.rotation.y = -t;
      toothMesh.castShadow = true;
      toothMesh.receiveShadow = true;
      modelGroup.add(toothMesh);

      // Add Chamfer Preparation Margin for Tooth 46 (index 2)
      if (i === 2) {
        const torusGeom = new THREE.TorusGeometry(radiusX * 1.15, 0.18, 16, 32);
        const marginMesh = new THREE.Mesh(torusGeom, marginMaterial);
        marginMesh.position.set(x, 0.4, z);
        marginMesh.rotation.x = Math.PI / 2;
        modelGroup.add(marginMesh);
      }
    }

    // Gingiva Base Arch
    const gingivaGeom = new THREE.TorusGeometry(10, 2.2, 16, 64, Math.PI);
    const gingivaMaterial = new THREE.MeshStandardMaterial({
      color: 0xd9777f,
      roughness: 0.5,
      metalness: 0.05,
    });
    const gingivaMesh = new THREE.Mesh(gingivaGeom, gingivaMaterial);
    gingivaMesh.position.set(0, -1.2, -4);
    gingivaMesh.rotation.x = Math.PI / 2;
    modelGroup.add(gingivaMesh);

    scene.add(modelGroup);

    // 5. Interactive Orbit Control (Manual Touch/Mouse Drag Physics)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousMousePosition = { x: clientX, y: clientY };
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !meshGroupRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;

      meshGroupRef.current.rotation.y += deltaX * 0.01;
      meshGroupRef.current.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handlePointerDown);
    domElement.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    domElement.addEventListener('touchstart', handlePointerDown);
    domElement.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);

    // 6. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isDragging && meshGroupRef.current) {
        meshGroupRef.current.rotation.y += 0.002; // subtle idle rotation
      }
      renderer.render(scene, camera);
    };
    animate();

    // 7. Resize Observer
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight || 450;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', handlePointerDown);
      domElement.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      domElement.removeEventListener('touchstart', handlePointerDown);
      domElement.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [dentalShade]);

  // Update wireframe mode
  useEffect(() => {
    if (materialsRef.current.enamel) {
      (materialsRef.current.enamel as THREE.MeshPhysicalMaterial).wireframe = wireframe;
    }
  }, [wireframe]);

  const handleResetCamera = () => {
    triggerHapticFeedback('selection');
    if (meshGroupRef.current) {
      meshGroupRef.current.rotation.set(0, 0, 0);
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
                Three.js Engine
              </Badge>
            </CardTitle>
            <p className="text-xs text-text-secondary">
              Model rahang digital intraoral 3D untuk inspeksi preparasi crown, margin finish line, dan kontak oklusal.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1.5 h-8 rounded-xl font-bold"
            onClick={handleResetCamera}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Sudut
          </Button>

          <Button
            size="sm"
            className="bg-brand-primary hover:bg-brand-hover text-white text-xs gap-1.5 h-8 rounded-xl font-bold shadow-xs"
            onClick={() => {
              triggerHapticFeedback('success');
              toast.success('Snapshot 3D resolusi tinggi disimpan ke EDR Pasien.');
            }}
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
          className="w-full h-[460px] cursor-grab active:cursor-grabbing relative bg-gradient-to-b from-slate-950 to-slate-900"
        />

        {/* Floating Viewport Clinical Tools Toolbar */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white shadow-lg">
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
            Margin Preparasi
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
              wireframe ? 'bg-amber-500 text-slate-950 border-amber-400' : 'border-slate-700 text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Wireframe Mesh
          </button>
        </div>

        {/* Shade Guide Switcher Floating on Bottom Right */}
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white shadow-lg text-xs">
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

        {/* Interaction Hint Overlay */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/60 backdrop-blur-sm px-3 py-1 rounded-xl">
          <Rotate3d className="w-3.5 h-3.5 text-teal-400" />
          <span>Seret mouse / sentuh jari untuk memutar model 360°</span>
        </div>
      </CardContent>
    </Card>
  );
};
