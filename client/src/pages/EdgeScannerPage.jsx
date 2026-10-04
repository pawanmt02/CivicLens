import React, { useState } from 'react';
import { 
  Camera, 
  Box, 
  ShieldCheck, 
  Gauge, 
  Cpu, 
  BatteryCharging, 
  DollarSign, 
  AlertTriangle, 
  Zap, 
  Code2, 
  Video, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle, 
  Eye, 
  EyeOff,
  Radio,
  Sliders,
  Sparkles,
  Layers
} from 'lucide-react';
import LiDAR3DViewer from '../components/LiDAR3DViewer';
import { playSound } from '../services/audio';
import { submitAnomaly } from '../services/api';

const SCENARIOS = {
  clogged_drain: {
    id: 'clogged_drain',
    name: 'Open Stormwater Culvert Plastic & Silt Choke',
    track: 'Track 04: Drain & Infrastructure Maintenance',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-on-a-busy-city-street-at-daytime-41314-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80',
    title: 'Severe Silt & Single-Use Plastic Obstruction',
    description: 'Edge AI detected 88% flow blockage in roadside masonry drain culvert. High monsoon backflow & urban waterlogging hazard.',
    severity: 'critical',
    severityScore: 94,
    volumeEstimate: '3.8 cu.m silt/waste',
    confidence: 0.946,
    box: { x: 0.08, y: 0.58, w: 0.32, h: 0.35, label: 'CLOGGED DRAIN', score: '94.6%', color: '#EF4444' },
    faces: [{ x: 0.28, y: 0.42, w: 0.06, h: 0.09 }],
    plates: [{ x: 0.52, y: 0.62, w: 0.12, h: 0.06 }]
  },
  illegal_dump: {
    id: 'illegal_dump',
    name: 'Roadside Footpath Blackspot Garbage Dump',
    track: 'Track 02: Street & Neighbourhood Action',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-traffic-on-a-busy-avenue-in-a-city-41221-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80',
    title: 'Commercial Mixed Solid Waste Blackspot',
    description: 'Illegal dumping of mixed organics, polymer packaging, and construction debris encroaching onto pedestrian sidewalk.',
    severity: 'high',
    severityScore: 86,
    volumeEstimate: '4.6 cu.m solid waste',
    confidence: 0.932,
    box: { x: 0.65, y: 0.52, w: 0.30, h: 0.38, label: 'ILLEGAL DUMP', score: '93.2%', color: '#F59E0B' },
    faces: [{ x: 0.42, y: 0.44, w: 0.05, h: 0.08 }],
    plates: [{ x: 0.48, y: 0.68, w: 0.11, h: 0.05 }]
  },
  overflowing_bin: {
    id: 'overflowing_bin',
    name: 'Secondary Municipal Green Container Spillover',
    track: 'Track 02: Street & Neighbourhood Action',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-through-the-city-traffic-41315-large.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&w=1200&q=80',
    title: 'Secondary Dumpster Overcapacity Spill',
    description: 'Green BBMP waste container overfilled; uncollected garbage scattering across high-traffic pedestrian curb.',
    severity: 'medium',
    severityScore: 74,
    volumeEstimate: '2.1 cu.m overflow',
    confidence: 0.898,
    box: { x: 0.68, y: 0.45, w: 0.26, h: 0.45, label: 'OVERFLOWING BIN', score: '89.8%', color: '#EAB308' },
    faces: [{ x: 0.18, y: 0.41, w: 0.05, h: 0.08 }],
    plates: [{ x: 0.38, y: 0.64, w: 0.10, h: 0.05 }]
  }
};

export default function EdgeScannerPage({ onAnomalyDetected }) {
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('clogged_drain');
  const [viewMode, setViewMode] = useState('lidar_3d'); // 'lidar_3d' | 'video_hud' | 'webcam'
  const [isScanning, setIsScanning] = useState(true);
  const [privacyBlurEnabled, setPrivacyBlurEnabled] = useState(true);
  const [vehicleSpeed, setVehicleSpeed] = useState(28);
  const [isStationary, setIsStationary] = useState(false);
  const [earningsINR, setEarningsINR] = useState(52);
  const [recentBounty, setRecentBounty] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAndroidArchModal, setShowAndroidArchModal] = useState(false);
  const [fpsVal, setFpsVal] = useState('1.0');
  const [inferenceTimeMs, setInferenceTimeMs] = useState(38);

  const currentScenario = SCENARIOS[selectedScenarioKey];

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
    <div className="space-y-10 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="relative bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-800/40 rounded-3xl p-8 md:p-10 shadow-2xl overflow-hidden depth-z2">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="px-3.5 py-1.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                Module A & B Edge Workstation
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 font-mono text-xs font-bold">
                1 FPS THROTTLED • DPDP ACT COMPLIANT
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Passive Edge Dashcam & 3D LiDAR Vision
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
              Continuous background street scanning on gig delivery smartphones. Automatically classifies road infrastructure anomalies at 1 FPS while applying on-device neural privacy blur to all pedestrian faces and vehicle plates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAndroidArchModal(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-200 transition shadow-md flex items-center gap-2 spring-press"
            >
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>Native Android Architecture</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Viewport Controls & Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* Main 3D Viewport (8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="depth-z1 rounded-3xl border border-slate-800 p-4 shadow-2xl space-y-4">
            
            {/* Viewport Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs font-mono">
              <div className="flex items-center space-x-3">
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/80 border border-red-800 text-red-400 rounded-lg font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  1.0 FPS SCAN
                </span>
                <span className="text-slate-400">NNAPI: <strong className="text-cyan-400">{inferenceTimeMs}ms</strong></span>
                <span className="text-slate-400">THERMAL: <strong className="text-emerald-400">34.8°C NORMAL</strong></span>
              </div>

              {/* View Switcher */}
              <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex space-x-1">
                <button
                  onClick={() => setViewMode('lidar_3d')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 spring-press ${
                    viewMode === 'lidar_3d' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Box className="w-3.5 h-3.5 text-amber-300" />
                  <span>3D LiDAR Twin</span>
                </button>
                <button
                  onClick={() => setViewMode('video_hud')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition spring-press ${
                    viewMode === 'video_hud' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  HD Street Video
                </button>
                <button
                  onClick={() => setViewMode('webcam')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 spring-press ${
                    viewMode === 'webcam' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Live Device Cam</span>
                </button>
              </div>
            </div>

            {/* Floating Anomaly Detection Badge */}
            {isScanning && !isStationary && (
              <div className="flex items-center justify-center py-2">
                <div className="gooey-subtle inline-flex items-center space-x-2 px-4 py-2 depth-z2 rounded-full text-xs font-mono font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-emerald-300">SCANNING FRAME #{Math.floor(Date.now() / 1000) % 999}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-cyan-300">{currentScenario.confidence * 100}% CONF</span>
                </div>
              </div>
            )}

            {/* 3D Canvas / Video Container */}
            {viewMode === 'lidar_3d' ? (
              <LiDAR3DViewer
                scenario={selectedScenarioKey}
                speed={vehicleSpeed}
                isScanning={isScanning && !isStationary}
                privacyBlurred={privacyBlurEnabled}
              />
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video flex items-center justify-center shadow-inner">
                <video
                  src={currentScenario.videoUrl}
                  poster={currentScenario.posterUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* 3D Overlay Tag */}
                <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-cyan-500/40 font-mono text-xs text-cyan-300 space-y-1 shadow-lg shadow-cyan-950/50">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">GPS SATELLITE LOCK: ACTIVE</span>
                  </div>
                  <div className="font-bold text-white">12.9734° N, 77.6400° E • Indiranagar 100ft Rd</div>
                  <div className="text-[10px] text-cyan-400 font-mono">API Key Auth: Verified (±1.2m Precision)</div>
                </div>

                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 font-mono text-xs text-emerald-400 flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>DPDP NEURAL PRIVACY MASK: ON</span>
                </div>
              </div>
            )}

            {/* Workstation Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsScanning(!isScanning)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono transition flex items-center gap-2 spring-press ${
                    isScanning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isScanning ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                  <span>{isScanning ? 'Pause 1 FPS Scanner' : 'Start 1 FPS Scanning'}</span>
                </button>

                <button
                  onClick={() => setPrivacyBlurEnabled(!privacyBlurEnabled)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold font-mono transition flex items-center gap-2 border spring-press ${
                    privacyBlurEnabled ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300' : 'bg-red-950/80 border-red-600 text-red-300'
                  }`}
                >
                  {privacyBlurEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{privacyBlurEnabled ? 'DPDP Mask: ACTIVE' : 'Privacy Mask: OFF'}</span>
                </button>

                <button
                  onClick={() => setIsStationary(!isStationary)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold font-mono transition border spring-press ${
                    isStationary ? 'bg-amber-950/80 border-amber-600 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {isStationary ? 'Speed: 0 km/h (Halt)' : 'Simulate Stop Light'}
                </button>
              </div>

              <button
                onClick={handleTransmit}
                disabled={isSubmitting || !isScanning}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold font-mono shadow-lg shadow-red-500/25 transition transform active:scale-95 disabled:opacity-50 flex items-center gap-2 spring-press"
              >
                <Zap className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                <span>{isSubmitting ? 'Syncing to Cloud...' : 'Simulate Edge Anomaly Detect'}</span>
              </button>
            </div>

          </div>

          {/* 3D Architectural Spec Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="depth-z1 p-4 rounded-2xl space-y-1">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Cpu className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase font-mono">Module A: Edge AI</h4>
              </div>
              <p className="text-xs font-semibold text-slate-200">1 FPS Background Sampling</p>
              <p className="text-[11px] text-slate-400">CameraX ImageAnalysis throttled to preserve battery life</p>
            </div>

            <div className="depth-z1 p-4 rounded-2xl space-y-1">
              <div className="flex items-center space-x-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase font-mono">Module B: DPDP Shield</h4>
              </div>
              <p className="text-xs font-semibold text-slate-200">On-Device RAM Anonymization</p>
              <p className="text-[11px] text-slate-400">0 PII leaves the smartphone; all faces & plates blurred locally</p>
            </div>

            <div className="depth-z1 p-4 rounded-2xl space-y-1">
              <div className="flex items-center space-x-2 text-amber-400">
                <BatteryCharging className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase font-mono">Module C: Thermal Guard</h4>
              </div>
              <p className="text-xs font-semibold text-slate-200">&lt; 1.2% Battery / Hour</p>
              <p className="text-[11px] text-slate-400">Auto-sleep watchdog halts inference when stationary &gt; 2 mins</p>
            </div>
          </div>

        </div>

        {/* Right Sidebar (4 Columns): Scenario Selector & Gig Worker Wallet */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Gig Worker Wallet Card */}
          <div className="depth-z2 border border-cyan-800/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider font-mono">Gig Driver Wallet</span>
                <h3 className="text-3xl font-extrabold text-white flex items-center gap-1 mt-1">
                  <span className="text-cyan-400 font-mono">₹</span>{earningsINR}.00
                </h3>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                <DollarSign className="w-7 h-7" />
              </div>
            </div>

            <div className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Incentive Bounty:</span>
                <span className="text-emerald-400 font-bold font-mono">₹1.00 / Verified Anomaly</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Today's Shift Distance:</span>
                <span className="text-slate-200 font-mono">42.6 km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payout Settlement:</span>
                <span className="text-cyan-400 font-semibold font-mono">Instant BBMP UPI Auto-Credit</span>
              </div>
            </div>

            {recentBounty && (
              <div className="p-3 depth-inset rounded-xl text-xs text-emerald-300 flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>+₹{recentBounty.amount}.00 Credited ({recentBounty.id})</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">{recentBounty.time}</span>
              </div>
            )}
          </div>

          {/* Test Scenario Selector */}
          <div className="depth-z1 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Select Anomaly Scenario
              </h4>
              <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 font-mono">
                PDR Presets
              </span>
            </div>

            <div className="space-y-3">
              {Object.values(SCENARIOS).map((sc) => {
                const isSelected = selectedScenarioKey === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => setSelectedScenarioKey(sc.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start space-x-3.5 spring-press ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 shadow-lg shadow-cyan-950/40 text-white'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl mt-0.5 ${
                      sc.id === 'clogged_drain' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      sc.id === 'illegal_dump' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-100">{sc.name}</div>
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

      {/* Android Native Architecture Modal */}
      {showAndroidArchModal && (
        <div className="fixed inset-0 z-[3000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Native Android / Kotlin Background Edge Scanner Specification</h3>
              </div>
              <button
                onClick={() => setShowAndroidArchModal(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono spring-press"
              >
                Close (ESC)
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 font-mono">
              <p className="text-slate-400">
                CivicLens executes as an Android <strong className="text-cyan-400">Foreground Service</strong> with CameraX image analysis throttled at 1 FPS:
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
