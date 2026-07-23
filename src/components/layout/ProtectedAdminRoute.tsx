import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { Zap } from "lucide-react";

export default function ProtectedAdminRoute() {
  const { user, loading } = useAuth();
  const { settings } = useSystemSettings();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center relative overflow-hidden font-inter">
        {/* Background glow and grid overlay for rich aesthetics */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#39FF14]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#00FFFF]/3 rounded-full blur-[80px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-3 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(57,255,20,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="flex flex-col items-center z-10">
          {/* Brand Logo Header */}
          {settings?.brand_logo_dark || settings?.brand_logo_main ? (
            <img 
              src={settings?.brand_logo_dark || settings?.brand_logo_main} 
              alt="Brand Logo" 
              className="h-16 w-auto object-contain mb-8 animate-pulse" 
            />
          ) : (
            <div className="flex items-center gap-3 mb-8 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#39FF14]" fill="#39FF14" />
              </div>
              <div>
                <p className="font-orbitron font-black text-lg text-white tracking-wider">TRIP</p>
                <p className="text-[9px] text-[#39FF14] tracking-[0.3em] uppercase font-bold">Mobility</p>
              </div>
            </div>
          )}

          {/* Premium Dual-Ring Spinner */}
          <div className="relative w-14 h-14 flex items-center justify-center mb-6">
            <div className="absolute inset-0.5 rounded-full bg-[#39FF14]/5 border border-[#39FF14]/10 animate-ping duration-1000" />
            <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#39FF14] animate-spin" style={{ animationDuration: '0.8s' }} />
            <div className="absolute inset-1 rounded-full border-b-2 border-l-2 border-[#00FFFF] animate-spin" style={{ animationDuration: '1.2s', animationDirection: 'reverse' }} />
          </div>

          {/* Status Labels */}
          <p className="text-white text-xs tracking-[0.2em] uppercase font-orbitron font-semibold animate-pulse">Verifying Admin Access</p>
          <p className="text-gray-600 text-[10px] uppercase tracking-wider font-semibold mt-2 animate-pulse">Establishing Secure Connection...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}
