import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

export default function AuthInitializer() {
  const { login: adminLogin, logout: adminLogout, setLoading: setAdminLoading } = useAuth();
  const { login: customerLogin, logout: customerLogout, setLoading: setCustomerLoading } = useCustomerAuth();

  useEffect(() => {
    let mounted = true;

    // 1. Firebase Auth state listener for Admin
    let unsubscribeFirebase = () => {};
    try {
      unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!mounted) return;
        if (firebaseUser) {
          try {
            const profileRef = doc(db, "profiles", firebaseUser.uid);
            const profileSnap = await getDoc(profileRef);
            const profileData = profileSnap.exists() ? profileSnap.data() : {};
            const role = profileData.role || "admin";
            
            if (role === "admin" || role === "super_admin") {
              adminLogin({
                id: firebaseUser.uid,
                email: firebaseUser.email || "",
                username: profileData.username || firebaseUser.email?.split("@")[0] || "Admin",
                avatar: profileData.avatar || "",
                role: role
              });
            } else {
              adminLogout();
            }
          } catch (e) {
            console.error("Error checking admin profile:", e);
            adminLogout();
            try {
              await auth.signOut();
            } catch (signOutErr) {
              console.error("Failed to sign out from Firebase after error:", signOutErr);
            }
          }
        } else {
          adminLogout();
        }
        setAdminLoading(false);
      });
    } catch (e) {
      console.error("Failed to initialize Firebase auth listener:", e);
      setAdminLoading(false);
    }

    // 2. Token check for Customer Auth
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCustomerLoading(false);
        customerLogout();
      } else {
        apiClient.get("/auth.php").then(({ data, error }) => {
          if (!mounted) return;
          if (!error && data && data.user) {
            const user = data.user;
            if (user.role !== "admin" && user.role !== "super_admin") {
              customerLogin(user);
            }
          } else {
            try { localStorage.removeItem("token"); } catch {}
            customerLogout();
          }
          setCustomerLoading(false);
        }).catch(() => {
          if (!mounted) return;
          try { localStorage.removeItem("token"); } catch {}
          customerLogout();
          setCustomerLoading(false);
        });
      }
    } catch (e) {
      console.error("Error during customer auth init:", e);
      setCustomerLoading(false);
      customerLogout();
    }

    return () => {
      mounted = false;
      unsubscribeFirebase();
    };
  }, [adminLogin, adminLogout, customerLogin, customerLogout, setAdminLoading, setCustomerLoading]);

  return null;
}
