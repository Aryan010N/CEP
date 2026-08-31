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
    <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-3xl font-extrabold text-slate-100 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 pt-1 flex items-center gap-1.5">
              {trend && (
                <span className="font-semibold text-emerald-400">
                  {trend}
                </span>
              )}
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors pointer-events-none" />
    </div>
  );
}
