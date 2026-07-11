import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell, BellRing, X, Check, Trash2, FileText, Gift, MessageSquare, Info, Star, Calendar, UserPlus
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, orderBy, onSnapshot, limit } from "firebase/firestore";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface SystemNotification {
  id: string;
  type: string; // lead, chat, appointment, contact, info, loyalty
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  lead: { icon: UserPlus, color: "text-[#39FF14]", bg: "bg-[#39FF14]/10" },
  chat: { icon: MessageSquare, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  appointment: { icon: Calendar, color: "text-purple-400", bg: "bg-purple-400/10" },
  contact: { icon: FileText, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  info: { icon: Info, color: "text-gray-400", bg: "bg-white/5" },
  loyalty: { icon: Gift, color: "text-amber-400", bg: "bg-amber-400/10" }
};

interface NotificationBellProps {
  isAdmin?: boolean;
}

export default function NotificationBell({ isAdmin = false }: NotificationBellProps) {
  const { customer } = useCustomerAuth();
  const { user: adminUser } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Set up real-time listener to Firestore
  useEffect(() => {
    // Determine active subject/scope
    if (isAdmin && !adminUser) return;
    if (!isAdmin && !customer) return;

    const notificationsRef = collection(db, "notifications");
    let q = query(notificationsRef, orderBy("created_at", "desc"), limit(40));

    // If it's a customer, filter to their email specifically
    if (!isAdmin && customer) {
      q = query(
        notificationsRef,
        where("recipient_email", "==", customer.email),
        orderBy("created_at", "desc"),
        limit(40)
      );
    }

    const unsubscribe = onSnapshot(q, (snap) => {
      const list: SystemNotification[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
          type: data.type || "info",
          title: data.title || "New Notification",
          message: data.message || "",
          read: data.read === true || data.read === "true",
          created_at: data.created_at || new Date().toISOString()
        });
      });
      setNotifications(list);
    }, (err) => {
      console.warn("Failed to listen to notifications:", err);
    });

    return () => unsubscribe();
  }, [isAdmin, adminUser, customer]);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    try {
      const docRef = doc(db, "notifications", id);
      await setDoc(docRef, { read: true }, { merge: true });
    } catch (e: any) {
      toast.error("Failed to mark read: " + e.message);
    }
  };

  const markAllRead = async () => {
    try {
      const unreadList = notifications.filter((n) => !n.read);
      for (const item of unreadList) {
        await setDoc(doc(db, "notifications", item.id), { read: true }, { merge: true });
      }
      toast.success("All notifications marked as read");
    } catch (e: any) {
      toast.error("Failed to mark all read: " + e.message);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
      toast.success("Notification deleted");
    } catch (e: any) {
      toast.error("Failed to delete notification: " + e.message);
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      if (diffHr < 24) return `${diffHr}h ago`;
      const diffDay = Math.floor(diffHr / 24);
      return `${diffDay}d ago`;
    } catch {
      return "Some time ago";
    }
  };

  // If user is not authenticated, do not show bell
  if (isAdmin && !adminUser) return null;
  if (!isAdmin && !customer) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-[#39FF14]/30 hover:bg-[#39FF14]/5 transition-all"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4.5 h-4.5 text-[#39FF14] animate-[bounce_1.5s_infinite]" />
        ) : (
          <Bell className="w-4.5 h-4.5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-[#39FF14] rounded-full flex items-center justify-center text-[#0A0A0A] text-[9px] font-black shadow-[0_0_8px_rgba(57,255,20,0.5)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-3.5 w-80 z-[200] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ background: "linear-gradient(145deg, #121212 0%, #080808 100%)" }}
        >
          <div className="h-[2px] bg-gradient-to-r from-[#39FF14] via-[#00FFFF] to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/2">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#39FF14]" />
              <p className="font-semibold text-white text-xs font-orbitron">Notifications</p>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-[#39FF14]/25 text-[#39FF14] text-[9px] font-bold rounded-full border border-[#39FF14]/30">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-gray-500 hover:text-[#39FF14] transition-colors flex items-center gap-1 font-semibold"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-gray-600 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[350px] overflow-y-auto divide-y divide-white/5">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center bg-white/2 mb-3.5 text-gray-600">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs text-gray-400 font-semibold">No notifications yet</p>
                <p className="text-[10px] text-gray-600 mt-1">We'll alert you here when new actions take place.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
                const Icon = cfg.icon;
                return (
                  <div
                    key={notif.id}
                    onClick={() => !notif.read && markRead(notif.id)}
                    className="flex items-start gap-3.5 px-4 py-3.5 cursor-pointer transition-all hover:bg-white/2 group relative"
                  >
                    <div className={`w-8 h-8 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5 border border-white/5`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold truncate ${notif.read ? "text-gray-400" : "text-white"}`}>
                          {notif.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all shrink-0 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className={`text-[11px] mt-0.5 leading-relaxed ${notif.read ? "text-gray-500" : "text-gray-300"}`}>
                        {notif.message}
                      </p>
                      <p className="text-[9px] text-gray-600 mt-1.5 font-medium">{formatTime(notif.created_at)}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14] mt-2 shrink-0 shadow-[0_0_6px_#39FF14]" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="px-4 py-2 border-t border-white/5 text-center bg-white/1">
            <p className="text-[9px] text-gray-600 font-medium">Synced in real-time with Firestore</p>
          </div>
        </div>
      )}
    </div>
  );
}
