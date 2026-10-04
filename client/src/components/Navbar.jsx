import React from 'react';
import { 
  Camera, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  Radio, 
  Box, 
  Lock,
  DollarSign
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, liveStats, onQuickSimulate, isSimulating, isAuthenticated, onSignOut }) {
  const pages = [
    { id: 'pdr', label: 'Executive PDR', icon: Sparkles, badge: 'Overview' },
    { id: 'auth', label: '3D Auth Portal', icon: Lock, badge: 'Screen 1' },
    { id: 'scanner', label: 'Edge Dashcam HUD', icon: Camera, badge: 'Screen 2' },
    { id: 'map', label: 'Municipal GIS', icon: MapPin, badge: 'Screen 3' },
    { id: 'twin3d', label: '3D Spatial Twin', icon: Box, badge: 'WebGL' },
    { id: 'dispatch', label: 'Truck Routing', icon: Truck, badge: 'TSP' },
    { id: 'wallet', label: 'Liquid Wallet', icon: DollarSign, badge: 'Screen 4' },
    { id: 'verification', label: 'Verification', icon: ShieldCheck, badge: 'Audit' },
  ];

  return (
    <header className="bg-[#0D111A]/95 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Track Badges */}
          <div className="flex items-center space-x-3.5 cursor-pointer" onClick={() => isAuthenticated ? setActiveTab('pdr') : setActiveTab('auth')}>
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/25 text-white font-bold text-lg spring-press">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  CivicLens
                </span>
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/80 text-cyan-300 font-mono tracking-wider">
                  Track 02 & 04
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Passive AI Dashcam & Spatial Digital Twin
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links with Liquid Indicator */}
          {isAuthenticated && (
            <nav className="hidden 2xl:flex space-x-1.5 relative">
              {pages.map((p) => {
                const Icon = p.icon;
                const isActive = activeTab === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActiveTab(p.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-2xl text-xs font-semibold transition-all duration-300 relative spring-press ${
                      isActive
                        ? 'depth-z2 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <span>{p.label}</span>
                    {p.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive 
                          ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-500/30' 
                          : 'bg-slate-800/80 text-slate-400'
                      }`}>
                        {p.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Action Buttons: Live Simulator & Sign Out */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && (
              <button
                onClick={onQuickSimulate}
                disabled={isSimulating}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-2xl text-xs font-bold font-mono shadow-xl shadow-red-500/25 transition-all transform active:scale-95 disabled:opacity-50 spring-press"
                title="Broadcast simulated edge anomaly detection across the network"
              >
                <Radio className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : 'animate-pulse'}`} />
                <span className="hidden sm:inline">{isSimulating ? 'Broadcasting...' : 'Simulate Edge Anomaly'}</span>
                <span className="sm:hidden">Simulate</span>
              </button>
            )}

            {isAuthenticated ? (
              <button
                onClick={onSignOut}
                className="flex items-center space-x-1.5 px-3.5 py-2 depth-z1 hover:border-red-500/50 text-slate-300 hover:text-red-400 rounded-2xl text-xs font-mono font-bold transition spring-press"
                title="Sign out of CivicLens"
              >
                <Lock className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold bg-cyan-950 px-3 py-1.5 rounded-full border border-cyan-800">
                <Lock className="w-3.5 h-3.5 animate-pulse" />
                <span>Portal Locked</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Sub-Navbar for medium screens */}
      {isAuthenticated && (
        <div className="2xl:hidden flex overflow-x-auto px-4 py-2.5 border-t border-slate-800/80 space-x-2 bg-slate-950/80">
          {pages.map((p) => {
            const Icon = p.icon;
            const isActive = activeTab === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition spring-press ${
                  isActive ? 'depth-z2 text-cyan-300 border-cyan-500/40' : 'text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
