import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { VideoSearch } from './components/VideoSearch';
import { CredibilityScoreCard } from './components/CredibilityScoreCard';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { ClaimsList } from './components/ClaimsList';
import { YouTubeVideo, AnalysisResult } from './types';
import { Loader2, ArrowLeft, Video } from 'lucide-react';

export const App: React.FC = () => {
  // Application State Management
  // Keeps track of the currently selected video to analyze
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  
  // Keeps track of whether the backend is currently processing the pipeline
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Stores the final massive JSON response containing the graph and credibility score
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Tracks which tab the user clicked on the dashboard (ALL, VERIFIED, CONTRADICTED, UNVERIFIED)
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  
  // Stores any error messages from the backend to show the user
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /**
   * Called when the user clicks "Analyze Credibility" on a video card.
   * This function sends a POST request to our Python FastAPI backend to trigger the 6-stage pipeline.
   */
  const handleSelectVideo = async (video: YouTubeVideo) => {
    setSelectedVideo(video);
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      // Send the video ID to the /api/analyze endpoint
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_BASE}/api/analyze`, {
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

      // Parse the completed analysis and update our React state
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setErrorMsg(err.message || 'Failed to analyze video transcript.');
    } finally {
      // Hide the loading spinner
      setIsAnalyzing(false);
    }
  };

  /**
   * Resets the dashboard back to the initial video search screen.
   */
  const handleReset = () => {
    setSelectedVideo(null);
    setAnalysisResult(null);
    setSelectedFilter('ALL');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Renders the top navigation bar */}
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Conditional Rendering: If no video is selected, show the Search screen. Otherwise, show the Analysis Dashboard */}
        {!selectedVideo ? (
          <VideoSearch onSelectVideo={handleSelectVideo} isAnalyzing={isAnalyzing} />
        ) : (
          <div className="space-y-6">
            
            {/* Top Toolbar (Back button and current video title) */}
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

            {/* Loading Indicator Animation while the backend processes the pipeline */}
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

            {/* Error Banner if the backend crashes */}
            {errorMsg && (
              <div className="p-4 bg-rose-950/80 border border-rose-500/40 rounded-xl text-rose-200 text-sm">
                Analysis Error: {errorMsg}
              </div>
            )}

            {/* Final Analysis Dashboard (Only shows when analysis is complete and no errors occurred) */}
            {!isAnalyzing && analysisResult && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* 1. Score Overview Component (The credibility gauge and metrics) */}
                <CredibilityScoreCard
                  summary={analysisResult.verification_summary}
                  selectedFilter={selectedFilter}
                  onFilterChange={setSelectedFilter}
                />

                {/* 2. Interactive Knowledge Graph Component (The Vis.js network visualization) */}
                <KnowledgeGraph
                  nodes={analysisResult.graph.nodes}
                  edges={analysisResult.graph.edges}
                  selectedFilter={selectedFilter}
                />

                {/* 3. Claims & Evidence List Component (The text breakdown of what was verified/refuted) */}
                <ClaimsList
                  verifications={analysisResult.verification_summary.claim_verifications}
                  selectedFilter={selectedFilter}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        <p>TruthGraph: Credibility & Knowledge-Graph Analysis for YouTube Videos • CHRIST (Deemed to be University)</p>
      </footer>
    </div>
  );
};
