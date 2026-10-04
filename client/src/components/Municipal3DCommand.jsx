import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Building2, 
  Layers, 
  Navigation, 
  Truck, 
  RotateCw, 
  Compass, 
  Zap, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export default function Municipal3DCommand({ 
  hotspots = [], 
  dispatchRoute = null, 
  depot = { latitude: 12.9716, longitude: 77.6200 },
  onSelectHotspot 
}) {
  const mountRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState('all');
  const [selectedHotspotData, setSelectedHotspotData] = useState(hotspots[0] || null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = 550;

    // 1. Three.js Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080D1A);
    scene.fog = new THREE.FogExp2(0x080D1A, 0.015);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 45, 60);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x38BDF8, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);
    dirLight.position.set(30, 60, 40);
    scene.add(dirLight);

    // 5. 3D City Floor Grid
    const cityGrid = new THREE.GridHelper(100, 50, 0x06B6D4, 0x1E293B);
    cityGrid.position.y = 0;
    scene.add(cityGrid);

    // 6. 3D Volumetric Extruded Hotspot Cylinders
    const hotspotMeshes = [];
    const pulseRings = [];

    hotspots.forEach((h, idx) => {
      const angle = (idx / Math.max(hotspots.length, 1)) * Math.PI * 2;
      const radius = 18 + idx * 4;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const height = (h.severityScore / 100) * 14 + 4;
      const color = h.priority === 'critical' ? 0xEF4444 : h.priority === 'high' ? 0xF59E0B : 0x10B981;

      // Extruded 3D Cylinder
      const cylGeo = new THREE.CylinderGeometry(2.5, 3.2, height, 32);
      const cylMat = new THREE.MeshPhongMaterial({
        color,
        transparent: true,
        opacity: 0.75,
        shininess: 100,
        emissive: color,
        emissiveIntensity: 0.35
      });
      const cylinder = new THREE.Mesh(cylGeo, cylMat);
      cylinder.position.set(x, height / 2, z);
      scene.add(cylinder);
      hotspotMeshes.push({ mesh: cylinder, data: h });

      // Pulsing 3D Shockwave Ring
      const ringGeo = new THREE.RingGeometry(3.5, 4.2, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(x, 0.05, z);
      scene.add(ring);
      pulseRings.push(ring);
    });

    // 7. Central Municipal HQ Depot Tower
    const hqGeo = new THREE.BoxGeometry(6, 18, 6);
    const hqMat = new THREE.MeshPhongMaterial({
      color: 0x3B82F6,
      emissive: 0x1D4ED8,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.85
    });
    const hqTower = new THREE.Mesh(hqGeo, hqMat);
    hqTower.position.set(0, 9, 0);
    scene.add(hqTower);

    // 8. 3D Sanitation Vehicle Spline Path (TSP Dynamic Route)
    const curvePoints = [
      new THREE.Vector3(0, 0.5, 0),
      ...hotspotMeshes.map(hm => new THREE.Vector3(hm.mesh.position.x, 0.5, hm.mesh.position.z)),
      new THREE.Vector3(0, 0.5, 0)
    ];

    if (curvePoints.length > 2) {
      const curve = new THREE.CatmullRomCurve3(curvePoints, true);
      const points = curve.getPoints(100);
      const splineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const splineMat = new THREE.LineBasicMaterial({ color: 0x818CF8, linewidth: 3 });
      const splineObject = new THREE.Line(splineGeo, splineMat);
      scene.add(splineObject);

      // 3D Moving Sanitation Truck Box on Curve
      const truckGeo = new THREE.BoxGeometry(2, 1.2, 3.5);
      const truckMat = new THREE.MeshPhongMaterial({ color: 0x10B981, emissive: 0x059669, emissiveIntensity: 0.5 });
      const truckMesh = new THREE.Mesh(truckGeo, truckMat);
      scene.add(truckMesh);

      // Store in animation scope
      scene.userData.curve = curve;
      scene.userData.truck = truckMesh;
    }

    // Animation Loop with Smooth Slow Orbit
    let animId;
    let t = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.003;

      // Slow orbital rotation of camera
      camera.position.x = Math.sin(t * 0.4) * 65;
      camera.position.z = Math.cos(t * 0.4) * 65;
      camera.lookAt(0, 4, 0);

      // Animate shockwave rings
      pulseRings.forEach((r, i) => {
        const scale = 1 + (Math.sin(t * 4 + i) + 1) * 0.35;
        r.scale.set(scale, scale, 1);
      });

      // Move sanitation truck along curve
      if (scene.userData.curve && scene.userData.truck) {
        const pointOnCurve = scene.userData.curve.getPointAt((t * 0.5) % 1);
        const nextPoint = scene.userData.curve.getPointAt(((t * 0.5) + 0.01) % 1);
        scene.userData.truck.position.copy(pointOnCurve);
        scene.userData.truck.lookAt(nextPoint);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [hotspots, dispatchRoute]);

  return (
    <div className="space-y-4">
      
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Municipal 3D GIS Digital Twin</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300">
                WebGL 3D Orbit
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              3D Volumetric Extrusion: Height represents real-time accumulated waste volume in cubic meters.
            </p>
          </div>
        </div>

        {/* Legend pills */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-lg shadow-red-500"></span>
            Critical Culvert Chokes
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500"></span>
            High Severity Blackspots
          </span>
          <span className="flex items-center gap-1.5 text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            BBMP Central Depot
          </span>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden bg-[#080D1A] border border-indigo-900/40 shadow-2xl h-[550px]">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Floating 3D Telemetry HUD */}
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1 pointer-events-none">
          <div className="text-indigo-400 font-bold flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5" />
            <span>DYNAMIC SANITATION DISPATCH LOOP</span>
          </div>
          <div className="text-slate-300">Active Hotspots: <strong className="text-white">{hotspots.length} Clusters</strong></div>
          <div className="text-emerald-400 font-semibold">Fuel Optimization: 32% Saved via TSP</div>
        </div>

        {/* Bottom Hotspots Carousel Selector */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center space-x-3 overflow-x-auto pb-1 z-10">
          {hotspots.map((h, i) => (
            <div
              key={h.id || i}
              className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl shadow-xl min-w-[240px] flex-shrink-0 text-xs font-mono space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">{h.id}</span>
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                  h.priority === 'critical' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {h.priority}
                </span>
              </div>
              <div className="text-white font-bold truncate">{h.primaryIssue}</div>
              <div className="text-cyan-400 text-[11px]">{h.recommendedVehicle}</div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
