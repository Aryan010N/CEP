import React from 'react';
import Modal from './Modal';
import { 
  Sparkles, 
  AlertTriangle, 
  Check, 
  Wrench, 
  Layers, 
  Zap, 
  Droplets, 
  Trash2, 
  AlertCircle,
  Clock,
  Image as ImageIcon
} from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';

export default function AIAnalysisModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  aiAnalysis, 
  duplicateInfo, 
  ticketData, 
  isSubmitting 
}) {
  const { getNomenclature } = useCommunity();
  const nom = getNomenclature(ticketData?.community_id);

  if (!isOpen || !aiAnalysis) return null;

  const categoryIcons = {
    Electrical: <Zap className="w-5 h-5 text-amber-400" />,
    Plumbing: <Droplets className="w-5 h-5 text-cyan-400" />,
    Sanitation: <Trash2 className="w-5 h-5 text-emerald-400" />,
    General: <Wrench className="w-5 h-5 text-indigo-400" />
  };

  const urgencyStyles = {
    High: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    Medium: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    Low: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Classification & Route Review" maxWidth="max-w-2xl">
      <div className="space-y-5">
        {/* AI Banner */}
        <div className="p-3.5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-indigo-200 flex items-center gap-2">
              Gemini AI Autonomous Routing
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 uppercase tracking-widest font-mono">Realtime</span>
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Your natural language text & context were analyzed to auto-tag trade category and route directly to your designated <strong>{nom.verifier_label}</strong>.
            </p>
          </div>
        </div>

        {/* Deduplication Alert if detected */}
        {duplicateInfo?.is_duplicate && (
          <div className="p-3.5 rounded-2xl border border-amber-500/40 bg-amber-950/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-amber-200">Potential Duplicate Issue Detected</h4>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/30 text-amber-200">
                  {Math.round((duplicateInfo.confidence || 0.85) * 100)}% Match
                </span>
              </div>
              <p className="text-xs text-amber-300/90 mt-1">
                {duplicateInfo.reasoning || `An existing open ticket (${duplicateInfo.matched_ticket_id || 'Active Ticket'}) already addresses this problem.`}
              </p>
            </div>
          </div>
        )}

        {/* Attached Photo Preview if any */}
        {ticketData?.imageUrl && (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-800 bg-slate-900/60">
            <img 
              src={ticketData.imageUrl} 
              alt="Attached Proof" 
              className="w-16 h-16 rounded-lg object-cover border border-slate-700 shrink-0" 
            />
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-slate-200 block">Photo Attachment Verified</span>
              <span className="text-[11px] text-slate-400">Image will be attached to ticket #{nom.verifier_label} verification queue.</span>
            </div>
          </div>
        )}

        {/* Extracted Metadata Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Category */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Category</span>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
              {categoryIcons[aiAnalysis.category] || <Wrench className="w-4 h-4 text-indigo-400" />}
              <span>{aiAnalysis.category}</span>
            </div>
          </div>

          {/* Urgency Level */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Urgency</span>
            <div className="flex items-center">
              <span className={`px-2.5 py-0.5 text-xs rounded-full font-bold border ${urgencyStyles[aiAnalysis.urgency] || urgencyStyles.Low}`}>
                {aiAnalysis.urgency} Priority
              </span>
            </div>
          </div>
        </div>

        {/* AI Objective Summary & Suggested Action */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2.5 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Objective Summary</span>
            <p className="font-medium text-slate-200 mt-0.5">
              "{aiAnalysis.summary || ticketData?.title}"
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <Wrench className="w-3 h-3" />
              Suggested Action for {nom.verifier_label} & Maintenance
            </span>
            <p className="text-slate-300 mt-0.5 text-[11px]">
              {aiAnalysis.suggested_action}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors touch-press"
          >
            {duplicateInfo?.is_duplicate ? "Back & Modify" : "Edit"}
          </button>
          
          {duplicateInfo?.is_duplicate ? (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/30 flex items-center gap-1.5 touch-press transition-all"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Submit Anyway to {nom.verifier_label}</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 touch-press transition-all"
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Submit to {nom.verifier_label}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
