import React from 'react';
import { 
  Sparkles, 
  Smartphone, 
  Video, 
  ShieldCheck, 
  MapPin, 
  Truck, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight, 
  Code2, 
  Layers, 
  Activity,
  Droplets,
  Trash2
} from 'lucide-react';
import JudgeDemoController from '../components/JudgeDemoController';

export default function ExecutivePDRPage({ 
  anomalies = [], 
  hotspots = [], 
  dispatchRoute = null, 
  depot, 
  wards = [], 
  stats = {}, 
  latestAnomalyId = null,
  onQuickSimulate,
  onNavigateTab 
}) {
  return (
    <div className="space-y-10 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Executive Hero Banner */}
      <div className="relative depth-z2 rounded-3xl p-8 md:p-10 overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
                Product Design Report (PDR)
              </span>
              <span className="px-3.5 py-1 rounded-full bg-blue-950 border border-blue-700 text-blue-300 font-mono text-xs font-bold">
                Track 02 & Track 04
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              CivicLens: Passive AI Dashcam & Municipal Heatmap
            </h1>
            <p className="text-sm md:text-base text-slate-300 font-sans leading-relaxed">
              Transforming urban governance by shifting from active citizen reporting to passive street auditing. Piggybacking on millions of gig delivery kilometers at 1 FPS to automatically map clogged drains, illegal garbage dumps, and overflowing bins in real-time.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onQuickSimulate}
              className="px-6 py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-2xl text-xs font-bold font-mono shadow-xl shadow-red-500/25 transition transform active:scale-95 spring-press flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate Live Anomaly Ingestion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dual Track Value Proposition Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Track 04 Card */}
        <div className="depth-z1 rounded-3xl p-6 space-y-4 hover:border-blue-700/60 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-blue-400">Target Track 04</span>
                <h3 className="text-lg font-bold text-white">Drain & Infrastructure Maintenance</h3>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Detects choked stormwater masonry culverts, plastic dams, and silt build-up before the monsoon arrives, preventing catastrophic urban waterlogging and mosquito-borne epidemics.
          </p>
          <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs font-mono text-slate-400">
            <span>Primary Target: <strong className="text-white">Stormwater Drains</strong></span>
            <button
              onClick={() => onNavigateTab('scanner')}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 spring-press"
            >
              Inspect Model ➔
            </button>
          </div>
        </div>

        {/* Track 02 Card */}
        <div className="depth-z1 rounded-3xl p-6 space-y-4 hover:border-amber-700/60 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400">Target Track 02</span>
                <h3 className="text-lg font-bold text-white">Street & Neighbourhood Action</h3>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Eliminates chronic footpath blackspots and commercial garbage accumulation. Replaces static sweeping schedules with automated demand-responsive collection routes.
          </p>
          <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs font-mono text-slate-400">
            <span>Primary Target: <strong className="text-white">Illegal Solid Waste</strong></span>
            <button
              onClick={() => onNavigateTab('map')}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 spring-press"
            >
              View GIS Map ➔
            </button>
          </div>
        </div>

      </div>

      {/* 4-Step Hackathon Judge Demo Suite Component */}
      <div className="depth-z1 rounded-3xl p-6 md:p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Hackathon Prototype Scope & Judge Demo Script
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Execute the official 4-step indoor evaluation flow from the Product Design Report.
          </p>
        </div>

        <JudgeDemoController
          anomalies={anomalies}
          hotspots={hotspots}
          dispatchRoute={dispatchRoute}
          depot={depot}
          wards={wards}
          stats={stats}
          onQuickSimulate={onQuickSimulate}
          latestAnomalyId={latestAnomalyId}
        />
      </div>

    </div>
  );
}
