import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, X, Sparkles, Check } from 'lucide-react';
import { SAMPLE_COMPLAINT_IMAGES } from '../services/firebase';

export default function ImagePicker({ selectedImage, onImageChange }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageChange(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2.5">
      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
        Attach Photo / Proof (Optional)
      </label>

      {selectedImage ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group max-w-sm">
          <img 
            src={selectedImage} 
            alt="Complaint Evidence" 
            className="w-full h-44 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3">
            <span className="text-[11px] font-medium text-emerald-300 flex items-center gap-1 bg-slate-900/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
              <Check className="w-3 h-3 text-emerald-400" />
              Photo Attached
            </span>
            <button
              type="button"
              onClick={() => onImageChange(null)}
              className="p-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 text-xs flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Upload / Camera Trigger Box */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/60 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-900/40 hover:bg-slate-900/70 text-center group"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:bg-slate-750 transition-colors mb-2">
              <Camera className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-200">
              Take photo or tap to browse
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports Camera capture, JPG, PNG & WebP
            </p>
          </div>

          {/* Quick Demo Photo Presets for seamless presentation */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Quick Sample Photo:
            </span>
            <button
              type="button"
              onClick={() => onImageChange(SAMPLE_COMPLAINT_IMAGES.electrical)}
              className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-800/80 border border-slate-700 text-amber-300 hover:bg-slate-750 transition-colors"
            >
              ⚡ Sparking Box
            </button>
            <button
              type="button"
              onClick={() => onImageChange(SAMPLE_COMPLAINT_IMAGES.plumbing)}
              className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-800/80 border border-slate-700 text-cyan-300 hover:bg-slate-750 transition-colors"
            >
              💧 Pipe Leak
            </button>
            <button
              type="button"
              onClick={() => onImageChange(SAMPLE_COMPLAINT_IMAGES.sanitation)}
              className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-slate-800/80 border border-slate-700 text-emerald-300 hover:bg-slate-750 transition-colors"
            >
              🗑️ Garbage Chute
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
