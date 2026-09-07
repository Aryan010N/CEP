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
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import QRCodeModal from './QRCodeModal';
import CommunityModal from './CommunityModal';

export default function Navbar({ onOpenAuthModal }) {
  const { currentUser, role, logout, switchDemoRole, isAuthenticated, isDemoMode, toggleDemoMode } = useAuth();
  const { activeCommunity, resetToDemoDefaults, getNomenclature } = useCommunity();
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const nom = getNomenclature();

  const getRoleDisplayTitle = (roleKey) => {
    if (roleKey === 'wing_rep') return nom.verifier_label || "Wing Rep";
    if (roleKey === 'admin') return nom.authority_label || "Admin";
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
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="w-full bg-gradient-to-r from-amber-600/90 via-amber-500/90 to-amber-600/90 text-slate-950 text-center py-1 px-3 text-[11px] font-bold tracking-wide flex items-center justify-center gap-2 z-50">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>DEMO MODE — Presentation Data Active</span>
          <button
            onClick={toggleDemoMode}
            className="ml-2 px-2 py-0.5 rounded bg-amber-900/30 text-amber-100 hover:bg-amber-900/50 text-[10px] font-bold"
          >
            Exit Demo
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
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50 shrink-0">
                  CEP
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

          {/* Desktop Demo Mode Persona Switcher */}
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
                1. {nom.reporter_label}
              </button>
              <button
                onClick={() => switchDemoRole('wing_rep')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  role === 'wing_rep' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2. {nom.verifier_label}
              </button>
              <button
                onClick={() => switchDemoRole('admin')}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  role === 'admin' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3. {nom.authority_label}
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

            {/* Demo Mode Toggle */}
            <button
              onClick={toggleDemoMode}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 touch-press transition-colors ${
                isDemoMode
                  ? 'border-amber-500/40 bg-amber-950/30 text-amber-300 hover:bg-amber-950/50'
                  : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:text-slate-200'
              }`}
              title={isDemoMode ? "Exit demo mode" : "Enter demo mode for presentation"}
            >
              {isDemoMode ? (
                <ToggleRight className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <ToggleLeft className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{isDemoMode ? 'Demo' : 'Demo'}</span>
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
                          {currentUser?.wing}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Persona Switcher in Menu (Demo Mode only) */}
                    {isDemoMode && (
                      <div className="p-2 border-b border-slate-800 lg:hidden space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          Demo Persona:
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            onClick={() => { switchDemoRole('resident'); setShowUserMenu(false); }}
                            className={`p-1.5 text-xs rounded text-left ${role === 'resident' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
                          >
                            {nom.reporter_label}
                          </button>
                          <button
                            onClick={() => { switchDemoRole('wing_rep'); setShowUserMenu(false); }}
                            className={`p-1.5 text-xs rounded text-left ${role === 'wing_rep' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
                          >
                            {nom.verifier_label}
                          </button>
                          <button
                            onClick={() => { switchDemoRole('admin'); setShowUserMenu(false); }}
                            className={`p-1.5 text-xs rounded text-left ${role === 'admin' ? 'bg-purple-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
                          >
                            {nom.authority_label}
                          </button>
                          <button
                            onClick={() => { switchDemoRole('ngo'); setShowUserMenu(false); }}
                            className={`p-1.5 text-xs rounded text-left ${role === 'ngo' ? 'bg-teal-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
                          >
                            NGO
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => { resetToDemoDefaults(); setShowUserMenu(false); }}
                      className="w-full mt-1 px-3 py-1.5 rounded-xl text-left text-xs text-amber-400 hover:bg-amber-950/40 flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset Demo Defaults
                    </button>

                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full px-3 py-1.5 rounded-xl text-left text-xs font-semibold text-rose-400 hover:bg-rose-950/40 flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Community Modal */}
      {showCommunityModal && (
        <CommunityModal isOpen={showCommunityModal} onClose={() => setShowCommunityModal(false)} />
      )}

      {/* QR Code Adoption Modal */}
      {showQRModal && (
        <QRCodeModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
      )}
    </>
  );
}
