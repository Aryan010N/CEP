import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Building2, Layers, ArrowRight, Activity, Users, QrCode, Lock, UserPlus, CheckCircle2 } from 'lucide-react';
import Login from './Login';
import Register from './Register';

export default function LandingPage({ initialMode = 'login', onSwitchMode, onAuthSuccess }) {
  const [authTab, setAuthTab] = useState(initialMode);

  useEffect(() => {
    if (initialMode) {
      setAuthTab(initialMode);
    }
  }, [initialMode]);

  const handleTabChange = (mode) => {
    setAuthTab(mode);
    if (onSwitchMode) {
      onSwitchMode(mode);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-950 text-slate-200">
      {/* Hero & Auth Split Section */}
      <section className="relative px-4 sm:px-6 pt-10 pb-16 md:pt-16 md:pb-20 overflow-hidden flex-1">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Platform Mission & Value Proposition */}
          <div className="lg:col-span-6 space-y-6 pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Community Digital Problem Observatory</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Transparent Civic Problem Resolution,{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-teal-400 bg-clip-text text-transparent">
                Powered by AI.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed">
              Replace lost WhatsApp chats and paper complaint registers with an intelligent, 3-tier escalation pipeline. From resident submission to verified authority dispatch in under 30 seconds.
            </p>

            {/* Core Capability Checklist */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <span><strong>Google Gemini AI</strong> auto-classification & semantic deduplication</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <span><strong>Three-Tier Verification:</strong> Resident &rarr; Wing Rep &rarr; Estate Admin</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <span><strong>Instant Alerts:</strong> Automated WhatsApp to authorities & email updates to residents</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <span><strong>NGO Challenge Hub:</strong> Real-world social impact rewarded with academic CEP credits</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Auth Portal Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative bg-slate-900/80 backdrop-blur-xl">
              
              {/* Auth Mode Tabs */}
              <div className="flex p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    authTab === 'login'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    authTab === 'register'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register Account</span>
                </button>
              </div>

              {/* Render Active Form */}
              {authTab === 'login' ? (
                <Login
                  onSwitchToRegister={() => handleTabChange('register')}
                  onSuccess={onAuthSuccess}
                />
              ) : (
                <Register
                  onSwitchToLogin={() => handleTabChange('login')}
                />
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Trust & Architecture Showcase Strip */}
      <footer className="border-t border-slate-800/80 py-8 px-4 bg-slate-950/90 text-center text-xs text-slate-400">
        <p className="max-w-md mx-auto">
          AI Community Digital Problem Observatory • Cloud Firestore real-time state synchronization • Gemini AI Classification
        </p>
      </footer>
    </div>
  );
}
