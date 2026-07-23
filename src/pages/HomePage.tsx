import { useState, useEffect } from "react";
import { trackPageView, trackCTAClick, trackQuoteModalOpen } from "@/hooks/useTracking";
import { Link } from "react-router-dom";
import {
  Zap, ChevronDown, ArrowRight, Star, Battery, Gauge, Shield,
  Users, CheckCircle, Quote, Compass, Target, Gem, Layers, HelpCircle, PhoneCall,
  ThumbsUp, Dumbbell, Leaf, Coins, Bike, Smile, MapPin, Timer, Award
} from "lucide-react";
import heroBike from "@/assets/hero-bike.jpg";
import heroSlide1 from "@/assets/hero-slide1.jpg";
import heroSlide2 from "@/assets/hero-slide2.jpg";
import urbanEbikeFleet from "@/assets/bike-delivery.jpg";

const HERO_SLIDES = [heroSlide1, heroSlide2];
import { PRODUCTS, syncLiveProducts } from "@/constants/products";
import { MOCK_TESTIMONIALS } from "@/constants/data";
import ProductCard from "@/components/features/ProductCard";
import SectionObserver from "@/components/features/SectionObserver";
import QuoteModal from "@/components/features/QuoteModal";
import BikeAssemblyAnimation from "@/components/features/BikeAssemblyAnimation";
import { CompareBar } from "@/components/features/ProductComparison";
import { useSystemSettings } from "@/hooks/useSystemSettings";



const FAQS = [
  {
    q: "Do I need a driver's license to ride a TRIP E-Bike?",
    a: "Under current LTO regulations in the Philippines, category L1a electric bicycles (max speed 25 km/h) do not require a driver's license or LTO registration. For faster categories, check our licensing guide or consult our sales specialists."
  },
  {
    q: "How long does a full charge take and how much does it cost?",
    a: "A full charge takes 4-6 hours for e-bikes and 5-6 hours for e-scooters. It costs up to ₱30 per full charge, saving you up to 90% compared to gasoline running costs."
  },
  {
    q: "What is covered under the 1-Year Warranty?",
    a: "Our comprehensive 1-year warranty covers structural frame integrity, motor components, and the lithium-ion battery management systems. We maintain complete spare parts inventories in Manila."
  },
  {
    q: "Can I customize the specifications of my fleet order?",
    a: "Yes. For corporate clients and delivery fleets, we offer custom battery capacities, heavy-duty cargo rack fittings, specialized branding layouts, and integrated GPS tracking platforms."
  }
];

export default function HomePage() {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const [faqActive, setFaqActive] = useState<number | null>(null);
  const { settings } = useSystemSettings();
  const siteTitle = settings.site_title || "TRIP Mobility";

  const [productsList, setProductsList] = useState(PRODUCTS);
  useEffect(() => {
    syncLiveProducts().then(list => setProductsList([...list]));
  }, []);

  useEffect(() => {
    const fullTitle = `${siteTitle} | Premium Electric Bikes Philippines`;
    trackPageView("/", `Home — ${fullTitle}`);
    document.title = fullTitle;
    
    const existing = document.getElementById("org-schema");
    if (!existing) {
      const script = document.createElement("script");
      script.id = "org-schema";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "TRIP Mobility",
        "url": "https://tripmobility.ph",
        "logo": "https://tripmobility.ph/favicon.svg",
        "description": "Philippines' #1 premium electric bike brand. Purpose-built e-bikes for delivery, corporate fleets, and personal mobility.",
        "foundingDate": "2022",
        "areaServed": "PH",
        "address": { "@type": "PostalAddress", "streetAddress": "105 Maryland Street, Cubao", "addressLocality": "Quezon City", "addressRegion": "Metro Manila", "postalCode": "1111", "addressCountry": "PH" }
      });
      document.head.appendChild(script);
    }
    return () => { const s = document.getElementById("org-schema"); if (s) s.remove(); };
  }, [siteTitle]);

  const handleProductQuote = (productName: string) => {
    setSelectedProduct(productName);
    trackQuoteModalOpen("product_card", productName);
    setQuoteOpen(true);
  };

  return (
    <div className="bg-white text-black">
      {/* 1. HERO */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {HERO_SLIDES.map((slide, index) => (
            <img
              key={index}
              src={slide}
              alt={`TRIP E-Bike Slide ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-80" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-12 text-center">
          <h1 className="hero-title text-black mb-6 uppercase tracking-tight">
            A new standard
            <br />
            of electric <span className="text-white">mobility</span>
          </h1>

          <p className="text-[#707070] text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Premium electric bikes engineered for the demanding Philippine road environments. From high-capacity cargo networks to responsive mountain expeditions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { trackQuoteModalOpen("hero_cta"); trackCTAClick("Get a Free Quote", "hero"); setQuoteOpen(true); }}
              className="btn-primary"
            >
              Get a Free Quote
            </button>
            <Link to="/products" className="btn-outline">
              Explore Models
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>


        </div>
      </section>

      {/* 1.5 DAILY UTILITY */}
      <section className="py-[50px] border-t border-black/5 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionObserver>
            <div className="text-center mb-20">
              <h2 className="text-[36px] font-bold text-black uppercase tracking-tight mb-4 leading-tight">
                E-Bikes Give You Everything You Need In Your Daily Lives
              </h2>
              <p className="section-label">
                Explore Possibilities Of E-Bikes
              </p>
            </div>
          </SectionObserver>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Convenience",
                desc: "Effortlessly zip around the city with E-bikes.",
                icon: ThumbsUp
              },
              {
                title: "Health and Fitness",
                desc: "Improve your health without breaking a sweat on E-bikes.",
                icon: Dumbbell
              },
              {
                title: "Environmentally Friendly",
                desc: "Go green with zero-emission E-bikes.",
                icon: Leaf
              },
              {
                title: "Cost-effective",
                desc: "Cheaper on maintenance, gas, parking fees, and insurance costs with E-bikes.",
                icon: Coins
              },
              {
                title: "Easy to Park",
                desc: "Hassle-free parking with E-bikes. No need to find spots.",
                icon: Bike
              },
              {
                title: "Less Stressful",
                desc: "Ease your stress away from traffic and enjoy your ride with E-bikes.",
                icon: Smile
              },
              {
                title: "Improved Mobility",
                desc: "Improve your mobility with E-bikes.",
                icon: MapPin
              },
              {
                title: "Faster Travel Times",
                desc: "Zoom past traffic with E-bikes. Arrive at your destination with ease.",
                icon: Timer
              }
            ].map((item, i) => (
              <SectionObserver key={i} className="h-full">
                <div className="h-full flex flex-col items-center text-center p-8 border border-black/5 bg-[#FAFAFA] hover:border-black hover:shadow-premium transition-all duration-500 rounded-[2px] group">
                  <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-6 group-hover:bg-black transition-colors duration-300">
                    <item.icon className="w-7 h-7 text-black group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-[18px] font-bold text-black uppercase tracking-wider mb-3">
                    {item.title}
                  </h3>
                  <p className="text-[14px] font-normal text-[#707070] leading-relaxed flex-1">
                    {item.desc}
                  </p>
                </div>
              </SectionObserver>
            ))}
          </div>
        </div>
      </section>

      {/* 2. BRAND STORY / WHO WE ARE */}
      <section className="relative py-[50px] overflow-hidden bg-black text-white">
        <div className="absolute inset-0 z-0">
          <img
            src={urbanEbikeFleet}
            alt="TRIP Workshop"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <SectionObserver>
            <p className="text-xs font-bold uppercase tracking-widest text-[#00B074] mb-4">
              Who We Are
            </p>
            <h2 className="text-[36px] font-bold text-white mb-16 tracking-tight leading-tight max-w-5xl">
              We Are An E-Vehicle Company That Distributes The Highest Quality Products At A Competitive Price While Providing The Highest Level Of Customer Service
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-white/10 pt-16">
              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <Award className="w-7 h-7 text-[#00B074]" />
                </div>
                <div>
                  <p className="text-zinc-300 text-[15px] leading-relaxed">
                    We aspire to be the premier Electronic bike distributor in the Philippines by distributing innovative products that can enrich the lives of our customers.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <Gem className="w-7 h-7 text-[#00B074]" />
                </div>
                <div>
                  <p className="text-zinc-300 text-[15px] leading-relaxed">
                    We commit to producing Electronic Bikes that are designed to perfectly fit your lifestyle without compromising the price and quality.
                  </p>
                </div>
              </div>
            </div>
          </SectionObserver>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section className="py-[50px] border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <SectionObserver>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20">
              <div>
                <p className="section-label mb-4">Featured Models</p>
                <h2 className="text-[36px] font-bold text-black tracking-tight leading-tight">The TRIP MOBILITY Collection</h2>
              </div>
              <Link to="/products" className="text-sm font-semibold uppercase tracking-widest text-black hover:text-[#707070] transition-colors mt-6 md:mt-0 flex items-center gap-2 border-b border-black pb-1 hover:border-[#707070]">
                View Catalog <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </SectionObserver>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {productsList.slice(0, 3).map((product) => (
              <SectionObserver key={product.id}>
                <ProductCard
                  product={product}
                  onQuote={() => handleProductQuote(product.name)}
                />
              </SectionObserver>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE TRIP */}
      <section className="py-[50px] border-t border-black/5 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6">
          <SectionObserver>
            <div className="text-center mb-20">
              <p className="section-label mb-4">Unrivaled Standards</p>
              <h2 className="text-[36px] font-bold text-black leading-tight">Why Choose TRIP MOBILITY</h2>
            </div>
          </SectionObserver>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "4-6h / 5-6h Charge Time",
                desc: "4-6 hours for e-bikes and 5-6 hours for e-scooters using our high-speed smart chargers.",
                icon: Battery
              },
              {
                title: "80-95 / 40-50 km/h Speed",
                desc: "80–95 km/h peak speed for e-scooters, and 40-50 km/h for e-bikes.",
                icon: Gauge
              },
              {
                title: "Tailored Fleet Specs",
                desc: "We offer customized configurations for cargo capacity, branding layouts, and high-capacity battery units.",
                icon: Layers
              },
              {
                title: "Up to ₱30 Per Full Charge",
                desc: "Unmatched operational economics, saving commercial fleets and commuters thousands in transport costs daily.",
                icon: Zap
              },
              {
                title: "120km Maximum Range",
                desc: "Long-range cells with optimized battery management systems to easily last entire commercial shifts.",
                icon: Compass
              },
              {
                title: "1-Year Domestic Warranty",
                desc: "Direct support covering chassis, high-torque hub motor setups, and lithium battery cells.",
                icon: Shield
              }
            ].map((item, i) => (
              <SectionObserver key={i} className="h-full">
                <div className="h-full flex flex-col border border-black/5 p-10 bg-white hover:border-black/20 hover:shadow-premium transition-all duration-500 rounded-[2px]">
                  <div className="w-12 h-12 rounded-[2px] bg-black/5 flex items-center justify-center mb-6 group hover:bg-black transition-colors duration-300">
                    <item.icon className="w-6 h-6 text-black group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-bold text-black uppercase tracking-tight mb-4">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#707070] leading-relaxed flex-1">
                    {item.desc}
                  </p>
                </div>
              </SectionObserver>
            ))}
          </div>
        </div>
      </section>

      {/* 4.5 ASSEMBLED FOR PERFORMANCE */}
      <BikeAssemblyAnimation />


      {/* 7. PREMIUM FEATURES */}
      <section className="py-[50px] border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <SectionObserver>
            <div className="text-center mb-20">
              <p className="section-label mb-4">Premium Utility</p>
              <h2 className="section-title text-black">Standard Enhancements</h2>
            </div>
          </SectionObserver>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Regenerative Braking", desc: "Recovers electrical energy during deceleration, expanding single-charge ranges." },
              { title: "Anti-Theft Smart Locks", desc: "Integrated mechanical rear hub block and electronic motor isolation controllers." },
              { title: "Real-time Fleet Tracking", desc: "Allows instant location audits, historical route mapping, and geofence alarms." },
              { title: "Puncture Resistant Tires", desc: "Kevlar-reinforced rubber layers designed to prevent flat hazards." }
            ].map((feat, i) => (
              <SectionObserver key={i}>
                <div className="border border-black/5 p-8 bg-[#FAFAFA] hover:bg-white hover:shadow-premium transition-all duration-500 h-full rounded-[2px]">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-3">{feat.title}</h3>
                  <p className="text-sm text-[#707070] leading-relaxed">{feat.desc}</p>
                </div>
              </SectionObserver>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CUSTOMER BENEFITS */}
      <section className="py-[50px] border-t border-black/5 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6">
          <SectionObserver>
            <div className="text-center mb-20">
              <p className="section-label mb-4">Daily Impact</p>
              <h2 className="section-title text-black">Customer Benefits</h2>
            </div>
          </SectionObserver>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[
              { title: "Commute Efficiency", desc: "Bypass traffic congestion with access to bicycle path lanes." },
              { title: "Low Maintenance Cost", desc: "No complex engines, oil replacements, or timing belt adjustments." },
              { title: "Eco-Friendly Operations", desc: "Zero exhaust output allows zero-emission urban supply distributions." },
              { title: "Physical Wellness", desc: "Enables active exercise routines with customizable pedal-assist modes." },
              { title: "Stress Relief", desc: "Escape high traffic jams, fuel price spikes, and route cancellations." },
              { title: "Flexible Parking", desc: "Compact footprint allows easy lockups in narrow slots and corridors." },
              { title: "Urban Reach", desc: "Increases courier transit radius and overall daily delivery counts." },
              { title: "Reliability", desc: "Heavy-duty parts designed to secure continuous operation all season." }
            ].map((benefit, i) => (
              <SectionObserver key={i}>
                <div className="border border-black/5 bg-white p-8 hover:border-black/20 hover:shadow-premium transition-all duration-500 rounded-[2px] h-full">
                  <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-3">{benefit.title}</h3>
                  <p className="text-sm text-[#707070] leading-relaxed">{benefit.desc}</p>
                </div>
              </SectionObserver>
            ))}
          </div>
        </div>
      </section>


      {/* 10. COMPARISON */}
      <section className="py-[50px] border-t border-black/5 bg-[#FAFAFA]">
        <div className="max-w-5xl mx-auto px-6">
          <SectionObserver>
            <div className="text-center mb-20">
              <p className="section-label mb-4">Comparison Audit</p>
              <h2 className="section-title text-black">E-Bike vs Motor-Bike</h2>
            </div>
          </SectionObserver>

          <SectionObserver>
            <div className="overflow-x-auto border border-black/10 bg-white rounded-[2px] shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/10 bg-[#FAFAFA]">
                    <th className="p-6 text-xs font-bold text-black uppercase tracking-wider">Features</th>
                    <th className="p-6 text-xs font-bold text-black uppercase tracking-wider">TRIP E-Bike</th>
                    <th className="p-6 text-xs font-bold text-[#707070] uppercase tracking-wider">Gasoline Motorbike</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {[
                    { feature: "Operating Cost", ebike: "Approximately ₱30 per full charge", motor: "Php 50-100+ per 100km" },
                    { feature: "TRIP Electric Bikes", ebike: "No driver's license required.", motor: "Mandatory LTO plate & license" },
                    { feature: "TRIP Electric Scooters (S90 & E4)", ebike: "Driver's license is required.", motor: "Mandatory LTO plate & license" },
                    { feature: "Exhaust Emissions", ebike: "Zero greenhouse output", motor: "Constant carbon monoxide emissions" },
                    { feature: "Maintenance Standard", ebike: "Minimal brake pad & tire changes", motor: "Frequent engine oil, filters & plug tuneups" },
                    { feature: "Corridor Access", ebike: "Permitted on bike paths & green zones", motor: "Strictly limited to vehicular roads" }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#FAFAFA] transition-colors">
                      <td className="p-6 text-sm text-black font-semibold uppercase tracking-wider">{row.feature}</td>
                      <td className="p-6 text-sm text-black font-medium">{row.ebike}</td>
                      <td className="p-6 text-sm text-[#707070]">{row.motor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionObserver>
        </div>
      </section>

      {/* 11. TESTIMONIALS */}
      <section className="py-[50px] border-t border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <SectionObserver>
            <div className="text-center mb-20">
              <p className="section-label mb-4">Client Verifications</p>
              <h2 className="section-title text-black">Trusted by Thousands</h2>
            </div>
          </SectionObserver>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {MOCK_TESTIMONIALS.map((t) => (
              <SectionObserver key={t.id}>
                <div className="border border-black/5 p-8 bg-[#FAFAFA] flex flex-col justify-between h-full rounded-[2px]">
                  <div>
                    <Quote className="w-6 h-6 text-black/20 mb-6" />
                    <p className="text-black text-sm leading-relaxed mb-8 font-medium">"{t.review}"</p>
                  </div>
                  <div>
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-black fill-black" />
                      ))}
                    </div>
                    <p className="font-bold text-black text-sm uppercase tracking-wider mb-1">{t.name}</p>
                    <p className="text-xs font-semibold text-[#707070] uppercase tracking-widest">{t.role} · {t.company}</p>
                  </div>
                </div>
              </SectionObserver>
            ))}
          </div>
        </div>
      </section>



      <QuoteModal
        open={quoteOpen}
        onClose={() => { setQuoteOpen(false); setSelectedProduct(undefined); }}
        preselectedProduct={selectedProduct}
      />

      <CompareBar onOpen={() => {
        window.location.href = '/compare';
      }} />
    </div>
  );
}

