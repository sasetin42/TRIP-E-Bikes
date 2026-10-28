/**
 * Opens WhatsApp directly.
 * 
 * Why this helper is essential:
 * 1. wa.me short URLs often trigger SSL "Your connection is not private" (NET::ERR_CERT_AUTHORITY_INVALID)
 *    on corporate proxies, regional ISPs, or older Windows root CA certificate stores.
 * 2. On mobile devices, whatsapp://send protocol directly invokes the native WhatsApp application 
 *    without passing through an intermediary browser redirect.
 * 3. On desktop or environments where the app protocol isn't caught, https://api.whatsapp.com/send
 *    has a globally-trusted DigiCert/Meta SSL certificate that avoids ERR_CERT_AUTHORITY_INVALID.
 */

export const WHATSAPP_PHONE = "639171228212";
export const WHATSAPP_DISPLAY_PHONE = "0917 122 8212";
export const WHATSAPP_DEFAULT_TEXT = "Hello TRIP Mobility! I would like to inquire about your e-bikes.";

export function getWhatsAppDirectUrl(
  phone: string = WHATSAPP_PHONE,
  text: string = WHATSAPP_DEFAULT_TEXT
): string {
  const encodedText = encodeURIComponent(text);
  // Using api.whatsapp.com provides 100% valid SSL across all browsers & networks
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;
}

export function openWhatsAppDirect(
  phone: string = WHATSAPP_PHONE,
  text: string = WHATSAPP_DEFAULT_TEXT,
  e?: React.MouseEvent
): void {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const encodedText = encodeURIComponent(text);
  const appUrl = `whatsapp://send?phone=${phone}&text=${encodedText}`;
  const webUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodedText}`;

  // Check if device is mobile
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );

  if (isMobile) {
    // Attempt native app redirect on mobile, fallback smoothly
    const start = Date.now();
    window.location.href = appUrl;
    setTimeout(() => {
      // If user is still on page after 1.2s, open official web link in new tab
      if (Date.now() - start < 2000 && !document.hidden) {
        window.open(webUrl, "_blank", "noopener,noreferrer");
      }
    }, 1200);
  } else {
    // On desktop, open official https://api.whatsapp.com directly (no SSL error)
    window.open(webUrl, "_blank", "noopener,noreferrer");
  }
}
