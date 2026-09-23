import React, { useState } from "react";
import { CheckCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { SystemSettingsState } from "../types";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
  saving: boolean;
}

export const PlatformSection: React.FC<Props> = ({ settings, onChange, onSave, saving }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleToggleMaintenance = () => {
    if (!settings.maintenance_mode) {
      setShowConfirmModal(true);
    } else {
      onChange({ maintenance_mode: false });
      toast.success("Maintenance mode deactivated. Fleet booking store is online.");
    }
  };

  const confirmActivateMaintenance = () => {
    onChange({ maintenance_mode: true });
    setShowConfirmModal(false);
    toast.warning("Maintenance mode ACTIVATED. Public users will see maintenance advisory.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold font-orbitron text-white">Platform Governance & Session Policies</h2>
          <p className="text-xs text-gray-400 mt-1">
            Emergency maintenance mode switch, default sign-up roles, session timeouts, and upload size throttles.
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-black font-orbitron font-bold text-xs hover:bg-[#4FFF2A] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Save Platform Rules
        </button>
      </div>

      <div className={"rounded-2xl border p-5 transition-all " +
        (settings.maintenance_mode ? "border-red-500/40 bg-red-500/10" : "border-white/10 bg-white/2")
      }>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={"w-12 h-12 rounded-xl flex items-center justify-center " +
              (settings.maintenance_mode ? "bg-red-500/20 text-red-400" : "bg-white/5 text-gray-400")
            }>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-sm text-white flex items-center gap-2">
                Emergency System Maintenance Mode
                {settings.maintenance_mode && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-black font-bold uppercase">
                    Active
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                When turned on, the public storefront shows a maintenance message while admin dashboards remain accessible.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleMaintenance}
            className={"px-4 py-2 rounded-xl font-orbitron text-xs font-bold transition-all " +
              (settings.maintenance_mode ? "bg-red-500 hover:bg-red-600 text-black" : "bg-white/10 hover:bg-white/20 text-white")
            }
          >
            {settings.maintenance_mode ? "Disable Maintenance Mode" : "Activate Maintenance Mode"}
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Public Advisory Message</label>
          <input
            type="text"
            value={settings.maintenance_message}
            onChange={(e) => onChange({ maintenance_message: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Default Assigned Role for New Staff</label>
          <select
            value={settings.default_user_role}
            onChange={(e) => onChange({ default_user_role: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          >
            <option value="Staff">Staff (Read Only / Quotes)</option>
            <option value="Manager">Manager (Operations & Billing)</option>
            <option value="Administrator">Administrator</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Admin Session Inactivity Timeout</label>
          <select
            value={settings.session_timeout_minutes}
            onChange={(e) => onChange({ session_timeout_minutes: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          >
            <option value="15">15 Minutes (High Security)</option>
            <option value="30">30 Minutes</option>
            <option value="60">60 Minutes (Default)</option>
            <option value="120">2 Hours</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Max Failed Login Attempts Before Lockout</label>
          <input
            type="number"
            value={settings.max_login_attempts}
            onChange={(e) => onChange({ max_login_attempts: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">File Attachment Upload Limit (MB)</label>
          <input
            type="number"
            value={settings.file_upload_limit_mb}
            onChange={(e) => onChange({ file_upload_limit_mb: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="p-4 rounded-xl border border-white/5 bg-white/2 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">Allow Public Self-Registration</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Let new customer prospects register for quotes</p>
          </div>
          <input
            type="checkbox"
            checked={settings.allow_new_registrations}
            onChange={(e) => onChange({ allow_new_registrations: e.target.checked })}
            className="accent-[#39FF14] w-5 h-5 cursor-pointer"
          />
        </div>

        <div className="p-4 rounded-xl border border-white/5 bg-white/2 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">Permit Guest Quotations</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Allow users to configure e-bikes without signing in</p>
          </div>
          <input
            type="checkbox"
            checked={settings.allow_guest_access}
            onChange={(e) => onChange({ allow_guest_access: e.target.checked })}
            className="accent-[#39FF14] w-5 h-5 cursor-pointer"
          />
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl border border-red-500/40 p-6 max-w-md w-full space-y-4 bg-[#141414]">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-orbitron font-bold text-sm text-white">Confirm Maintenance Mode</h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to activate Maintenance Mode? Public visitors will be restricted from submitting fleet orders and booking e-bikes.
            </p>
            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmActivateMaintenance}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-bold text-black font-orbitron"
              >
                Activate Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
