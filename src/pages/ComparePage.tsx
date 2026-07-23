import { useState, useCallback, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Zap, Battery, Gauge, Weight, Package, Check, X, Plus, ChevronRight,
  Star, ArrowRight, Info, Minus, Shield, Clock, BarChart3
} from "lucide-react";
import { PRODUCTS } from "@/constants/products";
import QuoteModal from "@/components/features/QuoteModal";
import CustomerAuthModal from "@/components/features/CustomerAuthModal";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useSystemSettings } from "@/hooks/useSystemSettings";

const SPEC_LABELS: Record<string, { label: string; icon: any }> = {
  motor:        { label: "Motor Power", icon: Zap },
  battery:      { label: "Battery", icon: Battery },
  range:        { label: "Range", icon: BarChart3 },
  topSpeed:     { label: "Top Speed", icon: Gauge },
  weight:       { label: "Bike Weight", icon: Weight },
  payload:      { label: "Max Payload", icon: Package },
  chargeTime:   { label: "Charge Time", icon: Clock },
  frame:        { label: "Frame", icon: Shield },
  brakes:       { label: "Brakes", icon: Shield },
  tires:        { label: "Tires", icon: Shield },
};

const ACCENT_COLORS = ["#000000", "#333333", "#707070"];
const COL_BORDERS  = ["border-black", "border-black/30", "border-black/10"];
const COL_BG       = ["bg-white", "bg-[#FAFAFA]", "bg-white"];
const COL_TEXT     = ["text-black", "text-[#333333]", "text-[#707070]"];
const COL_BADGE    = ["bg-black text-white", "bg-black text-white", "bg-black text-white"];

export default function ComparePage() {
  const { customer } = useCustomerAuth();
  const { settings } = useSystemSettings();
  const [selected, setSelected] = useState<string[]>(["delivery-ebike", "folding-ebike"]);
  const [quoteProduct, setQuoteProduct] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<string | null>(null);

  const selectedProducts = useMemo(() => PRODUCTS.filter(p => selected.includes(p.id)), [selected]);
  const allProductIds = useMemo(() => PRODUCTS.map(p => p.id), []);

  const toggleProduct = useCallback((id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev; // Keep at least 2
        return prev.filter(p => p !== id);
      }
      if (prev.length >= 3) {
        // Replace the last one
        return [...prev.slice(0, 2), id];
      }
      return [...prev, id];
    });
  }, []);

  const handleRequestQuote = useCallback((productId: string) => {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    if (!customer) {
      setPendingProduct(productId);
      setShowAuth(true);
    } else {
      setQuoteProduct(product.name);
    }
  }, [customer]);

  const handleAuthSuccess = useCallback(() => {
    setShowAuth(false);
    if (pendingProduct) {
      const product = PRODUCTS.find(p => p.id === pendingProduct);
      if (product) setQuoteProduct(product.name);
      setPendingProduct(null);
    }
  }, [pendingProduct]);

  // Check if a spec value differs across selected products
  const specDiffers = useCallback((key: string) => {
    const vals = selectedProducts.map(p => (p.specs as any)[key]);
    return new Set(vals).size > 1;
  }, [selectedProducts]);

  const priceMin = useMemo(() => Math.min(...selectedProducts.map(p => p.price)), [selectedProducts]);
  const priceMax = useMemo(() => Math.max(...selectedProducts.map(p => p.price)), [selectedProducts]);

  return (
    <div className="min-h-screen bg-white text-black pb-24">
      <Helmet>
        <title>Compare E-Bike Models — TRIP Mobility</title>
        <meta name="description" content="Compare TRIP Mobility e-bike models side-by-side. Full specs, pricing, features, and use cases to help you choose the perfect electric bike." />
      </Helmet>

      {/* Hero */}
      <section className="relative pt-24 pb-12 px-6 overflow-hidden bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto relative text-center">
          <p className="text-[10px] font-bold text-[#707070] uppercase tracking-[0.3em] mb-4">Side-by-Side Comparison</p>
          <h1 className="text-[35px] font-bold text-black mb-6 uppercase tracking-tight">
            Find Your <span className="text-[#707070]">Perfect Ride</span>
          </h1>
          <p className="text-[#707070] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-medium">
            Compare up to 3 TRIP e-bike models across all specifications, features, and pricing to make an informed decision.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-16">

        {/* ── Model Selector ── */}
        <div className="bg-[#FAFAFA] rounded-[2px] border border-black/5 p-8 mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-black text-[11px] uppercase tracking-wider">Select Models to Compare</h2>
              <p className="text-[10px] text-[#707070] font-bold uppercase tracking-widest mt-1">Choose 2–3 models · {selected.length}/3 selected</p>
            </div>
            <div className="flex gap-1.5">
              {selected.length < 3 && (
                <span className="text-[9px] font-bold text-[#707070] uppercase tracking-widest flex items-center gap-1.5 px-4 py-2 bg-white border border-black/5">
                  <Plus className="w-3.5 h-3.5" />Add another model
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PRODUCTS.map((p, i) => {
              const isSelected = selected.includes(p.id);
              const selIdx = selected.indexOf(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  className={`relative flex items-center gap-4 p-5 rounded-[2px] border transition-all text-left ${
                    isSelected
                      ? `border-black bg-white shadow-premium`
                      : "border-black/5 hover:border-black/20 bg-white"
                  }`}
                >
                  <div className="w-16 h-12 rounded-[2px] overflow-hidden shrink-0 bg-[#FAFAFA] border border-black/5">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-[10px] uppercase tracking-wider truncate mb-1 ${isSelected ? "text-black" : "text-[#707070]"}`}>{p.name}</p>
                    {!settings.hide_prices && (
                      <p className={`font-bold text-xs ${isSelected ? "text-black" : "text-[#707070]"}`}>
                        ₱{p.price.toLocaleString()}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <div className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold shrink-0 bg-black text-white`}>
                      {selIdx + 1}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Comparison Table ── */}
        {selectedProducts.length >= 2 && (
          <div className="space-y-12">

            {/* Product Header Cards */}
            <div className={`grid gap-6`} style={{ gridTemplateColumns: `200px repeat(${selectedProducts.length}, 1fr)` }}>
              {/* Empty corner */}
              <div />
              {selectedProducts.map((p, i) => (
                <div key={p.id} className={`bg-white rounded-[2px] border border-black/5 overflow-hidden hover:border-black transition-all hover:shadow-premium`}>
                  <div className={`h-1 w-full bg-black`} />
                  <div className="p-8">
                    <div className="relative h-40 rounded-[2px] overflow-hidden mb-6 bg-[#FAFAFA] border border-black/5">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover mix-blend-multiply" />
                      {p.badge && (
                        <span className={`absolute top-3 left-3 px-3 py-1 text-[9px] font-bold uppercase tracking-widest bg-black text-white`}>
                          {p.badge}
                        </span>
                      )}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= 4 ? "text-black fill-black" : "text-gray-200 fill-gray-200"}`} />)}
                      </div>
                    </div>
                    <p className={`text-[9px] font-bold tracking-widest uppercase mb-2 text-[#707070]`}>{p.category}</p>
                    <h3 className="font-bold text-lg text-black uppercase tracking-tight mb-2">{p.name}</h3>
                    <p className="text-[11px] font-medium text-[#707070] mb-5 line-clamp-2 leading-relaxed">{p.tagline}</p>

                    {/* Price */}
                    {!settings.hide_prices && (
                      <div className={`border border-black/5 p-4 text-center mb-6 bg-[#FAFAFA]`}>
                        <p className="text-[9px] font-bold text-[#707070] uppercase tracking-widest mb-1">Starting From</p>
                        <p className={`font-bold text-2xl tracking-tighter text-black`}>₱{p.price.toLocaleString()}</p>
                        {p.price === priceMin && selectedProducts.length > 1 && (
                          <p className="text-[9px] font-bold text-[#707070] uppercase tracking-widest mt-2">Most Affordable</p>
                        )}
                        {p.price === priceMax && selectedProducts.length > 1 && (
                          <p className="text-[9px] font-bold text-[#707070] uppercase tracking-widest mt-2">Premium Option</p>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      onClick={() => handleRequestQuote(p.id)}
                      className="w-full h-12 bg-black text-white text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-gray-800"
                    >
                      Request Quote
                    </button>
                    <Link
                      to={`/products/${p.id}`}
                      className="flex items-center justify-center gap-1.5 mt-4 text-[10px] font-bold uppercase tracking-widest text-[#707070] hover:text-black transition-colors"
                    >
                      View Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Quick Highlights Row ── */}
            <div className="bg-white rounded-[2px] border border-black/5 overflow-hidden">
              <div className="px-8 py-5 border-b border-black/5 bg-[#FAFAFA]">
                <h3 className="font-bold text-black text-[11px] uppercase tracking-wider">Key Highlights</h3>
              </div>
              <div className={`grid`} style={{ gridTemplateColumns: `200px repeat(${selectedProducts.length}, 1fr)` }}>
                <div className="px-8 py-5 flex items-center">
                  <span className="text-[9px] text-[#707070] uppercase tracking-widest font-bold">Metric</span>
                </div>
                {selectedProducts.map((_, i) => (
                  <div key={i} className={`p-5 text-center border-l border-black/5 bg-white`}>
                    <span className={`text-[9px] font-bold uppercase tracking-widest text-black`}>Model {i + 1}</span>
                  </div>
                ))}
              </div>
              {[
                { key: "motor", icon: Zap, label: "Motor" },
                { key: "range", icon: BarChart3, label: "Range" },
                { key: "topSpeed", icon: Gauge, label: "Top Speed" },
                { key: "payload", icon: Package, label: "Max Payload" },
              ].map(({ key, icon: Icon, label }, rowIdx) => {
                const differs = specDiffers(key);
                return (
                  <div
                    key={key}
                    className={`grid border-t border-black/5 ${rowIdx % 2 === 0 ? "" : "bg-[#FAFAFA]"}`}
                    style={{ gridTemplateColumns: `200px repeat(${selectedProducts.length}, 1fr)` }}
                  >
                    <div className="px-8 py-5 flex items-center gap-3">
                      <Icon className="w-4 h-4 text-black shrink-0" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">{label}</span>
                      {differs && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-black" title="Values differ" />
                      )}
                    </div>
                    {selectedProducts.map((p, i) => {
                      const val = (p.specs as any)[key];
                      return (
                        <div key={p.id} className="p-5 text-center border-l border-black/5 flex items-center justify-center">
                          <span className={`text-xs font-bold ${differs ? "text-black" : "text-[#707070]"}`}>
                            {val || "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* ── Full Specs Table ── */}
            <div className="bg-white rounded-[2px] border border-black/5 overflow-hidden">
              <div className="px-8 py-5 border-b border-black/5 bg-[#FAFAFA] flex items-center justify-between">
                <h3 className="font-bold text-black text-[11px] uppercase tracking-wider">Full Specifications</h3>
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#707070]">
                  <span className="w-1.5 h-1.5 rounded-full bg-black inline-block" />
                  Black dot = values differ
                </div>
              </div>
              {/* Header Row */}
              <div
                className="grid border-b border-black/5"
                style={{ gridTemplateColumns: `200px repeat(${selectedProducts.length}, 1fr)` }}
              >
                <div className="px-8 py-4">
                  <span className="text-[9px] font-bold text-[#707070] uppercase tracking-widest">Specification</span>
                </div>
                {selectedProducts.map((p, i) => (
                  <div key={p.id} className={`px-5 py-4 border-l border-black/5 bg-white text-center`}>
                    <span className={`text-[9px] font-bold uppercase tracking-widest text-black`}>{p.name}</span>
                  </div>
                ))}
              </div>
              {/* Spec Rows */}
              {Object.entries(SPEC_LABELS).map(([key, { label, icon: Icon }], rowIdx) => {
                const differs = specDiffers(key);
                return (
                  <div
                    key={key}
                    className={`grid border-b border-black/5 ${rowIdx % 2 === 0 ? "" : "bg-[#FAFAFA]"}`}
                    style={{ gridTemplateColumns: `200px repeat(${selectedProducts.length}, 1fr)` }}
                  >
                    <div className="px-8 py-4 flex items-center gap-3">
                      <Icon className="w-3.5 h-3.5 text-black shrink-0" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#707070]">{label}</span>
                      {differs && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                    {selectedProducts.map((p, i) => {
                      const val = (p.specs as any)[key] || "—";
                      const isHighlight = differs;
                      return (
                        <div key={p.id} className="px-5 py-4 text-center border-l border-black/5 flex items-center justify-center">
                          <span className={`text-xs font-medium ${isHighlight ? `font-bold text-black` : "text-[#707070]"}`}>
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* ── Features Comparison ── */}
            <div className="bg-white rounded-[2px] border border-black/5 overflow-hidden">
              <div className="px-8 py-5 border-b border-black/5 bg-[#FAFAFA]">
                <h3 className="font-bold text-black text-[11px] uppercase tracking-wider">Key Features</h3>
              </div>
              {/* Get all unique features */}
              {(() => {
                const allFeatures = [...new Set(selectedProducts.flatMap(p => p.features))];
                return allFeatures.map((feat, i) => (
                  <div
                    key={i}
                    className={`grid border-b border-black/5 ${i % 2 === 0 ? "" : "bg-[#FAFAFA]"}`}
                    style={{ gridTemplateColumns: `1fr repeat(${selectedProducts.length}, 80px)` }}
                  >
                    <div className="px-8 py-4 flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-black">{feat}</span>
                    </div>
                    {selectedProducts.map((p, pi) => {
                      const has = p.features.some(f => f.toLowerCase().includes(feat.toLowerCase().split(" ")[0]));
                      return (
                        <div key={p.id} className="px-4 py-4 flex items-center justify-center border-l border-black/5">
                          {has
                            ? <Check className={`w-4 h-4 text-black`} />
                            : <Minus className="w-4 h-4 text-gray-300" />
                          }
                        </div>
                      );
                    })}
                  </div>
                ));
              })()}
            </div>

            {/* ── Use Cases ── */}
            <div className="bg-white rounded-[2px] border border-black/5 overflow-hidden">
              <div className="px-8 py-5 border-b border-black/5 bg-[#FAFAFA]">
                <h3 className="font-bold text-black text-[11px] uppercase tracking-wider">Ideal Use Cases</h3>
              </div>
              <div
                className="grid divide-x divide-black/5"
                style={{ gridTemplateColumns: `200px repeat(${selectedProducts.length}, 1fr)` }}
              >
                <div className="px-8 py-6 flex items-center">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#707070]">Best for:</span>
                </div>
                {selectedProducts.map((p, i) => (
                  <div key={p.id} className="p-6">
                    <div className="space-y-3">
                      {p.useCases.map((uc, j) => (
                        <div key={j} className={`flex items-center gap-3 px-4 py-3 bg-[#FAFAFA] border border-black/5`}>
                          <Check className={`w-3.5 h-3.5 shrink-0 text-black`} />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-black">{uc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CTA Footer ── */}
            <div className="bg-[#FAFAFA] rounded-[2px] border border-black/5 p-12">
              <div className={`grid gap-8`} style={{ gridTemplateColumns: `repeat(${selectedProducts.length}, 1fr)` }}>
                {selectedProducts.map((p, i) => (
                  <div key={p.id} className={`text-center p-8 bg-white border border-black/5 hover:border-black transition-colors hover:shadow-premium`}>
                    <p className={`font-bold text-[11px] uppercase tracking-wider text-black mb-2`}>{p.name}</p>
                    {!settings.hide_prices && (
                      <p className={`font-bold text-3xl tracking-tighter text-black mb-3`}>₱{p.price.toLocaleString()}</p>
                    )}
                    <p className="text-[11px] font-medium text-[#707070] mb-8 line-clamp-2">{p.tagline}</p>
                    <button
                      onClick={() => handleRequestQuote(p.id)}
                      className="w-full h-12 bg-black text-white text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-gray-800 flex items-center justify-center gap-2"
                    >
                      Request Quote <ArrowRight className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/products/${p.id}`}
                      className="flex items-center justify-center gap-1.5 mt-5 text-[10px] font-bold uppercase tracking-widest text-[#707070] hover:text-black transition-colors"
                    >
                      Full Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Help Banner */}
        <div className="mt-16 bg-[#FAFAFA] border border-black/5 p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm hover:border-black transition-colors">
          <div className="w-14 h-14 bg-white border border-black/10 flex items-center justify-center shrink-0">
            <Info className="w-6 h-6 text-black" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <p className="font-bold text-black text-[11px] uppercase tracking-wider mb-2">Not sure which model fits you?</p>
            <p className="text-[#707070] font-medium text-[11px] leading-relaxed">Our e-mobility specialists can help you choose the right bike for your needs, budget, and use case — completely free consultation.</p>
          </div>
          <Link to="/contact" className="btn-primary h-12 px-8 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
            Talk to an Expert <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Quote Modal */}
      <QuoteModal
        open={!!quoteProduct}
        preselectedProduct={quoteProduct || undefined}
        onClose={() => setQuoteProduct(null)}
      />
      <CustomerAuthModal
        open={showAuth}
        onClose={() => { setShowAuth(false); setPendingProduct(null); }}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

