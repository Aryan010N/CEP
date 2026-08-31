import React, { useState } from 'react';
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

function AppContent() {
  const { role, currentUser, isAuthenticated } = useAuth();
  const { tickets, updateTicketByRep, updateTicketByAdmin, activeCommunity, getNomenclature } = useCommunity();
  const nom = getNomenclature();
  
  const [currentTab, setCurrentTab] = useState(() => {
    if (role === 'wing_rep') return 'rep_backlog';
    if (role === 'admin') return 'admin_dashboard';
    if (role === 'ngo') return 'ngo_marketplace';
    return 'resident_dashboard';
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [feedWingFilter, setFeedWingFilter] = useState('All');
  const [feedSearch, setFeedSearch] = useState('');

  // Handle role change effect on active tab
  React.useEffect(() => {
    if (role === 'wing_rep') setCurrentTab('rep_backlog');
    else if (role === 'admin') setCurrentTab('admin_dashboard');
    else if (role === 'ngo') setCurrentTab('ngo_marketplace');
    else setCurrentTab('resident_dashboard');
  }, [role]);

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
    setCurrentTab('resident_dashboard');
    setTimeout(() => {
      const formEl = document.getElementById('new-complaint-section');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white pb-safe-bottom">
      {/* Top Mobile & Desktop App Bar */}
      <Navbar onOpenAuthModal={() => { setAuthMode('login'); setShowAuthModal(true); }} />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col lg:flex-row gap-5">
        
        {/* Left Sidebar on Desktop */}
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

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
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
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
