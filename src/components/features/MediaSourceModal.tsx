import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Search, Upload, Image as ImageIcon, Check, Loader2, 
  ChevronDown, RefreshCw, AlertCircle
} from "lucide-react";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
  size: number;
  uploadedAt: string;
  uploadedBy?: string;
}

interface MediaSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
  multiple?: boolean;
  acceptType?: "image" | "video";
}

const convertToWebP = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas 2d context"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("WebP conversion failed"));
            }
          },
          "image/webp",
          0.85
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

export default function MediaSourceModal({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  acceptType = "image",
}: MediaSourceModalProps) {
  const [activeTab, setActiveTab] = useState<"uploaded" | "computer">("uploaded");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date-newest" | "date-oldest" | "name-az" | "name-za" | "size-largest" | "size-smallest">("date-newest");
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  
  // Uploading states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadName, setUploadName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync media items from Firestore
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "media"),
      (querySnapshot) => {
        const list: MediaItem[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.type === acceptType) {
            list.push({
              id: docSnap.id,
              name: data.name || (acceptType === "video" ? "Unnamed Video" : "Unnamed Image"),
              url: data.url || "",
              type: data.type || acceptType,
              size: data.size || 0,
              uploadedAt: data.uploadedAt || new Date().toISOString(),
              uploadedBy: data.uploadedBy || "Admin",
            });
          }
        });
        setMedia(list);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to fetch media:", err);
        setLoading(false);
        toast.error("Failed to load media library.");
      }
    );

    return () => unsubscribe();
  }, [isOpen, acceptType]);

  // Reset states on open/close
  useEffect(() => {
    if (isOpen) {
      setSelectedUrls([]);
      setActiveTab("uploaded");
    }
  }, [isOpen]);

  // Filter and sort media items
  const filteredAndSortedMedia = [...media]
    .filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case "date-newest":
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case "date-oldest":
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case "name-az":
          return a.name.localeCompare(b.name);
        case "name-za":
          return b.name.localeCompare(a.name);
        case "size-largest":
          return b.size - a.size;
        case "size-smallest":
          return a.size - b.size;
        default:
          return 0;
      }
    });

  const toggleSelectUrl = (url: string) => {
    if (multiple) {
      setSelectedUrls((prev) => 
        prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
      );
    } else {
      setSelectedUrls([url]);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedUrls.length > 0) {
      onSelect(selectedUrls);
      onClose();
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const uploadedUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (acceptType === "video") {
        if (!file.type.startsWith("video/")) {
          toast.error(`File ${file.name} is not a valid video.`);
          continue;
        }
      } else {
        if (!file.type.startsWith("image/")) {
          toast.error(`File ${file.name} is not a valid image.`);
          continue;
        }
      }
      
      setUploadProgress(0);
      setUploadName(acceptType === "video" ? `Uploading ${file.name}...` : `Optimizing ${file.name}...`);

      try {
        let fileToUpload: File | Blob = file;
        let uploadFilename = file.name;

        if (acceptType === "image") {
          try {
            const webpBlob = await convertToWebP(file);
            fileToUpload = webpBlob;
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            uploadFilename = `${baseName}.webp`;
          } catch (optimizeErr) {
            console.warn("Failed to convert image to WebP, uploading original:", optimizeErr);
          }
        }

        setUploadName(uploadFilename);
        const storageFolder = acceptType === "video" ? "videos" : "images";
        const storagePath = `media/${storageFolder}/${Date.now()}_${uploadFilename}`;
        const storageRef = ref(storage, storagePath);
        
        const uploadTask = uploadBytesResumable(storageRef, fileToUpload);
        
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              setUploadProgress(progress);
            },
            (error) => reject(error),
            async () => {
              try {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                await addDoc(collection(db, "media"), {
                  name: uploadFilename,
                  url: downloadUrl,
                  type: acceptType,
                  size: fileToUpload.size,
                  uploadedAt: new Date().toISOString(),
                  uploadedBy: "Admin",
                });
                uploadedUrls.push(downloadUrl);
                resolve();
              } catch (e) {
                reject(e);
              }
            }
          );
        });

        toast.success(`Uploaded ${uploadFilename}`);
      } catch (err: unknown) {
        console.error("Upload failed:", err);
        const error = err as Error;
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    if (uploadedUrls.length > 0) {
      if (multiple) {
        setSelectedUrls((prev) => [...prev, ...uploadedUrls]);
      } else {
        setSelectedUrls([uploadedUrls[0]]);
      }
      // Switch back to library to view and confirm selection
      setActiveTab("uploaded");
    }

    setUploading(false);
    setUploadProgress(0);
    setUploadName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl h-[85vh] bg-[#0A0A0A] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl z-10"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="font-orbitron font-bold text-lg text-white tracking-wide">Select Media Asset</h2>
              <p className="text-xs text-gray-500 mt-1">Choose or upload product showcase images</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex px-5 border-b border-white/10 bg-[#111111]/50">
            <button
              onClick={() => setActiveTab("uploaded")}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all -mb-px ${
                activeTab === "uploaded" 
                  ? "border-[#39FF14] text-[#39FF14]" 
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              Uploaded Media
            </button>
            <button
              onClick={() => setActiveTab("computer")}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all -mb-px ${
                activeTab === "computer" 
                  ? "border-[#39FF14] text-[#39FF14]" 
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              <Upload className="w-4 h-4" />
              From Computer
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-5 min-h-0 bg-[#0F0F0F]">
            {activeTab === "uploaded" ? (
              <div className="flex flex-col h-full gap-4">
                {/* Search & Sort Panel */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search images by name..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#161616] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/50 transition-all"
                    />
                  </div>
                  <div className="relative shrink-0">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="appearance-none bg-[#161616] border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-[#39FF14]/50 transition-all cursor-pointer"
                    >
                      <option value="date-newest">Newest First</option>
                      <option value="date-oldest">Oldest First</option>
                      <option value="name-az">Name (A-Z)</option>
                      <option value="name-za">Name (Z-A)</option>
                      <option value="size-largest">Size (Largest)</option>
                      <option value="size-smallest">Size (Smallest)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Library Grid */}
                <div className="flex-1 min-h-0">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                      <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" />
                      <p className="text-xs text-gray-500">Loading library assets...</p>
                    </div>
                  ) : filteredAndSortedMedia.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 border border-dashed border-white/10 rounded-2xl p-6 text-center">
                      <ImageIcon className="w-10 h-10 text-gray-600 mb-3" />
                      <p className="text-sm font-medium text-gray-400">No images found</p>
                      <p className="text-xs text-gray-600 mt-1">Try another search or upload images from your computer.</p>
                    </div>
                  ) : (
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto max-h-[48vh] pr-1.5 scrollbar-thin">
                      {filteredAndSortedMedia.map((item) => {
                        const isSelected = selectedUrls.includes(item.url);
                        return (
                          <div 
                            key={item.id}
                            onClick={() => toggleSelectUrl(item.url)}
                            className={`group relative aspect-video rounded-xl overflow-hidden bg-[#161616] border cursor-pointer transition-all ${
                              isSelected 
                                ? "border-[#39FF14] shadow-[0_0_12px_rgba(57,255,20,0.15)] scale-[0.98]" 
                                : "border-white/5 hover:border-white/20"
                            }`}
                          >
                            {acceptType === "video" ? (
                              <video 
                                src={item.url} 
                                className="w-full h-full object-cover select-none pointer-events-none"
                              />
                            ) : (
                              <img 
                                src={item.url} 
                                alt={item.name} 
                                className="w-full h-full object-cover select-none"
                                loading="lazy"
                              />
                            )}
                            
                            {/* Overlay checkmark or hover indicator */}
                            {isSelected ? (
                              <div className="absolute inset-0 bg-[#39FF14]/15 flex items-center justify-center">
                                <div className="p-1.5 rounded-full bg-[#39FF14] text-[#0A0A0A] shadow-lg">
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </div>
                              </div>
                            ) : (
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                                <div className="w-full min-w-0 bg-[#0A0A0A]/90 backdrop-blur-md rounded-lg p-1.5 border border-white/10">
                                  <p className="text-[10px] text-white font-medium truncate">{item.name}</p>
                                  <p className="text-[9px] text-gray-500 mt-0.5">{formatSize(item.size)}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Upload Tab */
              <div className="flex flex-col items-center justify-center h-full max-h-[55vh] py-10">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept={acceptType === "video" ? "video/*" : "image/*"}
                  multiple={true}
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />

                {uploading ? (
                  <div className="w-full max-w-md bg-[#161616] border border-white/10 rounded-2xl p-6 text-center space-y-4">
                    <Loader2 className="w-10 h-10 text-[#39FF14] animate-spin mx-auto" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white truncate max-w-xs mx-auto">{uploadName}</p>
                      <p className="text-xs text-gray-500">Uploading to product media library</p>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-[#39FF14] h-full transition-all duration-300 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-mono text-gray-400 text-right">{uploadProgress}%</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-md aspect-video border-2 border-dashed border-white/10 hover:border-[#39FF14]/40 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all hover:bg-white/[0.02]"
                  >
                    <div className="p-4 rounded-full bg-white/5 border border-white/10 text-gray-400 group-hover:text-white">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div className="text-center px-4">
                      <p className="text-sm font-bold text-white">Upload from Device</p>
                      <p className="text-xs text-gray-500 mt-1">Drag and drop {acceptType === "video" ? "videos" : "images"}, or click to browse</p>
                      <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-widest">
                        {acceptType === "video" ? "MP4, WebM · Max 50MB" : "JPG, PNG, WebP · Max 20MB"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="p-5 border-t border-white/10 flex items-center justify-between bg-[#111111]/30">
            <span className="text-xs text-gray-500">
              {selectedUrls.length > 0 
                ? `${selectedUrls.length} file${selectedUrls.length > 1 ? "s" : ""} selected` 
                : "No files selected"}
            </span>
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="px-4 py-2 border border-white/10 text-xs font-bold text-gray-400 hover:text-white rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                disabled={selectedUrls.length === 0}
                onClick={handleConfirmSelection}
                className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
                  selectedUrls.length > 0 
                    ? "bg-[#39FF14] text-[#0A0A0A] hover:bg-white" 
                    : "bg-white/5 text-gray-600 cursor-not-allowed"
                }`}
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
