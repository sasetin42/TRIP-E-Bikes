import { useState, useEffect } from "react";
import { Shield, FileText, Cookie, Calendar, ArrowRight, Check } from "lucide-react";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Link, useSearchParams } from "react-router-dom";

type PolicyType = "privacy" | "terms" | "cookies";

export default function LegalPage() {
  const { settings } = useSystemSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const siteTitle = settings?.site_title || "TRIP Mobility";
  const brandName = settings?.brand_name || "TRIP Mobility";
  const supportEmail = "gobindra@ggii.com.ph";

  const currentTab = (searchParams.get("tab") as PolicyType) || "privacy";

  const handleTabChange = (tab: PolicyType) => {
    setSearchParams({ tab });
  };

  useEffect(() => {
    const titles: Record<PolicyType, string> = {
      privacy: `Privacy Policy — ${siteTitle}`,
      terms: `Terms of Service — ${siteTitle}`,
      cookies: `Cookie Policy — ${siteTitle}`,
    };
    document.title = titles[currentTab] || siteTitle;
  }, [currentTab, siteTitle]);

  return (
    <div className="min-h-screen bg-white text-black pt-24 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Block */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-[#707070] tracking-[0.3em] uppercase mb-4 block">
            Legal & Compliance
          </span>
          <h1 className="font-bold text-[35px] uppercase tracking-tight text-black mb-6">
            Trust & <span className="text-[#707070]">Transparency</span>
          </h1>
          <p className="text-[#707070] font-medium text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Please read our policies carefully to understand how we secure your data and govern the usage of {brandName} e-bikes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            {[
              { id: "privacy" as PolicyType, label: "Privacy Policy", icon: Shield, desc: "Data collection & usage rules" },
              { id: "terms" as PolicyType, label: "Terms of Service", icon: FileText, desc: "Platform usage guidelines" },
              { id: "cookies" as PolicyType, label: "Cookie Policy", icon: Cookie, desc: "Cookie management preferences" }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full text-left p-5 rounded-[2px] border transition-all duration-300 flex items-center gap-4 ${
                    isActive
                      ? "bg-black border-black text-white shadow-premium"
                      : "bg-[#FAFAFA] border-black/5 text-[#707070] hover:border-black hover:text-black"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-[2px] flex items-center justify-center shrink-0 transition-colors border ${
                    isActive ? "bg-white/10 border-white/20 text-white" : "bg-white border-black/10 text-black"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`font-bold text-[11px] uppercase tracking-wider mb-1 ${isActive ? "text-white" : "text-black"}`}>{tab.label}</p>
                    <p className={`text-[10px] font-medium leading-tight ${isActive ? "text-[#A0A0A0]" : "text-[#707070]"}`}>{tab.desc}</p>
                  </div>
                </button>
              );
            })}

            {/* Quick Support Card */}
            <div className="mt-10 p-6 rounded-[2px] border border-black/5 bg-[#FAFAFA]">
              <h4 className="font-bold text-[10px] text-black tracking-widest uppercase mb-3">Need Help?</h4>
              <p className="text-[#707070] font-medium text-xs leading-relaxed mb-5">
                Have questions about our legal policies or terms? Contact our compliance support.
              </p>
              <a
                href={`mailto:${supportEmail}`}
                className="text-[10px] font-bold text-black uppercase tracking-widest hover:text-[#707070] flex items-center gap-2 transition-colors"
              >
                compliance@tripmobility.ph <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Content Pane */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[2px] border border-black/5 p-8 md:p-12 shadow-sm">
              
              <div className="flex items-center gap-3 text-[#707070] text-[10px] font-bold uppercase tracking-widest mb-10 pb-6 border-b border-black/5">
                <Calendar className="w-4 h-4 text-black" />
                <span>Last Updated: July 2026</span>
              </div>

              {/* PRIVACY POLICY */}
              {currentTab === "privacy" && (
                <div className="space-y-8">
                  <h2 className="font-bold text-3xl text-black uppercase tracking-tight">Privacy Policy</h2>
                  <p className="text-[#333333] font-medium text-sm leading-relaxed">
                    At {brandName}, we prioritize the privacy and security of our riders and customers. This Privacy Policy explains how we collect, process, and safeguard your personal information when you use our website, mobile app, and premium electric bikes.
                  </p>

                  <h3 className="font-bold text-black text-lg uppercase tracking-tight mt-10">1. Information We Collect</h3>
                  <p className="text-[#707070] font-medium text-sm leading-relaxed">
                    We collect information you provide directly to us (such as name, email address, phone number, and billing credentials when requesting quotations or submitting inquiries), along with details generated during e-bike usage (such as telemetry details and diagnostics).
                  </p>

                  <h3 className="font-bold text-black text-lg uppercase tracking-tight mt-10">2. How We Use Your Information</h3>
                  <ul className="space-y-4">
                    {[
                      "To process, manage, and deliver your custom quotations and purchase orders.",
                      "To diagnose, optimize, and maintain our premium e-bike performance configurations.",
                      "To send updates, newsletter offers, and service appointment status logs.",
                      "To comply with legal safety standards and protect user accounts."
                    ].map((item, idx) => (
                      <li key={idx} className="flex gap-4 text-[#707070] font-medium text-sm leading-relaxed items-start">
                        <div className="w-5 h-5 rounded-full bg-[#FAFAFA] border border-black/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="font-bold text-black text-lg uppercase tracking-tight mt-10">3. Data Sharing & Third-Party Services</h3>
                  <p className="text-[#707070] font-medium text-sm leading-relaxed">
                    We do not sell your personal data. We only share information with certified service providers (like Firebase for authentication and Supabase for database synchronizations) strictly to run applications and process logistics.
                  </p>

                  <h3 className="font-bold text-black text-lg uppercase tracking-tight mt-10">4. Your Compliance Rights</h3>
                  <p className="text-[#707070] font-medium text-sm leading-relaxed">
                    Under the Data Privacy Act of 2012, you have the right to request access to, correct, or request the deletion of the personal data we store in our profile directories. Contact us directly to exercise these parameters.
                  </p>
                </div>
              )}

              {/* TERMS OF SERVICE */}
              {currentTab === "terms" && (
                <div className="space-y-8">
                  <h2 className="font-bold text-3xl text-black uppercase tracking-tight">Terms of Service</h2>
                  <p className="text-[#333333] font-medium text-sm leading-relaxed">
                    Welcome to {brandName}. By accessing our digital portals, requesting price configurations, or registering customer profiles, you agree to comply with the terms outlined below.
                  </p>

                  <h3 className="font-bold text-black text-lg uppercase tracking-tight mt-10">1. Usage License & Account Security</h3>
                  <p className="text-[#707070] font-medium text-sm leading-relaxed">
                    Riders are responsible for maintaining the confidentiality of their portal credentials and profile details. Users agree to input accurate details (such as real name and valid contact numbers) for compliance monitoring.
                  </p>

                  <h3 className="font-bold text-black text-lg uppercase tracking-tight mt-10">2. E-Bike Operation & Liability</h3>
                  <p className="text-[#707070] font-medium text-sm leading-relaxed">
                    Riders agree to operate all electric bikes in compliance with local transport rules and highway codes. {brandName} is not liable for accidents, injuries, or legal citations caused by reckless operation or neglecting standard maintenance guides.
                  </p>

                  <h3 className="font-bold text-black text-lg uppercase tracking-tight mt-10">3. Custom Quotations & Orders</h3>
                  <p className="text-[#707070] font-medium text-sm leading-relaxed">
                    Quotations submitted through the portal are configuration estimates and do not guarantee instant model availability. All final purchases are finalized through store agreements and billing authorizations.
                  </p>

                  <h3 className="font-bold text-black text-lg uppercase tracking-tight mt-10">4. Intellectual Property</h3>
                  <p className="text-[#707070] font-medium text-sm leading-relaxed">
                    All graphics, layouts, brand marks (including the TRIP logo and system trademarks), and code are the exclusive intellectual property of {brandName} and may not be reproduced without written authorization.
                  </p>
                </div>
              )}

              {/* COOKIE POLICY */}
              {currentTab === "cookies" && (
                <div className="space-y-8">
                  <h2 className="font-bold text-3xl text-black uppercase tracking-tight">Cookie Policy</h2>
                  <p className="text-[#333333] font-medium text-sm leading-relaxed">
                    We use cookies and equivalent tracking systems to optimize website responsiveness, monitor navigation trends, and remember customer profile preferences.
                  </p>

                  <h3 className="font-bold text-black text-lg uppercase tracking-tight mt-10">1. What are Cookies?</h3>
                  <p className="text-[#707070] font-medium text-sm leading-relaxed">
                    Cookies are compact text files saved on your computer or mobile devices when you open specific web pages. They serve to authorize actions, save sessions, and personalize content.
                  </p>

                  <h3 className="font-bold text-black text-lg uppercase tracking-tight mt-10">2. Types of Cookies We Deploy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    {[
                      { title: "Essential Cookies", desc: "Required to keep you logged in, secure authentication steps, and load dashboard layouts." },
                      { title: "Analytics Cookies", desc: "Allows us to track page load responsiveness, traffic metrics, and popular products." },
                      { title: "Preference Cookies", desc: "Saves client setting selections, local currency indices, and custom theme layouts." }
                    ].map((c, i) => (
                      <div key={i} className="p-6 rounded-[2px] border border-black/5 bg-[#FAFAFA] hover:border-black transition-all duration-300">
                        <h4 className="font-bold text-black text-[11px] uppercase tracking-wider mb-2">{c.title}</h4>
                        <p className="text-[#707070] font-medium text-[11px] leading-relaxed">{c.desc}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-bold text-black text-lg uppercase tracking-tight mt-10">3. Managing Cookie Settings</h3>
                  <p className="text-[#707070] font-medium text-sm leading-relaxed">
                    You can restrict or block cookies through your browser's security panel settings. However, disabling essential cookies may impact specific portal features (such as keeping you logged in during navigation).
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

