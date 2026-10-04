import React from 'react';
import { 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  Lock, 
  Search, 
  Award, 
  Sparkles,
  FileCheck2
} from 'lucide-react';
import VerificationPortal from '../components/VerificationPortal';

export default function VerificationPage({ 
  anomalies = [], 
  payouts = [], 
  onResolveAnomaly 
}) {
  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="relative depth-z2 rounded-3xl p-6 md:p-8 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Audit & Verification Gateway
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-400 font-mono text-xs font-bold">
                DPDP ACT COMPLIANT • ZERO PII STORED
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Before & After Verification & Gig Payout Ledger
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
              Enables municipal officers to audit photographic proof before and after sanitation action. Transparently tracks the micro-payment incentive loop crediting ₹1 per verified report to gig delivery couriers.
            </p>
          </div>
        </div>
      </div>

      {/* Main Verification Portal */}
      <VerificationPortal
        anomalies={anomalies}
        payouts={payouts}
        onResolveAnomaly={onResolveAnomaly}
      />

    </div>
  );
}
