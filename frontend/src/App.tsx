import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { VideoSearch } from './components/VideoSearch';
import { CredibilityScoreCard } from './components/CredibilityScoreCard';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { ClaimsList } from './components/ClaimsList';
import { YouTubeVideo, AnalysisResult } from './types';
import { Loader2, ArrowLeft, Video, Layers, Database } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectVideo = async (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: video.video_id,
          video_title: video.title
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMsg(err.message || 'Failed to analyze video transcript.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedVideo(null);
    setAnalysisResult(null);
    setSelectedFilter('ALL');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {!selectedVideo ? (
          <VideoSearch onSelectVideo={handleSelectVideo} isAnalyzing={isAnalyzing} />
        ) : (
          <div className="space-y-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Select Different Video</span>
              </button>

              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
                <Video className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-white truncate max-w-xs">{selectedVideo.title}</span>
              </div>
            </div>

            {/* Loading Indicator */}
            {isAnalyzing && (
              <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-12 text-center shadow-2xl space-y-4 animate-pulse">
                <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto" />
                <h3 className="text-xl font-bold text-white">Executing 6-Stage TruthGraph Pipeline...</h3>
                <div className="flex justify-center space-x-4 text-xs text-slate-400">
                  <span>1. Transcript Retrieval</span> →
                  <span>2. Gemini Claim Extraction</span> →
                  <span>3. Graph Building</span> →
                  <span>5/6. Trusted Matching</span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-4 bg-rose-950/80 border border-rose-500/40 rounded-xl text-rose-200 text-sm">
                Analysis Error: {errorMsg}
              </div>
            )}

            {/* Analysis Results View */}
            {!isAnalyzing && analysisResult && (
              <div className="space-y-6 animate-fadeIn">
                {/* 1. Score Overview */}
                <CredibilityScoreCard
                  summary={analysisResult.verification_summary}
                  selectedFilter={selectedFilter}
                  onFilterChange={setSelectedFilter}
                />

                {/* 2. Interactive Knowledge Graph */}
                <KnowledgeGraph
                  nodes={analysisResult.graph.nodes}
                  edges={analysisResult.graph.edges}
                  selectedFilter={selectedFilter}
                />

                {/* 3. Claims & Evidence List */}
                <ClaimsList
                  verifications={analysisResult.verification_summary.claim_verifications}
                  selectedFilter={selectedFilter}
                />
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        <p>TruthGraph: Credibility & Knowledge-Graph Analysis for YouTube Videos • CHRIST (Deemed to be University)</p>
      </footer>
    </div>
  );
};
