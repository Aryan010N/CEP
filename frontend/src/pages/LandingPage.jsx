import React from 'react';
import { Shield, Sparkles, Building2, Layers, ArrowRight, Activity, Users, QrCode } from 'lucide-react';

export default function LandingPage({ onOpenAuth }) {
  return (
    <div className="flex flex-col min-h-full bg-slate-950 text-slate-200">
      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden flex-1 flex flex-col justify-center items-center text-center">
        {/* Background decorations */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Next-Gen Community Management</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-sm">
            The Smart <span className="bg-gradient-to-r from-indigo-400 to-teal-400 bg-clip-text text-transparent">Digital Observatory</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Empower your housing society, hostel, or campus with AI-driven complaint tracking, transparent resolution metrics, and seamless community engagement.
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenAuth}
              className="px-8 py-4 w-full sm:w-auto rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">How It Works</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">A seamless workflow designed to eliminate friction between residents and management.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">1. Instant Reporting</h3>
              <p className="text-slate-400 leading-relaxed">Scan a location-based QR code in your building to instantly log an issue without typing out complex addresses.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">2. Transparent Backlog</h3>
              <p className="text-slate-400 leading-relaxed">Issues are automatically routed to the correct floor captain or wing representative for immediate verification and tracking.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 relative overflow-hidden group hover:border-purple-500/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">3. AI-Powered Resolution</h3>
              <p className="text-slate-400 leading-relaxed">Admins receive AI-summarized insights on recurring issues, helping prioritize resources and resolve problems faster.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
