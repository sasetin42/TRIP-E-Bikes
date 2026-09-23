import React, { useState } from "react";
import { CheckCircle, RefreshCw, CreditCard, Eye, EyeOff, Activity } from "lucide-react";
import { toast } from "sonner";
import { SettingsService } from "@/services/settingsService";
import { SystemSettingsState, PaymentGatewayConfig } from "../types";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
  saving: boolean;
}

export const PaymentSection: React.FC<Props> = ({ settings, onChange, onSave, saving }) => {
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const [testingId, setTestingId] = useState<string | null>(null);

  const gateways = settings.payment_gateways || [];

  const toggleReveal = (id: string) => {
    setRevealedSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateGateway = (id: string, patch: Partial<PaymentGatewayConfig>) => {
    const updated = gateways.map((g) => (g.id === id ? { ...g, ...patch } : g));
    onChange({ payment_gateways: updated });
  };

  const handleTestGateway = async (gateway: PaymentGatewayConfig) => {
    setTestingId(gateway.id);
    try {
      const res = await SettingsService.testPaymentGateway(gateway.name);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error("Test failed: " + res.message);
      }
    } catch (err: any) {
      toast.error("Test error: " + err.message);
    }
    setTestingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold font-orbitron text-white">Payment Gateways & Billing Rules</h2>
          <p className="text-xs text-gray-400 mt-1">
            Configure GCash, Maya, Bank Transfer, and Stripe endpoints with encrypted credentials, test mode toggles, and live diagnostics.
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-black font-orbitron font-bold text-xs hover:bg-[#4FFF2A] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Save Payment Gateways
        </button>
      </div>

      <div className="space-y-5">
        {gateways.map((gw) => {
          const isSecretShown = !!revealedSecrets[gw.id];
          const isTesting = testingId === gw.id;

          return (
            <div
              key={gw.id}
              className={"bg-[#0E0E0E] border border-white/10 rounded-2xl border p-5 space-y-4 transition-all " +
                (gw.enabled ? "border-[#39FF14]/30 bg-[#39FF14]/2" : "border-white/5 opacity-80")
              }
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                <div className="flex items-center gap-3">
                  <div className={"w-10 h-10 rounded-xl flex items-center justify-center border " +
                    (gw.enabled ? "bg-[#39FF14]/15 border-[#39FF14]/30 text-[#39FF14]" : "bg-white/5 border-white/10 text-gray-400")
                  }>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                      {gw.name}
                      <span className={"text-[9px] px-2 py-0.5 rounded uppercase font-orbitron font-bold " +
                        (gw.mode === "live" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30")
                      }>
                        {gw.mode}
                      </span>
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Currency: {gw.currency} · Surcharge: {gw.feePercentage}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={gw.mode}
                    onChange={(e) => handleUpdateGateway(gw.id, { mode: e.target.value as any })}
                    className="bg-[#141414] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-300 font-semibold focus:outline-none"
                  >
                    <option value="sandbox">Sandbox / Test</option>
                    <option value="live">Live Production</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => handleUpdateGateway(gw.id, { enabled: !gw.enabled })}
                    className={"px-3 py-1.5 rounded-lg text-xs font-semibold font-orbitron transition-all " +
                      (gw.enabled ? "bg-[#39FF14] text-black font-bold" : "bg-white/5 text-gray-400 border border-white/10")
                    }
                  >
                    {gw.enabled ? "Enabled" : "Disabled"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-400">Merchant / Account Identifier</label>
                  <input
                    type="text"
                    value={gw.accountId}
                    onChange={(e) => handleUpdateGateway(gw.id, { accountId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-400">Public API Key / Client ID</label>
                  <input
                    type="text"
                    value={gw.apiKey}
                    onChange={(e) => handleUpdateGateway(gw.id, { apiKey: e.target.value })}
                    placeholder="pk_live_..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-gray-400">Secret API Key (Encrypted at Rest)</label>
                    <button
                      type="button"
                      onClick={() => toggleReveal(gw.id)}
                      className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      {isSecretShown ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {isSecretShown ? "Mask Secret" : "Reveal Secret"}
                    </button>
                  </div>
                  <input
                    type={isSecretShown ? "text" : "password"}
                    value={gw.secretKey}
                    onChange={(e) => handleUpdateGateway(gw.id, { secretKey: e.target.value })}
                    placeholder="sk_live_..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-gray-400">Webhook Receiver Endpoint</label>
                  <input
                    type="url"
                    value={gw.webhookUrl}
                    onChange={(e) => handleUpdateGateway(gw.id, { webhookUrl: e.target.value })}
                    placeholder="https://api.tripmobility.ph/webhooks/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 font-mono"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-400">Customer Instructions (Displayed on Checkout / Quotation)</label>
                  <input
                    type="text"
                    value={gw.instructions}
                    onChange={(e) => handleUpdateGateway(gw.id, { instructions: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">
                  Credentials masked with SHA-256 vault standard
                </span>

                <button
                  type="button"
                  onClick={() => handleTestGateway(gw)}
                  disabled={isTesting}
                  className="px-3.5 py-1.5 rounded-xl border border-[#39FF14]/30 bg-[#39FF14]/10 hover:bg-[#39FF14]/20 text-[#39FF14] text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                  Test Connection & Diagnostics
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
