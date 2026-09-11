import React, { useState, useEffect } from 'react';
import { GitCommit, AlertTriangle, CheckCircle, Clock, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { api } from '../services/api';

export const WhatChangedView: React.FC = () => {
  const [timelineData, setTimelineData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    setLoading(true);
    const data = await api.getGitTimeline();
    setTimelineData(data);
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
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <GitCommit className="w-4 h-4" />
          <span>Git Intelligence & Timeline Correlation</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">"What Changed Before This Issue Started?"</h2>
        <p className="text-sm text-slate-400 mt-1">
          Correlates deployment timelines, changed files, and commit timestamps against production error log spikes.
        </p>
      </div>

      {/* Correlation Card */}
      <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-amber-500 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold text-amber-400">Potentially Correlated Deployment</div>
              <h3 className="text-lg font-mono font-bold text-white">Commit {timelineData.correlated_commit.hash}</h3>
            </div>
          </div>
          
          <div className="bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Correlation Level</div>
            <div className="text-sm font-bold text-amber-400">{timelineData.correlation_level} CORRELATION</div>
          </div>
        </div>

        {/* Commit Details */}
        <div className="bg-[#0B0F17] p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="text-slate-200 font-medium">"{timelineData.correlated_commit.message}"</div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Author: <strong className="text-slate-200">{timelineData.correlated_commit.author}</strong></span>
            <span>Time: <strong className="text-slate-200">{timelineData.correlated_commit.timestamp}</strong></span>
          </div>
          <div className="text-slate-400 pt-2 border-t border-slate-800">
            Modified Files: <code className="text-indigo-300 font-mono">{timelineData.correlated_commit.files_changed.join(', ')}</code>
          </div>
        </div>

        {/* Correlation vs Certainty Guardrail Note */}
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3 rounded-xl text-xs flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Correlation vs Certainty Note:</strong> {timelineData.distinction_note} DevContext classifies this as <em>"Likely related"</em> based on file overlap and deployment proximity.
          </span>
        </div>
      </div>

      {/* Visual Timeline Comparison */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Timeline Event Sequence (Healthy → Change → Error Spike)</span>
        </h3>

        <div className="relative pl-6 border-l-2 border-slate-800 space-y-8">
          {timelineData.timeline_events.map((event: any, idx: number) => {
            const isError = event.type === 'error';
            const isCommit = event.type === 'commit';
            const isHealth = event.type === 'health';

            return (
              <div key={idx} className="relative">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 bg-[#0B0F17] ${
                    isError
                      ? 'border-rose-500 shadow-lg shadow-rose-500/50'
                      : isCommit
                      ? 'border-amber-400 shadow-lg shadow-amber-400/50'
                      : 'border-emerald-400 shadow-lg shadow-emerald-400/50'
                  }`}
                ></div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-indigo-400 font-bold">{event.time}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-sans uppercase font-bold ${
                        isError
                          ? 'bg-rose-500/20 text-rose-300'
                          : isCommit
                          ? 'bg-amber-400/20 text-amber-300'
                          : 'bg-emerald-400/20 text-emerald-300'
                      }`}
                    >
                      {event.type}
                    </span>
                  </div>
                  <div className="text-sm text-slate-200 font-medium">{event.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
