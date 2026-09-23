import React from "react";
import { CheckCircle, RefreshCw } from "lucide-react";
import { SystemSettingsState } from "../types";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
  saving: boolean;
}

export const NotificationsSection: React.FC<Props> = ({ settings, onChange, onSave, saving }) => {
  const rules = settings.notification_rules || [];

  const handleToggleChannel = (id: string, channel: "email" | "inApp" | "sms" | "push") => {
    const updated = rules.map((r) => (r.id === id ? { ...r, [channel]: !r[channel] } : r));
    onChange({ notification_rules: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold font-orbitron text-white">Event Notification Routing</h2>
          <p className="text-xs text-gray-400 mt-1">
            Configure multi-channel alerts (Email, Web In-App, SMS Gateway, and Mobile Push) triggered across system events.
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-black font-orbitron font-bold text-xs hover:bg-[#4FFF2A] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Save Notifications
        </button>
      </div>

      <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2 text-[11px] font-orbitron uppercase text-gray-400">
                <th className="p-4">Trigger Event</th>
                <th className="p-4">Recipient Scope</th>
                <th className="p-4 text-center">Email</th>
                <th className="p-4 text-center">In-App</th>
                <th className="p-4 text-center">SMS</th>
                <th className="p-4 text-center">Push</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-gray-300">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-white/2 transition-colors">
                  <td className="p-4">
                    <span className="font-semibold text-white block">{r.label}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{r.event}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 border border-white/10 text-gray-300">
                      {r.targetRole}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={r.email}
                      onChange={() => handleToggleChannel(r.id, "email")}
                      className="accent-[#39FF14] w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={r.inApp}
                      onChange={() => handleToggleChannel(r.id, "inApp")}
                      className="accent-[#39FF14] w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={r.sms}
                      onChange={() => handleToggleChannel(r.id, "sms")}
                      className="accent-[#39FF14] w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={r.push}
                      onChange={() => handleToggleChannel(r.id, "push")}
                      className="accent-[#39FF14] w-4 h-4 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
