import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, Mail, Lock, Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

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

      toast.success("Welcome back!");
      navigate("/admin");
    } catch (e: any) {
      toast.error(e.message || "Invalid login credentials");
    }
    setLoading(false);
  };

  const handleDemoAdminLogin = async () => {
    setLoading(true);
    try {
      // Demo credentials
      const demoEmail = "admin@gmail.com";
      const demoPass = "123456#";

      const userCredential = await signInWithEmailAndPassword(auth, demoEmail, demoPass);
      const firebaseUser = userCredential.user;

      const profileRef = doc(db, "profiles", firebaseUser.uid);
      const profileSnap = await getDoc(profileRef);
      const profileData = profileSnap.exists() ? profileSnap.data() : {};

      login({
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        username: profileData.username || "Super Admin",
        avatar: profileData.avatar || "",
        role: profileData.role || "super_admin"
      });

      toast.success("Logged in as Super Admin!");
      navigate("/admin");
    } catch (e: any) {
      toast.error("Demo login failed: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#070707] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-8 bg-[#0D0D0D]">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#39FF14] to-transparent" />

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/20 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-[#39FF14]" fill="#39FF14" />
          </div>
          <p className="text-[10px] text-[#39FF14] tracking-[0.25em] uppercase font-bold">TRIP Mobility</p>
          <h2 className="font-orbitron font-bold text-xl text-white mt-1">Admin Access Panel</h2>
        </div>

        <div className="space-y-4">
          {/* Demo account bypass */}
          <div className="p-4 rounded-xl border border-[#39FF14]/25 bg-[#39FF14]/5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#39FF14]" />
              <span className="text-xs text-white font-bold uppercase tracking-wide">Developer Sandbox Mode</span>
            </div>
            <p className="text-[11px] text-gray-400">Use pre-seeded Super Admin credentials to authenticate instantly.</p>
            <button
              onClick={handleDemoAdminLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-xs font-bold bg-[#39FF14] text-[#0A0A0A] hover:bg-[#4FFF2A] transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "⚡ Access as Super Admin"}
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tripmobility.ph"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Secret Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-12 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/30"
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
            onClick={handlePasswordLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-xl border border-white/10 hover:border-white/30 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 bg-white/2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In to Console"}
          </button>
        </div>
      </div>
    </div>
  );
}
