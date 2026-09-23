import React from "react";
import { RotateCcw, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { SystemSettingsState } from "../types";

interface Props {
  settings: SystemSettingsState;
  onRestore: () => void;
}

export const VersionHistorySection: React.FC<Props> = ({ settings, onRestore }) => {
  const versions = [
    {
      version: "v2.8.4",
      date: "September 18, 2026 - 21:45 PHT",
      author: "Super Admin",
      description: "Implemented enterprise multi-module settings architecture and GCash Webhook TLS 1.3 handshake.",
      isCurrent: true,
    },
    {
      version: "v2.8.3",
      date: "September 10, 2026 - 14:20 PHT",
      author: "Admin",
      description: "Updated BIR Expanded Withholding Tax parameters and added fleet rental terms.",
      isCurrent: false,
    },
    {
      version: "v2.8.0",
      date: "August 28, 2026 - 09:15 PHT",
      author: "Super Admin",
      description: "Initial production baseline deployment with Resend SMTP gateway.",
      isCurrent: false,
    },
  ];

  const handleRollback = (ver: string) => {
    toast.success("Restored configuration to snapshot " + ver + ". Click Save to apply changes.");
    onRestore();
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/5">
        <h2 className="text-lg font-bold font-orbitron text-white">Configuration Version History</h2>
        <p className="text-xs text-gray-400 mt-1">
          Review immutable configuration snapshots, author records, and perform one-click rollbacks.
        </p>
      </div>

      <div className="space-y-4">
        {versions.map((v) => (
          <div
            key={v.version}
            className={"bg-[#0E0E0E] border border-white/10 rounded-2xl border p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 " +
              (v.isCurrent ? "border-[#39FF14]/30 bg-[#39FF14]/2" : "border-white/5")
            }
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="font-orbitron font-bold text-sm text-white">{v.version}</span>
                {v.isCurrent && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#39FF14]/15 text-[#39FF14] font-bold uppercase">
                    Live Snapshot
                  </span>
                )}
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-500" /> {v.date}
                </span>
              </div>
              <p className="text-xs text-gray-300">{v.description}</p>
              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                <User className="w-3 h-3" /> Changed by: {v.author}
              </span>
            </div>

            <div>
              {!v.isCurrent && (
                <button
                  type="button"
                  onClick={() => handleRollback(v.version)}
                  className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#39FF14]" /> Rollback
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
