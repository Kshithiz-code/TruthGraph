import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { VerificationSummary } from '../types';

interface CredibilityScoreCardProps {
  summary: VerificationSummary;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export const CredibilityScoreCard: React.FC<CredibilityScoreCardProps> = ({
  summary,
  selectedFilter,
  onFilterChange,
}) => {
  const score = summary.credibility_score;

  const getScoreColor = (val: number) => {
    if (val >= 75) return { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/30' };
    if (val >= 50) return { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30' };
    return { text: 'text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500/30' };
  };

  const colors = getScoreColor(score);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Score Gauge */}
        <div className="flex items-center space-x-6">
          <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-slate-950 border-4 border-slate-800 p-2 shadow-inner">
            <div
              className="absolute inset-0 rounded-full border-4 opacity-20"
              style={{ borderColor: 'currentColor' }}
            />
            <div className="text-center">
              <span className={`text-3xl font-extrabold tracking-tight ${colors.text}`}>
                {score}%
              </span>
              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">
                Credibility
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-1">
              {score >= 75 ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : score >= 50 ? (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-rose-400" />
              )}
              <span className={`font-bold text-lg ${colors.text}`}>
                {summary.trust_rating}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs">
              Based on claim-level matching against authoritative peer-reviewed reference graph.
            </p>
          </div>
        </div>

        {/* Claim Status Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onFilterChange('VERIFIED')}
            className={`p-3 rounded-xl border transition-all text-left cursor-pointer ${
              selectedFilter === 'VERIFIED'
                ? 'bg-emerald-950/60 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-emerald-400 mb-1">
              <span className="text-xs font-semibold">Verified</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.verified_claims_count}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Matching sources</div>
          </button>

          <button
            onClick={() => onFilterChange('CONTRADICTED')}
            className={`p-3 rounded-xl border transition-all text-left cursor-pointer ${
              selectedFilter === 'CONTRADICTED'
                ? 'bg-rose-950/60 border-rose-500/60 shadow-lg shadow-rose-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-rose-400 mb-1">
              <span className="text-xs font-semibold">Refuted</span>
              <XCircle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.contradicted_claims_count}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Contradictions</div>
          </button>

          <button
            onClick={() => onFilterChange('UNVERIFIED')}
            className={`p-3 rounded-xl border transition-all text-left cursor-pointer ${
              selectedFilter === 'UNVERIFIED'
                ? 'bg-amber-950/60 border-amber-500/60 shadow-lg shadow-amber-500/10'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-amber-400 mb-1">
              <span className="text-xs font-semibold">Unverified</span>
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold text-white">
              {summary.unverified_claims_count}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Pending proof</div>
          </button>
        </div>

        {/* Action / Filter Reset */}
        <div className="flex justify-end lg:justify-center">
          <button
            onClick={() => onFilterChange('ALL')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              selectedFilter === 'ALL'
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Show All Claims & Nodes ({summary.total_claims})
          </button>
        </div>
      </div>
    </div>
  );
};
