import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCommunity } from '../context/CommunityContext';
import TicketCard from '../components/TicketCard';
import StatsCard from '../components/StatsCard';
import AIAnalysisModal from '../components/AIAnalysisModal';
import ImagePicker from '../components/ImagePicker';
import { analyzeTicketAI, checkDuplicateComplaintAI } from '../services/api';
import { 
  PlusCircle, 
  Sparkles, 
  Layers, 
  Clock, 
  CheckCircle2, 
  Send
} from 'lucide-react';
import { SAMPLE_COMPLAINT_IMAGES } from '../services/firebase';

export default function ResidentDashboard() {
  const { currentUser } = useAuth();
  const { tickets, submitTicket, upvoteTicket, activeCommunity, getNomenclature } = useCommunity();
  const nom = getNomenclature();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [wing, setWing] = useState(currentUser?.wing || activeCommunity?.wings?.[0] || 'Wing A');
  const [roomNumber, setRoomNumber] = useState(currentUser?.room_number || 'A-304');
  const [selectedImage, setSelectedImage] = useState(null);
  
  // AI Preview Modal State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [duplicateInfo, setDuplicateInfo] = useState(null);

  // Filter resident's own tickets with robust UID and submittedBy matching
  const myTickets = tickets.filter(t => 
    t.resident_id === currentUser?.uid || 
    t.submittedBy === currentUser?.uid || 
    t.resident_name === currentUser?.name ||
    (t.resident_name && currentUser?.name && t.resident_name.includes(currentUser.name.split(' ')[0]))
  );
  
  const activeCount = myTickets.filter(t => t.status !== 'Resolved' && t.status !== 'Rejected').length;
  const resolvedCount = myTickets.filter(t => t.status === 'Resolved').length;

  // Preset Scenarios for 1-click testing
  const sampleScenarios = [
    {
      title: "Ceiling fan making spark noise and regulator overheating",
      desc: "The regulator switch is hot to touch and sparks appear when turned on. Possible short circuit in the internal capacitor.",
      wing: activeCommunity?.wings?.[0] || "Wing A",
      room: currentUser?.room_number || "A-304",
      image: SAMPLE_COMPLAINT_IMAGES.electrical
    },
    {
      title: "Severe water leakage from common washroom drain pipe",
      desc: "Water is continuously gushing from the u-bend pipe joint onto the floor, causing slippery hazard.",
      wing: activeCommunity?.wings?.[0] || "Wing A",
      room: currentUser?.room_number || "A-304",
      image: SAMPLE_COMPLAINT_IMAGES.plumbing
    },
    {
      title: "Waste disposal bin overflowing near main staircase",
      desc: "The floor waste collection bin is jammed with overflowing trash bags, causing hygiene issues and foul smell.",
      wing: activeCommunity?.wings?.[0] || "Wing A",
      room: currentUser?.room_number || "A-304",
      image: SAMPLE_COMPLAINT_IMAGES.sanitation
    }
  ];

  const handlePreFill = (scenario) => {
    setTitle(scenario.title);
    setDescription(scenario.desc);
    setWing(scenario.wing);
    setRoomNumber(scenario.room);
    setSelectedImage(scenario.image);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsAnalyzing(true);
    try {
      // 1. Call Gemini AI categorization
      const analysisResult = await analyzeTicketAI({
        title,
        description,
        community_id: activeCommunity?.community_id,
        wing
      });
      setAiAnalysis(analysisResult);

      // 2. Call Gemini deduplication engine against active tickets
      const duplicateResult = await checkDuplicateComplaintAI(
        `${title}. ${description}`,
        tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Rejected')
      );
      setDuplicateInfo(duplicateResult);

      setShowAIModal(true);
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmSubmission = async () => {
    setIsSubmitting(true);
    try {
      await submitTicket({
        title,
        description,
        category: aiAnalysis?.category || "General",
        urgency: aiAnalysis?.urgency || "Low",
        resident_id: currentUser?.uid,
        submittedBy: currentUser?.uid,
        resident_name: currentUser?.name || nom.reporter_label,
        community_id: activeCommunity?.community_id,
        wing,
        room_number: roomNumber,
        image_url: selectedImage,
        ai_summary: aiAnalysis?.summary || title,
        suggested_action: aiAnalysis?.suggested_action || `Inspection by ${nom.verifier_label}.`
      });

      // Clear Form
      setTitle('');
      setDescription('');
      setSelectedImage(null);
      setShowAIModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile-Friendly Hero Card */}
      <div className="glass-panel p-5 sm:p-7 rounded-2xl border border-slate-800/90 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90">
        <div className="max-w-2xl space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            {nom.reporter_label} Portal • {activeCommunity?.name}
          </div>
          <div className="flex items-center gap-2.5 pt-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Hi, {currentUser?.name || "Resident"} 👋
            </h2>
          </div>
          <p className="text-xs text-slate-300/90 leading-relaxed">
            Report maintenance issues with natural language & photo attachments. Our Gemini AI automatically assesses urgency, checks for duplicates, and alerts your <strong>{nom.verifier_label}</strong>.
          </p>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatsCard
          title="Active Issues"
          value={activeCount}
          subtitle="In pipeline"
          icon={Clock}
          color="indigo"
        />
        <StatsCard
          title="Resolved"
          value={resolvedCount}
          subtitle="Completed"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatsCard
          title={nom.division_label}
          value={currentUser?.wing || wing}
          subtitle={`Room ${currentUser?.room_number || roomNumber}`}
          icon={Layers}
          color="purple"
        />
      </div>

      {/* Submit Complaint Card */}
      <div id="new-complaint-section" className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800/90 space-y-5 bg-slate-900/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">
              Log a Problem or Defect
            </h3>
          </div>
          {/* Quick Pre-fill scenarios */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Quick Test:</span>
            {sampleScenarios.map((sc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePreFill(sc)}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-colors"
              >
                Sample {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {nom.division_label} / Section
              </label>
              <select
                value={wing}
                onChange={(e) => setWing(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {(activeCommunity?.wings || ["Wing A", "Wing B", "Wing C"]).map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Specific Location / Room Number
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. A-304, 2nd Floor Corridor"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Short Title
            </label>
            <input
              type="text"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Main corridor tube light flickering violently and buzzing"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Detailed Description & Symptoms
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the problem, duration, or any safety concerns..."
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
              required
            />
          </div>

          {/* Photo Uploader with Auto Client-Side WebP Compression */}
          <ImagePicker
            selectedImage={selectedImage}
            onImageChange={setSelectedImage}
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={isAnalyzing || !title.trim() || !description.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 touch-press"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-indigo-300" />
                  <span>Gemini AI Analyzing Urgency...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Analyze with Gemini & Submit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Resident's Active Ticket Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" />
            My Reported Issues ({myTickets.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            Real-Time Sync Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {myTickets.map(ticket => (
            <TicketCard
              key={ticket.ticket_id || ticket.id}
              ticket={ticket}
              currentRole="resident"
              currentUserId={currentUser?.uid}
              onUpvote={() => upvoteTicket(ticket.ticket_id || ticket.id)}
            />
          ))}

          {myTickets.length === 0 && (
            <div className="col-span-full glass-panel p-8 rounded-2xl text-center text-slate-400 space-y-2 border border-slate-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/80 mx-auto" />
              <p className="text-sm font-semibold text-slate-200">No open complaints from your unit</p>
              <p className="text-xs">If you notice any maintenance defect, log it above for instant escalation.</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Analysis Modal Confirmation */}
      {showAIModal && (
        <AIAnalysisModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          onConfirm={handleConfirmSubmission}
          analysis={aiAnalysis}
          duplicateInfo={duplicateInfo}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
