import { useState, useEffect, useMemo, useCallback } from "react";
import { PRODUCTS, PRODUCT_CATEGORIES, syncLiveProducts } from "@/constants/products";
import ProductCard from "@/components/features/ProductCard";
import QuoteModal from "@/components/features/QuoteModal";
import SectionObserver from "@/components/features/SectionObserver";
import ParticleField from "@/components/features/ParticleField";
import { CompareBar, CompareModal } from "@/components/features/ProductComparison";
import { SlidersHorizontal, GitCompare, Grid, List, Search, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>();
  const [compareOpen, setCompareOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<number>(200000);
  
  const [productsList, setProductsList] = useState(PRODUCTS);
  useEffect(() => {
    syncLiveProducts().then(list => setProductsList([...list]));
  }, []);

  const handleCategoryChange = useCallback((catId: string) => {
    setActiveCategory(catId);
  }, []);

  const filtered = useMemo(() => {
    return productsList.filter((p) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;

      const matchName = p.name.toLowerCase().includes(query);
      const matchDesc = p.description.toLowerCase().includes(query);
      const matchTagline = p.tagline?.toLowerCase().includes(query);
      const matchCategory = p.category?.toLowerCase().includes(query);
      
      const matchSpecs = Object.values(p.specs || {}).some(
        (val) => String(val).toLowerCase().includes(query)
      );
      
      const matchFeatures = (p.features || []).some(
        (f: string) => f.toLowerCase().includes(query)
      );

      return matchName || matchDesc || matchTagline || matchCategory || matchSpecs || matchFeatures;
    });
  }, [productsList, searchQuery]);

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden bg-[#FAFAFA]">
        <ParticleField />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold text-[#707070] uppercase tracking-[0.3em] mb-4">The Lineup</p>
          <h1 className="text-[35px] font-bold text-black mb-6 uppercase tracking-tight">
            TRIP E-Bikes
          </h1>
          <p className="text-[#707070] text-sm sm:text-base max-w-2xl mx-auto mb-6 leading-relaxed font-medium">
            Purpose-built electric vehicles engineered for commuters, utility delivery networks, and mountain adventures.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-black/5 text-xs text-[#707070] font-medium shadow-sm">
            <GitCompare className="w-3.5 h-3.5 text-black" />
            Compare up to 3 models side by side by selecting the compare icon.
          </div>
        </div>
      </section>

      {/* Advanced Filter Layout & Toggle */}
      <div className="bg-white border-y border-black/5 py-4 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-row items-center justify-between gap-4">
          
          {/* Enhanced Search Widget */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-[#707070]" />
            </span>
            <input
              type="text"
              placeholder="Search e-bikes by name, specs, features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs h-[40px] bg-[#FAFAFA] border border-black/5 pl-9 pr-9 text-black placeholder-[#707070] font-medium focus:border-black focus:bg-white focus:outline-none transition-all rounded-[2px] shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#707070] hover:text-black transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Grid/List Toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 border transition-all rounded-[2px] ${
                viewMode === "grid" ? "bg-black text-white border-black" : "bg-[#FAFAFA] border-black/5 text-[#707070] hover:text-black hover:bg-white hover:border-black"
              }`}
              aria-label="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 border transition-all rounded-[2px] ${
                viewMode === "list" ? "bg-black text-white border-black" : "bg-[#FAFAFA] border-black/5 text-[#707070] hover:text-black hover:bg-white hover:border-black"
              }`}
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
        </div>
      </div>

      {/* Products Display */}
      <section className="py-[50px] bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {filtered.length === 0 ? (
            <div className="text-center py-[50px] border border-dashed border-black/10 bg-[#FAFAFA]">
              <p className="text-[#707070] text-sm font-medium">No models fit the selected configuration.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((product) => (
                <SectionObserver key={product.id}>
                  <ProductCard
                    product={product}
                    onQuote={() => { setSelectedProduct(product.name); setQuoteOpen(true); }}
                  />
                </SectionObserver>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map((product) => (
                <SectionObserver key={product.id}>
                  <div className="border border-black/5 p-6 flex flex-col lg:flex-row items-center gap-8 hover:border-black hover:shadow-premium transition-all duration-300 bg-white">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full lg:w-48 h-32 object-contain"
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <h3 className="text-xl font-bold uppercase tracking-tight text-black">{product.name}</h3>
                        <span className="text-sm font-bold text-black">₱{product.price.toLocaleString()}</span>
                      </div>
                      <p className="text-[13px] text-[#707070] mb-5 leading-relaxed max-w-2xl font-medium">{product.description}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold text-black">
                        <div>
                          <span className="block text-[9px] text-[#707070] uppercase tracking-wider mb-0.5">Motor</span>
                          <span className="text-[11px] uppercase tracking-wider">{product.specs.motor}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-[#707070] uppercase tracking-wider mb-0.5">Range</span>
                          <span className="text-[11px] uppercase tracking-wider">{product.specs.range}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-[#707070] uppercase tracking-wider mb-0.5">Top Speed</span>
                          <span className="text-[11px] uppercase tracking-wider">{product.specs.topSpeed}</span>
                        </div>
                        <div>
                          <span className="block text-[9px] text-[#707070] uppercase tracking-wider mb-0.5">Payload</span>
                          <span className="text-[11px] uppercase tracking-wider">{product.specs.payload}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 shrink-0 w-full lg:w-auto">
                      <Link
                        to={`/products/${product.id}`}
                        className="btn-outline text-[11px] font-bold uppercase tracking-wider h-12 w-full lg:w-40 text-center flex items-center justify-center"
                      >
                        Specs Details
                      </Link>
                      <button
                        onClick={() => { setSelectedProduct(product.name); setQuoteOpen(true); }}
                        className="btn-primary text-[11px] font-bold uppercase tracking-wider h-12 w-full lg:w-40 flex items-center justify-center"
                      >
                        Request Quote
                      </button>
                    </div>
                  </div>
                </SectionObserver>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Comparison Section */}
      <section className="py-[50px] bg-[#FAFAFA] border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <SectionObserver>
            <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-16 tracking-tight uppercase">Specifications Comparison</h2>
          </SectionObserver>
          <SectionObserver>
            <div className="overflow-x-auto border border-black/5 bg-white shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-black/5 bg-[#FAFAFA]">
                    <th className="text-left py-5 px-6 text-[10px] text-[#707070] uppercase tracking-widest font-bold">Spec Variables</th>
                    {productsList.map((p) => (
                      <th key={p.id} className="text-center py-5 px-6">
                        <p className="font-bold text-sm uppercase tracking-wider text-black">{p.name}</p>
                        <p className="text-[11px] text-[#707070] font-bold mt-1">₱{p.price.toLocaleString()}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-[11px]">
                  {[
                    { label: "Motor Drive", key: "motor" },
                    { label: "Transit Range", key: "range" },
                    { label: "Top Velocity", key: "topSpeed" },
                    { label: "Lithium Battery", key: "battery" },
                    { label: "Net Weight", key: "weight" },
                    { label: "Payload Capacity", key: "payload" },
                    { label: "Charge Cycles", key: "chargeTime" },
                    { label: "Chassis Frame", key: "frame" },
                    { label: "Braking Setup", key: "brakes" },
                  ].map((row) => (
                    <tr key={row.key} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-4 px-6 text-[#707070] uppercase tracking-wider font-bold">{row.label}</td>
                      {productsList.map((p) => (
                        <td key={p.id} className="py-4 px-6 text-center text-black font-bold uppercase tracking-wider">
                          {p.specs[row.key as keyof typeof p.specs]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionObserver>
        </div>
      </section>

      {/* Floating compare bar + modal */}
      <CompareBar onOpen={() => setCompareOpen(true)} />
      <CompareModal open={compareOpen} onClose={() => setCompareOpen(false)} />

      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} preselectedProduct={selectedProduct} />
    </div>
  );
}

