import React from 'react';
import { Activity, ShieldCheck, Network } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo and Brand Name */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-sky-400 bg-clip-text text-transparent tracking-tight">
              TruthGraph
            </h1>
          </div>
        </div>

        {/* Feature Badges showcasing the 3 core technologies used */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Network className="w-4 h-4 text-sky-500" />
            <span>Knowledge Graph</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Fact-Check Matrix</span>
          </div>
        </div>
        
      </div>
    </nav>
  );
};
