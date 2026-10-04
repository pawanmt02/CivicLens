import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Box, 
  Layers, 
  Eye, 
  RotateCw, 
  Compass, 
  Maximize2, 
  Zap, 
  ShieldCheck,
  Cpu
} from 'lucide-react';

export default function LiDAR3DViewer({ 
  scenario = 'clogged_drain', 
  speed = 28, 
  isScanning = true,
  privacyBlurred = true 
}) {
  const mountRef = useRef(null);
  const [cameraView, setCameraView] = useState('driver'); // 'driver' | 'birds_eye' | 'isometric'
  const [pointCloudDensity, setPointCloudDensity] = useState('dense'); // 'dense' | 'ultra'
  const [isRotating, setIsRotating] = useState(false);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const particlesRef = useRef(null);
  const laserBeamRef = useRef(null);
  const boundingBoxesRef = useRef([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    // 1. Scene & Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070B14);
    scene.fog = new THREE.FogExp2(0x070B14, 0.025);
    sceneRef.current = scene;

    // 2. Perspective Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 2.5, -6);
    camera.lookAt(0, 0.5, 12);
    cameraRef.current = camera;

    // 3. WebGL Renderer with High-Precision Shadows & Antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Dynamic Moving Road Grid
    const gridHelper = new THREE.GridHelper(80, 80, 0x06B6D4, 0x1E293B);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // 5. Drivable Corridor Lines
    const roadWidth = 7;
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-roadWidth / 2, 0.01, -10),
      new THREE.Vector3(-roadWidth / 2, 0.01, 40),
      new THREE.Vector3(roadWidth / 2, 0.01, -10),
      new THREE.Vector3(roadWidth / 2, 0.01, 40),
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38BDF8, linewidth: 2 });
    const roadLines = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(roadLines);

    // 6. 3D LiDAR Point Cloud Generation (15,000+ points)
    const count = 16000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorCyan = new THREE.Color(0x06B6D4);
    const colorAmber = new THREE.Color(0xF59E0B);
    const colorRed = new THREE.Color(0xEF4444);
    const colorEmerald = new THREE.Color(0x10B981);
    const colorSlate = new THREE.Color(0x334155);

    for (let i = 0; i < count; i++) {
      // Create street profile: road bed, curbs, roadside buildings & trees
      const z = -10 + Math.random() * 50;
      let x = (Math.random() - 0.5) * 28;
      let y = 0;

      // Ground vs roadside structures
      if (Math.abs(x) < 4.5) {
        // Road surface
        y = (Math.random() - 0.5) * 0.08;
      } else if (Math.abs(x) < 7) {
        // Sidewalk / curb
        y = 0.15 + Math.random() * 0.3;
      } else {
        // Buildings & urban vegetation
        y = Math.random() * 6.5;
      }

      // Add dense anomaly clusters in 3D space based on scenario
      if (scenario === 'clogged_drain' && z > 8 && z < 14 && x > -5.5 && x < -3.2) {
        y = -0.2 + Math.random() * 0.4;
      } else if (scenario === 'illegal_dump' && z > 10 && z < 16 && x > 3.8 && x < 6.8) {
        y = Math.random() * 1.8;
      } else if (scenario === 'overflowing_bin' && z > 9 && z < 13 && x > 4.0 && x < 5.8) {
        y = Math.random() * 2.2;
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Depth gradient & class coloring
      let ptColor = colorSlate;
      if (Math.abs(x) < 4.5) {
        ptColor = colorCyan;
      } else if (z > 8 && z < 15 && Math.abs(x) > 3.2 && Math.abs(x) < 7.0) {
        ptColor = scenario === 'clogged_drain' ? colorRed : colorAmber;
      } else if (Math.abs(x) > 4.5 && Math.abs(x) < 7) {
        ptColor = colorEmerald;
      }

      colors[i * 3] = ptColor.r;
      colors[i * 3 + 1] = ptColor.g;
      colors[i * 3 + 2] = ptColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // 7. 3D Wireframe Bounding Boxes (Object Oriented 3D Cuboids)
    const boxesGroup = new THREE.Group();

    // Primary Anomaly 3D Box
    let boxPos = new THREE.Vector3(-4.2, 0.2, 11);
    let boxSize = new THREE.Vector3(1.8, 1.2, 3.5);
    let boxColor = 0xEF4444;

    if (scenario === 'illegal_dump') {
      boxPos = new THREE.Vector3(5.2, 0.8, 13);
      boxSize = new THREE.Vector3(2.5, 1.6, 3.0);
      boxColor = 0xF59E0B;
    } else if (scenario === 'overflowing_bin') {
      boxPos = new THREE.Vector3(4.8, 1.1, 11);
      boxSize = new THREE.Vector3(1.4, 2.0, 1.6);
      boxColor = 0xEAB308;
    }

    const boxGeo = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const boxMat = new THREE.LineBasicMaterial({ color: boxColor, linewidth: 2 });
    const anomalyBox = new THREE.LineSegments(boxEdges, boxMat);
    anomalyBox.position.copy(boxPos);
    boxesGroup.add(anomalyBox);

    // 3D Privacy Shield Cylinder over Pedestrian (DPDP Act)
    if (privacyBlurred) {
      const pedCylinderGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.8, 16);
      const pedEdges = new THREE.EdgesGeometry(pedCylinderGeo);
      const pedMat = new THREE.LineBasicMaterial({ color: 0x10B981 });
      const pedShield = new THREE.LineSegments(pedEdges, pedMat);
      pedShield.position.set(-2.5, 0.9, 7);
      boxesGroup.add(pedShield);

      // Plate Shield Box
      const plateGeo = new THREE.BoxGeometry(0.8, 0.4, 0.2);
      const plateEdges = new THREE.EdgesGeometry(plateGeo);
      const plateMat = new THREE.LineBasicMaterial({ color: 0x10B981 });
      const plateShield = new THREE.LineSegments(plateEdges, plateMat);
      plateShield.position.set(0.2, 0.6, 9.5);
      boxesGroup.add(plateShield);
    }

    scene.add(boxesGroup);
    boundingBoxesRef.current = boxesGroup;

    // 8. Rotating LiDAR Laser Scan Beam
    const laserGeo = new THREE.ConeGeometry(8, 25, 32, 1, true);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0x06B6D4,
      transparent: true,
      opacity: 0.08,
      wireframe: true,
      side: THREE.DoubleSide
    });
    const laserBeam = new THREE.Mesh(laserGeo, laserMat);
    laserBeam.rotation.x = Math.PI / 2;
    laserBeam.position.set(0, 1.2, 0);
    scene.add(laserBeam);
    laserBeamRef.current = laserBeam;

    // Animation Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Dynamic ground motion based on speed
      if (isScanning) {
        gridHelper.position.z = (gridHelper.position.z + speed * delta * 0.4) % 2;
        laserBeam.rotation.z += delta * 3.5;
      }

      // Camera view positioning
      if (cameraView === 'driver') {
        camera.position.lerp(new THREE.Vector3(0, 1.8, -4), 0.08);
        camera.lookAt(0, 0.8, 15);
      } else if (cameraView === 'birds_eye') {
        camera.position.lerp(new THREE.Vector3(0, 22, 10), 0.08);
        camera.lookAt(0, 0, 12);
      } else if (cameraView === 'isometric') {
        camera.position.lerp(new THREE.Vector3(12, 10, 2), 0.08);
        camera.lookAt(0, 0.5, 12);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [scenario, speed, isScanning, privacyBlurred, cameraView]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#070B14] border border-cyan-900/40 shadow-2xl aspect-video flex items-center justify-center">
      
      {/* Three.js WebGL Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: 3D Spatial Telemetry HUD */}
      <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-800/60 font-mono text-[11px] text-cyan-300 space-y-1 pointer-events-none">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="font-bold text-white uppercase tracking-wider">3D LiDAR SPATIAL TWIN</span>
        </div>
        <div className="text-slate-300">Point Cloud: <strong className="text-cyan-400">16,000 pts (120° FOV)</strong></div>
        <div className="text-slate-400">Spatial Depth Accuracy: <strong className="text-emerald-400">±1.4 cm</strong></div>
      </div>

      {/* Top Right: 3D Camera Angles & Controls */}
      <div className="absolute top-3 right-3 flex items-center space-x-2 z-10">
        <div className="bg-black/85 backdrop-blur-md p-1 rounded-xl border border-slate-800 flex space-x-1">
          <button
            onClick={() => setCameraView('driver')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition ${
              cameraView === 'driver' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Driver POV
          </button>
          <button
            onClick={() => setCameraView('isometric')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition ${
              cameraView === 'isometric' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Isometric 3D
          </button>
          <button
            onClick={() => setCameraView('birds_eye')}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition ${
              cameraView === 'birds_eye' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Bird's Eye
          </button>
        </div>
      </div>

      {/* Bottom Overlay: 3D Target Identification Banner */}
      <div className="absolute bottom-3 left-3 right-3 bg-black/85 backdrop-blur-md p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>3D BOUNDING CUBOID ACQUIRED</span>
              <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.2 rounded">CRITICAL</span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Coord: [X: -4.2m, Y: 0.2m, Z: 11.0m] • Volumetric: 3.8 cu.m silt/waste
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px]">
          <span className="text-emerald-400 flex items-center gap-1 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> 3D DPDP MASKED
          </span>
        </div>
      </div>

    </div>
  );
}
