import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { 
  Zap, 
  Droplets, 
  Trash2, 
  Wrench, 
  MapPin, 
  User, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  XCircle,
  Clock,
  ArrowRight,
  Send,
  Image as ImageIcon,
  Maximize2,
  X
} from 'lucide-react';
import Modal from './Modal';
import { useCommunity } from '../context/CommunityContext';

export default function TicketCard({ 
  ticket, 
  currentRole, 
  currentUserId,
  onRepVerify, 
  onRepReject, 
  onAdminUpdate 
}) {
  const { getNomenclature, activeCommunity } = useCommunity();
  const nom = getNomenclature(ticket.community_id);

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  
  const [rejectReason, setRejectReason] = useState("");
  const [adminStatus, setAdminStatus] = useState(ticket.status || "In_Progress");
  const [adminWorker, setAdminWorker] = useState(ticket.assigned_worker || "");
  const [adminNotes, setAdminNotes] = useState(ticket.admin_notes || "");

  const categoryIcons = {
    Electrical: <Zap className="w-4 h-4 text-amber-400" />,
    Plumbing: <Droplets className="w-4 h-4 text-cyan-400" />,
    Sanitation: <Trash2 className="w-4 h-4 text-emerald-400" />,
    General: <Wrench className="w-4 h-4 text-indigo-400" />
  };

  const urgencyColors = {
    High: "text-rose-400 bg-rose-500/10 border-rose-500/30",
    Medium: "text-amber-400 bg-amber-500/10 border-amber-500/30",
    Low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
  };

  const timeAgo = (isoDate) => {
    try {
      const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
      if (diff < 60) return "Just now";
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return "Recently";
    }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (onAdminUpdate) {
      onAdminUpdate(ticket.ticket_id, {
        status: adminStatus,
        assigned_worker: adminWorker,
        admin_notes: adminNotes
      });
    }
    setShowAdminModal(false);
  };

  const handleRepReject = (e) => {
    e.preventDefault();
    if (onRepReject) {
      onRepReject(ticket.ticket_id, rejectReason || "Marked as duplicate or invalid complaint.");
    }
    setShowRejectModal(false);
  };

  return (
    <div className="glass-panel rounded-xl sm:rounded-2xl border border-slate-800/80 p-3.5 sm:p-5 transition-all duration-200 hover:border-slate-700 hover:shadow-xl relative flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
              #{ticket.ticket_id}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-900 border border-slate-800 text-slate-200">
              {categoryIcons[ticket.category] || <Wrench className="w-3 h-3" />}
              {ticket.category}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${urgencyColors[ticket.urgency] || urgencyColors.Low}`}>
              {ticket.urgency}
            </span>
          </div>

          <StatusBadge status={ticket.status} size="sm" />
        </div>

        {/* Title and Description */}
        <h4 className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors leading-snug">
          {ticket.title}
        </h4>
        <p className="text-xs text-slate-300/90 mt-1.5 line-clamp-3 leading-relaxed">
          {ticket.description}
        </p>

        {/* Attached Photo Preview if Present */}
        {ticket.image_url && (
          <div className="mt-2 sm:mt-3 relative rounded-lg sm:rounded-xl overflow-hidden border border-slate-800 max-h-28 sm:max-h-36 bg-slate-950 group/img">
            <img 
              src={ticket.image_url} 
              alt="Attached problem evidence" 
              className="w-full h-32 object-cover object-center cursor-pointer group-hover/img:scale-105 transition-transform duration-300"
              onClick={() => setShowImageModal(true)}
            />
            <button
              onClick={() => setShowImageModal(true)}
              className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-[11px] font-semibold text-slate-200 border border-slate-700 flex items-center gap-1 backdrop-blur-md transition-colors"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Zoom Photo</span>
            </button>
          </div>
        )}

        {/* AI Briefing Box */}
        {ticket.ai_summary && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-indigo-500/20 text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[11px]">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>AI Analysis:</span>
            </div>
            <p className="italic text-slate-300/90 text-[11px]">{ticket.ai_summary}</p>
            {ticket.suggested_action && (
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span className="font-medium text-slate-300">Action: </span>{ticket.suggested_action}
              </p>
            )}
          </div>
        )}

        {/* Location & Metadata */}
        <div className="mt-2.5 sm:mt-3.5 pt-2 sm:pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate font-medium text-slate-300">
              {ticket.wing} • {ticket.room_number}
            </span>
          </div>
          <div className="flex items-center gap-1.5 justify-end text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{timeAgo(ticket.created_at)}</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2 text-[11px] text-slate-400">
            <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">
              {nom.reporter_label}: <strong className="text-slate-300 font-medium">{ticket.resident_name || "Member"}</strong>
            </span>
          </div>
        </div>

        {/* Dynamic Verification & Assigned Worker Badges */}
        {(ticket.verified_by || ticket.assigned_worker || ticket.admin_notes) && (
          <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px]">
            {ticket.verified_by && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 font-medium">
                <ShieldCheck className="w-3 h-3" />
                Verified: {ticket.verified_by}
              </span>
            )}
            {ticket.assigned_worker && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-950/40 text-purple-300 border border-purple-800/40 font-medium">
                <Wrench className="w-3 h-3" />
                Assigned: {ticket.assigned_worker}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer depending on Role */}
      <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
        {/* Verifier Action Controls */}
        {currentRole === 'wing_rep' && ticket.status === 'Submitted' && (
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => setShowRejectModal(true)}
              className="flex-1 py-2 px-3 rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-950/30 text-xs font-semibold flex items-center justify-center gap-1.5 touch-press transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject / Spam</span>
            </button>
            <button
              onClick={() => onRepVerify && onRepVerify(ticket.ticket_id)}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5 touch-press transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify & Escalate</span>
            </button>
          </div>
        )}

        {/* Authority / Admin Controls */}
        {currentRole === 'admin' && (
          <button
            onClick={() => setShowAdminModal(true)}
            className="w-full py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 flex items-center justify-center gap-1.5 touch-press transition-all"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Manage Workforce & Status</span>
          </button>
        )}
      </div>

      {/* Admin Action Modal */}
      {showAdminModal && (
        <Modal 
          isOpen={showAdminModal} 
          onClose={() => setShowAdminModal(false)}
          title={`Workforce Dispatch for Ticket #${ticket.ticket_id}`}
        >
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Update Ticket Lifecycle Status
              </label>
              <select
                value={adminStatus}
                onChange={(e) => setAdminStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="Verified_By_Rep">Verified (Pending Assignment)</option>
                <option value="Assigned">Assigned to Maintenance</option>
                <option value="In_Progress">In Progress (Repair Underway)</option>
                <option value="Resolved">Resolved & Closed ✓</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Assign Worker / Vendor / Technician
              </label>
              <input
                type="text"
                value={adminWorker}
                onChange={(e) => setAdminWorker(e.target.value)}
                placeholder="e.g. Ramesh Electricals, AquaCare Plumber #3"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Resolution / Administrative Remarks
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Parts replaced, breaker inspected, issue fully resolved on site."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30"
              >
                Save Updates
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Verifier Rejection Modal */}
      {showRejectModal && (
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title={`Reject / Flag Ticket #${ticket.ticket_id}`}
        >
          <form onSubmit={handleRepReject} className="space-y-4">
            <p className="text-xs text-slate-300">
              Provide a reason for rejecting this complaint (e.g. duplicate issue, test submission, resolved on-site):
            </p>
            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Duplicate of active ticket #8021; or physical check revealed no defect."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/30"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Full Size Image Preview Modal */}
      {showImageModal && ticket.image_url && (
        <Modal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          title={`Photo Evidence: Ticket #${ticket.ticket_id}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center p-2">
              <img 
                src={ticket.image_url} 
                alt="Enlarged problem proof" 
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{ticket.title}</span>
              <button
                onClick={() => setShowImageModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
