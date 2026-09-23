import React from "react";
import { CheckCircle, RefreshCw } from "lucide-react";
import { SystemSettingsState } from "../types";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
  saving: boolean;
}

export const LocalizationTaxSection: React.FC<Props> = ({ settings, onChange, onSave, saving }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold font-orbitron text-white">Localization, Tax & Financial Rules</h2>
          <p className="text-xs text-gray-400 mt-1">
            Configure BIR Value-Added Tax (VAT), withholding rules, quotation & sales invoice numbering prefixes.
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-black font-orbitron font-bold text-xs hover:bg-[#4FFF2A] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Save Tax & Financials
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Default Value-Added Tax (VAT)</label>
          <input
            type="text"
            value={settings.tax_default_rate}
            onChange={(e) => onChange({ tax_default_rate: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">BIR VAT Registered Number</label>
          <input
            type="text"
            value={settings.tax_vat_number}
            onChange={(e) => onChange({ tax_vat_number: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Expanded Withholding Tax (EWT)</label>
          <input
            type="text"
            value={settings.tax_withholding_rate}
            onChange={(e) => onChange({ tax_withholding_rate: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Default Payment Terms (Days)</label>
          <input
            type="number"
            value={settings.tax_payment_terms_days}
            onChange={(e) => onChange({ tax_payment_terms_days: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Quotation Document Number Prefix</label>
          <input
            type="text"
            value={settings.tax_quote_prefix}
            onChange={(e) => onChange({ tax_quote_prefix: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Official Sales Invoice Prefix</label>
          <input
            type="text"
            value={settings.tax_invoice_prefix}
            onChange={(e) => onChange({ tax_invoice_prefix: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 font-mono"
          />
        </div>

        <div className="p-4 rounded-xl border border-white/5 bg-white/2 flex items-center justify-between md:col-span-2">
          <div>
            <p className="text-xs font-semibold text-white">Prices are Tax-Inclusive by Default</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Quotations and checkout balances already include 12% VAT</p>
          </div>
          <input
            type="checkbox"
            checked={settings.tax_inclusive}
            onChange={(e) => onChange({ tax_inclusive: e.target.checked })}
            className="accent-[#39FF14] w-5 h-5 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
