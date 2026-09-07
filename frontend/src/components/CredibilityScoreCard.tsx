import React from 'react';
import { VerificationSummary } from '../types';
import { ShieldCheck, ShieldAlert, ShieldQuestion, Activity } from 'lucide-react';

interface CredibilityScoreCardProps {
  summary: VerificationSummary;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export const CredibilityScoreCard: React.FC<CredibilityScoreCardProps> = ({ 
  summary, 
  selectedFilter,
  onFilterChange 
}) => {
  // Determine which color theme to use for the main gauge based on the overall Credibility Score
  const scoreColor = summary.credibility_score >= 75 ? 'text-emerald-400' 
                   : summary.credibility_score >= 50 ? 'text-yellow-400' 
                   : 'text-rose-400';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      
      {/* 1. Main Score Gauge (Spans 1 column) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-center items-center text-center">
        <Activity className={`w-8 h-8 mb-3 ${scoreColor}`} />
        <div className={`text-5xl font-black tracking-tight mb-2 ${scoreColor}`}>
          {summary.credibility_score}%
        </div>
        <div className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-1">
          {summary.trust_rating}
        </div>
        <div className="text-xs text-slate-500">Overall Video Credibility Score</div>
      </div>

      {/* 2. Interactive Metrics Dashboard (Spans 3 columns) */}
      <div className="md:col-span-3 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <h3 className="text-slate-400 text-sm font-semibold mb-4 uppercase tracking-wider">Claim Verification Analysis</h3>
        
        {/* Responsive Grid of Metric Filter Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full pb-6">
          
          {/* ALL Filter Button */}
          <button 
            onClick={() => onFilterChange('ALL')}
            className={`p-4 rounded-xl text-left transition-all border ${
              selectedFilter === 'ALL' 
                ? 'bg-slate-800 border-slate-600 shadow-inner' 
                : 'bg-slate-950/50 border-slate-800/60 hover:bg-slate-900 cursor-pointer'
            }`}
          >
            <div className="text-3xl font-bold text-slate-200 mb-1">{summary.total_claims}</div>
            <div className="text-xs font-semibold text-slate-500 uppercase">Total Claims Extracted</div>
          </button>
          
          {/* VERIFIED Filter Button */}
          <button 
            onClick={() => onFilterChange('VERIFIED')}
            className={`p-4 rounded-xl text-left transition-all border ${
              selectedFilter === 'VERIFIED' 
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-inner' 
                : 'bg-slate-950/50 border-slate-800/60 hover:bg-slate-900 cursor-pointer'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="text-3xl font-bold text-emerald-400">{summary.verified_claims_count}</div>
              <ShieldCheck className="w-5 h-5 text-emerald-500/50" />
            </div>
            <div className="text-xs font-semibold text-emerald-500/80 uppercase">Verified Claims</div>
          </button>
          
          {/* CONTRADICTED (False) Filter Button */}
          <button 
            onClick={() => onFilterChange('CONTRADICTED')}
            className={`p-4 rounded-xl text-left transition-all border ${
              selectedFilter === 'CONTRADICTED' 
                ? 'bg-rose-950/40 border-rose-500/50 shadow-inner' 
                : 'bg-slate-950/50 border-slate-800/60 hover:bg-slate-900 cursor-pointer'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="text-3xl font-bold text-rose-400">{summary.contradicted_claims_count}</div>
              <ShieldAlert className="w-5 h-5 text-rose-500/50" />
            </div>
            <div className="text-xs font-semibold text-rose-500/80 uppercase">Contradicted Claims</div>
          </button>
          
          {/* UNVERIFIED Filter Button */}
          <button 
            onClick={() => onFilterChange('UNVERIFIED')}
            className={`p-4 rounded-xl text-left transition-all border ${
              selectedFilter === 'UNVERIFIED' 
                ? 'bg-yellow-950/40 border-yellow-500/50 shadow-inner' 
                : 'bg-slate-950/50 border-slate-800/60 hover:bg-slate-900 cursor-pointer'
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="text-3xl font-bold text-yellow-400">{summary.unverified_claims_count}</div>
              <ShieldQuestion className="w-5 h-5 text-yellow-500/50" />
            </div>
            <div className="text-xs font-semibold text-yellow-500/80 uppercase">Unverified / Unmatched</div>
          </button>

        </div>
      </div>
    </div>
  );
};
