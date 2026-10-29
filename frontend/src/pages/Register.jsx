import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCommunity } from '../context/CommunityContext';
import { Shield, User, Lock, Mail, Building2, MapPin, Phone, ArrowRight, Check, AlertTriangle, QrCode, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address (e.g. resident@campus.edu or name@gmail.com)'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter (A-Z)')
    .regex(/[0-9]/, 'Password must contain at least 1 number (0-9)'),
  phone: z.string()
    .trim()
    .transform(val => val.replace(/[\s\-()]/g, ''))
    .refine(val => /^\+?[0-9]{10,15}$/.test(val), {
      message: 'Enter a valid 10 to 15 digit phone number (e.g. +91 9876543210 or 9876543210)'
    }),
  role: z.enum(['resident', 'wing_rep', 'admin', 'ngo']),
  community_id: z.string().min(1, 'Please select a community'),
  wing: z.string().optional(),
  room_number: z.string().optional()
}).refine(data => {
  if (data.role === 'resident' && (!data.room_number || data.room_number.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Room or flat number is required for residents",
  path: ["room_number"]
});

export default function Register({ onSwitchToLogin, onClose }) {
  const { signup } = useAuth();
  const { communities } = useCommunity();

  // QR Invite Auto-Detection from URL params (?action=join&community=comm_emerald_1)
  const [qrInvite, setQrInvite] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'resident',
    community_id: communities[0]?.community_id || 'comm_emerald_1',
    wing: 'Wing A',
    room_number: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check URL on mount for QR code invite
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const communityParam = params.get('community');
      const actionParam = params.get('action');

      if (communityParam) {
        const matched = communities.find(c => c.community_id === communityParam);
        if (matched) {
          setQrInvite({
            id: matched.community_id,
            name: matched.name,
            isJoin: actionParam === 'join'
          });
          setFormData(prev => ({
            ...prev,
            community_id: matched.community_id,
            wing: matched.wings?.[0] || 'Wing A'
          }));
        }
      }
    }
  }, [communities]);

  const selectedCommunity = communities.find(c => c.community_id === formData.community_id) || communities[0];

  // Password constraint helpers for live UI indicators
  const passwordConstraints = {
    length: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setGlobalError('');
    setSuccessMessage('');

    try {
      // 1. Zod Validation & Sanitization
      const validatedData = registerSchema.parse(formData);

      setIsLoading(true);

      // 2. Execute Firebase Auth + Firestore Registration
      await signup({
        ...validatedData,
        email: validatedData.email.toLowerCase()
      });

      setSuccessMessage('✓ Account created successfully! Launching your community dashboard...');
      
      if (onClose) {
        setTimeout(onClose, 800);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        err.errors.forEach(errItem => {
          if (errItem.path[0]) {
            fieldErrors[errItem.path[0]] = errItem.message;
          }
        });
        setErrors(fieldErrors);
        setGlobalError('Please resolve the highlighted field constraints below.');
      } else {
        setGlobalError(err.message || 'Registration failed. Please verify credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const nom = selectedCommunity?.nomenclature || {
    reporter_label: "Resident / Student",
    verifier_label: "Wing Representative",
    authority_label: "Estate Admin"
  };

  const roleOptions = [
    { id: 'resident', title: nom.reporter_label, desc: 'Report room & wing defects, earn CEP credits' },
    { id: 'wing_rep', title: nom.verifier_label, desc: 'Verify & escalate floor issues to maintenance' },
    { id: 'admin', title: nom.authority_label, desc: 'Dispatch workforce & track resolution velocity' },
    { id: 'ngo', title: 'NGO Partner', desc: 'Publish challenges for students and claim solutions' },
  ];

  return (
    <div className="w-full max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-glow-indigo">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100">
          Create Community Account
        </h2>
        <p className="text-xs text-slate-400">
          Join your society or campus observatory node
        </p>
      </div>

      {/* QR Invite Detected Banner */}
      {qrInvite && (
        <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 shadow-md animate-fade-in">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <QrCode className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[11px] uppercase tracking-wider text-emerald-300">
              QR Code Onboarding Active
            </p>
            <p className="text-[11px] truncate">
              Joining community: <strong>{qrInvite.name}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Global Error Alert Banner */}
      {globalError && (
        <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 shadow-md">
          <AlertTriangle className="w-4 h-4 mt-0.5 text-rose-400 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-rose-300">Registration Check Failed</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-rose-200">{globalError}</p>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="font-bold text-xs">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Role Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Select Your Role <span className="text-indigo-400">*</span>
            </label>
            <span className="text-[10px] text-slate-500">Pick one to configure privileges</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {roleOptions.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setFormData({ ...formData, role: r.id })}
                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all relative ${
                  formData.role === r.id
                    ? 'border-indigo-500 bg-indigo-950/50 shadow-glow-indigo'
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{r.title}</span>
                  {formData.role === r.id && (
                    <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">{r.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Full Name & Phone Number with Constraints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Full Name <span className="text-indigo-400">*</span>
              </label>
              <span className="text-[9px] text-slate-500">2-50 chars</span>
            </div>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Aryan Nandgaonkar"
                className={`w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border ${errors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700'} text-slate-100 text-xs focus:outline-none focus:border-indigo-500`}
              />
            </div>
            {errors.name && <p className="text-rose-400 text-[10px] mt-1 ml-1">{errors.name}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Phone Number <span className="text-indigo-400">*</span>
              </label>
              <span className="text-[9px] text-slate-500">10-15 digits</span>
            </div>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className={`w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border ${errors.phone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700'} text-slate-100 text-xs focus:outline-none focus:border-indigo-500`}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 ml-1">For critical maintenance & WhatsApp alerts</p>
            {errors.phone && <p className="text-rose-400 text-[10px] mt-1 ml-1 font-semibold">{errors.phone}</p>}
          </div>
        </div>

        {/* 3. Email and Password with Constraints */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Email Address <span className="text-indigo-400">*</span>
              </label>
              <span className="text-[9px] text-slate-500">Valid format</span>
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="resident@campus.edu"
                className={`w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border ${errors.email ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700'} text-slate-100 text-xs focus:outline-none focus:border-indigo-500`}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5 ml-1">Campus institutional or personal email</p>
            {errors.email && <p className="text-rose-400 text-[10px] mt-1 ml-1 font-semibold">{errors.email}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password <span className="text-indigo-400">*</span>
              </label>
              <span className="text-[9px] text-slate-500">Min 8 chars</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className={`w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border ${errors.password ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700'} text-slate-100 text-xs focus:outline-none focus:border-indigo-500`}
              />
            </div>
            
            {/* Live Password Constraint Badges */}
            <div className="flex items-center gap-1.5 flex-wrap mt-1.5 ml-0.5">
              <span className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                passwordConstraints.length ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}>
                {passwordConstraints.length ? '✓' : '•'} 8+ chars
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                passwordConstraints.hasUpper ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}>
                {passwordConstraints.hasUpper ? '✓' : '•'} 1 Uppercase (A-Z)
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                passwordConstraints.hasNumber ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}>
                {passwordConstraints.hasNumber ? '✓' : '•'} 1 Number (0-9)
              </span>
            </div>

            {errors.password && <p className="text-rose-400 text-[10px] mt-1 ml-1 font-semibold">{errors.password}</p>}
          </div>
        </div>

        {/* 4. Community & Wing Assignment */}
        {formData.role !== 'ngo' && (
          <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              3. Hierarchy & Location Assignment
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Community <span className="text-indigo-400">*</span>
                </label>
                <select
                  value={formData.community_id}
                  onChange={(e) => setFormData({ ...formData, community_id: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  {communities.map(c => (
                    <option key={c.community_id} value={c.community_id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  {nom.division_label || "Wing / Block"} <span className="text-indigo-400">*</span>
                </label>
                <select
                  value={formData.wing}
                  onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  {(selectedCommunity?.wings || ["Wing A", "Wing B", "Wing C", "Wing D"]).map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-400">
                    Room / Flat {formData.role === 'resident' && <span className="text-rose-400">*</span>}
                  </label>
                  {formData.role === 'resident' && (
                    <span className="text-[9px] text-amber-400">Required</span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  placeholder={formData.role === 'resident' ? "e.g. A-204 or Flat 12" : "Optional"}
                  className={`w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border ${errors.room_number ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700'} text-slate-200 text-xs focus:outline-none focus:border-indigo-500`}
                />
                {errors.room_number && <p className="text-rose-400 text-[10px] mt-1 ml-1">{errors.room_number}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          <span>{isLoading ? "Creating Profile in Firestore..." : "Register Account & Enter Observatory"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-xs text-slate-400">
        Already registered?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Sign in here
        </button>
      </p>
    </div>
  );
}
