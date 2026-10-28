import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, User, Lock, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export default function Login({ onSwitchToRegister, onClose }) {
  const { login, isDemoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');

    try {
      // Zod Validation
      loginSchema.parse({ email, password });
      
      setIsLoading(true);
      await login(email, password);
      if (onClose) onClose();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        err.errors.forEach(e => {
          if (e.path[0]) {
            fieldErrors[e.path[0]] = e.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setGlobalError(err.message || 'Failed to authenticate. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoSelect = async (demoEmail) => {
    setEmail(demoEmail);
    const demoPassword = 'CepDemo2024!';
    setPassword(demoPassword);
    
    setErrors({});
    setGlobalError('');
    setIsLoading(true);
    
    try {
      await login(demoEmail, demoPassword);
      if (onClose) onClose();
    } catch (err) {
      setGlobalError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-glow-indigo">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-100">
          Welcome to Observatory
        </h2>
        <p className="text-xs text-slate-400">
          Sign in to access your community dashboard & AI problem tracking
        </p>
      </div>

      {/* Quick Demo Logins for Assessment Evaluation */}
      {isDemoMode && (
        <>
          <div className="p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                1-Click Evaluator Quick Fill:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoSelect('aarav@cep.demo')}
                className="p-2 rounded-xl border border-indigo-500/20 bg-indigo-900/30 hover:bg-indigo-800/40 text-left transition-colors"
              >
                <p className="text-xs font-bold text-indigo-200">Aarav Sharma</p>
                <p className="text-[10px] text-indigo-300/80">Resident (Wing A)</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoSelect('vikram@cep.demo')}
                className="p-2 rounded-xl border border-emerald-500/20 bg-emerald-900/30 hover:bg-emerald-800/40 text-left transition-colors"
              >
                <p className="text-xs font-bold text-emerald-200">Vikram Malhotra</p>
                <p className="text-[10px] text-emerald-300/80">Wing Rep (Wing A)</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoSelect('rajesh@cep.demo')}
                className="p-2 rounded-xl border border-purple-500/20 bg-purple-900/30 hover:bg-purple-800/40 text-left transition-colors"
              >
                <p className="text-xs font-bold text-purple-200">Dr. Rajesh Iyer</p>
                <p className="text-[10px] text-purple-300/80">Estate Admin</p>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoSelect('anita@cep.demo')}
                className="p-2 rounded-xl border border-teal-500/20 bg-teal-900/30 hover:bg-teal-800/40 text-left transition-colors"
              >
                <p className="text-xs font-bold text-teal-200">Anita Deshmukh</p>
                <p className="text-[10px] text-teal-300/80">GreenTech NGO Lead</p>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Or enter credentials</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
        </>
      )}

      {globalError && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{globalError}</p>
        </div>
      )}

      {/* Standard Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. resident@campus.edu"
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border ${errors.email ? 'border-rose-500' : 'border-slate-700'} text-slate-100 text-sm focus:outline-none focus:border-indigo-500`}
            />
          </div>
          {errors.email && <p className="text-rose-400 text-[10px] mt-1 ml-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex justify-between">
            <span>Password</span>
            <button type="button" className="text-indigo-400 hover:text-indigo-300 lowercase normal-case">Forgot?</button>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border ${errors.password ? 'border-rose-500' : 'border-slate-700'} text-slate-100 text-sm focus:outline-none focus:border-indigo-500`}
            />
          </div>
          {errors.password && <p className="text-rose-400 text-[10px] mt-1 ml-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          <span>{isLoading ? "Authenticating..." : "Sign In to Account"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-xs text-slate-400">
        Don't have an account yet?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Register here
        </button>
      </p>
    </div>
  );
}
