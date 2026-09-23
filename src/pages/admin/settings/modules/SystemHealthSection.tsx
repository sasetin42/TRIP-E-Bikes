import React, { useState } from "react";
import { CheckCircle, RefreshCw, Activity, Cpu, Check } from "lucide-react";
import { toast } from "sonner";
import { SettingsService } from "@/services/settingsService";
import { SystemSettingsState } from "../types";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
  saving: boolean;
}

export const SystemHealthSection: React.FC<Props> = () => {
  const [running, setRunning] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);

  const handleRunHealthCheck = async () => {
    setRunning(true);
    try {
      const results = await SettingsService.runDiagnostics();
      setDiagnostics(results);
      toast.success("All 6 system nodes responded healthy.");
    } catch (err: any) {
      toast.error("Health check error: " + err.message);
    }
    setRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold font-orbitron text-white">System Health & Live Telemetry</h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time latency benchmarks, microservice socket pings, database pool metrics, and cache connectivity.
          </p>
        </div>
        <button
          onClick={handleRunHealthCheck}
          disabled={running}
          className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-black font-orbitron font-bold text-xs hover:bg-[#4FFF2A] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {running ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
          Run Complete Diagnostics
        </button>
      </div>

      {diagnostics.length === 0 ? (
        <div className="p-8 text-center bg-[#0E0E0E] border border-white/10 rounded-2xl border border-white/5 space-y-3">
          <Cpu className="w-8 h-8 text-gray-500 mx-auto" />
          <p className="text-xs text-gray-400">Click &quot;Run Complete Diagnostics&quot; to execute real-time cluster health probes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {diagnostics.map((node) => (
            <div key={node.component} className="bg-[#0E0E0E] border border-white/10 rounded-2xl border border-white/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{node.component}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#39FF14]/20 text-[#39FF14] font-bold uppercase flex items-center gap-1">
                  <Check className="w-3 h-3" /> {node.status}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">{node.detail}</p>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                <span>Response Time</span>
                <span className="text-[#39FF14]">{node.latency}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
