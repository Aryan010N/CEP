import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCommunity } from '../context/CommunityContext';
import TicketCard from '../components/TicketCard';
import StatsCard from '../components/StatsCard';
import { generateAdminReportAI } from '../services/api';
import { 
  Building2, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  FileText, 
  BarChart3,
  Filter,
  RefreshCw,
  Zap,
  Droplets,
  Trash2,
  Users
} from 'lucide-react';

export default function AdminDashboard({ currentTab = 'admin_dashboard' }) {
  const { currentUser } = useAuth();
  const { tickets, updateTicketByAdmin, upvoteTicket, activeCommunity, getNomenclature } = useCommunity();
  const nom = getNomenclature();

  const [adminTab, setAdminTab] = useState('dispatch'); // 'dispatch' | 'history'
  const [selectedWingFilter, setSelectedWingFilter] = useState('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('All');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  // Compute Metrics for active community
  const communityTickets = tickets.filter(t => t.community_id === activeCommunity?.community_id);
  const totalTickets = communityTickets.length;
  const verifiedPendingAssignment = communityTickets.filter(t => t.status === 'Verified_By_Rep').length;
  const inProgressCount = communityTickets.filter(t => t.status === 'In_Progress' || t.status === 'Assigned').length;
  const resolvedCount = communityTickets.filter(t => t.status === 'Resolved').length;
  const rejectedCount = communityTickets.filter(t => t.status === 'Rejected').length;
  const submittedCount = communityTickets.filter(t => t.status === 'Submitted').length;
  const highUrgencyCount = communityTickets.filter(t => t.urgency === 'High' && t.status !== 'Resolved').length;

  // Active / Action Required Tickets for Dispatch view (verified awaiting crew, or actively in progress)
  const actionRequiredTickets = communityTickets.filter(t => 
    t.status === 'Verified_By_Rep' || t.status === 'In_Progress' || t.status === 'Assigned'
  );

  // Filtered tickets based on active tab and dropdown filters
  const displayTickets = (adminTab === 'dispatch' ? actionRequiredTickets : communityTickets).filter(t => {
    if (selectedWingFilter !== 'All' && t.wing !== selectedWingFilter) return false;
    if (selectedCategoryFilter !== 'All' && t.category !== selectedCategoryFilter) return false;
    if (adminTab === 'history' && historyStatusFilter !== 'All' && t.status !== historyStatusFilter) return false;
    return true;
  });

  const handleAdminUpdate = (ticketId, updateData) => {
    updateTicketByAdmin(ticketId, updateData);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const report = await generateAdminReportAI(activeCommunity?.name || "Community", communityTickets);
      setAiReport(report);
    } catch (err) {
      console.error("Failed to generate AI admin report:", err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Auto-generate AI report on initial mount or community change
  useEffect(() => {
    handleGenerateReport();
  }, [activeCommunity?.community_id, communityTickets.length]);

  return (
    <div className="space-y-6">
      {/* Admin Command Header */}
      <div className="glass-panel p-5 sm:p-7 rounded-2xl border border-purple-500/30 relative overflow-hidden bg-gradient-to-br from-purple-950/30 via-slate-900/60 to-slate-950/90">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
              <Building2 className="w-3 h-3 text-purple-400" />
              {nom.authority_label} Command Hub • {activeCommunity?.name}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Management & Workforce Dispatch
            </h2>
            <p className="text-xs text-slate-300/90 leading-relaxed">
              Review verified complaints across all {nom.division_label}s, assign technicians/vendors, and track resolution timelines.
            </p>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 flex items-center gap-1.5 touch-press transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingReport ? "Synthesizing..." : "Refresh AI Brief"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard
          title="Verified for Dispatch"
          value={verifiedPendingAssignment}
          subtitle={`Verified by ${nom.verifier_label}`}
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="In Repair Progress"
          value={inProgressCount}
          subtitle="Technician dispatched"
          icon={Wrench}
          color="purple"
        />
        <StatsCard
          title="Critical Hazards"
          value={highUrgencyCount}
          subtitle="High urgency"
          icon={Zap}
          color="rose"
        />
        <StatsCard
          title="Total Resolved"
          value={resolvedCount}
          subtitle={`${Math.round((resolvedCount / (totalTickets || 1)) * 100)}% fixed`}
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* AI Management Briefing Card */}
      {aiReport && (
        <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-900/90 via-indigo-950/20 to-slate-900/90 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gemini AI Management Intelligence Briefing</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Live AI Assessment
            </span>
          </div>

          <p className="text-xs font-medium text-slate-200 leading-relaxed">
            {aiReport.executive_summary}
          </p>

          {aiReport.action_items && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Action Directives:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {aiReport.action_items.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-indigo-900/60 text-indigo-300 shrink-0 flex items-center justify-center font-bold font-mono text-[9px]">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Aggregated Ticket Feed & Dispatch Controls with Clean Role Views */}
      <div className="space-y-4">
        {/* Primary Role Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex-wrap">
            <button
              type="button"
              onClick={() => setAdminTab('dispatch')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold touch-press transition-all flex items-center gap-1.5 ${
                adminTab === 'dispatch' ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-900/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Action Required: Dispatch Queue ({actionRequiredTickets.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setAdminTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold touch-press transition-all flex items-center gap-1.5 ${
                adminTab === 'history' ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-900/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Complete Community History ({communityTickets.length})</span>
            </button>
          </div>

          {/* Division & Category Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedWingFilter}
              onChange={(e) => setSelectedWingFilter(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All {nom.division_label}s</option>
              {(activeCommunity?.wings || []).map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Categories</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Sanitation">Sanitation</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        {/* History Tab Status Sub-Filters */}
        {adminTab === 'history' && (
          <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80 flex-wrap">
            <button
              type="button"
              onClick={() => setHistoryStatusFilter('All')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                historyStatusFilter === 'All' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Records ({communityTickets.length})
            </button>
            <button
              type="button"
              onClick={() => setHistoryStatusFilter('Resolved')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                historyStatusFilter === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Resolved ({resolvedCount})
            </button>
            <button
              type="button"
              onClick={() => setHistoryStatusFilter('In_Progress')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                historyStatusFilter === 'In_Progress' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              type="button"
              onClick={() => setHistoryStatusFilter('Verified_By_Rep')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                historyStatusFilter === 'Verified_By_Rep' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Verified ({verifiedPendingAssignment})
            </button>
            <button
              type="button"
              onClick={() => setHistoryStatusFilter('Submitted')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                historyStatusFilter === 'Submitted' ? 'bg-slate-700 text-slate-200 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Submitted ({submittedCount})
            </button>
            <button
              type="button"
              onClick={() => setHistoryStatusFilter('Rejected')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                historyStatusFilter === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
          </div>
        )}

        {/* Tickets Grid */}
        {displayTickets.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 space-y-1.5 border border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-purple-400/60 mx-auto" />
            <p className="text-xs font-semibold text-slate-300">
              {adminTab === 'dispatch' ? 'No tickets awaiting dispatch or currently in progress' : 'No tickets match the selected filters'}
            </p>
            <p className="text-[11px]">
              {adminTab === 'dispatch' ? 'Verified issues will appear here when escalated by Wing Representatives. Check the History tab for past records.' : 'Adjust your status or division filters above.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {displayTickets.map(ticket => (
              <TicketCard
                key={ticket.ticket_id}
                ticket={ticket}
                currentRole="admin"
                currentUserId={currentUser?.uid}
                onAdminUpdate={handleAdminUpdate}
                onUpvote={(id) => upvoteTicket(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
