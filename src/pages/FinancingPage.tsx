import { useState } from "react";
import { CheckCircle, Calculator, ArrowRight, DollarSign, Clock, Users, Zap } from "lucide-react";
import { FINANCING_OPTIONS } from "@/constants/data";
import SectionObserver from "@/components/features/SectionObserver";
import ParticleField from "@/components/features/ParticleField";
import QuoteModal from "@/components/features/QuoteModal";
import FleetROICalculator from "@/components/features/FleetROICalculator";
import { PRODUCTS } from "@/constants/products";

export default function FinancingPage() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [calcProduct, setCalcProduct] = useState(PRODUCTS[0]?.price || 58000);
  const [calcQty, setCalcQty] = useState(1);
  const [calcTerm, setCalcTerm] = useState(24);
  const [calcDown, setCalcDown] = useState(20);

  const totalPrice = calcProduct * calcQty;
  const downPaymentAmt = totalPrice * (calcDown / 100);
  const loanAmt = totalPrice - downPaymentAmt;
  const monthlyRate = 0.015; // 1.5% monthly interest
  const monthlyPayment = loanAmt * (monthlyRate * Math.pow(1 + monthlyRate, calcTerm)) / (Math.pow(1 + monthlyRate, calcTerm) - 1);

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden bg-[#FAFAFA]">
        <ParticleField />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold text-[#707070] uppercase tracking-[0.3em] mb-4">Flexible Financing</p>
          <h1 className="text-[35px] font-bold text-black mb-6 uppercase tracking-tight">
            Own Your <span className="text-[#707070]">TRIP E-Bike</span>
          </h1>
          <p className="text-[#707070] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Accessible financing from individual riders to enterprise fleets. As low as ₱2,000/month.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-[50px] border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <SectionObserver>
            <h2 className="text-3xl md:text-4xl font-bold text-black uppercase tracking-tight mb-12 text-center">
              Choose Your <span className="text-[#707070]">Plan</span>
            </h2>
          </SectionObserver>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FINANCING_OPTIONS.map((option, i) => (
              <SectionObserver key={option.id}>
                <div
                  className={`rounded-[2px] p-10 h-full flex flex-col relative transition-all duration-300 ${
                    option.highlight
                      ? "bg-black text-white shadow-premium"
                      : "bg-[#FAFAFA] border border-black/5 hover:border-black"
                  }`}
                >
                  {option.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white text-black text-[9px] font-bold tracking-widest rounded-[2px] uppercase shadow-sm">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-8">
                    <p className={`text-[10px] uppercase tracking-widest font-bold mb-2 ${option.highlight ? "text-[#A0A0A0]" : "text-[#707070]"}`}>{option.target}</p>
                    <h3 className={`text-2xl font-bold uppercase tracking-tight mb-5 ${option.highlight ? "text-white" : "text-black"}`}>{option.title}</h3>
                    <div className="flex gap-4">
                      <div className={`p-4 text-center border rounded-[2px] ${option.highlight ? "border-white/10 bg-white/5" : "border-black/5 bg-white"}`}>
                        <p className={`font-bold text-lg ${option.highlight ? "text-white" : "text-black"}`}>{option.downPayment}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${option.highlight ? "text-[#A0A0A0]" : "text-[#707070]"}`}>Down Payment</p>
                      </div>
                      <div className={`p-4 text-center border rounded-[2px] ${option.highlight ? "border-white/10 bg-white/5" : "border-black/5 bg-white"}`}>
                        <p className={`font-bold text-lg ${option.highlight ? "text-white" : "text-black"}`}>{option.terms.split("–")[1] || option.terms}</p>
                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${option.highlight ? "text-[#A0A0A0]" : "text-[#707070]"}`}>Max Term</p>
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-4 flex-1">
                    {option.features.map((feat, j) => (
                      <li key={j} className={`flex items-start gap-3 text-sm font-medium ${option.highlight ? "text-[#D0D0D0]" : "text-[#707070]"}`}>
                        <CheckCircle className={`w-5 h-5 shrink-0 mt-0.5 ${option.highlight ? "text-white" : "text-black"}`} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setQuoteOpen(true)}
                    className={`mt-10 w-full h-12 text-[10px] font-bold uppercase tracking-widest ${option.highlight ? "bg-white text-black hover:bg-gray-200 transition-colors" : "btn-outline"}`}
                  >
                    Apply for This Plan
                  </button>
                </div>
              </SectionObserver>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-[50px] bg-[#FAFAFA] border-t border-black/5">
        <div className="max-w-5xl mx-auto px-6">
          <SectionObserver>
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold text-[#707070] uppercase tracking-widest mb-3">Payment Estimator</p>
              <h2 className="text-3xl md:text-4xl font-bold text-black uppercase tracking-tight">
                Calculate Your <span className="text-[#707070]">Monthly Payment</span>
              </h2>
            </div>
          </SectionObserver>
          <SectionObserver>
            <div className="bg-white border border-black/5 p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <div>
                    <label htmlFor="finance-model" className="block text-[10px] font-bold text-black mb-3 uppercase tracking-widest">Select Model</label>
                    <select
                      id="finance-model"
                      name="model"
                      value={calcProduct}
                      onChange={(e) => setCalcProduct(Number(e.target.value))}
                      className="w-full bg-[#FAFAFA] border border-black/10 px-4 py-3 text-black text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-black transition-colors"
                    >
                      {PRODUCTS.map((p) => (
                        <option key={p.id} value={p.price}>
                          {p.name} — ₱{p.price.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="finance-qty" className="block text-[10px] font-bold text-black mb-3 uppercase tracking-widest">Quantity: {calcQty} unit{calcQty > 1 ? "s" : ""}</label>
                    <input
                      id="finance-qty" name="quantity"
                      type="range" min={1} max={50} value={calcQty}
                      onChange={(e) => setCalcQty(Number(e.target.value))}
                      className="w-full accent-black"
                    />
                  </div>
                  <div>
                    <label htmlFor="finance-down" className="block text-[10px] font-bold text-black mb-3 uppercase tracking-widest">Down Payment: {calcDown}%</label>
                    <input
                      id="finance-down" name="down_payment"
                      type="range" min={10} max={50} step={5} value={calcDown}
                      onChange={(e) => setCalcDown(Number(e.target.value))}
                      className="w-full accent-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-black mb-3 uppercase tracking-widest">Loan Term: {calcTerm} months</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[12, 24, 36, 48].map((t) => (
                        <button
                          key={t}
                          onClick={() => setCalcTerm(t)}
                          className={`py-3 border text-[10px] font-bold uppercase tracking-widest transition-all ${
                            calcTerm === t
                              ? "border-black bg-black text-white"
                              : "border-black/10 text-[#707070] bg-white hover:border-black/30"
                          }`}
                        >
                          {t}mo
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-black text-white p-10 flex flex-col justify-between shadow-premium">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-1">Total Price</p>
                      <p className="text-3xl font-bold tracking-tight">₱{totalPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-1">Down Payment ({calcDown}%)</p>
                      <p className="text-xl font-bold tracking-tight text-[#D0D0D0]">₱{Math.round(downPaymentAmt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-[#A0A0A0] uppercase tracking-widest mb-1">Loan Amount</p>
                      <p className="text-xl font-bold tracking-tight text-[#D0D0D0]">₱{Math.round(loanAmt).toLocaleString()}</p>
                    </div>
                    <div className="pt-6 border-t border-white/10 mt-6">
                      <p className="text-[10px] text-white uppercase tracking-widest font-bold mb-2">Estimated Monthly Payment</p>
                      <p className="font-bold text-5xl tracking-tighter">₱{Math.round(monthlyPayment).toLocaleString()}</p>
                      <p className="text-[10px] font-medium text-[#707070] mt-3">*Estimate only. Actual rates may vary.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setQuoteOpen(true)}
                    className="w-full mt-10 bg-white text-black hover:bg-gray-200 transition-colors h-14 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Calculator className="w-4 h-4" />
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          </SectionObserver>
        </div>
      </section>

      {/* Fleet ROI Calculator */}
      <section className="py-[50px] border-t border-black/5">
        <div className="max-w-6xl mx-auto px-6">
          <SectionObserver>
            <div className="text-center mb-16">
              <p className="text-[10px] font-bold text-[#707070] uppercase tracking-widest mb-3">For Fleet Operators</p>
              <h2 className="text-3xl md:text-4xl font-bold text-black uppercase tracking-tight">
                Calculate Your <span className="text-[#707070]">Fleet ROI</span>
              </h2>
              <p className="text-[#707070] font-medium text-sm mt-4 max-w-xl mx-auto leading-relaxed">
                See exactly how much your business saves by switching from petrol to TRIP E-Bikes
              </p>
            </div>
          </SectionObserver>
          <SectionObserver>
            <FleetROICalculator />
          </SectionObserver>
        </div>
      </section>

      {/* Features */}
      <section className="py-[50px] bg-white border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Fast Approval", desc: "Get financing approved in as fast as 24 hours" },
              { icon: DollarSign, title: "Low Down Payment", desc: "Start riding with as low as 10% down" },
              { icon: Clock, title: "Flexible Terms", desc: "12 to 60 month terms available" },
              { icon: Users, title: "Fleet Discounts", desc: "Up to 20% discount on bulk fleet orders" },
            ].map((item, i) => (
              <SectionObserver key={i}>
                <div className="bg-[#FAFAFA] border border-black/5 p-8 text-center hover:border-black transition-colors">
                  <item.icon className="w-6 h-6 text-black mx-auto mb-4" />
                  <h3 className="font-bold text-[11px] uppercase tracking-wider text-black mb-2">{item.title}</h3>
                  <p className="text-[#707070] font-medium text-[11px] leading-relaxed">{item.desc}</p>
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

