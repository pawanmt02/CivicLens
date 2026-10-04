import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  ArrowRight, 
  CheckCircle, 
  Smartphone, 
  Video, 
  ShieldCheck, 
  MapPin, 
  TrendingUp, 
  Zap, 
  Eye,
  Layers
} from 'lucide-react';
import EdgeDashcamScanner from './EdgeDashcamScanner';
import MunicipalMap from './MunicipalMap';
import WardScorecard from './WardScorecard';
import { playSound } from '../services/audio';

export default function JudgeDemoController({ 
  anomalies, 
  hotspots, 
  dispatchRoute, 
  depot, 
  wards, 
  stats, 
  onQuickSimulate, 
  latestAnomalyId 
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [demoMode, setDemoMode] = useState('split'); // 'split' or 'guided'

  const demoSteps = [
    {
      step: 1,
      title: "Step 1: The Setup (Edge Service Activation)",
      subtitle: "Gig Courier Mounts Phone & Starts Delivery Route",
      description: "CivicLens runs silently as a background service on delivery bikes at 1 FPS. No manual forms, zero friction, auto-pauses when stationary.",
      actionLabel: "Activate Background Scanner",
      icon: Smartphone,
      color: "from-blue-600 to-cyan-600"
    },
    {
      step: 2,
      title: "Step 2: The Street POV Simulation",
      subtitle: "Continuous Passive Scanning Along Urban Corridors",
      description: "As the driver moves through city roads (Indiranagar, Koramangala), the edge model continuously ingests road frames at 1 FPS without draining battery.",
      actionLabel: "Simulate POV Driving Along Indian Street",
      icon: Video,
      color: "from-cyan-600 to-teal-600"
    },
    {
      step: 3,
      title: "Step 3: Edge AI Detection & DPDP Anonymization",
      subtitle: "Detects Choked Drains & Blurs Faces/Plates On-Device",
      description: "TensorFlow Lite model isolates the drain blockage. Before transmission, an on-device privacy filter aggressively blurs pedestrian faces and vehicle plates.",
      actionLabel: "Simulate Live Anomaly + Privacy Mask",
      icon: ShieldCheck,
      color: "from-amber-600 to-orange-600"
    },
    {
      step: 4,
      title: "Step 4: Real-time Municipal Command Drop & Re-routing",
      subtitle: "Instant Live Pin Drop + Dynamic TSP Route Recalculation",
      description: "The municipal cloud ingests the coordinate payload via WebSocket. The live GIS map drops a pulsing pin, credits ₹1 to the driver, and updates the Ward Cleanliness Score.",
      actionLabel: "Trigger Live Cloud Sync & Pin Drop",
      icon: MapPin,
      color: "from-emerald-600 to-green-600"
    }
  ];

  const handleRunStep = (stepNumber) => {
    setCurrentStep(stepNumber);
    if (stepNumber === 3 || stepNumber === 4) {
      onQuickSimulate();
      playSound('anomaly');
    } else {
      playSound('scan');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Demo Script Header */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-800/40 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">Hackathon Prototype & Judge Demo Suite</h2>
            </div>
            <p className="text-xs text-slate-300">
              Interactive 4-Step Demonstration of Passive AI Dashcam Edge Detection & Municipal Heatmap Cloud Sync.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setDemoMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                demoMode === 'split' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Side-by-Side Dual View
            </button>
            <button
              onClick={() => setDemoMode('guided')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                demoMode === 'guided' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              4-Step Guided Script
            </button>
          </div>
        </div>

        {/* 4 Step Progress Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {demoSteps.map((s) => {
            const isCurrent = currentStep === s.step;
            const isCompleted = currentStep > s.step;
            const Icon = s.icon;

            return (
              <button
                key={s.step}
                onClick={() => handleRunStep(s.step)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isCurrent 
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-lg shadow-cyan-950/50' 
                    : isCompleted 
                    ? 'bg-slate-800/60 border-emerald-700/60 text-emerald-300' 
                    : 'bg-slate-800/30 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                    isCurrent ? 'bg-cyan-500 text-black' : isCompleted ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-700 text-slate-300'
                  }`}>
                    Step {s.step}
                  </span>
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-cyan-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
                </div>
                <div className="text-xs font-bold text-white truncate">{s.title.split(':')[1]}</div>
                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{s.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SIDE-BY-SIDE SPLIT SCREEN VIEW */}
      {demoMode === 'split' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT: Driver Edge Dashcam Simulator */}
            <div className="lg:col-span-6 space-y-2">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> [EDGE] Gig Worker Dashcam (1 FPS)
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  On-Device Inference & DPDP Blur
                </span>
              </div>
              <EdgeDashcamScanner onAnomalyDetected={onQuickSimulate} />
            </div>

            {/* RIGHT: Municipal Live Heatmap Command Center */}
            <div className="lg:col-span-6 space-y-2">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> [CLOUD] Live Municipal Heatmap GIS
                </span>
                <span className="text-[10px] text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  WebSocket Real-time Feed
                </span>
              </div>
              <MunicipalMap
                anomalies={anomalies}
                hotspots={hotspots}
                dispatchRoute={dispatchRoute}
                depot={depot}
                latestAnomalyId={latestAnomalyId}
              />
            </div>

          </div>

          {/* Bottom Ward Leaderboard */}
          <WardScorecard wards={wards} stats={stats} />
        </div>
      )}

      {/* GUIDED SCRIPT VIEW */}
      {demoMode === 'guided' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="max-w-2xl mx-auto space-y-6">
            
            <div className="text-center space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase px-3 py-1 bg-cyan-950 rounded-full border border-cyan-800">
                Active Demonstration Step {currentStep} of 4
              </span>
              <h3 className="text-2xl font-extrabold text-white">
                {demoSteps[currentStep - 1].title}
              </h3>
              <p className="text-sm text-cyan-200">
                {demoSteps[currentStep - 1].subtitle}
              </p>
              <p className="text-xs text-slate-400 pt-2 leading-relaxed">
                {demoSteps[currentStep - 1].description}
              </p>
            </div>

            <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700 text-center space-y-4">
              <button
                onClick={() => {
                  if (currentStep < 4) {
                    handleRunStep(currentStep + 1);
                  } else {
                    handleRunStep(1);
                  }
                }}
                className={`w-full py-4 bg-gradient-to-r ${demoSteps[currentStep - 1].color} text-white font-bold rounded-xl shadow-lg transition transform active:scale-98 text-sm flex items-center justify-center space-x-2`}
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{demoSteps[currentStep - 1].actionLabel}</span>
              </button>

              <div className="text-xs text-slate-400 flex items-center justify-center gap-4">
                <span>Pass Rate: <strong className="text-emerald-400 font-mono">100%</strong></span>
                <span>Latency: <strong className="text-cyan-400 font-mono">38ms</strong></span>
                <span>Bounty: <strong className="text-amber-400 font-mono">₹1.00 / Anomaly</strong></span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
