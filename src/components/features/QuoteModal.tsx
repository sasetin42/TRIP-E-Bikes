import { useState, useEffect, useCallback } from "react";
import { trackQuoteStep, trackQuoteSubmit } from "@/hooks/useTracking";
import { X, CheckCircle, ChevronRight, ChevronLeft, User, Briefcase, Bike, Hash, DollarSign, Phone, FileText, Zap, Building2, Mail, Smartphone, UserPlus, Lock, LayoutDashboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PRODUCTS } from "@/constants/products";
import { apiClient } from "@/lib/api-client";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import CustomerAuthModal from "@/components/features/CustomerAuthModal";
import { getBadgeIcon } from "./ProductCard";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { SettingsService } from "@/services/settingsService";

interface QuoteModalProps {
  open: boolean;
  onClose: () => void;
  preselectedProduct?: string;
}

const STEPS = [
  { id: "info", label: "Your Info", icon: User, desc: "Auto-filled from your account" },
  { id: "use", label: "Use Type", icon: Briefcase, desc: "How will you use it?" },
  { id: "model", label: "Bike Model", icon: Bike, desc: "Choose your TRIP" },
  { id: "qty", label: "Quantity", icon: Hash, desc: "How many units?" },
  { id: "budget", label: "Budget", icon: DollarSign, desc: "Your investment range" },
  { id: "contact", label: "Contact", icon: Phone, desc: "How to reach you" },
  { id: "notes", label: "Confirm", icon: FileText, desc: "Review & submit" },
];

const BUDGET_OPTIONS = [
  { value: "Under ₱100,000", label: "Under ₱100K", desc: "1–2 units, personal use" },
  { value: "₱100,000 – ₱300,000", label: "₱100K – ₱300K", desc: "2–5 units, small business" },
  { value: "₱300,000 – ₱500,000", label: "₱300K – ₱500K", desc: "5–8 units, growing fleet" },
  { value: "₱500,000 – ₱1,000,000", label: "₱500K – ₱1M", desc: "8–15 units, business fleet" },
  { value: "₱1,000,000 – ₱3,000,000", label: "₱1M – ₱3M", desc: "15–50 units, enterprise" },
  { value: "₱3,000,000+", label: "₱3M+", desc: "50+ units, large fleet" },
];

const CONTACT_METHODS = [
  { value: "Email", icon: Mail, desc: "Detailed proposal via email" },
  { value: "Phone Call", icon: Phone, desc: "Direct call from our team" },
  { value: "WhatsApp", icon: Smartphone, desc: "Quick chat on WhatsApp" },
  { value: "Viber", icon: Smartphone, desc: "Reach us on Viber" },
  { value: "In-Person Visit", icon: Building2, desc: "Schedule a showroom visit" },
];

const USE_TYPES = [
  { id: "personal", label: "Personal Use", desc: "Daily commute, recreation, personal transport", emoji: "🚴", detail: "For individual riders seeking sustainable mobility" },
  { id: "business", label: "Business / SME", desc: "Small fleet for business operations (2–9 units)", emoji: "🏢", detail: "Delivery, courier, or logistics for your business" },
  { id: "fleet", label: "Fleet Purchase", desc: "Enterprise-scale deployment (10+ units)", emoji: "🚀", detail: "Dedicated account manager + custom terms available" },
];

export default function QuoteModal({ open, onClose, preselectedProduct }: QuoteModalProps) {
  const { customer } = useCustomerAuth();
  const { settings } = useSystemSettings();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leadScore, setLeadScore] = useState(0);
  const [quotationId, setQuotationId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    company: "",
    useType: "",
    product: preselectedProduct || "",
    quantity: 1,
    budget: "",
    contactMethod: "",
    notes: "",
  });

  // Auto-fill from customer account
  useEffect(() => {
    if (customer) {
      setForm(f => ({
        ...f,
        name: customer.username || f.name,
        email: customer.email || f.email,
      }));
    }
  }, [customer]);

  // Disable body scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (preselectedProduct && open) {
      setForm(f => ({ ...f, product: preselectedProduct }));
    }
  }, [preselectedProduct, open]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep(0);
        setSubmitted(false);
        setLoading(false);
        setShowAuthModal(false);
        setForm({ name: customer?.username || "", email: customer?.email || "", mobile: "", company: "", useType: "", product: preselectedProduct || "", quantity: 1, budget: "", contactMethod: "", notes: "" });
      }, 300);
    }
  }, [open, customer, preselectedProduct]);

  if (!open) return null;

  const handleNext = () => {
    // Gate: require account before proceeding from step 0
    if (step === 0 && !customer) {
      setShowAuthModal(true);
      return;
    }
    trackQuoteStep(step, STEPS[step].label, { product: form.product, use_type: form.useType });
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => { if (step > 0) setStep(step - 1); };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    toast.success("Account verified! Continuing with your quote...");
    setStep(1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    // Call submit-quote endpoint to score the lead and save the quotation
    const { data, error } = await apiClient.post("/submit-quote.php", {
      name: form.name,
      email: form.email,
      mobile: form.mobile,
      company: form.company || undefined,
      use_type: form.useType,
      product_interest: form.product,
      quantity: form.quantity,
      budget: form.budget,
      contact_method: form.contactMethod,
      notes: form.notes || undefined,
      customer_id: customer?.id,
    });

    if (error) {
      console.error("Quote error:", error.message);
      toast.error("Failed to submit. Please try again.");
      setLoading(false);
      return;
    }

    if (data && data.quotation_id) {
      setQuotationId(String(data.quotation_id));
    }

    setLeadScore(data?.score || 0);
    trackQuoteSubmit({ product: form.product, quantity: form.quantity, useType: form.useType, budget: form.budget, leadScore: data?.score });
    setSubmitted(true);
    setLoading(false);
    toast.success("Quote submitted! Check your email for confirmation.");

    // Asynchronously dispatch quotation email template if email is provided
    if (form.email && settings) {
      const quotationTemplate = settings.email_templates?.find(
        (t) => t.id === "tpl_quotation_ready" || t.category === "Quotation & Fleet Proposal"
      );
      if (quotationTemplate && (quotationTemplate.status === "active" || quotationTemplate.enabled)) {
        SettingsService.sendTemplatedEmail({
          template: quotationTemplate,
          recipient: form.email,
          recipientName: form.name,
          settings,
          interpolatedVars: {
            "{{user_name}}": form.name,
            "{{first_name}}": form.name.split(" ")[0] || form.name,
            "{{quote_number}}": data?.quotation_id ? `QUO-${data.quotation_id}` : `QUO-${Date.now().toString().slice(-5)}`,
            "{{amount}}": form.budget || "Custom Fleet Quote",
          },
        }).catch((e) => console.warn("Background quote email dispatch:", e));
      }
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return form.name.trim() && form.email.trim() && form.mobile.trim();
      case 1: return !!form.useType;
      case 2: return !!form.product;
      case 3: return form.quantity >= 1;
      case 4: return !!form.budget;
      case 5: return !!form.contactMethod;
      default: return true;
    }
  };

  const CurrentStepIcon = STEPS[step]?.icon || User;

  return (
    <>
      {/* Customer Auth Modal */}
      <CustomerAuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        prefilledEmail={form.email}
        title="Account Required"
        subtitle="Create a free TRIP account to submit your quote and track it in your personal dashboard. Takes just 60 seconds."
      />

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="w-full max-w-2xl bg-white p-[2px] rounded-2xl shadow-premium relative z-10 overflow-hidden">
        <div className="flex flex-col max-h-[92vh] rounded-[14px] bg-white relative z-10 overflow-hidden border border-black/5">
          <div className="h-[2px] w-full bg-black" />

          {/* Header */}
          <div className="flex-shrink-0 px-7 pt-4 pb-3">
            <div className="flex items-start justify-between mb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-[10px] text-black tracking-[0.2em] uppercase font-bold">TRIP Mobility</p>
                  <h2 className="font-bold text-xl text-black leading-tight tracking-tight">
                    {submitted ? "Quote Submitted!" : "Request a Quote"}
                  </h2>
                </div>
              </div>
              <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl border border-black/10 text-[#707070] hover:text-black hover:border-black/30 transition-all shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {!submitted && (
              <>
                {/* Customer status bar */}
                {customer ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/5 border border-black/10 mb-4">
                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center font-bold text-white text-xs">
                      {customer.username[0].toUpperCase()}
                    </div>
                    <p className="text-xs text-[#707070]">Signed in as <span className="text-black font-semibold">{customer.email}</span></p>
                    <CheckCircle className="w-3.5 h-3.5 text-black ml-auto" />
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-black/10 bg-black/5 hover:bg-black/10 transition-all mb-4 group"
                  >
                    <UserPlus className="w-4 h-4 text-black" />
                    <p className="text-xs text-[#707070] group-hover:text-black">
                      <span className="text-black font-semibold">Create / Sign In</span> — Required to submit quote & track status
                    </p>
                    <ChevronRight className="w-3 h-3 text-[#707070] ml-auto" />
                  </button>
                )}

                {/* Step pills */}
                <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
                  {STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const isComplete = i < step;
                    const isCurrent = i === step;
                    return (
                      <div key={s.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                        isCurrent ? "bg-black text-white"
                        : isComplete ? "bg-black/5 border border-black/10 text-black"
                        : "bg-black/5 border border-black/5 text-[#707070]"
                      }`}>
                        {isComplete ? <CheckCircle className="w-3 h-3 text-black" /> : <Icon className="w-3 h-3" />}
                        <span className="hidden sm:inline">{s.label}</span>
                        <span className="sm:hidden">{i + 1}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="h-1 bg-black/5 rounded-full overflow-hidden">
                  <div className="h-full bg-black rounded-full transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
                </div>
              </>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-7 pb-7">
            {submitted ? (
              <div className="text-center py-6">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-full bg-black/5 border border-black/10 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-black" />
                  </div>
                </div>
                <h3 className="font-bold text-2xl text-black mb-2 tracking-tight">Thank You, {form.name.split(" ")[0]}!</h3>
                <p className="text-[#707070] text-sm leading-relaxed mb-6 max-w-md mx-auto">
                  Your quote is confirmed. Our e-mobility specialist will contact you via <span className="text-black font-semibold">{form.contactMethod}</span> within 24 business hours.<br /><br />
                  A <strong className="text-black">confirmation email with brochures & financing info</strong> was sent to <span className="text-black">{form.email}</span>.
                </p>

                <div className="rounded-xl border border-black/10 overflow-hidden mb-5 text-left bg-white">
                  <div className="px-4 py-3 border-b border-black/5">
                    <p className="text-xs text-black font-bold tracking-widest uppercase">Quote Summary</p>
                  </div>
                  <div className="grid grid-cols-2 gap-px bg-black/10">
                    {[
                      { label: "Model", value: form.product },
                      { label: "Quantity", value: `${form.quantity} unit${form.quantity > 1 ? "s" : ""}` },
                      { label: "Use Type", value: form.useType.charAt(0).toUpperCase() + form.useType.slice(1) },
                      { label: "Budget", value: form.budget },
                    ].map((item) => (
                      <div key={item.label} className="bg-white px-4 py-3">
                        <p className="text-xs text-[#707070] mb-1">{item.label}</p>
                        <p className="text-sm text-black font-semibold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {customer && (
                  <button
                    onClick={() => { onClose(); navigate("/my-quotes"); }}
                    className="w-full btn-primary flex items-center justify-center gap-2 mb-3"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Track My Quote in Dashboard
                  </button>
                )}
                <button onClick={onClose} className="w-full btn-outline text-sm">Explore More Models</button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-5 mt-2">
                  <div className="w-9 h-9 rounded-lg bg-black/5 border border-black/10 flex items-center justify-center shrink-0">
                    <CurrentStepIcon className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <p className="font-semibold text-black text-base">{STEPS[step].label}</p>
                    <p className="text-xs text-[#707070]">{STEPS[step].desc}</p>
                  </div>
                  <div className="ml-auto text-xs text-[#707070] font-medium">{step + 1} / {STEPS.length}</div>
                </div>

                {/* Step 0 */}
                {step === 0 && (
                  <div className="space-y-4">
                    {customer && (
                      <div className="p-3 rounded-xl bg-black/5 border border-black/10 mb-2">
                        <p className="text-xs text-[#707070]"><span className="text-black">✓</span> Account verified — your details are auto-filled below</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label htmlFor="quote-name" className="block text-xs text-[#707070] mb-2 uppercase tracking-widest font-bold">Full Name <span className="text-black">*</span></label>
                        <input id="quote-name" name="name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Juan Dela Cruz" autoComplete="name" className="w-full border border-black/10 rounded-xl px-4 py-3.5 text-black placeholder-gray-400 focus:outline-none focus:border-black/50 transition-all text-sm bg-white" />
                      </div>
                      <div>
                        <label htmlFor="quote-email" className="block text-xs text-[#707070] mb-2 uppercase tracking-widest font-bold">Email <span className="text-black">*</span></label>
                        <input id="quote-email" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="juan@company.ph" autoComplete="email" className="w-full border border-black/10 rounded-xl px-4 py-3.5 text-black placeholder-gray-400 focus:outline-none focus:border-black/50 transition-all text-sm bg-white" />
                      </div>
                      <div>
                        <label htmlFor="quote-mobile" className="block text-xs text-[#707070] mb-2 uppercase tracking-widest font-bold">Mobile <span className="text-black">*</span></label>
                        <input id="quote-mobile" name="mobile" type="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="+63 917 000 0000" autoComplete="tel" className="w-full border border-black/10 rounded-xl px-4 py-3.5 text-black placeholder-gray-400 focus:outline-none focus:border-black/50 transition-all text-sm bg-white" />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="quote-company" className="block text-xs text-[#707070] mb-2 uppercase tracking-widest font-bold">Company <span className="text-gray-400">(optional)</span></label>
                        <input id="quote-company" name="company" type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Your company name" autoComplete="organization" className="w-full border border-black/10 rounded-xl px-4 py-3.5 text-black placeholder-gray-400 focus:outline-none focus:border-black/50 transition-all text-sm bg-white" />
                      </div>
                    </div>
                    {!customer && (
                      <div className="p-4 rounded-xl border border-black/10 bg-black/5">
                        <p className="text-xs text-black font-bold mb-1">⚡ Account required to submit</p>
                        <p className="text-xs text-[#707070]">Click "Continue" below — you'll be prompted to create your free account.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 1 */}
                {step === 1 && (
                  <div className="space-y-3">
                    {USE_TYPES.map((opt) => (
                      <button key={opt.id} onClick={() => setForm({ ...form, useType: opt.id })} className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${form.useType === opt.id ? "border-black bg-black/5 shadow-premium" : "border-black/5 bg-white hover:border-black/20 hover:bg-black/5"}`}>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{opt.emoji}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className={`font-bold text-sm ${form.useType === opt.id ? "text-black" : "text-[#707070]"}`}>{opt.label}</p>
                              {opt.id === "fleet" && <span className="text-[10px] px-2 py-0.5 bg-black text-white rounded-full font-bold">PRIORITY</span>}
                            </div>
                            <p className="text-xs text-[#707070] mt-0.5">{opt.desc}</p>
                            {form.useType === opt.id && <p className="text-xs text-black mt-1.5 italic font-medium">{opt.detail}</p>}
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 shrink-0 ${form.useType === opt.id ? "border-black bg-black" : "border-black/20"}`}>
                            {form.useType === opt.id && <div className="w-full h-full rounded-full flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white" /></div>}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div className="space-y-3">
                    {PRODUCTS.map((product) => (
                      <button key={product.id} onClick={() => setForm({ ...form, product: product.name })} className={`w-full text-left px-4 py-4 rounded-xl border transition-all duration-200 ${form.product === product.name ? "border-black bg-black/5" : "border-black/5 bg-white hover:border-black/20 hover:bg-black/5"}`}>
                        <div className="flex items-center gap-4">
                          <img src={product.image} alt={product.name} className="w-16 h-12 object-cover rounded-lg shrink-0 grayscale group-hover:grayscale-0 transition-all" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={`font-bold text-sm ${form.product === product.name ? "text-black" : "text-[#707070]"}`}>{product.name}</p>
                              {product.badge && (
                                <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 bg-black border border-black/10 text-white rounded-full font-bold uppercase tracking-wider">
                                  {getBadgeIcon(product.badge)}
                                  <span>{product.badge}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#707070] mt-0.5">{product.specs.motor} · {product.specs.range}</p>
                          </div>
                          {!settings.hide_prices && (
                            <div className="text-right shrink-0">
                              <p className="font-bold text-sm text-black">₱{product.price.toLocaleString()}</p>
                              <p className="text-[10px] text-[#707070]">starting at</p>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                    <button onClick={() => setForm({ ...form, product: "Not decided yet" })} className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${form.product === "Not decided yet" ? "border-black bg-black/5" : "border-black/5 bg-white hover:border-black/20"}`}>
                      <p className={`font-bold text-sm ${form.product === "Not decided yet" ? "text-black" : "text-[#707070]"}`}>Not decided yet</p>
                      <p className="text-xs text-[#707070] mt-0.5">Help me choose — I need expert guidance</p>
                    </button>
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <div>
                    <div className="flex items-center justify-center gap-8 py-6">
                      <button onClick={() => setForm({ ...form, quantity: Math.max(1, form.quantity - 1) })} className="w-14 h-14 flex items-center justify-center rounded-2xl border border-black/10 text-black hover:border-black/30 hover:bg-black/5 transition-all text-3xl font-light">−</button>
                      <div className="text-center min-w-[100px]">
                        <p className="font-bold text-6xl text-black leading-none tracking-tight">{form.quantity}</p>
                        <p className="text-sm text-[#707070] mt-2">unit{form.quantity > 1 ? "s" : ""}</p>
                        {form.quantity >= 10 && <p className="text-xs text-black mt-1 font-bold">Fleet pricing available</p>}
                      </div>
                      <button onClick={() => setForm({ ...form, quantity: form.quantity + 1 })} className="w-14 h-14 flex items-center justify-center rounded-2xl border border-black/10 text-black hover:border-black/30 hover:bg-black/5 transition-all text-3xl font-light">+</button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[1, 5, 10, 20, 50, 100].map((qty) => (
                        <button key={qty} onClick={() => setForm({ ...form, quantity: qty })} className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${form.quantity === qty ? "border-black bg-black text-white" : "border-black/5 text-[#707070] hover:border-black/20 hover:text-black bg-white"}`}>{qty}</button>
                      ))}
                    </div>
                    {form.quantity >= 10 && (
                      <div className="mt-4 p-4 rounded-xl bg-black/5 border border-black/10">
                        <p className="text-xs text-black font-bold mb-1">🎉 Fleet Buyer Benefits</p>
                        <ul className="text-xs text-[#707070] space-y-1">
                          <li>• Dedicated account manager assigned</li>
                          <li>• Volume pricing & custom payment terms</li>
                          <li>• Priority delivery & pre-delivery inspection</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4 */}
                {step === 4 && (
                  <div className="space-y-2.5">
                    {BUDGET_OPTIONS.map((opt) => (
                      <button key={opt.value} onClick={() => setForm({ ...form, budget: opt.value })} className={`w-full text-left px-5 py-3.5 rounded-xl border transition-all duration-200 ${form.budget === opt.value ? "border-black bg-black/5" : "border-black/5 bg-white hover:border-black/20 hover:bg-black/5"}`}>
                        <div className="flex items-center justify-between">
                          <p className={`font-bold text-sm ${form.budget === opt.value ? "text-black" : "text-black"}`}>{opt.label}</p>
                          <p className="text-xs text-[#707070]">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 5 */}
                {step === 5 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CONTACT_METHODS.map((method) => {
                      const Icon = method.icon;
                      return (
                        <button key={method.value} onClick={() => setForm({ ...form, contactMethod: method.value })} className={`text-left px-5 py-4 rounded-xl border transition-all duration-200 ${form.contactMethod === method.value ? "border-black bg-black/5" : "border-black/5 bg-white hover:border-black/20"}`}>
                          <Icon className={`w-5 h-5 mb-2 ${form.contactMethod === method.value ? "text-black" : "text-[#707070]"}`} />
                          <p className={`font-bold text-sm ${form.contactMethod === method.value ? "text-black" : "text-black"}`}>{method.value}</p>
                          <p className="text-xs text-[#707070] mt-0.5">{method.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Step 6: Confirm */}
                {step === 6 && (
                  <div className="space-y-5">
                    <textarea id="quote-notes" name="notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any special requirements, delivery timeline, branding needs, or questions..." rows={3} className="w-full border border-black/10 rounded-xl px-4 py-3.5 text-black placeholder-gray-400 focus:outline-none focus:border-black/50 transition-all resize-none text-sm bg-white" />
                    <div className="rounded-xl border border-black/10 overflow-hidden">
                      <div className="px-4 py-2.5 bg-black/5 border-b border-black/10">
                        <p className="text-xs text-black font-bold tracking-widest uppercase">Confirm Your Quote</p>
                      </div>
                      <div className="grid grid-cols-2 gap-px bg-black/10">
                        {[
                          { label: "Name", value: form.name },
                          { label: "Email", value: form.email },
                          { label: "Mobile", value: form.mobile },
                          { label: "Model", value: form.product },
                          { label: "Quantity", value: `${form.quantity} unit${form.quantity > 1 ? "s" : ""}` },
                          { label: "Budget", value: form.budget },
                        ].map((item) => (
                          <div key={item.label} className="bg-white px-4 py-2.5">
                            <p className="text-[10px] text-[#707070] uppercase tracking-wide mb-0.5">{item.label}</p>
                            <p className="text-xs text-black font-bold truncate">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {customer && (
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-black/5 border border-black/10">
                        <Lock className="w-3.5 h-3.5 text-black" />
                        <p className="text-xs text-[#707070]">Track this quote in your <span className="text-black font-bold">customer dashboard</span> after submission.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-black/5">
                  {step > 0 && (
                    <button onClick={handleBack} className="flex items-center gap-2 px-5 py-3 rounded-xl border border-black/10 text-[#707070] hover:text-black hover:border-black/30 transition-all text-sm font-bold">
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={!canProceed() || loading}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                      canProceed() && !loading
                        ? "btn-primary"
                        : "bg-black/5 text-[#707070] border border-black/10 cursor-not-allowed"
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : step === 0 && !customer ? (
                      <><UserPlus className="w-4 h-4" /> Continue — Create / Sign In</>
                    ) : step === STEPS.length - 1 ? (
                      <><Zap className="w-4 h-4" /> Submit Quote Request</>
                    ) : (
                      <>Continue <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
