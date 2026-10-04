import React, { useState } from 'react';
import { 
  DollarSign, 
  Flame, 
  Award, 
  TrendingUp, 
  Droplets, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight, 
  ShieldCheck, 
  Gift, 
  Layers,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../services/audio';

export default function WalletGamificationPage({ payouts = [], stats = {} }) {
  const [quotaReached, setQuotaReached] = useState(true);
  const [claimed, setClaimed] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState(52);
  const [streakDays, setStreakDays] = useState(6);

  const handleClaimPayout = () => {
    if (!quotaReached || claimed) return;
    setClaimed(true);
    playSound('payout');

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const fillPercentage = Math.min(100, (payoutAmount / 50) * 100);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="relative bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-800/40 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Screen 4: Rider Wallet & Gamification
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-400 font-mono text-xs font-bold">
                INSTANT BBMP UPI SETTLEMENT
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Gig Driver Earnings & Viscous Liquid Quota Reservoir
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
              Earn ₹1 for every verified unique municipal anomaly reported passively on your delivery route. Watch the organic liquid reservoir fill in real-time as background camera detections are approved.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Tactile Clay Metric Tiles & Liquid Reservoir */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 8 Cols: Tactile Clay Metric Tiles */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            
            {/* Clay Tile 1: Total Earned */}
            <div className="depth-z1 rounded-3xl p-6 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase font-mono tracking-wider">Total Balance</span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-3xl font-black text-white font-mono flex items-baseline gap-1">
                  <span className="text-emerald-400">₹</span>
                  <span>{payoutAmount}.00</span>
                </div>
                <div className="depth-inset px-3 py-1.5 rounded-xl text-emerald-400 text-xs font-mono font-bold inline-block">
                  +₹8.00 Today's Shift
                </div>
              </div>
            </div>

            {/* Clay Tile 2: Audit Streak */}
            <div className="depth-z1 rounded-3xl p-6 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase font-mono tracking-wider">Active Streak</span>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Flame className="w-5 h-5" />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-3xl font-black text-white font-mono flex items-baseline gap-1">
                  <span>{streakDays}</span>
                  <span className="text-xs text-amber-400">DAYS</span>
                </div>
                <div className="depth-inset px-3 py-1.5 rounded-xl text-amber-400 text-xs font-mono font-bold inline-block">
                  1.5x Multiplier Active
                </div>
              </div>
            </div>

            {/* Clay Tile 3: Total Verified Detections */}
            <div className="depth-z1 rounded-3xl p-6 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase font-mono tracking-wider">Verified Proofs</span>
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-3xl font-black text-white font-mono flex items-baseline gap-1">
                  <span>52</span>
                  <span className="text-xs text-cyan-400">PINGS</span>
                </div>
                <div className="depth-inset px-3 py-1.5 rounded-xl text-cyan-400 text-xs font-mono font-bold inline-block">
                  100% DPDP Anonymized
                </div>
              </div>
            </div>

          </div>

          {/* Gamification Tier Progression */}
          <div className="depth-z1 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-cyan-400">Rider Civic Rank</span>
                <h3 className="text-lg font-bold text-white">Tier 3: Urban Sanitation Guardian</h3>
              </div>
              <span className="text-xs font-mono bg-cyan-950 px-3 py-1 rounded-full border border-cyan-800 text-cyan-300 font-bold">
                Next Tier at ₹100
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Progress to Tier 4 (Master Auditor):</span>
                <span className="text-cyan-400 font-bold">52% Completed</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-950 depth-inset overflow-hidden p-0.5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 transition-all duration-500"
                  style={{ width: `52%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Recent Payout Stream */}
          <div className="depth-z1 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold font-mono uppercase text-slate-300">
              Live Bounty Settlement Feed
            </h3>

            <div className="space-y-3 font-mono text-xs">
              {payouts.slice(0, 4).map((p) => (
                <div key={p.id} className="depth-inset p-3.5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                      ₹1
                    </div>
                    <div>
                      <div className="text-white font-bold">{p.anomalyId} Verified</div>
                      <div className="text-[10px] text-slate-400">{p.platform} Partner • {p.driverName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold">+₹1.00</span>
                    <span className="text-[10px] text-slate-500 block">UPI Instant</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Screen 4 Organic Liquid Quota Reservoir */}
        <div className="lg:col-span-4 depth-z1 rounded-3xl p-6 space-y-6">
          
          <div className="text-center space-y-1">
            <span className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">
              Daily Target Cylinder
            </span>
            <h3 className="text-lg font-extrabold text-white">Liquid Quota Reservoir</h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Target: ₹50.00 / Shift
            </p>
          </div>

          {/* Overhead Fluid Dispenser Nozzle */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-3 bg-slate-700 rounded-t-md border-t border-slate-600"></div>
            <div className="w-6 h-4 bg-emerald-500/80 shadow-lg shadow-emerald-500/50 rounded-b-md animate-pulse"></div>
            {/* Dripping Fluid Particle */}
            <span className="w-2 h-3 bg-emerald-400 rounded-full my-1 animate-bounce"></span>
          </div>

          {/* Organic Cylindrical Glass Reservoir */}
          <div className="relative w-44 h-72 mx-auto rounded-3xl depth-inset border-2 border-slate-700/60 overflow-hidden flex flex-col justify-end p-1.5 shadow-2xl">
            
            {/* Dynamic Sloshing Fluid Body */}
            <div 
              className="w-full bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 rounded-2xl relative transition-all duration-700 shadow-lg shadow-emerald-500/30 overflow-hidden"
              style={{ height: `${fillPercentage}%` }}
            >
              {/* Sloshing Wave Surface */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-cyan-200/40 liquid-wave-slosh rounded-full blur-[1px]"></div>
              
              {/* Floating Bubbles */}
              <div className="absolute w-2 h-2 rounded-full bg-white/40 left-4 bottom-8 animate-ping"></div>
              <div className="absolute w-1.5 h-1.5 rounded-full bg-white/40 right-6 bottom-14 animate-pulse"></div>

              {/* Internal Counter Inside Liquid */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono font-black text-2xl text-slate-950 drop-shadow">
                  {fillPercentage.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Glass Reflection Highlight */}
            <div className="absolute top-3 left-3 w-2 h-44 bg-white/10 rounded-full pointer-events-none"></div>
          </div>

          {/* Tactile Claim Payout Button */}
          <div className="pt-2">
            <button
              onClick={handleClaimPayout}
              disabled={claimed}
              className={`w-full py-4 rounded-2xl font-mono font-extrabold text-xs tracking-wider transition-all duration-300 flex items-center justify-center space-x-2 spring-press ${
                claimed
                  ? 'depth-inset text-emerald-400'
                  : 'depth-z2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl shadow-emerald-500/30 hover:scale-[1.02]'
              }`}
            >
              {claimed ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>₹{payoutAmount}.00 Transferred to UPI!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Claim ₹{payoutAmount}.00 Instant Payout</span>
                </div>
              )}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
