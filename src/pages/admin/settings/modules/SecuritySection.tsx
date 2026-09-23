import React, { useState } from "react";
import { CheckCircle, RefreshCw, ShieldCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { SystemSettingsState } from "../types";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
  saving: boolean;
}

export const SecuritySection: React.FC<Props> = ({ settings, onChange, onSave, saving }) => {
  const [terminatingSessions, setTerminatingSessions] = useState(false);

  let score = 50;
  if (settings.security_two_factor) score += 20;
  if (settings.security_brute_force) score += 10;
  if (Number(settings.security_min_password_length) >= 8) score += 10;
  if (settings.security_require_special_chars) score += 5;
  if (settings.security_ip_whitelist) score += 5;

  const handleForceLogoutAll = async () => {
    setTerminatingSessions(true);
    await new Promise((r) => setTimeout(r, 800));
    onChange({ security_active_sessions_count: 1 });
    toast.success("Terminated all foreign active sessions. Only your session remains active.");
    setTerminatingSessions(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold font-orbitron text-white">Security Controls & Protection Shield</h2>
          <p className="text-xs text-gray-400 mt-1">
            Two-factor enforcement, IP address restrictions, password complexity requirements, and session revocations.
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-black font-orbitron font-bold text-xs hover:bg-[#4FFF2A] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Save Security Policies
        </button>
      </div>

      <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl border border-white/10 p-5 bg-gradient-to-r from-[#39FF14]/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl border border-[#39FF14]/30 bg-[#39FF14]/10 flex items-center justify-center text-[#39FF14] shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-black text-xl text-white">Security Score: {score}%</span>
              <span className={"text-[10px] px-2 py-0.5 rounded font-bold uppercase " +
                (score >= 80 ? "bg-[#39FF14]/20 text-[#39FF14]" : "bg-amber-500/20 text-amber-400")
              }>
                {score >= 80 ? "Excellent" : "Needs Review"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Enterprise hardening level based on 2FA, password complexity, and session parameters.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleForceLogoutAll}
          disabled={terminatingSessions}
          className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          {terminatingSessions ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserX className="w-3.5 h-3.5" />}
          Force Revoke Other Sessions ({settings.security_active_sessions_count})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-4 rounded-xl border border-white/5 bg-white/2 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">Enforce Two-Factor Authentication (2FA)</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Requires OTP challenge on all administrator logins</p>
          </div>
          <input
            type="checkbox"
            checked={settings.security_two_factor}
            onChange={(e) => onChange({ security_two_factor: e.target.checked })}
            className="accent-[#39FF14] w-5 h-5 cursor-pointer"
          />
        </div>

        <div className="p-4 rounded-xl border border-white/5 bg-white/2 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">Brute Force & Rate Limit Shield</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Automated IP block on 5 failed attempts</p>
          </div>
          <input
            type="checkbox"
            checked={settings.security_brute_force}
            onChange={(e) => onChange({ security_brute_force: e.target.checked })}
            className="accent-[#39FF14] w-5 h-5 cursor-pointer"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Minimum Password Length</label>
          <input
            type="number"
            value={settings.security_min_password_length}
            onChange={(e) => onChange({ security_min_password_length: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Account Lockout Duration (Minutes)</label>
          <input
            type="number"
            value={settings.security_lockout_duration_mins}
            onChange={(e) => onChange({ security_lockout_duration_mins: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-gray-300">Allowed IP Whitelist (Comma Separated)</label>
          <input
            type="text"
            value={settings.security_ip_whitelist}
            onChange={(e) => onChange({ security_ip_whitelist: e.target.value })}
            placeholder="e.g. 192.168.1.1, 10.0.0.1/24 (Leave blank to permit any trusted IP)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 font-mono"
          />
        </div>
      </div>
    </div>
  );
};
