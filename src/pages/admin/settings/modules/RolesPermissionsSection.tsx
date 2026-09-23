import React from "react";
import { CheckCircle, RefreshCw, Shield } from "lucide-react";
import { SystemSettingsState } from "../types";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
  saving: boolean;
}

const ACTIONS = ["view", "create", "edit", "delete", "export", "approve", "manage", "configure"] as const;

export const RolesPermissionsSection: React.FC<Props> = ({ settings, onChange, onSave, saving }) => {
  const roles = settings.role_permissions || {};

  const handleToggle = (role: string, action: string) => {
    if (role === "Super Admin" && action === "configure") return;
    const roleObj = { ...(roles[role] || {}) };
    roleObj[action] = !roleObj[action];
    onChange({
      role_permissions: {
        ...roles,
        [role]: roleObj,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold font-orbitron text-white">Roles & Granular Permissions Matrix</h2>
          <p className="text-xs text-gray-400 mt-1">
            Enforce role-based access control (RBAC) across administrative modules, quotation approvals, and system settings.
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-black font-orbitron font-bold text-xs hover:bg-[#4FFF2A] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Save Permissions
        </button>
      </div>

      <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/2 text-[11px] font-orbitron uppercase text-gray-400">
                <th className="p-4">Staff Role Tier</th>
                {ACTIONS.map((act) => (
                  <th key={act} className="p-4 text-center capitalize">{act}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-gray-300">
              {Object.entries(roles).map(([roleName, perms]) => (
                <tr key={roleName} className="hover:bg-white/2 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Shield className={"w-4 h-4 " + (roleName === "Super Admin" ? "text-[#39FF14]" : "text-gray-400")} />
                      <span className="font-semibold text-white">{roleName}</span>
                    </div>
                  </td>
                  {ACTIONS.map((act) => {
                    const isAllowed = !!perms[act];
                    const isLocked = roleName === "Super Admin";

                    return (
                      <td key={act} className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isAllowed}
                          disabled={isLocked}
                          onChange={() => handleToggle(roleName, act)}
                          className="accent-[#39FF14] w-4 h-4 cursor-pointer disabled:opacity-60"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
