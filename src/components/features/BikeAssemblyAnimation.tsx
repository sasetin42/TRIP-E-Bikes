import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import heroBike from "@/assets/hero-bike.jpg";
import adminBg from "@/assets/admin-bg.jpg";
import { syncLiveProducts } from "@/constants/products";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  duration?: number;
  active: boolean;
}

function AnimatedCounter({ target, suffix = "", duration = 2000, active }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);

  return <span>{count}{suffix}</span>;
}

const MODELS_DATA = {
  cargo: {
    name: "Cargo Pro",
    fullName: "TRIP Cargo Pro",
    tagline: "Engineered for the Last Mile",
    metrics: [
      { label: "Max Range", value: 120, suffix: "km", color: "#FFFFFF", barWidth: 100 },
      { label: "Top Speed", value: 45, suffix: "km/h", color: "#FFFFFF", barWidth: 75 },
      { label: "Motor Power", value: 500, suffix: "W", color: "#FFFFFF", barWidth: 66 },
      { label: "Payload", value: 180, suffix: "kg", color: "#FFFFFF", barWidth: 100 },
    ],
    stats: [
      { label: "CO₂ Saved/Year", value: "1.2T" },
      { label: "Fuel Cost Saved", value: "₱0/day" },
      { label: "Charge Time", value: "5–6 hrs" },
      { label: "Service Life", value: "8+ Years" },
    ],
    details: [
      { label: "Frame Material", value: "High-tensile Steel Alloy" },
      { label: "Brake System", value: "Hydraulic Disc Brakes" },
      { label: "Tire Specifications", value: '26" × 4.0" Puncture Fat Tires' },
    ]
  },
  fold: {
    name: "Fold X",
    fullName: "TRIP Fold X",
    tagline: "Compact Power, Limitless Freedom",
    metrics: [
      { label: "Max Range", value: 50, suffix: "km", color: "#FFFFFF", barWidth: 41 },
      { label: "Top Speed", value: 40, suffix: "km/h", color: "#FFFFFF", barWidth: 66 },
      { label: "Motor Power", value: 500, suffix: "W", color: "#FFFFFF", barWidth: 66 },
      { label: "Payload", value: 120, suffix: "kg", color: "#FFFFFF", barWidth: 66 },
    ],
    stats: [
      { label: "CO₂ Saved/Year", value: "0.8T" },
      { label: "Fuel Cost Saved", value: "₱0/day" },
      { label: "Charge Time", value: "4–5 hrs" },
      { label: "Service Life", value: "6+ Years" },
    ],
    details: [
      { label: "Frame Material", value: "Aerospace Aluminum Alloy" },
      { label: "Brake System", value: "Mechanical Disc Brakes" },
      { label: "Tire Specifications", value: '20" × 4.0" Foldable Fat Tires' },
    ]
  },
  ranger: {
    name: "Ranger 750",
    fullName: "TRIP Ranger 750",
    tagline: "Conquer Every Terrain",
    metrics: [
      { label: "Max Range", value: 60, suffix: "km", color: "#FFFFFF", barWidth: 50 },
      { label: "Top Speed", value: 50, suffix: "km/h", color: "#FFFFFF", barWidth: 83 },
      { label: "Motor Power", value: 750, suffix: "W", color: "#FFFFFF", barWidth: 100 },
      { label: "Payload", value: 150, suffix: "kg", color: "#FFFFFF", barWidth: 83 },
    ],
    stats: [
      { label: "CO₂ Saved/Year", value: "1.0T" },
      { label: "Fuel Cost Saved", value: "₱0/day" },
      { label: "Charge Time", value: "5–6 hrs" },
      { label: "Service Life", value: "8+ Years" },
    ],
    details: [
      { label: "Frame Material", value: "Steel Alloy MTB Frame" },
      { label: "Brake System", value: "Hydraulic Disc Brakes" },
      { label: "Tire Specifications", value: '26" × 4.0" All-Terrain Tires' },
    ]
  }
};

export default function BikeAssemblyAnimation() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    syncLiveProducts().then(list => {
      if (list && list.length > 0) {
        setLiveProducts(list.slice(0, 3));
      }
    });
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !active) {
          setActive(true);
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [active]);

  // Fallback static data if live products are not loaded yet
  const activeProduct = liveProducts[selectedIdx];
  
  const getNumericValue = (valStr: string) => {
    if (!valStr) return 0;
    const num = parseInt(valStr.replace(/[^0-9]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const getMetricData = () => {
    if (!activeProduct) {
      return {
        name: "Cargo Pro",
        metrics: [
          { label: "Max Range", value: 120, suffix: "km", color: "#FFFFFF", barWidth: 100 },
          { label: "Top Speed", value: 45, suffix: "km/h", color: "#FFFFFF", barWidth: 75 },
          { label: "Motor Power", value: 500, suffix: "W", color: "#FFFFFF", barWidth: 66 },
          { label: "Payload", value: 180, suffix: "kg", color: "#FFFFFF", barWidth: 100 },
        ],
        stats: [
          { label: "CO₂ Saved/Year", value: "1.2T" },
          { label: "Fuel Cost Saved", value: "₱0/day" },
          { label: "Charge Time", value: "5–6 hrs" },
          { label: "Service Life", value: "8+ Years" },
        ],
        details: [
          { label: "Frame Material", value: "High-tensile Steel Alloy" },
          { label: "Brake System", value: "Hydraulic Disc Brakes" },
          { label: "Tire Specifications", value: '26" × 4.0" Puncture Fat Tires' },
        ],
        image: heroBike,
        videoUrl: null
      };
    }

    const s = activeProduct.specs || {};
    const rangeVal = getNumericValue(s.range || "120");
    const speedVal = getNumericValue(s.topSpeed || "45");
    const motorVal = getNumericValue(s.motor || "500");
    const payloadVal = getNumericValue(s.payload || "180");

    // Dynamic bar calculation percentages relative to standard maximum parameters
    const rangePercent = Math.min(Math.round((rangeVal / 150) * 100), 100);
    const speedPercent = Math.min(Math.round((speedVal / 60) * 100), 100);
    const motorPercent = Math.min(Math.round((motorVal / 1000) * 100), 100);
    const payloadPercent = Math.min(Math.round((payloadVal / 220) * 100), 100);

    return {
      name: activeProduct.name,
      metrics: [
        { label: "Max Range", value: rangeVal, suffix: "km", color: "#FFFFFF", barWidth: rangePercent },
        { label: "Top Speed", value: speedVal, suffix: "km/h", color: "#FFFFFF", barWidth: speedPercent },
        { label: "Motor Power", value: motorVal, suffix: "W", color: "#FFFFFF", barWidth: motorPercent },
        { label: "Payload", value: payloadVal, suffix: "kg", color: "#FFFFFF", barWidth: payloadPercent },
      ],
      stats: [
        { label: "CO₂ Saved/Year", value: rangeVal > 80 ? "1.2T" : rangeVal > 55 ? "1.0T" : "0.8T" },
        { label: "Fuel Cost Saved", value: "₱0/day" },
        { label: "Charge Time", value: s.chargeTime || s.chargingTime || "5–6 hrs" },
        { label: "Service Life", value: "8+ Years" },
      ],
      details: [
        { label: "Frame Material", value: s.frame || "High-tensile Alloy" },
        { label: "Brake System", value: s.brakes || "Hydraulic Disc Brakes" },
        { label: "Tire Specifications", value: s.tires || '26" × 4.0" Fat Tires' },
      ],
      image: activeProduct.image || heroBike,
      videoUrl: activeProduct.videoUrl || null
    };
  };

  const currentData = getMetricData();

  return (
    <section
      ref={sectionRef}
      className="py-24 relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${adminBg})` }}
    >
      {/* Overlay to ensure perfect text readability */}
      <div className="absolute inset-0 bg-black/80"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
    <div className="text-center mb-16">
          <p className="section-label mb-3">Engineering Excellence</p>
          <h2 className="font-bold text-4xl sm:text-5xl text-white">
            Assembled for <span>Performance</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Every TRIP e-bike is precision-engineered with premium components that work together for an unmatched riding experience.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: YouTube Video Embed Container */}
          <div className="relative flex flex-col gap-4">
            <div className="text-left mb-1">
              <h3 className="font-bold text-xl sm:text-2xl text-white tracking-tight uppercase">
                Have the Ride of <span className="text-white">Your Life</span>
              </h3>
              <p className="text-xs font-bold text-[#00B074] uppercase tracking-widest mt-1">
                Conquer the Road in Style
              </p>
            </div>
            
            <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <div className="bg-[#0A0A0A] aspect-video relative group">
                {!isPlaying ? (
                  <div 
                    onClick={() => setIsPlaying(true)}
                    className="relative w-full h-full cursor-pointer overflow-hidden group/thumb"
                  >
                    <img 
                      src={currentData.image} 
                      alt="Video Thumbnail" 
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-700 brightness-[0.75]" 
                    />
                    {/* Glowing play overlay core */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/thumb:bg-black/10 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-white border border-white/20 flex items-center justify-center group-hover/thumb:scale-110 transition-all duration-300 shadow-lg shadow-black/50">
                        <Play className="w-6 h-6 text-black" fill="black" />
                      </div>
                    </div>
                    {/* Badge */}
                    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/85 border border-white/10">
                      <span className="w-2 h-2 rounded-full bg-[#00B074] animate-pulse" />
                      <span className="text-[10px] text-white font-bold uppercase tracking-wider">
                        {currentData.videoUrl ? "Play HD Product Video" : "Play Road Test Demo"}
                      </span>
                    </div>
                  </div>
                ) : (
                  currentData.videoUrl ? (
                    <video 
                      src={currentData.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-cover bg-black"
                    />
                  ) : (
                    <iframe
                      className="w-full h-full object-cover"
                      src="https://www.youtube.com/embed/SZpn9iVLQIU?autoplay=1&si=e2n_TqC729KxG-bX"
                      title="TRIP E-Bikes Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  )
                )}
              </div>
            </div>
            {/* Play video notice */}
            <div className="text-center">
              <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">
                🎥 Featuring: {currentData.videoUrl ? `${currentData.name} HD Video Showcase` : "Assembly and Road test demonstration"}
              </p>
            </div>
          </div>

          {/* Right: Performance metrics */}
          <div className="space-y-6">
            {/* Model Switcher Tab Header */}
            <div className="flex flex-col sm:flex-row gap-2 p-1.5 rounded-xl bg-black/40 border border-white/5 items-stretch sm:items-center">
              {liveProducts.length > 0 ? (
                liveProducts.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedIdx(idx);
                      setIsPlaying(false);
                    }}
                    className={`flex-1 py-2.5 px-3 flex items-center justify-center rounded-lg text-[11px] font-semibold transition-all duration-300 text-center leading-tight ${
                      selectedIdx === idx
                        ? "bg-white text-black font-bold scale-[1.02]"
                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {p.name.replace("Electric Bike", "").replace("E-Bike", "").trim()}
                  </button>
                ))
              ) : (
                <div className="flex-1 text-center text-sm text-gray-500 font-semibold py-2">Loading live models...</div>
              )}
            </div>

            {/* Metrics List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {currentData.metrics.map((metric, i) => (
                <div
                  key={metric.label}
                  className="relative"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{metric.label}</p>
                    <p className="font-bold text-xl" style={{ color: metric.color }}>
                      <AnimatedCounter target={metric.value} suffix={metric.suffix} active={active} duration={1500} />
                    </p>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 bg-white"
                      style={{
                        width: active ? `${metric.barWidth}%` : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick specifications display */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
              {currentData.details.map((detail) => (
                <div key={detail.label} className="text-left">
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">{detail.label}</p>
                  <p className="text-xs text-white font-semibold truncate" title={detail.value}>
                    {detail.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Stats Block */}
            <div
              className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md"
            >
              <p className="text-xs text-white font-semibold tracking-widest uppercase mb-3">Real-World Benefits</p>
              <div className="grid grid-cols-2 gap-4">
                {currentData.stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="font-bold text-lg text-white">{stat.value}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
