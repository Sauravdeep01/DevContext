import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { InvestigationView } from './components/InvestigationView';
import { AskCodebaseView } from './components/AskCodebaseView';
import { WhatChangedView } from './components/WhatChangedView';
import { PRRiskView } from './components/PRRiskView';
import { EvalDashboardView } from './components/EvalDashboardView';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('investigate');
  const [currentRepo, setCurrentRepo] = useState<string>('c:/Users/Asus/OneDrive/Desktop/DevContext');
  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<boolean>(false);

  const handleIndexRepo = async (overridePath?: string) => {
    const targetPath = overridePath || currentRepo;
    if (!targetPath.trim()) return;

    setIsIndexing(true);
    try {
      const res = await api.indexRepo(targetPath);
      setIsIndexing(false);
      
      if (res.status === 'success') {
        setToastError(false);
        setToastMessage(`Indexed ${res.files_indexed} files & ${res.chunks_indexed} chunks! (${res.secrets_redacted} secrets redacted)`);
      } else {
        setToastError(true);
        setToastMessage(res.detail || 'Failed to index repository path');
      }
    } catch (err: any) {
      setIsIndexing(false);
      setToastError(true);
      setToastMessage(err.message || 'Error indexing repository');
    }

    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] flex flex-col font-sans text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-20 right-6 z-50 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top duration-300 ${
          toastError ? 'bg-rose-600' : 'bg-emerald-600'
        }`}>
          {toastError ? '⚠️ ' : '✓ '}{toastMessage}
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentRepo={currentRepo}
        setCurrentRepo={setCurrentRepo}
        isIndexing={isIndexing}
        onIndexRepo={handleIndexRepo}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Menu */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'investigate' && <InvestigationView repoPath={currentRepo} />}
          {activeTab === 'ask' && <AskCodebaseView />}
          {activeTab === 'timeline' && <WhatChangedView />}
          {activeTab === 'pr' && <PRRiskView />}
          {activeTab === 'eval' && <EvalDashboardView />}
        </main>
      </div>
    </div>
  );
}

export default App;
