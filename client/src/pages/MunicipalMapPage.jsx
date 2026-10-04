import React, { useState } from 'react';
import { 
  MapPin, 
  Layers, 
  Filter, 
  Building, 
  TrendingUp, 
  Navigation, 
  ShieldCheck, 
  Sparkles,
  AlertTriangle,
  Clock,
  Droplets,
  Trash2,
  Radio
} from 'lucide-react';
import MunicipalMap from '../components/MunicipalMap';
import WardScorecard from '../components/WardScorecard';
import AnomalyDetailModal from '../components/AnomalyDetailModal';

export default function MunicipalMapPage({ 
  anomalies = [], 
  hotspots = [], 
  dispatchRoute = null, 
  depot, 
  wards = [], 
  stats = {},
  latestAnomalyId = null,
  onResolveAnomaly,
  onNavigateTab
}) {
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Anomalies', icon: Layers, color: 'cyan' },
    { id: 'drain', label: 'Drain Blockages', icon: Droplets, color: 'blue' },
    { id: 'dump', label: 'Illegal Dumps', icon: Trash2, color: 'amber' },
    { id: 'critical', label: 'Critical Only', icon: AlertTriangle, color: 'red' },
  ];

  const filteredAnomalies = anomalies.filter(a => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'drain') return a.category === 'clogged_drain';
    if (activeFilter === 'dump') return a.category === 'illegal_dump' || a.category === 'overflowing_bin';
    if (activeFilter === 'critical') return a.severity === 'critical';
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="relative depth-z2 rounded-3xl p-6 md:p-8 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                Module C: Municipal GIS Command
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-400 font-mono text-xs font-bold">
                DBSCAN CLUSTERING • 24H REALTIME
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              City-Wide Live Anomaly Heatmap & Ward GIS
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
              Consolidates thousands of daily gig delivery kilometers into real-time geospatial clusters. Highlights critical stormwater drain bottlenecks and illegal solid waste heaps with automatic severity scoring.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigateTab('twin3d')}
              className="px-4 py-2.5 depth-z2 text-white font-semibold rounded-xl text-xs font-mono shadow-lg transition transform active:scale-95 spring-press flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Switch to 3D Spatial Digital Twin ➔
            </button>
          </div>
        </div>
      </div>

      {/* Liquid Filter Bar with Meniscus Bead */}
      <div className="depth-z1 rounded-2xl p-2 flex items-center space-x-1 relative overflow-hidden">
        <div className="gooey-subtle flex items-center space-x-1 w-full">
          {filters.map((f) => {
            const Icon = f.icon;
            const isActive = activeFilter === f.id;
            const colorMap = {
              cyan: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40',
              blue: 'text-blue-300 bg-blue-500/20 border-blue-500/40',
              amber: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
              red: 'text-red-300 bg-red-500/20 border-red-500/40',
            };
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all duration-300 spring-press ${
                  isActive
                    ? `depth-z2 ${colorMap[f.color]} border shadow-lg`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{f.label}</span>
                {isActive && f.id !== 'all' && (
                  <span className="text-[9px] bg-white/10 px-1.5 rounded-full">
                    {filteredAnomalies.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="depth-z1 rounded-2xl p-4 text-center space-y-1">
          <AlertTriangle className="w-5 h-5 text-red-400 mx-auto" />
          <div className="text-2xl font-black text-white font-mono">{stats.totalActive || anomalies.length}</div>
          <div className="text-[10px] text-slate-400 font-mono uppercase">Active Anomalies</div>
        </div>
        <div className="depth-z1 rounded-2xl p-4 text-center space-y-1">
          <Radio className="w-5 h-5 text-cyan-400 mx-auto" />
          <div className="text-2xl font-black text-white font-mono">{hotspots.length}</div>
          <div className="text-[10px] text-slate-400 font-mono uppercase">DBSCAN Clusters</div>
        </div>
        <div className="depth-z1 rounded-2xl p-4 text-center space-y-1">
          <Building className="w-5 h-5 text-indigo-400 mx-auto" />
          <div className="text-2xl font-black text-white font-mono">{wards.length}</div>
          <div className="text-[10px] text-slate-400 font-mono uppercase">Monitored Wards</div>
        </div>
        <div className="depth-z1 rounded-2xl p-4 text-center space-y-1">
          <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto" />
          <div className="text-2xl font-black text-white font-mono">{stats.avgCleanliness || 72}%</div>
          <div className="text-[10px] text-slate-400 font-mono uppercase">Avg Cleanliness</div>
        </div>
      </div>

      {/* Main Full-Width Leaflet GIS Map */}
      <div className="depth-z1 rounded-3xl p-4 shadow-2xl space-y-4">
        <MunicipalMap
          anomalies={filteredAnomalies}
          hotspots={hotspots}
          dispatchRoute={dispatchRoute}
          depot={depot}
          latestAnomalyId={latestAnomalyId}
          onSelectAnomaly={(item) => setSelectedAnomaly(item)}
        />
      </div>

      {/* Ward Cleanliness Scorecards & Leaderboards */}
      <WardScorecard wards={wards} stats={stats} />

      {/* Modal Inspector */}
      {selectedAnomaly && (
        <AnomalyDetailModal
          anomaly={selectedAnomaly}
          onClose={() => setSelectedAnomaly(null)}
          onGoToVerification={() => {
            setSelectedAnomaly(null);
            onNavigateTab('verification');
          }}
        />
      )}

    </div>
  );
}
