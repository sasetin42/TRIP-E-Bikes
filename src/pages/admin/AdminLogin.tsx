import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, Mail, Lock, ArrowLeft, Eye, EyeOff, Shield } from "lucide-react";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useSystemSettings } from "@/hooks/useSystemSettings";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { settings } = useSystemSettings();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      const firebaseUser = userCredential.user;

      // Fetch admin role profile from Firestore profiles/{uid}
      const profileRef = doc(db, "profiles", firebaseUser.uid);
      const profileSnap = await getDoc(profileRef);
      const profileData = profileSnap.exists() ? profileSnap.data() : {};

      // Check if user is an admin or super_admin
      const role = profileData.role || "admin";
      if (role !== "admin" && role !== "super_admin") {
        toast.error("Access denied: Insufficient privileges");
        setLoading(false);
        return;
      }

      login({
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        username: profileData.username || firebaseUser.email?.split("@")[0] || "Admin",
        avatar: profileData.avatar || "",
        role: role
      });

      toast.success("Welcome back, Commander!");
      navigate("/admin");
    } catch (e: any) {
      toast.error(e.message || "Invalid login credentials");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#070707] flex flex-col lg:flex-row relative overflow-hidden font-inter">
      {/* Background glow and grids - global wrapper settings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#39FF14]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#00FFFF]/3 rounded-full blur-[80px] pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(57,255,20,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* 1st Column: Application Details (Left/Top side) */}
      <div className="relative w-full lg:w-[50%] xl:w-[55%] flex flex-col justify-between p-8 lg:p-16 overflow-hidden min-h-[350px] lg:min-h-screen border-b lg:border-b-0 lg:border-r border-white/10">
        {/* Background Image overlay related to e-bikes */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform hover:scale-105"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80')",
            transitionDuration: "10s"
          }}
        />
        {/* Overlay to ensure details are readable and viewable */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/95 backdrop-blur-[2px]" />

        {/* Content (Z-Index is high to stay above overlays) */}
        <div className="relative z-10 flex flex-col h-full justify-between gap-8">
          {/* Logo & Navigation Back */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {settings?.brand_logo_dark || settings?.brand_logo_main ? (
                <img 
                  src={settings?.brand_logo_dark || settings?.brand_logo_main} 
                  alt="TRIP Logo" 
                  className="h-16 w-auto object-contain" 
                />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#39FF14]" fill="#39FF14" />
                  </div>
                  <div>
                    <p className="font-orbitron font-black text-lg text-white tracking-wider uppercase">
                      {settings?.site_title?.split(" ")[0] || "TRIP"}
                    </p>
                    <p className="text-[9px] text-[#39FF14] tracking-[0.3em] uppercase font-bold">
                      {settings?.site_title?.split(" ").slice(1).join(" ") || "Mobility"}
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-[#39FF14] transition-colors text-xs font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Site
            </Link>
          </div>

          {/* Main App Details (Center) */}
          <div className="my-auto max-w-lg space-y-6">
            <div className="space-y-2">
              <span className="text-[#39FF14] text-xs font-orbitron tracking-[0.25em] uppercase font-bold">
                Control Center
              </span>
              <h1 className="font-orbitron font-black text-3xl sm:text-4xl lg:text-5xl text-white leading-tight">
                {settings?.site_title?.toUpperCase() || "TRIP E-BIKES"} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] to-[#00FFFF]">
                  ADMIN PORTAL
                </span>
              </h1>
            </div>
            
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Philippines' leading premium electric bike brand management system. Monitor fleet performance, manage dynamic E-Bike catalogs, track CRM leads, and handle servicing appointments in one secure hub.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-md">
                <p className="text-white font-orbitron font-bold text-lg">500W–750W</p>
                <p className="text-xs text-gray-400">High-torque Motors</p>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-md">
                <p className="text-white font-orbitron font-bold text-lg">100+ km</p>
                <p className="text-xs text-gray-400">Long Battery Range</p>
              </div>
            </div>
          </div>

          {/* Footer of details col */}
          <div className="text-[11px] text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} {settings?.site_title || "TRIP Mobility"}. All rights reserved.
          </div>
        </div>
      </div>

      {/* 2nd Column: Authentication Form (Right/Bottom side) */}
      <div className="relative w-full lg:w-[50%] xl:w-[45%] flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <div className="neon-trail-border-container p-[2px] rounded-2xl shadow-2xl relative">
            <div className="rounded-[14px] bg-[#0A0A0A] p-8 overflow-hidden relative">
              <div className="mb-8">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#39FF14]/5 border border-[#39FF14]/15 mb-4 w-fit">
                  <Shield className="w-3.5 h-3.5 text-[#39FF14]" />
                  <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">Authorized Personnel Only</p>
                </div>
                <h2 className="font-orbitron font-bold text-2xl text-white mb-1">Admin Login</h2>
                <p className="text-gray-500 text-sm">Enter your credentials to manage the workspace</p>
              </div>

              <form onSubmit={handlePasswordLogin} className="space-y-6">
                <div>
                  <label htmlFor="admin-email" className="block text-[10px] text-gray-400 mb-2 uppercase tracking-widest font-semibold">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      id="admin-email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@tripmobility.ph"
                      autoComplete="email"
                      className="w-full border border-white/10 rounded-xl pl-11 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/50 transition-all text-sm bg-[#161616]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-password" className="block text-[10px] text-gray-400 mb-2 uppercase tracking-widest font-semibold">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      id="admin-password"
                      name="password"
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your admin password"
                      autoComplete="current-password"
                      className="w-full border border-white/10 rounded-xl pl-11 pr-12 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/50 transition-all text-sm bg-[#161616]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim() || !password.trim()}
                  className="w-full py-4 rounded-xl font-bold bg-[#39FF14] text-[#0A0A0A] hover:bg-[#32e612] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {loading ? "Signing In..." : "Admin Login"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

