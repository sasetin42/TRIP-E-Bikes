import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface SystemSettingsData {
  site_title?: string;
  support_email?: string;
  support_phone?: string;
  default_currency?: string;
  operating_status?: string;
  brand_logo_main?: string;
  brand_logo_dark?: string;
  brand_favicon?: string;
  smtp_host?: string;
  smtp_port?: string;
  smtp_user?: string;
  smtp_pass?: string;
  smtp_encryption?: string;
  smtp_from_email?: string;
  smtp_from_name?: string;
  security_pw_policy?: string;
  security_mfa_enabled?: string;
  security_session_timeout?: string;
  security_rate_limit?: string;
  loyalty_program_enabled?: boolean | string;
  chat_enabled?: boolean | string;
  reviews_enabled?: boolean | string;
  referral_enabled?: boolean | string;
  hide_prices?: boolean | string;
  timezone?: string;
  [key: string]: any;
}

const DEFAULT_SETTINGS: SystemSettingsData = {
  site_title: "TRIP Mobility",
  support_email: "support@tripmobility.ph",
  support_phone: "+63 2 8123 4567",
  default_currency: "PHP",
  operating_status: "active",
  brand_logo_main: "",
  brand_logo_dark: "",
  brand_favicon: "",
  smtp_host: "smtp.resend.com",
  smtp_port: "587",
  smtp_user: "resend",
  smtp_pass: "",
  smtp_encryption: "TLS",
  smtp_from_email: "no-reply@tripmobility.ph",
  smtp_from_name: "TRIP Mobility",
  security_pw_policy: "medium",
  security_mfa_enabled: "false",
  security_session_timeout: "60",
  security_rate_limit: "true",
  loyalty_program_enabled: false,
  chat_enabled: false,
  reviews_enabled: false,
  referral_enabled: false,
  hide_prices: true,
  timezone: "Asia/Manila",
};

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const docRef = doc(db, "settings", "system");
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...docSnap.data() });
        } else {
          setSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error listening to system settings:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { settings, loading, error };
}
