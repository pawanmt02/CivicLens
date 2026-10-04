import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShieldCheck, 
  CheckCircle2, 
  DollarSign, 
  Image as ImageIcon, 
  Clock, 
  Sparkles, 
  ExternalLink,
  Award,
  Lock,
  Search,
  Check
} from 'lucide-react';
import { playSound } from '../services/audio';

export default function VerificationPortal({ 
  anomalies = [], 
  payouts = [], 
  onResolveAnomaly 
}) {
  const [selectedAnomaly, setSelectedAnomaly] = useState(anomalies[0] || null);
  const [resolutionNotes, setResolutionNotes] = useState('Sanitation squad deployed; 100% plastic silt evacuated from drain culvert.');
  const [assignedTruck, setAssignedTruck] = useState('KA-01-GA-4412 (Central Super Sucker)');
  const [isResolving, setIsResolving] = useState(false);
  const [activeTab, setActiveTab] = useState('resolve'); // 'resolve' or 'ledger'
  const [searchTerm, setSearchTerm] = useState('');

  const handleResolveSubmit = (anomalyId) => {
    setIsResolving(true);
    setTimeout(() => {
      if (onResolveAnomaly) {
        onResolveAnomaly(anomalyId, {
          assignedTruck,
          notes: resolutionNotes,
          proofUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80'
        });
      }
      setIsResolving(false);
      playSound('resolve');

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 600);
  };

  const filteredPayouts = payouts.filter(p => 
    p.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.driverId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.platform?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Verification Portal & DPDP Payout Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit passive AI detections, inspect before/after cleanup proof, and track micro-incentives to gig workers.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('resolve')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'resolve' 
                ? 'bg-cyan-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Before & After Verification
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'ledger' 
                ? 'bg-cyan-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Gig Payout Ledger ({payouts.length})
          </button>
        </div>
      </div>

      {activeTab === 'resolve' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Anomalies List */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 max-h-[620px] overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Incident to Verify
            </h3>

            <div className="space-y-2">
              {anomalies.map((item) => {
                const isSelected = selectedAnomaly?.id === item.id;
                const isResolved = item.status === 'resolved';

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedAnomaly(item)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-start space-x-3 ${
                      isSelected 
                        ? 'bg-cyan-950/60 border-cyan-500 shadow-md' 
                        : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-950 border border-slate-700">
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">{item.id}</span>
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded font-mono ${
                          isResolved 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {item.status?.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{item.wardName}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Before & After Inspector */}
          <div className="lg:col-span-8 space-y-4">
            {selectedAnomaly ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                
                {/* Header & Meta */}
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs uppercase font-mono px-2 py-0.5 bg-slate-800 text-cyan-400 rounded font-bold">
                        {selectedAnomaly.id}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Ward: {selectedAnomaly.wardName}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{selectedAnomaly.title}</h3>
                    <p className="text-xs text-slate-300">{selectedAnomaly.description}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono block">Severity Index</span>
                    <span className="text-2xl font-extrabold text-amber-400 font-mono">
                      {selectedAnomaly.severityScore}/100
                    </span>
                  </div>
                </div>

                {/* Before vs After Photo Proof Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Before / Detection Image */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> [BEFORE] Passive AI Detection
                      </span>
                      <span className="text-emerald-400 text-[10px]">🛡️ DPDP Privacy Blurred</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-video bg-black">
                      <img 
                        src={selectedAnomaly.imageUrl} 
                        alt="Before Cleanup" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-[10px] text-white font-mono">
                        Vol: {selectedAnomaly.volumeEstimate} • Conf: {(selectedAnomaly.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Reported by: <strong>{selectedAnomaly.reportedBy}</strong>
                    </p>
                  </div>

                  {/* After / Resolution Image */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> [AFTER] Municipal Resolution
                      </span>
                      <span className="text-slate-400 text-[10px]">BBMP Inspection Tag</span>
                    </div>
                    <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-video bg-black flex items-center justify-center">
                      {selectedAnomaly.status === 'resolved' ? (
                        <img 
                          src={selectedAnomaly.resolutionProofUrl || "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80"} 
                          alt="After Cleanup" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="text-center p-6 text-slate-500">
                          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Pending Municipal Action</p>
                          <p className="text-[10px]">Inspection photo uploaded upon job completion</p>
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Assigned Unit: <strong>{selectedAnomaly.assignedTruck || assignedTruck}</strong>
                    </p>
                  </div>

                </div>

                {/* Resolution Form / Sign-off */}
                {selectedAnomaly.status !== 'resolved' ? (
                  <div className="pt-4 border-t border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Municipal Sign-off & Cleanliness Recalculation
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono text-slate-400 block mb-1">
                          Assigned Sanitation Compactor / Sucker
                        </label>
                        <input
                          type="text"
                          value={assignedTruck}
                          onChange={(e) => setAssignedTruck(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-mono text-slate-400 block mb-1">
                          Action Notes / SLA Verification
                        </label>
                        <input
                          type="text"
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleResolveSubmit(selectedAnomaly.id)}
                      disabled={isResolving}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition transform active:scale-98 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isResolving ? 'animate-spin' : ''}`} />
                      <span>{isResolving ? 'Verifying & Updating Ward Score...' : 'Mark Cleaned & Verify Resolution (Recalculate Score)'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center space-x-3">
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <div className="font-bold">Successfully Resolved & Verified</div>
                      <div className="text-[11px] text-emerald-400">{selectedAnomaly.resolutionNotes || "Waste cleared; ward index adjusted +8 points."}</div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                Select an anomaly on the left to inspect before/after verification.
              </div>
            )}
          </div>

        </div>
      ) : (
        /* GIG WORKER PAYOUT LEDGER */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Automated Gig Delivery Worker Incentive Ledger
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every verified unique anomaly automatically triggers ₹1 BBMP civic credit directly to the driver's UPI wallet.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search driver / platform..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Payout ID</th>
                  <th className="p-3">Rider / Partner</th>
                  <th className="p-3">Platform</th>
                  <th className="p-3">Anomaly Ref</th>
                  <th className="p-3">DPDP Privacy Compliance</th>
                  <th className="p-3">Bounty Amount</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {filteredPayouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3 text-cyan-400 font-bold">{p.id}</td>
                    <td className="p-3 font-sans font-semibold text-white">{p.driverName} <span className="text-slate-500 text-[10px]">({p.driverId})</span></td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-bold text-slate-300">
                        {p.platform}
                      </span>
                    </td>
                    <td className="p-3 text-amber-400">{p.anomalyId}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        <Lock className="w-3 h-3" /> 0 PII Stored
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-400">₹{p.amount}.00</td>
                    <td className="p-3 text-slate-400 text-[11px]">{new Date(p.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PAID
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
