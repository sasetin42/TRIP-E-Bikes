import React, { useState } from "react";
import { Download, Upload, FileJson } from "lucide-react";
import { toast } from "sonner";
import { SystemSettingsState } from "../types";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
}

export const ImportExportSection: React.FC<Props> = ({ settings, onChange, onSave }) => {
  const [importing, setImporting] = useState(false);

  const handleExport = () => {
    const sanitized = { ...settings };
    sanitized.smtp_pass = "••••••••••••";
    sanitized.webhook_secret_key = "••••••••••••";
    if (sanitized.payment_gateways) {
      sanitized.payment_gateways = sanitized.payment_gateways.map((g) => ({
        ...g,
        secretKey: "••••••••••••",
        webhookSecret: "••••••••••••",
      }));
    }

    const blob = new Blob([JSON.stringify(sanitized, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trip-mobility-config-" + Date.now() + ".json";
    a.click();
    toast.success("Sanitized configuration package exported");
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && typeof json === "object" && "site_title" in json) {
          delete json.smtp_pass;
          delete json.webhook_secret_key;
          onChange(json);
          toast.success("Settings imported successfully. Review changes and click Save.");
        } else {
          toast.error("Invalid configuration schema. Missing required settings fields.");
        }
      } catch (err: any) {
        toast.error("Failed to parse JSON configuration: " + err.message);
      }
      setImporting(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/5">
        <h2 className="text-lg font-bold font-orbitron text-white">Import & Export Configuration</h2>
        <p className="text-xs text-gray-400 mt-1">
          Generate sanitized portable JSON backups and restore configurations across staging or production environments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl border border-white/5 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center text-[#39FF14]">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-orbitron font-bold text-sm text-white">Export Configuration Package</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Downloads a formatted JSON file of all platform parameters. Sensitive keys and passwords are systematically masked for compliance.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-orbitron text-xs font-bold border border-white/10 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-[#39FF14]" /> Export JSON File
          </button>
        </div>

        <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl border border-white/5 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-orbitron font-bold text-sm text-white">Import & Restore Settings</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Upload an existing JSON configuration file. Schema rules will be validated prior to staging updates in your workspace.
            </p>
          </div>

          <label className="w-full py-3 rounded-xl bg-[#39FF14] hover:bg-[#4FFF2A] text-black font-orbitron text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            <span>{importing ? "Validating..." : "Select Configuration JSON"}</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
};
