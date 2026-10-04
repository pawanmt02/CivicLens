import React from 'react';
import { 
  Building, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Truck, 
  Navigation,
  Clock
} from 'lucide-react';

export default function WardScorecard({ wards = [], stats = {} }) {
  return (
    <div className="space-y-6">
      
      {/* Top Metric Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase font-mono tracking-wider">Avg City Cleanliness</span>
            <Building className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{stats.averageCleanlinessScore || 79}</span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.averageCleanlinessScore || 79}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase font-mono tracking-wider">Passive Street Auditing</span>
            <Navigation className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{(stats.totalKilometersScanned || 6470).toLocaleString()}</span>
            <span className="text-xs text-emerald-400 font-mono">km audited</span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {stats.activeScannersCount || 42} Active Gig Couriers Online
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase font-mono tracking-wider">Detection Speedup</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">18 mins</span>
            <span className="text-xs text-slate-400 font-mono">vs 9.2 days</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Passive dashcam vs manual citizen reporting
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase font-mono tracking-wider">DPDP Compliance</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">100%</span>
            <span className="text-xs text-slate-400 font-mono">Edge Blur</span>
          </div>
          <p className="text-[11px] text-slate-400">
            0 PII or unblurred faces stored
          </p>
        </div>

      </div>

      {/* Ward Leaderboard Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-cyan-400" />
              Ward Cleanliness & Infrastructure Scorecards
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live automated composite index updated after every passive dashcam verification
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {wards.map((ward) => {
            const isGood = ward.cleanlinessScore >= 80;
            const isModerate = ward.cleanlinessScore >= 65 && ward.cleanlinessScore < 80;
            const isCritical = ward.cleanlinessScore < 65;

            return (
              <div 
                key={ward.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCritical 
                    ? 'bg-red-950/20 border-red-800/60 shadow-lg shadow-red-950/20' 
                    : isModerate 
                    ? 'bg-amber-950/20 border-amber-800/60' 
                    : 'bg-slate-800/40 border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-300">
                    {ward.code}
                  </span>
                  <span className={`text-xs font-bold font-mono ${
                    isCritical ? 'text-red-400' : isModerate ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {ward.cleanlinessRating}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-white mt-2">{ward.name}</h4>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400 font-mono">Cleanliness Index:</span>
                  <span className="text-2xl font-extrabold text-white font-mono">
                    {ward.cleanlinessScore}<span className="text-xs text-slate-400">/100</span>
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1 mb-3">
                  <div 
                    className={`h-full rounded-full ${
                      isCritical ? 'bg-red-500' : isModerate ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${ward.cleanlinessScore}%` }}
                  ></div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Active Anomalies:</span>
                    <span className={`font-bold ${ward.activeAnomalies > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {ward.activeAnomalies}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Sanitation Trucks:</span>
                    <span className="text-slate-200 font-mono">{ward.sanitationTrucksActive} units</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Km Scanned 24h:</span>
                    <span className="text-cyan-400 font-mono">{ward.totalScannedKm} km</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
