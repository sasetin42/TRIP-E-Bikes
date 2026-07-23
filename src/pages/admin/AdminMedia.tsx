import { useState, useEffect, useRef, useCallback } from "react";
import { collection, onSnapshot, doc, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { 
  Upload, Image as ImageIcon, Film, Trash2, Copy, Check, Eye, Loader2, 
  Search, Play, AlertCircle, FileVideo, HardDrive, X, Grid, List, Download,
  ChevronLeft, ChevronRight
} from "lucide-react";
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

export default function AdminMedia() {
  const { user } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "images" | "videos">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);

  // New Enhancement States
  const [sortBy, setSortBy] = useState<"date-newest" | "date-oldest" | "size-largest" | "size-smallest" | "name-az" | "name-za">("date-newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Upload States
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadName, setUploadName] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Renaming States
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editNameVal, setEditNameVal] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Real-time synchronization from Firestore media collection
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "media"),
      (querySnapshot) => {
        const list: MediaItem[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            name: data.name || "Unnamed File",
            url: data.url || "",
            type: data.type || "image",
            size: data.size || 0,
            uploadedAt: data.uploadedAt || new Date().toISOString(),
            uploadedBy: data.uploadedBy || "Admin",
          });
        });
        setMedia(list);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to sync media list:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Copy helper
  const handleCopyLink = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Upload Files handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    // Upload files sequentially to manage progress smoothly
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      
      if (!isImage && !isVideo) {
        toast.error(`File ${file.name} is not a valid image or video.`);
        continue;
      }
      
      setUploadProgress(0);

      try {
        let fileToUpload: File | Blob = file;
        let uploadFilename = file.name;

        if (isImage) {
          setUploadName(`Optimizing image: ${file.name}...`);
          try {
            const webpBlob = await convertToWebP(file);
            fileToUpload = webpBlob;
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            uploadFilename = `${baseName}.webp`;
          } catch (optimizeErr) {
            console.warn("Failed to convert image to WebP, uploading original:", optimizeErr);
            fileToUpload = file;
            uploadFilename = file.name;
          }
        }
        
        setUploadName(uploadFilename);
        const folder = isVideo ? "videos" : "images";
        const storagePath = `media/${folder}/${Date.now()}_${uploadFilename}`;
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
            (error) => {
              reject(error);
            },
            async () => {
              try {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                // Save metadata record in Firestore media list
                await addDoc(collection(db, "media"), {
                  name: uploadFilename,
                  url: downloadUrl,
                  type: isVideo ? "video" : "image",
                  size: fileToUpload.size,
                  uploadedAt: new Date().toISOString(),
                  uploadedBy: user?.username || user?.email || "Admin",
                });
                resolve();
              } catch (e) {
                reject(e);
              }
            }
          );
        });
        
        toast.success(`Uploaded ${uploadFilename} successfully!`);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Upload failure:", error);
        toast.error(`Failed to upload ${file.name}: ` + error.message);
      }
    }
    
    setUploading(false);
    setUploadProgress(0);
    setUploadName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Delete handler
  const handleDelete = async (item: MediaItem) => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete ${item.name}?`);
    if (!confirmDelete) return;

    try {
      // 1. Delete Firestore metadata record first
      await deleteDoc(doc(db, "media", item.id));
      
      // 2. Try to delete the file object in Storage if it contains firebasestorage references
      if (item.url.includes("firebasestorage")) {
        try {
          const fileRef = ref(storage, item.url);
          await deleteObject(fileRef);
        } catch (storageErr) {
          console.warn("Storage deletion skipped or failed (file may not exist):", storageErr);
        }
      }
      
      // Remove from selected list if deleted
      setSelectedIds(prev => prev.filter(id => id !== item.id));
      toast.success("Media deleted successfully.");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error("Failed to delete media: " + error.message);
    }
  };

  // Rename media handler
  const handleRenameMedia = async (itemId: string, newName: string) => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSavingName(true);
    try {
      await updateDoc(doc(db, "media", itemId), {
        name: newName.trim()
      });
      toast.success("Media renamed successfully!");
      setEditingNameId(null);
      // Update local preview state to display renamed title immediately
      if (previewItem && previewItem.id === itemId) {
        setPreviewItem(prev => prev ? { ...prev, name: newName.trim() } : null);
      }
    } catch (err: any) {
      toast.error("Failed to rename media: " + err.message);
    } finally {
      setSavingName(false);
    }
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    const count = selectedIds.length;
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete these ${count} items?`);
    if (!confirmDelete) return;

    const toastId = toast.loading(`Deleting ${count} items...`);
    let succeeded = 0;
    let failed = 0;

    for (const id of selectedIds) {
      const item = media.find(m => m.id === id);
      if (!item) continue;
      try {
        await deleteDoc(doc(db, "media", item.id));
        if (item.url.includes("firebasestorage")) {
          try {
            const fileRef = ref(storage, item.url);
            await deleteObject(fileRef);
          } catch (storageErr) {
            console.warn("Storage deletion failed/skipped for bulk item:", storageErr);
          }
        }
        succeeded++;
      } catch (err) {
        console.error("Failed to delete item in bulk:", id, err);
        failed++;
      }
    }

    setSelectedIds([]);
    toast.dismiss(toastId);
    if (failed === 0) {
      toast.success(`Successfully deleted all ${succeeded} items.`);
    } else {
      toast.error(`Deleted ${succeeded} items; ${failed} failed to delete.`);
    }
  };

  const handleBulkCopyLinks = () => {
    const urls = selectedIds
      .map(id => media.find(m => m.id === id)?.url)
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(urls);
    toast.success(`Copied ${selectedIds.length} link(s) to clipboard!`);
  };

  // Formatting helpers
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Filter and sort media dynamically
  const sortedAndFilteredMedia = [...media]
    .filter((item) => {
      const matchesTab = 
        activeTab === "all" || 
        (activeTab === "images" && item.type === "image") || 
        (activeTab === "videos" && item.type === "video");
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-newest":
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        case "date-oldest":
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        case "size-largest":
          return b.size - a.size;
        case "size-smallest":
          return a.size - b.size;
        case "name-az":
          return a.name.localeCompare(b.name);
        case "name-za":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  // Direct download utility
  const handleDownload = async (item: MediaItem) => {
    const toastId = toast.loading(`Starting download: ${item.name}...`);
    try {
      const response = await fetch(item.url);
      if (!response.ok) throw new Error("Network response was not OK");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.dismiss(toastId);
      toast.success("Download started!");
    } catch (err) {
      console.warn("Direct blob download failed, falling back to new tab:", err);
      window.open(item.url, "_blank");
      toast.dismiss(toastId);
      toast.success("Fallback download opened in a new tab.");
    }
  };

  // Helper to toggle checkbox selection
  const toggleSelect = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Lightbox Modal Pagination Helpers
  const currentPreviewIndex = sortedAndFilteredMedia.findIndex(item => item.id === previewItem?.id);

  const handlePrev = useCallback(() => {
    if (currentPreviewIndex > 0) {
      setPreviewItem(sortedAndFilteredMedia[currentPreviewIndex - 1]);
    } else {
      setPreviewItem(sortedAndFilteredMedia[sortedAndFilteredMedia.length - 1]);
    }
  }, [currentPreviewIndex, sortedAndFilteredMedia]);

  const handleNext = useCallback(() => {
    if (currentPreviewIndex < sortedAndFilteredMedia.length - 1) {
      setPreviewItem(sortedAndFilteredMedia[currentPreviewIndex + 1]);
    } else {
      setPreviewItem(sortedAndFilteredMedia[0]);
    }
  }, [currentPreviewIndex, sortedAndFilteredMedia]);

  // Keyboard navigation inside Lightbox
  useEffect(() => {
    if (!previewItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        setPreviewItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewItem, handlePrev, handleNext]);

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div 
      className="animate-fade-in pb-24 relative min-h-[500px]"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Neon Zone Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-[#000]/85 backdrop-blur-sm z-50 rounded-2xl border-2 border-dashed border-[#39FF14] flex flex-col items-center justify-center gap-4 transition-all duration-300 pointer-events-none shadow-[0_0_30px_rgba(57,255,20,0.2)_inset]">
          <Upload className="w-12 h-12 text-[#39FF14] animate-bounce" />
          <h3 className="font-orbitron font-bold text-lg text-white">Drop files to upload</h3>
          <p className="text-gray-400 text-xs">Supports images and videos</p>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 border-b border-white/5 pb-6 gap-4">
        <div>
          <h1 className="font-orbitron font-bold text-2xl text-white">Media Library</h1>
          <p className="text-gray-500 text-xs mt-1.5 font-medium">Upload, organize, and query dynamic content references</p>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            id="media-upload"
            name="file"
            multiple
            accept="image/*,video/*"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-primary text-xs flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Upload Media
          </button>
        </div>
      </div>

      {/* Progress Overlay bar for active upload tasks */}
      {uploading && (
        <div className="mb-6 p-4 rounded-xl bg-[#39FF14]/5 border border-[#39FF14]/20 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold truncate">Uploading: {uploadName}</p>
            <div className="w-full bg-white/5 h-2.5 rounded-full mt-2 overflow-hidden border border-white/5">
              <div 
                className="bg-[#39FF14] h-full rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(57,255,20,0.5)]" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[#39FF14] font-orbitron font-bold text-sm">{uploadProgress}%</span>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold mt-1">Processing...</p>
          </div>
        </div>
      )}

      {/* Library Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 bg-[#0D0D0D] p-3 rounded-xl border border-white/5">
        <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5 w-full md:w-auto h-10 items-center">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 md:flex-none px-4 h-8 flex items-center justify-center rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "all" ? "bg-[#39FF14]/15 text-[#39FF14]" : "text-gray-400 hover:text-white"
            }`}
          >
            All Media
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`flex-1 md:flex-none px-4 h-8 flex items-center justify-center rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "images" ? "bg-[#39FF14]/15 text-[#39FF14]" : "text-gray-400 hover:text-white"
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`flex-1 md:flex-none px-4 h-8 flex items-center justify-center rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "videos" ? "bg-[#39FF14]/15 text-[#39FF14]" : "text-gray-400 hover:text-white"
            }`}
          >
            Videos
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:flex-initial md:w-64">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="media-search"
              name="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search media files..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 h-10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/30"
            />
          </div>

          {/* Sorting Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date-newest" | "date-oldest" | "size-largest" | "size-smallest" | "name-az" | "name-za")}
            className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 h-10 text-xs text-white focus:outline-none focus:border-[#39FF14]/30"
          >
            <option value="date-newest" className="bg-[#0d0d0d]">Date: Newest First</option>
            <option value="date-oldest" className="bg-[#0d0d0d]">Date: Oldest First</option>
            <option value="size-largest" className="bg-[#0d0d0d]">Size: Largest First</option>
            <option value="size-smallest" className="bg-[#0d0d0d]">Size: Smallest First</option>
            <option value="name-az" className="bg-[#0d0d0d]">Name: A to Z</option>
            <option value="name-za" className="bg-[#0d0d0d]">Name: Z to A</option>
          </select>

          {/* Grid / List View Toggle */}
          <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 h-10 items-center">
            <button
              onClick={() => setViewMode("grid")}
              className={`h-8 w-8 flex items-center justify-center rounded transition-all ${
                viewMode === "grid" ? "bg-[#39FF14]/15 text-[#39FF14]" : "text-gray-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`h-8 w-8 flex items-center justify-center rounded transition-all ${
                viewMode === "list" ? "bg-[#39FF14]/15 text-[#39FF14]" : "text-gray-400 hover:text-white"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content View (Grid or List) */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-[50px] gap-3">
          <Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" />
          <p className="text-gray-500 text-xs font-medium">Synchronizing media assets...</p>
        </div>
      ) : sortedAndFilteredMedia.length === 0 ? (
        <div className="text-center py-[50px] rounded-2xl border border-white/5 bg-white/1">
          <HardDrive className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-xs font-medium">No matching media files found in your library.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedAndFilteredMedia.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setPreviewItem(item)}
              className={`group relative aspect-square rounded-xl bg-black/40 border transition-all flex flex-col justify-end cursor-pointer overflow-hidden ${
                selectedIds.includes(item.id)
                  ? "border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.2)]"
                  : "border-white/5 hover:border-[#39FF14]/30 hover:shadow-[0_0_15px_rgba(57,255,20,0.15)]"
              }`}
            >
              {/* Checkbox Overlay */}
              <div 
                onClick={(e) => toggleSelect(item.id, e)}
                className="absolute top-2 left-2 z-40 p-1 rounded-lg bg-black/60 hover:bg-black/80 border border-white/10 transition-colors cursor-pointer"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  selectedIds.includes(item.id) 
                    ? "border-[#39FF14] bg-[#39FF14]/20 text-[#39FF14]" 
                    : "border-white/30 bg-transparent text-transparent"
                }`}>
                  {selectedIds.includes(item.id) && <Check className="w-3 h-3 animate-fade-in" strokeWidth={3} />}
                </div>
              </div>

              {/* Media Thumbnail */}
              {item.type === "video" ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <video 
                    src={item.url} 
                    muted 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover opacity-80" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                  <div className="w-10 h-10 rounded-full bg-black/80 border border-[#39FF14]/30 flex items-center justify-center z-20 group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 text-[#39FF14]" fill="#39FF14" />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0">
                  <img 
                    src={item.url} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                </div>
              )}

              {/* Top Hover Info Badge */}
              <div className="absolute top-2 right-2 z-20">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  item.type === "video" 
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                    : "bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20"
                }`}>
                  {item.type}
                </span>
              </div>

              {/* Details Overlay Block */}
              <div className="relative z-20 p-3 flex flex-col justify-end min-h-[60px]">
                <p className="text-white text-xs font-semibold truncate mb-1">{item.name}</p>
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium">
                  <span>{formatSize(item.size)}</span>
                  <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Hover Quick Actions overlay */}
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-between p-4">
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex flex-col gap-1.5 text-left">
                    <p className="text-white text-xs font-bold break-all line-clamp-2">{item.name}</p>
                    <p className="text-[10px] text-gray-500 truncate">By: {item.uploadedBy || "Admin"}</p>
                    <p className="text-[9px] text-[#39FF14] font-semibold">{formatSize(item.size)}</p>
                  </div>
                  
                  {/* Central interactive play/preview trigger icon */}
                  <div className="flex items-center justify-center my-2">
                    <div className="w-12 h-12 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 flex items-center justify-center hover:scale-110 hover:bg-[#39FF14]/20 transition-all shadow-[0_0_15px_rgba(57,255,20,0.15)]">
                      {item.type === "video" ? (
                        <Play className="w-5 h-5 text-[#39FF14]" fill="#39FF14" />
                      ) : (
                        <Eye className="w-5 h-5 text-[#39FF14]" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLink(item);
                    }}
                    className="flex-1 py-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 hover:border-[#39FF14]/30 hover:bg-[#39FF14]/5 text-gray-400 hover:text-white transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    title="Copy URL link"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#39FF14]" />
                        <span className="text-[9px] text-[#39FF14] font-bold uppercase tracking-wider">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Copy URL</span>
                      </>
                    )}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewItem(item);
                    }}
                    className="p-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all active:scale-95"
                    title="Preview Media"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item);
                    }}
                    className="p-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 hover:border-red-500/20 hover:bg-red-500/5 text-gray-400 hover:text-red-400 transition-all active:scale-95"
                    title="Delete Media"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View Layout */
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-[#0D0D0D]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-black/40 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={sortedAndFilteredMedia.length > 0 && sortedAndFilteredMedia.every(item => selectedIds.includes(item.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(prev => {
                          const newIds = [...prev];
                          sortedAndFilteredMedia.forEach(item => {
                            if (!newIds.includes(item.id)) newIds.push(item.id);
                          });
                          return newIds;
                        });
                      } else {
                        setSelectedIds(prev => prev.filter(id => !sortedAndFilteredMedia.some(item => item.id === id)));
                      }
                    }}
                    className="rounded border-white/30 bg-transparent text-[#39FF14] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-4">Asset</th>
                <th className="p-4">Type</th>
                <th className="p-4">Uploaded At</th>
                <th className="p-4">File Size</th>
                <th className="p-4">By</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-gray-300">
              {sortedAndFilteredMedia.map((item) => (
                <tr 
                  key={item.id}
                  className={`hover:bg-white/5 transition-colors group ${selectedIds.includes(item.id) ? "bg-[#39FF14]/5" : ""}`}
                >
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="rounded border-white/30 bg-transparent text-[#39FF14] focus:ring-0 cursor-pointer"
                    />
                  </td>
                  <td className="p-4 font-medium text-white max-w-xs">
                    <div className="flex items-center gap-3" onClick={() => setPreviewItem(item)}>
                      <div className="w-10 h-10 rounded overflow-hidden bg-black/40 flex-shrink-0 flex items-center justify-center border border-white/5 relative">
                        {item.type === "video" ? (
                          <>
                            <video src={item.url} className="w-full h-full object-cover opacity-60" />
                            <Play className="w-3 h-3 text-[#39FF14] absolute" fill="#39FF14" />
                          </>
                        ) : (
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="truncate hover:text-[#39FF14] cursor-pointer">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      item.type === "video" 
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                        : "bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20"
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(item.uploadedAt).toLocaleString()}</td>
                  <td className="p-4 text-gray-400 font-mono">{formatSize(item.size)}</td>
                  <td className="p-4 text-gray-500">{item.uploadedBy || "Admin"}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPreviewItem(item)}
                        className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyLink(item)}
                        className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        title="Copy Link"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-[#39FF14]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDownload(item)}
                        className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-[#39FF14] transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating glowing bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-[#0A0A0A] border border-[#39FF14]/40 px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.15)] animate-in slide-in-from-bottom duration-300">
          <span className="text-white text-xs font-semibold">
            {selectedIds.length} item(s) selected
          </span>
          <div className="w-[1px] h-4 bg-white/10" />
          <button
            onClick={handleBulkCopyLinks}
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-[#39FF14] transition-colors font-medium"
          >
            <Copy className="w-3.5 h-3.5" /> Copy URLs
          </button>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-red-400 transition-colors font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Selected
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="text-xs text-gray-500 hover:text-white transition-colors font-medium ml-2"
          >
            Deselect All
          </button>
        </div>
      )}

      {/* Fullscreen Media Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl neon-trail-border-container p-[2px] rounded-2xl shadow-2xl relative z-10">
            <div className="rounded-[14px] bg-[#0A0A0A] overflow-hidden flex flex-col relative">
              <button 
                onClick={() => setPreviewItem(null)} 
                className="absolute top-5 right-6 text-gray-500 hover:text-white transition-colors z-50 p-2.5 bg-white/5 backdrop-blur-md rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-[#39FF14]/20 border border-white/10 hover:border-[#39FF14]/50 text-gray-400 hover:text-[#39FF14] transition-all"
                title="Previous Asset"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/60 hover:bg-[#39FF14]/20 border border-white/10 hover:border-[#39FF14]/50 text-gray-400 hover:text-[#39FF14] transition-all"
                title="Next Asset"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="flex-1 bg-black/60 flex items-center justify-center min-h-[300px] max-h-[70vh] p-4">
                {previewItem.type === "video" ? (
                  <video 
                    src={previewItem.url} 
                    controls 
                    autoPlay 
                    className="max-w-full max-h-[60vh] rounded-lg" 
                  />
                ) : (
                  <img 
                    src={previewItem.url} 
                    alt={previewItem.name} 
                    className="max-w-full max-h-[60vh] object-contain rounded-lg" 
                  />
                )}
              </div>

              <div className="p-6 border-t border-white/5 bg-[#0D0D0D] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {editingNameId === previewItem.id ? (
                    <div className="flex items-center gap-2 max-w-md">
                      <input
                        type="text"
                        value={editNameVal}
                        onChange={(e) => setEditNameVal(e.target.value)}
                        className="bg-white/5 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#39FF14]/30 flex-1"
                        placeholder="Enter new name..."
                      />
                      <button
                        onClick={() => handleRenameMedia(previewItem.id, editNameVal)}
                        disabled={savingName}
                        className="px-3 py-1.5 bg-[#39FF14] text-[#0A0A0A] text-xs font-bold rounded-lg hover:bg-white transition-all disabled:opacity-50"
                      >
                        {savingName ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingNameId(null)}
                        className="px-3 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 text-xs text-gray-300 rounded-lg hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-orbitron font-bold text-sm tracking-wide break-all">{previewItem.name}</h3>
                      <button
                        onClick={() => {
                          setEditingNameId(previewItem.id);
                          setEditNameVal(previewItem.name);
                        }}
                        className="text-[10px] text-[#39FF14] hover:underline cursor-pointer shrink-0"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                  <div className="flex gap-4 text-xs text-gray-500 mt-1">
                    <span>Size: {formatSize(previewItem.size)}</span>
                    <span>Uploaded: {new Date(previewItem.uploadedAt).toLocaleString()}</span>
                    <span>By: {previewItem.uploadedBy || "Admin"}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleDownload(previewItem)}
                    className="btn-primary text-xs flex items-center justify-center gap-2 shrink-0 py-2.5 px-4"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button 
                    onClick={() => handleCopyLink(previewItem)}
                    className="bg-white/5 backdrop-blur-md text-xs text-white hover:border-[#39FF14]/30 hover:bg-[#39FF14]/5 flex items-center justify-center gap-2 shrink-0 py-2.5 px-4 rounded-lg border border-white/10"
                  >
                    <Copy className="w-4 h-4" /> Copy Direct URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


