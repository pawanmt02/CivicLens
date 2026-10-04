import React from 'react';
import { 
  Truck, 
  Fuel, 
  Clock, 
  Navigation, 
  Send, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import DispatchRouter from '../components/DispatchRouter';

export default function DispatchRoutingPage({ dispatchRoute, onDispatchSuccess }) {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="relative depth-z2 rounded-3xl p-6 md:p-8 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Dynamic Fleet Logistics Engine
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 font-mono text-xs font-bold">
                TSP GREEDY WEIGHTED OPTIMIZATION
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Dynamic Sanitation Routing & Compactor Dispatch
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
              Replaces blind municipal sweeping schedules with demand-driven, real-time accumulation routes. Calculates optimal stops visiting critical drain chokes and illegal garbage heaps in mathematical sequence.
            </p>
          </div>
        </div>
      </div>

      {/* Main Dispatch Router */}
      <DispatchRouter
        dispatchRoute={dispatchRoute}
        onDispatchSuccess={onDispatchSuccess}
      />

    </div>
  );
}
