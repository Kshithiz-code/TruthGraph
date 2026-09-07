import React from 'react';
import { ClaimVerification } from '../types';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface ClaimsListProps {
  verifications: ClaimVerification[];
  selectedFilter: string;
}

export const ClaimsList: React.FC<ClaimsListProps> = ({ verifications, selectedFilter }) => {
  // Filter the list of claims based on the currently selected tab (ALL, VERIFIED, etc.)
  const filteredClaims = selectedFilter === 'ALL' 
    ? verifications 
    : verifications.filter(c => c.status === selectedFilter);

  // Helper function to return the correct icon based on mathematical status
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'VERIFIED': return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'CONTRADICTED': return <XCircle className="w-5 h-5 text-rose-400" />;
      default: return <HelpCircle className="w-5 h-5 text-yellow-400" />;
    }
  };

  // Helper function to return the background gradient color style based on status
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'VERIFIED': return 'bg-emerald-950/20 border-emerald-900/50';
      case 'CONTRADICTED': return 'bg-rose-950/20 border-rose-900/50';
      default: return 'bg-yellow-950/20 border-yellow-900/50';
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-100">Extracted Claims & Verification Status</h3>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-800 rounded-full text-slate-400">
          {filteredClaims.length} items
        </span>
      </div>
      
      <p className="text-xs text-slate-500 mb-6 -mt-4">Claims parsed from transcript and evaluated against trusted reference graphs.</p>

      {/* Render the scrollable list of claim items */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredClaims.map((claim) => (
          <div key={claim.claim_id} className={`p-4 rounded-xl border ${getStatusStyle(claim.status)} transition-colors`}>
            
            {/* Top row: The exact text of the claim extracted from the video */}
            <div className="flex items-start gap-3 mb-3">
              <div className="mt-0.5">{getStatusIcon(claim.status)}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200 leading-snug">"{claim.claim_text}"</p>
              </div>
              <div className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border ${
                claim.status === 'VERIFIED' ? 'text-emerald-400 border-emerald-900/50 bg-emerald-950/30' :
                claim.status === 'CONTRADICTED' ? 'text-rose-400 border-rose-900/50 bg-rose-950/30' :
                'text-yellow-400 border-yellow-900/50 bg-yellow-950/30'
              }`}>
                {claim.status}
              </div>
            </div>

            {/* Bottom row: The factual evidence from the Trusted Source graph */}
            <div className="ml-8 p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
              <div className="flex items-center gap-1.5 mb-1.5">
                <ShieldIcon />
                <span className="text-[11px] font-semibold text-indigo-400/80 uppercase">Evidence / Trusted Record:</span>
                <span className="text-[11px] font-medium text-slate-400">({claim.source})</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed pl-4 border-l-2 border-indigo-900/50">
                {claim.evidence}
              </p>
            </div>
          </div>
        ))}
        
        {/* State when the list is empty (e.g., if there are 0 contradicted claims) */}
        {filteredClaims.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm italic">
            No claims found matching the current filter.
          </div>
        )}
      </div>
    </div>
  );
};

// Mini SVG component for the evidence badge
const ShieldIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500/70">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
  </svg>
);
