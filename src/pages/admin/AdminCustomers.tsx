import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, Trash2, Eye, User, Calendar, Mail, Clock, Loader2, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CustomerProfile {
  id: string;
  username: string;
  email: string;
  dob?: string;
  avatar?: string;
  lastActive?: string;
  created_at?: string;
  role: string;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync customers in real-time from Firestore where role === 'customer'
  useEffect(() => {
    const q = query(collection(db, "profiles"), where("role", "==", "customer"));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const list: CustomerProfile[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            username: data.username || data.name || "Unknown Customer",
            email: data.email || "",
            dob: data.dob || "",
            avatar: data.avatar || "",
            lastActive: data.lastActive || data.updated_at || "",
            created_at: data.created_at || "",
            role: data.role || "customer",
          });
        });

        // Sort by username/name alphabetically
        list.sort((a, b) => a.username.localeCompare(b.username));

        setCustomers(list);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Failed to load customer profiles:", err);
        setError("Missing or insufficient permissions to read customer profiles.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter customers by username or email client-side
  const filteredCustomers = customers.filter((customer) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      customer.username.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term)
    );
  });

  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(`Are you sure you want to permanently delete the profile for "${name}"? This action cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "profiles", id));
      toast.success(`Customer profile "${name}" deleted successfully.`);
      if (selectedCustomer?.id === id) {
        setSelectedCustomer(null);
      }
    } catch (err: any) {
      toast.error(`Failed to delete profile: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-[50px] gap-3">
        <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" />
        <p className="text-gray-500 text-xs font-medium">Synchronizing customer profiles...</p>
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-orbitron font-bold text-2xl text-white">Customer Database</h1>
          <p className="text-gray-500 text-xs mt-1.5 font-medium">{customers.length} registered customer accounts</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="admin-customers-search"
            name="search"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/30"
          />
        </div>
      </div>

      {/* Main Content Table/Grid */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-20 bg-white/1">
            <User className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-xs font-medium">
              {searchQuery ? "No customers found matching your search query." : "No registered customers found in the database."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/2 text-[10px] uppercase font-orbitron font-bold tracking-wider text-gray-400">
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Date of Birth</th>
                  <th className="py-4 px-6">Last Active</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/1 transition-all group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-gradient-to-br from-[#39FF14]/20 to-[#00FFFF]/10 flex items-center justify-center font-orbitron font-bold text-sm text-[#39FF14] shrink-0">
                          {customer.avatar ? (
                            <img src={customer.avatar} alt={customer.username} className="w-full h-full object-cover" />
                          ) : (
                            getInitials(customer.username)
                          )}
                        </div>
                        <div className="font-semibold text-white text-sm">{customer.username}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400 font-medium">{customer.email}</td>
                    <td className="py-4 px-6 text-xs text-gray-400 font-medium">{formatDate(customer.dob)}</td>
                    <td className="py-4 px-6 text-xs text-gray-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-600" />
                        <span>{formatDateTime(customer.lastActive || customer.created_at)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all active:scale-95"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id, customer.username)}
                          disabled={deletingId === customer.id}
                          className="p-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all active:scale-95 disabled:opacity-50"
                          title="Delete Profile"
                        >
                          {deletingId === customer.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg neon-trail-border-container p-[2px] rounded-2xl shadow-2xl relative z-10">
            <div className="rounded-[14px] bg-[#0A0A0A] pt-5 pb-8 px-8 relative overflow-hidden">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="absolute top-5 right-6 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="border-b border-white/5 pb-3 mb-6">
                <h2 className="font-orbitron font-bold text-base text-white tracking-wide uppercase">Customer Profile Details</h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Complete account registration metadata and system identity</p>
              </div>

              {/* Profile Card Header */}
              <div className="flex flex-col items-center text-center p-4 rounded-xl border border-white/5 bg-white/2 mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#39FF14]/30 bg-gradient-to-br from-[#39FF14]/20 to-[#00FFFF]/10 flex items-center justify-center font-orbitron font-bold text-3xl text-[#39FF14] mb-3">
                  {selectedCustomer.avatar ? (
                    <img src={selectedCustomer.avatar} alt={selectedCustomer.username} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(selectedCustomer.username)
                  )}
                </div>
                <h3 className="font-semibold text-lg text-white">{selectedCustomer.username}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20 mt-1.5">
                  {selectedCustomer.role}
                </span>
              </div>

              {/* Details List */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/1 border border-white/5">
                  <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Email Address</p>
                    <p className="text-xs text-white font-medium">{selectedCustomer.email || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/1 border border-white/5">
                  <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Date of Birth</p>
                    <p className="text-xs text-white font-medium">{formatDate(selectedCustomer.dob)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/1 border border-white/5">
                  <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Last Activity / Update</p>
                    <p className="text-xs text-white font-medium">{formatDateTime(selectedCustomer.lastActive)}</p>
                  </div>
                </div>

                {selectedCustomer.created_at && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/1 border border-white/5">
                    <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Date Registered</p>
                      <p className="text-xs text-white font-medium">{formatDateTime(selectedCustomer.created_at)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="flex gap-3 mt-8 pt-4 border-t border-white/5">
                <button
                  onClick={() => handleDelete(selectedCustomer.id, selectedCustomer.username)}
                  className="flex-1 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Profile
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-white uppercase tracking-wider transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

