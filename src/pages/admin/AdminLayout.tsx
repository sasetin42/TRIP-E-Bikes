import { useState, useEffect, useRef, useCallback } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, FileText, UserCog,
  Zap, Bell, Search, Menu, X, ExternalLink, LogOut,
  ChevronRight, BarChart3, Receipt, MessageSquare, MessageCircle,
  Calendar, Settings, User, ChevronDown, Upload, Trash2, Camera, Mail, Lock, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { auth, db, storage } from "@/lib/firebase";
import { signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword as authUpdatePassword } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useAuth } from "@/hooks/useAuth";

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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();

  // Disable body scrolling when profile modal is open
  useEffect(() => {
    if (profileModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
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
      try {
        const q = query(collection(db, "leads"), where("status", "==", "new"));
        const snap = await getDocs(q);
        setNewLeadsCount(snap.size);
      } catch (e) {
        console.warn("Failed to fetch new leads count", e);
      }
    };
    fetchNewLeads();
    const interval = setInterval(fetchNewLeads, 30000);
    return () => clearInterval(interval);
  }, []);

  // Real-time synchronization of admin profile details (name, avatar, etc.) from Firestore
  useEffect(() => {
    if (!user?.id) return;
    const profileRef = doc(db, "profiles", user.id);
    const unsubscribe = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.username !== user.username || data.avatar !== user.avatar) {
          login({
            ...user,
            username: data.username || user.username,
            avatar: data.avatar || ""
          });
        }
      }
    });
    return () => unsubscribe();
  }, [user?.id, user?.username, user?.avatar, login]);

  const handleLogout = async () => {
    await signOut(auth);
    logout();
    navigate("/admin/login");
    toast.success("Signed out from admin panel");
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast.error("Username cannot be empty");
      return;
    }
    if (!user) return;
    setSavingProfile(true);
    try {
      const profileRef = doc(db, "profiles", user.id);
      await setDoc(profileRef, {
        username: profileName.trim(),
        email: user.email,
        role: user.role || "admin",
        avatar: user.avatar || "",
        updated_at: new Date().toISOString()
      }, { merge: true });

      login({
        ...user,
        username: profileName.trim()
      });
      toast.success("Profile saved successfully.");
    } catch (e: any) {
      toast.error("Failed to save profile: " + e.message);
    }
    setSavingProfile(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingImage(true);
    try {
      const avatarRef = ref(storage, `avatars/${user.id}`);
      await uploadBytes(avatarRef, file);
      const url = await getDownloadURL(avatarRef);

      const profileRef = doc(db, "profiles", user.id);
      await setDoc(profileRef, { avatar: url }, { merge: true });

      login({
        ...user,
        avatar: url
      });
      toast.success("Profile image updated successfully.");
    } catch (err: any) {
      toast.error("Image upload failed: " + err.message);
    }
    setUploadingImage(false);
  };

  const handleDeleteImage = async () => {
    if (!user) return;
    setUploadingImage(true);
    try {
      const avatarRef = ref(storage, `avatars/${user.id}`);
      try {
        await deleteObject(avatarRef);
      } catch (e) {
        console.warn("Storage image did not exist or failed to delete:", e);
      }

      const profileRef = doc(db, "profiles", user.id);
      await setDoc(profileRef, { avatar: "" }, { merge: true });

      login({
        ...user,
        avatar: ""
      });
      toast.success("Profile image deleted successfully.");
    } catch (err: any) {
      toast.error("Failed to delete image: " + err.message);
    }
    setUploadingImage(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setChangingPassword(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No authenticated user");

      const credential = EmailAuthProvider.credential(currentUser.email || "", currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await authUpdatePassword(currentUser, newPassword);

      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error("Failed to change password: " + (e.message || "Invalid current password"));
    }
    setChangingPassword(false);
  };

  return (
    <div className="min-h-screen bg-[#070707] flex font-sans">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} flex-shrink-0 bg-[#0D0D0D] border-r border-white/5 flex flex-col transition-all duration-300 fixed top-0 left-0 h-full z-50`}>
        {/* Logo */}
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

        {/* User info */}
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

        {/* Navigation */}
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
                {/* New leads badge on CRM nav */}
                {item.href === "/admin/leads" && newLeadsCount > 0 && (
                  <span className={`${sidebarOpen ? "ml-auto" : "absolute -top-1 -right-1"} w-5 h-5 flex items-center justify-center rounded-full bg-[#39FF14] text-[#0A0A0A] text-[10px] font-black`}>
                    {newLeadsCount > 9 ? "9+" : newLeadsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
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
        {/* Top Bar */}
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
            <Link to="/admin/leads" className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:border-[#39FF14]/30 hover:text-[#39FF14] transition-all">
              <Bell className="w-4 h-4" />
              {newLeadsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#39FF14] rounded-full flex items-center justify-center text-[9px] font-black text-[#0A0A0A]">
                  {newLeadsCount > 9 ? "9+" : newLeadsCount}
                </span>
              )}
            </Link>
            {/* User Dropdown */}
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
                      // Pre-fill profile state fields from active user session
                      setProfileName(user?.username || "");
                      setCurrentPassword("");
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
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
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

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* ── PROFILE & PASSWORD EDIT MODAL ── */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="neon-trail-border-container p-[2px] rounded-2xl w-full max-w-4xl shadow-2xl relative">
            <div className="rounded-[14px] bg-[#0A0A0A] p-8 space-y-6 relative overflow-hidden">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-white/5 pb-3 mb-4">
                <h2 className="font-orbitron font-bold text-base text-white tracking-wide uppercase">Profile Control Center</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Manage system administrator identity, avatar, and security parameters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* ── COLUMN 1: Identity & Profile Details (Left 6 Columns) ── */}
                <div className="md:col-span-6 space-y-6">
                  <h3 className="text-sm font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-[#39FF14]" /> Identity Details
                  </h3>

                  {/* Profile Details & Avatar Upload */}
                  <div className="flex items-center gap-5 p-4 rounded-xl border border-white/5 bg-white/2">
                    <div className="relative group shrink-0">
                      <div className="w-20 h-20 rounded-full border border-white/10 bg-[#39FF14]/10 flex items-center justify-center overflow-hidden font-orbitron font-bold text-2xl text-[#39FF14]">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover animate-fade-in" />
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

                    <div className="flex-1 text-left space-y-2.5">
                      <p className="text-xs font-semibold text-white">Profile Image</p>
                      <div className="flex flex-wrap gap-2">
                        <label className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-xs font-semibold text-gray-300 hover:text-white cursor-pointer transition-all flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="hidden"
                          />
                        </label>
                        {user?.avatar && (
                          <button
                            onClick={handleDeleteImage}
                            disabled={uploadingImage}
                            className="px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-xs font-semibold text-red-400 hover:text-red-300 transition-all flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-400 font-semibold">Registered Email (Read-only)</label>
                      <div className="flex items-center gap-2.5 px-3.5 py-3 border border-white/5 rounded-xl bg-white/1 text-xs text-gray-500 cursor-not-allowed">
                        <Mail className="w-4 h-4 text-gray-600" />
                        {user?.email}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-400 font-semibold">User Username</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/30 transition-all"
                        placeholder="Enter username"
                      />
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="w-full py-3 rounded-xl bg-[#39FF14] text-[#0A0A0A] hover:bg-[#4FFF2A] text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Profile Details"}
                    </button>
                  </div>
                </div>

                {/* ── COLUMN 2: Security & Stats (Right 6 Columns) ── */}
                <div className="md:col-span-6 space-y-6 md:border-l md:border-white/5 md:pl-8">
                  <h3 className="text-sm font-orbitron font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#39FF14]" /> Security Access
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-400 font-semibold">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30 transition-all"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-400 font-semibold">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30 transition-all"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-400 font-semibold">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/30 transition-all"
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="w-full py-3 rounded-xl border border-[#39FF14]/30 bg-[#39FF14]/10 hover:bg-[#39FF14]/20 text-[#39FF14] text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                    </button>
                  </div>

                  {/* Custom Tech Stats Board */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/1 space-y-3 pt-5">
                    <p className="text-[10px] text-gray-500 font-orbitron font-bold uppercase tracking-widest">Administrator Stats</p>
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
        </div>
      )}
    </div>
  );
}
