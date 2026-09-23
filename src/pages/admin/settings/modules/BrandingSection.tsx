import React, { useState } from "react";
import { Upload, Trash2, Eye, RefreshCw, CheckCircle, Info, Image as ImageIcon, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import { SettingsService } from "@/services/settingsService";
import { SystemSettingsState } from "../types";
import MediaSourceModal from "@/components/features/MediaSourceModal";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
  saving: boolean;
}

interface LogoField {
  key: keyof SystemSettingsState;
  label: string;
  recommended: string;
  previewBg: string;
  aspectDesc: string;
  defaultFallback: string;
}

const LOGO_FIELDS: LogoField[] = [
  { key: "logo_main", label: "Main Brand Logo", recommended: "512 x 128 px (PNG / SVG)", previewBg: "bg-[#0A0A0A]", aspectDesc: "Primary logo for light and high-contrast dark surfaces", defaultFallback: "/logo-main.png" },
  { key: "logo_light", label: "Light Surface Logo", recommended: "512 x 128 px (PNG / SVG)", previewBg: "bg-white text-black", aspectDesc: "Optimized for white invoice documents and light banners", defaultFallback: "/logo-main.png" },
  { key: "logo_dark", label: "Dark Surface Logo", recommended: "512 x 128 px (PNG / SVG)", previewBg: "bg-[#141414]", aspectDesc: "Tailored for header navigation and dark UI elements", defaultFallback: "/logo-main.png" },
  { key: "logo_mobile", label: "Mobile Header Logo", recommended: "256 x 64 px (PNG / SVG)", previewBg: "bg-[#0F0F0F]", aspectDesc: "Compact icon/symbol for smartphones and tablet viewports", defaultFallback: "/logo-mark.png" },
  { key: "logo_favicon", label: "Browser Favicon", recommended: "64 x 64 px (ICO / PNG)", previewBg: "bg-black", aspectDesc: "Appears in browser tabs and bookmark bars", defaultFallback: "/favicon.ico" },
  { key: "logo_login", label: "Login Portal Brand", recommended: "400 x 160 px (PNG / SVG)", previewBg: "bg-[#0D0D0D]", aspectDesc: "Featured prominently on administrator sign-in gates", defaultFallback: "/logo-main.png" },
  { key: "logo_email", label: "Email Header Logo", recommended: "300 x 80 px (PNG)", previewBg: "bg-white text-black", aspectDesc: "Used in customer quote confirmations and notifications", defaultFallback: "/logo-main.png" },
  { key: "logo_invoice", label: "Official Receipt / Invoice Logo", recommended: "400 x 100 px (Vector/PNG)", previewBg: "bg-white text-black", aspectDesc: "Rendered at top-left of PDF sales invoices and quotations", defaultFallback: "/logo-main.png" },
  { key: "logo_admin", label: "Admin Sidebar Logo", recommended: "240 x 60 px (SVG)", previewBg: "bg-[#161616]", aspectDesc: "Top-left branding mark inside TRIP Admin dashboard", defaultFallback: "/logo-mark.png" },
];

export const BrandingSection: React.FC<Props> = ({ settings, onChange, onSave, saving }) => {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [previewContext, setPreviewContext] = useState<"header" | "login" | "email" | "invoice">("header");
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // Media Library Picker state
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [targetFieldKey, setTargetFieldKey] = useState<keyof SystemSettingsState | null>(null);

  const handleUpload = async (key: keyof SystemSettingsState, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error("File exceeds 8MB limit. Please upload an optimized image.");
      return;
    }

    setUploadingKey(String(key));
    try {
      const ext = file.name.split(".").pop() || "png";
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `branding/${String(key)}_${Date.now()}_${sanitizedName}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type || "image/png",
      });

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (err) => reject(err),
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);

              // 1. Update form state
              onChange({ [key]: downloadUrl });

              // 2. Clear broken image flag if previously set
              setBrokenImages((prev) => ({ ...prev, [key]: false }));

              // 3. Register asset in Firestore 'media' collection for Media Library reuse
              try {
                await addDoc(collection(db, "media"), {
                  name: `Brand Logo: ${String(key)}`,
                  url: downloadUrl,
                  type: "image",
                  size: file.size,
                  uploadedAt: new Date().toISOString(),
                  uploadedBy: "Super Admin",
                });
              } catch (mediaErr) {
                console.warn("Could not register into media collection:", mediaErr);
              }

              // 4. Auto-save immediately to Firestore settings/system
              try {
                await SettingsService.saveSettings({ [key]: downloadUrl }, "Branding & Logos", "Super Admin");
              } catch (fsErr) {
                console.warn("Auto-save to Firestore failed:", fsErr);
              }

              toast.success(`${key.toString().replace("logo_", "").toUpperCase()} successfully stored in Firebase!`);
              resolve();
            } catch (urlErr) {
              reject(urlErr);
            }
          }
        );
      });
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast.error("Upload to Firebase Storage failed: " + err.message);
    }
    setUploadingKey(null);
  };

  const handleSelectFromMedia = (urls: string[]) => {
    if (!targetFieldKey || urls.length === 0) return;
    const selectedUrl = urls[0];
    onChange({ [targetFieldKey]: selectedUrl });
    setBrokenImages((prev) => ({ ...prev, [targetFieldKey]: false }));

    // Persist to Firestore
    SettingsService.saveSettings({ [targetFieldKey]: selectedUrl }, "Branding & Logos", "Super Admin")
      .then(() => {
        toast.success(`Selected asset saved to Firebase Firestore for ${targetFieldKey}!`);
      })
      .catch((e) => toast.error("Could not save to Firestore: " + e.message));

    setTargetFieldKey(null);
  };

  const handleRemove = async (key: keyof SystemSettingsState) => {
    onChange({ [key]: "" });
    setBrokenImages((prev) => ({ ...prev, [key]: false }));
    try {
      await SettingsService.saveSettings({ [key]: "" }, "Branding & Logos", "Super Admin");
      toast.info("Brand asset cleared and updated in Firestore.");
    } catch {
      toast.info("Brand asset cleared");
    }
  };

  const handleImageError = (keyStr: string) => {
    setBrokenImages((prev) => ({ ...prev, [keyStr]: true }));
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold font-orbitron text-white">Branding & Logo Assets</h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 font-semibold uppercase">
              Firebase Storage & Firestore Live
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Manage official visual assets for header banners, login screens, customer receipts, and email digests. All uploads are stored in Firebase Storage and synchronized across Firestore.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-black font-orbitron font-bold text-xs hover:bg-[#4FFF2A] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            Save Brand Assets
          </button>
        </div>
      </div>

      {/* Grid of Logo Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {LOGO_FIELDS.map(({ key, label, recommended, previewBg, aspectDesc, defaultFallback }) => {
          const rawVal = settings[key] as string;
          const isBroken = !!brokenImages[String(key)];
          const hasCustomUrl = Boolean(rawVal && rawVal.trim() && !isBroken);
          const displayUrl = hasCustomUrl ? rawVal : defaultFallback;
          const isUploading = uploadingKey === String(key);

          return (
            <div
              key={key}
              className="bg-[#0E0E0E] border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-white/20 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-xs text-white">{label}</span>
                  {hasCustomUrl ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/30 font-semibold">
                      Firebase Active
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 font-medium">
                      Default Asset
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mb-3">{aspectDesc}</p>

                {/* Image Display Surface */}
                <div className={"h-28 w-full rounded-xl border border-white/10 flex items-center justify-center p-3 relative overflow-hidden " + previewBg}>
                  <img
                    src={displayUrl}
                    alt={label}
                    onError={() => handleImageError(String(key))}
                    className="max-h-full max-w-full object-contain drop-shadow transition-transform group-hover:scale-105"
                  />

                  {isUploading && (
                    <div className="absolute inset-0 bg-black/85 flex items-center justify-center gap-2 text-[#39FF14] text-xs font-semibold">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Uploading to Firebase...
                    </div>
                  )}
                </div>

                <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-gray-400">
                  <Info className="w-3 h-3 text-[#39FF14]" />
                  <span>Recommended: {recommended}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                {/* Upload from Computer */}
                <label className="flex-1 text-center py-2 px-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-200 hover:text-white cursor-pointer transition-all flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#39FF14]" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    className="hidden"
                    onChange={(e) => handleUpload(key, e)}
                  />
                </label>

                {/* Select from Firebase Media Library */}
                <button
                  type="button"
                  onClick={() => {
                    setTargetFieldKey(key);
                    setMediaPickerOpen(true);
                  }}
                  title="Choose from Firebase Media Library"
                  className="py-2 px-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center justify-center gap-1"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline text-[11px]">Library</span>
                </button>

                {/* Clear / Reset */}
                {rawVal && (
                  <button
                    onClick={() => handleRemove(key)}
                    className="p-2 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                    title="Reset to default asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Mockup Context Simulator */}
      <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl p-6 space-y-4 bg-gradient-to-br from-white/2 to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#39FF14]" />
            <h3 className="font-orbitron font-bold text-xs uppercase tracking-wider text-white">
              Live Mockup Context Simulator
            </h3>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl gap-1">
            {(["header", "login", "email", "invoice"] as const).map((ctx) => (
              <button
                key={ctx}
                onClick={() => setPreviewContext(ctx)}
                className={"px-3 py-1 text-[11px] font-semibold rounded-lg capitalize transition-all " +
                  (previewContext === ctx ? "bg-[#39FF14] text-black font-bold" : "text-gray-400 hover:text-white")
                }
              >
                {ctx}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/5 bg-black/40 min-h-[140px] flex items-center justify-center">
          {previewContext === "header" && (
            <div className="w-full p-4 rounded-xl bg-[#0F0F0F] border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={settings.logo_dark || settings.logo_main || "/logo-main.png"}
                  alt="Header Preview"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo-main.png"; }}
                  className="h-7 object-contain"
                />
              </div>
              <div className="flex gap-4 text-xs text-gray-400">
                <span>E-Bikes Fleet</span>
                <span>Subscriptions</span>
                <span>Locations</span>
                <span className="text-[#39FF14]">Reserve Now</span>
              </div>
            </div>
          )}

          {previewContext === "login" && (
            <div className="max-w-xs mx-auto p-6 rounded-2xl bg-[#141414] border border-white/10 text-center space-y-4">
              <div className="flex justify-center">
                <img
                  src={settings.logo_login || settings.logo_main || "/logo-main.png"}
                  alt="Login Preview"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo-main.png"; }}
                  className="h-10 object-contain"
                />
              </div>
              <p className="text-xs text-gray-400">Admin Fleet Portal Access</p>
              <div className="space-y-2 text-left">
                <div className="h-8 rounded-lg bg-white/5 border border-white/10 px-3 flex items-center text-xs text-gray-500">admin@tripmobility.ph</div>
                <div className="h-8 rounded-lg bg-white/5 border border-white/10 px-3 flex items-center text-xs text-gray-500">••••••••••••</div>
                <div className="h-8 rounded-lg bg-[#39FF14] text-black font-bold text-xs flex items-center justify-center">Sign In</div>
              </div>
            </div>
          )}

          {previewContext === "email" && (
            <div className="max-w-md mx-auto p-6 rounded-2xl bg-white text-black text-left space-y-3">
              <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
                <img
                  src={settings.logo_email || settings.logo_light || settings.logo_main || "/logo-main.png"}
                  alt="Email Preview"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo-main.png"; }}
                  className="h-8 object-contain"
                />
                <span className="text-[10px] text-gray-500">Official Confirmation</span>
              </div>
              <p className="text-xs font-semibold text-gray-800">Hi Carlos, your E-Bike fleet quote is ready!</p>
              <p className="text-[11px] text-gray-600">Please review the attached specifications and battery warranty terms.</p>
            </div>
          )}

          {previewContext === "invoice" && (
            <div className="max-w-lg mx-auto p-6 rounded-2xl bg-white text-black text-left space-y-4">
              <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                <div>
                  <img
                    src={settings.logo_invoice || settings.logo_light || "/logo-main.png"}
                    alt="Invoice Logo"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/logo-main.png"; }}
                    className="h-10 object-contain"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">{settings.company_address || "BGC, Taguig City, Philippines"}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-900">INVOICE #INV-2026-088</span>
                  <p className="text-[10px] text-gray-500">TIN: {settings.company_tax_id || "009-876-543-000"}</p>
                </div>
              </div>
              <div className="text-[11px] text-gray-700 flex justify-between">
                <span>TRIP Apex Commuter E-Bike (Qty: 2)</span>
                <span className="font-bold">₱150,000.00</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Firebase Media Library Picker Modal */}
      {mediaPickerOpen && (
        <MediaSourceModal
          isOpen={mediaPickerOpen}
          onClose={() => {
            setMediaPickerOpen(false);
            setTargetFieldKey(null);
          }}
          onSelect={handleSelectFromMedia}
          multiple={false}
          acceptType="image"
        />
      )}
    </div>
  );
};
