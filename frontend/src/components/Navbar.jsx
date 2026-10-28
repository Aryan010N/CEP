import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCommunity } from '../context/CommunityContext';
import { 
  Shield, 
  Sparkles, 
  QrCode, 
  RotateCcw, 
  LogOut, 
  ChevronDown, 
  User, 
  Building2, 
  Layers, 
  Check,
  Plus,
  GraduationCap,
  ExternalLink
} from 'lucide-react';
import QRCodeModal from './QRCodeModal';
import CommunityModal from './CommunityModal';

export default function Navbar({ onOpenAuthModal }) {
  const { 
    currentUser, 
    role, 
    logout, 
    switchDemoRole, 
    isAuthenticated, 
    isDemoMode, 
    navigateToDemo, 
    navigateToProd 
  } = useAuth();
  
  const { activeCommunity, resetToDemoDefaults, getNomenclature } = useCommunity();
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const nom = getNomenclature();

  const getRoleDisplayTitle = (roleKey) => {
    if (roleKey === 'wing_rep') return nom.verifier_label || "Wing Rep";
    if (roleKey === 'admin') return nom.authority_label || "Estate Admin";
    if (roleKey === 'ngo') return "NGO Partner";
    return nom.reporter_label || "Resident";
  };

  const roleStyles = {
    resident: {
      badge: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
      dot: "bg-indigo-400"
    },
    wing_rep: {
      badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      dot: "bg-emerald-400"
    },
    admin: {
      badge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
      dot: "bg-purple-400"
    },
    ngo: {
      badge: "bg-teal-500/15 text-teal-300 border-teal-500/30",
      dot: "bg-teal-400"
    }
  };

  const currentRoleStyle = roleStyles[role] || roleStyles.resident;

  return (
    <>
      {/* Isolated Demo Environment Banner (Active only on /demo route) */}
      {isDemoMode && (
        <div className="w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 py-1.5 px-3 text-[11px] font-bold tracking-wide flex items-center justify-between z-50 shadow-md">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>DEMO ENVIRONMENT (/demo) — Mock Datastore & 1-Click Persona Testing</span>
          </div>
          <button
            onClick={navigateToProd}
            className="px-2.5 py-0.5 rounded-lg bg-slate-950 text-amber-300 hover:bg-slate-900 text-[10px] font-bold transition-all shadow-sm"
          >
            Switch to Production App (/app)
          </button>
        </div>
      )}

      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-2 min-w-0 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-teal-400 p-0.5 flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent truncate">
                  Observatory
                </h1>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                  isDemoMode 
                    ? 'bg-amber-950 text-amber-300 border border-amber-800/50' 
                    : 'bg-indigo-950 text-indigo-300 border border-indigo-800/50'
                }`}>
                  {isDemoMode ? 'DEMO' : 'PROD'}
                </span>
              </div>

              {/* Interactive Active Community Button */}
              <button
                onClick={() => setShowCommunityModal(true)}
                className="text-[10px] sm:text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 truncate max-w-[120px] sm:max-w-[170px] md:max-w-xs transition-colors"
                title="Tap to switch or register communities"
              >
                <Building2 className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="truncate">{activeCommunity?.name || "Campus Community"}</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-500 shrink-0" />
              </button>
            </div>
          </div>

          {/* Desktop Demo Mode Persona Switcher (Rendered ONLY in Demo Mode) */}
          {isDemoMode && (
            <div className="hidden lg:flex items-center bg-slate-900/90 rounded-xl p-1 border border-amber-500/30 shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 px-2 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                Demo:
              </span>
              <button
                onClick={() => switchDemoRole('resident')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  role === 'resident' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1. Resident
              </button>
              <button
                onClick={() => switchDemoRole('wing_rep')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  role === 'wing_rep' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. Wing Rep
              </button>
              <button
                onClick={() => switchDemoRole('admin')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  role === 'admin' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3. Estate Admin
              </button>
              <button
                onClick={() => switchDemoRole('ngo')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  role === 'ngo' 
                    ? 'bg-teal-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                4. NGO
              </button>
            </div>
          )}

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Switch Endpoint Link */}
            {!isDemoMode ? (
              <button
                onClick={navigateToDemo}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-300 hover:bg-amber-950/40 text-xs font-semibold flex items-center gap-1.5 touch-press transition-colors"
                title="Launch Isolated Presentation Demo Mode (/demo)"
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Demo (/demo)</span>
              </button>
            ) : (
              <button
                onClick={navigateToProd}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-950/20 text-indigo-300 hover:bg-indigo-950/40 text-xs font-semibold flex items-center gap-1.5 touch-press transition-colors"
                title="Return to Production Environment (/app)"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Prod (/app)</span>
              </button>
            )}

            {/* Community Hub Trigger */}
            <button
              onClick={() => setShowCommunityModal(true)}
              className="hidden sm:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-800 bg-slate-900/70 text-slate-300 hover:border-indigo-500/40 text-xs font-medium items-center gap-1.5 touch-press transition-colors"
              title="Add or switch community and customize titles"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Communities</span>
            </button>

            {/* QR Poster Generator Button */}
            <button
              onClick={() => setShowQRModal(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-800 bg-slate-900/70 text-slate-300 hover:border-indigo-500/40 text-xs font-medium flex items-center gap-1.5 touch-press transition-colors"
              title="Generate QR codes for invites & complaint spots"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">QR Code</span>
            </button>

            {/* User Account / Role Badge */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 pl-1.5 pr-1.5 sm:pr-2 py-1 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800/80 touch-press transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {currentUser?.name?.charAt(0) || "U"}
                  </div>
                  <div className="text-left hidden sm:block min-w-0">
                    <div className="text-[11px] font-bold text-slate-200 truncate max-w-[80px]">
                      {currentUser?.name?.split(' ')[0]}
                    </div>
                    <div className="text-[9px] text-slate-400 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${currentRoleStyle.dot}`} />
                      <span className="capitalize truncate max-w-[60px]">{getRoleDisplayTitle(role)}</span>
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-2 z-50 animate-fade-in"
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <div className="p-2.5 border-b border-slate-800">
                      <p className="text-xs font-bold text-slate-200">{currentUser?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${currentRoleStyle.badge}`}>
                          {getRoleDisplayTitle(role)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {currentUser?.wing || "Main"}
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Gamification Score:</span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {currentUser?.cepCredits || 0} Credits
                        </span>
                      </div>
                    </div>

                    {/* Reset Demo Data in Demo Mode */}
                    {isDemoMode && (
                      <div className="p-1 border-b border-slate-800">
                        <button
                          onClick={() => {
                            resetToDemoDefaults();
                            setShowUserMenu(false);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-xl hover:bg-slate-800 text-left text-xs text-amber-300 flex items-center gap-2 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset Demo Baseline</span>
                        </button>
                      </div>
                    )}

                    {/* Sign Out Action */}
                    <div className="p-1">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-xl hover:bg-rose-950/40 text-left text-xs text-rose-300 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 touch-press transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* QR Code Modal */}
      {showQRModal && (
        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {/* Community Management Modal */}
      {showCommunityModal && (
        <CommunityModal
          isOpen={showCommunityModal}
          onClose={() => setShowCommunityModal(false)}
        />
      )}
    </>
  );
}
