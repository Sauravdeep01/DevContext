import React from 'react';
import { Terminal, Github, RefreshCw, FolderGit2 } from 'lucide-react';

interface NavbarProps {
  currentRepo: string;
  setCurrentRepo: (repo: string) => void;
  isIndexing: boolean;
  onIndexRepo: (path?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRepo, setCurrentRepo, isIndexing, onIndexRepo }) => {
  return (
    <header className="h-16 glass-panel sticky top-0 z-40 border-b border-slate-800/80 px-6 flex items-center justify-between">
      {/* Brand & Identity */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
            <Terminal className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-lg tracking-tight text-white">DevContext</h1>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AI Platform
            </span>
          </div>
          <p className="text-xs text-slate-400">Developer Investigation & Root Cause Engine</p>
        </div>
      </div>

      {/* Connection Bar for Real Repositories */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl mx-8">
        <div className="relative w-full flex items-center">
          <FolderGit2 className="w-4 h-4 text-indigo-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={currentRepo}
            onChange={(e) => setCurrentRepo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onIndexRepo(currentRepo)}
            placeholder="Enter local repository folder path (e.g. C:/Projects/my-app)..."
            className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl pl-9 pr-36 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 transition-all"
          />
          <button
            onClick={() => onIndexRepo(currentRepo)}
            disabled={isIndexing || !currentRepo.trim()}
            className="absolute right-1 top-1 bottom-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 rounded-lg transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isIndexing ? 'animate-spin' : ''}`} />
            <span>{isIndexing ? 'Indexing...' : 'Index Repo'}</span>
          </button>
        </div>
      </div>

      {/* System Status Pill */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Engine Active</span>
        </div>
      </div>
    </header>
  );
};
