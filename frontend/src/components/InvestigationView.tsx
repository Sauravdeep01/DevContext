import React, { useState } from 'react';
import { Search, Sparkles, CheckCircle, AlertOctagon, GitCommit, FileCode, Check, ThumbsUp, ThumbsDown, ArrowRight, Play, ShieldAlert, Database, FileText } from 'lucide-react';
import { InvestigationReport } from '../types';
import { api } from '../services/api';
import { CodeViewerModal } from './CodeViewerModal';

interface InvestigationViewProps {
  repoPath?: string;
}

export const InvestigationView: React.FC<InvestigationViewProps> = ({ repoPath }) => {
  const [errorInput, setErrorInput] = useState('');
  const [stackTraceInput, setStackTraceInput] = useState('');
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [report, setReport] = useState<InvestigationReport | null>(null);
  
  // Feedback State
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [feedbackType, setFeedbackType] = useState<string>('');

  // Code Modal State
  const [codeModal, setCodeModal] = useState<{ isOpen: boolean; file: string; line: number; snippet?: string }>({
    isOpen: false,
    file: '',
    line: 0
  });

  const handleRunInvestigation = async () => {
    if (!errorInput.trim() && !stackTraceInput.trim()) return;

    setIsInvestigating(true);
    setFeedbackSubmitted(false);
    setRating(null);

    const res = await api.investigateError(errorInput, stackTraceInput, repoPath);
    setReport(res);
    setIsInvestigating(false);
  };

  const handleFeedback = async (type: 'positive' | 'negative') => {
    setRating(type);
    if (report) {
      await api.submitFeedback(report.investigation_id, type, feedbackType);
      setFeedbackSubmitted(true);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>AI Error Investigator</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Investigate Real Application & API Issues</h2>
        <p className="text-sm text-slate-400 mt-1">
          Enter an error message or stack trace from your application. Multi-agent AI will correlate your indexed codebase, git commits, and database context.
        </p>
      </div>

      {/* Input Form */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-800">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
            Error Message / Problem Description
          </label>
          <input
            type="text"
            value={errorInput}
            onChange={(e) => setErrorInput(e.target.value)}
            placeholder="e.g. TypeError: Cannot read property 'id' of undefined or 'Why is user registration failing?'"
            className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-sans"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-2">
            Stack Trace / Log Output (Optional)
          </label>
          <textarea
            rows={4}
            value={stackTraceInput}
            onChange={(e) => setStackTraceInput(e.target.value)}
            placeholder="Paste raw stack trace, exception logs, or terminal output here..."
            className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleRunInvestigation}
            disabled={isInvestigating || (!errorInput.trim() && !stackTraceInput.trim())}
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {isInvestigating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Codebase & Logs...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Investigation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Investigation Results Report */}
      {report && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Agent Execution Pipeline Status */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Multi-Agent Orchestration Execution Flow
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { name: "Log Agent", icon: FileText, color: "text-amber-400" },
                { name: "Code Agent", icon: FileCode, color: "text-cyan-400" },
                { name: "Git Agent", icon: GitCommit, color: "text-indigo-400" },
                { name: "Database Agent", icon: Database, color: "text-emerald-400" },
                { name: "Doc Agent", icon: Sparkles, color: "text-pink-400" }
              ].map((agent, i) => {
                const Icon = agent.icon;
                const trace = report.agent_traces?.find(t => t.agent.toLowerCase().includes(agent.name.toLowerCase()));
                return (
                  <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center space-y-1">
                    <div className="flex items-center justify-center space-x-1.5 text-xs font-semibold text-white">
                      <Icon className={`w-3.5 h-3.5 ${agent.color}`} />
                      <span>{agent.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate px-1">
                      {trace?.findings?.[0] || "Completed"}
                    </div>
                    <div className="inline-flex items-center space-x-1 text-[9px] text-emerald-400">
                      <Check className="w-2.5 h-2.5" />
                      <span>Executed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Root Cause Card & Confidence */}
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-rose-500 border border-slate-800 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertOctagon className="w-5 h-5 text-rose-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Probable Root Cause</span>
                </div>
                
                {/* Clickable Line Link */}
                <button
                  onClick={() => setCodeModal({
                    isOpen: true,
                    file: report.root_cause.file,
                    line: report.root_cause.line,
                    snippet: report.root_cause.code_snippet
                  })}
                  className="group flex items-center space-x-2 text-xl font-mono font-bold text-white hover:text-indigo-400 transition-colors underline decoration-dashed underline-offset-4 decoration-indigo-400"
                >
                  <span>{report.root_cause.file}:{report.root_cause.line}</span>
                  <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                  {report.root_cause.summary}
                </p>
              </div>

              {/* Confidence Badge */}
              <div className="text-right shrink-0 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-slate-400">Confidence Score</div>
                <div className="text-3xl font-extrabold text-indigo-400">{report.confidence_score}%</div>
                <div className="text-[10px] text-emerald-400 font-medium">EVIDENCE SCORE</div>
              </div>
            </div>

            {/* Code Snippet Box */}
            {report.root_cause.code_snippet && (
              <div className="mt-4 bg-[#0B0F17] p-4 rounded-xl border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto max-h-40">
                <div className="text-[10px] text-slate-500 uppercase mb-1">Code Context</div>
                <pre>{report.root_cause.code_snippet}</pre>
              </div>
            )}
          </div>

          {/* Evidence Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Supporting Evidence */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Supporting Evidence ({report.evidence.length})</span>
                </h3>
              </div>

              <div className="space-y-3">
                {report.evidence.length === 0 ? (
                  <div className="text-xs text-slate-400">No specific evidence items parsed. Make sure your repository is indexed.</div>
                ) : (
                  report.evidence.map((item, idx) => (
                    <div key={idx} className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-indigo-300 font-medium">{item.source_reference}</span>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                          {(item.relevance_score * 100).toFixed(0)}% Relevance
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-normal">
                        ✓ {item.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Git Commit & Impacted Stats */}
            <div className="space-y-6">
              
              {/* Correlated Commit */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                    <GitCommit className="w-4 h-4 text-indigo-400" />
                    <span>Correlated Commit</span>
                  </h3>
                  <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-500/30">
                    {report.correlated_commit.hash || report.correlated_commit.commit_hash || 'HEAD'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-slate-200 font-semibold leading-snug">
                    "{report.correlated_commit.message || 'No commit message recorded'}"
                  </div>
                  <div className="flex items-center space-x-4 text-slate-400">
                    <span>Author: <strong className="text-slate-200">{report.correlated_commit.author || 'dev'}</strong></span>
                    <span>Time: <strong className="text-slate-200">{report.correlated_commit.timestamp || 'recent'}</strong></span>
                  </div>
                </div>
              </div>

              {/* Recommended Next Steps */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Recommended Next Steps</span>
                </h3>
                <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside font-medium">
                  {report.recommended_next_steps.map((step, idx) => (
                    <li key={idx} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

            </div>
          </div>

          {/* Developer Feedback Widget */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Was this investigation useful?</h4>
              <p className="text-xs text-slate-400">Your feedback evaluates and tunes the AI agent prompt strategies.</p>
            </div>

            {feedbackSubmitted ? (
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                <Check className="w-4 h-4" />
                <span>Thank you! Feedback recorded for evaluation engine.</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleFeedback('positive')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    rating === 'positive'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>👍 Correct</span>
                </button>

                <button
                  onClick={() => handleFeedback('negative')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    rating === 'negative'
                      ? 'bg-rose-600 text-white border-rose-500'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>👎 Incorrect</span>
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Code Viewer Modal */}
      <CodeViewerModal
        isOpen={codeModal.isOpen}
        onClose={() => setCodeModal({ ...codeModal, isOpen: false })}
        filePath={codeModal.file}
        line={codeModal.line}
        snippet={codeModal.snippet}
      />
    </div>
  );
};
