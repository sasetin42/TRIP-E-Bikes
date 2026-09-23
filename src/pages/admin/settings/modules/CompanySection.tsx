import React from "react";
import { CheckCircle, RefreshCw, Building2 } from "lucide-react";
import { SystemSettingsState } from "../types";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
  saving: boolean;
}

export const CompanySection: React.FC<Props> = ({ settings, onChange, onSave, saving }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold font-orbitron text-white">Company Information & Legal Identity</h2>
          <p className="text-xs text-gray-400 mt-1">
            Corporate registration, tax numbers, legal jurisdiction, and official billing address populating all customer documents.
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-black font-orbitron font-bold text-xs hover:bg-[#4FFF2A] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Save Company Info
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Registered Legal Entity Name</label>
          <input
            type="text"
            value={settings.company_legal_name}
            onChange={(e) => onChange({ company_legal_name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Commercial / Trading Brand Name</label>
          <input
            type="text"
            value={settings.company_trading_name}
            onChange={(e) => onChange({ company_trading_name: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Corporate Registration Number (SEC / DTI)</label>
          <input
            type="text"
            value={settings.company_reg_number}
            onChange={(e) => onChange({ company_reg_number: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Tax Identification Number (BIR TIN)</label>
          <input
            type="text"
            value={settings.company_tax_id}
            onChange={(e) => onChange({ company_tax_id: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-gray-300">Principal Office / Billing Street Address</label>
          <input
            type="text"
            value={settings.company_address}
            onChange={(e) => onChange({ company_address: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">City / Municipality</label>
          <input
            type="text"
            value={settings.company_city}
            onChange={(e) => onChange({ company_city: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Province / Region</label>
          <input
            type="text"
            value={settings.company_province}
            onChange={(e) => onChange({ company_province: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Postal / ZIP Code</label>
          <input
            type="text"
            value={settings.company_zip}
            onChange={(e) => onChange({ company_zip: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Official Operational Hours</label>
          <input
            type="text"
            value={settings.company_business_hours}
            onChange={(e) => onChange({ company_business_hours: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Facebook Page URL</label>
          <input
            type="url"
            value={settings.company_facebook}
            onChange={(e) => onChange({ company_facebook: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Instagram Handle / URL</label>
          <input
            type="url"
            value={settings.company_instagram}
            onChange={(e) => onChange({ company_instagram: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-gray-300">Customer Terms & Rental Guidelines Summary</label>
          <textarea
            rows={3}
            value={settings.company_terms}
            onChange={(e) => onChange({ company_terms: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 resize-none"
          />
        </div>
      </div>
    </div>
  );
};
