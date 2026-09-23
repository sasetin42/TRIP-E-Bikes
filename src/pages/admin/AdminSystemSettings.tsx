import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Settings, Loader2, Save, ToggleLeft, ToggleRight, Shield, MessageCircle, Star, Gift,
  RefreshCw, Globe, Mail, Lock, Key, ShieldAlert, Upload, Image, Trash2, Search,
  Building2, Users, CreditCard, Bell, Sliders, Database, HardDrive, Share2, Activity,
  FileCheck, History, Download, ChevronRight, CheckCircle, AlertTriangle, Menu, X
} from "lucide-react";
import { toast } from "sonner";
import { SettingsService, DEFAULT_SYSTEM_SETTINGS } from "@/services/settingsService";
import { SettingsSectionId, SystemSettingsState } from "./settings/types";

// Sub-modules
import { BrandingSection } from "./settings/modules/BrandingSection";
import { GeneralSection } from "./settings/modules/GeneralSection";
import { CompanySection } from "./settings/modules/CompanySection";
import { ContactsSection } from "./settings/modules/ContactsSection";
import { PaymentSection } from "./settings/modules/PaymentSection";
import { SmtpSection } from "./settings/modules/SmtpSection";
import { EmailTemplatesSection } from "./settings/modules/EmailTemplatesSection";
import { NotificationsSection } from "./settings/modules/NotificationsSection";
import { PlatformSection } from "./settings/modules/PlatformSection";
import { RolesPermissionsSection } from "./settings/modules/RolesPermissionsSection";
import { SecuritySection } from "./settings/modules/SecuritySection";
import { ApiIntegrationsSection } from "./settings/modules/ApiIntegrationsSection";
import { StorageCdnSection } from "./settings/modules/StorageCdnSection";
import { DatabaseBackupSection } from "./settings/modules/DatabaseBackupSection";
import { SeoSection } from "./settings/modules/SeoSection";
import { LocalizationTaxSection } from "./settings/modules/LocalizationTaxSection";
import { SystemHealthSection } from "./settings/modules/SystemHealthSection";
import { AuditLogsSection } from "./settings/modules/AuditLogsSection";
import { ImportExportSection } from "./settings/modules/ImportExportSection";
import { VersionHistorySection } from "./settings/modules/VersionHistorySection";

interface NavGroup {
  group: string;
  items: {
    id: SettingsSectionId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: "Core & Features",
    items: [
      { id: "features", label: "Feature Toggles", icon: ToggleRight, description: "Quotation mode, chat, reviews, loyalty" },
      { id: "branding", label: "Branding & Logos", icon: Image, description: "Multi-surface logos, favicons & live previews" },
      { id: "general", label: "General Settings", icon: Globe, description: "Platform title, timezones, temporal formats" },
      { id: "company", label: "Company Information", icon: Building2, description: "Legal entity, registration, TIN, address" },
      { id: "contacts", label: "Contact Profiles", icon: Users, description: "Department staff & notification routing" },
    ],
  },
  {
    group: "Commerce & Billing",
    items: [
      { id: "payment", label: "Payment Gateways", icon: CreditCard, description: "GCash, Maya, Bank Transfer & Stripe" },
      { id: "tax", label: "Tax & Financials", icon: FileCheck, description: "BIR VAT, withholding tax, invoice prefixes" },
    ],
  },
  {
    group: "Communications",
    items: [
      { id: "smtp", label: "Email / SMTP Server", icon: Mail, description: "Outbound host, TLS, authentication & ping" },
      { id: "templates", label: "Email Templates", icon: MessageCircle, description: "HTML notifications with dynamic merge tags" },
      { id: "notifications", label: "Event Notifications", icon: Bell, description: "Email, In-App, SMS and Push dispatch" },
    ],
  },
  {
    group: "Platform & Security",
    items: [
      { id: "platform", label: "Platform Rules", icon: Sliders, description: "Maintenance mode, timeouts, registrations" },
      { id: "roles", label: "User Roles & Matrix", icon: Shield, description: "Granular RBAC permission capabilities" },
      { id: "security", label: "Security & Access", icon: Lock, description: "2FA, brute force shield, IP lockout policies" },
      { id: "api", label: "API & Webhooks", icon: Key, description: "Provision tokens, webhooks, Google maps" },
    ],
  },
  {
    group: "Infrastructure & Telemetry",
    items: [
      { id: "storage", label: "Storage & CDN", icon: HardDrive, description: "Cloud buckets, WebP compression, CDN cache" },
      { id: "database", label: "Database & Backups", icon: Database, description: "Cluster status, retention, snapshot backups" },
      { id: "maintenance", label: "Health & Telemetry", icon: Activity, description: "Real-time microservice socket diagnostics" },
      { id: "seo", label: "SEO & Social Meta", icon: Share2, description: "Search preview, OpenGraph, sitemaps" },
    ],
  },
  {
    group: "Governance & Tools",
    items: [
      { id: "audit", label: "Audit Log Trail", icon: History, description: "Immutable administrator change records" },
      { id: "backup_export", label: "Import & Export", icon: Download, description: "Sanitized portable JSON backup packages" },
      { id: "version", label: "Version History", icon: History, description: "Configuration snapshots & rollbacks" },
    ],
  },
];

export default function AdminSystemSettings() {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>("features");
  const [settings, setSettings] = useState<SystemSettingsState>(DEFAULT_SYSTEM_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await SettingsService.loadAllSettings();
      setSettings(data);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      toast.error("Failed to load settings: " + err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handlePatch = (patch: Partial<SystemSettingsState>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSection = async (sectionTitle?: string) => {
    setSaving(true);
    try {
      const targetTitle = sectionTitle || activeSection.toUpperCase();
      await SettingsService.saveSettings(settings, targetTitle, "Super Admin");
      setHasUnsavedChanges(false);
      toast.success(targetTitle + " updated and synchronized across Supabase & Firestore.");
    } catch (err: any) {
      toast.error("Save failed: " + err.message);
    }
    setSaving(false);
  };

  const handleToggleFeature = async (key: keyof SystemSettingsState) => {
    const newVal = !settings[key];
    const patch = { [key]: newVal };
    handlePatch(patch);
    try {
      await SettingsService.saveSettings(patch, "Feature Toggles", "Super Admin");
      toast.success("Feature state saved");
    } catch (err: any) {
      toast.error("Toggle save error: " + err.message);
    }
  };

  const allNavItems = useMemo(() => {
    return NAV_GROUPS.flatMap((g) => g.items);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allNavItems.filter(
      (item) => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    );
  }, [searchQuery, allNavItems]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4">
        <Loader2 className="w-10 h-10 text-[#39FF14] animate-spin" />
        <span className="text-xs font-orbitron text-gray-400 tracking-wider">
          INITIALIZING ENTERPRISE CONFIGURATION CENTER...
        </span>
      </div>
    );
  }

  const currentItem = allNavItems.find((i) => i.id === activeSection) || allNavItems[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-orbitron font-extrabold text-2xl text-white tracking-wide">
              System Settings & Configuration Center
            </h1>
            <span className="text-[10px] font-orbitron font-bold px-2.5 py-0.5 rounded-full bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30">
              {settings.config_version || "v2.8.4"}
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-1">
            Centrally control platform variables, API gateways, SMTP servers, brand identities, and enterprise RBAC policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSettings}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0E0E0E] border border-white/10 rounded-xl border border-white/10 text-gray-300 hover:text-white text-xs font-semibold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-400" /> Refresh State
          </button>
          <button
            onClick={() => handleSaveSection(currentItem.label)}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#39FF14] hover:bg-[#4FFF2A] text-black font-orbitron font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(57,255,20,0.25)]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Changes
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Global Settings Search: (e.g. SMTP, GCash, VAT, Logos, Maintenance, IP Restrictions, Webhooks)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF14]/40 transition-all"
        />

        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-[#121212] border border-white/10 rounded-2xl p-2 shadow-2xl space-y-1 max-h-72 overflow-y-auto">
            {searchResults.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSection(item.id);
                  setSearchQuery("");
                }}
                className="w-full p-2.5 rounded-xl hover:bg-white/5 text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4 text-[#39FF14]" />
                  <div>
                    <span className="text-xs font-semibold text-white block">{item.label}</span>
                    <span className="text-[10px] text-gray-500">{item.description}</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="lg:hidden flex items-center justify-between p-3.5 bg-[#0E0E0E] border border-white/10 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <currentItem.icon className="w-4 h-4 text-[#39FF14]" />
          <span>{currentItem.label}</span>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-gray-300 flex items-center gap-1"
        >
          {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          Sections
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div
          className={"lg:col-span-4 xl:col-span-3 bg-[#0E0E0E] border border-white/10 rounded-2xl border border-white/5 p-4 space-y-6 " +
            (mobileNavOpen ? "block" : "hidden lg:block")
          }
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.group} className="space-y-1.5">
              <span className="text-[10px] font-orbitron font-bold text-gray-500 uppercase tracking-widest px-2.5 block">
                {group.group}
              </span>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileNavOpen(false);
                      }}
                      className={"w-full p-2.5 rounded-xl text-left flex items-center gap-3 transition-all " +
                        (isActive
                          ? "bg-[#39FF14]/15 border border-[#39FF14]/30 text-white shadow-[0_0_15px_rgba(57,255,20,0.1)]"
                          : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent")
                      }
                    >
                      <Icon className={"w-4 h-4 shrink-0 " + (isActive ? "text-[#39FF14]" : "text-gray-400")} />
                      <div className="overflow-hidden">
                        <span className={"text-xs block truncate " + (isActive ? "font-bold text-white" : "font-medium")}>
                          {item.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-8 xl:col-span-9 bg-[#0E0E0E] border border-white/10 rounded-2xl border border-white/5 p-6 space-y-6 min-h-[600px]">
          {activeSection === "features" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-bold font-orbitron text-white">Platform Feature Toggles</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Instantly toggle customer-facing storefront capabilities without triggering full redeployments.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "chat_enabled", label: "Live Chat Support Widget", desc: "Enable live customer support bubble across public pages", icon: MessageCircle },
                  { key: "reviews_enabled", label: "Customer Product Reviews", desc: "Allow verified buyers to submit e-bike reviews & ratings", icon: Star },
                  { key: "referral_enabled", label: "Referral Bonus Program", desc: "Generate customer referral links and discount bonus codes", icon: Shield },
                  { key: "loyalty_program_enabled", label: "Loyalty Points & Rewards", desc: "Enable customer rewards points and tier progression", icon: Gift },
                  { key: "hide_prices", label: "Hide Prices (Quotation Mode)", desc: "Globally hide e-bike prices and starting-at details across public site", icon: Settings },
                ].map(({ key, label, desc, icon: Icon }) => {
                  const val = !!settings[key as keyof SystemSettingsState];

                  return (
                    <div
                      key={key}
                      className={"bg-[#0E0E0E] border border-white/10 rounded-2xl border p-5 transition-all flex items-start justify-between gap-4 " +
                        (val ? "border-[#39FF14]/20 bg-[#39FF14]/3" : "border-white/5")
                      }
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={"w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 " +
                          (val ? "bg-[#39FF14]/15 border-[#39FF14]/30 text-[#39FF14]" : "bg-white/5 border-white/10 text-gray-400")
                        }>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-xs">{label}</h3>
                          <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleFeature(key as keyof SystemSettingsState)}
                        className="shrink-0 transition-all hover:scale-105"
                      >
                        {val ? (
                          <ToggleRight className="w-9 h-9 text-[#39FF14]" />
                        ) : (
                          <ToggleLeft className="w-9 h-9 text-gray-500" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSection === "branding" && (
            <BrandingSection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("Branding & Logo Assets")}
              saving={saving}
            />
          )}

          {activeSection === "general" && (
            <GeneralSection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("General Platform Settings")}
              saving={saving}
            />
          )}

          {activeSection === "company" && (
            <CompanySection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("Company Information")}
              saving={saving}
            />
          )}

          {activeSection === "contacts" && (
            <ContactsSection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("Department Contacts")}
              saving={saving}
            />
          )}

          {activeSection === "payment" && (
            <PaymentSection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("Payment Gateways")}
              saving={saving}
            />
          )}

          {activeSection === "smtp" && (
            <SmtpSection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("SMTP Configurations")}
              saving={saving}
              onNavigateToTemplates={() => setActiveSection("templates")}
            />
          )}

          {activeSection === "templates" && (
            <EmailTemplatesSection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("Email Templates")}
              saving={saving}
              onNavigateToSmtp={() => setActiveSection("smtp")}
            />
          )}

          {activeSection === "notifications" && (
            <NotificationsSection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("Notification Rules")}
              saving={saving}
            />
          )}

          {activeSection === "platform" && (
            <PlatformSection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("Platform Governance")}
              saving={saving}
            />
          )}

          {activeSection === "roles" && (
            <RolesPermissionsSection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("Roles & Permissions Matrix")}
              saving={saving}
            />
          )}

          {activeSection === "security" && (
            <SecuritySection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("Security Controls")}
              saving={saving}
            />
          )}

          {activeSection === "api" && (
            <ApiIntegrationsSection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("API & Integrations")}
              saving={saving}
            />
          )}

          {activeSection === "storage" && (
            <StorageCdnSection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("Storage & CDN")}
              saving={saving}
            />
          )}

          {activeSection === "database" && (
            <DatabaseBackupSection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("Database & Backups")}
              saving={saving}
            />
          )}

          {activeSection === "seo" && (
            <SeoSection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("SEO & Metadata")}
              saving={saving}
            />
          )}

          {activeSection === "tax" && (
            <LocalizationTaxSection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("Tax & Financial Rules")}
              saving={saving}
            />
          )}

          {activeSection === "maintenance" && (
            <SystemHealthSection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("System Maintenance")}
              saving={saving}
            />
          )}

          {activeSection === "audit" && <AuditLogsSection />}

          {activeSection === "backup_export" && (
            <ImportExportSection
              settings={settings}
              onChange={handlePatch}
              onSave={() => handleSaveSection("Import & Export")}
            />
          )}

          {activeSection === "version" && (
            <VersionHistorySection
              settings={settings}
              onRestore={fetchSettings}
            />
          )}
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#161616] border border-[#39FF14]/40 rounded-2xl px-6 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#39FF14] animate-pulse" />
            <span className="text-xs font-semibold text-white">Unsaved configuration changes pending</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchSettings}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 font-semibold"
            >
              Discard
            </button>
            <button
              onClick={() => handleSaveSection()}
              disabled={saving}
              className="px-4 py-1.5 rounded-xl bg-[#39FF14] text-black text-xs font-bold font-orbitron flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
