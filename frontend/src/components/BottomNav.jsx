import React from 'react';
import { Home, Layers, PlusCircle, Award, Building2, ShieldCheck, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCommunity } from '../context/CommunityContext';

export default function BottomNav({ currentTab, setCurrentTab, onOpenCommunityModal, onOpenNewComplaint }) {
  const { role } = useAuth();
  const { tickets, challenges } = useCommunity();

  const openChallengesCount = challenges.filter(c => c.status === 'Open').length;
  const pendingTicketsCount = tickets.filter(t => t.status === 'Submitted').length;

  const getMainTabId = () => {
    if (role === 'wing_rep') return 'rep_backlog';
    if (role === 'admin') return 'admin_dashboard';
    if (role === 'ngo') return 'ngo_marketplace';
    return 'resident_dashboard';
  };

  const mainTabId = getMainTabId();

  // Role-specific nav items (max 4 items + center action)
  const getNavItems = () => {
    switch (role) {
      case 'wing_rep':
        return [
          { id: 'rep_backlog', icon: ShieldCheck, label: 'Verify', badge: pendingTicketsCount > 0, badgeColor: 'bg-emerald-400' },
          { id: 'community_feed', icon: Layers, label: 'Feed' },
          null, // center action placeholder
          { id: 'ngo_marketplace', icon: Award, label: 'NGO', badgeCount: openChallengesCount },
          { id: '__community__', icon: Building2, label: 'Hub', action: onOpenCommunityModal },
        ];
      case 'admin':
        return [
          { id: 'admin_dashboard', icon: Home, label: 'Admin' },
          { id: 'community_feed', icon: Layers, label: 'Feed' },
          null, // center action placeholder
          { id: 'ngo_marketplace', icon: Award, label: 'NGO', badgeCount: openChallengesCount },
          { id: '__community__', icon: Building2, label: 'Hub', action: onOpenCommunityModal },
        ];
      case 'ngo':
        return [
          { id: 'ngo_marketplace', icon: Award, label: 'NGO' },
          { id: 'community_feed', icon: Layers, label: 'Feed' },
          null, // center action placeholder
          { id: '__community__', icon: Building2, label: 'Hub', action: onOpenCommunityModal },
          null, // empty slot
        ];
      default: // resident
        return [
          { id: 'resident_dashboard', icon: Home, label: 'Home' },
          { id: 'community_feed', icon: Layers, label: 'Feed' },
          null, // center action placeholder
          { id: 'ngo_marketplace', icon: Award, label: 'NGO', badgeCount: openChallengesCount },
          { id: '__community__', icon: Building2, label: 'Hub', action: onOpenCommunityModal },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-1 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
      {navItems.map((item, idx) => {
        if (item === null && idx === 2) {
          // Center Action Button
          return (
            <button
              key="center-action"
              onClick={onOpenNewComplaint}
              className="flex flex-col items-center justify-center -mt-5 mx-0.5 touch-press group"
              title="Report New Problem with Photo"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 group-hover:scale-105 transition-transform">
                <PlusCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[9px] font-bold text-slate-300 mt-0.5">Post</span>
            </button>
          );
        }
        if (item === null) return <div key={`empty-${idx}`} className="flex-1" />;

        const Icon = item.icon;
        const isActive = currentTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.action) {
                item.action();
              } else {
                setCurrentTab(item.id);
              }
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium touch-press transition-colors relative ${
              isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="truncate max-w-[48px]">{item.label}</span>
            {item.badge && (
              <span className={`absolute top-0.5 right-2 w-2 h-2 rounded-full ${item.badgeColor || 'bg-indigo-400'} animate-ping`} />
            )}
            {item.badgeCount > 0 && (
              <span className="absolute top-0 right-2 text-[8px] font-mono px-1 rounded-full bg-teal-500 text-slate-950 font-bold">
                {item.badgeCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
