import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CommunityProvider, useCommunity } from './context/CommunityContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import CommunityModal from './components/CommunityModal';
import Toast from './components/Toast';
import Modal from './components/Modal';
import Login from './pages/Login';
import Register from './pages/Register';
import ResidentDashboard from './pages/ResidentDashboard';
import WingRepDashboard from './pages/WingRepDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NGOMarketplace from './pages/NGOMarketplace';
import TicketCard from './components/TicketCard';
import { Layers, Search, Filter, Shield, Sparkles, Building2 } from 'lucide-react';

// Map roles to their allowed tabs
const ROLE_TABS = {
  resident: ['resident_dashboard', 'community_feed', 'ngo_marketplace'],
  wing_rep: ['rep_backlog', 'community_feed', 'ngo_marketplace'],
  admin: ['admin_dashboard', 'admin_analytics', 'community_feed', 'ngo_marketplace'],
  ngo: ['ngo_marketplace', 'community_feed'],
};

const DEFAULT_TAB = {
  resident: 'resident_dashboard',
  wing_rep: 'rep_backlog',
  admin: 'admin_dashboard',
  ngo: 'ngo_marketplace',
};

function AppContent() {
  const { role, currentUser, isAuthenticated, isLoading } = useAuth();
  const { tickets, updateTicketByRep, updateTicketByAdmin, activeCommunity, getNomenclature, joinCommunity } = useCommunity();
  const nom = getNomenclature();
  
  const [currentTab, setCurrentTab] = useState(() => DEFAULT_TAB[role] || 'resident_dashboard');

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [feedWingFilter, setFeedWingFilter] = useState('All');
  const [feedSearch, setFeedSearch] = useState('');

  // Handle role change — reset to default tab for that role
  useEffect(() => {
    const allowed = ROLE_TABS[role] || ROLE_TABS.resident;
    if (!allowed.includes(currentTab)) {
      setCurrentTab(DEFAULT_TAB[role] || 'resident_dashboard');
    }
  }, [role]);

  // Parse URL params for join flow on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const communityId = params.get('community');

    if (action === 'join' && communityId) {
      // Attempt to join community
      setTimeout(() => {
        joinCommunity(communityId);
        // Clear URL params
        window.history.replaceState({}, '', window.location.pathname);
      }, 500);
    }
  }, []);

  // Tab guard — enforce allowed tabs
  const handleSetCurrentTab = (tabId) => {
    const allowed = ROLE_TABS[role] || ROLE_TABS.resident;
    if (allowed.includes(tabId)) {
      setCurrentTab(tabId);
    } else {
      setCurrentTab(DEFAULT_TAB[role] || 'resident_dashboard');
    }
  };

  // Feed Filter
  const communityTickets = tickets.filter(t => t.community_id === activeCommunity?.community_id);
  const feedTickets = communityTickets.filter(t => {
    if (feedWingFilter !== 'All' && t.wing !== feedWingFilter) return false;
    if (feedSearch.trim()) {
      const q = feedSearch.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.room_number.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenNewComplaint = () => {
    const allowed = ROLE_TABS[role] || ROLE_TABS.resident;
    if (allowed.includes('resident_dashboard')) {
      handleSetCurrentTab('resident_dashboard');
      setTimeout(() => {
        const formEl = document.getElementById('new-complaint-section');
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
        <p className="text-sm font-bold text-slate-400 animate-pulse tracking-widest uppercase">Initializing Secure Context...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-safe-bottom">
      {/* Top Mobile & Desktop App Bar */}
      <Navbar onOpenAuthModal={() => { setAuthMode('login'); setShowAuthModal(true); }} />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col lg:flex-row gap-4 lg:gap-5">
        
        {/* Left Sidebar on Desktop */}
        <Sidebar currentTab={currentTab} setCurrentTab={handleSetCurrentTab} />

        {/* Dynamic Center Main Area */}
        <main className="flex-1 min-w-0">
          {/* 1. Resident / Reporter View */}
          {role === 'resident' && currentTab === 'resident_dashboard' && (
            <ResidentDashboard />
          )}

          {/* 2. Verifier View */}
          {role === 'wing_rep' && currentTab === 'rep_backlog' && (
            <WingRepDashboard />
          )}

          {/* 3. Admin / Authority View */}
          {role === 'admin' && (currentTab === 'admin_dashboard' || currentTab === 'admin_analytics') && (
            <AdminDashboard currentTab={currentTab} />
          )}

          {/* 4. NGO Hub */}
          {currentTab === 'ngo_marketplace' && (
            <NGOMarketplace />
          )}

          {/* 5. Public Community Live Feed */}
          {currentTab === 'community_feed' && (
            <div className="space-y-4">
              <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      Public Problem Register ({feedTickets.length})
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Transparent community board for {activeCommunity?.name}
                    </p>
                  </div>

                  {/* Filters */}
                  <div className="flex items-center gap-2">
                    <select
                      value={feedWingFilter}
                      onChange={(e) => setFeedWingFilter(e.target.value)}
                      className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="All">All {nom.division_label}s</option>
                      {(activeCommunity?.wings || []).map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={feedSearch}
                    onChange={(e) => setFeedSearch(e.target.value)}
                    placeholder={`Search by problem keyword, category, room...`}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Feed Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {feedTickets.map(ticket => (
                  <TicketCard
                    key={ticket.ticket_id}
                    ticket={ticket}
                    currentRole={role}
                    currentUserId={currentUser?.uid}
                    onRepVerify={(id) => updateTicketByRep(id, true, currentUser?.name)}
                    onRepReject={(id, reason) => updateTicketByRep(id, false, currentUser?.name, reason)}
                    onAdminUpdate={(id, data) => updateTicketByAdmin(id, data)}
                  />
                ))}
                {feedTickets.length === 0 && (
                  <div className="col-span-full glass-panel p-6 rounded-2xl text-center text-slate-400 space-y-1.5">
                    <Layers className="w-6 h-6 text-indigo-400/60 mx-auto" />
                    <p className="text-xs font-semibold text-slate-300">No tickets in this community yet</p>
                    <p className="text-[11px]">Be the first to report an issue!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={handleSetCurrentTab}
        onOpenCommunityModal={() => setShowCommunityModal(true)}
        onOpenNewComplaint={handleOpenNewComplaint}
      />

      {/* Community Creation & Switcher Modal */}
      {showCommunityModal && (
        <CommunityModal
          isOpen={showCommunityModal}
          onClose={() => setShowCommunityModal(false)}
        />
      )}

      {/* Auth Modal (Login / Register) */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title=""
        maxWidth="max-w-lg"
      >
        {authMode === 'login' ? (
          <Login
            onSwitchToRegister={() => setAuthMode('register')}
            onClose={() => setShowAuthModal(false)}
          />
        ) : (
          <Register
            onSwitchToLogin={() => setAuthMode('login')}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </Modal>

      {/* Global Toast Alert Engine */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CommunityProvider>
        <AppContent />
      </CommunityProvider>
    </AuthProvider>
  );
}
