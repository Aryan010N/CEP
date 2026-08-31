import React, { useState } from 'react';
import Modal from './Modal';
import { useCommunity } from '../context/CommunityContext';
import { Building2, Layers, Users, Shield, Check, Plus, Sparkles, MapPin } from 'lucide-react';

export default function CommunityModal({ isOpen, onClose }) {
  const { createCommunity, communities, activeCommunityId, setActiveCommunityId } = useCommunity();

  const [mode, setMode] = useState('create'); // 'switch' | 'create'
  
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Communities & Hierarchy Nomenclature" maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Toggle Mode */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'create' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            + Register New Community
          </button>
          <button
            type="button"
            onClick={() => setMode('switch')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === 'switch' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Switch Active ({communities.length})
          </button>
        </div>

        {mode === 'switch' ? (
          /* Switch Active Community */
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Select a registered community to view its local tickets, wings, and custom role titles:
            </p>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {communities.map((c) => {
                const isActive = c.community_id === activeCommunityId;
                const nom = c.nomenclature || {};
                return (
                  <div
                    key={c.community_id}
                    onClick={() => { setActiveCommunityId(c.community_id); onClose(); }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isActive 
                        ? 'border-indigo-500 bg-indigo-950/40 shadow-sm' 
                        : 'border-slate-800 bg-slate-900/50 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-indigo-400" />
                          {c.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {c.city || 'City'} • {c.wings?.length || 0} {nom.division_label || 'Wings'}s
                        </p>
                      </div>
                      {isActive && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Nomenclature Tags */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap gap-2 text-[10px] text-slate-400">
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded">Reporter: <strong className="text-slate-300">{nom.reporter_label || 'Resident'}</strong></span>
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded">Verifier: <strong className="text-emerald-300">{nom.verifier_label || 'Wing Rep'}</strong></span>
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded">Authority: <strong className="text-purple-300">{nom.authority_label || 'Warden'}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Register New Community Form */
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
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:bg-slate-850'
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
      </div>
    </Modal>
  );
}
