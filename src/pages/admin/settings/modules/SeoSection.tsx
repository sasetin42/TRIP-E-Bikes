import React, { useState } from "react";
import { CheckCircle, RefreshCw, Search, Upload, FolderOpen, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import { SystemSettingsState } from "../types";
import MediaSourceModal from "@/components/features/MediaSourceModal";

interface Props {
  settings: SystemSettingsState;
  onChange: (patch: Partial<SystemSettingsState>) => void;
  onSave: () => void;
  saving: boolean;
}

export const SeoSection: React.FC<Props> = ({ settings, onChange, onSave, saving }) => {
  const [uploadingOg, setUploadingOg] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  const handleOgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error("File exceeds 8MB limit. Please upload an optimized image.");
      return;
    }

    setUploadingOg(true);
    try {
      const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `seo/og_${Date.now()}_${sanitized}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type || "image/png" });

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (err) => reject(err),
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              onChange({ seo_og_image: url });
              await addDoc(collection(db, "media"), {
                name: `OpenGraph Image: ${sanitized}`,
                url,
                type: "image",
                size: file.size,
                uploadedAt: new Date().toISOString(),
                uploadedBy: "Admin",
              });
              toast.success("Social preview image uploaded to Firebase Storage!");
              resolve();
            } catch (uErr) {
              reject(uErr);
            }
          }
        );
      });
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    }
    setUploadingOg(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold font-orbitron text-white">Global SEO & Social Graph Metadata</h2>
          <p className="text-xs text-gray-400 mt-1">
            Search engine metadata, OpenGraph previews, robots indexing directives, and Google Search Console verification.
          </p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-[#39FF14] text-black font-orbitron font-bold text-xs hover:bg-[#4FFF2A] transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Save SEO Settings
        </button>
      </div>

      {/* Google Search Result Simulation */}
      <div className="bg-[#0E0E0E] border border-white/10 rounded-2xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-orbitron font-bold text-white mb-2">
          <Search className="w-4 h-4 text-[#39FF14]" /> Google Search Result Simulation
        </div>
        <div className="p-4 rounded-xl bg-[#1f1f1f] border border-white/10 space-y-1">
          <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
            <span>https://tripmobility.ph</span>
            <span>›</span>
            <span>fleet</span>
          </div>
          <h3 className="text-sm font-semibold text-[#8ab4f8] hover:underline cursor-pointer">
            {settings.seo_site_title || "TRIP E-Bikes | Sustainable Urban Mobility Philippines"}
          </h3>
          <p className="text-xs text-[#bdc1c6] line-clamp-2">
            {settings.seo_meta_description || "Discover modern electric bikes, fleet leasing, and eco-friendly micro-mobility solutions in the Philippines."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Global Title Tag (SEO)</label>
          <input
            type="text"
            value={settings.seo_site_title}
            onChange={(e) => onChange({ seo_site_title: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Target Keywords (Comma Separated)</label>
          <input
            type="text"
            value={settings.seo_keywords}
            onChange={(e) => onChange({ seo_keywords: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-gray-300">Meta Description</label>
          <textarea
            rows={3}
            value={settings.seo_meta_description}
            onChange={(e) => onChange({ seo_meta_description: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 resize-none"
          />
        </div>

        {/* OpenGraph Image with Firebase Upload & Media Picker */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-gray-300">Open Graph Social Image (Facebook, Twitter, LinkedIn Previews)</label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://..."
              value={settings.seo_og_image || ""}
              onChange={(e) => onChange({ seo_og_image: e.target.value })}
              className="flex-1 bg-[#141414] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 font-mono"
            />
            <label className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 hover:text-white cursor-pointer transition-all flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-[#39FF14]" />
              <span>{uploadingOg ? "Uploading..." : "Upload"}</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                disabled={uploadingOg}
                onChange={handleOgUpload}
              />
            </label>
            <button
              type="button"
              onClick={() => setMediaModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 hover:text-white transition-all flex items-center gap-1.5"
            >
              <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Media Library</span>
            </button>
          </div>
          {settings.seo_og_image && (
            <div className="mt-2 h-24 w-44 rounded-xl border border-white/10 overflow-hidden bg-black/50 p-1">
              <img
                src={settings.seo_og_image}
                alt="OG Preview"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Google Site Verification Token</label>
          <input
            type="text"
            value={settings.seo_google_site_verification}
            onChange={(e) => onChange({ seo_google_site_verification: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#39FF14]/40 font-mono"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-semibold text-gray-300">Robots.txt Directives</label>
          <textarea
            rows={4}
            value={settings.seo_robots_txt}
            onChange={(e) => onChange({ seo_robots_txt: e.target.value })}
            className="w-full bg-[#141414] border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-[#39FF14]/40"
          />
        </div>
      </div>

      {mediaModalOpen && (
        <MediaSourceModal
          isOpen={mediaModalOpen}
          onClose={() => setMediaModalOpen(false)}
          onSelect={(urls) => {
            if (urls.length > 0) {
              onChange({ seo_og_image: urls[0] });
              toast.success("OG Social Image updated from Media Library!");
            }
          }}
          multiple={false}
          acceptType="image"
        />
      )}
    </div>
  );
};
