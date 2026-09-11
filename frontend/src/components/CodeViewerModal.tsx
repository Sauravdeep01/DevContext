import React from 'react';
import { X, FileCode, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string;
  line: number;
  snippet?: string;
}

export const CodeViewerModal: React.FC<CodeViewerModalProps> = ({
  isOpen,
  onClose,
  filePath,
  line,
  snippet
}) => {
  if (!isOpen) return null;

  const defaultSnippet = snippet || `export class PaymentService {
  async processPayment(user: UserPaymentProfile, amount: number) {
    console.log(\`Processing payment of $\${amount} for user \${user.id}\`);

    // Line 142: Missing null check on user.paymentMethod
    const defaultCardId = user.paymentMethod.id; 

    return {
      success: true,
      transactionId: \`tx_\${Date.now()}\`,
      cardId: defaultCardId
    };
  }
}`;

  const lines = defaultSnippet.split('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-panel max-w-3xl w-full rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-semibold text-sm text-white">{filePath}</h3>
              <p className="text-xs text-slate-400">Target Line Reference: <span className="text-amber-400 font-mono">Line {line}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Content View */}
        <div className="p-6 bg-[#0B0F17] font-mono text-xs overflow-x-auto max-h-[60vh]">
          <div className="space-y-1">
            {lines.map((l, i) => {
              const currentLineNum = line - Math.floor(lines.length / 2) + i;
              const isTargetLine = currentLineNum === line || l.includes('paymentMethod.id');

              return (
                <div
                  key={i}
                  className={`flex items-start space-x-4 py-1 px-3 rounded ${
                    isTargetLine
                      ? 'bg-rose-500/20 border-l-4 border-rose-500 text-rose-200 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <span className="w-10 shrink-0 text-slate-400 text-right select-none">{currentLineNum}</span>
                  <span className="flex-1 whitespace-pre">{l}</span>
                  {isTargetLine && (
                    <span className="shrink-0 flex items-center space-x-1 text-[10px] bg-rose-500/30 text-rose-300 px-2 py-0.5 rounded font-sans">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Root Cause Exception</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendation Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Recommended Fix: Use optional chaining <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">user?.paymentMethod?.id</code></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-all"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
