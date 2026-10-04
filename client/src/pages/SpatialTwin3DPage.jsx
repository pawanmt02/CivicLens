import React from 'react';
import { 
  Box, 
  Building2, 
  Navigation, 
  Sparkles, 
  RotateCw, 
  Compass, 
  Layers, 
  Truck, 
  Zap, 
  ShieldAlert 
} from 'lucide-react';
import Municipal3DCommand from '../components/Municipal3DCommand';

export default function SpatialTwin3DPage({ 
  hotspots = [], 
  dispatchRoute = null, 
  depot, 
  wards = [], 
  stats = {} 
}) {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-800/40 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                WebGL 3D Engine
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-400 font-mono text-xs font-bold">
                VOLUMETRIC HEIGHT = ACCUMULATION VOLUME (CU.M)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              3D Spatial Digital Twin & Fleet Telematics
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
              Interactive 3D volumetric extrusion of urban sanitation hotspots. Real-time visual tracking of municipal compaction and silt suction vehicles navigating dynamic TSP collection splines.
            </p>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs text-slate-400 bg-slate-800/60 px-4 py-2.5 rounded-2xl border border-slate-700">
            <span>Orbital Camera: <strong className="text-cyan-400">Cinematic 360°</strong></span>
            <span>•</span>
            <span>Elevation: <strong className="text-emerald-400">45° Slant</strong></span>
          </div>
        </div>
      </div>

      {/* Main 3D WebGL Digital Twin Workstation */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 shadow-2xl space-y-4">
        <Municipal3DCommand
          hotspots={hotspots}
          dispatchRoute={dispatchRoute}
          depot={depot}
        />
      </div>

      {/* 3D Telematics Spec Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs font-bold uppercase">
            <Layers className="w-4 h-4" />
            <span>Volumetric Extrusion</span>
          </div>
          <h3 className="text-lg font-bold text-white">Severity-Weighted Geometry</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The height of each 3D cylinder correlates directly with calculated waste volume (cu.m) and drain silt obstruction metrics in real-time.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold uppercase">
            <Truck className="w-4 h-4" />
            <span>3D Fleet Telematics</span>
          </div>
          <h3 className="text-lg font-bold text-white">Dynamic Spline Navigation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Collection compactors and silt extractors follow mathematical Catmull-Rom spline curves calculated via Travelling Salesperson algorithms.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase">
            <Zap className="w-4 h-4" />
            <span>Shockwave Resonance</span>
          </div>
          <h3 className="text-lg font-bold text-white">Real-Time Acoustic Waves</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Dynamic ground shockwave rings pulse at frequency proportional to reporting frequency over the preceding 24 hours.
          </p>
        </div>

      </div>

    </div>
  );
}
