import React, { useState } from 'react';
import Modal from './Modal';
import { QrCode, Download, Share2, Printer, Check, MapPin } from 'lucide-react';
import { useCommunity } from '../context/CommunityContext';

export default function QRCodeModal({ isOpen, onClose }) {
  const { activeCommunity } = useCommunity();
  const [selectedWing, setSelectedWing] = useState("Wing A");
  const [selectedLocation, setSelectedLocation] = useState("Elevator Lobby (Floor 1)");
  const [copied, setCopied] = useState(false);

  const directUrl = `${window.location.origin}/?community=${activeCommunity?.community_id || 'comm_emerald_1'}&wing=${encodeURIComponent(selectedWing)}&location=${encodeURIComponent(selectedLocation)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(directUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Community Adoption QR Code Generator" maxWidth="max-w-xl">
      <div className="space-y-6">
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

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
            {/* Visual SVG QR Code Representation */}
            <svg viewBox="0 0 100 100" className="w-40 h-40 fill-slate-900">
              <rect x="10" y="10" width="25" height="25" fill="#0f172a" rx="4" />
              <rect x="15" y="15" width="15" height="15" fill="#ffffff" rx="2" />
              <rect x="18" y="18" width="9" height="9" fill="#4f46e5" />
              
              <rect x="65" y="10" width="25" height="25" fill="#0f172a" rx="4" />
              <rect x="70" y="15" width="15" height="15" fill="#ffffff" rx="2" />
              <rect x="73" y="18" width="9" height="9" fill="#4f46e5" />
              
              <rect x="10" y="65" width="25" height="25" fill="#0f172a" rx="4" />
              <rect x="15" y="70" width="15" height="15" fill="#ffffff" rx="2" />
              <rect x="18" y="73" width="9" height="9" fill="#4f46e5" />

              {/* Data matrix pattern */}
              <circle cx="45" cy="20" r="3" fill="#0f172a" />
              <circle cx="55" cy="25" r="3" fill="#0f172a" />
              <circle cx="45" cy="35" r="3" fill="#0f172a" />
              <circle cx="50" cy="50" r="4" fill="#4f46e5" />
              <circle cx="25" cy="48" r="3" fill="#0f172a" />
              <circle cx="75" cy="48" r="3" fill="#0f172a" />
              <circle cx="45" cy="65" r="3" fill="#0f172a" />
              <circle cx="55" cy="75" r="3" fill="#0f172a" />
              <circle cx="75" cy="70" r="3" fill="#0f172a" />
              <circle cx="85" cy="85" r="3" fill="#0f172a" />
            </svg>
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
            onClick={handleCopy}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? "Direct URL Copied!" : "Copy Portal Link"}</span>
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
    </Modal>
  );
}
