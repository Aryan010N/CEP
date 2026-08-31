import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCommunity } from '../context/CommunityContext';
import { 
  Home, 
  PlusCircle, 
  ShieldCheck, 
  Layers, 
  Award, 
  BarChart3, 
  Building2, 
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const { role, currentUser } = useAuth();
  const { tickets, challenges, activeCommunity, getNomenclature } = useCommunity();
  const nom = getNomenclature();

  // Calculate badge counts for active community
  const communityTickets = tickets.filter(t => t.community_id === activeCommunity?.community_id);
  
  const pendingRepTickets = communityTickets.filter(
    t => t.status === 'Submitted' && (!currentUser?.wing || t.wing === currentUser?.wing)
  ).length;

  const totalActiveTickets = communityTickets.filter(
    t => t.status !== 'Resolved' && t.status !== 'Rejected'
  ).length;

  const openChallengesCount = challenges.filter(c => c.status === 'Open').length;

  const navItemsByRole = {
    resident: [
      { id: 'resident_dashboard', label: `${nom.reporter_label} Portal`, icon: Home },
      { id: 'community_feed', label: 'Community Live Board', icon: Layers },
      { id: 'ngo_marketplace', label: 'NGO Problem Hub', icon: Award, count: openChallengesCount },
    ],
    wing_rep: [
      { id: 'rep_backlog', label: `${nom.verifier_label} Queue`, icon: ShieldCheck, count: pendingRepTickets, highlight: true },
      { id: 'community_feed', label: 'All Community Tickets', icon: Layers },
      { id: 'ngo_marketplace', label: 'NGO Problem Hub', icon: Award, count: openChallengesCount },
    ],
    admin: [
      { id: 'admin_dashboard', label: `${nom.authority_label} Hub`, icon: Home, count: totalActiveTickets },
      { id: 'admin_analytics', label: 'AI Analytics & Reports', icon: BarChart3 },
      { id: 'community_feed', label: 'Aggregated Feed', icon: Layers },
      { id: 'ngo_marketplace', label: 'NGO Challenges Hub', icon: Award, count: openChallengesCount },
    ],
    ngo: [
      { id: 'ngo_marketplace', label: 'NGO Marketplace', icon: Award },
      { id: 'community_feed', label: 'Observatory Feed', icon: Layers },
    ]
  };

  const items = navItemsByRole[role] || navItemsByRole.resident;

  return (
    <aside className="hidden lg:block w-60 shrink-0">
      <div className="glass-panel rounded-2xl border border-slate-800/80 p-4 sticky top-20 space-y-5">
        
        {/* Active Community Pill */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Community Node</span>
          </div>
          <p className="text-xs font-bold text-slate-200 truncate">
            {activeCommunity?.name || "Campus Community"}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
            <span>{nom.division_label}:</span>
            <span className="font-semibold text-indigo-300 font-mono">
              {currentUser?.wing || "All"}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
            Menu
          </p>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium touch-press transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                    item.highlight 
                      ? 'bg-emerald-500 text-slate-950 font-extrabold animate-pulse' 
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Hierarchy Information Tag */}
        <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-950/20 text-slate-300 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Hierarchy</span>
          </div>
          <div className="text-[10px] text-slate-400 space-y-0.5">
            <p>1. {nom.reporter_label}</p>
            <p className="text-emerald-400">2. {nom.verifier_label}</p>
            <p className="text-purple-400">3. {nom.authority_label}</p>
          </div>
        </div>

      </div>
    </aside>
  );
}
