import { useState } from "react";
import { Package, Building2, Shield, MapPin, Truck, GraduationCap, CheckCircle, ArrowRight } from "lucide-react";
import { INDUSTRIES } from "@/constants/data";
import SectionObserver from "@/components/features/SectionObserver";
import ParticleField from "@/components/features/ParticleField";
import QuoteModal from "@/components/features/QuoteModal";

const ICON_MAP: Record<string, React.ElementType> = {
  Package, Building2, Shield, MapPin, Truck, GraduationCap
};

const INDUSTRY_DETAILS: Record<string, { benefits: string[]; caseStudy: { title: string; result: string } }> = {
  delivery: {
    benefits: ["100+ km range enables full shift operations", "80% lower fuel cost vs petrol motorcycles", "Heavy-duty rack supports 50kg payload", "Dual battery for zero downtime"],
    caseStudy: { title: "QuickBites Delivery", result: "20 units deployed, ROI in 4 months, ₱800K annual savings" },
  },
  corporate: {
    benefits: ["Custom branding and livery available", "Centralized fleet management dashboard", "Dedicated account manager", "Volume pricing up to 20% off"],
    caseStudy: { title: "Ayala Corporation", result: "50 units for campus mobility, 100% employee satisfaction" },
  },
  government: {
    benefits: ["Silent patrol operations", "Emergency priority spare parts", "Extended 5-year government warranty", "LGU financing programs available"],
    caseStudy: { title: "Quezon City LGU", result: "15 Ranger 750 patrol units, 40% reduction in patrol costs" },
  },
  tourism: {
    benefits: ["Eco-friendly brand positioning for resorts", "Custom color and logo wraps", "Easy charging station setup", "Guest experience enhancement"],
    caseStudy: { title: "Palawan Island Resort", result: "8 Fold X units, 95% guest satisfaction score" },
  },
  logistics: {
    benefits: ["GPS tracking included", "Real-time fleet monitoring", "On-site maintenance contracts", "Bulk purchase 15% discount"],
    caseStudy: { title: "Speed Logistics Inc.", result: "30 Cargo Pro units, ₱2M annual operational savings" },
  },
  education: {
    benefits: ["20% educational institution discount", "Semester-based payment plans", "Campus charging infrastructure support", "Student safety training included"],
    caseStudy: { title: "Ateneo de Manila", result: "20 Fold X units pending, campus mobility program launch" },
  },
};

export default function IndustriesPage() {
  const [activeIndustry, setActiveIndustry] = useState("delivery");
  const [quoteOpen, setQuoteOpen] = useState(false);
  const active = INDUSTRIES.find((i) => i.id === activeIndustry)!;
  const details = INDUSTRY_DETAILS[activeIndustry];

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden bg-[#FAFAFA]">
        <ParticleField />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold text-[#707070] uppercase tracking-[0.3em] mb-4">Industry Solutions</p>
          <h1 className="text-[35px] font-bold text-black mb-6 uppercase tracking-tight">
            E-Mobility for Every <span className="text-[#707070]">Sector</span>
          </h1>
          <p className="text-[#707070] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            From individual delivery riders to government fleets — TRIP Mobility has purpose-built solutions for every Philippine industry.
          </p>
        </div>
      </section>

      {/* Industry Navigator */}
      <section className="py-[50px] border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-16">
            {INDUSTRIES.map((ind) => {
              const Icon = ICON_MAP[ind.icon];
              return (
                <button
                  key={ind.id}
                  onClick={() => setActiveIndustry(ind.id)}
                  className={`p-6 rounded-[2px] border transition-all duration-300 flex flex-col items-center gap-3 ${
                    activeIndustry === ind.id
                      ? "border-black bg-black text-white shadow-premium"
                      : "border-black/5 bg-[#FAFAFA] text-[#707070] hover:border-black/20 hover:text-black"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-tight">{ind.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Industry Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <SectionObserver>
              <div className={`p-10 bg-[#FAFAFA] border border-black/5 hover:border-black transition-all duration-300`}>
                <div className="mb-8">
                  <p className="text-black font-bold text-[10px] uppercase tracking-widest mb-3">{active.stat}</p>
                  <h2 className="text-4xl font-bold text-black uppercase tracking-tight mb-4">{active.title}</h2>
                  <p className="text-[#707070] leading-relaxed font-medium text-sm">{active.description}</p>
                </div>

                <div className="space-y-4 mb-10">
                  {details.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-black shrink-0 mt-0.5" />
                      <p className="text-black text-sm font-medium">{b}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setQuoteOpen(true)}
                  className="btn-primary w-full flex items-center justify-center gap-2 h-14 text-xs font-bold uppercase tracking-widest"
                >
                  Get Industry Quote <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </SectionObserver>

            <SectionObserver delay={150}>
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-bold text-[#707070] uppercase tracking-widest mb-4">Case Study</p>
                  <div className="p-8 border border-black/5 bg-[#FAFAFA]">
                    <h3 className="text-xl font-bold text-black uppercase tracking-tight mb-3">{details.caseStudy.title}</h3>
                    <p className="text-[#707070] leading-relaxed font-medium text-sm">{details.caseStudy.result}</p>
                  </div>
                </div>

                <div className="p-8 border border-black/10 bg-black text-white">
                  <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-3">Recommended Model</p>
                  <p className="text-white font-bold text-2xl uppercase tracking-tight">
                    {activeIndustry === "delivery" || activeIndustry === "logistics" ? "TRIP Cargo Pro" : activeIndustry === "mountain" ? "TRIP Ranger 750" : "TRIP Fold X"}
                  </p>
                  <p className="text-zinc-400 text-sm mt-3 font-medium">
                    {activeIndustry === "delivery" ? "500W motor · 100–120 km range · Dual battery" : "500W motor · 40–50 km range · Foldable"}
                  </p>
                </div>
              </div>
            </SectionObserver>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="py-[50px] bg-white border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: "200+", label: "Business Clients" },
              { value: "12", label: "LGU Partners" },
              { value: "3,000+", label: "Units in Service" },
              { value: "80%", label: "Avg Cost Reduction" },
            ].map((stat, i) => (
              <SectionObserver key={i} delay={i * 100}>
                <div className="text-center p-6 border border-black/5 bg-[#FAFAFA] hover:border-black transition-colors">
                  <p className="text-4xl md:text-5xl font-bold text-black uppercase tracking-tighter mb-3">{stat.value}</p>
                  <p className="text-[10px] font-bold text-[#707070] uppercase tracking-widest">{stat.label}</p>
                </div>
              </SectionObserver>
            ))}
          </div>
        </div>
      </section>

      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </div>
  );
}

