import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, User, Lock, ArrowRight, CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export default function Login({ onSwitchToRegister, onClose, onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTestAccounts, setShowTestAccounts] = useState(true);

  const testAccounts = [
    { label: "Resident (Wing A)", name: "Aarav Resident", email: "aarav@cep.demo", roleBadge: "bg-indigo-900/40 text-indigo-300 border-indigo-500/30" },
    { label: "Wing Representative", name: "Vikram Rep", email: "vikram@cep.demo", roleBadge: "bg-emerald-900/40 text-emerald-300 border-emerald-500/30" },
    { label: "Estate Admin", name: "Rajesh Admin", email: "rajesh@cep.demo", roleBadge: "bg-purple-900/40 text-purple-300 border-purple-500/30" },
    { label: "NGO Partner", name: "Anita NGO", email: "anita@cep.demo", roleBadge: "bg-teal-900/40 text-teal-300 border-teal-500/30" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');

    try {
      loginSchema.parse({ email, password });
      setIsLoading(true);
      const user = await login(email, password);
      if (onSuccess) onSuccess(user);
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

  const handleSelectTestAccount = (accEmail) => {
    setEmail(accEmail);
    setPassword('Password123!');
    setErrors({});
    setGlobalError('');
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-5">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-glow-indigo">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-100">
          Sign In to Observatory
        </h2>
        <p className="text-xs text-slate-400">
          Enter your account details to access your role-specific dashboard
        </p>
      </div>

      {/* Pre-Seeded Test Credentials Helper */}
      <div className="p-3.5 rounded-2xl border border-slate-700/80 bg-slate-900/90 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            Standard Role Accounts (Password: Password123!)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {testAccounts.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => handleSelectTestAccount(acc.email)}
              className="p-2 rounded-xl border border-slate-700 hover:border-indigo-500/50 bg-slate-800/60 hover:bg-slate-800 text-left transition-all"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-200">{acc.name}</p>
              </div>
              <p className="text-[10px] text-slate-400">{acc.label}</p>
            </button>
          ))}
        </div>
      </div>

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
              placeholder="e.g. resident@campus.edu or aarav@cep.demo"
              className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border ${errors.email ? 'border-rose-500' : 'border-slate-700'} text-slate-100 text-sm focus:outline-none focus:border-indigo-500`}
            />
          </div>
          {errors.email && <p className="text-rose-400 text-[10px] mt-1 ml-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Password
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
          <span>{isLoading ? "Authenticating..." : "Sign In"}</span>
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
