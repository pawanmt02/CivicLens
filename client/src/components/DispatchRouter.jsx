import React, { useState } from 'react';
import { 
  Truck, 
  Navigation, 
  Fuel, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Send, 
  Layers,
  Sparkles
} from 'lucide-react';
import { playSound } from '../services/audio';

export default function DispatchRouter({ dispatchRoute, onDispatchSuccess }) {
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  const handleDispatch = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setDispatchedSuccess(true);
      playSound('resolve');
      if (onDispatchSuccess) onDispatchSuccess();
    }, 1200);
  };

  const stops = dispatchRoute?.routeStops || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Value Proposition */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Truck className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">Dynamic Municipal Dispatch & TSP Route Optimizer</h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Converts traditional blind sweeping schedules into dynamic, AI-optimized routes based on real-time gig-dashcam telemetry.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDispatch}
              disabled={isDispatching || stops.length === 0}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition transform active:scale-95 disabled:opacity-50 text-sm"
            >
              <Send className={`w-4 h-4 ${isDispatching ? 'animate-bounce' : ''}`} />
              <span>{isDispatching ? 'Transmitting to Vehicle Telematics...' : 'Dispatch Sanitation Fleet'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Route Performance KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/60 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-mono uppercase">Fuel Efficiency Gain</div>
              <div className="text-xl font-extrabold text-emerald-400 font-mono">
                {dispatchRoute?.estimatedFuelSavedPercent || 32}% Saved
              </div>
              <div className="text-[10px] text-slate-400">vs Fixed Static Routes</div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/60 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-mono uppercase">Optimized TSP Loop</div>
              <div className="text-xl font-extrabold text-white font-mono">
                {dispatchRoute?.totalDistanceKm || 14.8} km
              </div>
              <div className="text-[10px] text-slate-400">{stops.length} Priority Hotspots</div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/60 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-mono uppercase">Estimated Clearance Time</div>
              <div className="text-xl font-extrabold text-amber-400 font-mono">
                {dispatchRoute?.estimatedTimeMinutes || 95} mins
              </div>
              <div className="text-[10px] text-slate-400">Includes suction & loading</div>
            </div>
          </div>
        </div>

      </div>

      {/* Dispatched Notification Banner */}
      {dispatchedSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-600 rounded-2xl p-4 flex items-center justify-between text-emerald-200 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="font-bold text-white">Route Dispatched to BBMP Sanitation Compactor KA-01-GA-4412</div>
              <div className="text-xs text-emerald-300">Turn-by-turn turn sheet sent to driver MDT (Mobile Data Terminal). Target cleanup ETA: 11:45 AM.</div>
            </div>
          </div>
          <span className="text-xs font-mono bg-emerald-900 px-3 py-1 rounded-lg border border-emerald-700">Status: En Route</span>
        </div>
      )}

      {/* Step-by-Step Manifest Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Turn-by-Turn Sanitation Dispatch Manifest
        </h3>

        {stops.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">No active severe hotspots requiring emergency truck routing!</p>
            <p className="text-xs text-slate-500 mt-1">All municipal wards currently meeting cleanliness SLA standards.</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Origin Depot */}
            <div className="flex items-start space-x-4 p-3 bg-blue-950/20 border border-blue-800/40 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5">
                HQ
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{dispatchRoute?.depot?.name || "BBMP Central Sanitation Depot"}</h4>
                  <span className="text-[11px] text-blue-400 font-mono">0.0 km (Start)</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Fleet departure & compactor safety check</p>
              </div>
            </div>

            {/* Intermediate Waypoints */}
            {stops.map((stop, index) => {
              const isDrain = stop.category === 'clogged_drain';
              return (
                <div 
                  key={stop.anomalyId || index}
                  className="flex items-start space-x-4 p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl hover:border-slate-600 transition"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5 ${
                    stop.severity === 'critical' ? 'bg-red-600 shadow-md shadow-red-600/30' : 'bg-amber-600'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded font-mono ${
                          isDrain ? 'bg-blue-950 text-blue-400 border border-blue-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {stop.category?.replace('_', ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-white">{stop.title}</h4>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-indigo-400 font-mono font-bold">+{stop.legDistanceKm} km</span>
                        <span className="text-[10px] text-slate-400 block font-mono">Cum: {stop.cumulativeDistanceKm} km</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {stop.wardName}
                      </span>
                      <span className="font-mono">Est Volume: <strong className="text-slate-200">{stop.volumeEstimate}</strong></span>
                      <span className="text-cyan-400 font-semibold">
                        Equipment: {isDrain ? "Hydraulic Silt Vacuum" : "Rear-Loader Compactor"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Return to Depot */}
            <div className="flex items-start space-x-4 p-3 bg-slate-800/20 border border-slate-800 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs flex-shrink-0 mt-0.5">
                END
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-300">Return to BBMP Central Depot & Transfer Station</h4>
                  <span className="text-[11px] text-slate-400 font-mono">Total {dispatchRoute?.totalDistanceKm} km</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Solid waste unload and compactor sanitization</p>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
