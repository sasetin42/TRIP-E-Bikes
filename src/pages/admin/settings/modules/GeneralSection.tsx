import React from "react";
import { CheckCircle, RefreshCw, Globe } from "lucide-react";
import { SystemSettingsState } from "../types";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
  saving: boolean;
}

export const GeneralSection: React.FC<Props> = ({ settings, onChange, onSave, saving }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold font-orbitron text-white">General Platform Settings</h2>
          <p className="text-xs text-gray-400 mt-1">
            Global system parameters, currency definitions, temporal formats, and system operational statuses.
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-black font-orbitron font-bold text-xs hover:bg-[#4FFF2A] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Save General Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Application / Platform Name</label>
          <input
            type="text"
            value={settings.site_title}
            onChange={(e) => onChange({ site_title: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Official Website Canonical URL</label>
          <input
            type="url"
            value={settings.website_url}
            onChange={(e) => onChange({ website_url: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-gray-300">Application Global Description</label>
          <input
            type="text"
            value={settings.site_description}
            onChange={(e) => onChange({ site_description: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">System Base Currency</label>
          <select
            value={settings.default_currency}
            onChange={(e) => onChange({ default_currency: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          >
            <option value="PHP (₱)">Philippine Peso - PHP (₱)</option>
            <option value="USD ($)">US Dollar - USD ($)</option>
            <option value="SGD ($)">Singapore Dollar - SGD ($)</option>
            <option value="EUR (€)">Euro - EUR (€)</option>
            <option value="JPY (¥)">Japanese Yen - JPY (¥)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">System Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => onChange({ timezone: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          >
            <option value="Asia/Manila (GMT+8)">Asia/Manila (PHT, GMT+8)</option>
            <option value="Asia/Singapore (GMT+8)">Asia/Singapore (SGT, GMT+8)</option>
            <option value="Asia/Tokyo (GMT+9)">Asia/Tokyo (JST, GMT+9)</option>
            <option value="UTC (GMT+0)">Coordinated Universal Time (UTC)</option>
            <option value="America/New_York (EST)">America/New_York (EST)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Standard Date Format</label>
          <select
            value={settings.date_format}
            onChange={(e) => onChange({ date_format: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD (2026-09-18)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (18/09/2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (09/18/2026)</option>
            <option value="MMMM D, YYYY">September 18, 2026</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Time Format</label>
          <select
            value={settings.time_format}
            onChange={(e) => onChange({ time_format: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          >
            <option value="12-hour (AM/PM)">12-hour format (e.g. 03:45 PM)</option>
            <option value="24-hour">24-hour military format (e.g. 15:45)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">First Day of Week</label>
          <select
            value={settings.first_day_week}
            onChange={(e) => onChange({ first_day_week: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          >
            <option value="Monday">Monday (Standard)</option>
            <option value="Sunday">Sunday</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Fleet Measurement Units</label>
          <select
            value={settings.measurement_unit}
            onChange={(e) => onChange({ measurement_unit: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          >
            <option value="Metric (km/h, km)">Metric (Kilometers, km/h, kg)</option>
            <option value="Imperial (mph, mi)">Imperial (Miles, mph, lbs)</option>
          </select>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-gray-300">System Operational Status</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "Operational", desc: "All services online & booking active", color: "text-[#39FF14]" },
              { id: "Maintenance Mode", desc: "Public store offline, admin active", color: "text-amber-400" },
              { id: "Limited Access", desc: "B2B Fleet quotations only", color: "text-blue-400" }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => onChange({ system_status: st.id })}
                className={"p-3.5 rounded-xl border text-left transition-all " +
                  (settings.system_status === st.id
                    ? "border-[#39FF14]/40 bg-[#39FF14]/5"
                    : "border-white/5 bg-white/2 hover:border-white/10")
                }
              >
                <div className={"text-xs font-bold font-orbitron " + st.color}>{st.id}</div>
                <div className="text-[10px] text-gray-500 mt-1">{st.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
