import { useState, useEffect, useCallback } from "react";
import { 
  Settings, Loader2, Save, ToggleLeft, ToggleRight, Shield, MessageCircle, Star, Gift, 
  RefreshCw, Globe, Server, FileImage, ShieldAlert, Upload, Trash2, Key, Check
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";

interface SystemSetting {
  key: string;
  value: any;
  label: string;
  description: string;
}

const FEATURE_ICONS: Record<string, any> = {
  loyalty_program_enabled: Gift,
  chat_enabled: MessageCircle,
  reviews_enabled: Star,
  referral_enabled: Shield,
};

export default function AdminSystemSettings() {
  const [activeTab, setActiveTab] = useState<"features" | "general" | "appearance" | "smtp" | "security">("features");
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Form states for non-feature tabs
  const [generalForm, setGeneralForm] = useState({
    site_title: "TRIP Mobility",
    support_email: "support@tripmobility.ph",
    support_phone: "+63 2 8123 4567",
    default_currency: "PHP",
    operating_status: "active"
  });

  const [appearanceForm, setAppearanceForm] = useState({
    brand_logo_main: "",
    brand_logo_dark: "",
    brand_favicon: ""
  });

  const [smtpForm, setSmtpForm] = useState({
    smtp_host: "smtp.resend.com",
    smtp_port: "587",
    smtp_user: "resend",
    smtp_pass: "",
    smtp_encryption: "TLS",
    smtp_from_email: "no-reply@tripmobility.ph",
    smtp_from_name: "TRIP Mobility"
  });

  const [securityForm, setSecurityForm] = useState({
    security_pw_policy: "medium",
    security_mfa_enabled: "false",
    security_session_timeout: "60",
    security_rate_limit: "true"
  });

  // Uploader states
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await apiClient.get("/settings");
      if (!error && data) {
        setSettings(data);
        
        // Map settings array back into designated form states
        const getVal = (key: string, fallback: string) => {
          const item = data.find((s: any) => s.key === key);
          return item ? String(item.value) : fallback;
        };

        setGeneralForm({
          site_title: getVal("site_title", "TRIP Mobility"),
          support_email: getVal("support_email", "support@tripmobility.ph"),
          support_phone: getVal("support_phone", "+63 2 8123 4567"),
          default_currency: getVal("default_currency", "PHP"),
          operating_status: getVal("operating_status", "active")
        });

        setAppearanceForm({
          brand_logo_main: getVal("brand_logo_main", ""),
          brand_logo_dark: getVal("brand_logo_dark", ""),
          brand_favicon: getVal("brand_favicon", "")
        });

        setSmtpForm({
          smtp_host: getVal("smtp_host", "smtp.resend.com"),
          smtp_port: getVal("smtp_port", "587"),
          smtp_user: getVal("smtp_user", "resend"),
          smtp_pass: getVal("smtp_pass", ""),
          smtp_encryption: getVal("smtp_encryption", "TLS"),
          smtp_from_email: getVal("smtp_from_email", "no-reply@tripmobility.ph"),
          smtp_from_name: getVal("smtp_from_name", "TRIP Mobility")
        });

        setSecurityForm({
          security_pw_policy: getVal("security_pw_policy", "medium"),
          security_mfa_enabled: getVal("security_mfa_enabled", "false"),
          security_session_timeout: getVal("security_session_timeout", "60"),
          security_rate_limit: getVal("security_rate_limit", "true")
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const toggleFeatureSetting = async (key: string, currentValue: boolean) => {
    setSaving(key);
    const newValue = !currentValue;
    try {
      const { error } = await apiClient.put(`/settings?key=${key}`, { value: newValue });
      if (error) {
        toast.error("Failed to update setting: " + error.message);
      } else {
        setSettings(prev => prev.map(s => s.key === key ? { ...s, value: newValue } : s));
        toast.success(`Feature ${newValue ? "enabled" : "disabled"}`);
      }
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(null);
  };

  const handleSaveForm = async (tabName: string, formData: Record<string, any>) => {
    setSaving(tabName);
    try {
      const { error } = await apiClient.put("/settings", formData);
      if (error) {
        toast.error(`Failed to save ${tabName} settings: ` + error.message);
      } else {
        toast.success(`${tabName.toUpperCase()} settings saved successfully.`);
        fetchSettings(); // Refresh settings state
      }
    } catch (err: any) {
      toast.error(err.message);
    }
    setSaving(null);
  };

  const handleFileUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [key]: true }));
    try {
      const fileRef = ref(storage, `brand-assets/${key}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      // Save to settings db
      const { error } = await apiClient.put(`/settings?key=${key}`, { value: url });
      if (error) throw error;

      setAppearanceForm(prev => ({ ...prev, [key]: url }));
      toast.success("Asset uploaded and saved successfully.");
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    }
    setUploading(prev => ({ ...prev, [key]: false }));
  };

  const handleDeleteAsset = async (key: string) => {
    setUploading(prev => ({ ...prev, [key]: true }));
    try {
      const fileRef = ref(storage, `brand-assets/${key}`);
      try {
        await deleteObject(fileRef);
      } catch (e) {
        console.warn("Storage object already deleted or missing:", e);
      }

      const { error } = await apiClient.put(`/settings?key=${key}`, { value: "" });
      if (error) throw error;

      setAppearanceForm(prev => ({ ...prev, [key]: "" }));
      toast.success("Asset removed successfully.");
    } catch (err: any) {
      toast.error("Deletion failed: " + err.message);
    }
    setUploading(prev => ({ ...prev, [key]: false }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-10 h-10 text-[#39FF14] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="font-orbitron font-black text-2xl text-white uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-7 h-7 text-[#39FF14]" /> System Configuration
          </h1>
          <p className="text-gray-500 text-xs mt-1.5">Manage operating parameters, brand identity assets, mail servers, and security rules</p>
        </div>
        <button
          onClick={fetchSettings}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold transition-all font-orbitron uppercase tracking-wider"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reload
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white/2 border border-white/5">
        {[
          { id: "features", label: "Feature Gates", icon: Settings },
          { id: "general", label: "General Settings", icon: Globe },
          { id: "appearance", label: "Brand Assets", icon: FileImage },
          { id: "smtp", label: "SMTP (E-Mail)", icon: Server },
          { id: "security", label: "Security & MFA", icon: ShieldAlert }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? "bg-[#39FF14]/15 border border-[#39FF14]/25 text-[#39FF14]"
                : "text-gray-400 border border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-4 h-4 shrink-0" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: FEATURE GATES ── */}
      {activeTab === "features" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settings
            .filter(s => Object.keys(FEATURE_ICONS).includes(s.key))
            .map(setting => {
              const IconComp = FEATURE_ICONS[setting.key] || Settings;
              const isEnabled = setting.value === true || setting.value === "true";
              return (
                <div 
                  key={setting.key} 
                  className={`rounded-2xl border p-6 transition-all ${
                    isEnabled 
                      ? "border-[#39FF14]/20 bg-[#39FF14]/3" 
                      : "border-white/5 bg-white/1 hover:bg-white/2"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                        isEnabled ? "bg-[#39FF14]/10 border-[#39FF14]/20" : "bg-white/5 border-white/10"
                      }`}>
                        <IconComp className={`w-6 h-6 ${isEnabled ? "text-[#39FF14]" : "text-gray-500"}`} />
                      </div>
                      <div>
                        <h3 className="font-orbitron font-bold text-white text-sm uppercase tracking-wide">{setting.label}</h3>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{setting.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFeatureSetting(setting.key, isEnabled)}
                      disabled={saving === setting.key}
                      className="shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {saving === setting.key ? (
                        <Loader2 className="w-9 h-9 text-[#39FF14] animate-spin" />
                      ) : isEnabled ? (
                        <ToggleRight className="w-10 h-10 text-[#39FF14]" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-gray-500" />
                      )}
                    </button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isEnabled ? "bg-[#39FF14]/10 text-[#39FF14]" : "bg-gray-500/10 text-gray-500"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? "bg-[#39FF14]" : "bg-gray-500"}`} />
                      {isEnabled ? "ACTIVE" : "DISABLED"}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* ── TAB 2: GENERAL SETTINGS ── */}
      {activeTab === "general" && (
        <div className="rounded-2xl border border-white/5 bg-white/1 p-8 space-y-6">
          <h2 className="font-orbitron font-bold text-base text-white tracking-wide uppercase flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#39FF14]" /> General Information
          </h2>
          <p className="text-[11px] text-gray-500 -mt-2">Customize public site title, currency structures, and operation settings.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">Public Site Title</label>
              <input
                type="text"
                value={generalForm.site_title}
                onChange={e => setGeneralForm(prev => ({ ...prev, site_title: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">Support Email Address</label>
              <input
                type="email"
                value={generalForm.support_email}
                onChange={e => setGeneralForm(prev => ({ ...prev, support_email: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">Support Contact Phone</label>
              <input
                type="text"
                value={generalForm.support_phone}
                onChange={e => setGeneralForm(prev => ({ ...prev, support_phone: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">Default Currency Code</label>
              <select
                value={generalForm.default_currency}
                onChange={e => setGeneralForm(prev => ({ ...prev, default_currency: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30"
              >
                <option value="PHP">PHP (₱) - Philippine Peso</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
              </select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs text-gray-400 font-semibold">Platform Operation Mode</label>
              <select
                value={generalForm.operating_status}
                onChange={e => setGeneralForm(prev => ({ ...prev, operating_status: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30"
              >
                <option value="active">Active (Full operations / Quote builders live)</option>
                <option value="maintenance">Maintenance Mode (Public pages locked)</option>
                <option value="read_only">Read-Only Mode (Inquiries only, no new bookings)</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => handleSaveForm("general", generalForm)}
            disabled={saving === "general"}
            className="btn-primary w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            {saving === "general" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save General Changes
          </button>
        </div>
      )}

      {/* ── TAB 3: BRAND ASSETS ── */}
      {activeTab === "appearance" && (
        <div className="rounded-2xl border border-white/5 bg-white/1 p-8 space-y-6">
          <h2 className="font-orbitron font-bold text-base text-white tracking-wide uppercase flex items-center gap-2">
            <FileImage className="w-5 h-5 text-[#39FF14]" /> Appearance & Logos
          </h2>
          <p className="text-[11px] text-gray-500 -mt-2">Upload and manage visual assets. Direct syncs save paths directly into Firebase Storage.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: "brand_logo_main", label: "Main Logo (Light Mode)", desc: "Main brand logo shown in headers and emails" },
              { id: "brand_logo_dark", label: "Dark Theme Logo", desc: "Logo version with neon green accents on dark layout" },
              { id: "brand_favicon", label: "Favicon Asset", desc: "Small logo displayed in browser tab (recommended .ico/.png)" }
            ].map(asset => {
              const url = (appearanceForm as any)[asset.id];
              const isUploading = uploading[asset.id];
              return (
                <div key={asset.id} className="p-5 border border-white/5 rounded-2xl bg-white/2 space-y-4 flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white uppercase tracking-wide">{asset.label}</p>
                    <p className="text-[10px] text-gray-500 leading-relaxed">{asset.desc}</p>
                  </div>

                  <div className="w-full h-32 rounded-xl border border-white/10 bg-black/40 flex items-center justify-center p-3 relative overflow-hidden group">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-[#39FF14] animate-spin" />
                    ) : url ? (
                      <img src={url} alt={asset.label} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-gray-600 font-semibold uppercase">No Asset Uploaded</span>
                    )}
                  </div>

                  <div className="flex gap-2 w-full pt-2">
                    <label className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-center text-xs font-bold text-gray-300 hover:text-white cursor-pointer transition-all flex items-center justify-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      Upload File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileUpload(asset.id, e)}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                    {url && (
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        disabled={isUploading}
                        className="px-3 py-2 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 4: SMTP CONFIGURATION ── */}
      {activeTab === "smtp" && (
        <div className="rounded-2xl border border-white/5 bg-white/1 p-8 space-y-6">
          <h2 className="font-orbitron font-bold text-base text-white tracking-wide uppercase flex items-center gap-2">
            <Server className="w-5 h-5 text-[#39FF14]" /> E-Mail Server (SMTP)
          </h2>
          <p className="text-[11px] text-gray-500 -mt-2">Provide host configuration variables to handle system alerts, quotation proposals, and auto-replies.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs text-gray-400 font-semibold">SMTP Server Hostname</label>
              <input
                type="text"
                value={smtpForm.smtp_host}
                onChange={e => setSmtpForm(prev => ({ ...prev, smtp_host: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30"
                placeholder="smtp.mailgun.org"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">Server Port</label>
              <input
                type="text"
                value={smtpForm.smtp_port}
                onChange={e => setSmtpForm(prev => ({ ...prev, smtp_port: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30"
                placeholder="587"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">Encryption Type</label>
              <select
                value={smtpForm.smtp_encryption}
                onChange={e => setSmtpForm(prev => ({ ...prev, smtp_encryption: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30"
              >
                <option value="TLS">STARTTLS (TLS)</option>
                <option value="SSL">SSL</option>
                <option value="None">None (Unencrypted)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">SMTP Username</label>
              <input
                type="text"
                value={smtpForm.smtp_user}
                onChange={e => setSmtpForm(prev => ({ ...prev, smtp_user: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">SMTP Access Password</label>
              <input
                type="password"
                value={smtpForm.smtp_pass}
                onChange={e => setSmtpForm(prev => ({ ...prev, smtp_pass: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs text-gray-400 font-semibold">Sender Email Address (From)</label>
              <input
                type="email"
                value={smtpForm.smtp_from_email}
                onChange={e => setSmtpForm(prev => ({ ...prev, smtp_from_email: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">Sender Display Name</label>
              <input
                type="text"
                value={smtpForm.smtp_from_name}
                onChange={e => setSmtpForm(prev => ({ ...prev, smtp_from_name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30"
              />
            </div>
          </div>

          <button
            onClick={() => handleSaveForm("smtp", smtpForm)}
            disabled={saving === "smtp"}
            className="btn-primary w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            {saving === "smtp" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Mail Settings
          </button>
        </div>
      )}

      {/* ── TAB 5: SECURITY CONTROLS ── */}
      {activeTab === "security" && (
        <div className="rounded-2xl border border-white/5 bg-white/1 p-8 space-y-6">
          <h2 className="font-orbitron font-bold text-base text-white tracking-wide uppercase flex items-center gap-2">
            <Key className="w-5 h-5 text-[#39FF14]" /> Security Access Policies
          </h2>
          <p className="text-[11px] text-gray-500 -mt-2">Maintain credential policy thresholds, active sessions timeout limitations, and protection gates.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">Password Strength Policy</label>
              <select
                value={securityForm.security_pw_policy}
                onChange={e => setSecurityForm(prev => ({ ...prev, security_pw_policy: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30"
              >
                <option value="low">Basic (Min. 6 characters, no complexity constraints)</option>
                <option value="medium">Medium (Min. 8 characters, letters & numbers)</option>
                <option value="high">Strict (Min. 10 characters, upper/lower/numbers/symbols)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">Active Session Expiry (Minutes)</label>
              <input
                type="number"
                value={securityForm.security_session_timeout}
                onChange={e => setSecurityForm(prev => ({ ...prev, security_session_timeout: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">Two-Factor Authentication (2FA)</label>
              <select
                value={securityForm.security_mfa_enabled}
                onChange={e => setSecurityForm(prev => ({ ...prev, security_mfa_enabled: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30"
              >
                <option value="false">Disabled (Credential-only login verification)</option>
                <option value="true">Enabled (Enforces MFA auth verification codes)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">API Rate Limiting</label>
              <select
                value={securityForm.security_rate_limit}
                onChange={e => setSecurityForm(prev => ({ ...prev, security_rate_limit: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30"
              >
                <option value="true">Enabled (Bans rapid concurrent api connection requests)</option>
                <option value="false">Disabled (Unlimited connection calls)</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => handleSaveForm("security", securityForm)}
            disabled={saving === "security"}
            className="btn-primary w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            {saving === "security" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Policy Settings
          </button>
        </div>
      )}
    </div>
  );
}
