import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LucideIcon, Zap, Battery, Gauge, GitCompare, Star, Sparkles, Tag, Flame, Award, ShieldAlert, Scale, Clock, Weight, CircleDot, CheckCircle, ShoppingCart, FileText, Info, Play, X } from "lucide-react";
import type { Product } from "@/types";
import { useCompareStore } from "@/components/features/ProductComparison";
import OptimizedImage from "@/components/features/OptimizedImage";

export const getBadgeIcon = (badge: string) => {
  const b = badge.toLowerCase();
  if (b.includes("best seller") || b.includes("popular")) {
    return <Star className="w-3 h-3 text-black fill-black shrink-0" />;
  }
  if (b.includes("new") || b.includes("latest")) {
    return <Sparkles className="w-3 h-3 text-black fill-black shrink-0" />;
  }
  if (b.includes("sale") || b.includes("promo") || b.includes("discount")) {
    return <Tag className="w-3 h-3 text-black fill-black shrink-0" />;
  }
  if (b.includes("limited") || b.includes("special")) {
    return <Flame className="w-3 h-3 text-black fill-black shrink-0" />;
  }
  if (b.includes("versatile") || b.includes("flex")) {
    return <Award className="w-3 h-3 text-black fill-black shrink-0" />;
  }
  if (b.includes("powerful") || b.includes("pro") || b.includes("ranger")) {
    return <Zap className="w-3 h-3 text-black fill-black shrink-0" />;
  }
  return <ShieldAlert className="w-3 h-3 text-black shrink-0" />;
};

interface ProductCardProps {
  product: Product;
  onQuote?: () => void;
  featured?: boolean;
}

const SpecIconMap: Record<string, { icon: LucideIcon; label: string }> = {
  motor: { icon: Zap, label: "Motor" },
  battery: { icon: Battery, label: "Battery" },
  range: { icon: Gauge, label: "Range" },
  topSpeed: { icon: Gauge, label: "Top Speed" },
  weight: { icon: Weight, label: "Weight" },
  payload: { icon: Scale, label: "Payload" },
  chargeTime: { icon: Clock, label: "Charge" },
};

export const formatSpecValue = (key: string, val: string) => {
  if (key === "motor") return val.replace("Rear Hub Motor", "").trim() || val;
  return val;
};

export default function ProductCard({ product, onQuote, featured }: ProductCardProps) {
  const { addProduct, removeProduct, isSelected, selectedIds } = useCompareStore();
  const selected = isSelected(product.id);
  const canAdd = selectedIds.length < 3 || selected;

  const [activeImage, setActiveImage] = useState(product.image);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    setActiveImage(product.image);
  }, [product.image]);

  const parseColorName = (color: string) => {
    let name = color;
    const imgMatch = color.match(/\[(.*?)\]/);
    const priceMatch = color.match(/\{(.*?)\}/);
    if (imgMatch) name = name.substring(0, name.indexOf("[")).trim();
    else if (priceMatch) name = name.substring(0, name.indexOf("{")).trim();
    return name;
  };

  const getImageForColor = (color: string) => {
    const m = color.match(/\[(.*?)\]/);
    return m ? m[1] : null;
  };

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selected) removeProduct(product.id);
    else addProduct(product.id);
  };

  const primarySpecs = ["motor", "battery", "range", "topSpeed"] as const;

  return (
    <div className={`group ${featured ? "lg:col-span-1 row-span-1" : ""}`}>
      <div
        className={`relative rounded-[2px] overflow-hidden transition-all duration-500 bg-white border ${
          selected
            ? "border-black shadow-premium"
            : "border-black/5 hover:border-black/20 hover:shadow-premium"
        }`}
      >
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 bg-white backdrop-blur-md border border-black/10 text-black text-[10px] font-bold uppercase tracking-wider shadow-sm select-none">
            {getBadgeIcon(product.badge)}
            <span>{product.badge}</span>
          </div>
        )}

        {/* Compare toggle */}
        <button
          onClick={handleCompareToggle}
          disabled={!canAdd}
          title={selected ? "Remove from comparison" : "Add to comparison"}
          className={`absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-[2px] border transition-all duration-300 shadow-sm ${
            selected
              ? "bg-black border-black text-white"
              : canAdd
              ? "bg-white border-black/10 text-[#707070] hover:bg-black hover:border-black hover:text-white"
              : "bg-gray-100 border-black/5 text-gray-400 cursor-not-allowed"
          }`}
        >
          <GitCompare className="w-4 h-4" />
        </button>

        {/* Image */}
        <Link to={`/products/${product.id}`} className="block relative h-64 overflow-hidden cursor-pointer bg-[#FAFAFA]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent z-10" />
          <OptimizedImage
            src={activeImage}
            alt={product.name}
            imgClassName="transition-transform duration-700 group-hover:scale-105 object-contain p-6"
          />
          {selected && (
            <div className="absolute inset-0 bg-black/5 z-10 pointer-events-none border-2 border-black/10" />
          )}
          <div className="absolute bottom-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
            {product.videoUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setVideoOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-black text-white hover:bg-[#2C2C2C] text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all"
              >
                <Play className="w-3 h-3 fill-white" /> Play Video
              </button>
            )}
            <span className="flex items-center gap-1.5 px-3 py-2 bg-white/90 backdrop-blur-sm text-[10px] text-black font-bold uppercase tracking-wider shadow-sm">
              <Info className="w-3 h-3" /> Details
            </span>
          </div>
        </Link>

        {/* Content */}
        <div className="p-6">
          {/* Name & Tagline */}
          <div className="mb-4">
            <Link to={`/products/${product.id}`}>
              <h3 className="font-bold text-xl text-black group-hover:text-[#707070] transition-colors mb-1 tracking-tight">
                {product.name}
              </h3>
            </Link>
            <p className="text-[11px] text-[#707070] uppercase tracking-widest font-semibold">{product.tagline}</p>
          </div>

          {/* Primary Specs Grid */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {primarySpecs.map((key) => {
              const spec = SpecIconMap[key];
              const Icon = spec.icon;
              const val = product.specs[key];
              return (
                <div key={key} className="text-center p-2 bg-[#FAFAFA] border border-black/5 rounded-[2px]">
                  <Icon className="w-4 h-4 text-black mx-auto mb-1" />
                  <p className="text-[9px] text-[#707070] uppercase tracking-wider">{spec.label}</p>
                  <p className="text-[10px] font-bold text-black leading-tight mt-0.5">{formatSpecValue(key, val)}</p>
                </div>
              );
            })}
          </div>

          {/* Features as pills */}
          {product.features.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {product.features.slice(0, 4).map((f, i) => (
                <span key={i} className="px-2.5 py-1 bg-[#FAFAFA] border border-black/5 text-[10px] font-medium text-[#707070] uppercase tracking-wider">
                  {f}
                </span>
              ))}
              {product.features.length > 4 && (
                <span className="px-2.5 py-1 bg-black border border-black text-[10px] font-bold text-white uppercase tracking-wider">
                  +{product.features.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Color options */}
          {product.colors.length > 0 && (
            <div className="flex items-center gap-2 mb-5">
              <CircleDot className="w-3 h-3 text-[#707070]" />
              <div className="flex gap-2">
                {product.colors.map((c, i) => {
                  const colorName = parseColorName(c);
                  const colorImage = getImageForColor(c);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const targetImage = colorImage || product.image;
                        setActiveImage(targetImage);
                      }}
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                      title={colorName}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border ${
                          activeImage === colorImage ? "border-black scale-110" : "border-black/20"
                        }`}
                        style={{ background: c.toLowerCase().includes("white") ? "#FFFFFF" : c.toLowerCase().includes("black") ? "#000000" : c.toLowerCase().includes("red") ? "#dc2626" : c.toLowerCase().includes("blue") ? "#2563eb" : c.toLowerCase().includes("green") ? "#16a34a" : c.toLowerCase().includes("gray") || c.toLowerCase().includes("grey") ? "#6b7280" : c.toLowerCase().includes("orange") ? "#ea580c" : "#555" }}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-[10px] font-medium text-[#707070] uppercase tracking-wider">{product.colors.length} color{product.colors.length > 1 ? "s" : ""}</span>
            </div>
          )}



          {/* Compare hint */}
          {selected && (
            <div className="mb-4 px-3 py-2 bg-[#FAFAFA] border border-black/10 text-center rounded-[2px]">
              <p className="text-[10px] text-black font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Added to comparison ({selectedIds.length}/3)
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onQuote}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 font-bold text-xs uppercase tracking-widest bg-black text-white hover:bg-[#2C2C2C] active:scale-[0.98] transition-all shadow-sm rounded-[2px]"
            >
              <FileText className="w-4 h-4" />
              Get Quote
            </button>
            <Link
              to={`/products/${product.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 font-bold text-xs uppercase tracking-widest bg-white text-black hover:bg-[#FAFAFA] active:scale-[0.98] transition-all border border-black/20 hover:border-black rounded-[2px]"
            >
              <ShoppingCart className="w-4 h-4" />
              View Details
            </Link>
          </div>
        </div>
      </div>

      {videoOpen && product.videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md p-4">
          <div className="relative w-full max-w-4xl bg-white border border-black/10 shadow-premium">
            {/* Header */}
            <div className="absolute top-0 inset-x-0 p-4 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-between border-b border-black/5">
              <div>
                <h4 className="font-bold text-black text-lg tracking-tight">{product.name}</h4>
                <p className="text-[10px] text-[#707070] uppercase tracking-widest font-bold">{product.tagline}</p>
              </div>
              <button
                type="button"
                onClick={() => setVideoOpen(false)}
                className="w-10 h-10 flex items-center justify-center bg-[#FAFAFA] border border-black/10 text-black hover:bg-black hover:text-white transition-colors rounded-[2px]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Video Container */}
            <div className="aspect-video w-full bg-[#FAFAFA] pt-[72px]">
              <video
                src={product.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
