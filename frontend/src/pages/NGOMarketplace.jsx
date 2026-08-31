import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCommunity } from '../context/CommunityContext';
import StatusBadge from '../components/StatusBadge';
import StatsCard from '../components/StatsCard';
import Modal from '../components/Modal';
import { 
  Award, 
  Sparkles, 
  CheckCircle2, 
  PlusCircle, 
  ExternalLink, 
  Tag, 
  Mail, 
  Gift, 
  UserCheck, 
  Building,
  Code,
  Check
} from 'lucide-react';

export default function NGOMarketplace() {
  const { currentUser, role } = useAuth();
  const { challenges, claimNGOChallenge, postNGOChallenge } = useCommunity();

  const [filter, setFilter] = useState('all'); // 'all' | 'open' | 'claimed'
  const [showPostModal, setShowPostModal] = useState(false);
  const [claimSuccessModal, setClaimSuccessModal] = useState(null);

  // New challenge form state
  const [newChallenge, setNewChallenge] = useState({
    ngo_name: currentUser?.role === 'ngo' ? currentUser.name : '',
    title: '',
    description: '',
    skills_required: '',
    contact_email: currentUser?.email || '',
    reward: 'Certificate of Social Innovation & Project Mentorship'
  });

  const openCount = challenges.filter(c => c.status === 'Open').length;
  const claimedCount = challenges.filter(c => c.status === 'Claimed').length;

  const filteredChallenges = challenges.filter(c => {
    if (filter === 'open') return c.status === 'Open';
    if (filter === 'claimed') return c.status === 'Claimed';
    return true;
  });

  const handleClaim = (challenge) => {
    claimNGOChallenge(challenge.challenge_id, currentUser?.uid, `${currentUser?.name} (${currentUser?.role})`);
    setClaimSuccessModal(challenge);
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newChallenge.title || !newChallenge.description) return;

    postNGOChallenge(newChallenge);
    setNewChallenge({
      ngo_name: '',
      title: '',
      description: '',
      skills_required: '',
      contact_email: '',
      reward: 'Certificate of Social Innovation & Project Mentorship'
    });
    setShowPostModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel p-5 sm:p-7 rounded-2xl border border-teal-500/30 relative overflow-hidden bg-gradient-to-br from-teal-950/30 via-slate-900/60 to-slate-950/90">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-bold">
              <Award className="w-3 h-3 text-teal-400" />
              NGO Technical Problem Marketplace • CEP Bridge
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Community Talent & Social Impact
            </h2>
            <p className="text-xs text-slate-300/90 leading-relaxed">
              Non-Governmental Organizations (NGOs) upload operational problem statements here. Engineering and science students can claim challenges to build software or IoT solutions for CEP academic credit.
            </p>
          </div>

          <button
            onClick={() => setShowPostModal(true)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-900/30 flex items-center justify-center gap-1.5 touch-press transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Problem Statement</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatsCard
          title="Open"
          value={openCount}
          subtitle="Ready to claim"
          icon={Award}
          color="cyan"
        />
        <StatsCard
          title="Claimed"
          value={claimedCount}
          subtitle="In development"
          icon={Code}
          color="emerald"
        />
        <StatsCard
          title="Grants"
          value="₹50k+"
          subtitle="Funded grants"
          icon={Gift}
          color="purple"
        />
      </div>

      {/* Challenges List */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-teal-400" />
              NGO Problem Statements ({filteredChallenges.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Real-world digital challenges from registered NGOs
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold touch-press transition-all ${
                filter === 'all' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({challenges.length})
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold touch-press transition-all ${
                filter === 'open' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Open ({openCount})
            </button>
            <button
              onClick={() => setFilter('claimed')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold touch-press transition-all ${
                filter === 'claimed' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Claimed ({claimedCount})
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChallenges.map((challenge) => {
            const isClaimed = challenge.status === 'Claimed';
            const isClaimedByMe = challenge.claimed_by_user_id === currentUser?.uid;

            return (
              <div 
                key={challenge.challenge_id}
                className="glass-panel rounded-2xl border border-slate-800/80 p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700 transition-all duration-200 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-teal-400 bg-teal-950/40 px-2 py-0.5 rounded border border-teal-800/40">
                      {challenge.challenge_id}
                    </span>
                    <StatusBadge status={challenge.status} size="sm" />
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-500" />
                      {challenge.ngo_name}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-100 mt-1 group-hover:text-teal-300 transition-colors leading-snug">
                      {challenge.title}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-300/90 leading-relaxed line-clamp-3">
                    {challenge.description}
                  </p>

                  {/* Skills Required */}
                  <div className="space-y-1 pt-1.5 border-t border-slate-800/80">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Required Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {challenge.skills_required.map((skill, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-medium text-slate-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reward / Incentive */}
                  <div className="p-2 rounded-xl bg-teal-950/20 border border-teal-500/20 text-[10px] text-teal-300 flex items-start gap-1.5">
                    <Gift className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>{challenge.reward}</span>
                  </div>

                  {/* Claimed info */}
                  {isClaimed && (
                    <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[10px] text-amber-300 flex items-center gap-1.5">
                      <UserCheck className="w-3 h-3 shrink-0 text-amber-400" />
                      <span className="truncate">Claimed by: <strong>{challenge.claimed_by_user_name || 'Student Lead'}</strong></span>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-500" />
                    <span className="truncate max-w-[100px]">{challenge.contact_email}</span>
                  </span>

                  {!isClaimed ? (
                    <button
                      onClick={() => handleClaim(challenge)}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-900/30 flex items-center gap-1.5 touch-press transition-all"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>Claim</span>
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-[11px] font-medium">
                      {isClaimedByMe ? "Claimed by You ✓" : "In Progress"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post Challenge Modal */}
      {showPostModal && (
        <Modal 
          isOpen={showPostModal} 
          onClose={() => setShowPostModal(false)}
          title="Publish NGO Operational Challenge"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handlePostSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Organization / NGO Name
              </label>
              <input
                type="text"
                required
                value={newChallenge.ngo_name}
                onChange={(e) => setNewChallenge({ ...newChallenge, ngo_name: e.target.value })}
                placeholder="e.g. CleanCity Eco Initiative"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Challenge Title
              </label>
              <input
                type="text"
                required
                value={newChallenge.title}
                onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                placeholder="e.g. Solar Microgrid Monitoring Dashboard for Village School"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Problem Description & Objective
              </label>
              <textarea
                rows={3}
                required
                value={newChallenge.description}
                onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                placeholder="Explain what operational bottleneck your organization faces and what software or AI prototype you need..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={newChallenge.skills_required}
                  onChange={(e) => setNewChallenge({ ...newChallenge, skills_required: e.target.value })}
                  placeholder="e.g. React, Python, IoT, GIS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={newChallenge.contact_email}
                  onChange={(e) => setNewChallenge({ ...newChallenge, contact_email: e.target.value })}
                  placeholder="coordinator@ngo.org"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Student Reward & Incentive
              </label>
              <input
                type="text"
                value={newChallenge.reward}
                onChange={(e) => setNewChallenge({ ...newChallenge, reward: e.target.value })}
                placeholder="e.g. Social Impact Certificate & ₹5,000 Project Grant"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-900/30"
              >
                Publish Challenge to Students
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Claim Success Modal */}
      {claimSuccessModal && (
        <Modal
          isOpen={!!claimSuccessModal}
          onClose={() => setClaimSuccessModal(null)}
          title="Challenge Successfully Claimed! 🎉"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-100">{claimSuccessModal.title}</h4>
              <p className="text-xs text-slate-300 mt-1">
                Registered project lead with <strong>{claimSuccessModal.ngo_name}</strong>.
              </p>
            </div>

            <button
              onClick={() => setClaimSuccessModal(null)}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
            >
              Got it
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
