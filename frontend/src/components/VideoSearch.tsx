import React, { useState } from 'react';
import { Search, Youtube, Play, Loader2, Sparkles } from 'lucide-react';
import { YouTubeVideo } from '../types';

interface VideoSearchProps {
  onSelectVideo: (video: YouTubeVideo) => void;
  isAnalyzing: boolean;
}

export const VideoSearch: React.FC<VideoSearchProps> = ({ onSelectVideo, isAnalyzing }) => {
  // State to hold what the user types in the search bar
  const [query, setQuery] = useState('');
  
  // State to track if the search API call is running
  const [isSearching, setIsSearching] = useState(false);
  
  // State to store the array of videos returned by the backend
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  
  // Track if the user has performed at least one search
  const [hasSearched, setHasSearched] = useState(false);

  /**
   * Handles the search form submission.
   * Calls our Python backend `/api/search` endpoint.
   */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the browser page from refreshing
    if (!query.trim()) return; // Don't search if the input is empty
    
    setIsSearching(true);
    try {
      // Send the query to the FastAPI backend
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_BASE}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), max_results: 6 })
      });
      if (res.ok) {
        // Parse the results and update the UI
        const data = await res.json();
        setVideos(data.results || []);
        setHasSearched(true);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false); // Stop the loading spinner
    }
  };

  /**
   * A helper function to load pre-configured demo videos.
   * Useful for testing the NLP parser when no API key is available.
   */
  const handleQuickLoad = () => {
    setQuery('Quantum Computing Fusion');
    handleSearch({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      
      {/* Header Text */}
      <div className="max-w-3xl mx-auto text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Search & Select YouTube Video for Credibility Analysis
        </h2>
        <p className="text-sm text-slate-400">
          Search any YouTube topic to extract claims, generate its per-video knowledge graph, and cross-reference against trusted reference sources.
        </p>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search YouTube topic (e.g., Quantum computing, Climate trends, AI models)..."
            className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        
        {/* Search Submit Button */}
        <button
          type="submit"
          disabled={isSearching || isAnalyzing}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Youtube className="w-5 h-5" />
              <span>Search</span>
            </>
          )}
        </button>
      </form>

      {/* Show the Quick Load demo button if they haven't searched yet */}
      {!hasSearched && (
        <div className="flex justify-center mb-4">
          <button
            onClick={handleQuickLoad}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-800/40 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Sample Videos</span>
          </button>
        </div>
      )}

      {/* Render the Grid of Video Result Cards */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {videos.map((vid) => (
            <div
              key={vid.video_id}
              className="bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 rounded-xl overflow-hidden group flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <div>
                {/* Thumbnail Image */}
                <div className="relative aspect-video overflow-hidden bg-slate-900">
                  <img
                    src={vid.thumbnail}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  <span className="absolute bottom-2 left-2 text-[11px] bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded font-medium">
                    {vid.channel}
                  </span>
                </div>

                {/* Video Title and Description */}
                <div className="p-4">
                  <h3 className="font-semibold text-white text-sm line-clamp-2 mb-2 group-hover:text-indigo-300 transition-colors">
                    {vid.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {vid.description}
                  </p>
                </div>
              </div>

              {/* Action Button: Trigger the analysis pipeline for this specific video */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => onSelectVideo(vid)}
                  disabled={isAnalyzing}
                  className="w-full py-2 px-4 bg-slate-800 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Analyze Credibility</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
