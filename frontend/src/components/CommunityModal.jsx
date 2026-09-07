import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import { useCommunity } from '../context/CommunityContext';
import { Building2, Layers, Users, Shield, Check, Plus, Sparkles, MapPin, QrCode, Link2, UserPlus } from 'lucide-react';

export default function CommunityModal({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const { createCommunity, communities, activeCommunityId, setActiveCommunityId, getUserCommunities, joinCommunity, parseInviteCode } = useCommunity();

  const [mode, setMode] = useState('my'); // 'my' | 'create' | 'join'

  // Join form state
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'housing_society',
    city: '',
    wings: 'Wing A, Wing B, Wing C',
    nomenclature: {
      reporter_label: 'Resident',
      verifier_label: 'Floor Captain',
      authority_label: 'Society Secretary',
      division_label: 'Wing'
    }
  });

  const communityTypePresets = {
    housing_society: {
      label: "Housing Society / Apartment",
      defaultWings: "Tower 1, Tower 2, Tower 3",
      nom: { reporter_label: "Resident / Flat Owner", verifier_label: "Floor Captain", authority_label: "Society Secretary", division_label: "Tower" }
    },
    hostel: {
      label: "College / University Hostel",
      defaultWings: "Wing A, Wing B, Wing C, Wing D",
      nom: { reporter_label: "Student", verifier_label: "Wing Representative", authority_label: "Chief Warden", division_label: "Wing" }
    },
    rwa_colony: {
      label: "Residential Colony / RWA",
      defaultWings: "Block North, Block South, Central Block",
      nom: { reporter_label: "Homeowner", verifier_label: "Block Coordinator", authority_label: "RWA President", division_label: "Block" }
    },
    ngo_hub: {
      label: "NGO Network / Community Hub",
      defaultWings: "Zone 1, Zone 2, Zone 3",
      nom: { reporter_label: "Community Member", verifier_label: "Field Rep", authority_label: "Program Director", division_label: "Zone" }
    }
  };

  const handleTypeChange = (typeKey) => {
    const preset = communityTypePresets[typeKey];
    if (preset) {
      setFormData(prev => ({
        ...prev,
        type: typeKey,
        wings: preset.defaultWings,
        nomenclature: { ...preset.nom }
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    createCommunity({
      name: formData.name,
      type: formData.type,
      city: formData.city,
      wings: formData.wings,
      nomenclature: formData.nomenclature
    });

    onClose();
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    setJoinError('');
    setJoinSuccess(false);

    if (!joinCode.trim()) {
      setJoinError('Please paste an invite code or community ID.');
      return;
    }

    // Try direct community ID first
    let communityId = joinCode.trim();
    
    // Try parsing as invite code
    const parsedId = parseInviteCode(joinCode.trim());
    if (parsedId) {
      communityId = parsedId;
    }

    // Also try extracting from URL
    try {
      const url = new URL(joinCode.trim());
      const urlCommunityId = url.searchParams.get('community');
      if (urlCommunityId) communityId = urlCommunityId;
    } catch {
      // Not a URL, that's fine
    }

    const success = joinCommunity(communityId);
    if (success) {
      setJoinSuccess(true);
      setTimeout(() => onClose(), 1500);
    } else {
      setJoinError('Could not find that community. Check the invite link or code.');
    }
  };

  const myCommunities = getUserCommunities();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Communities Hub" maxWidth="max-w-xl">
      <div className="space-y-5">
        {/* 3-Way Tab Toggle */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 gap-0.5">
          <button
            type="button"
            onClick={() => setMode('my')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'my' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">My</span> Communities
          </button>
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'create' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Register New
          </button>
          <button
            type="button"
            onClick={() => setMode('join')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'join' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Join via Code
          </button>
        </div>

        {/* --- TAB 1: My Communities (Switch) --- */}
        {mode === 'my' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Communities you belong to ({myCommunities.length}). Tap to switch:
            </p>
            {myCommunities.length === 0 ? (
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 text-center space-y-2">
                <Building2 className="w-6 h-6 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">You haven't joined any communities yet.</p>
                <p className="text-[11px] text-slate-400">Register a new one or join using an invite code.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {myCommunities.map((c) => {
                  const isActive = c.community_id === activeCommunityId;
                  const nom = c.nomenclature || {};
                  const memberCount = (c.members?.length || 0) + 1; // +1 for admin
                  return (
                    <div
                      key={c.community_id}
                      onClick={() => { setActiveCommunityId(c.community_id); onClose(); }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isActive 
                          ? 'border-indigo-500 bg-indigo-950/40 shadow-sm' 
                          : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 truncate">
                            <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span className="truncate">{c.name}</span>
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>{c.city || 'City'}</span>
                            <span>•</span>
                            <span>{c.wings?.length || 0} {nom.division_label || 'Wing'}s</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Users className="w-3 h-3" />
                              {memberCount}
                            </span>
                          </p>
                        </div>
                        {isActive && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 shrink-0 ml-2">
                            Active
                          </span>
                        )}
                      </div>

                      {/* Nomenclature Tags */}
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5 text-[10px] text-slate-400">
                        <span className="bg-slate-800/80 px-2 py-0.5 rounded">Reporter: <strong className="text-slate-300">{nom.reporter_label || 'Resident'}</strong></span>
                        <span className="bg-slate-800/80 px-2 py-0.5 rounded">Verifier: <strong className="text-emerald-300">{nom.verifier_label || 'Wing Rep'}</strong></span>
                        <span className="bg-slate-800/80 px-2 py-0.5 rounded">Authority: <strong className="text-purple-300">{nom.authority_label || 'Warden'}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: Register New Community --- */}
        {mode === 'create' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Preset Community Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                1. Select Community Type Preset
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(communityTypePresets).map(([k, v]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleTypeChange(k)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      formData.type === k 
                        ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200 font-bold' 
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:bg-slate-800/60'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Community Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sunflower Heights RWA"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Mumbai, Navi Mumbai"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Sub-Divisions (Wings/Blocks/Towers) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Sub-Divisions / Wings / Blocks (Comma separated)
              </label>
              <input
                type="text"
                required
                value={formData.wings}
                onChange={(e) => setFormData({ ...formData, wings: e.target.value })}
                placeholder="e.g. Tower Alpha, Tower Beta, Tower Gamma"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Custom Nomenclature Tuning */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>2. Customize Hierarchy Role Names</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Customize titles for each node to suit your society, hostel, or organization:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">Reporter Title</label>
                  <input
                    type="text"
                    value={formData.nomenclature.reporter_label}
                    onChange={(e) => setFormData({
                      ...formData,
                      nomenclature: { ...formData.nomenclature, reporter_label: e.target.value }
                    })}
                    placeholder="e.g. Resident"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-emerald-400 mb-0.5">Verifier Node Title</label>
                  <input
                    type="text"
                    value={formData.nomenclature.verifier_label}
                    onChange={(e) => setFormData({
                      ...formData,
                      nomenclature: { ...formData.nomenclature, verifier_label: e.target.value }
                    })}
                    placeholder="e.g. Floor Captain"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-purple-400 mb-0.5">Authority / Admin Title</label>
                  <input
                    type="text"
                    value={formData.nomenclature.authority_label}
                    onChange={(e) => setFormData({
                      ...formData,
                      nomenclature: { ...formData.nomenclature, authority_label: e.target.value }
                    })}
                    placeholder="e.g. Society Secretary"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Community</span>
              </button>
            </div>
          </form>
        )}

        {/* --- TAB 3: Join via Code / Link --- */}
        {mode === 'join' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Join an Existing Community</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Paste the invite link, invite code, or community ID shared by your community admin. You can also scan a QR code from a physical poster.
              </p>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Invite Code or Link
                </label>
                <div className="relative">
                  <Link2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => { setJoinCode(e.target.value); setJoinError(''); setJoinSuccess(false); }}
                    placeholder="e.g. comm_emerald_1 or paste full invite URL"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {joinError && (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                  {joinError}
                </div>
              )}

              {joinSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Successfully joined! Redirecting...</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joinSuccess}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Join Community</span>
                </button>
              </div>
            </form>

            {/* Available communities to browse */}
            <div className="pt-3 border-t border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Or browse available communities ({communities.length}):
              </p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {communities.map(c => {
                  const isMember = getUserCommunities().some(mc => mc.community_id === c.community_id);
                  return (
                    <div
                      key={c.community_id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-900/50 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-slate-200 font-medium truncate block">{c.name}</span>
                        <span className="text-[10px] text-slate-400">{c.city} • {c.wings?.length || 0} divisions</span>
                      </div>
                      {isMember ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shrink-0 ml-2">
                          Joined
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const success = joinCommunity(c.community_id);
                            if (success) setTimeout(() => onClose(), 1000);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold shrink-0 ml-2"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
