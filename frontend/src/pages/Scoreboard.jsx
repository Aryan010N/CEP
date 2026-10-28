import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCommunity } from '../context/CommunityContext';
import { 
  Sparkles, 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Users, 
  Zap,
  Star
} from 'lucide-react';
import StatsCard from '../components/StatsCard';

export default function Scoreboard() {
  const { currentUser } = useAuth();
  const { tickets, challenges, activeCommunity, getNomenclature } = useCommunity();
  const nom = getNomenclature();

  const communityTickets = tickets.filter(t => t.community_id === activeCommunity?.community_id);
  const resolvedCount = communityTickets.filter(t => t.status === 'Resolved').length;
  const verifiedCount = communityTickets.filter(t => t.status === 'Verified_By_Rep' || t.status === 'In_Progress' || t.status === 'Resolved').length;

  // Wing Resolution Metrics
  const wings = activeCommunity?.wings || ["Wing A", "Wing B", "Wing C", "Wing D"];
  const wingStats = wings.map(w => {
    const total = communityTickets.filter(t => t.wing === w).length;
    const resolved = communityTickets.filter(t => t.wing === w && t.status === 'Resolved').length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 100;
    return { wing: w, total, resolved, rate };
  });

  // Top Contributors Leaderboard
  const leaderBoardUsers = [
    { name: "Aarav Sharma", role: "Resident / Student", wing: "Wing A", credits: 450, solvedCount: 8, badge: "🏆 Lead Innovator" },
    { name: "Vikram Malhotra", role: "Wing Representative", wing: "Wing A", credits: 380, solvedCount: 14, badge: "🛡️ Master Verifier" },
    { name: "Aryam Verma", role: "Resident / Student", wing: "Wing B", credits: 290, solvedCount: 5, badge: "⭐ Rapid Reporter" },
    { name: "Priya Nair", role: "Resident", wing: "Tower 1", credits: 210, solvedCount: 4, badge: "🥈 Active Citizen" },
    { name: "Rohan Das", role: "Student Volunteer", wing: "Wing C", credits: 160, solvedCount: 3, badge: "🥉 Civic Hacker" }
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel p-5 sm:p-7 rounded-2xl border border-amber-500/30 relative overflow-hidden bg-gradient-to-br from-amber-950/40 via-slate-900/60 to-slate-950/90">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Community Engagement & CEP Credit Gamification Scoreboard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Impact Honor Roll & Wing Velocity
          </h2>
          <p className="text-xs text-slate-300/90 leading-relaxed">
            Gamified recognition pipeline for active student innovators, diligent Wing Representatives, and community contributors in {activeCommunity?.name}. Earn CEP credits by reporting verified issues and claiming NGO technical challenges.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatsCard
          title="Total Resolved Issues"
          value={resolvedCount}
          subtitle="Closed infrastructural bottlenecks"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title="Verification Velocity"
          value={verifiedCount}
          subtitle="Sanity-checked by Wing Reps"
          icon={ShieldCheck}
          color="indigo"
        />
        <StatsCard
          title="Active NGO Challenges"
          value={challenges.filter(c => c.status === 'Open').length}
          subtitle="Available for student credits"
          icon={Sparkles}
          color="amber"
        />
      </div>

      {/* Main Grid: Wing Velocity + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Wing Resolution Velocity */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>{nom.division_label} Resolution Velocity</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Live Sprints</span>
          </div>

          <div className="space-y-3.5">
            {wingStats.map(stat => (
              <div key={stat.wing} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{stat.wing}</span>
                  <span className="text-slate-400 font-mono">
                    {stat.resolved} / {stat.total} resolved ({stat.rate}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(stat.rate, 5)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Top Contributors Leaderboard */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Medal className="w-4 h-4 text-amber-400" />
              <span>Top Impact Contributors (CEP Credits)</span>
            </h3>
            <span className="text-[11px] text-amber-400 font-bold">Monthly Board</span>
          </div>

          <div className="space-y-2.5">
            {leaderBoardUsers.map((user, idx) => (
              <div 
                key={user.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    idx === 0 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : idx === 1
                      ? 'bg-slate-300/20 text-slate-200 border border-slate-400/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400">{user.role} • {user.wing}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-amber-400 flex items-center justify-end gap-1 font-mono">
                    <Sparkles className="w-3 h-3" />
                    {user.credits} pts
                  </p>
                  <span className="text-[9px] font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                    {user.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gamification Rule Explanation */}
      <div className="glass-panel p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>
            <strong>How CEP Credits Work:</strong> Log a verified issue (+20 credits), Upvote priority issues (+5 credits), or Complete an NGO challenge (+200-500 credits). Credits reflect on your academic certificate!
          </span>
        </div>
        <div className="px-3 py-1 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-[11px] shrink-0">
          Your Balance: {currentUser?.cepCredits || 0} pts
        </div>
      </div>
    </div>
  );
}

