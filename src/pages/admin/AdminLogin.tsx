import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, Mail, Lock, ArrowLeft, Eye, EyeOff, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

function mapUser(user: any) {
  return {
    id: String(user.id),
    email: user.email || "",
    username: user.user_metadata?.username || user.email?.split("@")[0] || "",
    avatar: user.user_metadata?.avatar || "",
    role: user.user_metadata?.role || "admin",
  };
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    if (data && data.user) {
      login(mapUser(data.user));
      navigate("/admin");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#070707] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-[#39FF14]/10 to-transparent rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-[#00FFFF]/10 to-transparent rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] bg-[#39FF14]/3 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: "8s" }} />

      {/* Modern, Subtle Tech Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Decorative clean energy design lines */}
      <div className="absolute top-[20%] left-[5%] w-[300px] h-[1px] bg-gradient-to-r from-transparent via-[#39FF14]/20 to-transparent rotate-[-15deg] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[5%] w-[400px] h-[1px] bg-gradient-to-r from-transparent via-[#00FFFF]/20 to-transparent rotate-[15deg] pointer-events-none" />

      <div className="relative w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 rounded-2xl overflow-hidden glass border border-white/10"
        style={{ boxShadow: "0 30px 100px rgba(0,0,0,0.8)" }}>

        {/* ── COLUMN 1: Details & Animated Background Product Image ── */}
        <div className="md:col-span-7 relative min-h-[400px] md:min-h-[600px] flex flex-col justify-between p-10 overflow-hidden group">
          {/* Background image with modern hover/zoom effect */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[12s] ease-out group-hover:scale-105"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=1200&h=800&fit=crop')",
            }}
          />
          {/* Overlay to keep text perfectly legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/60 to-[#070707]/30" />

          {/* Logo / Header */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/25 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#39FF14]" fill="#39FF14" />
            </div>
            <div>
              <p className="font-orbitron font-black text-lg text-white leading-none">TRIP</p>
              <p className="text-[9px] text-[#39FF14] tracking-[0.3em] uppercase mt-0.5">Mobility Tech</p>
            </div>
          </div>

          {/* Animated App Details */}
          <div className="relative z-10 space-y-6 my-auto pt-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20 text-[10px] text-[#39FF14] font-semibold uppercase tracking-wider animate-bounce">
              <Sparkles className="w-3 h-3" /> Next-Gen Electric Mobility
            </div>
            <h1 className="text-3xl md:text-5xl font-orbitron font-black text-white leading-tight uppercase">
              Command the <br />
              <span className="gradient-text">TRIP Ecosystem</span>
            </h1>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              Access the central fleet control room. Monitor real-time telemetry, manage custom spec sheets, coordinate dealership orders, and approve system-wide configuration updates.
            </p>

            {/* Smart visual specs status panel */}
            <div className="grid grid-cols-3 gap-4 pt-6 max-w-sm">
              {[
                { label: "Active Fleets", val: "1.2K+" },
                { label: "Total Range", val: "100km+" },
                { label: "Ecosystem Status", val: "Online" }
              ].map((spec, i) => (
                <div key={i} className="p-3 bg-white/5 border border-white/8 rounded-xl backdrop-blur-sm">
                  <p className="text-xs text-gray-500">{spec.label}</p>
                  <p className="text-sm font-orbitron font-bold text-white mt-0.5">{spec.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Back link */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-xs">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to main website
            </Link>
          </div>
        </div>

        {/* ── COLUMN 2: Authentication Form with Neon Border Trail ── */}
        <div className="md:col-span-5 bg-[#0A0A0A] p-6 md:p-10 flex flex-col justify-center">
          {/* Animated 2px neon trail border wrapping the card */}
          <div className="neon-trail-border-container">
            <div className="bg-[#0E0E0E] rounded-[calc(1rem-2px)] p-6 md:p-8 space-y-6">
              <div>
                <h2 className="font-orbitron font-bold text-xl text-white">Security Gateway</h2>
                <p className="text-xs text-gray-500 mt-1">Enter your admin credentials to gain server access</p>
              </div>

              {/* Security badge */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#39FF14]/5 border border-[#39FF14]/15">
                <Shield className="w-3.5 h-3.5 text-[#39FF14]" />
                <p className="text-[10px] text-gray-400">Authorized personnel only</p>
              </div>

              <div className="space-y-4">
                {/* Email field */}
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1.5 uppercase tracking-widest font-semibold">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-600 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
                      placeholder="admin@gmail.com"
                      autoComplete="email"
                      className="w-full border border-white/8 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-gray-700 focus:outline-none focus:border-[#39FF14]/40 transition-all text-xs"
                      style={{ background: "#161616" }}
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-600 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full border border-white/8 rounded-xl pl-11 pr-12 py-3.5 text-white placeholder-gray-700 focus:outline-none focus:border-[#39FF14]/40 transition-all text-xs"
                      style={{ background: "#161616" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Login Action */}
              <button
                onClick={handlePasswordLogin}
                disabled={loading || !email.trim() || !password.trim()}
                className="w-full btn-primary text-xs py-3.5 flex items-center justify-center gap-2 font-bold"
              >
                {loading ? "Authenticating..." : "Establish Secure Link"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
