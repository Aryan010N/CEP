import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Building2, Layers, ArrowRight, Activity, Users, QrCode, Lock, UserPlus, CheckCircle2 } from 'lucide-react';
import Login from './Login';
import Register from './Register';
import { useAuth } from '../context/AuthContext';

export default function LandingPage({ initialMode = 'login', onSwitchMode }) {
  const { isDemoMode } = useAuth();
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
                <span><strong>Google Gemini 3.8 Flash</strong> auto-classification & semantic deduplication</span>
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
                <span><strong>Instant Alerts:</strong> Automated SMS to authorities & email updates to residents</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <span><strong>NGO Challenge Hub:</strong> Real-world social impact rewarded with academic CEP credits</span>
              </div>
            </div>

            {/* Quick Demo Switcher Prompt */}
            {!isDemoMode && (
              <div className="pt-4 border-t border-slate-800/80">
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Evaluating for assessment or demo review?</span>
                  <a
                    href="/demo"
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({}, '', '/demo');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="text-amber-400 hover:text-amber-300 font-bold underline inline-flex items-center gap-1"
                  >
                    Open Isolated Demo Mode (/demo) &rarr;
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Embedded Real Authentication Card */}
          <div id="auth-section" className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
            <div className="glass-panel p-5 sm:p-7 rounded-3xl border border-slate-800 shadow-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 backdrop-blur-xl relative">
              
              {/* Tab Selector: Sign In vs Create Account */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    authTab === 'login'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    authTab === 'register'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>

              {/* Render Active Auth Subcomponent */}
              <div className="animate-fade-in">
                {authTab === 'login' ? (
                  <Login
                    onSwitchToRegister={() => handleTabChange('register')}
                  />
                ) : (
                  <Register
                    onSwitchToLogin={() => handleTabChange('login')}
                  />
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Workflow Explainer Cards */}
      <section className="px-4 sm:px-6 py-12 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How The Platform Works</h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              A transparent problem-to-resolution lifecycle bridging students, ground representatives, and administrators.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-100">1. Instant QR or App Reporting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Residents submit natural language complaints with photo evidence. Gemini AI diagnoses defect urgency and blocks duplicate submissions.
              </p>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-100">2. Wing Rep Verification & SMS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assigned floor representatives inspect the issue, weed out spam, and escalate with automatic sub-30s SMS dispatches to the Estate Admin.
              </p>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-100">3. Admin Dispatch & Gamification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Estate Admins assign maintenance crews and track progress. Successful resolution awards CEP credits on the community honor roll scoreboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
