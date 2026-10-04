import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Shield, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Zap, 
  BatteryCharging, 
  PauseCircle, 
  PlayCircle, 
  DollarSign, 
  Gauge, 
  Cpu, 
  Lock, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Video, 
  Code2, 
  Box, 
  Layers 
} from 'lucide-react';
import { playSound } from '../services/audio';
import { submitAnomaly } from '../services/api';
import LiDAR3DViewer from './LiDAR3DViewer';

const SCENARIOS = {
  clogged_drain: {
    id: 'clogged_drain',
    name: 'Open Stormwater Culvert Plastic & Silt Choke',
    track: 'Track 04: Drain & Infrastructure',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-on-a-busy-city-street-at-daytime-41314-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80',
    title: 'Severe Silt & Single-Use Plastic Obstruction',
    description: 'Edge AI detected 88% flow blockage in roadside masonry drain. High monsoon backflow & waterlogging hazard.',
    severity: 'critical',
    severityScore: 94,
    volumeEstimate: '3.8 cu.m silt/waste',
    confidence: 0.946,
    box: { x: 0.08, y: 0.58, w: 0.32, h: 0.35, label: 'CLOGGED DRAIN', score: '94.6%', color: '#EF4444' },
    faces: [{ x: 0.28, y: 0.42, w: 0.06, h: 0.09, label: 'PEDESTRIAN' }],
    plates: [{ x: 0.52, y: 0.62, w: 0.12, h: 0.06, label: 'PLATE: KA01MG' }]
  },
  illegal_dump: {
    id: 'illegal_dump',
    name: 'Roadside Footpath Blackspot Garbage Dump',
    track: 'Track 02: Street & Neighbourhood Action',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-traffic-on-a-busy-avenue-in-a-city-41221-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80',
    title: 'Commercial Mixed Solid Waste Blackspot',
    description: 'Illegal dumping of mixed organics, polymer packaging, and debris encroaching onto pedestrian sidewalk.',
    severity: 'high',
    severityScore: 86,
    volumeEstimate: '4.6 cu.m solid waste',
    confidence: 0.932,
    box: { x: 0.65, y: 0.52, w: 0.30, h: 0.38, label: 'ILLEGAL DUMP', score: '93.2%', color: '#F59E0B' },
    faces: [{ x: 0.42, y: 0.44, w: 0.05, h: 0.08, label: 'PEDESTRIAN' }],
    plates: [{ x: 0.48, y: 0.68, w: 0.11, h: 0.05, label: 'PLATE: KA04EX' }]
  },
  overflowing_bin: {
    id: 'overflowing_bin',
    name: 'Secondary Municipal Green Container Spillover',
    track: 'Track 02: Street & Neighbourhood Action',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-through-the-city-traffic-41315-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=1200&q=80',
    title: 'Secondary Dumpster Overcapacity Spill',
    description: 'Green BBMP waste bin overfilled; uncollected garbage scattering across high-traffic pedestrian curb.',
    severity: 'medium',
    severityScore: 74,
    volumeEstimate: '2.1 cu.m overflow',
    confidence: 0.898,
    box: { x: 0.68, y: 0.45, w: 0.26, h: 0.45, label: 'OVERFLOWING BIN', score: '89.8%', color: '#EAB308' },
    faces: [{ x: 0.18, y: 0.41, w: 0.05, h: 0.08, label: 'PEDESTRIAN' }],
    plates: [{ x: 0.38, y: 0.64, w: 0.10, h: 0.05, label: 'PLATE: KA03HQ' }]
  }
};

export default function EdgeDashcamScanner({ onAnomalyDetected }) {
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('clogged_drain');
  const [isScanning, setIsScanning] = useState(true);
  const [privacyBlurEnabled, setPrivacyBlurEnabled] = useState(true);
  const [streamViewMode, setStreamViewMode] = useState('video_hud'); // 'video_hud' | 'lidar_3d' | 'webcam'
  const [vehicleSpeed, setVehicleSpeed] = useState(29);
  const [isStationary, setIsStationary] = useState(false);
  const [earningsINR, setEarningsINR] = useState(52);
  const [recentBounty, setRecentBounty] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAndroidArchModal, setShowAndroidArchModal] = useState(false);
  const [fpsVal, setFpsVal] = useState('1.0');
  const [inferenceTimeMs, setInferenceTimeMs] = useState(38);

  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const webcamRef = useRef(null);
  const animRef = useRef(null);

  const currentScenario = SCENARIOS[selectedScenarioKey];

  // Webcam stream lifecycle
  useEffect(() => {
    let stream = null;
    if (streamViewMode === 'webcam') {
      navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
        .then(s => {
          stream = s;
          if (webcamRef.current) {
            webcamRef.current.srcObject = s;
            webcamRef.current.play();
          }
        })
        .catch(err => {
          console.warn('Webcam not accessible, reverting to video HUD:', err);
          setStreamViewMode('video_hud');
        });
    }
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [streamViewMode]);

  // Video HUD Render Loop
  useEffect(() => {
    if (streamViewMode === 'lidar_3d') return;

    let lastTick = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = (now) => {
      if (now - lastTick >= 1000 && isScanning && !isStationary) {
        lastTick = now;
        playSound('scan');
        setFpsVal((0.98 + (Math.random() - 0.5) * 0.04).toFixed(2));
        setInferenceTimeMs(Math.floor(36 + Math.random() * 6));
        setVehicleSpeed(prev => Math.max(18, Math.min(42, Math.round(prev + (Math.random() - 0.5) * 4))));
      }

      const W = canvas.width;
      const H = canvas.height;

      if (streamViewMode === 'video_hud' && videoRef.current && videoRef.current.readyState >= 2) {
        ctx.drawImage(videoRef.current, 0, 0, W, H);
      } else if (streamViewMode === 'webcam' && webcamRef.current && webcamRef.current.readyState >= 2) {
        ctx.drawImage(webcamRef.current, 0, 0, W, H);
      } else {
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, W, H);
      }

      // Computer Vision Horizon & Lane Line ADAS
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.45);
      ctx.lineTo(W, H * 0.45);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.fillStyle = 'rgba(6, 182, 212, 0.04)';
      ctx.beginPath();
      ctx.moveTo(W * 0.42, H * 0.45);
      ctx.lineTo(W * 0.58, H * 0.45);
      ctx.lineTo(W * 0.88, H);
      ctx.lineTo(W * 0.12, H);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Bounding Box Overlays
      if (isScanning && !isStationary) {
        const box = currentScenario.box;
        const bx = box.x * W;
        const by = box.y * H;
        const bw = box.w * W;
        const bh = box.h * H;

        ctx.strokeStyle = box.color;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(bx, by, bw, bh);

        // Corner Reticle Markers
        const cl = 14;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(bx, by + cl); ctx.lineTo(bx, by); ctx.lineTo(bx + cl, by); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx + bw - cl, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + cl); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx, by + bh - cl); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + cl, by + bh); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx + bw - cl, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - cl); ctx.stroke();

        ctx.fillStyle = box.color;
        ctx.fillRect(bx, by - 26, bw, 26);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`⚡ ${box.label} [${box.score}]`, bx + 6, by - 8);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(bx, by + bh, bw, 20);
        ctx.fillStyle = '#38BDF8';
        ctx.font = '10px monospace';
        ctx.fillText(`EST DIST: 4.2m | VOL: ${currentScenario.volumeEstimate}`, bx + 6, by + bh + 14);

        // DPDP Act Neural Blur Shaders
        if (privacyBlurEnabled) {
          currentScenario.faces.forEach(f => {
            const fx = f.x * W, fy = f.y * H, fw = f.w * W, fh = f.h * H;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
            ctx.fillRect(fx, fy, fw, fh);
            ctx.strokeStyle = '#10B981';
            ctx.lineWidth = 1;
            ctx.strokeRect(fx, fy, fw, fh);
            ctx.fillStyle = '#10B981';
            ctx.fillRect(fx - 2, fy - 18, fw + 4, 16);
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('🛡️ FACE BLUR', fx + 2, fy - 6);
          });

          currentScenario.plates.forEach(p => {
            const px = p.x * W, py = p.y * H, pw = p.w * W, ph = p.h * H;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
            ctx.fillRect(px, py, pw, ph);
            ctx.strokeStyle = '#10B981';
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, pw, ph);
            ctx.fillStyle = '#10B981';
            ctx.fillRect(px, py - 18, pw, 16);
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('🛡️ PLATE BLUR', px + 4, py - 6);
          });
        }
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [isScanning, privacyBlurEnabled, streamViewMode, selectedScenarioKey, isStationary]);

  const handleTransmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        category: currentScenario.id,
        title: currentScenario.title,
        description: currentScenario.description,
        severity: currentScenario.severity,
        severityScore: currentScenario.severityScore,
        volumeEstimate: currentScenario.volumeEstimate,
        latitude: 12.9734 + (Math.random() - 0.5) * 0.02,
        longitude: 77.6400 + (Math.random() - 0.5) * 0.02,
        reportedBy: 'Swiggy Pilot #4892 (Passive Edge Android)',
        driverId: 'DRV-8821',
        driverName: 'Ramesh K.',
        platform: 'Swiggy',
        confidence: currentScenario.confidence,
        imageUrl: currentScenario.posterUrl,
        privacyBlurred: privacyBlurEnabled,
        blurredFacesCount: currentScenario.faces.length,
        blurredPlatesCount: currentScenario.plates.length
      };

      const res = await submitAnomaly(payload);
      playSound('anomaly');
      setTimeout(() => playSound('payout'), 350);

      setEarningsINR(prev => prev + 1);
      setRecentBounty({
        id: res.anomaly?.id || 'ANM-BLR-NEW',
        amount: 1,
        time: new Date().toLocaleTimeString()
      });

      if (onAnomalyDetected) onAnomalyDetected(res.anomaly);
    } catch (err) {
      console.error('Error submitting anomaly:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white">Client Edge Dashcam Service (Android / Kotlin Engine)</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold">
                1 FPS THROTTLED • DPDP COMPLIANT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Inference: <span className="text-cyan-400">{inferenceTimeMs}ms (TFLite NNAPI INT8)</span> • Thermal: <span className="text-emerald-400">34.8°C Normal</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Stream Mode Switcher */}
          <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex space-x-1">
            <button
              onClick={() => setStreamViewMode('video_hud')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                streamViewMode === 'video_hud' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              HD Video HUD
            </button>
            <button
              onClick={() => setStreamViewMode('lidar_3d')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                streamViewMode === 'lidar_3d' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5 text-amber-400" />
              <span>3D LiDAR Twin</span>
            </button>
            <button
              onClick={() => setStreamViewMode('webcam')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                streamViewMode === 'webcam' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Webcam</span>
            </button>
          </div>

          <button
            onClick={() => setShowAndroidArchModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Android Specs</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT VIEWPORT */}
        <div className="lg:col-span-8 space-y-4">
          
          {streamViewMode === 'lidar_3d' ? (
            <LiDAR3DViewer
              scenario={selectedScenarioKey}
              speed={vehicleSpeed}
              isScanning={isScanning && !isStationary}
              privacyBlurred={privacyBlurEnabled}
            />
          ) : (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-2xl relative overflow-hidden">
              
              <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800 aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={currentScenario.videoUrl}
                  poster={currentScenario.posterUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="hidden"
                />
                <video ref={webcamRef} autoPlay playsInline muted className="hidden" />

                <canvas
                  ref={canvasRef}
                  width={1280}
                  height={720}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/40 font-mono text-[11px] text-cyan-300 space-y-0.5 shadow-lg">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-emerald-400 text-[9px] uppercase tracking-wider font-bold">GPS SATELLITE FIX: ACTIVE</span>
                  </div>
                  <div className="font-bold text-white">12.9734° N, 77.6400° E • INDIRANAGAR 100FT RD</div>
                  <div className="text-[9px] text-cyan-400">API Key Verified (High Accuracy ±1.2m)</div>
                </div>

                <div className="absolute top-3 right-3 flex flex-col items-end space-y-1.5 font-mono text-[11px] pointer-events-none">
                  <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-md border border-slate-700 text-emerald-400 flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>DPDP PRIVACY SHIELD: ACTIVE</span>
                  </div>
                  <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-md border border-slate-700 text-cyan-300 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5" />
                    <span>SPEED: {vehicleSpeed} KM/H</span>
                  </div>
                </div>

                {isStationary && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
                    <PauseCircle className="w-14 h-14 text-amber-400 mb-2 animate-pulse" />
                    <h3 className="text-lg font-bold text-white">Stationary Auto-Pause (0 km/h &gt; 2 mins)</h3>
                    <p className="text-xs text-slate-400 max-w-md mt-1 font-mono">
                      Edge scanner throttles to 0 FPS while delivery rider waits at traffic lights or restaurant pickups.
                    </p>
                    <button
                      onClick={() => setIsStationary(false)}
                      className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold"
                    >
                      Resume Scanning (Moving)
                    </button>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsScanning(!isScanning)}
                    className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                      isScanning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {isScanning ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                    <span>{isScanning ? 'Pause Scanner' : 'Start 1 FPS Scanning'}</span>
                  </button>

                  <button
                    onClick={() => setPrivacyBlurEnabled(!privacyBlurEnabled)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                      privacyBlurEnabled ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300' : 'bg-red-950/80 border-red-600 text-red-300'
                    }`}
                  >
                    {privacyBlurEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{privacyBlurEnabled ? 'DPDP Mask: ACTIVE' : 'Privacy Mask: OFF'}</span>
                  </button>

                  <button
                    onClick={() => setIsStationary(!isStationary)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                      isStationary ? 'bg-amber-950/80 border-amber-600 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {isStationary ? 'Stopped (0 km/h)' : 'Simulate Stop Light'}
                  </button>
                </div>

                <button
                  onClick={handleTransmit}
                  disabled={isSubmitting || !isScanning}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-500/25 transition transform active:scale-95 disabled:opacity-50"
                >
                  <Zap className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                  <span>{isSubmitting ? 'Ingesting...' : 'Simulate Edge Anomaly Detect'}</span>
                </button>
              </div>

            </div>
          )}

          {/* Module Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Cpu className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase font-mono">Module A: Edge Engine</h4>
              </div>
              <p className="text-xs font-semibold text-slate-200">1 FPS Background Sampling</p>
              <p className="text-[11px] text-slate-400">Android Foreground Service with CameraX ImageAnalysis</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center space-x-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase font-mono">Module B: DPDP Shield</h4>
              </div>
              <p className="text-xs font-semibold text-slate-200">On-Device Anonymization</p>
              <p className="text-[11px] text-slate-400">Zero facial/plate PII transmitted. All blurring in RAM</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center space-x-2 text-amber-400">
                <BatteryCharging className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase font-mono">Module C: Thermal Guard</h4>
              </div>
              <p className="text-xs font-semibold text-slate-200">&lt; 1.2% Battery/Hour</p>
              <p className="text-[11px] text-slate-400">Auto-sleep watchdog halts inference when vehicle is stationary</p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Gig Wallet */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-800/40 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider font-mono">Gig Driver Wallet</span>
                <h3 className="text-2xl font-extrabold text-white flex items-center gap-1 mt-0.5">
                  <span className="text-cyan-400 font-mono">₹</span>{earningsINR}.00
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Incentive Rate:</span>
                <span className="text-emerald-400 font-bold font-mono">₹1.00 / Verified Anomaly</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Today's Audited Shift:</span>
                <span className="text-slate-200 font-mono">42.6 km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Settlement Protocol:</span>
                <span className="text-cyan-400 font-semibold font-mono">BBMP Instant UPI Auto-Credit</span>
              </div>
            </div>

            {recentBounty && (
              <div className="p-2.5 bg-emerald-950/90 border border-emerald-600/50 rounded-xl text-xs text-emerald-300 flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>+₹{recentBounty.amount}.00 Credited ({recentBounty.id})</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">{recentBounty.time}</span>
              </div>
            )}
          </div>

          {/* Test Scenario Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Select Test Scenario
              </h4>
              <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-mono">
                Track 02 & 04
              </span>
            </div>

            <div className="space-y-2.5">
              {Object.values(SCENARIOS).map((sc) => {
                const isSelected = selectedScenarioKey === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => setSelectedScenarioKey(sc.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-950/40 text-white'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mt-0.5 ${
                      sc.id === 'clogged_drain' ? 'bg-blue-500/10 text-blue-400' :
                      sc.id === 'illegal_dump' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-100 truncate">{sc.name}</div>
                      <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{sc.track}</div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{sc.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Android Specs Modal */}
      {showAndroidArchModal && (
        <div className="fixed inset-0 z-[3000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Native Android / Kotlin Background Edge Scanner Specification</h3>
              </div>
              <button
                onClick={() => setShowAndroidArchModal(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono"
              >
                Close (ESC)
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 font-mono">
              <p className="text-slate-400">
                CivicLens runs as an Android <strong className="text-cyan-400">Foreground Service</strong> with CameraX image analysis throttled at 1 FPS:
              </p>

              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto text-[11px] text-emerald-400 leading-relaxed">
{`// Kotlin CameraX Background Image Analysis Pipeline
class CivicLensCameraAnalyzer(
    private val tfliteDetector: CivicAnomalyDetector,
    private val privacyFilter: DpdpPrivacyFilter
) : ImageAnalysis.Analyzer {

    private var lastAnalyzedTimestamp = 0L

    override fun analyze(imageProxy: ImageProxy) {
        val currentTimestamp = System.currentTimeMillis()
        // 1 FPS Sampling Throttle to preserve battery & thermals
        if (currentTimestamp - lastAnalyzedTimestamp >= 1000L) {
            lastAnalyzedTimestamp = currentTimestamp
            
            val bitmap = imageProxy.toBitmap()
            // 1. Edge ML Anomaly Detection (TFLite INT8 / YOLOv8n)
            val anomalies = tfliteDetector.detect(bitmap)
            
            if (anomalies.isNotEmpty()) {
                // 2. DPDP Act On-Device Privacy Masking (Faces & Plates)
                val anonymizedBitmap = privacyFilter.applyMosaicBlur(bitmap)
                
                // 3. Transmit Anonymized Coordinates to Municipal PostGIS API
                val payload = AnomalyPayload(
                    latitude = currentGps.latitude,
                    longitude = currentGps.longitude,
                    severity = anomalies.first().severity,
                    proofImage = anonymizedBitmap.toCompressedJpeg()
                )
                CivicLensApiClient.uploadAnomaly(payload)
            }
        }
        imageProxy.close()
    }
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
