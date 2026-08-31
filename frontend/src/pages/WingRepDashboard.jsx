import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCommunity } from '../context/CommunityContext';
import TicketCard from '../components/TicketCard';
import StatsCard from '../components/StatsCard';
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Sparkles,
  Layers,
  Wrench,
  Search,
  Check
} from 'lucide-react';

export default function WingRepDashboard() {
  const { currentUser } = useAuth();
  const { tickets, updateTicketByRep, activeCommunity, getNomenclature } = useCommunity();
  const nom = getNomenclature();

  const [selectedWing, setSelectedWing] = useState(currentUser?.wing || activeCommunity?.wings?.[0] || 'All');
  const [filterTab, setFilterTab] = useState('pending'); // 'pending' | 'verified' | 'all'
  const [searchTerm, setSearchTerm] = useState('');

  // Filter by active community and assigned division
  const communityTickets = tickets.filter(t => t.community_id === activeCommunity?.community_id);
  
  const divisionTickets = selectedWing === 'All' 
    ? communityTickets 
    : communityTickets.filter(t => t.wing === selectedWing);

  const pendingTickets = divisionTickets.filter(t => t.status === 'Submitted');
  const escalatedTickets = divisionTickets.filter(t => t.status === 'Verified_By_Rep' || t.status === 'Assigned' || t.status === 'In_Progress');
  const resolvedTickets = divisionTickets.filter(t => t.status === 'Resolved');
  const rejectedTickets = divisionTickets.filter(t => t.status === 'Rejected');

  let displayTickets = divisionTickets;
  if (filterTab === 'pending') {
    displayTickets = pendingTickets;
  } else if (filterTab === 'verified') {
    displayTickets = escalatedTickets;
  } else if (filterTab === 'resolved') {
    displayTickets = resolvedTickets;
  }

  if (searchTerm.trim()) {
    displayTickets = displayTickets.filter(t => 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.room_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const handleVerify = (ticketId) => {
    updateTicketByRep(ticketId, true, currentUser?.name || nom.verifier_label, "Verified physical condition on site.");
  };

  const handleReject = (ticketId, reason) => {
    updateTicketByRep(ticketId, false, currentUser?.name || nom.verifier_label, reason);
  };

  return (
    <div className="space-y-6">
      {/* Verifier Header Banner */}
      <div className="glass-panel p-5 sm:p-7 rounded-2xl border border-emerald-500/30 relative overflow-hidden bg-gradient-to-br from-emerald-950/30 via-slate-900/60 to-slate-950/90">
        <div className="max-w-2xl space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            {nom.verifier_label} Node • {activeCommunity?.name}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Verification Queue: {currentUser?.name}
          </h2>
          <p className="text-xs text-slate-300/90 leading-relaxed">
            As the designated <strong>{nom.verifier_label}</strong>, your responsibility is to inspect attached photo proofs, filter out duplicates or false reports, and escalate authentic issues to <strong>{nom.authority_label}</strong>.
          </p>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard
          title="Pending Check"
          value={pendingTickets.length}
          subtitle="Awaiting verification"
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="Escalated"
          value={escalatedTickets.length}
          subtitle={`Sent to ${nom.authority_label}`}
          icon={ShieldCheck}
          color="emerald"
        />
        <StatsCard
          title="Resolved"
          value={resolvedTickets.length}
          subtitle="Fixed & closed"
          icon={CheckCircle2}
          color="cyan"
        />
        <StatsCard
          title="Filtered"
          value={rejectedTickets.length}
          subtitle="Spam blocked"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Ticket List Header & Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              {nom.verifier_label} Queue ({displayTickets.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Filtered to {activeCommunity?.name}
            </p>
          </div>

          {/* Division Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">{nom.division_label}:</span>
            <select
              value={selectedWing}
              onChange={(e) => setSelectedWing(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All {nom.division_label}s</option>
              {(activeCommunity?.wings || []).map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex-wrap">
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold touch-press transition-all ${
              filterTab === 'pending' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending Verification ({pendingTickets.length})
          </button>
          <button
            onClick={() => setFilterTab('verified')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold touch-press transition-all ${
              filterTab === 'verified' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Escalated ({escalatedTickets.length})
          </button>
          <button
            onClick={() => setFilterTab('resolved')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold touch-press transition-all ${
              filterTab === 'resolved' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Resolved ({resolvedTickets.length})
          </button>
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold touch-press transition-all ${
              filterTab === 'all' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All History ({divisionTickets.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search complaints by title, room, or symptoms...`}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Tickets Grid */}
        {displayTickets.length === 0 ? (
          <div className="glass-panel p-6 rounded-2xl text-center text-slate-400 space-y-1.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-400/60 mx-auto" />
            <p className="text-xs font-semibold text-slate-300">No tickets found in this queue</p>
            <p className="text-[11px]">All complaints for this {nom.division_label} are currently processed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {displayTickets.map(ticket => (
              <TicketCard
                key={ticket.ticket_id}
                ticket={ticket}
                currentRole="wing_rep"
                currentUserId={currentUser?.uid}
                onRepVerify={handleVerify}
                onRepReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
