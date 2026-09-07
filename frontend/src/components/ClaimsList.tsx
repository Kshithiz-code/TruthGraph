import React from 'react';
import { CheckCircle2, XCircle, HelpCircle, ExternalLink, Shield } from 'lucide-react';
import { ClaimVerification } from '../types';

interface ClaimsListProps {
  verifications: ClaimVerification[];
  selectedFilter: string;
}

export const ClaimsList: React.FC<ClaimsListProps> = ({ verifications, selectedFilter }) => {
  const filtered = verifications.filter((v) => {
    if (selectedFilter === 'ALL') return true;
    return v.status === selectedFilter;
  });

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Extracted Claims & Verification Status</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-normal">
              {filtered.length} items
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Claims parsed from transcript and evaluated against trusted reference graphs.
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No claims found matching filter <span className="font-semibold text-slate-400">{selectedFilter}</span>.
          </div>
        ) : (
          filtered.map((item, idx) => (
            <div
              key={item.claim_id || idx}
              className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 transition-all hover:border-slate-700"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start space-x-2.5">
                  {item.status === 'VERIFIED' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {item.status === 'CONTRADICTED' && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  {item.status === 'UNVERIFIED' && (
                    <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm font-medium text-slate-200 leading-snug">
                    "{item.claim_text}"
                  </p>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
                    item.status === 'VERIFIED'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                      : item.status === 'CONTRADICTED'
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {item.evidence && (
                <div className="ml-7 mt-2 p-3 bg-slate-900/90 rounded-lg border border-slate-800/60 text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-400 mb-1 font-semibold">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Evidence / Trusted Record:</span>
                    {item.source && item.source !== 'N/A' && (
                      <span className="text-indigo-300 font-normal">({item.source})</span>
                    )}
                  </div>
                  <p className="text-slate-300 leading-relaxed">{item.evidence}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
