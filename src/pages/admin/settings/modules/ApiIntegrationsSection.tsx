import React, { useState } from "react";
import { CheckCircle, RefreshCw, Key, Plus, Copy } from "lucide-react";
import { toast } from "sonner";
import { SystemSettingsState, ApiKeyItem } from "../types";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
  saving: boolean;
}

export const ApiIntegrationsSection: React.FC<Props> = ({ settings, onChange, onSave, saving }) => {
  const [newKeyName, setNewKeyName] = useState("");
  const keys = settings.api_keys || [];

  const handleGenerateKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Provide a descriptive name for the API key");
      return;
    }
    const rand = Math.random().toString(36).substring(2, 10);
    const newKey: ApiKeyItem = {
      id: "key_" + Date.now(),
      name: newKeyName.trim(),
      prefix: "trip_live_" + rand.slice(0, 4),
      keyMasked: "trip_live_" + rand.slice(0, 4) + "••••••••••••" + rand.slice(4),
      createdDate: new Date().toISOString().split("T")[0],
      lastUsed: "Never",
      expiresAt: "2027-12-31",
      scopes: ["fleet:read", "leads:write"],
      status: "active",
    };
    onChange({ api_keys: [newKey, ...keys] });
    setNewKeyName("");
    toast.success("Generated API Key for " + newKey.name);
  };

  const handleRevoke = (id: string) => {
    const updated = keys.map((k) => (k.id === id ? { ...k, status: "revoked" as const } : k));
    onChange({ api_keys: updated });
    toast.info("API Key revoked");
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold font-orbitron text-white">API Keys & External Integrations</h2>
          <p className="text-xs text-gray-400 mt-1">
            Provision machine-to-machine API tokens, configure webhook subscribers, and connect third-party telemetry services.
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-black font-orbitron font-bold text-xs hover:bg-[#4FFF2A] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Save Integrations
        </button>
      </div>

      <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl border border-white/5 p-5 space-y-4">
        <h3 className="font-orbitron font-bold text-xs uppercase text-white tracking-wider flex items-center gap-2">
          <Key className="w-4 h-4 text-[#39FF14]" /> Provision Integration API Key
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Key Label (e.g. iOS App, Warehouse Scanner, Accounting CRM)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
          <button
            type="button"
            onClick={handleGenerateKey}
            className="px-4 py-2.5 rounded-xl bg-[#39FF14] text-black font-semibold text-xs font-orbitron hover:bg-[#4FFF2A] transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Generate
          </button>
        </div>

        <div className="space-y-3 pt-2">
          {keys.map((k) => (
            <div
              key={k.id}
              className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-white">{k.name}</span>
                  <span className={"text-[9px] px-2 py-0.5 rounded font-bold uppercase " +
                    (k.status === "active" ? "bg-[#39FF14]/15 text-[#39FF14]" : "bg-red-500/20 text-red-400")
                  }>
                    {k.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs text-gray-400">{k.keyMasked}</span>
                  <button onClick={() => handleCopy(k.keyMasked)} className="text-gray-500 hover:text-white">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {k.status === "active" && (
                  <button
                    type="button"
                    onClick={() => handleRevoke(k.id)}
                    className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-semibold"
                  >
                    Revoke Key
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Global Outbound Webhook Target</label>
          <input
            type="url"
            value={settings.webhook_endpoint}
            onChange={(e) => onChange({ webhook_endpoint: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Google Maps Platform API Key</label>
          <input
            type="text"
            value={settings.google_maps_api_key}
            onChange={(e) => onChange({ google_maps_api_key: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 font-mono"
          />
        </div>
      </div>
    </div>
  );
};
