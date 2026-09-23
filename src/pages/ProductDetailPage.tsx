import { useState, useEffect } from "react";
import { trackProductView, trackCTAClick } from "@/hooks/useTracking";
import { useParams, Link, Navigate } from "react-router-dom";
import ProductReviews from "@/components/features/ProductReviews";
import CustomerAuthModal from "@/components/features/CustomerAuthModal";
import {
  Battery, Gauge, Zap, Shield, ChevronDown, ChevronUp, RotateCcw,
  Package, Wrench, MapPin, Clock, Weight, Scale, Star, Truck,
  BadgeCheck, Heart, Info, ChevronRight, Film, Play, X, Download, Share2
} from "lucide-react";
import { PRODUCTS, syncLiveProducts } from "@/constants/products";
import { Product } from "@/types";
import QuoteModal from "@/components/features/QuoteModal";
import SectionObserver from "@/components/features/SectionObserver";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { toast } from "sonner";
import OptimizedImage from "@/components/features/OptimizedImage";



const FAQ_ITEMS = [
  { q: "What is included in the warranty?", a: "All TRIP e-bikes come with a 1-year frame warranty, 1-year motor warranty, and 1-year battery warranty. This covers manufacturing defects and component failures under normal use." },
  { q: "How long does delivery take?", a: "Metro Manila: 2–3 business days. Provincial: 5–7 business days. Fleet orders of 10+ units: 2–3 weeks including pre-delivery inspection and branding." },
  { q: "Can I test ride before buying?", a: "Yes! Visit our flagship showroom in Mandaluyong City. Test rides are available Mon–Sat 9am–5pm. Contact us to schedule an appointment." },
  { q: "Is financing available?", a: "Yes. We offer installment plans starting at 20% down with 12–36 month terms through our banking partners. Fleet clients can access up to 60-month terms." },
  { q: "How do I charge the battery?", a: "Simply plug the charger into any standard Philippine 220V outlet. A full charge takes 5–6 hours. The smart BMS prevents overcharging automatically." },
  { q: "Is the bike waterproof?", a: "The motor, controller, and battery are IP65-rated, making them splash and rain resistant. We do not recommend deep water immersion or pressure washing." },
];

const TRUST_BADGES = [
  { icon: Truck, label: "Free Metro Manila Delivery", desc: "2–3 business days" },
  { icon: BadgeCheck, label: "Official Philippines Warranty", desc: "1-year frame coverage" },
  { icon: Wrench, label: "72-Point QC Inspection", desc: "Pre-delivery certified" },
];

const SPEC_META: Record<string, { label: string; icon: any }> = {
  motor: { label: "Motor", icon: Zap },
  battery: { label: "Battery", icon: Battery },
  range: { label: "Range", icon: Gauge },
  topSpeed: { label: "Top Speed", icon: Gauge },
  weight: { label: "Weight", icon: Weight },
  payload: { label: "Payload", icon: Scale },
  chargeTime: { label: "Charge Time", icon: Clock },
  frame: { label: "Frame", icon: Package },
  brakes: { label: "Brakes", icon: Shield },
  tires: { label: "Tires", icon: MapPin },
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"features" | "specs" | "usecases" | "video">("features");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [descExpanded, setDescExpanded] = useState(false);

  const [isChangingColor, setIsChangingColor] = useState(false);
  const [displayImage, setDisplayImage] = useState("");
  const [displayPrice, setDisplayPrice] = useState(0);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const { customer } = useCustomerAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [pendingFavoriteAfterLogin, setPendingFavoriteAfterLogin] = useState(false);

  useEffect(() => {
    syncLiveProducts().then(list => setProductsList(list as Product[]));
  }, []);

  const product = productsList.find((p) => p.id === id);

  useEffect(() => {
    if (!product) return;
    
    const imgUrl = getImageForColor(selectedColor) || product.image;
    const priceMatch = selectedColor.match(/\{(.*?)\}/);
    const priceVal = priceMatch ? parseFloat(priceMatch[1]) : product.price;

    if (!displayImage) {
      setDisplayImage(imgUrl);
      setDisplayPrice(priceVal);
      return;
    }

    setIsChangingColor(true);
    const timer = setTimeout(() => {
      setDisplayImage(imgUrl);
      setDisplayPrice(priceVal);
      setIsChangingColor(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedColor, product?.id]);

  useEffect(() => {
    if (product) {
      trackProductView(product.name, product.id, product.price);
      if (!selectedColor && product.colors?.length > 0) {
        setSelectedColor(product.colors[0]);
      }
    }
  }, [product?.id]);

  useEffect(() => {
    if (!customer?.id) {
      setFavorites([]);
      return;
    }
    const docRef = doc(db, "profiles", customer.id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFavorites(data?.favorites || []);
      }
    });
    return () => unsubscribe();
  }, [customer?.id]);

  useEffect(() => {
    if (customer?.id && pendingFavoriteAfterLogin && product) {
      setPendingFavoriteAfterLogin(false);
      toggleFavorite(product.id, customer.id);
    }
  }, [customer?.id, pendingFavoriteAfterLogin, product]);

  const toggleFavorite = async (productId: string, customerId: string) => {
    try {
      const docRef = doc(db, "profiles", customerId);
      const isFav = favorites.includes(productId);
      await updateDoc(docRef, {
        favorites: isFav ? arrayRemove(productId) : arrayUnion(productId)
      });
      toast.success(isFav ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Failed to update favorites");
    }
  };

  const handleDownloadBrochure = () => {
    if (product?.brochureUrl) {
      const link = document.createElement("a");
      link.href = product.brochureUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = `${product.name}_brochure`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Downloading brochure...");
    } else {
      toast.error("Brochure has not been uploaded yet.");
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.tagline,
        url: shareUrl,
      }).catch(err => console.log(err));
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => toast.success("Product link copied to clipboard!"))
        .catch(() => toast.error("Failed to copy link."));
    }
  };

  if (productsList.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-32">
        <div className="max-w-7xl mx-auto px-6 animate-pulse">
          <div className="h-4 bg-black/5 rounded w-48 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
            <div className="h-[400px] bg-black/5 rounded-[2px]" />
            <div className="space-y-4">
              <div className="h-3 bg-black/5 rounded w-24" />
              <div className="h-8 bg-black/5 rounded w-3/4" />
              <div className="h-4 bg-black/5 rounded w-full" />
              <div className="h-20 bg-black/5 rounded w-full mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <Navigate to="/products" replace />;

  const relatedProducts = productsList.filter((p) => p.id !== product.id);

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

  const descLimit = 180;
  const description = product.description;
  const needsTruncation = description.length > descLimit;

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Breadcrumb */}
      <div className="pt-28 pb-4 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 text-[10px] text-[#707070] uppercase tracking-widest font-semibold">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-black transition-colors">Models</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-black font-bold">{product.name}</span>
        </div>
      </div>

      {/* Main Content Layout with Sticky Gallery */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Left: Sticky Gallery */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="relative border border-black/5 p-2 bg-[#FAFAFA]">
                {product.badge && (
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1 bg-white text-black text-[10px] font-bold rounded-[2px] uppercase tracking-wider shadow-sm">
                    <Star className="w-3 h-3 fill-black" />
                    {product.badge}
                  </div>
                )}
                <div className="relative overflow-hidden bg-white aspect-[4/3] border border-black/5">
                  <OptimizedImage
                    src={displayImage || getImageForColor(selectedColor) || product.image}
                    alt={`${product.name} - ${parseColorName(selectedColor)}`}
                    className="w-full aspect-[4/3] object-contain p-8"
                    imgClassName={`transition-all duration-300 ${isChangingColor ? "opacity-30 blur-[2px]" : ""}`}
                  />
                  
                  {product.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <button 
                        onClick={() => setVideoModalOpen(true)}
                        className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm border border-black/10 text-black flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300 shadow-premium"
                        title="Watch Showreel"
                      >
                        <Play className="w-5 h-5 ml-0.5 fill-current" />
                      </button>
                    </div>
                  )}


                </div>

                {/* Gallery Thumbnails */}
                {product.galleryImages && product.galleryImages.length > 0 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-none">
                    {[product.image, ...product.galleryImages].map((imgUrl, idx) => {
                      const isSelected = displayImage === imgUrl || (!displayImage && idx === 0);
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (displayImage === imgUrl) return;
                            setIsChangingColor(true);
                            setTimeout(() => {
                              setDisplayImage(imgUrl);
                              setIsChangingColor(false);
                            }, 200);
                          }}
                          className={`w-20 h-16 bg-white border overflow-hidden shrink-0 transition-all ${
                            isSelected ? "border-black shadow-sm" : "border-black/5 hover:border-black/20"
                          }`}
                        >
                          <OptimizedImage src={imgUrl} alt="gallery thumbnail" className="object-contain w-full h-full p-2" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Dynamic specs variables grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                {[
                  { key: "motor", val: product.specs.motor?.replace("Rear Hub Motor", "").trim() || product.specs.motor },
                  { key: "battery", val: product.specs.battery },
                  { key: "range", val: product.specs.range },
                  { key: "topSpeed", val: product.specs.topSpeed },
                ].map(({ key, val }) => {
                  const meta = SPEC_META[key];
                  return (
                    <div key={key} className="border border-black/5 p-4 text-center bg-[#FAFAFA]">
                      <p className="text-[9px] text-[#707070] uppercase tracking-widest font-semibold mb-1">
                        {meta?.label || key}
                      </p>
                      <p className="text-[11px] font-bold text-black uppercase tracking-wider">{val}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Scrolling Details Panel */}
            <div>
              {product.tagline && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tagline.split(",").map((tag: string) => (
                    <span key={tag} className="text-[9px] font-bold text-[#707070] bg-[#FAFAFA] border border-black/5 px-3 py-1 uppercase tracking-widest">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="text-[35px] font-bold text-black mb-6 tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="mb-6">
                <p className="text-[#707070] text-sm leading-relaxed font-medium">
                  {needsTruncation && !descExpanded ? description.slice(0, descLimit) + "..." : description}
                </p>
                {needsTruncation && (
                  <button
                    onClick={() => setDescExpanded(!descExpanded)}
                    className="mt-2 text-xs text-black hover:text-[#707070] hover:underline uppercase tracking-wider font-bold transition-colors"
                  >
                    {descExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </div>

              {/* Color variation selectors */}
              <div className="mt-8 mb-8 border-t border-black/5 pt-8">
                <p className="text-[10px] text-[#707070] uppercase tracking-widest font-bold mb-4">Available Configurations</p>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => {
                    const name = parseColorName(color);
                    const isSelected = selectedColor === color;
                    const imgUrl = getImageForColor(color);

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`flex items-center gap-3 px-4 py-2 border text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                          isSelected
                            ? "bg-black text-white border-black"
                            : "bg-[#FAFAFA] text-[#707070] border-black/5 hover:border-black/20 hover:text-black hover:bg-white"
                        }`}
                      >
                        {imgUrl ? (
                          <img src={imgUrl} alt={name} className="w-5 h-5 rounded-full object-cover border border-black/10 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-black/20 shrink-0" style={{
                            background: name.toLowerCase().includes("white") ? "#fff" : name.toLowerCase().includes("black") ? "#111" : "#555"
                          }} />
                        )}
                        <span>{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom specs/pricing section */}
              <div className="border border-black/5 p-6 mb-8 bg-[#FAFAFA] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                <div className="text-left text-[10px] uppercase tracking-wider text-[#707070] font-bold space-y-2">
                  <p className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-black" />
                    1-Year Premium Warranty
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-black" />
                    Rapid Servicing Guaranteed
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button
                  onClick={() => { trackCTAClick("Get a Quote", "product_detail", "quote_modal"); setQuoteOpen(true); }}
                  className="btn-primary flex-1 h-14 text-xs font-bold uppercase tracking-widest"
                >
                  Request Quote Profile
                </button>
                <button
                  onClick={() => {
                    if (!customer) {
                      setPendingFavoriteAfterLogin(true);
                      setAuthModalOpen(true);
                    } else {
                      toggleFavorite(product.id, customer.id);
                    }
                  }}
                  className={`flex-1 h-14 flex items-center justify-center gap-2 border text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    favorites.includes(product.id)
                      ? "bg-black text-white border-black"
                      : "bg-[#FAFAFA] text-[#707070] border-black/5 hover:border-black hover:text-black hover:bg-white"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? "fill-white text-white" : ""}`} />
                  {favorites.includes(product.id) ? "Remove Saved" : "Save Model"}
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadBrochure}
                    className="w-14 h-14 flex items-center justify-center bg-[#FAFAFA] border border-black/5 text-[#707070] hover:text-black hover:border-black hover:bg-white transition-all"
                    title="Download Specifications PDF"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-14 h-14 flex items-center justify-center bg-[#FAFAFA] border border-black/5 text-[#707070] hover:text-black hover:border-black hover:bg-white transition-all"
                    title="Share model link"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Service Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-black/5 pt-8">
                {TRUST_BADGES.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div key={badge.label} className="border border-black/5 p-5 bg-[#FAFAFA] hover:border-black transition-colors duration-300">
                      <Icon className="w-5 h-5 text-black mb-3" />
                      <p className="text-[10px] font-bold text-black uppercase tracking-wider leading-tight mb-1">{badge.label}</p>
                      <p className="text-[10px] text-[#707070] font-medium">{badge.desc}</p>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Full Premium Specifications Section */}
      <section className="py-[50px] bg-[#FAFAFA] border-t border-b border-black/5">
        <div className="max-w-4xl mx-auto px-6">
          
          <div className="flex gap-2 border-b border-black/5 mb-8 overflow-x-auto pb-0">
            {([
              product.videoUrl ? { id: "video", label: "Showreel" } : null,
              { id: "features", label: "Core Features" },
              { id: "specs", label: "Technical Specifications" },
              { id: "usecases", label: "Logistics Use Cases" },
            ].filter(Boolean) as any[]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-[11px] uppercase tracking-wider font-bold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-black text-black"
                    : "border-transparent text-[#707070] hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>



          {activeTab === "video" && product.videoUrl && (
            <div className="aspect-video w-full border border-black/5 bg-black">
              <video src={product.videoUrl} controls className="w-full h-full object-contain" />
            </div>
          )}

          {activeTab === "features" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.features.map((feat, i) => (
                <div key={i} className="border border-black/5 p-5 bg-white flex gap-4 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-black mt-2 shrink-0" />
                  <p className="text-[13px] text-[#2C2C2C] font-medium leading-relaxed">{feat}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "specs" && (
            <div className="border border-black/5 bg-white">
              {Object.entries(product.specs)
                .filter(([key, value]) => {
                  if (!value || value === "--") return false;
                  if (key === "motor" && product.specs["Motor Power"]) return false;
                  if (key === "battery" && product.specs["Battery specifications"]) return false;
                  if (key === "range" && product.specs["Range"]) return false;
                  if (key === "topSpeed" && (product.specs["Max Speed"] || product.specs["top_speed"])) return false;
                  if (key === "payload" && product.specs["Load Capacity"]) return false;
                  if (key === "chargeTime" && (product.specs["Charging Time"] || product.specs["chargingTime"] || product.specs["charge_time"])) return false;
                  return true;
                })
                .map(([key, value]) => {
                  const meta = SPEC_META[key];
                  return (
                    <div key={key} className="flex justify-between items-center py-5 px-6 border-b last:border-0 border-black/5 hover:bg-[#FAFAFA] transition-colors">
                      <span className="text-[11px] text-[#707070] uppercase tracking-widest font-bold">
                        {meta?.label || key}
                      </span>
                      <span className="text-[13px] text-black uppercase font-bold tracking-wider">{String(value)}</span>
                    </div>
                  );
                })}
            </div>
          )}

          {activeTab === "usecases" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.useCases.map((useCase, i) => (
                <div key={i} className="border border-black/5 p-5 bg-white flex items-center gap-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-black" />
                  <p className="text-xs font-bold uppercase tracking-wider text-black">{useCase}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* FAQ */}
      <section className="py-[50px] border-b border-black/5 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <SectionObserver>
            <h2 className="section-title text-center text-black mb-16">Support Clarifications</h2>
          </SectionObserver>
          <div className="divide-y divide-black/5 border-t border-b border-black/5">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i} className="py-5">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between text-left py-2 hover:text-[#707070] transition-colors"
                >
                  <span className="text-xs font-bold text-black uppercase tracking-wider">{faq.q}</span>
                  <span className="text-lg text-black font-light shrink-0 ml-4">
                    {openFaq === i ? "—" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <p className="text-[13px] text-[#707070] font-medium leading-relaxed mt-4 pl-1 pb-2">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-[50px] bg-[#FAFAFA]">
        <div className="max-w-3xl mx-auto px-6">
          <ProductReviews
            productId={product.id}
            productName={product.name}
            onRequestAuth={() => setAuthModalOpen(true)}
          />
        </div>
      </section>

      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} preselectedProduct={product.name} />
      <CustomerAuthModal
        open={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingFavoriteAfterLogin(false);
        }}
        onSuccess={() => setAuthModalOpen(false)}
        title={pendingFavoriteAfterLogin ? "Sign In to Favorite" : "Sign In to Review"}
        subtitle={pendingFavoriteAfterLogin ? "Create a free TRIP account or sign in to add this model to your favorites." : "Create a free TRIP account or sign in to write a review for this product."}
      />

      {/* Video Overlay */}
      {videoModalOpen && product.videoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-md">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setVideoModalOpen(false)} />
          <div className="relative w-full max-w-4xl border border-black/10 bg-white p-1 z-10 shadow-premium">
            <div className="flex items-center justify-between px-5 py-3 border-b border-black/5 bg-[#FAFAFA]">
              <span className="text-[10px] font-bold tracking-widest uppercase text-black">{product.name} showreel</span>
              <button onClick={() => setVideoModalOpen(false)} className="text-[#707070] hover:text-black transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-[#FAFAFA]">
              <video src={product.videoUrl} controls autoPlay className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

