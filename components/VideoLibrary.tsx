
import React, { useState, useEffect } from 'react';
import { EDUCATIONAL_CHANNELS } from '../constants';
import { 
  Search, Play, ExternalLink, Loader2, X, Youtube, 
  History, Share2, Maximize2, Zap, Clock, 
  TrendingUp, PlayCircle, Mic, ChevronDown, 
  Minimize2, Eraser
} from 'lucide-react';
import { searchEducationalVideos } from '../services/gemini';

interface Video {
  title: string;
  channel: string;
  url: string;
  thumbnail?: string;
  duration?: string;
}

const VideoLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const stored = localStorage.getItem('eb_recent_searches');
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Video Player State
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const updateRecentSearches = (query: string) => {
    if (!query.trim()) return;
    const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('eb_recent_searches', JSON.stringify(newRecent));
  };

  const performSearch = async (query?: string, platform?: string) => {
    const currentQuery = query || searchQuery;
    const currentPlatform = platform || (selectedChannel === 'all' ? undefined : selectedChannel);

    setLoading(true);
    if (query !== undefined) setSearchQuery(query);
    if (currentQuery) updateRecentSearches(currentQuery);

    try {
      const result = await searchEducationalVideos(currentQuery || "HSC Preparation", currentPlatform);
      
      const processedVideos = result.videos.map((v: Video, idx: number) => {
        const videoId = getYoutubeId(v.url);
        return {
          ...v,
          thumbnail: videoId 
            ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` 
            : (v.thumbnail || `https://picsum.photos/seed/${idx + Math.random()}/400/225`)
        };
      });

      setVideos(processedVideos);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch("HSC Exam Tips 2025");
  }, []);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const handlePlatformClick = (platformName: string) => {
    const newPlatform = selectedChannel === platformName ? 'all' : platformName;
    setSelectedChannel(newPlatform);
    performSearch(searchQuery, newPlatform === 'all' ? undefined : newPlatform);
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('eb_recent_searches');
  };

  const closePlayer = () => {
    setActiveVideo(null);
    setIsMinimized(false);
  };

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto relative">
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-3 rounded-2xl text-white shadow-xl shadow-red-500/20">
              <Youtube size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Edu Video Hub</h2>
              <p className="text-slate-500 text-sm font-semibold flex items-center gap-1.5">
                <PlayCircle size={14} className="text-red-500" />
                Your Search-Powered Learning Portal
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="relative group max-w-4xl mx-auto">
          <form onSubmit={handleFormSubmit} className="relative z-10">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors flex items-center gap-2">
              <Search size={22} />
            </div>
            <input
              type="text"
              placeholder="Search chapters, topics, or platforms..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] pl-16 pr-44 py-5 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-xl text-lg font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-36 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2"
              >
                <X size={18} />
              </button>
            )}
            <div className="absolute right-3 top-2 bottom-2 flex">
              <button 
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-full font-black transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Search'}
              </button>
            </div>
          </form>
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-2xl -z-10 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-2">
            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">
              <History size={12} />
              Recent
            </div>
            {recentSearches.map((s, i) => (
              <button
                key={i}
                onClick={() => performSearch(s)}
                className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold transition-all border border-transparent hover:border-indigo-200"
              >
                {s}
              </button>
            ))}
            <button 
              onClick={clearHistory}
              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
              title="Clear History"
            >
              <Eraser size={14} />
            </button>
          </div>
        )}

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          <button
            onClick={() => handlePlatformClick('all')}
            className={`px-6 py-3 rounded-2xl whitespace-nowrap text-xs font-black transition-all border shadow-sm ${
              selectedChannel === 'all' 
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            All Channels
          </button>
          {EDUCATIONAL_CHANNELS.map(ch => (
            <button
              key={ch.id}
              onClick={() => handlePlatformClick(ch.name)}
              className={`px-6 py-3 rounded-2xl whitespace-nowrap text-xs font-black transition-all border shadow-sm ${
                selectedChannel === ch.name 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {ch.name}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
        {loading ? (
          /* High-end Skeleton Loader */
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4 animate-in fade-in duration-300">
              <div className="relative aspect-video rounded-[2.5rem] bg-slate-200 dark:bg-slate-800 animate-pulse overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </div>
              <div className="px-5 space-y-3">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-full animate-pulse" />
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-2/3 animate-pulse" />
                <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded-lg w-1/4 animate-pulse mt-2" />
              </div>
            </div>
          ))
        ) : (
          videos.length > 0 ? (
            videos.map((video, idx) => (
              <div 
                key={idx} 
                className="group cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 75}ms` }}
                onClick={() => {
                  setActiveVideo(video);
                  setIsMinimized(false);
                }}
              >
                <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-md group-hover:shadow-2xl transition-all duration-500">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/95 text-indigo-600 p-5 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <Play size={24} fill="currentColor" />
                    </div>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-4 right-6 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-widest">
                      {video.duration}
                    </div>
                  )}
                </div>
                <div className="px-5 mt-4">
                  <h4 className="font-bold text-lg line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {video.title}
                  </h4>
                  <p className="text-sm font-black text-slate-400 mt-1 uppercase tracking-tighter">{video.channel}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="bg-slate-100 dark:bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Search size={32} className="text-slate-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold">No videos found</h3>
                <p className="text-slate-400">Try searching for something else or check your connection.</p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Main Expanded Player */}
      {activeVideo && !isMinimized && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 md:p-8 bg-slate-950/98 backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-500">
          <div className="w-full max-w-5xl flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={closePlayer} className="text-white bg-white/10 hover:bg-white/20 p-3 rounded-full border border-white/10 transition-colors">
                <X size={24} />
              </button>
              <div>
                <h3 className="text-white font-black text-lg truncate max-w-[200px] md:max-w-xl">{activeVideo.title}</h3>
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">{activeVideo.channel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMinimized(true)}
                className="text-white/70 hover:text-white p-3 bg-white/5 rounded-2xl border border-white/10 transition-colors"
                title="Minimize Class"
              >
                <Minimize2 size={20} />
              </button>
            </div>
          </div>
          
          <div className="w-full max-w-5xl aspect-video rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.4)] bg-black ring-1 ring-white/20">
            <iframe
              src={`https://www.youtube.com/embed/${getYoutubeId(activeVideo.url)}?autoplay=1&modestbranding=1&rel=0`}
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Mini-Player (Floating Bar) */}
      {activeVideo && isMinimized && (
        <div className="fixed bottom-24 md:bottom-10 right-4 md:right-10 z-[150] w-full max-w-[320px] glass rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-right-10 duration-500">
          <div className="relative aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${getYoutubeId(activeVideo.url)}?autoplay=1&modestbranding=1&controls=0`}
              className="w-full h-full border-none pointer-events-none"
            />
            <div className="absolute inset-0 bg-transparent flex items-start justify-end p-2 gap-1 bg-gradient-to-b from-black/40 via-transparent to-transparent">
              <button onClick={() => setIsMinimized(false)} className="bg-white/20 backdrop-blur-md p-1.5 rounded-full text-white hover:bg-white/40">
                <Maximize2 size={14} />
              </button>
              <button onClick={closePlayer} className="bg-white/20 backdrop-blur-md p-1.5 rounded-full text-white hover:bg-white/40">
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="p-4">
            <h5 className="text-[11px] font-black text-slate-700 dark:text-slate-200 line-clamp-1">{activeVideo.title}</h5>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{activeVideo.channel}</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default VideoLibrary;
