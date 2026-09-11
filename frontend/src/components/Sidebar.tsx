import React from 'react';
import { Search, MessageSquare, GitCommit, ShieldAlert, BarChart3, FolderGit2 } from 'lucide-react';

export type TabType = 'investigate' | 'ask' | 'timeline' | 'pr' | 'eval';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    {
      id: 'investigate' as TabType,
      label: 'Error Investigator',
      subLabel: 'Multi-Agent Root Cause',
      icon: Search,
      badge: 'Core'
    },
    {
      id: 'ask' as TabType,
      label: 'Ask Your Codebase',
      subLabel: 'RAG Code Search',
      icon: MessageSquare,
    },
    {
      id: 'timeline' as TabType,
      label: 'What Changed?',
      subLabel: 'Commit & Error Correlation',
      icon: GitCommit,
    },
    {
      id: 'pr' as TabType,
      label: 'PR Risk Analyzer',
      subLabel: 'Impact & Test Matrix',
      icon: ShieldAlert,
    },
    {
      id: 'eval' as TabType,
      label: 'AI Evaluation',
      subLabel: 'Accuracy & Latency Metrics',
      icon: BarChart3,
      badge: 'Benchmark'
    }
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Investigation Modules
          </h2>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${
                    isActive
                      ? 'bg-indigo-600/20 border border-indigo-500/40 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-semibold text-sm leading-tight">{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{item.subLabel}</div>
                    </div>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="glass-card rounded-xl p-3 border border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center space-x-2 text-indigo-400 font-semibold mb-1">
          <FolderGit2 className="w-4 h-4" />
          <span>DevContext Microservices</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Connected to local codebase & git commits. Evidence-backed reasoning enabled.
        </p>
      </div>
    </aside>
  );
};
