import { useState, useEffect, useCallback } from "react";
import { 
  Settings, Loader2, Save, ToggleLeft, ToggleRight, Shield, MessageCircle, Star, Gift, RefreshCw,
  Globe, Mail, Lock, Key, ShieldAlert, Upload, Image, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

type TabType = "features" | "general" | "appearance" | "smtp" | "security";

interface FeatureSetting {
  key: string;
  value: boolean;
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
  const [activeTab, setActiveTab] = useState<TabType>("features");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [featureSaving, setFeatureSaving] = useState<string | null>(null);

  const [features, setFeatures] = useState<FeatureSetting[]>([]);
  
  // General Info States
  const [siteTitle, setSiteTitle] = useState("TRIP Mobility");
  const [supportEmail, setSupportEmail] = useState("support@tripmobility.ph");
  const [supportPhone, setSupportPhone] = useState("+63 2 8123 4567");
  const [currency, setCurrency] = useState("PHP (₱)");
  const [systemStatus, setSystemStatus] = useState("Operational");

  // Appearance States
  const [logoMain, setLogoMain] = useState("");
  const [logoDark, setLogoDark] = useState("");
  const [logoFavicon, setLogoFavicon] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);

  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState("smtp.resend.com");
  const [smtpPort, setSmtpPort] = useState("465");
  const [smtpUser, setSmtpUser] = useState("resend");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpEncrypt, setSmtpEncrypt] = useState("TLS");
  const [smtpFromEmail, setSmtpFromEmail] = useState("noreply@tripmobility.ph");
  const [smtpFromName, setSmtpFromName] = useState("TRIP Mobility");

  // Security Settings
  const [minPasswordLength, setMinPasswordLength] = useState("8");
  const [requireSpecialChar, setRequireSpecialChar] = useState(true);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  const [ipLockout, setIpLockout] = useState("");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("system_settings").select("*");
    if (error) {
      toast.error("Failed to load settings: " + error.message);
      setLoading(false);
      return;
    }

    const featureList: FeatureSetting[] = [];
    for (const row of (data || [])) {
      const k = row.key;
      const val = row.value;

      if (k.endsWith("_enabled") || k === "hide_prices") {
        featureList.push({
          key: k,
          value: val === true || val === "true" || val === 1,
          label: k === "hide_prices" ? "Hide Prices (Quotation Mode)" : k.replace(/_enabled$/, "").replace(/_/g, " "),
          description: k === "hide_prices" 
            ? "Globally hide e-bike prices and starting-at details across the public site"
            : row.description || `Toggle ${k.replace(/_/g, " ")} feature`,
        });
      } else {
        const strVal = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
        switch (k) {
          case "site_title": setSiteTitle(strVal); break;
          case "support_email": setSupportEmail(strVal); break;
          case "support_phone": setSupportPhone(strVal); break;
          case "currency": setCurrency(strVal); break;
          case "system_status": setSystemStatus(strVal); break;
          case "logo_main": setLogoMain(strVal); break;
          case "logo_dark": setLogoDark(strVal); break;
          case "logo_favicon": setLogoFavicon(strVal); break;
          case "smtp_host": setSmtpHost(strVal); break;
          case "smtp_port": setSmtpPort(strVal); break;
          case "smtp_user": setSmtpUser(strVal); break;
          case "smtp_pass": setSmtpPass(strVal); break;
          case "smtp_encrypt": setSmtpEncrypt(strVal); break;
          case "smtp_from_email": setSmtpFromEmail(strVal); break;
          case "smtp_from_name": setSmtpFromName(strVal); break;
          case "security_min_password": setMinPasswordLength(strVal); break;
          case "security_require_special": setRequireSpecialChar(val === true || val === "true"); break;
          case "security_mfa_required": setTwoFactorRequired(val === true || val === "true"); break;
          case "security_session_timeout": setSessionTimeout(strVal); break;
          case "security_ip_lockout": setIpLockout(strVal); break;
        }
      }
    }

    if (featureList.length === 0) {
      featureList.push(
        { key: "loyalty_program_enabled", value: true, label: "Loyalty Program", description: "Reward customers points on bookings & referrals" },
        { key: "chat_enabled", value: true, label: "Live Chat Support", description: "Realtime support workspace for visitors" },
        { key: "reviews_enabled", value: true, label: "Product Reviews", description: "Allow customers to write E-Bike review replies" },
        { key: "referral_enabled", value: true, label: "Referral Tracking", description: "Generate dynamic sharing hashes for customers" }
      );
    }
    
    if (!featureList.some((f) => f.key === "hide_prices")) {
      featureList.push({
        key: "hide_prices",
        value: true,
        label: "Hide Prices (Quotation Mode)",
        description: "Globally hide e-bike prices and starting-at details across the public site",
      });
    }

    setFeatures(featureList);
    setLoading(false);
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const upsertSetting = async (key: string, value: any) => {
    const { error } = await supabase.from("system_settings").upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);

    try {
      const docRef = doc(db, "settings", "system");
      await setDoc(docRef, { [key]: value }, { merge: true });
    } catch (fsErr) {
      console.error("Failed to sync setting to Firestore:", fsErr);
    }
  };

  const saveSection = async () => {
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      if (activeTab === "general") {
        payload.site_title = siteTitle;
        payload.support_email = supportEmail;
        payload.support_phone = supportPhone;
        payload.currency = currency;
        payload.system_status = systemStatus;
      } else if (activeTab === "smtp") {
        payload.smtp_host = smtpHost;
        payload.smtp_port = smtpPort;
        payload.smtp_user = smtpUser;
        payload.smtp_pass = smtpPass;
        payload.smtp_encrypt = smtpEncrypt;
        payload.smtp_from_email = smtpFromEmail;
        payload.smtp_from_name = smtpFromName;
      } else if (activeTab === "security") {
        payload.security_min_password = minPasswordLength;
        payload.security_require_special = requireSpecialChar;
        payload.security_mfa_required = twoFactorRequired;
        payload.security_session_timeout = sessionTimeout;
        payload.security_ip_lockout = ipLockout;
      }

      for (const [k, v] of Object.entries(payload)) {
        await upsertSetting(k, v);
      }
      toast.success("Settings updated successfully.");
    } catch (e: any) {
      toast.error("Save failed: " + e.message);
    }
    setSaving(false);
  };

  const toggleFeature = async (key: string, currentValue: boolean) => {
    setFeatureSaving(key);
    const newValue = !currentValue;
    try {
      await upsertSetting(key, newValue);
      setFeatures((prev) => prev.map((f) => (f.key === key ? { ...f, value: newValue } : f)));
      toast.success(`Feature updated successfully`);
    } catch (e: any) {
      toast.error("Failed to update feature: " + e.message);
    }
    setFeatureSaving(null);
  };

  const handleAssetUpload = async (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(key);
    try {
      const ext = file.name.split(".").pop();
      const path = `brand/${key}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: true });
      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
      const url = urlData.publicUrl;

      await upsertSetting(key, url);
      if (key === "logo_main") setLogoMain(url);
      if (key === "logo_dark") setLogoDark(url);
      if (key === "logo_favicon") setLogoFavicon(url);
      toast.success("Brand asset uploaded successfully.");
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    }
    setUploadingLogo(null);
  };

  const handleAssetDelete = async (key: string) => {
    setUploadingLogo(key);
    try {
      await upsertSetting(key, "");
      if (key === "logo_main") setLogoMain("");
      if (key === "logo_dark") setLogoDark("");
      if (key === "logo_favicon") setLogoFavicon("");
      toast.success("Brand asset deleted successfully.");
    } catch (err: any) {
      toast.error("Deletion failed: " + err.message);
    }
    setUploadingLogo(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron font-bold text-2xl text-white">System Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure global variables, SMTP servers, brand logos, and security parameters.</p>
        </div>
        <button
          onClick={loadSettings}
          className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl border border-white/10 text-gray-400 hover:text-white text-xs font-semibold transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-2 overflow-x-auto">
        {(["features", "general", "appearance", "smtp", "security"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 border-b-2 text-xs font-bold font-orbitron uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === tab
                ? "border-[#39FF14] text-[#39FF14]"
                : "border-transparent text-gray-500 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── FEATURES TAB ── */}
      {activeTab === "features" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((setting) => {
            const Icon = FEATURE_ICONS[setting.key] || Settings;
            return (
              <div
                key={setting.key}
                className={`glass rounded-2xl border p-6 transition-all ${
                  setting.value ? "border-[#39FF14]/20 bg-[#39FF14]/3" : "border-white/5"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-all ${setting.value ? "bg-[#39FF14]/15 border-[#39FF14]/30" : "bg-white/5 border-white/10"}`}>
                      <Icon className={`w-6 h-6 ${setting.value ? "text-[#39FF14]" : "text-gray-500"}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm capitalize">{setting.label}</h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{setting.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFeature(setting.key, setting.value)}
                    disabled={featureSaving === setting.key}
                    className="shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {featureSaving === setting.key ? (
                      <Loader2 className="w-9 h-9 text-[#39FF14] animate-spin" />
                    ) : setting.value ? (
                      <ToggleRight className="w-10 h-10 text-[#39FF14]" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── GENERAL TAB ── */}
      {activeTab === "general" && (
        <div className="glass rounded-2xl border border-white/5 p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <Globe className="w-5 h-5 text-[#39FF14]" />
            <h2 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">General Configurations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">Site / Application Title</label>
              <input type="text" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">Default System Currency</label>
              <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">Support Helpdesk Email</label>
              <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">Support Contact Phone</label>
              <input type="text" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs text-gray-400 font-semibold">Operational System Status</label>
              <select value={systemStatus} onChange={(e) => setSystemStatus(e.target.value)} className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30">
                <option value="Operational">Operational (Online)</option>
                <option value="Maintenance Mode">Maintenance Mode</option>
                <option value="Limited Access">Limited Fleet Access</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={saveSection} disabled={saving} className="px-6 py-3 rounded-xl bg-[#39FF14] text-[#0A0A0A] hover:bg-[#4FFF2A] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save General Configurations
            </button>
          </div>
        </div>
      )}

      {/* ── APPEARANCE TAB ── */}
      {activeTab === "appearance" && (
        <div className="glass rounded-2xl border border-white/5 p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <Image className="w-5 h-5 text-[#39FF14]" />
            <h2 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">Appearance & Brand Assets</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { key: "logo_main", label: "Main Logo", value: logoMain, bg: "bg-black" },
              { key: "logo_dark", label: "Dark Mode Logo", value: logoDark, bg: "bg-white" },
              { key: "logo_favicon", label: "Favicon Shortcut", value: logoFavicon, bg: "bg-black" },
            ].map(({ key, label, value, bg }) => (
              <div key={key} className="p-4 rounded-xl border border-white/5 bg-white/2 flex flex-col items-center justify-between text-center space-y-4">
                <span className="text-[11px] font-bold text-gray-400 font-orbitron uppercase tracking-wide">{label}</span>
                <div className={`w-32 h-20 border border-white/10 rounded-lg flex items-center justify-center ${bg} overflow-hidden relative`}>
                  {value ? (
                    <img src={value} alt={label} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className={`text-[10px] ${bg === "bg-black" ? "text-gray-600" : "text-gray-400"}`}>No {label.toLowerCase()}</span>
                  )}
                  {uploadingLogo === key && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-[#39FF14] animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <label className="px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-gray-300 hover:text-white cursor-pointer transition-all flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleAssetUpload(key, e)} />
                  </label>
                  {value && (
                    <button onClick={() => handleAssetDelete(key)} className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SMTP TAB ── */}
      {activeTab === "smtp" && (
        <div className="glass rounded-2xl border border-white/5 p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <Mail className="w-5 h-5 text-[#39FF14]" />
            <h2 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">SMTP Server Configurations</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "SMTP Host Address", value: smtpHost, onChange: setSmtpHost, type: "text" },
              { label: "SMTP Port Number", value: smtpPort, onChange: setSmtpPort, type: "text" },
              { label: "SMTP Login Username", value: smtpUser, onChange: setSmtpUser, type: "text" },
              { label: "SMTP Login Password", value: smtpPass, onChange: setSmtpPass, type: "password" },
              { label: "Sender Name (From Name)", value: smtpFromName, onChange: setSmtpFromName, type: "text" },
              { label: "Sender Email (From Address)", value: smtpFromEmail, onChange: setSmtpFromEmail, type: "email" },
            ].map(({ label, value, onChange, type }) => (
              <div key={label} className="space-y-1.5">
                <label className="text-xs text-gray-400 font-semibold">{label}</label>
                <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30" />
              </div>
            ))}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs text-gray-400 font-semibold">SMTP Security Encryption</label>
              <select value={smtpEncrypt} onChange={(e) => setSmtpEncrypt(e.target.value)} className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30">
                <option value="TLS">SSL / TLS (Secure Connection)</option>
                <option value="STARTTLS">STARTTLS (Standard Ports)</option>
                <option value="None">None (Unencrypted)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={saveSection} disabled={saving} className="px-6 py-3 rounded-xl bg-[#39FF14] text-[#0A0A0A] hover:bg-[#4FFF2A] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save SMTP Configurations
            </button>
          </div>
        </div>
      )}

      {/* ── SECURITY TAB ── */}
      {activeTab === "security" && (
        <div className="glass rounded-2xl border border-white/5 p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <Key className="w-5 h-5 text-[#39FF14]" />
            <h2 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">Security Access Controls</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">Minimum Password Length</label>
              <input type="number" value={minPasswordLength} onChange={(e) => setMinPasswordLength(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 font-semibold">User Session Timeout (minutes)</label>
              <input type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30" />
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-white/1 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Require Complexity Symbols</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Enforce uppercase, numbers, and symbols</p>
              </div>
              <button onClick={() => setRequireSpecialChar(!requireSpecialChar)} className="shrink-0">
                {requireSpecialChar ? <ToggleRight className="w-10 h-10 text-[#39FF14]" /> : <ToggleLeft className="w-10 h-10 text-gray-500" />}
              </button>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-white/1 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">Two-Factor Authentication (2FA)</p>
                <p className="text-[10px] text-gray-500 mt-0.5">Enforce OTP codes on user login actions</p>
              </div>
              <button onClick={() => setTwoFactorRequired(!twoFactorRequired)} className="shrink-0">
                {twoFactorRequired ? <ToggleRight className="w-10 h-10 text-[#39FF14]" /> : <ToggleLeft className="w-10 h-10 text-gray-500" />}
              </button>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                Allowed IP Range Restrictions (CSV)
              </label>
              <input type="text" value={ipLockout} onChange={(e) => setIpLockout(e.target.value)} placeholder="e.g. 192.168.1.1, 10.0.0.1/24 (Leave empty to allow all IP addresses)" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30" />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={saveSection} disabled={saving} className="px-6 py-3 rounded-xl bg-[#39FF14] text-[#0A0A0A] hover:bg-[#4FFF2A] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Security Policies
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
