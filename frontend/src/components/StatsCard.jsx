import React from 'react';

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, color = "indigo" }) {
  const colorMap = {
    indigo: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400",
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
    amber: "border-amber-500/20 bg-amber-500/5 text-amber-400",
    purple: "border-purple-500/20 bg-purple-500/5 text-purple-400",
    rose: "border-rose-500/20 bg-rose-500/5 text-rose-400",
    cyan: "border-cyan-500/20 bg-cyan-500/5 text-cyan-400"
  };

  const iconColor = colorMap[color] || colorMap.indigo;

  return (
    <div className="glass-panel p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 relative overflow-hidden group min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">{title}</p>
          <p className="text-lg sm:text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight truncate">{value}</p>
          {subtitle && (
            <p className="text-[10px] sm:text-xs text-slate-400 pt-0.5 sm:pt-1 flex items-center gap-1 truncate">
              {trend && (
                <span className="font-semibold text-emerald-400">
                  {trend}
                </span>
              )}
              <span className="truncate">{subtitle}</span>
            </p>
          )}
        </div>
        <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl border ${iconColor} group-hover:scale-110 transition-transform duration-300 shrink-0`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        </div>
      </div>
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors pointer-events-none" />
    </div>
  );
}
