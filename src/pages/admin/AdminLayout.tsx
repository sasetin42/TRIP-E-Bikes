import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, FileText, UserCog,
  Zap, Search, Menu, X, ExternalLink, LogOut,
  BarChart3, Receipt, MessageSquare, MessageCircle,
  Calendar, Settings, User, ChevronDown, Upload, Trash2, Loader2, Mail, Lock
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/features/NotificationBell";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Leads & CRM", href: "/admin/leads" },
  { icon: Receipt, label: "Quotations", href: "/admin/quotations" },
  { icon: MessageSquare, label: "Contacts", href: "/admin/contacts" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: FileText, label: "Content", href: "/admin/content" },
  { icon: MessageCircle, label: "Live Chat", href: "/admin/chat" },
  { icon: Calendar, label: "Appointments", href: "/admin/appointments" },
  { icon: UserCog, label: "Users", href: "/admin/users" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newLeadsCount, setNewLeadsCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Profile Editor Modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();

  useEffect(() => {
    if (profileModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [profileModalOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Poll for new leads count
  useEffect(() => {
    const fetchNewLeads = async () => {
      const { count } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "new");
      setNewLeadsCount(count || 0);
    };
    fetchNewLeads();
    const interval = setInterval(fetchNewLeads, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate("/admin/login");
    toast.success("Signed out from admin panel");
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) { toast.error("Username cannot be empty"); return; }
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({
      data: { username: profileName.trim() },
    });
    if (error) {
      toast.error("Failed to save profile: " + error.message);
    } else {
      login({ ...user, username: profileName.trim() });
      toast.success("Profile saved successfully.");
    }
    setSavingProfile(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingImage(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true });
    if (uploadError) {
      toast.error("Image upload failed: " + uploadError.message);
      setUploadingImage(false);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    const url = data.publicUrl;
    await supabase.auth.updateUser({ data: { avatar_url: url } });
    login({ ...user, avatar: url });
    toast.success("Profile image updated successfully.");
    setUploadingImage(false);
  };

  const handleDeleteImage = async () => {
    if (!user) return;
    setUploadingImage(true);
    await supabase.auth.updateUser({ data: { avatar_url: "" } });
    login({ ...user, avatar: "" });
    toast.success("Profile image removed.");
    setUploadingImage(false);
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) { toast.error("Please fill in all password fields"); return; }
    if (newPassword !== confirmPassword) { toast.error("New passwords do not match"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error("Failed to change password: " + error.message);
    } else {
      toast.success("Password changed successfully.");
      setNewPassword("");
      setConfirmPassword("");
    }
    setChangingPassword(false);
  };

  return (
    <div className="min-h-screen bg-[#070707] flex font-sans">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} flex-shrink-0 bg-[#0D0D0D] border-r border-white/5 flex flex-col transition-all duration-300 fixed top-0 left-0 h-full z-50`}>
        <div className="p-4 border-b border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center bg-[#39FF14]/15 rounded-lg border border-[#39FF14]/20 shrink-0">
            <Zap className="w-5 h-5 text-[#39FF14]" fill="#39FF14" />
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-orbitron font-black text-sm text-white">TRIP</p>
              <p className="text-[8px] text-[#39FF14] tracking-widest">ADMIN PANEL</p>
            </div>
          )}
        </div>

        {sidebarOpen && user && (
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white/10 bg-[#39FF14]/10 flex items-center justify-center font-bold text-[#39FF14] text-xs shrink-0 overflow-hidden font-orbitron">
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.username[0].toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.username}</p>
              <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        )}

        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== "/admin" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl mb-1 transition-all duration-200 relative ${
                  isActive
                    ? "bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                {item.href === "/admin/leads" && newLeadsCount > 0 && (
                  <span className={`${sidebarOpen ? "ml-auto" : "absolute -top-1 -right-1"} w-5 h-5 flex items-center justify-center rounded-full bg-[#39FF14] text-[#0A0A0A] text-[10px] font-black`}>
                    {newLeadsCount > 9 ? "9+" : newLeadsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5">
              <ExternalLink className="w-4 h-4" />
              View Website
            </Link>
          )}
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-xs text-gray-500 hover:text-red-400 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-500/5 text-left"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={`flex-1 flex flex-col min-h-screen ${sidebarOpen ? "ml-64" : "ml-16"} transition-all duration-300`}>
        <header className="sticky top-0 z-40 bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-white/5 h-16 flex items-center px-6 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads, products..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/30"
            />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <NotificationBell isAdmin={true} />
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 focus:outline-none group"
              >
                <div className="w-9 h-9 rounded-full bg-[#39FF14]/20 border border-[#39FF14]/30 flex items-center justify-center font-orbitron font-bold text-sm text-[#39FF14] group-hover:border-[#39FF14]/60 transition-all overflow-hidden shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.username?.[0]?.toUpperCase() || "A"
                  )}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-48 rounded-xl bg-[#0D0D0D]/95 backdrop-blur-xl border border-white/10 p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="px-2.5 py-2 border-b border-white/5 mb-1">
                    <p className="text-xs font-semibold text-white truncate">{user?.username || "Admin"}</p>
                    <p className="text-[10px] text-gray-500 truncate">{user?.email || ""}</p>
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setProfileName(user?.username || "");
                      setNewPassword("");
                      setConfirmPassword("");
                      setProfileModalOpen(true);
                    }}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    <User className="w-3.5 h-3.5" />
                    Profile
                  </button>
                  <Link
                    to="/admin/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                  </Link>
                  <Link
                    to="/"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Website
                  </Link>
                  <button
                    onClick={() => { setDropdownOpen(false); handleLogout(); }}
                    className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* ── PROFILE MODAL ── */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0A0A0A] p-8 space-y-6 relative">
            <button onClick={() => setProfileModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-white/5 pb-3">
              <h2 className="font-orbitron font-bold text-base text-white tracking-wide uppercase">Profile Settings</h2>
              <p className="text-[10px] text-gray-500 mt-0.5">Manage administrator identity and security</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Identity */}
              <div className="space-y-5">
                <h3 className="text-sm font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-[#39FF14]" /> Identity
                </h3>

                <div className="flex items-center gap-5 p-4 rounded-xl border border-white/5 bg-white/2">
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 rounded-full border border-white/10 bg-[#39FF14]/10 flex items-center justify-center overflow-hidden font-orbitron font-bold text-2xl text-[#39FF14]">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        user?.username?.[0]?.toUpperCase() || "A"
                      )}
                    </div>
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/75 flex items-center justify-center rounded-full">
                        <Loader2 className="w-5 h-5 text-[#39FF14] animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-xs font-semibold text-white">Profile Image</p>
                    <div className="flex flex-wrap gap-2">
                      <label className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 cursor-pointer flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" /> Upload
                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="hidden" />
                      </label>
                      {user?.avatar && (
                        <button onClick={handleDeleteImage} disabled={uploadingImage} className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 text-xs font-semibold text-red-400 flex items-center gap-1.5">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Registered Email (Read-only)</label>
                  <div className="flex items-center gap-2.5 px-3.5 py-3 border border-white/5 rounded-xl bg-white/1 text-xs text-gray-500">
                    <Mail className="w-4 h-4 text-gray-600" />
                    {user?.email}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-400 font-semibold">Username</label>
                  <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30" placeholder="Enter username" />
                </div>

                <button onClick={handleSaveProfile} disabled={savingProfile} className="w-full py-3 rounded-xl bg-[#39FF14] text-[#0A0A0A] hover:bg-[#4FFF2A] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-50">
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile"}
                </button>
              </div>

              {/* Security */}
              <div className="space-y-5 md:border-l md:border-white/5 md:pl-8">
                <h3 className="text-sm font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#39FF14]" /> Security
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-semibold">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30" placeholder="••••••••" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-400 font-semibold">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30" placeholder="••••••••" />
                  </div>
                  <button onClick={handleChangePassword} disabled={changingPassword} className="w-full py-3 rounded-xl border border-[#39FF14]/30 bg-[#39FF14]/10 hover:bg-[#39FF14]/20 text-[#39FF14] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 disabled:opacity-50">
                    {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-white/5 bg-white/1 space-y-3">
                  <p className="text-[10px] text-gray-500 font-orbitron font-bold uppercase tracking-widest">Administrator Info</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-500">Access Level</p>
                      <p className="text-xs font-bold text-[#39FF14] mt-0.5">{user?.role?.toUpperCase().replace("_", " ") || "ADMIN"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">System State</p>
                      <p className="text-xs font-bold text-white mt-0.5">Online / Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
