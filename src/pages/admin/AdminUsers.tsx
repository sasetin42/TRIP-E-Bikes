import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AdminUser } from "@/types";
import { Plus, Edit, Trash2, Shield, Clock, Loader2, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { CustomSelect } from "@/components/ui/custom-select";

const ROLE_CONFIG: Record<AdminUser["role"], { label: string; color: string; bg: string }> = {
  super_admin: { label: "Super Admin", color: "text-[#39FF14]", bg: "bg-[#39FF14]/20" },
  admin: { label: "Admin", color: "text-cyan-400", bg: "bg-cyan-500/20" },
  sales_manager: { label: "Sales Manager", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  sales_agent: { label: "Sales Agent", color: "text-blue-400", bg: "bg-blue-500/20" },
  content_editor: { label: "Content Editor", color: "text-purple-400", bg: "bg-purple-500/20" },
  marketing: { label: "Marketing", color: "text-pink-400", bg: "bg-pink-500/20" },
};

const ROLES: AdminUser["role"][] = ["super_admin", "admin", "sales_manager", "sales_agent", "content_editor", "marketing"];

const PERMISSIONS: Record<AdminUser["role"], string[]> = {
  super_admin: ["Full system access", "User management", "All CMS access", "Financial data", "System settings"],
  admin: ["User management", "All CMS access", "Lead management", "Product management"],
  sales_manager: ["Lead management", "Pipeline management", "Team reporting", "Quote approval"],
  sales_agent: ["Own leads", "Quote creation", "Customer contact", "Basic reporting"],
  content_editor: ["Blog posts", "FAQs", "Testimonials", "Media library"],
  marketing: ["Blog posts", "Banners", "SEO settings", "Email campaigns"],
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "sales_agent" as AdminUser["role"] });
  const [adding, setAdding] = useState(false);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "sales_agent" as AdminUser["role"] });
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync users in real-time from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "profiles"),
      (querySnapshot) => {
        const usersList: AdminUser[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          usersList.push({
            id: docSnap.id,
            name: data.username || "Unknown Admin",
            email: data.email || "",
            role: data.role || "sales_agent",
            lastActive: data.lastActive || new Date().toISOString(),
          });
        });
        // Sort by role (super_admin first) then name
        usersList.sort((a, b) => {
          const roleOrder = { super_admin: 0, admin: 1, sales_manager: 2, sales_agent: 3, content_editor: 4, marketing: 5 };
          const orderA = roleOrder[a.role] ?? 99;
          const orderB = roleOrder[b.role] ?? 99;
          if (orderA !== orderB) return orderA - orderB;
          return a.name.localeCompare(b.name);
        });
        setUsers(usersList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Failed to load user profiles:", err);
        setError("Missing or insufficient permissions to read user profiles.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      toast.error("Please fill in name and email");
      return;
    }
    setAdding(true);
    try {
      await addDoc(collection(db, "profiles"), {
        username: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        role: newUser.role,
        lastActive: new Date().toISOString(),
        avatar: "",
      });
      setShowAdd(false);
      setNewUser({ name: "", email: "", role: "sales_agent" });
      toast.success("User added successfully.");
    } catch (err: any) {
      toast.error("Failed to add user: " + err.message);
    }
    setAdding(false);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setSavingEdit(true);
    try {
      await updateDoc(doc(db, "profiles", editingUser.id), {
        username: editForm.name.trim(),
        email: editForm.email.trim().toLowerCase(),
        role: editForm.role,
      });
      setEditingUser(null);
      toast.success("User profile updated.");
    } catch (err: any) {
      toast.error("Failed to update user: " + err.message);
    }
    setSavingEdit(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "profiles", id));
      toast.success("User removed successfully.");
    } catch (err: any) {
      toast.error("Failed to delete user: " + err.message);
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-[50px] gap-3">
        <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" />
        <p className="text-gray-500 text-xs font-medium">Synchronizing live profiles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <h2 className="text-white font-orbitron font-bold uppercase tracking-wider text-sm">Connection Terminated</h2>
        <p className="text-gray-500 text-xs leading-relaxed">{error}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-orbitron font-bold text-2xl text-white">User Management</h1>
          <p className="text-gray-500 text-xs mt-1.5 font-medium">{users.length} active administrators</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-xs flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2 space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-white/5 bg-white/1">
              <Shield className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-xs font-medium">No registered profiles discovered in database.</p>
            </div>
          ) : (
            users.map((user) => {
              const cfg = ROLE_CONFIG[user.role] || { label: user.role, color: "text-gray-400", bg: "bg-gray-500/10" };
              return (
                <div key={user.id} className="bg-white/5 backdrop-blur-md rounded-xl border border-white/5 hover:border-white/10 transition-all p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#39FF14]/20 to-[#00FFFF]/10 flex items-center justify-center font-orbitron font-bold text-lg text-[#39FF14] shrink-0 border border-[#39FF14]/10">
                    {(user.name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-semibold text-white text-sm">{user.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <Clock className="w-3.5 h-3.5 text-gray-600" />
                      <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">
                        Last active: {new Date(user.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => handleOpenEdit(user)}
                      className="p-2.5 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all active:scale-95"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {user.role !== "super_admin" && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                        className="p-2.5 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {deletingId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Roles & Permissions */}
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
            <Shield className="w-5 h-5 text-[#39FF14]" />
            <h2 className="font-orbitron font-bold text-base text-white tracking-wide uppercase">Role Matrix</h2>
          </div>
          <div className="space-y-6">
            {ROLES.map((role) => {
              const cfg = ROLE_CONFIG[role];
              const perms = PERMISSIONS[role];
              return (
                <div key={role} className="p-4 border border-white/5 rounded-xl bg-black/20">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color} mb-3 inline-block`}>
                    {cfg.label}
                  </span>
                  <ul className="space-y-1.5 mt-1">
                    {perms.map((perm) => (
                      <li key={perm} className="text-xs text-gray-500 flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] shrink-0" />
                        {perm}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md neon-trail-border-container p-[2px] rounded-2xl shadow-2xl relative z-10">
            <div className="rounded-[14px] bg-[#0A0A0A] pt-5 pb-8 px-8 relative overflow-hidden">
              <button onClick={() => setShowAdd(false)} className="absolute top-5 right-6 text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <div className="border-b border-white/5 pb-3 mb-5">
                <h2 className="font-orbitron font-bold text-base text-white tracking-wide uppercase">Add New Administrator</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Invite new personnel to write back actions to the central system</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="admin-users-add-name" className="block text-[10px] text-gray-400 mb-2 uppercase tracking-widest font-semibold">Full Name *</label>
                  <input
                    id="admin-users-add-name"
                    name="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/50"
                  />
                </div>
                <div>
                  <label htmlFor="admin-users-add-email" className="block text-[10px] text-gray-400 mb-2 uppercase tracking-widest font-semibold">Email *</label>
                  <input
                    type="email"
                    id="admin-users-add-email"
                    name="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="user@tripmobility.ph"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/50"
                  />
                </div>
                <div>
                  <label htmlFor="admin-users-add-role" className="block text-[10px] text-gray-400 mb-2 uppercase tracking-widest font-semibold">Role</label>
                  <CustomSelect
                    value={newUser.role}
                    onChange={(v) => setNewUser({ ...newUser, role: v as AdminUser["role"] })}
                    options={ROLES.filter((r) => r !== "super_admin").map((role) => ({
                      value: role,
                      label: ROLE_CONFIG[role].label
                    }))}
                    size="sm"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-2">
                <button
                  onClick={handleAdd}
                  disabled={adding || !newUser.name.trim() || !newUser.email.trim()}
                  className="btn-primary flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  {adding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create User
                </button>
                <button onClick={() => setShowAdd(false)} className="btn-outline text-xs">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md neon-trail-border-container p-[2px] rounded-2xl shadow-2xl relative z-10">
            <div className="rounded-[14px] bg-[#0A0A0A] pt-5 pb-8 px-8 relative overflow-hidden">
              <button onClick={() => setEditingUser(null)} className="absolute top-5 right-6 text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <div className="border-b border-white/5 pb-3 mb-5">
                <h2 className="font-orbitron font-bold text-base text-white tracking-wide uppercase">Edit Administrator Profile</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Modify system administrative profiles and permission levels</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="admin-users-edit-name" className="block text-[10px] text-gray-400 mb-2 uppercase tracking-widest font-semibold">Full Name *</label>
                  <input
                    id="admin-users-edit-name"
                    name="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/50"
                  />
                </div>
                <div>
                  <label htmlFor="admin-users-edit-email" className="block text-[10px] text-gray-400 mb-2 uppercase tracking-widest font-semibold">Email *</label>
                  <input
                    type="email"
                    id="admin-users-edit-email"
                    name="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="user@tripmobility.ph"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/50"
                  />
                </div>
                <div>
                  <label htmlFor="admin-users-edit-role" className="block text-[10px] text-gray-400 mb-2 uppercase tracking-widest font-semibold">Role</label>
                  <CustomSelect
                    value={editForm.role}
                    onChange={(v) => setEditForm({ ...editForm, role: v as AdminUser["role"] })}
                    options={ROLES.map((role) => ({
                      value: role,
                      label: ROLE_CONFIG[role].label
                    }))}
                    size="sm"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit || !editForm.name.trim() || !editForm.email.trim()}
                  className="btn-primary flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  {savingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
                <button onClick={() => setEditingUser(null)} className="btn-outline text-xs">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

