import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  XCircle, 
  ShieldCheck,
  Award
} from 'lucide-react';

export default function StatusBadge({ status, size = "md" }) {
  const configs = {
    Submitted: {
      label: "Pending Rep Verification",
      bg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
      dot: "bg-blue-400 animate-pulse",
      icon: Clock
    },
    Verified_By_Rep: {
      label: "Verified & Escalated",
      bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      dot: "bg-emerald-400",
      icon: ShieldCheck
    },
    Assigned: {
      label: "Workforce Assigned",
      bg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      dot: "bg-amber-400",
      icon: Wrench
    },
    In_Progress: {
      label: "Repair In Progress",
      bg: "bg-purple-500/15 text-purple-400 border-purple-500/30",
      dot: "bg-purple-400 animate-pulse",
      icon: Wrench
    },
    Resolved: {
      label: "Resolved & Closed",
      bg: "bg-teal-500/15 text-teal-400 border-teal-500/30",
      dot: "bg-teal-400",
      icon: CheckCircle2
    },
    Rejected: {
      label: "Rejected / Spam",
      bg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      dot: "bg-rose-400",
      icon: XCircle
    },
    Open: {
      label: "Open Challenge",
      bg: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      dot: "bg-cyan-400 animate-ping",
      icon: Award
    },
    Claimed: {
      label: "Claimed by Student",
      bg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      dot: "bg-amber-400",
      icon: CheckCircle2
    }
  };

  const config = configs[status] || {
    label: status,
    bg: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    dot: "bg-slate-400",
    icon: Clock
  };

  const Icon = config.icon;
  const isSm = size === "sm";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.bg} ${isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className={isSm ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{config.label}</span>
    </span>
  );
}
