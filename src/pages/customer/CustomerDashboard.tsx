import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Zap, FileText, Clock, CheckCircle, LogOut, ChevronRight,
  Plus, Eye, Package, Phone, Mail, RefreshCw,
  TrendingUp, Loader2, X, AlertCircle, User, Calendar,
  Star, Shield, BarChart3, ArrowRight, Gift, GitCompare,
  CheckSquare, Download
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { PRODUCTS } from "@/constants/products";
import LoyaltyDashboard from "@/components/features/LoyaltyDashboard";
import NotificationBell from "@/components/features/NotificationBell";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import logoMain from "@/assets/logo-main.png";

interface Quotation {
  id: string;
  product_name: string;
  quantity: number;
  use_type: string;
  budget: string | null;
  contact_method: string;
  notes: string | null;
  status: string;
  assigned_sales: string | null;
  sales_notes: string | null;
  estimated_price: number | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType; dot: string }> = {
  pending:       { label: "Pending Review",  color: "text-gray-400",    bg: "bg-gray-500/20",    icon: Clock,        dot: "bg-gray-400" },
  reviewing:     { label: "Being Reviewed",  color: "text-blue-400",    bg: "bg-blue-500/20",    icon: Eye,          dot: "bg-blue-400" },
  proposal_sent: { label: "Proposal Ready",  color: "text-yellow-400",  bg: "bg-yellow-500/20",  icon: FileText,     dot: "bg-yellow-400" },
  negotiating:   { label: "In Negotiation",  color: "text-orange-400",  bg: "bg-orange-500/20",  icon: TrendingUp,   dot: "bg-orange-400" },
  approved:      { label: "Approved!",       color: "text-[#39FF14]",   bg: "bg-[#39FF14]/20",   icon: CheckCircle,  dot: "bg-[#39FF14]" },
  completed:     { label: "Completed",       color: "text-emerald-400", bg: "bg-emerald-500/20", icon: CheckCircle,  dot: "bg-emerald-400" },
  cancelled:     { label: "Cancelled",       color: "text-red-400",     bg: "bg-red-500/20",     icon: X,            dot: "bg-red-400" },
};

const ACCOUNT_BENEFITS = [
  { icon: FileText,  title: "Track Your Quotes",       desc: "See real-time status of every quotation request" },
  { icon: Star,      title: "Official Proposals",      desc: "Receive formal price proposals directly in your dashboard" },
  { icon: Shield,    title: "Priority Service",         desc: "Faster response times and a dedicated sales contact" },
  { icon: Gift,      title: "Loyalty Rewards",          desc: "Earn points on every approved quote, redeem for discounts" },
];

const PORTAL_TABS = [
  { id: "quotes", label: "My Quotes", icon: FileText },
  { id: "loyalty", label: "Rewards & Points", icon: Gift },
];

export default function CustomerDashboard() {
  const { customer, logout } = useCustomerAuth();
  const { settings } = useSystemSettings();
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Quotation | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [memberSince, setMemberSince] = useState<string>("");
  const [activeTab, setActiveTab] = useState("quotes");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const fetchQuotations = useCallback(async (silent = false) => {
    if (!customer) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    const { data, error } = await apiClient.get(`/quotations.php?email=${customer.email}`);
    if (error) toast.error("Failed to load quotations");
    else {
      const mapped = (data && data.quotations || []).map((q: any) => ({
        ...q,
        id: String(q.id),
        estimated_price: q.quoted_price !== null ? Number(q.quoted_price) : null
      }));
      setQuotations(mapped);
    }
    if (!silent) setLoading(false);
    else setRefreshing(false);
  }, [customer]);

  useEffect(() => {
    const fetchUserMeta = async () => {
      const { data, error } = await apiClient.get("/auth.php");
      if (!error && data && data.user && data.user.created_at) {
        setMemberSince(new Date(data.user.created_at).toLocaleDateString("en-PH", { month: "long", year: "numeric" }));
      }
    };
    fetchUserMeta();
  }, []);

  useEffect(() => {
    if (!customer) { navigate("/"); return; }
    fetchQuotations();
  }, [customer, fetchQuotations, navigate]);

  useEffect(() => {
    const interval = setInterval(() => fetchQuotations(true), 30000);
    return () => clearInterval(interval);
  }, [fetchQuotations]);

  const downloadQuotationPDF = (q: Quotation) => {
    const product = PRODUCTS.find(p => p.name === q.product_name);
    const specs = product ? Object.entries(product.specs).map(([k, v]) => `<tr><td style="padding:8px 12px;color:#9CA3AF;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05)">${k.replace(/([A-Z])/g, ' $1').trim()}</td><td style="padding:8px 12px;color:#F5F5F5;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05)">${v}</td></tr>`).join('') : '';
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>TRIP Quotation #${q.id.slice(0,8).toUpperCase()}</title><style>body{background:#0A0A0A;color:#F5F5F5;font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:40px}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head><body><div style="text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,0.1)"><div style="display:inline-block;background:rgba(57,255,20,0.08);border:1px solid rgba(57,255,20,0.25);border-radius:12px;padding:10px 24px;margin-bottom:16px"><span style="color:#39FF14;font-size:22px;font-weight:900;letter-spacing:4px">⚡ TRIP MOBILITY</span></div><h1 style="color:#FFF;font-size:20px;margin:8px 0 4px">Quotation Document</h1><p style="color:#6B7280;font-size:13px;margin:0">Ref: #${q.id.slice(0,8).toUpperCase()} · Generated ${new Date().toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'})}</p></div>${q.estimated_price ? `<div style="background:#111;border:1px solid rgba(57,255,20,0.2);border-radius:16px;padding:24px;margin-bottom:20px;text-align:center"><p style="color:#9CA3AF;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px">Estimated Total</p><p style="color:#39FF14;font-size:40px;font-weight:900;margin:0;font-family:monospace">₱${q.estimated_price.toLocaleString()}</p>${q.valid_until ? `<p style="color:#6B7280;font-size:12px;margin:8px 0 0">Valid until ${q.valid_until}</p>` : ''}</div>` : ''}<div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;margin-bottom:20px"><h2 style="color:#39FF14;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px">Request Details</h2><table style="width:100%;border-collapse:collapse">${[['Product',q.product_name],['Quantity',q.quantity+' unit'+(q.quantity>1?'s':'')],['Use Type',q.use_type],['Budget',q.budget||'Not specified'],['Contact via',q.contact_method],['Assigned Sales',q.assigned_sales||'Being assigned'],['Status',q.status.replace(/_/g,' ')],['Submitted',new Date(q.created_at).toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'})]].map(([l,v])=>'<tr><td style="padding:8px 12px;color:#9CA3AF;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05)">'+l+'</td><td style="padding:8px 12px;color:#F5F5F5;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.05)">'+v+'</td></tr>').join('')}</table></div>${specs ? '<div style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;margin-bottom:20px"><h2 style="color:#39FF14;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 16px">Product Specifications</h2><table style="width:100%;border-collapse:collapse">'+specs+'</table></div>' : ''}${q.sales_notes ? '<div style="background:#111;border:1px solid rgba(57,255,20,0.15);border-radius:16px;padding:20px 24px;margin-bottom:20px"><h2 style="color:#39FF14;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px">Sales Team Notes</h2><p style="color:#D1D5DB;font-size:14px;line-height:1.7;font-style:italic">&ldquo;'+q.sales_notes+'&rdquo;</p></div>' : ''}<div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08)"><p style="color:#6B7280;font-size:12px">TRIP Mobility · tripmobility.ph · +63 2 8123 4567</p></div></body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500); }
  };

  const handleLogout = async () => {
    logout();
    navigate("/");
    toast.success("Signed out successfully");
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 2) { toast.error("Select maximum 2 quotes to compare"); return prev; }
      return [...prev, id];
    });
  };

  const compareQuotes = quotations.filter(q => compareIds.includes(q.id));

  const stats = {
    total: quotations.length,
    pending: quotations.filter(q => ["pending", "reviewing"].includes(q.status)).length,
    proposals: quotations.filter(q => q.status === "proposal_sent").length,
    approved: quotations.filter(q => q.status === "approved").length,
  };

  return (
    <div className="min-h-screen bg-[#F9F9FB] text-black">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5 h-16 flex items-center px-6 shadow-sm">
        <Link to="/" className="flex items-center gap-3 group mr-auto">
          {settings?.brand_logo_main || logoMain ? (
            <img
              src={settings?.brand_logo_main || logoMain}
              alt={settings?.site_title || "TRIP Mobility"}
              className="h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <>
              <div className="relative w-8 h-8 flex items-center justify-center border border-black/20 rounded-[2px] transition-colors group-hover:border-black">
                <Zap className="w-4 h-4 text-black" />
              </div>
              <div>
                <span className="font-sans font-bold text-sm text-black tracking-tight uppercase">
                  {settings?.site_title?.split(" ")[0] || "TRIP"}
                </span>
                <span className="block text-[8px] text-[#707070] tracking-[0.25em] font-medium -mt-1 uppercase">
                  CUSTOMER PORTAL
                </span>
              </div>
            </>
          )}
        </Link>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button onClick={() => fetchQuotations(true)} disabled={refreshing} className="p-2 rounded-lg border border-black/5 text-gray-500 hover:text-black hover:bg-black/5 transition-all">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <div className="w-9 h-9 rounded-full bg-black/5 border border-black/10 flex items-center justify-center font-bold text-black text-sm">
            {(customer?.username || "U")[0].toUpperCase()}
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" /><span className="hidden sm:block">Sign Out</span>
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* ── Profile Header ── */}
        <div className="bg-white rounded-2xl border border-black/5 p-6 mb-8 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/3 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/25 flex items-center justify-center font-sans font-bold text-2xl text-black">
                {(customer?.username || "U")[0].toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#39FF14] border-2 border-white flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-black" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#28b80e] tracking-[0.25em] uppercase font-semibold mb-0.5">Verified Customer</p>
              <h1 className="font-sans font-bold text-2xl text-black truncate">{customer?.username || "Customer"}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-xs text-gray-600"><Mail className="w-3.5 h-3.5 text-gray-400" />{customer?.email}</span>
                {memberSince && <span className="flex items-center gap-1.5 text-xs text-gray-600"><Calendar className="w-3.5 h-3.5 text-gray-400" />Member since {memberSince}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {stats.total > 0 && (
                <div className="text-center px-4 py-3 rounded-xl bg-gray-50 border border-black/5">
                  <p className="font-sans font-bold text-2xl text-black">{stats.total}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total Quotes</p>
                </div>
              )}
              <Link to="/products" className="btn-primary text-sm flex items-center gap-2 whitespace-nowrap">
                <Plus className="w-4 h-4" />New Quote
              </Link>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 border-b border-black/5 mb-8">
          {PORTAL_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${activeTab === tab.id ? "border-black text-black" : "border-transparent text-gray-400 hover:text-gray-600"}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {/* ── Loyalty Tab ── */}
        {activeTab === "loyalty" && <LoyaltyDashboard />}

        {/* ── Quotes Tab ── */}
        {activeTab === "quotes" && (
          <>
            {/* Stats */}
            {stats.total > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Quotes", value: stats.total,    color: "text-black" },
                  { label: "Under Review", value: stats.pending,  color: "text-blue-600" },
                  { label: "Proposals",    value: stats.proposals,color: "text-yellow-600" },
                  { label: "Approved",     value: stats.approved, color: "text-[#28b80e]" },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-xl p-4 border border-black/5 shadow-sm text-center">
                    <p className={`font-sans font-bold text-3xl ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Compare Bar */}
            {compareIds.length > 0 && (
              <div className="flex items-center gap-4 mb-5 px-5 py-3 bg-blue-50 border border-blue-200 rounded-xl">
                <GitCompare className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-black font-semibold">{compareIds.length} quote{compareIds.length > 1 ? "s" : ""} selected for comparison</p>
                <div className="flex items-center gap-2 ml-auto">
                  {compareIds.length === 2 && (
                    <button onClick={() => setShowCompare(true)} className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-black/80 transition-all">
                      <GitCompare className="w-3.5 h-3.5" />Compare Now
                    </button>
                  )}
                  <button onClick={() => setCompareIds([])} className="p-1.5 text-gray-500 hover:text-black transition-colors"><X className="w-4 h-4" /></button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-[50px] gap-3">
                <Loader2 className="w-6 h-6 text-[#39FF14] animate-spin" />
                <p className="text-gray-500 text-sm">Loading your quotations...</p>
              </div>
            ) : quotations.length === 0 ? (
              /* ── Rich Empty State ── */
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#39FF14] to-[#00FFFF]" />
                <div className="p-10 text-center">
                  <div className="relative inline-flex items-center justify-center mb-8">
                    <div className="absolute w-36 h-36 rounded-full border border-[#39FF14]/5 animate-ping" style={{ animationDuration: "3s" }} />
                    <div className="absolute w-28 h-28 rounded-full border border-[#39FF14]/10 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
                    <div className="relative w-24 h-24 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center">
                      <Zap className="w-10 h-10 text-black" fill="currentColor" />
                    </div>
                  </div>
                  <h3 className="font-sans font-bold text-2xl text-black mb-3">Your Journey Starts Here</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-8 max-w-sm mx-auto">Browse our premium e-bike collection and get a personalized proposal — completely free.</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
                    <Link to="/products" className="btn-primary flex items-center justify-center gap-2"><Package className="w-4 h-4" />Explore E-Bike Models</Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {ACCOUNT_BENEFITS.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-black/5 text-left hover:border-[#39FF14]/30 transition-all group">
                        <div className="w-9 h-9 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center shrink-0">
                          <benefit.icon className="w-4 h-4 text-black" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-black mb-0.5">{benefit.title}</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{benefit.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className={selected ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : ""}>
                <div className={`${selected ? "lg:col-span-2" : ""} space-y-3`}>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold">Your Quotation Requests</p>
                    {quotations.length >= 2 && compareIds.length === 0 && (
                      <p className="text-xs text-gray-500">Tip: Click <GitCompare className="w-3 h-3 inline mx-1" /> to compare quotes</p>
                    )}
                  </div>
                  {quotations.map(q => {
                    const cfg = STATUS_CONFIG[q.status] || STATUS_CONFIG.pending;
                    const isCompareSelected = compareIds.includes(q.id);
                    return (
                      <div key={q.id}
                        onClick={() => setSelected(selected?.id === q.id ? null : q)}
                        className={`bg-white rounded-xl border p-5 cursor-pointer transition-all shadow-sm ${selected?.id === q.id ? "border-[#39FF14] bg-[#39FF14]/5" : isCompareSelected ? "border-blue-400 bg-blue-50/50" : "border-black/5 hover:border-black/15"}`}>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-50 border border-black/10">
                            <img src={PRODUCTS.find(p => p.name === q.product_name)?.image || ""} alt={q.product_name} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div>
                                <p className="font-semibold text-black text-sm">{q.product_name}</p>
                                <p className="text-xs text-gray-600 mt-0.5">{q.quantity} unit{q.quantity > 1 ? "s" : ""} · {q.use_type} · {q.budget || "Budget TBD"}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={e => { e.stopPropagation(); toggleCompare(q.id); }}
                                  className={`p-1.5 rounded-lg border transition-all ${isCompareSelected ? "border-blue-400 bg-blue-100 text-blue-600" : "border-black/10 text-gray-400 hover:text-black hover:bg-black/5"}`}
                                  title="Add to comparison">
                                  <GitCompare className="w-3.5 h-3.5" />
                                </button>
                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color} shrink-0`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-3">
                              {q.estimated_price && (
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs text-gray-500">Estimate:</p>
                                  <p className="text-sm font-bold text-black">₱{q.estimated_price.toLocaleString()}</p>
                                </div>
                              )}
                              <p className="text-xs text-gray-500 ml-auto">{new Date(q.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Detail Panel */}
                {selected && (
                  <div className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden h-fit sticky top-24">
                    <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between bg-gray-50/50">
                      <p className="font-semibold text-black text-sm">Quotation Details</p>
                      <button onClick={() => setSelected(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-black border border-black/10 transition-all"><X className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="p-5 space-y-4">
                      {(() => {
                        const cfg = STATUS_CONFIG[selected.status] || STATUS_CONFIG.pending;
                        const StatusIcon = cfg.icon;
                        return (
                          <div className={`rounded-xl border p-4 ${cfg.bg} border-current/25`}>
                            <div className="flex items-center gap-3">
                              <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
                              <div>
                                <p className={`font-bold text-sm ${cfg.color}`}>{cfg.label}</p>
                                <p className="text-xs text-gray-500">Updated {new Date(selected.updated_at).toLocaleDateString("en-PH")}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      {selected.estimated_price && (
                        <div className="rounded-xl border border-[#39FF14]/30 bg-[#39FF14]/5 p-4 text-center">
                           <p className="text-xs text-gray-500 mb-1">Estimated Total</p>
                           <p className="font-sans font-black text-3xl text-black">₱{selected.estimated_price.toLocaleString()}</p>
                           {selected.valid_until && <p className="text-xs text-gray-500 mt-1">Valid until {selected.valid_until}</p>}
                        </div>
                      )}
                      <div className="rounded-xl border border-black/5 overflow-hidden">
                        <div className="grid grid-cols-2 gap-px bg-black/5">
                          {[
                            { label: "Model", value: selected.product_name },
                            { label: "Quantity", value: `${selected.quantity} unit${selected.quantity > 1 ? "s" : ""}` },
                            { label: "Use Type", value: selected.use_type },
                            { label: "Budget", value: selected.budget || "Not specified" },
                            { label: "Contact Via", value: selected.contact_method },
                            { label: "Assigned To", value: selected.assigned_sales || "Being assigned" },
                          ].map(item => (
                            <div key={item.label} className="bg-white px-3 py-2.5">
                              <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">{item.label}</p>
                              <p className="text-xs text-black font-semibold truncate">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      {selected.sales_notes && (
                        <div className="rounded-xl border border-[#39FF14]/20 bg-[#39FF14]/5 p-4">
                          <p className="text-xs text-black font-semibold uppercase tracking-wide mb-2">Message from Sales Team</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{selected.sales_notes}</p>
                        </div>
                      )}
                      {selected.notes && (
                        <div className="rounded-xl border border-black/5 p-4 bg-gray-50">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Your Notes</p>
                          <p className="text-sm text-gray-600 italic">"{selected.notes}"</p>
                        </div>
                      )}
                      {selected.status === "pending" && (
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
                          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-gray-600">Our team is reviewing your request and will respond within 24 business hours.</p>
                        </div>
                      )}
                      <button
                        onClick={() => downloadQuotationPDF(selected)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-black/10 text-sm text-gray-600 hover:text-black hover:bg-black/5 transition-all"
                      >
                        <Download className="w-4 h-4" />Download PDF
                      </button>
                      <p className="text-xs text-gray-500 text-center">Ref: #{selected.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Comparison Modal ── */}
      {showCompare && compareQuotes.length === 2 && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white border border-black/5 rounded-2xl w-full max-w-4xl shadow-2xl relative z-10 overflow-hidden">
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#39FF14] to-[#00FFFF]" />
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-black/5 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <GitCompare className="w-5 h-5 text-black" />
                <h2 className="font-sans font-bold text-lg text-black">Quote Comparison</h2>
              </div>
              <button onClick={() => setShowCompare(false)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-black/10 text-gray-500 hover:text-black hover:bg-black/5 transition-all"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-2 gap-6">
                {compareQuotes.map((q, qi) => {
                  const cfg = STATUS_CONFIG[q.status] || STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={q.id} className="space-y-4">
                      {/* Product Header */}
                      <div className={`rounded-xl border p-4 ${qi === 0 ? "border-[#39FF14]/50 bg-[#39FF14]/5" : "border-blue-400 bg-blue-50/30"}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-black/10 shrink-0">
                            <img src={PRODUCTS.find(p => p.name === q.product_name)?.image || ""} alt={q.product_name} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                          </div>
                          <div>
                            <p className="font-sans font-bold text-base text-black">{q.product_name}</p>
                            <span className={`flex items-center gap-1.5 text-xs font-semibold ${cfg.color}`}><StatusIcon className="w-3.5 h-3.5" />{cfg.label}</span>
                          </div>
                        </div>
                        {q.estimated_price ? (
                          <div className="text-center py-2">
                            <p className="text-xs text-gray-500 mb-0.5">Estimated Price</p>
                            <p className="font-sans font-black text-2xl text-black">₱{q.estimated_price.toLocaleString()}</p>
                            {q.valid_until && <p className="text-xs text-gray-500">Valid until {q.valid_until}</p>}
                          </div>
                        ) : (
                          <p className="text-center text-xs text-gray-500 py-2">Price pending</p>
                        )}
                      </div>
                      {/* Details */}
                      <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
                        {[
                          { label: "Quantity", value: `${q.quantity} unit${q.quantity > 1 ? "s" : ""}` },
                          { label: "Use Type", value: q.use_type },
                          { label: "Budget Range", value: q.budget || "Not specified" },
                          { label: "Contact Method", value: q.contact_method },
                          { label: "Assigned Sales", value: q.assigned_sales || "Pending" },
                          { label: "Submitted", value: new Date(q.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) },
                        ].map((item, i) => (
                          <div key={item.label} className={`flex items-center justify-between px-4 py-3 border-b border-black/5 last:border-0 ${i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}>
                            <p className="text-xs text-gray-500">{item.label}</p>
                            <p className="text-xs text-black font-semibold text-right max-w-[60%] truncate">{item.value}</p>
                          </div>
                        ))}
                      </div>
                      {/* Product Specs */}
                      {(() => {
                        const prod = PRODUCTS.find(p => p.name === q.product_name);
                        if (!prod) return null;
                        return (
                          <div className="bg-white rounded-xl border border-black/5 overflow-hidden">
                            <div className="px-4 py-3 border-b border-black/5 bg-gray-50/50">
                              <p className="text-xs text-gray-600 font-semibold uppercase tracking-widest">Product Specs</p>
                            </div>
                            {Object.entries(prod.specs).slice(0, 5).map(([key, val]) => (
                              <div key={key} className="flex items-center justify-between px-4 py-2.5 border-b border-black/5 last:border-0">
                                <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                                <p className="text-xs text-black font-medium">{val as string}</p>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                      {/* Sales Notes */}
                      {q.sales_notes && (
                        <div className="rounded-xl border border-[#39FF14]/25 bg-[#39FF14]/5 p-4">
                          <p className="text-xs text-black font-semibold mb-1">Sales Notes</p>
                          <p className="text-xs text-gray-600">{q.sales_notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-black/5 flex justify-end">
              <button onClick={() => { setShowCompare(false); setCompareIds([]); }} className="btn-outline text-sm px-6 border-black/10 hover:bg-black/5 hover:text-black">Close Comparison</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

