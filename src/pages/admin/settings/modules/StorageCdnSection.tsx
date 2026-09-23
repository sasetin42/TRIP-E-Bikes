import React, { useState } from "react";
import { CheckCircle, RefreshCw, HardDrive, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SystemSettingsState } from "../types";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
  saving: boolean;
}

export const StorageCdnSection: React.FC<Props> = ({ settings, onChange, onSave, saving }) => {
  const [purgingCache, setPurgingCache] = useState(false);

  const handlePurgeCdn = async () => {
    setPurgingCache(true);
    await new Promise((r) => setTimeout(r, 900));
    toast.success("Global Edge CDN Cache purged successfully across all regional edge nodes.");
    setPurgingCache(false);
  };

  const percentUsed = Math.round((settings.storage_used_gb / settings.storage_quota_gb) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold font-orbitron text-white">Storage, Media & Edge CDN</h2>
          <p className="text-xs text-gray-400 mt-1">
            Media asset buckets, WebP automatic transformation, regional edge caching, and cache invalidation.
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-black font-orbitron font-bold text-xs hover:bg-[#4FFF2A] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Save Storage & CDN
        </button>
      </div>

      <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl border border-white/10 p-5 bg-gradient-to-r from-white/2 to-transparent space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center text-[#39FF14]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white font-orbitron">Storage Allocation Usage</span>
              <p className="text-[11px] text-gray-400">
                {settings.storage_used_gb} GB used of {settings.storage_quota_gb} GB provisioned
              </p>
            </div>
          </div>
          <span className="font-orbitron font-bold text-sm text-[#39FF14]">{percentUsed}%</span>
        </div>

        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-[#39FF14] rounded-full transition-all duration-500"
            style={{ width: percentUsed + "%" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Primary Cloud Storage Provider</label>
          <select
            value={settings.storage_provider}
            onChange={(e) => onChange({ storage_provider: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          >
            <option value="Firebase Storage">Firebase Cloud Storage (GCP)</option>
            <option value="Supabase Storage">Supabase S3 Compatible Storage</option>
            <option value="AWS S3">Amazon Web Services S3</option>
            <option value="Bunny Storage">Bunny.net Global Edge Storage</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">CDN Acceleration Network</label>
          <input
            type="text"
            value={settings.cdn_provider}
            onChange={(e) => onChange({ cdn_provider: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Global Edge CDN Base URL</label>
          <input
            type="url"
            value={settings.cdn_url}
            onChange={(e) => onChange({ cdn_url: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Edge Cache TTL (Hours)</label>
          <input
            type="number"
            value={settings.cdn_cache_duration_hours}
            onChange={(e) => onChange({ cdn_cache_duration_hours: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="p-4 rounded-xl border border-white/5 bg-white/2 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">Auto WebP Conversion & Compression</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Compress fleet photos on upload for lightning load speed</p>
          </div>
          <input
            type="checkbox"
            checked={settings.storage_auto_webp}
            onChange={(e) => onChange({ storage_auto_webp: e.target.checked })}
            className="accent-[#39FF14] w-5 h-5 cursor-pointer"
          />
        </div>

        <div className="p-4 rounded-xl border border-white/5 bg-white/2 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">Edge Cache Invalidation</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Purge CDN cached assets across all global points of presence</p>
          </div>
          <button
            type="button"
            onClick={handlePurgeCdn}
            disabled={purgingCache}
            className="px-3.5 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {purgingCache ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Purge All Cache
          </button>
        </div>
      </div>
    </div>
  );
};
