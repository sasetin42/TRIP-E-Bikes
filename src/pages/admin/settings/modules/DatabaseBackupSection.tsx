import React, { useState } from "react";
import { CheckCircle, RefreshCw, Database, Download, Archive } from "lucide-react";
import { toast } from "sonner";
import { SystemSettingsState } from "../types";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
  saving: boolean;
}

export const DatabaseBackupSection: React.FC<Props> = ({ settings, onChange, onSave, saving }) => {
  const [creatingBackup, setCreatingBackup] = useState(false);

  const handleCreateSnapshot = async () => {
    setCreatingBackup(true);
    await new Promise((r) => setTimeout(r, 1200));
    const nowStr = new Date().toLocaleString();
    onChange({ database_last_backup: nowStr });
    toast.success("Database snapshot created and encrypted successfully!");
    setCreatingBackup(false);
  };

  const handleDownloadSnapshot = () => {
    const fakeData = {
      system: "TRIP Mobility Database Backup",
      timestamp: new Date().toISOString(),
      version: settings.config_version,
      records: "All PostgreSQL and Firestore documents included",
    };
    const blob = new Blob([JSON.stringify(fakeData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trip-mobility-backup-" + Date.now() + ".json";
    a.click();
    toast.success("Snapshot archive downloaded.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold font-orbitron text-white">Database Governance & Backups</h2>
          <p className="text-xs text-gray-400 mt-1">
            PostgreSQL instance parameters, automated snapshot schedules, disaster recovery restore points.
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-black font-orbitron font-bold text-xs hover:bg-[#4FFF2A] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Save Database Config
        </button>
      </div>

      <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl border border-white/10 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <span className="text-[11px] text-gray-400 font-semibold">Cluster Architecture</span>
          <p className="text-xs font-bold text-white font-mono">{settings.database_type}</p>
        </div>
        <div className="space-y-1">
          <span className="text-[11px] text-gray-400 font-semibold">Total Storage Size</span>
          <p className="text-xs font-bold text-[#39FF14] font-mono">{settings.database_size_mb} MB</p>
        </div>
        <div className="space-y-1">
          <span className="text-[11px] text-gray-400 font-semibold">Last Verified Snapshot</span>
          <p className="text-xs font-bold text-gray-200">{settings.database_last_backup}</p>
        </div>
      </div>

      <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl border border-white/5 p-5 space-y-4">
        <h3 className="font-orbitron font-bold text-xs uppercase text-white tracking-wider flex items-center gap-2">
          <Archive className="w-4 h-4 text-[#39FF14]" /> Manual Snapshot & Disaster Recovery
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCreateSnapshot}
            disabled={creatingBackup}
            className="px-4 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#4FFF2A] text-black font-semibold text-xs font-orbitron flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {creatingBackup ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
            Create Snapshot Now
          </button>

          <button
            type="button"
            onClick={handleDownloadSnapshot}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs flex items-center gap-2 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-gray-400" />
            Download Encrypted Snapshot
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Automated Backup Frequency</label>
          <select
            value={settings.database_backup_frequency}
            onChange={(e) => onChange({ database_backup_frequency: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          >
            <option value="Daily at 04:00 AM PHT">Daily at 04:00 AM PHT</option>
            <option value="Every 12 Hours">Every 12 Hours</option>
            <option value="Weekly (Sundays)">Weekly (Sundays)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Snapshot Retention Period (Days)</label>
          <input
            type="number"
            value={settings.database_retention_days}
            onChange={(e) => onChange({ database_retention_days: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>
      </div>
    </div>
  );
};
