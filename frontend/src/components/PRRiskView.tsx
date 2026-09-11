import React, { useState } from 'react';
import { ShieldAlert, GitPullRequest, FileCode, CheckSquare, AlertOctagon, Play } from 'lucide-react';
import { api } from '../services/api';

export const PRRiskView: React.FC = () => {
  const [prNumber, setPrNumber] = useState<number>(142);
  const [title, setTitle] = useState('Refactor payment subscription logic');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const data = await api.analyzePR(prNumber, title);
    setAnalysis(data);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <GitPullRequest className="w-4 h-4" />
          <span>Pull Request Risk Analyzer</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Evaluate PR Impact & Regression Risks</h2>
        <p className="text-sm text-slate-400 mt-1">
          Predicts downstream system impacts, breaking changes, and critical test suites for pull requests.
        </p>
      </div>

      {/* Form Input */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">PR Number</label>
            <input
              type="number"
              value={prNumber}
              onChange={(e) => setPrNumber(Number(e.target.value))}
              className="w-full bg-[#0B0F17] border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">PR Title / Description</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0B0F17] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isAnalyzing ? 'Analyzing Dependencies...' : 'Analyze PR Impact'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Risk Level Badge Card */}
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-rose-500 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <AlertOctagon className="w-5 h-5 text-rose-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Calculated Risk Rating</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">PR #{analysis.pr_number} — {analysis.title}</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {analysis.risk_summary}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center shrink-0">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Risk Rating</div>
              <div className="text-2xl font-extrabold text-rose-500">{analysis.risk_level} RISK</div>
              <div className="text-[10px] text-slate-400">{analysis.confidence}% Confidence</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Affected Features */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span>Potentially Affected Features</span>
              </h3>

              <div className="space-y-2">
                {analysis.affected_features.map((feat: string, idx: number) => (
                  <div key={idx} className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-xs font-medium text-slate-200 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Modified Files</div>
                <div className="flex flex-wrap gap-2">
                  {analysis.modified_files.map((file: string, idx: number) => (
                    <span key={idx} className="text-xs font-mono bg-slate-900 border border-slate-800 text-indigo-300 px-2.5 py-1 rounded-lg">
                      {file}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Tests */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>Recommended Test Matrix</span>
              </h3>

              <div className="space-y-2.5">
                {analysis.recommended_tests.map((testItem: any, idx: number) => (
                  <div key={idx} className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-medium">✓ {testItem.test}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      testItem.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {testItem.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
