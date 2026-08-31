import React from 'react';
import { Home, Layers, PlusCircle, Award, Building2 } from 'lucide-react';
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

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
      {/* 1. Home / Role Dashboard */}
      <button
        onClick={() => setCurrentTab(mainTabId)}
        className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium touch-press transition-colors relative ${
          currentTab === mainTabId ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span className="truncate max-w-[64px]">
          {role === 'wing_rep' ? 'Verify' : role === 'admin' ? 'Admin' : 'Home'}
        </span>
        {role === 'wing_rep' && pendingTicketsCount > 0 && (
          <span className="absolute top-0.5 right-4 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        )}
      </button>

      {/* 2. Public Community Feed */}
      <button
        onClick={() => setCurrentTab('community_feed')}
        className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium touch-press transition-colors ${
          currentTab === 'community_feed' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Layers className="w-5 h-5 mb-0.5" />
        <span>Feed</span>
      </button>

      {/* 3. Center Action Button: Post Complaint */}
      <button
        onClick={onOpenNewComplaint}
        className="flex flex-col items-center justify-center -mt-5 mx-1 touch-press group"
        title="Report New Problem with Photo"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 group-hover:scale-105 transition-transform">
          <PlusCircle className="w-6 h-6 stroke-[2.5]" />
        </div>
        <span className="text-[10px] font-bold text-slate-300 mt-1">Post</span>
      </button>

      {/* 4. NGO Hub */}
      <button
        onClick={() => setCurrentTab('ngo_marketplace')}
        className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium touch-press transition-colors relative ${
          currentTab === 'ngo_marketplace' ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Award className="w-5 h-5 mb-0.5" />
        <span>NGO</span>
        {openChallengesCount > 0 && (
          <span className="absolute top-0.5 right-4 text-[9px] font-mono px-1 rounded-full bg-teal-500 text-slate-950 font-bold">
            {openChallengesCount}
          </span>
        )}
      </button>

      {/* 5. Communities Manager */}
      <button
        onClick={onOpenCommunityModal}
        className="flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 touch-press transition-colors"
      >
        <Building2 className="w-5 h-5 mb-0.5" />
        <span>Hub</span>
      </button>
    </div>
  );
}
