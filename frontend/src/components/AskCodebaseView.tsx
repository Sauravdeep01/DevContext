import React, { useState } from 'react';
import { MessageSquare, Search, FileCode, CheckCircle, ArrowRight, Layers } from 'lucide-react';
import { AskResponse } from '../types';
import { api } from '../services/api';

export const AskCodebaseView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [response, setResponse] = useState<AskResponse | null>(null);


  const sampleQuestions = [
    "Where is authentication implemented?",
    "How does the payment flow work?",
    "Where is Redis being used?",
    "Which API creates an order?",
    "Explain the architecture of this repository.",
    "Which files handle user registration?"
  ];

  const handleSearch = async (q?: string) => {
    const activeQuery = q || query;
    if (!activeQuery.trim()) return;

    setIsSearching(true);
    const res = await api.askCodebase(activeQuery);
    setResponse(res);
    setIsSearching(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <MessageSquare className="w-4 h-4" />
          <span>Ask Your Codebase — RAG Layer</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Semantic Code Search & Q&A</h2>
        <p className="text-sm text-slate-400 mt-1">
          Query codebase architecture, component relationships, and specific API flows using AST-aware vector retrieval.
        </p>
      </div>

      {/* Query Search Form */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Ask anything about your codebase..."
            className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl pl-4 pr-32 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-sans"
          />
          <button
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 rounded-lg transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isSearching ? 'Retrieving...' : 'Ask AI'}</span>
          </button>
        </div>

        {/* Sample Question Chips */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Suggested Prompts
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(q);
                  handleSearch(q);
                }}
                className="text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg px-3 py-1.5 transition-all text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results */}
      {response && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Answer Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4" />
              <span>AI Synthesized Architecture Answer</span>
            </h3>

            <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
              {response.answer}
            </div>

            {/* Relevant Files Badges */}
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-400 uppercase mb-2">Relevant Files Referenced</div>
              <div className="flex flex-wrap gap-2">
                {response.relevant_files.map((file, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center space-x-1 text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg"
                  >
                    <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{file}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Structural Code Chunks Retrieved */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>Retrieved Code Chunks ({response.retrieved_chunks.length})</span>
            </h3>

            <div className="space-y-4">
              {response.retrieved_chunks.map((chunk, idx) => (
                <div key={idx} className="bg-[#0B0F17] rounded-xl border border-slate-800 p-4 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-indigo-300">{chunk.file_path}</span>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 uppercase">
                        {chunk.chunk_type}: {chunk.name}
                      </span>
                    </div>
                    <span className="text-slate-400 text-[10px]">Lines {chunk.start_line} - {chunk.end_line}</span>
                  </div>

                  <pre className="text-slate-300 overflow-x-auto pt-2 leading-relaxed">
                    {chunk.content}
                  </pre>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
