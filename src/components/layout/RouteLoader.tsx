import { Loader2 } from "lucide-react";

export default function RouteLoader() {
  return (
    <div className="fixed inset-0 bg-[#0A0A0A] z-[9999] flex flex-col items-center justify-center">
      {/* Glow Effect */}
      <div className="absolute w-[400px] h-[400px] bg-[#39FF14]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative flex flex-col items-center">
        {/* Animated Neon Rings */}
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-[#39FF14]/10" />
          <div className="absolute inset-0 rounded-full border-2 border-t-[#39FF14] animate-spin" />
          <Loader2 className="absolute inset-0 m-auto w-6 h-6 text-[#39FF14] animate-pulse" />
        </div>

        {/* Brand Text */}
        <h2 className="font-orbitron font-black text-xl tracking-[0.2em] text-white">
          TRIP<span className="text-[#39FF14]">.</span>
        </h2>
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em] mt-2 animate-pulse">
          Charging Experience
        </p>
      </div>
    </div>
  );
}
