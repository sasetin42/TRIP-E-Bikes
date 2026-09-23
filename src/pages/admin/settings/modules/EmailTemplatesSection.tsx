import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle, RefreshCw, Code, Eye, Send, Plus, Trash2, Copy,
  Smartphone, Monitor, FileText, Search, Filter, AlertTriangle,
  Mail, Clock, Check, X, ShieldAlert, ArrowUpRight, RotateCcw,
  Sparkles, ExternalLink, SlidersHorizontal, Info, ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { SettingsService, DEFAULT_SYSTEM_SETTINGS } from "@/services/settingsService";
import { SystemSettingsState, EmailTemplate, EmailLogEntry, EmailTemplateCategory } from "../types";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
  saving: boolean;
  onNavigateToSmtp?: () => void;
}

const TEMPLATE_CATEGORIES: EmailTemplateCategory[] = [
  "Welcome Email",
  "Email Verification",
  "Password Reset",
  "Change Password Confirmation",
  "Account Created",
  "Account Approved",
  "Account Suspended",
  "Login Notification",
  "Security Alert",
  "Quotation & Fleet Proposal",
  "Test Ride & Showroom",
  "Battery & Maintenance",
  "Course Enrollment Confirmation",
  "Course Completion",
  "Payment Confirmation",
  "Invoice / Receipt",
  "General System Notification",
  "Custom Templates",
];

const AVAILABLE_VARIABLES = [
  { tag: "{{user_name}}", label: "Full Customer Name", example: "Juan Dela Cruz" },
  { tag: "{{first_name}}", label: "Given Name", example: "Juan" },
  { tag: "{{last_name}}", label: "Surname / Family Name", example: "Dela Cruz" },
  { tag: "{{user_email}}", label: "Recipient Email Address", example: "juan.delacruz@company.ph" },
  { tag: "{{site_name}}", label: "Platform Brand Name", example: "TRIP Mobility" },
  { tag: "{{site_url}}", label: "Canonical Website URL", example: "https://tripmobility.ph" },
  { tag: "{{company_name}}", label: "Company Legal Entity", example: "TRIP Mobility Philippines Inc." },
  { tag: "{{verification_link}}", label: "Email Activation Link", example: "https://tripmobility.ph/verify?token=xyz" },
  { tag: "{{reset_password_link}}", label: "Password Recovery Link", example: "https://tripmobility.ph/reset?token=abc" },
  { tag: "{{course_name}}", label: "Academy Course Title", example: "TRIP Urban Rider Safety & Telemetry" },
  { tag: "{{invoice_number}}", label: "Generated Invoice Ref", example: "INV-2026-8831" },
  { tag: "{{quote_number}}", label: "Quotation Reference", example: "QUO-99120" },
  { tag: "{{model_name}}", label: "E-Bike Model Name", example: "TRIP Apex Cruiser Pro" },
  { tag: "{{launch_date}}", label: "Official Release Date", example: "October 15, 2026" },
  { tag: "{{preorder_discount}}", label: "Early-Bird Discount", example: "₱12,000" },
  { tag: "{{deposit_amount}}", label: "Refundable Reservation Deposit", example: "₱5,000.00" },
  { tag: "{{specs_range}}", label: "Battery Distance Range", example: "120 km (Dual-Battery)" },
  { tag: "{{specs_speed}}", label: "Top Motor Speed", example: "45 km/h" },
  { tag: "{{reserve_link}}", label: "Pre-Order Direct Link", example: "https://tripmobility.ph/preorder" },
  { tag: "{{amount}}", label: "Payment / Quotation Value", example: "₱145,000.00" },
  { tag: "{{payment_date}}", label: "Transaction Settlement Date", example: "September 19, 2026" },
  { tag: "{{current_date}}", label: "Current System Timestamp", example: "September 19, 2026" },
];

export const EmailTemplatesSection: React.FC<Props> = ({
  settings,
  onChange,
  onSave,
  saving,
  onNavigateToSmtp,
}) => {
  const templates = settings.email_templates || [];

  // Main UI States
  const [activeTab, setActiveTab] = useState<"templates" | "logs">("templates");
  const [selectedId, setSelectedId] = useState<string>(templates[0]?.id || "tpl_welcome");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Editor states
  const [editorTab, setEditorTab] = useState<"html" | "plaintext">("html");
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [showLivePreview, setShowLivePreview] = useState(true);

  // Test Email Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState("qa.tester@tripmobility.ph");
  const [sendingTest, setSendingTest] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Email Logs State
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsSearch, setLogsSearch] = useState("");
  const [logsStatusFilter, setLogsStatusFilter] = useState("all");
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);

  // Active Template
  const currentTemplate = templates.find((t) => t.id === selectedId) || templates[0];

  // SMTP Readiness validation
  const smtpStatus = useMemo(() => {
    return SettingsService.validateSmtpReadiness(settings);
  }, [settings]);

  // Load logs on mount / when switching to logs tab
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await SettingsService.getEmailLogs();
      setLogs(data);
    } catch (err: any) {
      console.error(err);
    }
    setLoadingLogs(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const matchesSearch =
        !searchQuery.trim() ||
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || tpl.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && (tpl.status === "active" || tpl.enabled)) ||
        (statusFilter === "draft" && tpl.status === "draft") ||
        (statusFilter === "inactive" && (tpl.status === "inactive" || !tpl.enabled));
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [templates, searchQuery, categoryFilter, statusFilter]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch =
        !logsSearch.trim() ||
        l.recipient.toLowerCase().includes(logsSearch.toLowerCase()) ||
        l.subject.toLowerCase().includes(logsSearch.toLowerCase()) ||
        l.templateName.toLowerCase().includes(logsSearch.toLowerCase());
      const matchesStatus = logsStatusFilter === "all" || l.status === logsStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [logs, logsSearch, logsStatusFilter]);

  // Template Handlers
  const handleUpdateCurrent = (patch: Partial<EmailTemplate>) => {
    if (!currentTemplate) return;
    const updated = templates.map((t) =>
      t.id === currentTemplate.id ? { ...t, ...patch, lastModified: new Date().toISOString() } : t
    );
    onChange({ email_templates: updated });
  };

  const handleCreateTemplate = () => {
    const newId = "tpl_custom_" + Date.now().toString(36);
    const newTemplate: EmailTemplate = {
      id: newId,
      name: "New Custom Automated Template",
      subject: "Important Notification: {{site_name}}",
      category: "Custom Templates",
      senderName: "TRIP Mobility Notifications",
      replyToEmail: settings.smtp_reply_to || "support@tripmobility.ph",
      status: "draft",
      enabled: false,
      isSystemDefault: false,
      variables: ["{{user_name}}", "{{site_name}}", "{{site_url}}", "{{current_date}}"],
      plainTextBody: "Hello {{user_name}}, welcome to {{site_name}}.",
      htmlBody: `<div style="font-family: sans-serif; background: #0c0c0c; color: #fff; padding: 32px;">
  <div style="max-width: 560px; margin: 0 auto; background: #161616; border: 1px solid #333; border-radius: 12px; padding: 24px;">
    <h3 style="color: #39ff14; margin-top: 0;">New Announcement</h3>
    <p style="color: #ccc; font-size: 14px;">Hello {{user_name}}, we have a customized fleet advisory for your account on {{site_name}}.</p>
    <p style="font-size: 12px; color: #777;">Published on {{current_date}}.</p>
  </div>
</div>`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTemplate, ...templates];
    onChange({ email_templates: updated });
    setSelectedId(newId);
    toast.success("New template draft created!");
  };

  const handleDuplicateTemplate = (tpl: EmailTemplate) => {
    const dupId = "tpl_copy_" + Date.now().toString(36);
    const duplicated: EmailTemplate = {
      ...tpl,
      id: dupId,
      name: `${tpl.name} (Copy)`,
      status: "draft",
      enabled: false,
      isSystemDefault: false,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    const updated = [duplicated, ...templates];
    onChange({ email_templates: updated });
    setSelectedId(dupId);
    toast.success(`Duplicated "${tpl.name}" as draft!`);
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (templates.length <= 1) {
      toast.error("You must keep at least one template.");
      return;
    }
    const target = templates.find((t) => t.id === id);
    if (target?.isSystemDefault) {
      if (!confirm(`"${name}" is a standard core system template. Are you sure you want to delete it?`)) {
        return;
      }
    } else {
      if (!confirm(`Permanently remove template "${name}"?`)) return;
    }
    const updated = templates.filter((t) => t.id !== id);
    onChange({ email_templates: updated });
    if (selectedId === id) {
      setSelectedId(updated[0]?.id || "");
    }
    toast.info("Template deleted.");
  };

  const handleResetToDefault = (id: string) => {
    const factoryTpl = DEFAULT_SYSTEM_SETTINGS.email_templates.find((t) => t.id === id);
    if (!factoryTpl) {
      toast.error("No factory default template found for this item.");
      return;
    }
    if (!confirm(`Reset "${factoryTpl.name}" to its original system factory layout and content? Custom edits will be overwritten.`)) {
      return;
    }
    const updated = templates.map((t) =>
      t.id === id ? { ...factoryTpl, lastModified: new Date().toISOString() } : t
    );
    onChange({ email_templates: updated });
    toast.success(`"${factoryTpl.name}" reset to system factory default!`);
  };

  const handleToggleStatus = (newStatus: "draft" | "active" | "inactive") => {
    if (!currentTemplate) return;
    handleUpdateCurrent({
      status: newStatus,
      enabled: newStatus === "active",
    });
    toast.success(`Template status set to ${newStatus.toUpperCase()}`);
  };

  const insertVariable = (variableTag: string) => {
    if (!currentTemplate) return;
    if (editorTab === "html") {
      handleUpdateCurrent({
        htmlBody: (currentTemplate.htmlBody || "") + ` ${variableTag} `,
      });
    } else {
      handleUpdateCurrent({
        plainTextBody: (currentTemplate.plainTextBody || "") + ` ${variableTag} `,
      });
    }
    toast.info(`Inserted variable tag ${variableTag}`);
  };

  // Interpolated Preview Generator
  const renderedPreview = useMemo(() => {
    if (!currentTemplate) return { subject: "", html: "", plain: "" };
    const sampleVars: Record<string, string> = {
      "{{user_name}}": "Carlos Mendoza",
      "{{first_name}}": "Carlos",
      "{{last_name}}": "Mendoza",
      "{{user_email}}": "carlos.mendoza@enterpriseph.com",
      "{{site_name}}": settings.site_title || "TRIP Mobility",
      "{{site_url}}": settings.website_url || "https://tripmobility.ph",
      "{{company_name}}": settings.company_name || "TRIP Mobility Philippines Inc.",
      "{{verification_link}}": `${settings.website_url || "https://tripmobility.ph"}/verify-email?token=vfy_demo9921`,
      "{{reset_password_link}}": `${settings.website_url || "https://tripmobility.ph"}/reset-password?token=pwd_demo4412`,
      "{{course_name}}": "TRIP Urban Rider Safety & Telemetry Certification",
      "{{invoice_number}}": "INV-2026-9042",
      "{{quote_number}}": "QUO-88210",
      "{{model_name}}": "TRIP Apex Cruiser Pro (2027 Edition)",
      "{{launch_date}}": "October 15, 2026",
      "{{preorder_discount}}": "₱12,000",
      "{{deposit_amount}}": "₱5,000.00",
      "{{specs_range}}": "120 km (Dual BMS)",
      "{{specs_speed}}": "45 km/h",
      "{{reserve_link}}": `${settings.website_url || "https://tripmobility.ph"}/products/apex-cruiser-pro`,
      "{{amount}}": "₱145,000.00",
      "{{payment_date}}": "September 19, 2026",
      "{{current_date}}": new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    };

    return {
      subject: SettingsService.interpolateVariables(currentTemplate.subject, sampleVars),
      html: SettingsService.interpolateVariables(currentTemplate.htmlBody, sampleVars),
      plain: SettingsService.interpolateVariables(currentTemplate.plainTextBody || "", sampleVars),
    };
  }, [currentTemplate, settings]);

  // Trigger Send Test Email
  const handleSendTestEmail = async () => {
    if (!currentTemplate) return;
    if (!testRecipient || !testRecipient.includes("@")) {
      toast.error("Please provide a valid recipient email address.");
      return;
    }

    setSendingTest(true);
    setLastTestResult(null);

    try {
      const res = await SettingsService.sendTemplatedEmail({
        template: currentTemplate,
        recipient: testRecipient,
        settings,
        customSubject: `[TEST] ${currentTemplate.subject}`,
      });

      setLastTestResult(res);
      if (res.success) {
        toast.success(res.message);
        fetchLogs(); // reload logs
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error("Test dispatch error: " + err.message);
      setLastTestResult({ success: false, message: err.message });
    }
    setSendingTest(false);
  };

  // Retry Failed Log
  const handleRetryLog = async (logId: string) => {
    setRetryingLogId(logId);
    try {
      const res = await SettingsService.retryEmailLog(logId, settings);
      if (res.success) {
        toast.success(res.message);
        await fetchLogs();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error("Retry failed: " + err.message);
    }
    setRetryingLogId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold font-orbitron text-white">Email Template Management</h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 font-semibold uppercase">
              Live SMTP Sync
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Build, test, and synchronize automated transactional email templates directly through active SMTP configurations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Top Tabs Switcher: Templates vs Logs */}
          <div className="flex bg-[#141414] border border-white/10 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={"px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 " +
                (activeTab === "templates" ? "bg-[#39FF14] text-black" : "text-gray-400 hover:text-white")
              }
            >
              <FileText className="w-3.5 h-3.5" />
              Templates ({templates.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("logs")}
              className={"px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 " +
                (activeTab === "logs" ? "bg-[#39FF14] text-black" : "text-gray-400 hover:text-white")
              }
            >
              <Clock className="w-3.5 h-3.5" />
              Email Logs & Tracking
            </button>
          </div>

          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-[#39FF14] text-black font-orbitron font-bold text-xs hover:bg-[#4FFF2A] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            Save All Changes
          </button>
        </div>
      </div>

      {/* SMTP Connection & Health Ribbon */}
      <div className={"rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all " +
        (smtpStatus.valid
          ? "bg-[#101010] border-[#39FF14]/30"
          : "bg-red-500/10 border-red-500/40")
      }>
        <div className="flex items-center gap-3">
          <div className={"w-10 h-10 rounded-xl flex items-center justify-center shrink-0 " +
            (smtpStatus.valid
              ? "bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#39FF14]"
              : "bg-red-500/20 text-red-400")
          }>
            {smtpStatus.valid ? <Mail className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-orbitron text-white">
                Active Outbound Dispatcher: {settings.smtp_host || "Unconfigured SMTP Server"}
              </span>
              <span className={"text-[10px] px-2 py-0.5 rounded-full font-bold uppercase " +
                (smtpStatus.valid
                  ? "bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30"
                  : "bg-red-500 text-black")
              }>
                {smtpStatus.valid ? `TLS PORT ${settings.smtp_port}` : "Incomplete Setup"}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Sender Address: <code className="text-white font-mono">{settings.smtp_from_name || "TRIP Mobility"} &lt;{settings.smtp_from_email || "not configured"}&gt;</code>
              {!smtpStatus.valid && ` — Warning: ${smtpStatus.error}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onNavigateToSmtp && (
            <button
              type="button"
              onClick={onNavigateToSmtp}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 hover:text-white transition-all flex items-center gap-1.5"
            >
              Configure SMTP Host
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setTestModalOpen(true)}
            disabled={!currentTemplate}
            className="px-3.5 py-1.5 rounded-xl bg-[#39FF14]/10 hover:bg-[#39FF14]/20 border border-[#39FF14]/40 text-[#39FF14] text-xs font-bold font-orbitron transition-all flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            Send Test Email
          </button>
        </div>
      </div>

      {/* VIEW 1: EMAIL TEMPLATES WORKBENCH */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Template Navigator & Filters (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Search & Actions */}
            <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-orbitron uppercase tracking-wider">
                  Template Library ({filteredTemplates.length})
                </span>
                <button
                  type="button"
                  onClick={handleCreateTemplate}
                  className="px-2.5 py-1 rounded-lg bg-[#39FF14] text-black text-[11px] font-bold font-orbitron hover:bg-[#4FFF2A] transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> New
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates, subjects, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF14]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-[#141414] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-200 focus:outline-none focus:border-[#39FF14]/40"
                  >
                    <option value="all">All Categories</option>
                    {TEMPLATE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-[#141414] border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-gray-200 focus:outline-none focus:border-[#39FF14]/40"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="draft">Drafts Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Template List Cards */}
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredTemplates.length === 0 ? (
                <div className="p-8 text-center bg-[#0E0E0E] border border-white/10 rounded-2xl text-gray-500 text-xs">
                  No email templates match your filters.
                </div>
              ) : (
                filteredTemplates.map((tpl) => {
                  const isSelected = selectedId === tpl.id;
                  const isActive = tpl.status === "active" || tpl.enabled;
                  const isDraft = tpl.status === "draft";

                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedId(tpl.id)}
                      className={"w-full p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group " +
                        (isSelected
                          ? "bg-[#141414] border-[#39FF14]/40 shadow-[0_0_15px_rgba(57,255,20,0.08)]"
                          : "bg-[#0E0E0E] border-white/5 hover:border-white/15 text-gray-300")
                      }
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#39FF14]" />
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={"text-xs font-semibold " + (isSelected ? "text-white" : "text-gray-200")}>
                              {tpl.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400 block mt-0.5">{tpl.category}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isActive && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 font-bold uppercase">
                              Active
                            </span>
                          )}
                          {isDraft && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold uppercase">
                              Draft
                            </span>
                          )}
                          {!isActive && !isDraft && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/10 font-bold uppercase">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-400 truncate mt-2 font-mono">
                        {tpl.subject}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Template Editor & Live Preview (8 Cols) */}
          {currentTemplate && (
            <div className="lg:col-span-8 bg-[#0E0E0E] border border-white/10 rounded-2xl p-6 space-y-6">
              {/* Template Title & Status Control Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-orbitron">{currentTemplate.name}</h3>
                    {currentTemplate.isSystemDefault && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/10">
                        System Core
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono">ID: {currentTemplate.id}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-1.5 bg-[#141414] border border-white/10 rounded-xl p-1">
                    {(["draft", "active", "inactive"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleToggleStatus(st)}
                        className={"px-2.5 py-1 rounded-lg text-[10px] font-bold font-orbitron uppercase transition-all " +
                          (currentTemplate.status === st
                            ? (st === "active"
                                ? "bg-[#39FF14] text-black"
                                : st === "draft"
                                ? "bg-amber-400 text-black"
                                : "bg-white/20 text-white")
                            : "text-gray-400 hover:text-white")
                        }
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {DEFAULT_SYSTEM_SETTINGS.email_templates.some((t) => t.id === currentTemplate.id) && (
                    <button
                      type="button"
                      onClick={() => handleResetToDefault(currentTemplate.id)}
                      title="Reset to Factory System Default"
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-amber-300 text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">Factory Reset</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDuplicateTemplate(currentTemplate)}
                    title="Duplicate Template"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(currentTemplate.id, currentTemplate.name)}
                    title="Delete Template"
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Template Metadata & Header Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-300">Template Display Name</label>
                  <input
                    type="text"
                    value={currentTemplate.name}
                    onChange={(e) => handleUpdateCurrent({ name: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300">Category</label>
                  <select
                    value={currentTemplate.category}
                    onChange={(e) => handleUpdateCurrent({ category: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
                  >
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 md:col-span-3">
                  <label className="text-[11px] font-semibold text-gray-300">Email Subject Line (Supports Merge Tags)</label>
                  <input
                    type="text"
                    value={currentTemplate.subject}
                    onChange={(e) => handleUpdateCurrent({ subject: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 font-mono"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-semibold text-gray-300">Custom Sender Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="TRIP Mobility Notifications"
                    value={currentTemplate.senderName || ""}
                    onChange={(e) => handleUpdateCurrent({ senderName: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-gray-300">Custom Reply-To Email</label>
                  <input
                    type="email"
                    placeholder="support@tripmobility.ph"
                    value={currentTemplate.replyToEmail || ""}
                    onChange={(e) => handleUpdateCurrent({ replyToEmail: e.target.value })}
                    className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
                  />
                </div>
              </div>

              {/* Dynamic Variables Palette */}
              <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-300">
                    <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
                    <span>Dynamic Merge Tags (Click to Insert)</span>
                  </div>
                  <span className="text-[10px] text-gray-500">Inserts at active content position</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {AVAILABLE_VARIABLES.map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => insertVariable(v.tag)}
                      title={`Example value: ${v.example} (${v.label})`}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-[#39FF14]/20 hover:text-[#39FF14] border border-white/10 text-[10px] font-mono text-gray-300 transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-[#39FF14]" />
                      {v.tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dual Editor & Preview Switcher */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-2">
                  {/* Editor Mode */}
                  <div className="flex items-center gap-2">
                    <div className="flex bg-[#141414] border border-white/10 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => setEditorTab("html")}
                        className={"px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all " +
                          (editorTab === "html" ? "bg-white/15 text-white" : "text-gray-400 hover:text-white")
                        }
                      >
                        <Code className="w-3.5 h-3.5 text-[#39FF14]" /> HTML Source
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorTab("plaintext")}
                        className={"px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all " +
                          (editorTab === "plaintext" ? "bg-white/15 text-white" : "text-gray-400 hover:text-white")
                        }
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" /> Plain Text Fallback
                      </button>
                    </div>
                  </div>

                  {/* Preview Toggle & Viewport */}
                  <div className="flex items-center gap-2">
                    <div className="flex bg-[#141414] border border-white/10 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => setPreviewViewport("desktop")}
                        className={"p-1.5 rounded-lg transition-all " +
                          (previewViewport === "desktop" ? "bg-white/15 text-white" : "text-gray-500 hover:text-white")
                        }
                        title="Desktop Preview"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewViewport("mobile")}
                        className={"p-1.5 rounded-lg transition-all " +
                          (previewViewport === "mobile" ? "bg-white/15 text-white" : "text-gray-500 hover:text-white")
                        }
                        title="Mobile Preview (375px)"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowLivePreview(!showLivePreview)}
                      className={"px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all " +
                        (showLivePreview
                          ? "border-[#39FF14]/40 bg-[#39FF14]/15 text-[#39FF14]"
                          : "border-white/10 bg-white/5 text-gray-400")
                      }
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {showLivePreview ? "Live Preview Active" : "Show Preview"}
                    </button>
                  </div>
                </div>

                {/* Editor Area */}
                {editorTab === "html" ? (
                  <div className="space-y-1.5">
                    <textarea
                      rows={12}
                      value={currentTemplate.htmlBody}
                      onChange={(e) => handleUpdateCurrent({ htmlBody: e.target.value })}
                      placeholder="Insert responsive HTML email markup..."
                      className="w-full bg-[#121212] border border-white/10 rounded-2xl p-4 text-xs text-gray-200 font-mono focus:outline-none focus:border-[#39FF14]/40 leading-relaxed"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <textarea
                      rows={10}
                      value={currentTemplate.plainTextBody || ""}
                      onChange={(e) => handleUpdateCurrent({ plainTextBody: e.target.value })}
                      placeholder="Enter plain text version for SMS/legacy email readers..."
                      className="w-full bg-[#121212] border border-white/10 rounded-2xl p-4 text-xs text-gray-200 font-mono focus:outline-none focus:border-[#39FF14]/40 leading-relaxed"
                    />
                  </div>
                )}

                {/* Live Responsive Render Frame */}
                {showLivePreview && (
                  <div className="space-y-2 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="font-semibold text-white font-orbitron">
                        Live Rendered Preview ({previewViewport.toUpperCase()})
                      </span>
                      <span className="text-[10px] text-gray-500">Variables substituted with sample data</span>
                    </div>

                    <div className="bg-[#050505] border border-white/10 rounded-2xl p-4 flex justify-center">
                      <div
                        className={"bg-white rounded-xl shadow-2xl overflow-hidden text-black transition-all " +
                          (previewViewport === "mobile" ? "w-[375px]" : "w-full max-w-[650px]")
                        }
                      >
                        {/* Mock Email Header */}
                        <div className="bg-gray-100 p-3 border-b border-gray-200 text-xs">
                          <div className="text-gray-600 text-[11px]">
                            <strong>From:</strong> {currentTemplate.senderName || settings.smtp_from_name || "TRIP Mobility"} &lt;{settings.smtp_from_email || "noreply@tripmobility.ph"}&gt;
                          </div>
                          <div className="text-gray-800 font-bold mt-1 text-sm">
                            {renderedPreview.subject}
                          </div>
                        </div>

                        {/* Email HTML Body */}
                        {editorTab === "html" ? (
                          <div
                            className="p-1 overflow-x-auto text-xs"
                            dangerouslySetInnerHTML={{ __html: renderedPreview.html }}
                          />
                        ) : (
                          <div className="p-6 whitespace-pre-wrap font-sans text-xs text-gray-800">
                            {renderedPreview.plain || renderedPreview.html}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: EMAIL LOGS & AUDIT TRAIL */}
      {activeTab === "logs" && (
        <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white font-orbitron">Transactional Email Audit Logs</h3>
              <p className="text-xs text-gray-400 mt-1">
                Real-time delivery receipts, SMTP latency, recipient records, and one-click retry triggers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchLogs}
                disabled={loadingLogs}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className={"w-3.5 h-3.5 " + (loadingLogs ? "animate-spin" : "")} />
                Refresh Logs
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipient address, subject, or template name..."
                value={logsSearch}
                onChange={(e) => setLogsSearch(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF14]/40"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={logsStatusFilter}
                onChange={(e) => setLogsStatusFilter(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
              >
                <option value="all">All Delivery Statuses</option>
                <option value="delivered">Delivered Only</option>
                <option value="failed">Failed / Bounced Only</option>
                <option value="pending">Pending Dispatch</option>
              </select>
            </div>
          </div>

          {/* Logs Table */}
          <div className="border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#141414] text-gray-400 font-orbitron text-[10px] uppercase tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Subject & Template</th>
                    <th className="py-3 px-4">SMTP Dispatcher</th>
                    <th className="py-3 px-4">Sent Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No transactional logs recorded matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const isFailed = log.status === "failed";
                      const isRetrying = retryingLogId === log.id;

                      return (
                        <tr key={log.id} className="hover:bg-white/2 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-white block">{log.recipient}</span>
                            <span className="text-[10px] text-gray-500 font-mono">{log.id}</span>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <span className="font-medium text-gray-200 block truncate">{log.subject}</span>
                            <span className="text-[10px] text-[#39FF14] block mt-0.5">{log.templateName}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-[11px] text-gray-400 block">{log.smtpHost}</span>
                            <span className="text-[10px] text-gray-500 truncate block">{log.senderEmail}</span>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-gray-400 font-mono text-[11px]">
                            {log.sentAt}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            {log.status === "delivered" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30">
                                <Check className="w-3 h-3" /> Delivered
                              </span>
                            )}
                            {isFailed && (
                              <div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                                  <X className="w-3 h-3" /> Failed
                                </span>
                                {log.errorDetails && (
                                  <span className="text-[10px] text-red-400/80 block mt-1 truncate max-w-xs" title={log.errorDetails}>
                                    {log.errorDetails}
                                  </span>
                                )}
                              </div>
                            )}
                            {log.status === "pending" && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            {isFailed ? (
                              <button
                                type="button"
                                onClick={() => handleRetryLog(log.id)}
                                disabled={isRetrying}
                                className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-[10px] font-semibold inline-flex items-center gap-1 transition-all disabled:opacity-50"
                              >
                                {isRetrying ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                                Retry
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-500 font-mono">Verified</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TEST SEND EMAIL MODAL */}
      {testModalOpen && currentTemplate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#39FF14]/15 border border-[#39FF14]/30 flex items-center justify-center text-[#39FF14]">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white font-orbitron">Dispatch Test Email</h4>
                  <p className="text-[11px] text-gray-400">Sends actual rendered template through active SMTP gateway</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs">
                <div className="text-gray-400">
                  <strong>Selected Template:</strong> <span className="text-white">{currentTemplate.name}</span>
                </div>
                <div className="text-gray-400">
                  <strong>SMTP Server:</strong> <span className="text-[#39FF14] font-mono">{settings.smtp_host}:{settings.smtp_port}</span>
                </div>
                <div className="text-gray-400">
                  <strong>From:</strong> <span className="text-white">{currentTemplate.senderName || settings.smtp_from_name} &lt;{settings.smtp_from_email}&gt;</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Recipient Email Address</label>
                <input
                  type="email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="admin@tripmobility.ph"
                  className="w-full bg-[#161616] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
                />
              </div>

              {lastTestResult && (
                <div className={"p-3 rounded-xl border text-xs " +
                  (lastTestResult.success ? "bg-[#39FF14]/10 border-[#39FF14]/30 text-[#39FF14]" : "bg-red-500/10 border-red-500/30 text-red-400")
                }>
                  <div className="font-semibold">{lastTestResult.success ? "✓ Delivery Successful" : "✗ Delivery Failed"}</div>
                  <p className="text-[11px] mt-0.5 opacity-90">{lastTestResult.message}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={sendingTest}
                className="px-5 py-2 rounded-xl bg-[#39FF14] hover:bg-[#4FFF2A] text-black font-orbitron font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {sendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {sendingTest ? "Transmitting..." : "Send Test Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
