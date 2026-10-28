import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import heroBike from "@/assets/hero-bike.jpg";
import adminBg from "@/assets/admin-bg.jpg";
import { syncLiveProducts } from "@/constants/products";
import { parseSpecMetric, getSpecValue, ParsedSpecMetric } from "@/utils/specs";

interface AnimatedMetricProps {
  metric: ParsedSpecMetric;
  duration?: number;
  active: boolean;
}

function AnimatedMetric({ metric, duration = 1500, active }: AnimatedMetricProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }
    let startTime: number | null = null;
    let animId: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased);
      if (p < 1) {
        animId = requestAnimationFrame(step);
      }
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [active, duration, metric.formatted]);

  if (!metric.formatted) return <span>--</span>;

  // Range value: e.g. 40–60 km
  if (metric.isRange) {
    const curMin = Math.round(progress * metric.min);
    const curMax = Math.round(progress * metric.max);
    return <span>{curMin}–{curMax}{metric.unit ? ` ${metric.unit}` : ""}</span>;
  }

  // Single numeric value: e.g. 800 W, 310 kg
  if (metric.value > 0) {
    const curVal = Math.round(progress * metric.value);
    return <span>{curVal}{metric.unit ? ` ${metric.unit}` : ""}</span>;
  }

  // Non-numeric text
  return <span>{metric.formatted}</span>;
}

export default function BikeAssemblyAnimation() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    syncLiveProducts().then(list => {
      if (list && list.length > 0) {
        const filtered = list.filter(p => {
          const name = (p.name || "").toLowerCase();
          return !name.includes("ranger") && !name.includes("delivery");
        });
        setLiveProducts(filtered);
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

  // Active product from live products
  const activeProduct = liveProducts[selectedIdx] || liveProducts[0];

  const getMetricData = () => {
    if (!activeProduct) {
      const defaultRange = parseSpecMetric("120 km", "km");
      const defaultSpeed = parseSpecMetric("45 km/h", "km/h");
      const defaultMotor = parseSpecMetric("500 W", "W");
      const defaultPayload = parseSpecMetric("180 kg", "kg");

      return {
        name: "Cargo Pro",
        metrics: [
          { label: "Max Range", parsed: defaultRange, color: "#FFFFFF", barWidth: 80 },
          { label: "Top Speed", parsed: defaultSpeed, color: "#FFFFFF", barWidth: 75 },
          { label: "Motor Power", parsed: defaultMotor, color: "#FFFFFF", barWidth: 42 },
          { label: "Payload", parsed: defaultPayload, color: "#FFFFFF", barWidth: 51 },
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

    const rawRange = getSpecValue(s, "range", "120 km");
    const rawSpeed = getSpecValue(s, "topSpeed", "45 km/h");
    const rawMotor = getSpecValue(s, "motor", "500 W");
    const rawPayload = getSpecValue(s, "payload", "180 kg");

    const rangeParsed = parseSpecMetric(rawRange, "km");
    const speedParsed = parseSpecMetric(rawSpeed, "km/h");
    const motorParsed = parseSpecMetric(rawMotor, "W");
    const payloadParsed = parseSpecMetric(rawPayload, "kg");

    // Dynamic bar calculation percentages relative to standard maximum parameters
    const rangePercent = Math.min(Math.round(((rangeParsed.value || 50) / 150) * 100), 100);
    const speedPercent = Math.min(Math.round(((speedParsed.value || 40) / 60) * 100), 100);
    const motorPercent = Math.min(Math.round(((motorParsed.value || 500) / 1200) * 100), 100);
    const payloadPercent = Math.min(Math.round(((payloadParsed.value || 150) / 350) * 100), 100);

    // Build dynamic details list directly from live specifications
    const detailList: { label: string; value: string }[] = [];
    const frameVal = getSpecValue(s, "frame");
    const brakesVal = getSpecValue(s, "brakes");
    const tiresVal = getSpecValue(s, "tires");
    const batteryVal = getSpecValue(s, "battery");
    const weightVal = getSpecValue(s, "weight");

    if (frameVal) detailList.push({ label: "Frame Material", value: frameVal });
    if (brakesVal) detailList.push({ label: "Brake System", value: brakesVal });
    if (tiresVal) detailList.push({ label: "Tire Specifications", value: tiresVal });
    if (batteryVal && detailList.length < 3) detailList.push({ label: "Battery Pack", value: batteryVal });
    if (weightVal && detailList.length < 3) detailList.push({ label: "Total Weight", value: weightVal });

    // If still under 3, pull any extra custom specs from CMS
    if (detailList.length < 3) {
      const coreKeys = new Set(["motor", "battery", "range", "topSpeed", "top_speed", "payload", "weight", "frame", "brakes", "tires", "chargingTime", "chargeTime"]);
      for (const [k, v] of Object.entries(s)) {
        if (!coreKeys.has(k) && v && String(v).trim()) {
          detailList.push({ label: k.replace(/([A-Z])/g, " $1").trim(), value: String(v) });
          if (detailList.length >= 3) break;
        }
      }
    }

    if (detailList.length === 0) {
      detailList.push(
        { label: "Frame Material", value: "High-tensile Alloy" },
        { label: "Brake System", value: "Hydraulic Disc Brakes" },
        { label: "Tire Specifications", value: 'Heavy-Duty Tubeless Tires' }
      );
    }

    const chargeTimeVal = getSpecValue(s, "chargingTime", "5–6 hrs");

    return {
      name: activeProduct.name,
      metrics: [
        { label: "Max Range", parsed: rangeParsed, color: "#FFFFFF", barWidth: rangePercent },
        { label: "Top Speed", parsed: speedParsed, color: "#FFFFFF", barWidth: speedPercent },
        { label: "Motor Power", parsed: motorParsed, color: "#FFFFFF", barWidth: motorPercent },
        { label: "Payload", parsed: payloadParsed, color: "#FFFFFF", barWidth: payloadPercent },
      ],
      stats: [
        { label: "CO₂ Saved/Year", value: rangeParsed.value > 80 ? "1.2T" : rangeParsed.value > 55 ? "1.0T" : "0.8T" },
        { label: "Fuel Cost Saved", value: "₱0/day" },
        { label: "Charge Time", value: chargeTimeVal },
        { label: "Service Life", value: "8+ Years" },
      ],
      details: detailList,
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
                      <AnimatedMetric metric={metric.parsed} active={active} duration={1500} />
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
