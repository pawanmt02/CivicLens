import React from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  Send,
  Eye
} from 'lucide-react';

export default function AnomalyDetailModal({ anomaly, onClose, onResolve, onGoToVerification }) {
  if (!anomaly) return null;

  const isResolved = anomaly.status === 'resolved';

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-5 animate-fadeIn">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-mono px-2 py-0.5 bg-slate-800 text-cyan-400 rounded font-bold">
              {anomaly.id}
            </span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded font-mono ${
              anomaly.severity === 'critical' ? 'bg-red-950 text-red-400 border border-red-800' :
              anomaly.severity === 'high' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
              'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}>
              {anomaly.severity} Severity ({anomaly.severityScore}/100)
            </span>
          </div>

          <h3 className="text-lg font-bold text-white pt-1">{anomaly.title}</h3>
          <p className="text-xs text-slate-300">{anomaly.description}</p>
        </div>

        {/* Image proof */}
        <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video">
          <img src={anomaly.imageUrl} alt="Anomaly Proof" className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] text-emerald-400 font-mono flex items-center gap-1 border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DPDP Anonymized ({anomaly.blurredFacesCount || 1} Faces, {anomaly.blurredPlatesCount || 1} Plates)</span>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
            GPS: {anomaly.latitude.toFixed(4)}° N, {anomaly.longitude.toFixed(4)}° E
          </div>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block font-mono">Ward Location:</span>
            <span className="text-white font-semibold flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {anomaly.wardName}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-mono">Volume Estimate:</span>
            <span className="text-amber-400 font-bold font-mono mt-0.5 block">{anomaly.volumeEstimate}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-mono">Reported Via:</span>
            <span className="text-slate-200 mt-0.5 block">{anomaly.reportedBy}</span>
          </div>
          <div>
            <span className="text-slate-400 block font-mono">Status:</span>
            <span className={`font-bold mt-0.5 block capitalize ${isResolved ? 'text-emerald-400' : 'text-amber-400'}`}>
              {anomaly.status?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Close
          </button>
          
          {!isResolved && (
            <button
              onClick={() => {
                onClose();
                if (onGoToVerification) onGoToVerification(anomaly);
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/25 transition"
            >
              Verify & Resolve in Portal
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
