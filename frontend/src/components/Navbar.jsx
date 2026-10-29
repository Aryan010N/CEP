import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCommunity } from '../context/CommunityContext';
import { 
  Shield, 
  Sparkles, 
  QrCode, 
  LogOut, 
  ChevronDown, 
  User, 
  Building2
} from 'lucide-react';
import QRCodeModal from './QRCodeModal';
import CommunityModal from './CommunityModal';

export default function Navbar({ onOpenAuthModal }) {
  const { 
    currentUser, 
    role, 
    logout, 
    isAuthenticated
  } = useAuth();
  
  const { activeCommunity, getNomenclature } = useCommunity();
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
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-2.5 min-w-0 shrink-0">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-teal-400 p-0.5 flex items-center justify-center shrink-0 shadow-md shadow-indigo-950">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center group-hover:bg-slate-900 transition-colors">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent truncate">
                  Observatory
                </h1>
                
                {/* Interactive Active Community Button */}
                <button
                  type="button"
                  onClick={() => setShowCommunityModal(true)}
                  className="text-[10px] sm:text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 truncate max-w-[130px] sm:max-w-[200px] md:max-w-xs transition-colors"
                  title="Tap to switch or register communities"
                >
                  <Building2 className="w-3 h-3 text-indigo-400 shrink-0" />
                  <span className="truncate">{activeCommunity?.name || "Campus Community"}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                </button>
              </div>
            </a>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Community Hub Trigger */}
            <button
              onClick={() => setShowCommunityModal(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-800 bg-slate-900/70 text-slate-300 hover:border-indigo-500/40 text-xs font-medium flex items-center gap-1.5 touch-press transition-colors"
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
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-xl border border-slate-800 bg-slate-900/90 hover:bg-slate-800/80 touch-press transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {currentUser?.name?.charAt(0) || "U"}
                    </div>
                    <div className="text-left hidden sm:block min-w-0">
                      <div className="text-[11px] font-bold text-slate-200 truncate max-w-[90px]">
                        {currentUser?.name?.split(' ')[0]}
                      </div>
                      <div className="text-[9px] text-slate-400 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${currentRoleStyle.dot}`} />
                        <span className="capitalize truncate max-w-[70px]">{getRoleDisplayTitle(role)}</span>
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
                          <span className="text-slate-400">CEP Impact Credits:</span>
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {currentUser?.cepCredits || 0} Credits
                          </span>
                        </div>
                      </div>

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

                {/* Quick Direct Sign Out Button */}
                <button
                  onClick={logout}
                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 touch-press transition-colors"
                  title="Sign out of this session"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 touch-press transition-all"
                >
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => onOpenAuthModal && onOpenAuthModal('register')}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 touch-press transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  <span className="hidden sm:inline">Create Account</span>
                  <span className="sm:hidden">Register</span>
                </button>
              </div>
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
