import React, { useState, useMemo, useRef } from 'react';
import Modal from './Modal';
import { QrCode, Download, Share2, Printer, Check, MapPin, UserPlus, Copy, Link2 } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';

import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeModal({ isOpen, onClose }) {
  const { activeCommunity, getInviteCode } = useCommunity();
  const [activeTab, setActiveTab] = useState('invite'); // 'invite' | 'spot'
  const [selectedWing, setSelectedWing] = useState(activeCommunity?.wings?.[0] || "Wing A");
  const [selectedLocation, setSelectedLocation] = useState("Elevator Lobby (Floor 1)");
  const [copied, setCopied] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const posterRef = useRef(null);

  const inviteCode = useMemo(() => getInviteCode(activeCommunity?.community_id), [activeCommunity?.community_id]);
  
  const inviteUrl = `${window.location.origin}/?action=join&community=${activeCommunity?.community_id || 'comm_emerald_1'}`;
  const spotUrl = `${window.location.origin}/?community=${activeCommunity?.community_id || 'comm_emerald_1'}&wing=${encodeURIComponent(selectedWing)}&location=${encodeURIComponent(selectedLocation)}`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleCopySpot = () => {
    navigator.clipboard.writeText(spotUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = () => {
    // Create an off-screen canvas and render the QR + poster
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = 600, h = 800;
    canvas.width = w;
    canvas.height = h;
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    
    // Header
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🛡️ Community Observatory', w / 2, 50);
    
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillStyle = '#4f46e5';
    ctx.fillText(activeTab === 'invite' ? 'Scan to Join Community' : 'Scan to Report Problem', w / 2, 85);
    
    // Need to trigger standard window.print() or download of the SVG
    // For download PNG we can convert SVG to Canvas
    const svgNode = document.querySelector(activeTab === 'invite' ? '#invite-qr svg' : '#spot-qr svg');
    if (!svgNode) return;

    const svgData = new XMLSerializer().serializeToString(svgNode);
    const DOMURL = window.URL || window.webkitURL || window;
    
    const img = new Image();
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
    const url = DOMURL.createObjectURL(svgBlob);
    
    img.onload = function () {
      ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
      DOMURL.revokeObjectURL(url);
      
      // Community info
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText(activeCommunity?.name || 'Community', w / 2, qrY + qrSize + 60);
      
      if (activeTab === 'spot') {
        ctx.font = '16px system-ui, sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText(`${selectedWing} — ${selectedLocation}`, w / 2, qrY + qrSize + 90);
      }
      
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Scan with your phone camera', w / 2, h - 60);
      ctx.fillText('Powered by AI Community Observatory', w / 2, h - 35);
      
      // Download
      const link = document.createElement('a');
      link.download = `qr-${activeTab}-${activeCommunity?.community_id || 'community'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code Generator" maxWidth="max-w-xl">
      <div className="space-y-5">
        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('invite')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'invite' ? 'bg-emerald-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Community Invite QR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('spot')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'spot' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Complaint Spot QR
          </button>
        </div>

        {/* --- TAB 1: Community Invite QR --- */}
        {activeTab === 'invite' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Share this QR code or link with members to let them join <strong>{activeCommunity?.name}</strong> instantly. Print and display on notice boards for easy onboarding.
            </p>

            {/* Printable Invite Poster */}
            <div ref={posterRef} className="p-6 rounded-2xl bg-white text-slate-900 border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <h4 className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Join Our Community
                </h4>
              </div>

              <div id="invite-qr" className="p-3 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
                <QRCodeSVG value={inviteUrl} size={180} fgColor="#0f172a" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-700">{activeCommunity?.name}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Scan to Join & Start Reporting Issues
                </p>
                <p className="text-[11px] text-slate-500">
                  {activeCommunity?.city} • {activeCommunity?.wings?.length || 0} {activeCommunity?.nomenclature?.division_label || 'Wing'}s
                </p>
              </div>
            </div>

            {/* Invite Link Box */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Direct Invite Link:</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-[11px] text-emerald-300 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 truncate font-mono">
                  {inviteUrl}
                </code>
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 flex items-center gap-1 shrink-0"
                >
                  {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedInvite ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleDownloadPNG}
                className="flex-1 px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Poster</span>
              </button>
            </div>
          </div>
        )}

        {/* --- TAB 2: Complaint Spot QR (Original) --- */}
        {activeTab === 'spot' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Generate physical location-tagged QR codes to print and stick on hostel bulletin boards, elevator lobbies, and mess halls for instant 1-tap complaint logging.
            </p>

            {/* Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Target Wing / Block</label>
                <select
                  value={selectedWing}
                  onChange={(e) => setSelectedWing(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                >
                  {(activeCommunity?.wings || ["Wing A", "Wing B", "Wing C", "Wing D"]).map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Physical Spot Name</label>
                <input
                  type="text"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  placeholder="e.g. 2nd Floor Water Cooler"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Printable Poster Card */}
            <div className="p-6 rounded-2xl bg-white text-slate-900 border-2 border-dashed border-indigo-300 flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <h4 className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Community Digital Problem Observatory
                </h4>
              </div>

              <div id="spot-qr" className="p-3 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
                <QRCodeSVG value={spotUrl} size={160} fgColor="#0f172a" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Scan with Phone Camera to Report Problem</p>
                <p className="text-sm font-semibold text-slate-800 flex items-center justify-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  {activeCommunity?.name} — {selectedWing} ({selectedLocation})
                </p>
                <p className="text-[11px] text-slate-500">
                  Directly alerts your Wing Representative & starts AI resolution tracking.
                </p>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopySpot}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? "Direct URL Copied!" : "Copy Portal Link"}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPNG}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Spot Poster</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
