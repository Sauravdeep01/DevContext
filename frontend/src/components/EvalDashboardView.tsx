import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle2, Zap, AlertTriangle, Play, Cpu, ShieldCheck } from 'lucide-react';
import { EvalMetrics } from '../types';
import { api } from '../services/api';

export const EvalDashboardView: React.FC = () => {
  const [metrics, setMetrics] = useState<EvalMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runBenchmark();
  }, []);

  const runBenchmark = async () => {
    setLoading(true);
    const data = await api.getEvalMetrics();
    setMetrics(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>AI Evaluation Engine & Ground Truth Benchmarks</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">AI Agent System Benchmark Dashboard</h2>
          <p className="text-sm text-slate-400 mt-1">
            Measures prompt tuning, retrieval accuracy, evidence relevance, and latency across ground-truth debugging scenarios.
          </p>
        </div>

        <button
          onClick={runBenchmark}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Re-Run Benchmark Suite</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      {metrics && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            {/* Root Cause Accuracy */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Root Cause Accuracy</div>
              <div className="text-3xl font-extrabold text-emerald-400">{metrics.summary.root_cause_accuracy_pct}%</div>
              <div className="text-[10px] text-emerald-300 font-mono">Target: &gt;85%</div>
            </div>

            {/* Evidence Relevance */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Evidence Relevance</div>
              <div className="text-3xl font-extrabold text-indigo-400">{metrics.summary.evidence_relevance_pct}%</div>
              <div className="text-[10px] text-indigo-300 font-mono">Target: &gt;90%</div>
            </div>

            {/* Retrieval Accuracy */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Retrieval Accuracy</div>
              <div className="text-3xl font-extrabold text-cyan-400">{metrics.summary.retrieval_accuracy_pct}%</div>
              <div className="text-[10px] text-cyan-300 font-mono">Target: &gt;90%</div>
            </div>

            {/* False Positive Rate */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">False Positive Rate</div>
              <div className="text-3xl font-extrabold text-rose-400">{metrics.summary.false_positive_rate_pct}%</div>
              <div className="text-[10px] text-rose-300 font-mono">Target: &lt;10%</div>
            </div>

            {/* Latency */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Latency</div>
              <div className="text-3xl font-extrabold text-amber-400">{metrics.summary.avg_latency_sec}s</div>
              <div className="text-[10px] text-amber-300 font-mono">Multi-Agent Pipeline</div>
            </div>

          </div>

          {/* Benchmark Scenario Table */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Ground Truth Debugging Benchmark Scenarios</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-2">Scenario Title</th>
                    <th className="pb-3 px-2">Expected Ground Truth</th>
                    <th className="pb-3 px-2">AI Predicted Root Cause</th>
                    <th className="pb-3 px-2">Accuracy Result</th>
                    <th className="pb-3 px-2">Confidence</th>
                    <th className="pb-3 px-2">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {metrics.scenario_results.map((sc, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-3 px-2 font-sans font-medium text-slate-200">{sc.title}</td>
                      <td className="py-3 px-2 text-indigo-300">{sc.expected}</td>
                      <td className="py-3 px-2 text-slate-300">{sc.predicted}</td>
                      <td className="py-3 px-2">
                        {sc.correct ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>PASSED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-[10px]">
                            <AlertTriangle className="w-3 h-3" />
                            <span>FAILED</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-slate-300">{sc.confidence}%</td>
                      <td className="py-3 px-2 text-amber-400">{sc.latency_sec}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
