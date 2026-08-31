import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';

export default function Toast() {
  const { toast } = useCommunity();

  if (!toast) return null;

  const typeStyles = {
    success: "border-emerald-500/50 bg-slate-900/95 text-emerald-300 shadow-emerald-900/20",
    error: "border-rose-500/50 bg-slate-900/95 text-rose-300 shadow-rose-900/20",
    warning: "border-amber-500/50 bg-slate-900/95 text-amber-300 shadow-amber-900/20",
    info: "border-indigo-500/50 bg-slate-900/95 text-indigo-300 shadow-indigo-900/20"
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-in transition-all">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-xl ${typeStyles[toast.type] || typeStyles.info}`}>
        {icons[toast.type] || icons.info}
        <div className="flex-1 text-sm font-medium text-slate-100">
          {toast.message}
        </div>
      </div>
    </div>
  );
}
