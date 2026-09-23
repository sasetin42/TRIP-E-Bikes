import React, { useState } from "react";
import { CheckCircle, RefreshCw, Mail, Send, Server, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SettingsService } from "@/services/settingsService";
import { SystemSettingsState } from "../types";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
  saving: boolean;
  onNavigateToTemplates?: () => void;
}

export const SmtpSection: React.FC<Props> = ({ settings, onChange, onSave, saving, onNavigateToTemplates }) => {
  const [testingConnection, setTestingConnection] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testRecipient, setTestRecipient] = useState("admin@tripmobility.ph");
  const [diagnosticResult, setDiagnosticResult] = useState<{ success: boolean; message: string; latency: number } | null>(null);

  const activeTemplatesCount = (settings.email_templates || []).filter((t) => t.status === "active" || t.enabled).length;

  const handleTestSmtp = async () => {
    setTestingConnection(true);
    try {
      const res = await SettingsService.testSmtp(
        settings.smtp_host,
        settings.smtp_port,
        settings.smtp_user,
        settings.smtp_from_email
      );
      setDiagnosticResult({ success: res.success, message: res.message, latency: res.latencyMs });
      if (res.success) {
        toast.success("SMTP Connection verified successfully!");
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error("SMTP Diagnostic failed: " + err.message);
    }
    setTestingConnection(false);
  };

  const handleSendTestEmail = async () => {
    if (!testRecipient) {
      toast.error("Please provide a recipient email address.");
      return;
    }
    setSendingTestEmail(true);
    const welcomeTpl = settings.email_templates?.find((t) => t.id === "tpl_welcome") || settings.email_templates?.[0];
    if (!welcomeTpl) {
      toast.error("No active email templates found to send test.");
      setSendingTestEmail(false);
      return;
    }

    const res = await SettingsService.sendTemplatedEmail({
      template: welcomeTpl,
      recipient: testRecipient,
      settings,
      customSubject: `[SMTP Diagnostic Test] ${welcomeTpl.subject}`,
    });

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error("Dispatch failed: " + res.message);
    }
    setSendingTestEmail(false);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold font-orbitron text-white">SMTP & Mail Server Dispatcher</h2>
          <p className="text-xs text-gray-400 mt-1">
            Configure enterprise outbound mail delivery for quotation notifications, customer alerts, and invoices.
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-black font-orbitron font-bold text-xs hover:bg-[#4FFF2A] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Save SMTP Config
        </button>
      </div>

      {/* SMTP & Template Synchronization Banner */}
      <div className="bg-[#111111] border border-[#39FF14]/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14] shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-orbitron">SMTP & Email Templates Synchronized</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 font-semibold">
                {activeTemplatesCount} Active Templates
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              All automated system events, customer notifications, and invoices dispatch through this active SMTP configuration.
            </p>
          </div>
        </div>
        {onNavigateToTemplates && (
          <button
            type="button"
            onClick={onNavigateToTemplates}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition-all shrink-0 self-start sm:self-auto"
          >
            Manage Email Templates →
          </button>
        )}
      </div>

      <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl p-5 space-y-5">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">SMTP Host / Server Address</label>
            <input
              type="text"
              value={settings.smtp_host}
              onChange={(e) => onChange({ smtp_host: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">SMTP Server Port</label>
            <input
              type="text"
              value={settings.smtp_port}
              onChange={(e) => onChange({ smtp_port: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">SMTP Auth Username / API Identity</label>
            <input
              type="text"
              value={settings.smtp_user}
              onChange={(e) => onChange({ smtp_user: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">SMTP Auth Password / API Key (Masked)</label>
            <input
              type="password"
              value={settings.smtp_pass}
              onChange={(e) => onChange({ smtp_pass: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Security Encryption Protocol</label>
            <select
              value={settings.smtp_encrypt}
              onChange={(e) => onChange({ smtp_encrypt: e.target.value })}
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
            >
              <option value="TLS">SSL / TLS (Port 465 Recommended)</option>
              <option value="STARTTLS">STARTTLS (Port 587)</option>
              <option value="None">None (Unencrypted)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Sender Display Name (From Name)</label>
            <input
              type="text"
              value={settings.smtp_from_name}
              onChange={(e) => onChange({ smtp_from_name: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Sender Email Address (From Email)</label>
            <input
              type="email"
              value={settings.smtp_from_email}
              onChange={(e) => onChange({ smtp_from_email: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Reply-To Address</label>
            <input
              type="email"
              value={settings.smtp_reply_to}
              onChange={(e) => onChange({ smtp_reply_to: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl border border-white/10 p-5 space-y-4 bg-white/2">
        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
          <Server className="w-4 h-4 text-[#39FF14]" />
          <h3 className="font-orbitron font-bold text-xs uppercase tracking-wider text-white">
            Connection Test & Test Email Dispatcher
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-xs text-gray-400">
              Trigger a socket ping to verify TLS certificate validation, firewall clearance, and authentication credentials.
            </p>
            <button
              type="button"
              onClick={handleTestSmtp}
              disabled={testingConnection}
              className="px-4 py-2.5 rounded-xl border border-[#39FF14]/30 bg-[#39FF14]/10 hover:bg-[#39FF14]/20 text-[#39FF14] text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {testingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              Test SMTP Handshake
            </button>

            {diagnosticResult && (
              <div className="p-3 rounded-xl border border-[#39FF14]/20 bg-[#39FF14]/5 text-xs text-white space-y-1">
                <div className="flex items-center gap-1.5 text-[#39FF14] font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" /> Handshake Passed ({diagnosticResult.latency}ms)
                </div>
                <p className="text-[11px] text-gray-400">{diagnosticResult.message}</p>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-gray-300">Dispatch Real Test Message</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="recipient@domain.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
              />
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={sendingTestEmail}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {sendingTestEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-[#39FF14]" />}
                Send
              </button>
            </div>
            <span className="text-[10px] text-gray-400">
              Sends an automated TRIP diagnostic verification payload.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
